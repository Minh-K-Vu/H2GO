import { getSessionToken } from "@/auth/session";

const API_BASE_URL = "https://h2go-api.onrender.com";

export async function apiRequest(path: string, options: RequestInit = {}) {
  const token = await getSessionToken();

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("x-h2go-session", token);
  }
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
