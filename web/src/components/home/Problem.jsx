import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Droplets } from 'lucide-react';
import Counter from '@/components/Counter';

const STATS = [
  { label: 'Litres wasted every second globally', value: 1200, suffix: ' L' },
  { label: 'Homes flooded each year', value: 14000, suffix: '+' },
  { label: 'Insurance claims per month', value: 2300, suffix: '' },
  { label: 'Families who lose irreplaceable memories', value: 9, suffix: ' in 10' },
  { label: 'Governments spend upgrading infrastructure', prefix: '$', value: 4.2, decimals: 1, suffix: 'B / yr' },
];

export default function Problem() {
  return (
    <section id="problem" className="relative overflow-hidden bg-deep py-28 lg:py-40">
      <div className="mx-auto max-w-[1100px] px-6 lg:px-10">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="mb-16 max-w-3xl">
          <div className="mb-4 font-mono text-[11px] tracking-architectural text-water/70 uppercase">The Problem</div>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Water Is One of Humanity's Greatest Challenges.
          </h2>
        </motion.div>

        <div className="space-y-3">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
              className="flex items-baseline justify-between gap-6 border-b border-white/5 py-6"
            >
              <span className="font-display text-lg text-white/70 sm:text-2xl">{s.label}</span>
              <span className="font-display text-3xl font-semibold tabular-nums text-water sm:text-5xl">
                <Counter to={s.value} prefix={s.prefix || ''} suffix={s.suffix || ''} decimals={s.decimals || 0} />
              </span>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.96 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1, delay: 0.2 }} className="mx-auto mt-24 max-w-3xl text-center">
          <div className="mb-6 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-water to-ocean glow-box">
              <Droplets className="h-6 w-6 text-deep" />
            </span>
          </div>
          <h3 className="font-display text-3xl font-semibold leading-tight sm:text-5xl glow-text">
            We Believe Water Should Be Intelligent.
          </h3>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/60">
            Introducing <span className="font-display font-semibold text-water">H2</span> — the system that gives your home a
            complete understanding of its water, the way it already understands electricity, internet, and security.
          </p>
          <Link to="/smart-home" className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-display text-sm font-medium text-deep transition-transform hover:scale-105">
            See H2 in your home <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}