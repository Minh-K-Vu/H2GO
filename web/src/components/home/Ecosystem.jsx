import { motion } from 'framer-motion';
import { Home, Shield, Landmark, Building2, Zap, Briefcase, Sparkles, Waves, Droplets, Lock, Wifi, Tv, Thermometer, Check } from 'lucide-react';

const ORBIT = [
  { label: 'Home', Icon: Home },
  { label: 'Insurance', Icon: Shield },
  { label: 'Government', Icon: Landmark },
  { label: 'Builders', Icon: Building2 },
  { label: 'Utilities', Icon: Zap },
  { label: 'Businesses', Icon: Briefcase },
  { label: 'AI', Icon: Sparkles },
  { label: 'Water Data', Icon: Waves },
];

const KNOWN = [
  { label: 'Electricity', Icon: Zap },
  { label: 'Security', Icon: Lock },
  { label: 'Internet', Icon: Wifi },
  { label: 'Entertainment', Icon: Tv },
  { label: 'Heating', Icon: Thermometer },
];

export default function Ecosystem() {
  return (
    <section id="what-is-h2" className="relative overflow-hidden border-t border-white/5 bg-gradient-to-b from-deep via-[#070d18] to-deep py-28 lg:py-40">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-16 text-center">
          <div className="mb-4 font-mono text-[11px] tracking-architectural text-water/70 uppercase">What is H2?</div>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Not a device. An ecosystem.
          </h2>
        </motion.div>

        {/* ORBIT */}
        <div className="relative mx-auto flex aspect-square w-[85vw] max-w-[560px] items-center justify-center">
          <div className="animate-spin-slow absolute inset-0">
            <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
              {ORBIT.map((_, i) => {
                const a = ((i * 360) / ORBIT.length - 90) * (Math.PI / 180);
                const x = 50 + 44 * Math.cos(a);
                const y = 50 + 44 * Math.sin(a);
                return <line key={i} x1="50" y1="50" x2={x} y2={y} stroke="#22D3EE" strokeWidth="0.4" opacity="0.4" strokeDasharray="1.5 1.5" />;
              })}
            </svg>
            {ORBIT.map((it, i) => {
              const a = ((i * 360) / ORBIT.length - 90) * (Math.PI / 180);
              const x = 50 + 44 * Math.cos(a);
              const y = 50 + 44 * Math.sin(a);
              return (
                <div key={it.label} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                  <div className="animate-spin-slow flex flex-col items-center gap-1" style={{ animationDirection: 'reverse' }}>
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-panel/80 backdrop-blur glow-box">
                      <it.Icon className="h-5 w-5 text-water" />
                    </span>
                    <span className="font-mono text-[9px] tracking-architectural text-aqua/70 uppercase whitespace-nowrap">{it.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
          {/* center */}
          <div className="relative z-10 flex flex-col items-center">
            <span className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-water to-ocean glow-box">
              <span className="font-display text-3xl font-bold text-deep">H2</span>
            </span>
            <span className="mt-2 font-mono text-[10px] tracking-architectural text-water/70 uppercase">Platform</span>
          </div>
        </div>

        <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="mx-auto mt-16 max-w-2xl text-center font-display text-2xl leading-snug text-white/80 sm:text-3xl">
          H2 isn't a device. It's an ecosystem that connects homes, insurers, builders, utilities, and AI into one
          coherent picture of water.
        </motion.p>

        {/* KNOWN vs WATER */}
        <div className="mt-20">
          <div className="mb-6 text-center font-mono text-[11px] tracking-architectural text-white/40 uppercase">Today's homes already know…</div>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            {KNOWN.map((k) => (
              <div key={k.label} className="flex items-center gap-2 rounded-full border border-white/10 bg-panel/60 px-4 py-2.5">
                <k.Icon className="h-4 w-4 text-water" />
                <span className="font-display text-sm text-white/80">{k.label}</span>
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              </div>
            ))}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-panel/60 px-4 py-2.5 opacity-60">
              <Droplets className="h-4 w-4 text-white/40" />
              <span className="font-display text-sm text-white/50 line-through">Water</span>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="font-display text-xl text-white/70 sm:text-2xl">
              Almost nothing about water. <span className="text-water">H2 changes that forever.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}