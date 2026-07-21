import { motion } from 'framer-motion';
import { ShowerHead, Droplets, Building2, Building, Sprout, Zap, Sparkles, FlaskConical } from 'lucide-react';

const CONCEPTS = [
  { title: 'Smart Showers', Icon: ShowerHead, status: 'In Development', desc: 'A showerhead that learns your routine and saves water without sacrificing comfort.' },
  { title: 'Water Filtration', Icon: Droplets, status: 'Concept', desc: 'Whole-home filtration and quality management, monitored in real time.' },
  { title: 'Commercial Systems', Icon: Building2, status: 'In Development', desc: 'H2 intelligence scaled for offices, retail and industrial sites.' },
  { title: 'Apartment Buildings', Icon: Building, status: 'Concept', desc: 'Building-wide water insight for strata, managers and residents.' },
  { title: 'Smart Irrigation', Icon: Sprout, status: 'In Development', desc: 'Garden and irrigation tied to live weather and soil data.' },
  { title: 'Electrical Monitoring', Icon: Zap, status: 'Future Vision', desc: 'Applying H2 intelligence to electrical circuits — the same way we did water.' },
  { title: 'AI Home Optimisation', Icon: Sparkles, status: 'Future Vision', desc: 'An AI that optimises water, energy and comfort across the whole home.' },
];

export default function FutureLab() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-12 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-architectural text-water/70 uppercase">
            <FlaskConical className="h-4 w-4" /> The Future Lab
          </div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">Building Tomorrow.</h1>
          <p className="mt-4 text-lg text-white/60">A look at where H2 is heading. Some concepts are in development — others are future visions we're exploring transparently.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CONCEPTS.map((c, i) => (
            <motion.div key={c.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }} className="group relative overflow-hidden rounded-3xl border border-white/10 bg-panel p-6 transition-colors hover:border-water/30">
              <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-water/10 blur-2xl opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-water/20 to-ocean/10"><c.Icon className="h-5 w-5 text-water" /></span>
                  <StatusBadge status={c.status} />
                </div>
                <h2 className="mt-5 font-display text-xl font-semibold">{c.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{c.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatusBadge({ status }) {
  const tone = status === 'In Development' ? 'bg-water/15 text-water' : status === 'Concept' ? 'bg-amber-400/15 text-amber-300' : 'bg-white/10 text-white/50';
  return <span className={`rounded-full px-2.5 py-1 font-mono text-[9px] tracking-architectural uppercase ${tone}`}>{status}</span>;
}
