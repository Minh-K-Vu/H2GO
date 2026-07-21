import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool";
import { clearSessionCookie, hashSessionToken, readSessionToken } from "../auth/session";
import type {
  AppRole,
  AuthErrorType,
  AuthStateResponse,
  AuthUser,
  AuthUserRecord,
} from "../auth/types";
import { toAuthUser } from "../auth/types";
import { env } from "../config/env";

type SessionLookupRow = AuthUserRecord & {
  session_id: string;
};

function buildAuthState(user?: AuthUser): AuthStateResponse {
  if (!user) {
    return {
      user: null,
      isAuthenticated: false,
      isAuthorized: false,
      authError: null,
    };
  }

  if (!user.isActive) {
    return {
      user,
      isAuthenticated: true,
      isAuthorized: false,
      authError: {
        type: "access_revoked",
        message: "This account has been deactivated.",
      },
    };
  }

  if (!user.isRegistered) {
    return {
      user,
      isAuthenticated: true,
      isAuthorized: false,
      authError: {
        type: "user_not_registered",
        message: "You are not registered to use this application.",
      },
    };
  }

  return {
    user,
    isAuthenticated: true,
    isAuthorized: true,
    authError: null,
  };
}

export function getAuthStateFromRequest(req: Request) {
  return buildAuthState(req.auth?.user);
}

function readHeaderSessionToken(req: Request) {
  const headerValue = req.header("x-h2go-session");

  if (!headerValue) {
    return null;
  }

  return headerValue.replace(/^Bearer\s+/i, "").trim() || null;
}

function sendAuthError(
  res: Response,
  status: number,
  type: AuthErrorType,
  message: string,
) {
  return res.status(status).json({
    error: message,
    extra_data: {
      reason: type,
    },
  });
}

export async function attachAuthSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const token = readSessionToken(req.headers.cookie) ?? readHeaderSessionToken(req);

    if (!token) {
      req.auth = {};
      return next();
    }

    const tokenHash = hashSessionToken(token);
    const result = await pool.query<SessionLookupRow>(
      `SELECT
         s.id AS session_id,
         u.id,
         u.email,
         u.name,
         u.role,
         u.is_registered,
         u.is_active,
         u.created_at
       FROM auth_sessions s
       INNER JOIN app_users u ON u.id = s.user_id
       WHERE s.token_hash = $1
         AND s.expires_at > now()
       LIMIT 1`,
      [tokenHash],
    );

    if ((result.rowCount ?? 0) === 0) {
      req.auth = {};
      res.append("Set-Cookie", clearSessionCookie(env.secureCookies));
      return next();
    }

    const row = result.rows[0];

    await pool.query(
      `UPDATE auth_sessions
       SET last_seen_at = now()
       WHERE id = $1`,
      [row.session_id],
    );

    req.auth = {
      sessionId: row.session_id,
      user: toAuthUser(row),
    };

    return next();
  } catch (error) {
    return next(error);
  }
}

export function requireAuthenticatedSession(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.auth?.user;

  if (!user) {
    return sendAuthError(res, 401, "auth_required", "Authentication required.");
  }

  if (!user.isActive) {
    return sendAuthError(res, 403, "access_revoked", "This account has been deactivated.");
  }

  return next();
}

export function requireRegisteredUser(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const user = req.auth?.user;

  if (!user) {
    return sendAuthError(res, 401, "auth_required", "Authentication required.");
  }

  if (!user.isActive) {
    return sendAuthError(res, 403, "access_revoked", "This account has been deactivated.");
  }

  if (!user.isRegistered) {
    return sendAuthError(
      res,
      403,
      "user_not_registered",
      "You are not registered to use this application.",
    );
  }

  return next();
}

export function requireRole(allowedRoles: AppRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.auth?.user;

    if (!user) {
      return sendAuthError(res, 401, "auth_required", "Authentication required.");
    }

    if (!user.isActive) {
      return sendAuthError(res, 403, "access_revoked", "This account has been deactivated.");
    }

    if (!user.isRegistered) {
      return sendAuthError(
        res,
        403,
        "user_not_registered",
        "You are not registered to use this application.",
      );
    }

    if (!allowedRoles.includes(user.role)) {
      return sendAuthError(
        res,
        403,
        "insufficient_permissions",
        "You do not have permission to perform this action.",
      );
    }

    return next();
  };
}
