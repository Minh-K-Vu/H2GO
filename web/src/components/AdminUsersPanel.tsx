"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheckIcon, UserIcon, UsersIcon } from "@/components/icons";
import { cn } from "@/lib/cn";
import type { AppRole, AuthUser } from "@/lib/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";

type AdminUsersPanelProps = {
  currentUserId: string;
};

const roles: AppRole[] = ["admin", "operator", "viewer"];

export default function AdminUsersPanel({
  currentUserId,
}: AdminUsersPanelProps) {
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AuthUser[]>("/auth/users");
      setUsers(response);
    } catch (loadError) {
      if (loadError instanceof ApiError) {
        setError(loadError.message);
      } else {
        setError("Failed to load access management data.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  async function updateUser(
    userId: string,
    patch: Partial<Pick<AuthUser, "role" | "isRegistered" | "isActive">>,
  ) {
    setSavingUserId(userId);
    setError(null);

    try {
      const response = await apiRequest<{ user: AuthUser }>(`/auth/users/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({
          role: patch.role,
          isRegistered: patch.isRegistered,
          isActive: patch.isActive,
        }),
      });

      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === userId ? response.user : user)),
      );
    } catch (updateError) {
      if (updateError instanceof ApiError) {
        setError(updateError.message);
      } else {
        setError("Failed to update this user.");
      }
    } finally {
      setSavingUserId(null);
    }
  }

  const pendingUsers = users.filter((user) => !user.isRegistered && user.isActive);

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Access Management</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Approve new accounts and assign dashboard roles.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadUsers()}
          className="rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Refresh
        </button>
      </div>

      {pendingUsers.length > 0 ? (
        <div className="mb-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          {pendingUsers.length} account{pendingUsers.length > 1 ? "s" : ""} waiting
          for approval.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-muted/60"
            />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="rounded-2xl bg-muted/40 p-6 text-center text-sm text-muted-foreground">
          No accounts found yet.
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => {
            const isSaving = savingUserId === user.id;
            const isCurrentUser = user.id === currentUserId;

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-border bg-background/60 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {user.name}
                      </span>
                      {isCurrentUser ? (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          You
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-medium",
                          user.isRegistered
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-amber-500/10 text-amber-700",
                        )}
                      >
                        {user.isRegistered ? "Registered" : "Pending"}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 font-medium",
                          user.isActive
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground",
                        )}
                      >
                        {user.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:min-w-[18rem]">
                    <label className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Role
                    </label>
                    <select
                      value={user.role}
                      onChange={(event) =>
                        void updateUser(user.id, {
                          role: event.target.value as AppRole,
                        })
                      }
                      disabled={isSaving}
                      className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
                    >
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          void updateUser(user.id, {
                            isRegistered: !user.isRegistered,
                          })
                        }
                        disabled={isSaving}
                        className={cn(
                          "rounded-xl px-3 py-2 text-sm font-medium transition",
                          user.isRegistered
                            ? "border border-border bg-card text-foreground hover:bg-muted"
                            : "bg-emerald-500 text-white hover:bg-emerald-600",
                        )}
                      >
                        {user.isRegistered ? "Revoke Access" : "Approve Access"}
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          void updateUser(user.id, {
                            isActive: !user.isActive,
                          })
                        }
                        disabled={isSaving || isCurrentUser}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {user.isActive ? "Disable" : "Reactivate"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Admins</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {users.filter((user) => user.role === "admin" && user.isActive).length}
          </p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
            <p className="text-sm font-semibold text-foreground">Registered</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {users.filter((user) => user.isRegistered && user.isActive).length}
          </p>
        </div>
        <div className="rounded-2xl bg-muted/40 p-4">
          <div className="mb-2 flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-amber-500" />
            <p className="text-sm font-semibold text-foreground">Pending</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{pendingUsers.length}</p>
        </div>
      </div>
    </section>
  );
}
