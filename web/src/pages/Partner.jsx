import { Building2, Check, Droplets, Home, Landmark, Megaphone, Shield, UserPlus } from "lucide-react";

const partners = [
  { label: "Builders", Icon: Building2 },
  { label: "Insurers", Icon: Shield },
  { label: "Councils", Icon: Landmark },
  { label: "Homeowners", Icon: Home },
  { label: "Utilities", Icon: Droplets },
  { label: "Installers", Icon: UserPlus },
];

export default function Partner() {
  return (
    <div className="min-h-screen bg-deep text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          <div className="mb-3 font-mono text-[11px] uppercase tracking-architectural text-water/70">
            Partner With H2
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl">
            Build the water intelligence network with us.
          </h1>
          <p className="mt-5 text-lg text-white/60">
            H2 is designed for the organisations that protect, build, insure, and plan homes.
          </p>
        </div>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
          {partners.map(({ label, Icon }) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-panel p-6">
              <Icon className="h-6 w-6 text-water" />
              <h2 className="mt-4 font-display text-xl font-semibold">{label}</h2>
              <p className="mt-2 flex items-center gap-2 text-sm text-white/55">
                <Check className="h-4 w-4 text-water" /> Partnership pathway ready.
              </p>
            </div>
          ))}
        </div>
        <div className="mt-8 rounded-3xl border border-water/20 bg-water/5 p-6">
          <Megaphone className="h-6 w-6 text-water" />
          <p className="mt-3 text-sm text-white/70">Use this page as the partner CTA surface while the full lead workflow is connected.</p>
        </div>
      </section>
    </div>
  );
}
