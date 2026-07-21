import { ArrowRight, Calculator, DollarSign, Droplets, Leaf, Shield, TrendingDown } from "lucide-react";

const benefits = [
  { label: "Lower bills", Icon: DollarSign },
  { label: "Leak protection", Icon: Shield },
  { label: "Water savings", Icon: Droplets },
  { label: "Lower impact", Icon: Leaf },
];

export default function Homeowners() {
  return (
    <div className="min-h-screen bg-deep text-white">
      <section className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-architectural text-water/70">
            For Homeowners
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Protect your home before water becomes damage.
          </h1>
          <p className="mt-5 text-lg text-white/60">
            H2 helps households understand consumption, detect problems early, and shut off flow when risk appears.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-4">
          {benefits.map(({ label, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-panel p-6">
              <Icon className="h-6 w-6 text-water" />
              <p className="mt-4 font-display text-lg font-semibold">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-panel p-6">
          <div className="flex items-center gap-3 text-water">
            <Calculator className="h-5 w-5" />
            <span className="font-mono text-[11px] uppercase tracking-architectural">Savings model</span>
          </div>
          <p className="mt-4 text-3xl font-semibold">
            <TrendingDown className="mr-2 inline h-7 w-7 text-water" />
            Less waste. Fewer surprises. More control.
          </p>
          <a href="/smart-home" className="mt-6 inline-flex items-center gap-2 rounded-full bg-water px-6 py-3 text-sm font-medium text-deep">
            Explore Smart Home <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </div>
  );
}
