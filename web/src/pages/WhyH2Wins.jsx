import { motion } from 'framer-motion';
import { Check, AlertTriangle, X, Sparkles } from 'lucide-react';

const ROWS = [
  { feature: 'Detects leaks', t: 'yes', s: 'partial', h: 'yes' },
  { feature: 'Automatic shut-off', t: 'partial', s: 'no', h: 'yes' },
  { feature: 'Appliance-level monitoring', t: 'no', s: 'no', h: 'yes' },
  { feature: 'AI insights', t: 'no', s: 'partial', h: 'yes' },
  { feature: 'Mobile control', t: 'partial', s: 'partial', h: 'yes' },
  { feature: 'Usage history', t: 'partial', s: 'partial', h: 'yes' },
  { feature: 'Future ecosystem', t: 'no', s: 'no', h: 'planned' },
];

const COLS = [
  { key: 't', label: 'Traditional Leak Device' },
  { key: 's', label: 'Smart Meter' },
  { key: 'h', label: 'H2', highlight: true },
];

function Cell({ v }) {
  if (v === 'yes') return <span className="flex items-center justify-center"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-water/15"><Check className="h-4 w-4 text-water" /></span></span>;
  if (v === 'partial') return <span className="flex items-center justify-center"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-400/15"><AlertTriangle className="h-4 w-4 text-amber-300" /></span></span>;
  if (v === 'planned') return <span className="flex items-center justify-center"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-water/15"><Sparkles className="h-4 w-4 text-water" /></span></span>;
  return <span className="flex items-center justify-center"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5"><X className="h-4 w-4 text-white/40" /></span></span>;
}

export default function WhyH2Wins() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1200px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">Why H2 Wins</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">The full picture, side by side.</h1>
          <p className="mt-4 text-lg text-white/60">How H2 compares to today's water tech — across the capabilities that actually matter.</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse">
              <thead>
                <tr>
                  <th className="p-5 text-left font-mono text-[10px] tracking-architectural text-white/40 uppercase">Capability</th>
                  {COLS.map((c) => (
                    <th key={c.key} className={`p-5 text-center font-display text-sm ${c.highlight ? 'text-water' : 'text-white/60'}`}>
                      {c.label}
                      {c.highlight && <div className="mt-1 mx-auto h-1 w-10 rounded-full bg-water" />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <motion.tr key={r.feature} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="border-t border-white/5">
                    <td className="p-5 font-display text-sm font-medium text-white/85">{r.feature}</td>
                    {COLS.map((c) => (
                      <td key={c.key} className={`p-5 text-center ${c.highlight ? 'bg-water/5' : ''}`}><Cell v={r[c.key]} /></td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-6 font-mono text-[10px] tracking-wide text-white/40 uppercase">
          <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-water" /> Full</span>
          <span className="flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5 text-amber-300" /> Partial / Limited</span>
          <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-water" /> Planned</span>
          <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5 text-white/40" /> Not available</span>
        </div>
      </section>
    </div>
  );
}
