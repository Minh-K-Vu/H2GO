import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Check,
  Droplet,
  Eye,
  EyeOff,
  Lock,
  Mail,
  UserRound,
} from "lucide-react";
import ProductHeroScene from "@/components/ProductHeroScene";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

const visualStages = [
  {
    label: "Monitoring",
    title: "Water moving normally",
    detail: "Live flow 6.2 L/min",
    accent: "#087fbd",
  },
  {
    label: "Detected",
    title: "Unusual flow detected",
    detail: "Continuous use for 18 minutes",
    accent: "#b75b13",
  },
  {
    label: "Protected",
    title: "Main valve closed",
    detail: "Flow reduced to 0.0 L/min",
    accent: "#147b52",
  },
];

function ProductSceneFallback({ phase, reduceMotion }) {
  const accent = visualStages[phase].accent;
  const isClosed = phase === 2;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden="true">
      <div className="absolute right-[-54px] top-[42%] h-[190px] w-[590px] -translate-y-1/2">
        <div className="absolute inset-x-0 top-1/2 h-7 -translate-y-1/2 border-y border-black/20 bg-[#9b6748] shadow-[0_8px_18px_rgba(75,48,34,0.18)]" />

        {[118, 426].map((left) => (
          <div key={left} className="absolute top-1/2 -translate-y-1/2" style={{ left }}>
            <span className="absolute left-0 top-1/2 h-14 w-10 -translate-y-1/2 border border-black/25 bg-[#b39059]" />
            <span className="absolute left-8 top-1/2 h-16 w-8 -translate-y-1/2 border border-black/25 bg-[#b7c0c0]" />
          </div>
        ))}

        {Array.from({ length: 7 }, (_, index) => (
          <motion.span
            key={index}
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full"
            style={{ left: 12 + index * 44, backgroundColor: accent }}
            animate={
              reduceMotion || isClosed
                ? { opacity: isClosed ? 0.18 : 0.85 }
                : { x: [0, 250], opacity: [0, 0.9, 0] }
            }
            transition={{ duration: phase === 1 ? 1.2 : 2.2, repeat: Infinity, delay: index * 0.13, ease: "linear" }}
          />
        ))}

        <motion.div
          className="absolute left-[198px] top-1/2 h-[138px] w-[226px] -translate-y-1/2 rounded-[8px] border border-black/15 bg-[#f8faf8] shadow-[0_22px_45px_rgba(28,47,53,0.2)]"
          animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
          transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="absolute inset-[9px] flex flex-col items-center justify-center rounded-[6px] border border-black/10 bg-white">
            <motion.span
              className="absolute top-4 h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: accent }}
              animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 1.5, 1] }}
              transition={{ duration: phase === 1 ? 0.8 : 1.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <Droplet className="mt-2 h-9 w-9" style={{ color: accent }} />
            <span className="mt-2 text-xs font-bold text-[#10181c]">H2GO</span>
          </div>

          <div className="absolute left-1/2 top-[-55px] h-14 w-[88px] -translate-x-1/2">
            <span className="absolute inset-x-2 bottom-0 h-4 rounded-[3px] border border-black/20 bg-[#8c989b]" />
            <span className="absolute left-1/2 bottom-3 h-9 w-12 -translate-x-1/2 rounded-t-[5px] border border-black/20 bg-[#b8c0c0]" />
            <motion.span
              className="absolute left-1/2 bottom-7 h-1.5 w-9 origin-left rounded-full bg-[#4c585c]"
              animate={{ rotate: isClosed ? 90 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function ProductAccessVisual() {
  const reduceMotion = usePrefersReducedMotion();
  const [phase, setPhase] = useState(0);
  const [sceneReady, setSceneReady] = useState(false);
  const stage = visualStages[phase];

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setPhase((current) => (current + 1) % visualStages.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [reduceMotion]);

  return (
    <div
      data-auth-product-visual
      className="relative hidden min-h-[660px] overflow-hidden rounded-[8px] border border-black/10 bg-[#e8edeb] xl:block"
    >
      <ProductHeroScene phase={phase} paused={reduceMotion} onReady={() => setSceneReady(true)} />
      {sceneReady ? null : <ProductSceneFallback phase={phase} reduceMotion={reduceMotion} />}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between border-b border-black/10 px-7 py-5">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#10181c]">H2GO</span>
          <span className="h-4 w-px bg-black/20" />
          <span className="text-xs font-medium text-[#5a686d]">Smart water monitor</span>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold text-[#147b52]">
          <motion.span
            className="h-2 w-2 rounded-full bg-[#22a86f]"
            animate={reduceMotion ? undefined : { opacity: [1, 0.4, 1], scale: [1, 1.45, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          Live
        </span>
      </div>

      <div className="pointer-events-none absolute left-7 top-24 z-10 max-w-[270px]">
        <p className="text-xs font-semibold text-[#087fbd]">Whole-home water intelligence</p>
        <h2 className="mt-3 text-4xl font-semibold leading-[1.06] text-[#10181c]">
          One line. A clearer view of home.
        </h2>
      </div>

      <div className="absolute inset-x-7 bottom-7 z-10 overflow-hidden rounded-[6px] border border-black/10 bg-white/90 shadow-[0_18px_48px_rgba(13,31,38,0.12)] backdrop-blur-md">
        <div className="flex min-h-[102px] items-center justify-between gap-5 px-6 py-5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={stage.label}
              initial={reduceMotion ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <p className="text-xs font-semibold" style={{ color: stage.accent }}>
                {stage.label}
              </p>
              <p className="mt-1 text-lg font-semibold text-[#10181c]">{stage.title}</p>
              <p className="mt-1 text-sm text-[#5a686d]">{stage.detail}</p>
            </motion.div>
          </AnimatePresence>
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: stage.accent }}
            aria-hidden="true"
          >
            {phase === 2 ? <Check className="h-5 w-5" /> : <span className="h-2 w-2 rounded-full bg-white" />}
          </span>
        </div>
        <div className="grid grid-cols-3 gap-px bg-black/10">
          {visualStages.map((item, index) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPhase(index)}
              className="relative h-10 bg-white px-3 text-left text-[11px] font-semibold text-[#68757a] transition-colors hover:text-[#10181c]"
              aria-label={`Show ${item.label.toLowerCase()} state`}
              aria-pressed={phase === index}
            >
              {item.label}
              {phase === index ? (
                <motion.span
                  layoutId="auth-stage-indicator"
                  className="absolute inset-x-0 bottom-0 h-0.5"
                  style={{ backgroundColor: stage.accent }}
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function H2AuthPage({ initialMode = "login" }) {
  const router = useRouter();
  const { login, register, isAuthorized } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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

  const isLogin = mode === "login";

  function selectMode(nextMode) {
    setMode(nextMode);
    setError(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const state = isLogin
        ? await login({ email, password })
        : await register({ name, email, password });

      if (state.isAuthorized) {
        await router.replace("/AppDashboard");
        return;
      }

      const fallbackMessage =
        "Your account needs administrator approval before the dashboard unlocks.";
      const registerMessage = !isLogin ? state.message : null;

      setError(registerMessage || state.authError?.message || fallbackMessage);
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

  return (
    <section className="h2-marketing min-h-[calc(100vh-3.5rem)] bg-[#f2f5f5] px-5 py-16 text-[#10181c] sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-[1320px] gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(420px,0.75fr)] xl:items-stretch">
        <ProductAccessVisual />

        <div className="mx-auto flex w-full max-w-[560px] flex-col justify-center rounded-[8px] border border-black/10 bg-white px-6 py-9 shadow-[0_18px_55px_rgba(13,31,38,0.08)] sm:px-10 sm:py-11 xl:max-w-none">
          <div className="mx-auto w-full max-w-[410px]">
            <p className="text-xs font-semibold text-[#087fbd]">H2 secure access</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.05] sm:text-[44px]">
              {isLogin ? "Welcome back." : "Request access."}
            </h1>
            <p className="mt-4 text-[15px] leading-6 text-[#5a686d]">
              {isLogin
                ? "Sign in with your approved H2 account to open the water dashboard."
                : "Create your H2 account. New accounts may need administrator approval before dashboard access is enabled."}
            </p>

            <div
              className="mt-7 grid grid-cols-2 rounded-[5px] border border-black/10 bg-[#edf1f0] p-1"
              role="tablist"
              aria-label="Account access"
            >
              <button
                type="button"
                role="tab"
                aria-selected={isLogin}
                onClick={() => selectMode("login")}
                className={`h-10 rounded-[3px] text-sm font-semibold transition-colors ${
                  isLogin
                    ? "bg-white text-[#10181c] shadow-[0_1px_5px_rgba(13,31,38,0.12)]"
                    : "text-[#657277] hover:text-[#10181c]"
                }`}
              >
                Sign in
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={!isLogin}
                onClick={() => selectMode("register")}
                className={`h-10 rounded-[3px] text-sm font-semibold transition-colors ${
                  !isLogin
                    ? "bg-white text-[#10181c] shadow-[0_1px_5px_rgba(13,31,38,0.12)]"
                    : "text-[#657277] hover:text-[#10181c]"
                }`}
              >
                Request access
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              {!isLogin ? (
                <div>
                  <label htmlFor="auth-name" className="mb-2 block text-sm font-semibold text-[#263338]">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78858a]" />
                    <input
                      id="auth-name"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      className="h-[52px] w-full rounded-[4px] border border-black/15 bg-[#fafbfb] pl-11 pr-4 text-[15px] text-[#10181c] outline-none transition placeholder:text-[#8b969a] hover:border-black/30 focus:border-[#087fbd] focus:ring-4 focus:ring-[#087fbd]/10"
                      placeholder="Jane Doe"
                      autoComplete="name"
                      required
                    />
                  </div>
                </div>
              ) : null}

              <div>
                <label htmlFor="auth-email" className="mb-2 block text-sm font-semibold text-[#263338]">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78858a]" />
                  <input
                    id="auth-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="h-[52px] w-full rounded-[4px] border border-black/15 bg-[#fafbfb] pl-11 pr-4 text-[15px] text-[#10181c] outline-none transition placeholder:text-[#8b969a] hover:border-black/30 focus:border-[#087fbd] focus:ring-4 focus:ring-[#087fbd]/10"
                    placeholder="you@example.com"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="auth-password" className="mb-2 block text-sm font-semibold text-[#263338]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#78858a]" />
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-[52px] w-full rounded-[4px] border border-black/15 bg-[#fafbfb] pl-11 pr-12 text-[15px] text-[#10181c] outline-none transition placeholder:text-[#8b969a] hover:border-black/30 focus:border-[#087fbd] focus:ring-4 focus:ring-[#087fbd]/10"
                    placeholder="At least 8 characters"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    minLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-1 top-1 flex h-[44px] w-10 items-center justify-center rounded-[3px] text-[#78858a] transition-colors hover:bg-black/5 hover:text-[#10181c]"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error ? (
                <div
                  className="flex items-start gap-3 rounded-[4px] border border-[#d59b61]/35 bg-[#fff7ee] px-4 py-3 text-sm leading-5 text-[#71451f]"
                  role="alert"
                >
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#b75b13]" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="group flex h-[52px] w-full items-center justify-center gap-2 rounded-[4px] bg-[#10181c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2a3539] disabled:cursor-wait disabled:opacity-60"
              >
                {submitting ? "Working..." : isLogin ? "Open dashboard" : "Create account"}
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-black/10 pt-5 text-sm text-[#657277] sm:flex-row">
              <p>{isLogin ? "New to H2?" : "Already approved?"}</p>
              <button
                type="button"
                onClick={() => selectMode(isLogin ? "register" : "login")}
                className="font-semibold text-[#087fbd] hover:text-[#066c9f]"
              >
                {isLogin ? "Request an account" : "Sign in"}
              </button>
            </div>

            <Link
              href="/"
              className="mt-7 inline-flex items-center text-xs font-semibold text-[#657277] transition-colors hover:text-[#10181c]"
            >
              Back to H2
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
