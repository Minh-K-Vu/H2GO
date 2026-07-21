import Counter from "@/components/Counter";
import { DollarSign, Droplets, Home, Leaf, Shield } from "lucide-react";

const metrics = [
  { label: "Homes protected", value: 2408914, Icon: Home },
  { label: "Litres saved", value: 1240000000, Icon: Droplets },
  { label: "Leaks prevented", value: 8402, Icon: Shield },
  { label: "Estimated savings", value: 18400000, Icon: DollarSign },
];

export default function Impact() {
  return (
    <div className="min-h-screen bg-deep text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-architectural text-water/70">
            Impact
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Measurable protection for every drop.
          </h1>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          {metrics.map(({ label, value, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-panel p-6">
              <Icon className="h-6 w-6 text-water" />
              <div className="mt-4 font-display text-3xl font-semibold text-white">
                <Counter to={value} formatter={(n) => Math.round(n).toLocaleString()} />
              </div>
              <p className="mt-2 text-sm text-white/50">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center gap-3 rounded-3xl border border-emerald-400/20 bg-emerald-400/5 p-6 text-emerald-300">
          <Leaf className="h-6 w-6" />
          <p className="text-sm">Saving water also saves energy, emissions, and household stress.</p>
        </div>
      </section>
    </div>
  );
}
