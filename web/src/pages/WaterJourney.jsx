import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Droplets, Factory, Waves, Home, Utensils, Gauge, Cpu, Sparkles, LayoutDashboard, Shield, Power, TrendingUp, Play } from 'lucide-react';

const STAGES = [
  { label: 'Dam', Icon: Droplets, desc: 'Water is stored at the source reservoir, ready to begin its journey.' },
  { label: 'Treatment Plant', Icon: Factory, desc: 'Water is filtered, treated and made safe for your home.' },
  { label: 'Water Main', Icon: Waves, desc: 'Pressurised mains carry water through your suburb.' },
  { label: 'Your Home', Icon: Home, desc: 'Water enters your property at the main supply.' },
  { label: 'Kitchen', Icon: Utensils, desc: 'Water reaches the tap you actually use.' },
  { label: 'Flow Sensor', Icon: Gauge, desc: 'H2 measures flow, pressure and temperature in real time.' },
  { label: 'H2 Device', Icon: Cpu, desc: 'The H2 unit analyses the signal instantly.' },
  { label: 'AI', Icon: Sparkles, desc: 'AI recognises patterns and flags anomalies.' },
  { label: 'Dashboard', Icon: LayoutDashboard, desc: 'You see live usage and insights in the app.' },
  { label: 'Decision', Icon: Shield, desc: 'Normal flow — or an anomaly that needs action?' },
  { label: 'Valve', Icon: Power, desc: 'If needed, H2 closes the valve automatically.' },
  { label: 'Savings', Icon: TrendingUp, desc: 'Less waste, lower bills, a protected home.' },
];

export default function WaterJourney() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timer = useRef(null);

  useEffect(() => {
    if (!playing) return;
    timer.current = setInterval(() => {
      setStep((s) => { if (s + 1 >= STAGES.length) { setPlaying(false); return s; } return s + 1; });
    }, 1400);
    return () => clearInterval(timer.current);
  }, [playing]);

  const stage = STAGES[step];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">Interactive Water Journey</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">Follow a single drop.</h1>
          <p className="mt-4 text-lg text-white/60">From the dam to your savings — trace the entire H2 system, one stage at a time.</p>
          <button onClick={() => { setStep(0); setPlaying((p) => !p); }} className="mt-6 inline-flex items-center gap-2 rounded-full bg-water px-6 py-3 font-display text-sm font-medium text-deep transition-transform hover:scale-105">
            <Play className="h-4 w-4" /> {playing ? 'Pause' : 'Play journey'}
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_1.2fr]">
          {/* rail */}
          <div className="relative">
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-white/10" />
            <ol className="space-y-1">
              {STAGES.map((s, i) => {
                const active = i === step;
                return (
                  <li key={s.label}>
                    <button onClick={() => { setStep(i); setPlaying(false); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-white/5">
                      <span className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all ${active ? 'border-water bg-water/20 glow-box scale-110' : i < step ? 'border-water/40 bg-panel' : 'border-white/10 bg-panel'}`}>
                        {active ? <Droplets className="h-4 w-4 text-water" /> : <s.Icon className="h-4 w-4 text-white/50" />}
                      </span>
                      <span className={`font-display text-sm transition-colors ${active ? 'text-water' : i < step ? 'text-white/80' : 'text-white/40'}`}>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* detail */}
          <div className="lg:sticky lg:top-24 h-fit">
            <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rounded-3xl border border-water/20 bg-gradient-to-br from-panel to-[#0a1626] p-8 glow-box">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[11px] tracking-architectural text-water/70 uppercase">Stage {String(step + 1).padStart(2, '0')} / {STAGES.length}</span>
              </div>
              <div className="mt-5 flex items-center gap-4">
                <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-water/20 to-ocean/10"><stage.Icon className="h-7 w-7 text-water" /></span>
                <h2 className="font-display text-3xl font-semibold">{stage.label}</h2>
              </div>
              <p className="mt-5 text-lg leading-relaxed text-white/70">{stage.desc}</p>
              {/* progress */}
              <div className="mt-7">
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div className="h-full bg-water" initial={{ width: 0 }} animate={{ width: `${((step + 1) / STAGES.length) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
