import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Droplets, ShieldCheck, RotateCcw, ArrowLeft, AlertTriangle, Power } from 'lucide-react';

const ROOMS = [
  { label: 'Kitchen', x: 120, y: 380 },
  { label: 'Bathroom', x: 260, y: 380 },
  { label: 'Laundry', x: 400, y: 380 },
  { label: 'Garden', x: 540, y: 380 },
  { label: 'Pool', x: 680, y: 380 },
];

const STEPS = [
  { key: 'flow', label: 'Normal Flow', desc: 'Water moves freely through every branch of the home.' },
  { key: 'burst', label: 'Burst Detected', desc: 'A pipe ruptures — water escapes unchecked.' },
  { key: 'shutoff', label: 'Auto Shutoff', desc: 'H2 closes the main valve within milliseconds.' },
  { key: 'alert', label: "You're Notified", desc: 'Your phone confirms the problem is solved.' },
];

export default function BurstPipe() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => {
      setStep((s) => (s + 1) % STEPS.length);
    }, 2600);
    return () => clearInterval(t);
  }, [playing]);

  const flowOpacity = step === 0 ? 1 : step >= 2 ? 0.12 : 0.5;
  const burstOpacity = step >= 1 ? 1 : 0;
  const valveCloseOpacity = step >= 2 ? 1 : 0;

  return (
    <div className="min-h-screen bg-deep">
      <section className="mx-auto max-w-5xl px-6 py-16 lg:py-24">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-mono text-[11px] tracking-architectural text-water/70 uppercase transition-colors hover:text-water">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">The Burst — Damage Unchecked</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl">
            What happens without intelligence.
          </h1>
          <p className="mt-4 text-lg text-white/60">
            A pipe bursts. Without H2, water floods unchecked. Watch the sequence H2 prevents — detection, automatic shutoff, and instant notification.
          </p>
        </div>

        {/* SVG demonstration */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel p-6 lg:p-10">
          <div className="relative mx-auto w-full max-w-3xl">
            <svg viewBox="0 0 800 460" className="w-full">
              {/* inlet + main */}
              <line x1="400" y1="50" x2="400" y2="200" stroke="#22D3EE" strokeWidth="12" strokeLinecap="round"
                strokeDasharray="22 16" className="animate-flow" style={{ strokeOpacity: flowOpacity }} />
              <line x1="120" y1="200" x2="680" y2="200" stroke="#22D3EE" strokeWidth="12" strokeLinecap="round"
                strokeDasharray="22 16" className="animate-flow" style={{ strokeOpacity: flowOpacity }} />
              {ROOMS.map((r) => (
                <line key={r.label} x1={r.x} y1="200" x2={r.x} y2={r.y} stroke="#22D3EE" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="20 14" className="animate-flow" style={{ strokeOpacity: flowOpacity }} />
              ))}
              {/* valve */}
              <g transform="translate(400,46)">
                <rect x="-26" y="-16" width="52" height="32" rx="6" fill="#0B1220" stroke="#22D3EE" strokeWidth="2" />
                <circle cx="0" cy="0" r="8" fill="#22D3EE" />
                <rect x="-3" y="-3" width="6" height="6" rx="1" fill="#ff4d6d" style={{ opacity: valveCloseOpacity }} />
              </g>
              {/* room nodes */}
              {ROOMS.map((r) => (
                <g key={r.label} transform={`translate(${r.x},${r.y})`}>
                  <circle r="22" fill="#0B1220" stroke="#22D3EE" strokeWidth="2" />
                  <circle r="6" fill="#22D3EE" />
                  <text x="0" y="48" textAnchor="middle" fill="#7DD3FC" fontSize="18" fontFamily="Space Grotesk, sans-serif">{r.label}</text>
                </g>
              ))}
              {/* burst at Laundry */}
              <g style={{ opacity: burstOpacity }} transform="translate(400,300)">
                <circle r="26" fill="none" stroke="#ff4d6d" strokeWidth="2" opacity="0.8" />
                <g stroke="#ff4d6d" strokeWidth="3" strokeLinecap="round">
                  <line x1="0" y1="0" x2="-34" y2="-22" />
                  <line x1="0" y1="0" x2="34" y2="-18" />
                  <line x1="0" y1="0" x2="-28" y2="26" />
                  <line x1="0" y1="0" x2="32" y2="28" />
                </g>
                <text x="0" y="-40" textAnchor="middle" fill="#ff4d6d" fontSize="16" fontWeight="600" fontFamily="JetBrains Mono, monospace">BURST</text>
              </g>
            </svg>

            {/* phone notification */}
            <AnimatePresence>
              {step >= 3 && (
                <motion.div
                  initial={{ y: 90, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute -bottom-2 right-2 w-[min(80vw,300px)] rounded-2xl border border-white/10 bg-panel/90 p-4 backdrop-blur-xl glow-box"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-water to-ocean">
                      <Droplets className="h-5 w-5 text-deep" />
                    </span>
                    <div className="flex-1">
                      <div className="font-display text-sm font-semibold text-water">H2 — Leak detected</div>
                      <div className="mt-0.5 text-xs text-white/60">Main valve closed automatically.</div>
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" /> Problem solved
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* step indicator */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEPS.map((s, i) => (
            <button
              key={s.key}
              onClick={() => { setStep(i); setPlaying(false); }}
              className={`rounded-2xl border p-4 text-left transition-all ${step === i ? 'border-water bg-water/10' : 'border-white/10 bg-panel hover:border-white/20'}`}
            >
              <div className={`flex items-center gap-2 font-mono text-[9px] tracking-architectural uppercase ${step === i ? 'text-water' : 'text-white/40'}`}>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-current text-[9px]">{i + 1}</span>
                {s.label}
              </div>
              <p className="mt-2 text-xs text-white/60">{s.desc}</p>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => { setStep(0); setPlaying(true); }}
            className="inline-flex items-center gap-2 rounded-full bg-water px-5 py-2.5 font-display text-sm font-medium text-deep transition-transform hover:scale-105"
          >
            <RotateCcw className="h-4 w-4" /> Replay
          </button>
          {step >= 1 && step < 3 && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-amber-300 uppercase">
              <AlertTriangle className="h-3.5 w-3.5" /> Damage in progress
            </div>
          )}
          {step >= 3 && (
            <div className="flex items-center gap-1.5 font-mono text-[11px] tracking-wide text-emerald-400 uppercase">
              <Power className="h-3.5 w-3.5" /> Valve closed
            </div>
          )}
        </div>
      </section>
    </div>
  );
}