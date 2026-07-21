import { randomUUID } from "crypto";
import { Router } from "express";
import { z } from "zod";
import { APP_ROLES } from "../auth/constants";
import { hashPassword, verifyPassword } from "../auth/password";
import {
  buildSessionCookie,
  clearSessionCookie,
  createSessionToken,
  hashSessionToken,
  readSessionToken,
} from "../auth/session";
import type { AppRole, AuthStateResponse, AuthUserRecord } from "../auth/types";
import { toAuthUser } from "../auth/types";
import { env } from "../config/env";
import { pool } from "../db/pool";
import {
  getAuthStateFromRequest,
  requireAuthenticatedSession,
  requireRegisteredUser,
  requireRole,
} from "../middleware/auth";

const authRouter = Router();

type UserRow = AuthUserRecord & {
  password_hash: string;
};

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(80).optional(),
    role: z.enum(APP_ROLES).optional(),
    isRegistered: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

async function createSessionForUser(userId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const sessionId = randomUUID();
  const maxAgeSeconds = env.authSessionTtlHours * 60 * 60;
  const expiresAt = new Date(Date.now() + maxAgeSeconds * 1000);

  await pool.query(
    `INSERT INTO auth_sessions (id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [sessionId, userId, tokenHash, expiresAt],
  );

  return {
    token,
    maxAgeSeconds,
  };
}

async function fetchUserByEmail(email: string) {
  const result = await pool.query<UserRow>(
    `SELECT
       id,
       email,
       password_hash,
       name,
       role,
       is_registered,
       is_active,
       created_at
     FROM app_users
     WHERE email = $1
     LIMIT 1`,
    [email],
  );

  return result.rows[0] ?? null;
}

function buildAuthResponse(user: AuthUserRecord): AuthStateResponse {
  const authUser = toAuthUser(user);

  if (!authUser.isActive) {
    return {
      user: authUser,
      isAuthenticated: true,
      isAuthorized: false,
      authError: {
        type: "access_revoked",
        message: "This account has been deactivated.",
      },
    };
  }

  if (!authUser.isRegistered) {
    return {
      user: authUser,
      isAuthenticated: true,
      isAuthorized: false,
      authError: {
        type: "user_not_registered",
        message: "You are not registered to use this application.",
      },
    };
  }

  return {
    user: authUser,
    isAuthenticated: true,
    isAuthorized: true,
    authError: null,
  };
}

async function getActiveAdminCount(excludingUserId?: string) {
  const result = await pool.query<{ count: string }>(
    `SELECT COUNT(*)::text AS count
     FROM app_users
     WHERE role = 'admin'
       AND is_registered = true
       AND is_active = true
       ${excludingUserId ? "AND id <> $1" : ""}`,
    excludingUserId ? [excludingUserId] : [],
  );

  return Number(result.rows[0]?.count ?? "0");
}

authRouter.get("/auth/state", (req, res) => {
  return res.status(200).json(getAuthStateFromRequest(req));
});

authRouter.get("/auth/me", requireRegisteredUser, (req, res) => {
  return res.status(200).json({
    user: req.auth?.user ?? null,
  });
});

authRouter.post("/auth/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid login payload.",
      details: parsed.error.format(),
    });
  }

  try {
    const user = await fetchUserByEmail(parsed.data.email);

    if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
      return res.status(401).json({
        error: "Invalid email or password.",
      });
    }

    const session = await createSessionForUser(user.id);

    res.append(
      "Set-Cookie",
      buildSessionCookie(session.token, session.maxAgeSeconds, env.secureCookies),
    );

    return res.status(200).json({
      ...buildAuthResponse(user),
      sessionToken: session.token,
    });
  } catch (error) {
    console.error("Failed to log in", error);

    return res.status(500).json({
      error: "Failed to log in.",
    });
  }
});

authRouter.post("/auth/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid registration payload.",
      details: parsed.error.format(),
    });
  }

  try {
    const existingUser = await fetchUserByEmail(parsed.data.email);

    if (existingUser) {
      return res.status(409).json({
        error: "An account with that email already exists.",
      });
    }

    const countResult = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM app_users`,
    );
    const userCount = Number(countResult.rows[0]?.count ?? "0");
    const isFirstUser = userCount === 0;
    const userId = randomUUID();
    const passwordHash = hashPassword(parsed.data.password);
    const role: AppRole = isFirstUser ? "admin" : "viewer";
    const isRegistered = isFirstUser;

    const result = await pool.query<AuthUserRecord>(
      `INSERT INTO app_users (
         id,
         email,
         password_hash,
         name,
         role,
         is_registered,
         is_active
       )
       VALUES ($1, $2, $3, $4, $5, $6, true)
       RETURNING
         id,
         email,
         name,
         role,
         is_registered,
         is_active,
         created_at`,
      [
        userId,
        parsed.data.email,
        passwordHash,
        parsed.data.name,
        role,
        isRegistered,
      ],
    );

    const user = result.rows[0];
    const session = await createSessionForUser(user.id);

    res.append(
      "Set-Cookie",
      buildSessionCookie(session.token, session.maxAgeSeconds, env.secureCookies),
    );

    return res.status(201).json({
      ...buildAuthResponse(user),
      sessionToken: session.token,
      message: isFirstUser
        ? "Admin account created."
        : "Account created. Awaiting administrator approval.",
    });
  } catch (error) {
    console.error("Failed to register user", error);

    return res.status(500).json({
      error: "Failed to register account.",
    });
  }
});

authRouter.post("/auth/logout", async (req, res) => {
  try {
    const token = readSessionToken(req.headers.cookie);

    if (token) {
      await pool.query(
        `DELETE FROM auth_sessions
         WHERE token_hash = $1`,
        [hashSessionToken(token)],
      );
    }

    res.append("Set-Cookie", clearSessionCookie(env.secureCookies));

    return res.status(200).json({
      ok: true,
    });
  } catch (error) {
    console.error("Failed to log out", error);

    return res.status(500).json({
      error: "Failed to log out.",
    });
  }
});

authRouter.get(
  "/auth/users",
  requireAuthenticatedSession,
  requireRole(["admin"]),
  async (_req, res) => {
    try {
      const result = await pool.query<AuthUserRecord>(
        `SELECT
           id,
           email,
           name,
           role,
           is_registered,
           is_active,
           created_at
         FROM app_users
         ORDER BY created_at ASC`,
      );

      return res.status(200).json(
        result.rows.map((user) => ({
          ...toAuthUser(user),
        })),
      );
    } catch (error) {
      console.error("Failed to fetch users", error);

      return res.status(500).json({
        error: "Failed to fetch users.",
      });
    }
  },
);

authRouter.patch(
  "/auth/users/:id",
  requireAuthenticatedSession,
  requireRole(["admin"]),
  async (req, res) => {
    const parsed = updateUserSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid user update payload.",
        details: parsed.error.format(),
      });
    }

    const targetUserId = req.params.id;

    try {
      const targetResult = await pool.query<AuthUserRecord>(
        `SELECT
           id,
           email,
           name,
           role,
           is_registered,
           is_active,
           created_at
         FROM app_users
         WHERE id = $1
         LIMIT 1`,
        [targetUserId],
      );

      if ((targetResult.rowCount ?? 0) === 0) {
        return res.status(404).json({
          error: "User not found.",
        });
      }

      const targetUser = targetResult.rows[0];
      const nextRole = parsed.data.role ?? targetUser.role;
      const nextIsRegistered =
        parsed.data.isRegistered ?? targetUser.is_registered;
      const nextIsActive = parsed.data.isActive ?? targetUser.is_active;
      const nextName = parsed.data.name ?? targetUser.name;
      const targetStaysAdmin =
        nextRole === "admin" && nextIsRegistered && nextIsActive;

      if (
        targetUser.id === req.auth?.user?.id &&
        nextIsActive === false
      ) {
        return res.status(400).json({
          error: "You cannot deactivate your own account.",
        });
      }

      if (targetUser.role === "admin" && !targetStaysAdmin) {
        const otherAdminCount = await getActiveAdminCount(targetUser.id);

        if (otherAdminCount === 0) {
          return res.status(400).json({
            error: "At least one active registered admin must remain.",
          });
        }
      }

      const result = await pool.query<AuthUserRecord>(
        `UPDATE app_users
         SET
           name = $2,
           role = $3,
           is_registered = $4,
           is_active = $5,
           updated_at = now()
         WHERE id = $1
         RETURNING
           id,
           email,
           name,
           role,
           is_registered,
           is_active,
           created_at`,
        [targetUserId, nextName, nextRole, nextIsRegistered, nextIsActive],
      );

      if (!nextIsActive) {
        await pool.query(
          `DELETE FROM auth_sessions
           WHERE user_id = $1`,
          [targetUserId],
        );
      }

      return res.status(200).json({
        user: toAuthUser(result.rows[0]),
      });
    } catch (error) {
      console.error("Failed to update user", error);

      return res.status(500).json({
        error: "Failed to update user.",
      });
    }
  },
);

export default authRouter;
