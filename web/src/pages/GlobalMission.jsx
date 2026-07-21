import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Droplets, Home, Shield, DollarSign, ShieldAlert, Globe } from 'lucide-react';

const EARTH = 'https://media.base44.com/images/public/6a5eb45ca7f42d986b8e625f/53d0f1ded_generated_image.png';

const DOTS = [
  { x: '40%', y: '42%' }, { x: '54%', y: '36%' }, { x: '48%', y: '50%' }, { x: '60%', y: '46%' },
  { x: '38%', y: '54%' }, { x: '56%', y: '58%' }, { x: '44%', y: '46%' }, { x: '52%', y: '52%' },
  { x: '46%', y: '38%' }, { x: '58%', y: '40%' }, { x: '42%', y: '48%' }, { x: '50%', y: '44%' },
];

export default function GlobalMission() {
  const [litres, setLitres] = useState(1840000000);

  useEffect(() => {
    const t = setInterval(() => setLitres((l) => l + Math.floor(20 + Math.random() * 40)), 600);
    return () => clearInterval(t);
  }, []);

  const metrics = [
    { label: 'Litres of water saved', value: litres.toLocaleString(), Icon: Droplets },
    { label: 'Homes protected', value: '48,230', Icon: Home },
    { label: 'Leaks prevented', value: '12,640', Icon: Shield },
    { label: 'Dollars saved', value: '$14.8M', Icon: DollarSign },
    { label: 'Insurance claims avoided', value: '9,450', Icon: ShieldAlert },
  ];

  return (
    <div className="relative min-h-[calc(100vh-3.5rem)] overflow-hidden bg-deep text-white">
      <section className="relative flex min-h-[90vh] items-center justify-center px-6 py-20">
        <div className="water-radial absolute inset-0" />
        <div className="relative w-full max-w-5xl text-center">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">Live Global Water Mission</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-6xl glow-text">
            You're joining something bigger.
          </h1>

          <div className="relative mx-auto mt-12 aspect-square w-[78vmin] max-w-[460px]">
            <div className="absolute inset-0 overflow-hidden rounded-full glow-box">
              <Image src={EARTH} alt="Glowing Earth" className="h-full w-full animate-spin-slow" fittingType="fill" />
              <div className="absolute inset-0 rounded-full" style={{ boxShadow: 'inset 0 0 80px rgba(0,0,0,0.5), inset 0 0 30px rgba(34,211,238,0.3)' }} />
            </div>
            {DOTS.map((d, i) => (
              <span key={i} className="animate-pulse-dot absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-water" style={{ left: d.x, top: d.y, boxShadow: '0 0 10px rgba(34,211,238,0.9)' }} />
            ))}
            <motion.div className="absolute inset-0 rounded-full" style={{ background: 'radial-gradient(circle, rgba(34,211,238,0.18), transparent 65%)' }} animate={{ opacity: [0.5, 0.85, 0.5] }} transition={{ duration: 4, repeat: Infinity }} />
          </div>

          <p className="mx-auto mt-10 max-w-md text-white/60">Every H2 home glows blue. As more devices come online, the Earth gets brighter — and the mission grows.</p>
        </div>
      </section>

      <section className="relative mx-auto max-w-[1200px] px-6 pb-24">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {metrics.map((m, i) => (
            <motion.div key={m.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="rounded-2xl border border-white/10 bg-panel p-6 text-center">
              <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-water/20 to-ocean/10"><m.Icon className="h-5 w-5 text-water" /></span>
              <div className="mt-4 font-display text-2xl font-semibold tabular-nums text-water sm:text-3xl">{m.value}</div>
              <div className="mt-1 font-mono text-[10px] tracking-architectural text-white/50 uppercase">{m.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="mt-10 flex items-center justify-center gap-2 font-mono text-[10px] tracking-architectural text-emerald-400 uppercase">
          <Globe className="h-4 w-4" /> Updating live across the H2 network
        </div>
      </section>
    </div>
  );
}
