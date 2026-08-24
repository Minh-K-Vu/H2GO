import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react";

import { apiRequest } from "../api/client";
import {
  clearSessionToken,
  getSessionToken,
  saveSessionToken,
} from "./session";

// This describes the information our authentication manager provides.
type AuthContextValue = {
  sessionToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// The context allows any screen to access authentication information.
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  // null means that the user is not signed in.
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // While true, the app is still checking SecureStore and the backend.
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSession() {
      try {
        // Look for a token previously saved on the phone.
        const savedToken = await getSessionToken();

        if (!savedToken) {
          setSessionToken(null);
          return;
        }

        // Ask the backend whether the saved token is still valid.
        const authState = await apiRequest("/auth/state");

        if (authState.isAuthenticated) {
          setSessionToken(savedToken);
        } else {
          await clearSessionToken();
          setSessionToken(null);
        }
      } catch {
        // An invalid or unusable session should not unlock the app.
        await clearSessionToken();
        setSessionToken(null);
      } finally {
        // The initial authentication check has finished.
        setIsLoading(false);
      }
    }

    loadSession();
  }, []);

  async function signIn(token: string) {
    // Save the token securely and update the whole app immediately.
    await saveSessionToken(token);
    setSessionToken(token);
  }

  async function signOut() {
    try {
      // Ask the backend to destroy its copy of the session.
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } finally {
      // Always remove the token from this phone.
      await clearSessionToken();
      setSessionToken(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        sessionToken,
        isLoading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Screens will call useAuth() instead of managing authentication themselves.
export function useAuth() {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return auth;
}
