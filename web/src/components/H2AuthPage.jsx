import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AlertTriangle, ArrowRight, Droplets, Lock, Mail, UserPlus } from "lucide-react";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function H2AuthPage({ initialMode = "login" }) {
  const router = useRouter();
  const { login, register, isAuthorized } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (isAuthorized) {
      void router.replace("/AppDashboard");
    }
  }, [isAuthorized, router]);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const state =
        mode === "login"
          ? await login({ email, password })
          : await register({ name, email, password });

      if (state.isAuthorized) {
        await router.replace("/AppDashboard");
        return;
      }

      setError(
        state.authError?.message ??
          "Your account needs administrator approval before the dashboard unlocks.",
      );
    } catch (submitError) {
      if (submitError instanceof ApiError) {
        setError(submitError.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isLogin = mode === "login";

  return (
    <section className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-deep px-6 py-16 text-white">
      <div className="water-radial absolute inset-0 opacity-80" />
      <div className="starfield absolute inset-0 opacity-60" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-water/10 blur-3xl" />

      <div className="relative mx-auto grid min-h-[calc(100vh-11rem)] max-w-6xl items-center gap-10 lg:grid-cols-[1fr_440px]">
        <div className="max-w-2xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-water/20 bg-water/10 px-4 py-2 font-mono text-[10px] uppercase tracking-architectural text-water">
            <Droplets className="h-4 w-4" />
            H2 Water Intelligence
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.02] glow-text sm:text-6xl lg:text-7xl">
            Control every drop from one secure dashboard.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-white/72">
            Sign in to monitor live flow, control valves, manage devices, and respond to alerts before water becomes damage.
          </p>
          <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
            {[
              ["Live flow", "24/7"],
              ["Valve control", "Remote"],
              ["Leak alerts", "Instant"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-panel/70 p-4 backdrop-blur">
                <div className="font-display text-xl font-semibold text-water">{value}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.16em] text-white/50">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-water/20 bg-panel/85 p-6 shadow-2xl shadow-black/35 backdrop-blur-xl sm:p-8">
          <div className="mb-7">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-water/10 text-water glow-box">
              {isLogin ? <Lock className="h-5 w-5" /> : <UserPlus className="h-5 w-5" />}
            </div>
            <h2 className="font-display text-3xl font-semibold">
              {isLogin ? "Sign in" : "Request access"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/65">
              {isLogin
                ? "Enter your approved H2 account details to open the device dashboard."
                : "Create an account. New users may need admin approval before dashboard access is enabled."}
            </p>
          </div>

          <div className="mb-6 flex rounded-full border border-white/10 bg-deep/60 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                isLogin ? "bg-water text-deep" : "text-white/60 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
              }}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors ${
                !isLogin ? "bg-water text-deep" : "text-white/60 hover:text-white"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin ? (
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-white/80">Full name</span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-deep/80 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-water focus:ring-4 focus:ring-water/10"
                  placeholder="Jane Doe"
                  autoComplete="name"
                  required
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/80">Email address</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-water/70" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-deep/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-water focus:ring-4 focus:ring-water/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </div>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/80">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-water/70" />
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-deep/80 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-water focus:ring-4 focus:ring-water/10"
                  placeholder="At least 8 characters"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  minLength={8}
                  required
                />
              </div>
            </label>

            {error ? (
              <div className="flex items-start gap-2 rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm leading-6 text-amber-100">
                <AlertTriangle className="mt-1 h-4 w-4 flex-shrink-0 text-amber-300" />
                <span>{error}</span>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-water font-display text-sm font-semibold text-deep transition hover:scale-[1.01] disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? "Working..." : isLogin ? "Open Dashboard" : "Create Account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-white/55">
            {isLogin ? (
              <>
                Need access?{" "}
                <button type="button" onClick={() => setMode("register")} className="font-semibold text-water hover:underline">
                  Request an account
                </button>
              </>
            ) : (
              <>
                Already approved?{" "}
                <button type="button" onClick={() => setMode("login")} className="font-semibold text-water hover:underline">
                  Sign in
                </button>
              </>
            )}
          </div>

          <div className="mt-5 text-center">
            <Link href="/" className="text-xs font-medium uppercase tracking-[0.16em] text-white/40 hover:text-water">
              Back to H2
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
