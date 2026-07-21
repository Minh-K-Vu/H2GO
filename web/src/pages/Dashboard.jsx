import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Bell,
  Droplets,
  Moon,
  Power,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingDown,
} from "lucide-react";

const AI_MESSAGES = [
  "Good morning, Cameron.",
  "You've already saved 74 litres this week.",
  "I detected your shower is running longer than normal.",
  "You'll likely save $312 this year.",
  "I've noticed your dishwasher is becoming less efficient.",
];

const TABS = {
  Daily: [
    { d: "12am", v: 4 },
    { d: "6am", v: 22 },
    { d: "9am", v: 14 },
    { d: "12pm", v: 9 },
    { d: "3pm", v: 6 },
    { d: "6pm", v: 28 },
    { d: "9pm", v: 11 },
  ],
  Weekly: [
    { d: "M", v: 142 },
    { d: "T", v: 128 },
    { d: "W", v: 156 },
    { d: "T", v: 119 },
    { d: "F", v: 134 },
    { d: "S", v: 98 },
    { d: "S", v: 87 },
  ],
  Monthly: [
    { d: "W1", v: 980 },
    { d: "W2", v: 920 },
    { d: "W3", v: 845 },
    { d: "W4", v: 790 },
  ],
  Yearly: [
    { d: "J", v: 4200 },
    { d: "F", v: 3850 },
    { d: "M", v: 3600 },
    { d: "A", v: 3400 },
    { d: "M", v: 3200 },
    { d: "J", v: 3050 },
  ],
};

const STATS = [
  { label: "Today's Usage", value: "184 L", Icon: Droplets },
  { label: "Saved This Week", value: "74 L", Icon: TrendingDown },
  { label: "Efficiency", value: "92%", Icon: Sparkles },
  { label: "Leak Status", value: "Secure", Icon: ShieldCheck },
];

const FEATURES = [
  ["Live usage", "Daily, weekly, monthly and yearly views that update in real time."],
  ["AI that advises", "Personalised insights, predictions and savings - in plain language."],
  ["Leak protection", "Auto shut-off and instant alerts the moment something is wrong."],
  ["Holiday Mode", "Away from home? H2 watches it for you."],
  ["Carbon & cost", "See the litres, dollars and CO2 behind every drop."],
];

const FOOTER_GROUPS = [
  {
    label: "Experience",
    links: [
      ["Smart Home", "/smart-home"],
      ["Live Dashboard", "/Dashboard"],
      ["Meet the AI", "/meet-ai"],
    ],
  },
  {
    label: "Explore",
    links: [
      ["Global Mission", "/global-mission"],
      ["Leak Simulator", "/leak-simulator"],
      ["Smart City", "/smart-city"],
      ["H2 OS", "/H2OS"],
    ],
  },
  {
    label: "Company",
    links: [
      ["Impact", "/Impact"],
      ["Future Lab", "/future-lab"],
      ["Partner With H2", "/Partner"],
    ],
  },
];

export default function Dashboard() {
  const [tab, setTab] = useState("Daily");
  const [holiday, setHoliday] = useState(false);
  const [messages, setMessages] = useState([]);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowPhone(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMessages([]);
    const timers = AI_MESSAGES.map((message, index) =>
      setTimeout(() => setMessages((prev) => [...prev, message]), 800 + index * 900),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-deep text-white">
      <div className="water-radial absolute inset-0" />
      <section className="relative mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-architectural text-water/70">
            Live Dashboard
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Your water, in your pocket.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-white/60">
            The H2 app brings every drop into view - with an AI that watches, predicts, and saves.
          </p>
        </div>

        <div className="flex flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center">
          <motion.div
            initial={{ opacity: 0, y: 60, rotateX: 12 }}
            animate={showPhone ? { opacity: 1, y: 0, rotateX: 0 } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={{ perspective: 1000 }}
            className="relative"
          >
            <div className="relative h-[640px] w-[320px] rounded-[2.5rem] border-[10px] border-[#0c1422] bg-deep shadow-2xl glow-box">
              <div className="absolute left-1/2 top-0 z-20 h-6 w-32 -translate-x-1/2 rounded-b-2xl bg-[#0c1422]" />
              <div className="relative flex h-full flex-col overflow-hidden rounded-[2rem] bg-gradient-to-b from-[#070d18] to-deep">
                <div className="flex items-center justify-between px-6 pb-2 pt-6 font-mono text-[10px] text-white/50">
                  <span>9:24</span>
                  <span className="flex items-center gap-1">
                    <Sun className="h-3 w-3" /> H2
                  </span>
                </div>

                <div className="px-6 pt-2">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-water to-ocean font-display text-sm font-bold text-deep">
                      C
                    </span>
                    <div>
                      <div className="font-display text-sm font-semibold">Cameron's Home</div>
                      <div className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wide text-emerald-400">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        All systems secure
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2 px-6">
                  {messages.map((message, index) => (
                    <motion.div
                      key={`${message}-${index}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2"
                    >
                      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-water" />
                      <span className="text-xs leading-snug text-white/80">{message}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-4 flex gap-1 px-6">
                  {Object.keys(TABS).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setTab(key)}
                      className={`flex-1 rounded-lg py-1.5 font-display text-[11px] transition-colors ${
                        tab === key ? "bg-water text-deep" : "bg-white/5 text-white/60"
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>

                <div className="mt-3 h-40 px-3">
                  <ResponsiveContainer width="100%" height="100%">
                    {tab === "Monthly" || tab === "Yearly" ? (
                      <LineChart data={TABS[tab]}>
                        <XAxis dataKey="d" tick={{ fill: "#6B8AA6", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                        <Line type="monotone" dataKey="v" stroke="#22D3EE" strokeWidth={2} dot={{ fill: "#22D3EE", r: 3 }} />
                      </LineChart>
                    ) : (
                      <BarChart data={TABS[tab]}>
                        <XAxis dataKey="d" tick={{ fill: "#6B8AA6", fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Tooltip cursor={{ fill: "rgba(34,211,238,0.08)" }} contentStyle={{ background: "#0B1220", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, color: "#fff" }} />
                        <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                          <Cell fill="#22D3EE" />
                        </Bar>
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 px-6">
                  {STATS.map(({ label, value, Icon }) => (
                    <div key={label} className="rounded-xl border border-white/5 bg-white/[0.03] p-2.5">
                      <div className="flex items-center gap-1 text-water/70">
                        <Icon className="h-3 w-3" />
                        <span className="font-mono text-[8px] uppercase tracking-wide">{label}</span>
                      </div>
                      <div className="mt-0.5 font-display text-sm font-semibold">{value}</div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setHoliday((value) => !value)}
                  className="mx-6 mt-3 flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2.5"
                >
                  <span className="flex items-center gap-2 text-xs text-white/80">
                    <Moon className="h-3.5 w-3.5 text-water" /> Holiday Mode
                  </span>
                  <span className={`relative h-5 w-9 rounded-full transition-colors ${holiday ? "bg-water" : "bg-white/15"}`}>
                    <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${holiday ? "left-4" : "left-0.5"}`} />
                  </span>
                </button>

                <button className="mx-6 mt-3 flex items-center justify-center gap-2 rounded-xl bg-amber-500/10 py-2.5 text-xs font-medium text-amber-300">
                  <Power className="h-3.5 w-3.5" /> Emergency Shut-Off
                </button>
              </div>
            </div>
          </motion.div>

          <div className="max-w-md pt-2 lg:pt-2">
            <h2 className="font-display text-2xl font-semibold">Every feature, felt - not listed.</h2>
            <p className="mt-3 text-white/60">
              H2 turns water into a live, intelligent experience. Here's what that feels like:
            </p>
            <div className="mt-6 space-y-3">
              {FEATURES.map(([title, description], index) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-3 rounded-xl border border-white/5 bg-panel/40 p-4"
                >
                  <Bell className="h-5 w-5 shrink-0 text-water" />
                  <div>
                    <div className="font-display text-sm font-semibold text-water">{title}</div>
                    <div className="text-sm text-white/60">{description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/5 px-6 py-16 lg:px-10">
        <div className="mx-auto grid max-w-[1400px] gap-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-water text-deep">
                <Droplets className="h-4 w-4" />
              </span>
              <span className="font-display text-xl font-semibold">H2</span>
            </Link>
            <p className="mt-5 max-w-xs text-sm leading-6 text-white/45">
              Every Drop Matters. Water intelligence for every home - monitored, protected, managed.
            </p>
          </div>

          {FOOTER_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="mb-5 font-mono text-[10px] uppercase tracking-architectural text-water/70">
                {group.label}
              </div>
              <div className="grid gap-4">
                {group.links.map(([label, href]) => (
                  <Link key={href} href={href} className="text-sm text-white/45 transition-colors hover:text-water">
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-14 flex max-w-[1400px] items-center justify-between border-t border-white/5 pt-7 font-mono text-[10px] uppercase tracking-architectural text-white/32">
          <span>© 2026 H2 - Water Intelligence</span>
          <span>Every Drop Matters - Australia</span>
        </div>
      </footer>
    </div>
  );
}
