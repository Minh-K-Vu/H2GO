"use client";

import { AlertTriangleIcon, DropletsIcon, LockIcon } from "@/components/icons";
import type { AuthError, AuthUser } from "@/lib/AuthContext";

type AccessRestrictedPageProps = {
  user: AuthUser | null;
  authError: AuthError | null;
  onLogout: () => Promise<void>;
  onRefresh: () => Promise<void>;
};

export default function AccessRestrictedPage({
  user,
  authError,
  onLogout,
  onRefresh,
}: AccessRestrictedPageProps) {
  const title =
    authError?.type === "access_revoked"
      ? "Access Revoked"
      : "Access Restricted";

  const description =
    authError?.type === "access_revoked"
      ? "This account has been deactivated. Please contact an administrator if you think this is a mistake."
      : "You are signed in, but your account has not been registered for the protected H2GO dashboard yet.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#ffffff_0%,#f4f8fd_100%)] px-6 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-black/6 bg-white p-8 shadow-2xl shadow-black/10">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-black">
            <DropletsIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-[#1d1d1f]">H2GO</p>
            <p className="text-sm text-[#6e6e73]">Protected access</p>
          </div>
        </div>

        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangleIcon className="h-7 w-7" />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f]">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#5f6672]">{description}</p>

        <div className="mt-6 rounded-3xl bg-[#f6f8fb] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c8795]">
            Signed-in account
          </p>
          <div className="mt-3">
            <p className="text-base font-semibold text-[#1d1d1f]">
              {user?.name ?? "Unknown user"}
            </p>
            <p className="text-sm text-[#6e6e73]">{user?.email ?? "No email available"}</p>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-[#51606f]">
            <LockIcon className="h-4 w-4 text-[#0071e3]" />
            {authError?.message ??
              "An administrator must approve this account before dashboard access is granted."}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => void onRefresh()}
            className="rounded-2xl bg-[#0071e3] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0077ed]"
          >
            Check Access Again
          </button>
          <button
            type="button"
            onClick={() => void onLogout()}
            className="rounded-2xl border border-[#d7dee7] px-5 py-3 text-sm font-semibold text-[#1d1d1f] transition hover:bg-[#f6f8fb]"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
