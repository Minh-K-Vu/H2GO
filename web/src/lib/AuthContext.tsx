"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, ApiError } from "@/lib/api";

export type AppRole = "admin" | "operator" | "viewer";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isRegistered: boolean;
  isActive: boolean;
  createdAt: string;
};

export type AuthError = {
  type:
    | "auth_required"
    | "user_not_registered"
    | "access_revoked"
    | "insufficient_permissions"
    | "unknown";
  message: string;
};

type AuthStateResponse = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  authError: AuthError | null;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = LoginPayload & {
  name: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  isLoadingAuth: boolean;
  authChecked: boolean;
  authError: AuthError | null;
  refreshAuthState: () => Promise<void>;
  login: (payload: LoginPayload) => Promise<AuthStateResponse>;
  register: (payload: RegisterPayload) => Promise<AuthStateResponse>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function normalizeUnknownAuthError(error: unknown): AuthError {
  if (error instanceof ApiError) {
    return {
      type: "unknown",
      message: error.message,
    };
  }

  return {
    type: "unknown",
    message: "Unable to reach the authentication service.",
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);

  const applyAuthState = useCallback((state: AuthStateResponse) => {
    setUser(state.user);
    setIsAuthenticated(state.isAuthenticated);
    setIsAuthorized(state.isAuthorized);
    setAuthError(state.authError);
  }, []);

  const refreshAuthState = useCallback(async () => {
    setIsLoadingAuth(true);

    try {
      const state = await apiRequest<AuthStateResponse>("/auth/state");
      applyAuthState(state);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setAuthError(normalizeUnknownAuthError(error));
    } finally {
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, [applyAuthState]);

  useEffect(() => {
    void refreshAuthState();
  }, [refreshAuthState]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const state = await apiRequest<AuthStateResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      applyAuthState(state);
      setAuthChecked(true);
      return state;
    },
    [applyAuthState],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const state = await apiRequest<AuthStateResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      applyAuthState(state);
      setAuthChecked(true);
      return state;
    },
    [applyAuthState],
  );

  const logout = useCallback(async () => {
    try {
      await apiRequest<{ ok: boolean }>("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Always clear local auth state even if the server request fails.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setAuthError(null);
      setAuthChecked(true);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAuthorized,
        isLoadingAuth,
        authChecked,
        authError,
        refreshAuthState,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
