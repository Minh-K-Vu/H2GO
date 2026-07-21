import { Bell, BarChart3, Cloud, Cpu, Smartphone, Sparkles, Zap } from "lucide-react";

const modules = [
  { label: "Live Dashboard", Icon: BarChart3 },
  { label: "Smart Alerts", Icon: Bell },
  { label: "Device Brain", Icon: Cpu },
  { label: "Cloud Sync", Icon: Cloud },
  { label: "Mobile Control", Icon: Smartphone },
  { label: "AI Insights", Icon: Sparkles },
];

export default function H2OS() {
  return (
    <div className="min-h-screen bg-deep text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-architectural text-water/70">
            H2OS
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            The operating system for water intelligence.
          </h1>
          <p className="mt-5 text-lg text-white/60">
            H2OS connects sensors, valves, alerts, analytics, and automation into one calm control layer.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {modules.map(({ label, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-panel p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-water/10 text-water">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-5 font-display text-xl font-semibold">{label}</h2>
              <p className="mt-2 text-sm leading-6 text-white/55">
                A connected module designed to make water usage visible, controllable, and safer.
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center gap-3 rounded-3xl border border-water/20 bg-water/5 p-6">
          <Zap className="h-6 w-6 text-water" />
          <p className="text-sm text-white/70">
            Future-ready architecture for homes, cities, insurers, and builders.
          </p>
        </div>
      </section>
    </div>
  );
}
