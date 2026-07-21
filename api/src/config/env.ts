import dotenv from "dotenv";
import { SESSION_DEFAULT_TTL_HOURS } from "../auth/constants";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing from .env");
}

export const env = {
  port: Number(process.env.PORT) || 4000,
  databaseUrl: process.env.DATABASE_URL,
  webOrigin: process.env.WEB_ORIGIN || "http://localhost:3000",
  webOrigins: [
    process.env.WEB_ORIGIN || "http://localhost:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
  ],
  authSessionTtlHours:
    Number(process.env.AUTH_SESSION_TTL_HOURS) || SESSION_DEFAULT_TTL_HOURS,
  secureCookies: process.env.NODE_ENV === "production",
};
