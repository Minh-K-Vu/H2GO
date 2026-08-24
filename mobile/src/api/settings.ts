import { apiRequest } from "@/api/client";

export type Account = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "operator" | "viewer";
  isRegistered: boolean;
  isActive: boolean;
  createdAt: string;
};

export type HomeProfile = {
  userId: string;
  homeName: string;
  address: string | null;
  timezone: string;
  updatedAt: string;
};

export function fetchAccount() {
  return apiRequest<{ user: Account }>("/auth/me");
}

export function updateAccount(name: string) {
  return apiRequest<{ user: Account }>("/auth/me", {
    method: "PATCH",
    body: JSON.stringify({ name }),
  });
}

export function fetchHomeProfile() {
  return apiRequest<HomeProfile>("/settings/home");
}

export function updateHomeProfile(details: {
  homeName: string;
  address: string | null;
  timezone: string;
}) {
  return apiRequest<HomeProfile>("/settings/home", {
    method: "PATCH",
    body: JSON.stringify(details),
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return apiRequest<{ ok: boolean }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
