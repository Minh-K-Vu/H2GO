import * as SecureStore from "expo-secure-store";

const SESSION_TOKEN_KEY = "h2go_session_token";

export async function saveSessionToken(token: string) {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function getSessionToken() {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function clearSessionToken() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}
