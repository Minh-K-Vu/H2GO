import { createHash, randomBytes } from "crypto";
import { AUTH_COOKIE_NAME } from "./constants";

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function readCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) {
    return null;
  }

  const cookies = cookieHeader.split(";");

  for (const cookie of cookies) {
    const [rawName, ...rawValue] = cookie.trim().split("=");

    if (rawName === name) {
      return decodeURIComponent(rawValue.join("="));
    }
  }

  return null;
}

export function readSessionToken(cookieHeader: string | undefined) {
  return readCookieValue(cookieHeader, AUTH_COOKIE_NAME);
}

export function buildSessionCookie(
  token: string,
  maxAgeSeconds: number,
  secureCookies: boolean,
) {
  const attributes = [
    `${AUTH_COOKIE_NAME}=${encodeURIComponent(token)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secureCookies) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export function clearSessionCookie(secureCookies: boolean) {
  const attributes = [
    `${AUTH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
  ];

  if (secureCookies) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}
