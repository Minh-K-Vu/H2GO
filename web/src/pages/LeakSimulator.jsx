import { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Droplets, ShieldCheck, AlertTriangle, Bell, Power, Wrench, DollarSign } from 'lucide-react';

const WITHOUT = [
  { t: '0.0s', label: 'Pipe bursts', Icon: AlertTriangle },
  { t: '1.2s', label: 'Water floods the house', Icon: Droplets },
  { t: '2.4s', label: 'Floors & walls ruined', Icon: Wrench },
  { t: '3.6s', label: 'Insurance claim filed', Icon: DollarSign },
  { t: '4.8s', label: 'Builder booked', Icon: Wrench },
  { t: '6.0s', label: 'Weeks of repairs · $15,000 damage', Icon: AlertTriangle },
];

const WITH = [
  { t: '0.0s', label: 'Pipe bursts', Icon: AlertTriangle },
  { t: '1.2s', label: 'AI detects abnormal flow', Icon: Droplets },
  { t: '2.4s', label: 'Main valve closes', Icon: Power },
  { t: '3.6s', label: 'Notification sent', Icon: Bell },
  { t: '4.8s', label: 'No damage · Problem solved', Icon: ShieldCheck },
];

export default function LeakSimulator() {
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef(null);
  const max = Math.max(WITHOUT.length, WITH.length);

  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s + 1 >= max) { setRunning(false); return s; }
        return s + 1;
      });
    }, 1200);
    return () => clearInterval(timer.current);
  }, [running, max]);

  const run = () => { setStep(0); setRunning(true); };
  const reset = () => { setRunning(false); setStep(0); };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">Before & After Simulator</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">What happens when a pipe bursts?</h1>
          <p className="mt-4 text-lg text-white/60">Trigger a burst and watch the difference H2 makes — in about ten seconds.</p>
          <div className="mt-6 flex gap-3">
            <button onClick={run} disabled={running} className="inline-flex items-center gap-2 rounded-full bg-water px-6 py-3 font-display text-sm font-medium text-deep transition-transform hover:scale-105 disabled:opacity-50">
              <Play className="h-4 w-4" /> {running ? 'Running…' : 'Trigger burst'}
            </button>
            <button onClick={reset} className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 font-display text-sm text-white hover:border-water hover:text-water">
              <RotateCcw className="h-4 w-4" /> Reset
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Column title="Without H2" tone="bad" steps={WITHOUT} step={step} flood />
          <Column title="With H2" tone="good" steps={WITH} step={step} valve />
        </div>
      </section>
    </div>
  );
}

function Column({ title, tone, steps, step, flood, valve }) {
  const active = Math.min(step, steps.length - 1);
  const floodPct = flood ? Math.min(100, (active / (steps.length - 1)) * 85) : 0;
  const valveClosed = valve && active >= 2;
  const good = tone === 'good';

  return (
    <div className={`overflow-hidden rounded-3xl border bg-panel ${good ? 'border-water/30 glow-box' : 'border-rose-500/20'}`}>
      <div className="relative h-56 overflow-hidden">
        <HouseSVG floodPct={floodPct} valveClosed={valveClosed} good={good} />
      </div>
      <div className="p-6 lg:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <span className={`flex h-2.5 w-2.5 rounded-full ${good ? 'bg-emerald-400' : 'bg-rose-500'} animate-pulse`} />
        </div>
        <ol className="space-y-2.5">
          {steps.map((s, i) => {
            const done = i < active;
            const current = i === active && step > 0;
            return (
              <li key={s.label} className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${current ? 'border-water/40 bg-water/10' : done ? 'border-white/10 bg-white/[0.03] opacity-80' : 'border-white/5 opacity-40'}`}>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${done || current ? (good ? 'bg-water/20 text-water' : 'bg-rose-500/20 text-rose-400') : 'bg-white/5 text-white/40'}`}><s.Icon className="h-4 w-4" /></span>
                <span className="font-mono text-[10px] tracking-wide text-white/40 w-12">{s.t}</span>
                <span className={`font-display text-sm ${current ? 'text-white' : 'text-white/70'}`}>{s.label}</span>
              </li>
            );
          })}
        </ol>
        {step >= steps.length && (
          <div className={`mt-4 rounded-xl p-4 text-center font-display text-lg font-semibold ${good ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'}`}>
            {good ? 'Damage avoided. Claim avoided.' : '$15,000 in damage. Weeks of disruption.'}
          </div>
        )}
      </div>
    </div>
  );
}

function HouseSVG({ floodPct, valveClosed, good }) {
  return (
    <svg viewBox="0 0 400 220" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="220" fill="#070d18" />
      {/* house */}
      <polygon points="60,110 200,40 340,110" fill="#0B1220" stroke={good ? '#22D3EE' : '#3a4a5e'} strokeWidth="2" />
      <rect x="80" y="110" width="240" height="90" fill="#0B1220" stroke={good ? '#22D3EE' : '#3a4a5e'} strokeWidth="2" />
      <rect x="170" y="140" width="60" height="60" fill="#070d18" stroke={good ? '#22D3EE' : '#3a4a5e'} strokeWidth="2" />
      {/* flood water rising */}
      {floodPct > 0 && (
        <rect x="80" y={200 - floodPct * 0.9} width="240" height={floodPct * 0.9} fill="rgba(56,189,248,0.35)">
          <animate attributeName="opacity" values="0.3;0.5;0.3" dur="1.2s" repeatCount="indefinite" />
        </rect>
      )}
      {/* valve indicator */}
      <g transform="translate(200,30)">
        <circle r="12" fill="#0B1220" stroke={valveClosed ? '#22D3EE' : '#ff4d6d'} strokeWidth="2" />
        <circle r="5" fill={valveClosed ? '#22D3EE' : '#ff4d6d'} />
      </g>
      {good && (
        <g transform="translate(310,150)">
          <circle r="16" fill="#22D3EE" opacity="0.2" />
          <path d="M-6,0 L-1,5 L7,-5" stroke="#22D3EE" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}
