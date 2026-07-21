"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { apiRequest, ApiError } from "@/lib/api";

const AuthContext = createContext(null);

function normalizeUnknownAuthError(error) {
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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [authError, setAuthError] = useState(null);

  const applyAuthState = useCallback((state) => {
    setUser(state.user);
    setIsAuthenticated(state.isAuthenticated);
    setIsAuthorized(state.isAuthorized);
    setAuthError(state.authError);
  }, []);

  const refreshAuthState = useCallback(async () => {
    setIsLoadingAuth(true);

    try {
      const state = await apiRequest("/auth/state");
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
    async (payload) => {
      const state = await apiRequest("/auth/login", {
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
    async (payload) => {
      const state = await apiRequest("/auth/register", {
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
      await apiRequest("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Keep local auth consistent even if the server request fails.
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setIsAuthorized(false);
      setAuthError(null);
      setAuthChecked(true);
    }
  }, []);

  const value = {
    user,
    isAuthenticated,
    isAuthorized,
    isLoadingAuth,
    isLoadingPublicSettings: false,
    authChecked,
    authError,
    appPublicSettings: null,
    refreshAuthState,
    checkUserAuth: refreshAuthState,
    checkAppState: refreshAuthState,
    login,
    register,
    logout,
    navigateToLogin: () => {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
