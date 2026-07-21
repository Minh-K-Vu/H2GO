import type { APP_ROLES } from "./constants";

export type AppRole = (typeof APP_ROLES)[number];

export type AuthErrorType =
  | "auth_required"
  | "user_not_registered"
  | "access_revoked"
  | "insufficient_permissions";

export type AuthUserRecord = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  is_registered: boolean;
  is_active: boolean;
  created_at: string;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  isRegistered: boolean;
  isActive: boolean;
  createdAt: string;
};

export type AuthErrorPayload = {
  type: AuthErrorType;
  message: string;
};

export type AuthStateResponse = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAuthorized: boolean;
  authError: AuthErrorPayload | null;
};

export function toAuthUser(user: AuthUserRecord): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isRegistered: user.is_registered,
    isActive: user.is_active,
    createdAt: user.created_at,
  };
}
