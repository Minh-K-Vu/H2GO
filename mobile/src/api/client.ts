const API_BASE_URL = "https://h2go-api.onrender.com";

export async function apiRequest(path: string) {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}
