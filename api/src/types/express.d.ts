import type { AuthUser } from "../auth/types";

declare global {
  namespace Express {
    interface Request {
      auth?: {
        user?: AuthUser;
        sessionId?: string;
      };
    }
  }
}

export {};
