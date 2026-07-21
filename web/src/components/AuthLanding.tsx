"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/router";
import {
  AlertTriangleIcon,
  ArrowRightIcon,
  BarChart3Icon,
  BellIcon,
  CheckCircle2Icon,
  ChevronDownIcon,
  DropletsIcon,
  LeafIcon,
  LockIcon,
  ShieldIcon,
  UserPlusIcon,
  WavesIcon,
  XIcon,
  ZapIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import { useAuth } from "@/lib/AuthContext";
import { ApiError } from "@/lib/api";

const features = [
  {
    icon: WavesIcon,
    title: "Real-Time Flow",
    description:
      "Monitor every liter flowing through your home live, down to the milliliter.",
  },
  {
    icon: ShieldIcon,
    title: "Leak Detection",
    description:
      "Catch anomalies the moment they appear, before damage has a chance to spread.",
  },
  {
    icon: ZapIcon,
    title: "Remote Control",
    description:
      "Open or close any valve from anywhere in the world with one tap.",
  },
  {
    icon: BarChart3Icon,
    title: "Deep Analytics",
    description:
      "Understand consumption patterns clearly and cut waste with confidence.",
  },
  {
    icon: BellIcon,
    title: "Smart Alerts",
    description:
      "Receive precision notifications only when something actually needs attention.",
  },
  {
    icon: LeafIcon,
    title: "Eco Tracker",
    description:
      "See the environmental impact of every drop saved with measurable data.",
  },
];

const specs = [
  { label: "Flow Accuracy", value: "±0.5%" },
  { label: "Response Time", value: "<1 sec" },
  { label: "Water Saved", value: "30% avg" },
  { label: "Uptime", value: "99.9%" },
];

const installationPoints = [
  "10-minute install — no plumber required",
  "Ultrasonic non-invasive measurement",
  "Battery + wired power options",
  "WPA3 Wi-Fi with offline buffering",
];

const deviceStats = [
  { label: "Flow", value: "1.4 L/min" },
  { label: "Pressure", value: "3.1 bar" },
  { label: "Temp", value: "18.2 °C" },
  { label: "Signal", value: "Excellent" },
];

type Mode = "login" | "register";

export default function AuthLanding() {
  const router = useRouter();
  const { login, register, isAuthorized } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [navBlur, setNavBlur] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    if (router.pathname === "/Login") {
      setMode("login");
      setIsAuthModalOpen(true);
      return;
    }

    if (router.pathname === "/Register") {
      setMode("register");
      setIsAuthModalOpen(true);
    }
  }, [router.pathname]);

  useEffect(() => {
    if (isAuthorized) {
      void router.replace("/AppDashboard");
    }
  }, [isAuthorized, router]);

  useEffect(() => {
    const onScroll = () => {
      setNavBlur(window.scrollY > 10);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!isAuthModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsAuthModalOpen(false);
        setError(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAuthModalOpen]);

  function openAuthModal(nextMode: Mode) {
    setMode(nextMode);
    setError(null);
    setIsAuthModalOpen(true);
  }

  function closeAuthModal() {
    if (submitting) {
      return;
    }

    setError(null);
    setIsAuthModalOpen(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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
          "Your account was created, but it needs administrator approval before the dashboard unlocks.",
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-[#1d1d1f]">
      <nav
        className={cn(
          "hidden",
          "fixed inset-x-0 top-0 z-50 items-center justify-between px-6 py-4 transition-all duration-300 md:px-8",
          navBlur
            ? "border-b border-black/5 bg-white/80 shadow-sm backdrop-blur-2xl"
            : "bg-transparent",
        )}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-black">
            <DropletsIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#1d1d1f]">
            H2GO
          </span>
        </div>

        <div className="hidden items-center gap-8 md:flex">
          {["Features", "Device", "Impact"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              className="text-sm font-medium text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
            >
              {item}
            </a>
          ))}
        </div>

        <button
          type="button"
          onClick={() => openAuthModal("login")}
          className="flex items-center gap-1.5 rounded-full bg-[#0071e3] px-5 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-[#0077ed]"
        >
          Sign In
        </button>
      </nav>

      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-white px-6 pt-20 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,113,227,0.06),transparent)]" />

        <div className="landing-hero-copy relative">
          <p className="mb-5 text-sm font-semibold uppercase tracking-wide text-[#0071e3]">
            Introducing H2GO
          </p>

          <h1 className="mx-auto mb-6 max-w-4xl text-5xl leading-[1.02] font-extrabold tracking-[-0.03em] text-[#1d1d1f] md:text-7xl lg:text-8xl">
            Water, intelligently{" "}
            <span className="bg-gradient-to-r from-[#0071e3] to-[#34aadc] bg-clip-text text-transparent">
              protected.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed font-light text-[#6e6e73] md:text-xl">
            Real-time monitoring. Instant leak detection. Remote valve control.
            <br className="hidden md:block" />
            H2GO gives you complete command over every drop.
          </p>

          <div className="mb-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-2 rounded-full bg-[#0071e3] px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-[1.02] hover:bg-[#0077ed] hover:shadow-blue-500/30"
            >
              Get Started
              <ArrowRightIcon className="h-4 w-4" />
            </button>
            <a
              href="#features"
              className="flex items-center gap-1.5 rounded-full px-8 py-3.5 text-base font-semibold text-[#0071e3] transition-all duration-200 hover:bg-blue-50"
            >
              Learn more
              <ChevronDownIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="landing-device-enter relative mx-auto w-full max-w-2xl">
          <div className="absolute bottom-0 left-1/2 h-16 w-64 -translate-x-1/2 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative mx-auto h-64 w-64 md:h-80 md:w-80">
            <div className="landing-ring absolute inset-0 rounded-full border border-blue-100" />
            <div className="landing-ring landing-ring-delay-1 absolute inset-4 rounded-full border border-blue-100" />
            <div className="landing-ring landing-ring-delay-2 absolute inset-8 rounded-full border border-blue-200/50" />

            <div className="absolute inset-12 flex flex-col items-center justify-center gap-3 rounded-3xl border border-black/8 bg-gradient-to-b from-[#f5f5f7] to-white shadow-2xl">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#34aadc] shadow-lg shadow-blue-500/30">
                <DropletsIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-center">
                <p className="text-sm font-bold tracking-tight text-[#1d1d1f]">
                  H2GO Sensor
                </p>
                <div className="mt-1 flex items-center justify-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] font-medium text-[#6e6e73]">
                    Live
                  </span>
                </div>
              </div>
            </div>

            <div className="landing-float-up absolute -left-6 top-1/3 rounded-2xl border border-black/8 bg-white px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-50">
                  <WavesIcon className="h-3 w-3 text-[#0071e3]" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-[#6e6e73]">Flow Rate</p>
                  <p className="text-xs font-bold text-[#1d1d1f]">1.4 L/min</p>
                </div>
              </div>
            </div>

            <div className="landing-float-down absolute -right-6 top-1/2 rounded-2xl border border-black/8 bg-white px-3 py-2 shadow-xl">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50">
                  <ShieldIcon className="h-3 w-3 text-emerald-500" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-[#6e6e73]">Status</p>
                  <p className="text-xs font-bold text-emerald-500">
                    All Clear
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute bottom-[-2rem] left-1/2 -translate-x-1/2">
              <div className="landing-float-soft rounded-2xl border border-black/8 bg-white px-3 py-2 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-50">
                    <BarChart3Icon className="h-3 w-3 text-amber-500" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-[#6e6e73]">Pressure</p>
                    <p className="text-xs font-bold text-[#1d1d1f]">
                      3.1 bar
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f5f5f7] px-6 py-12">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-black/5 md:grid-cols-4">
          {specs.map(({ label, value }) => (
            <div
              key={label}
              className="bg-[#f5f5f7] px-8 py-8 text-center"
            >
              <p className="mb-1 text-3xl font-extrabold tracking-tight text-[#1d1d1f]">
                {value}
              </p>
              <p className="text-xs font-medium uppercase tracking-widest text-[#6e6e73]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 bg-white px-6 py-32"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-20 text-center">
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#0071e3]">
              Features
            </p>
            <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#1d1d1f] md:text-5xl">
              Everything water. Nothing wasted.
            </h2>
            <p className="mx-auto max-w-xl text-lg font-light text-[#6e6e73]">
              Purpose-built tools that give you total control, awareness, and
              peace of mind.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="group rounded-3xl border border-transparent bg-[#f5f5f7] p-8 transition-all duration-300 hover:border-black/6 hover:bg-white hover:shadow-xl hover:shadow-black/5"
              >
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl border border-black/6 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-5 w-5 text-[#0071e3]" />
                </div>
                <h3 className="mb-2 text-lg font-bold tracking-tight text-[#1d1d1f]">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-[#6e6e73]">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="device"
        className="scroll-mt-24 bg-[#f5f5f7] px-6 py-32"
      >
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-20 md:flex-row">
          <div className="flex-1">
            <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-[#0071e3]">
              The H2GO Device
            </p>
            <h2 className="mb-6 text-4xl leading-tight font-extrabold tracking-tight text-[#1d1d1f] md:text-5xl">
              A sensor built to last. Designed to impress.
            </h2>
            <p className="mb-8 text-lg leading-relaxed font-light text-[#6e6e73]">
              The H2GO module installs inline with your water supply in minutes.
              It continuously measures flow, pressure, and temperature while
              sending encrypted readings every second.
            </p>
            <ul className="space-y-4">
              {installationPoints.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-3 text-sm font-medium text-[#1d1d1f]"
                >
                  <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#0071e3]">
                    <CheckCircle2Icon className="h-3 w-3 text-white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="w-full flex-shrink-0 md:w-80">
            <div className="relative flex flex-col items-center gap-6 rounded-[2.5rem] border border-black/6 bg-white p-10 shadow-2xl shadow-black/10">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0071e3] to-[#34aadc] shadow-xl shadow-blue-500/30">
                <DropletsIcon className="h-10 w-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold tracking-tight text-[#1d1d1f]">
                  H2GO Sensor
                </h3>
                <p className="mt-1 text-sm text-[#6e6e73]">
                  Smart Flow Monitor
                </p>
              </div>
              <div className="grid w-full grid-cols-2 gap-3">
                {deviceStats.map(({ label, value }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-[#f5f5f7] p-3 text-center"
                  >
                    <p className="mb-1 text-[10px] uppercase tracking-wider text-[#6e6e73]">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-[#1d1d1f]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-emerald-600">
                  Live Monitoring Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="impact"
        className="scroll-mt-24 bg-white px-6 py-32 text-center"
      >
        <div className="mx-auto max-w-3xl">
          <LeafIcon className="mx-auto mb-6 h-10 w-10 text-emerald-500" />
          <h2 className="mb-4 text-4xl font-extrabold tracking-tight text-[#1d1d1f] md:text-5xl">
            4.2 million liters saved.
          </h2>
          <p className="mb-12 text-lg leading-relaxed font-light text-[#6e6e73]">
            H2GO households reduce water consumption by an average of 30%. Join
            homes making a measurable impact on the planet.
          </p>
          <button
            type="button"
            onClick={() => openAuthModal("login")}
            className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-10 py-4 text-base font-semibold text-white shadow-xl shadow-black/10 transition-all duration-200 hover:scale-[1.02] hover:bg-black"
          >
            Sign In to Dashboard
            <ArrowRightIcon className="h-5 w-5" />
          </button>
          <p className="mt-5 text-sm font-light text-[#6e6e73]">
            Set up in minutes. No hardware knowledge needed.
          </p>
        </div>
      </section>

      <footer className="border-t border-black/6 px-8 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black">
              <DropletsIcon className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-[#1d1d1f]">H2GO</span>
          </div>
          <p className="text-sm text-[#6e6e73]">
            © 2026 H2GO Water Intelligence. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a
                key={item}
                href="#"
                className="text-sm text-[#6e6e73] transition-colors hover:text-[#1d1d1f]"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      {isAuthModalOpen ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 p-6 backdrop-blur-md">
          <div
            aria-hidden="true"
            onClick={closeAuthModal}
            className="absolute inset-0"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-dialog-title"
            className="relative z-10 w-full max-w-lg rounded-[2rem] border border-black/6 bg-white p-6 shadow-2xl shadow-black/15 md:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#dbe9fb] bg-[#eef6ff] px-3 py-1 text-xs font-semibold tracking-[0.16em] text-[#0071e3] uppercase">
                  <DropletsIcon className="h-3.5 w-3.5" />
                  H2GO Access
                </div>
                <h2
                  id="auth-dialog-title"
                  className="text-2xl font-bold tracking-tight text-[#1d1d1f]"
                >
                  {mode === "login"
                    ? "Access the dashboard"
                    : "Request account access"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-[#6e6e73]">
                  {mode === "login"
                    ? "Sign in with your approved H2GO account to open the protected dashboard."
                    : "Create your H2GO account. If you are not the first user, an admin will need to approve access before the dashboard unlocks."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeAuthModal}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/6 text-[#6e6e73] transition-colors hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-6 flex rounded-full bg-[#f3f6fa] p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                  mode === "login"
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#6e6e73]",
                )}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError(null);
                }}
                className={cn(
                  "flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors",
                  mode === "register"
                    ? "bg-white text-[#1d1d1f] shadow-sm"
                    : "text-[#6e6e73]",
                )}
              >
                Request Access
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {mode === "register" ? (
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                    Full name
                  </span>
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-2xl border border-[#d7dee7] bg-[#fbfcfe] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                    placeholder="Jane Doe"
                    autoComplete="name"
                    required
                  />
                </label>
              ) : null}

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  Email address
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-[#d7dee7] bg-[#fbfcfe] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#1d1d1f]">
                  Password
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-[#d7dee7] bg-[#fbfcfe] px-4 py-3 text-sm text-[#1d1d1f] outline-none transition focus:border-[#0071e3] focus:ring-4 focus:ring-[#0071e3]/10"
                  placeholder="At least 8 characters"
                  autoComplete={
                    mode === "login" ? "current-password" : "new-password"
                  }
                  minLength={8}
                  required
                />
              </label>

              {error ? (
                <div className="flex items-start gap-2 rounded-2xl border border-destructive/15 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  <AlertTriangleIcon className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0071e3] px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-[#0077ed] disabled:cursor-wait disabled:opacity-80"
              >
                {mode === "login" ? (
                  <LockIcon className="h-4 w-4" />
                ) : (
                  <UserPlusIcon className="h-4 w-4" />
                )}
                {submitting
                  ? mode === "login"
                    ? "Signing in..."
                    : "Creating account..."
                  : mode === "login"
                    ? "Sign In"
                    : "Create Account"}
              </button>
            </form>

            <div className="mt-6 flex flex-wrap items-center gap-5 text-xs text-[#51606f]">
              <div className="flex items-center gap-2">
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
                Protected dashboard data
              </div>
              <div className="flex items-center gap-2">
                <LockIcon className="h-4 w-4 text-[#0071e3]" />
                Cookie-based sessions
              </div>
              <div className="flex items-center gap-2">
                <UserPlusIcon className="h-4 w-4 text-amber-500" />
                Admin-approved access
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
