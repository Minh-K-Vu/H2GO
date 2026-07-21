import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { Map, Activity, Gauge, Droplets, Zap, ShieldCheck, Lock, Waves, TrendingDown, AlertTriangle } from 'lucide-react';

const SmartCityMap = dynamic(() => import('@/components/SmartCityMap'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-deep text-sm text-white/50">
      Loading city map...
    </div>
  ),
});

const FILTERS = [
  { id: 'demand', label: 'Water Demand', Icon: Activity, good: 'high' },
  { id: 'peak', label: 'Peak Usage', Icon: Gauge, good: 'high' },
  { id: 'conservation', label: 'Conservation', Icon: Droplets, good: 'high' },
  { id: 'stress', label: 'Infra Stress', Icon: Zap, good: 'low' },
  { id: 'leaks', label: 'Leak Density', Icon: AlertTriangle, good: 'low' },
];

// Greater Adelaide suburbs with approximate centroids + normalised metrics (0-1)
const SUBURBS = [
  { name: 'Adelaide CBD', lat: -34.9285, lng: 138.6007, demand: 0.82, peak: 0.79, conservation: 0.61, stress: 0.48, leaks: 0.39 },
  { name: 'North Adelaide', lat: -34.9085, lng: 138.595, demand: 0.61, peak: 0.58, conservation: 0.66, stress: 0.31, leaks: 0.22 },
  { name: 'Prospect', lat: -34.8889, lng: 138.5833, demand: 0.55, peak: 0.52, conservation: 0.71, stress: 0.28, leaks: 0.18 },
  { name: 'Enfield', lat: -34.872, lng: 138.6, demand: 0.49, peak: 0.47, conservation: 0.68, stress: 0.34, leaks: 0.26 },
  { name: 'Modbury', lat: -34.826, lng: 138.635, demand: 0.43, peak: 0.41, conservation: 0.74, stress: 0.22, leaks: 0.14 },
  { name: 'Tea Tree Gully', lat: -34.826, lng: 138.69, demand: 0.38, peak: 0.36, conservation: 0.79, stress: 0.19, leaks: 0.11 },
  { name: 'Golden Grove', lat: -34.79, lng: 138.71, demand: 0.41, peak: 0.39, conservation: 0.76, stress: 0.24, leaks: 0.13 },
  { name: 'Elizabeth', lat: -34.72, lng: 138.67, demand: 0.46, peak: 0.44, conservation: 0.58, stress: 0.41, leaks: 0.33 },
  { name: 'Gawler', lat: -34.6, lng: 138.74, demand: 0.35, peak: 0.33, conservation: 0.81, stress: 0.16, leaks: 0.09 },
  { name: 'Port Adelaide', lat: -34.848, lng: 138.506, demand: 0.58, peak: 0.55, conservation: 0.54, stress: 0.57, leaks: 0.44 },
  { name: 'Semaphore', lat: -34.84, lng: 138.477, demand: 0.44, peak: 0.42, conservation: 0.63, stress: 0.36, leaks: 0.27 },
  { name: 'Glenelg', lat: -34.98, lng: 138.51, demand: 0.67, peak: 0.64, conservation: 0.6, stress: 0.33, leaks: 0.21 },
  { name: 'Brighton', lat: -34.99, lng: 138.517, demand: 0.52, peak: 0.5, conservation: 0.69, stress: 0.29, leaks: 0.19 },
  { name: 'Marion', lat: -35.0, lng: 138.54, demand: 0.57, peak: 0.54, conservation: 0.64, stress: 0.38, leaks: 0.28 },
  { name: 'Mitcham', lat: -34.99, lng: 138.61, demand: 0.48, peak: 0.46, conservation: 0.73, stress: 0.26, leaks: 0.17 },
  { name: 'Unley', lat: -34.943, lng: 138.603, demand: 0.63, peak: 0.6, conservation: 0.67, stress: 0.32, leaks: 0.23 },
  { name: 'Norwood', lat: -34.9, lng: 138.63, demand: 0.71, peak: 0.68, conservation: 0.62, stress: 0.39, leaks: 0.3 },
  { name: 'Burnside', lat: -34.94, lng: 138.64, demand: 0.59, peak: 0.56, conservation: 0.72, stress: 0.27, leaks: 0.18 },
  { name: 'Campbelltown', lat: -34.89, lng: 138.65, demand: 0.5, peak: 0.48, conservation: 0.7, stress: 0.31, leaks: 0.22 },
  { name: 'Holdfast Bay', lat: -34.95, lng: 138.51, demand: 0.65, peak: 0.62, conservation: 0.58, stress: 0.35, leaks: 0.24 },
];

// colour scale: good direction determines whether high values are "good" (emerald) or "bad" (red)
function colorFor(filterId, v) {
  const f = FILTERS.find((x) => x.id === filterId);
  if (f.good === 'low') { // high value = bad (stress / leaks)
    if (v < 0.33) return '#22d3ee';
    if (v < 0.55) return '#facc15';
    if (v < 0.75) return '#fb923c';
    return '#ff2d55';
  }
  if (filterId === 'conservation') {
    if (v < 0.4) return '#1e3a8a';
    if (v < 0.65) return '#22d3ee';
    if (v < 0.85) return '#34d399';
    return '#10b981';
  }
  // demand / peak — higher = hotter cyan
  if (v < 0.4) return '#1e3a8a';
  if (v < 0.65) return '#06b6d4';
  if (v < 0.85) return '#22d3ee';
  return '#67e8f9';
}

const CITY_KPIS = [
  { label: 'City-wide Demand', value: '412 ML/day', Icon: Activity },
  { label: 'Active Leak Zones', value: '7', Icon: AlertTriangle },
  { label: 'Avg Conservation', value: '67%', Icon: Droplets },
  { label: 'Reservoir Level', value: '84%', Icon: Waves },
];

export default function SmartCity() {
  const [filter, setFilter] = useState('demand');
  const [selected, setSelected] = useState(null);

  const suburb = selected !== null ? SUBURBS[selected] : null;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-architectural text-water/70 uppercase"><Map className="h-4 w-4" /> Smart City Vision</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">A city, aware of its water.</h1>
          <p className="mt-4 text-lg text-white/60">Aggregated, privacy-respecting insight from thousands of H2 homes across Greater Adelaide — no individual is ever tracked. Tap a suburb to explore.</p>
        </div>

        {/* KPI tiles */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {CITY_KPIS.map((k) => (
            <div key={k.label} className="rounded-2xl border border-white/10 bg-panel p-4">
              <div className="flex items-center gap-1.5 text-water/70"><k.Icon className="h-3.5 w-3.5" /><span className="font-mono text-[9px] tracking-architectural uppercase">{k.label}</span></div>
              <div className="mt-1.5 font-display text-xl font-semibold text-white">{k.value}</div>
            </div>
          ))}
        </div>

        {/* filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button key={f.id} onClick={() => { setFilter(f.id); setSelected(null); }} className={`flex items-center gap-2 rounded-full px-4 py-2 font-display text-sm transition-colors ${filter === f.id ? 'bg-water text-deep' : 'bg-white/5 text-white/70 hover:text-water'}`}>
              <f.Icon className="h-4 w-4" /> {f.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.7fr_1fr]">
          {/* map */}
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-panel">
            <div className="flex items-center justify-between px-4 py-3 font-mono text-[10px] tracking-architectural text-white/40 uppercase">
              <span>Greater Adelaide · Aggregated</span>
              <span className="flex items-center gap-1.5 text-emerald-400"><Lock className="h-3 w-3" /> Anonymous</span>
            </div>
            <div className="h-[420px] w-full lg:h-[560px]">
              <SmartCityMap
                center={[-34.9, 138.6]}
                zoom={11}
                suburbs={SUBURBS}
                filter={filter}
                filters={FILTERS}
                colorFor={colorFor}
                onSelect={setSelected}
              />
            </div>
            {/* legend */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="font-mono text-[9px] tracking-wide text-white/40 uppercase">Low</span>
              <div className="h-2.5 flex-1 rounded-full" style={{ background: FILTERS.find((x) => x.id === filter).good === 'low' ? 'linear-gradient(90deg,#22d3ee,#facc15,#fb923c,#ff2d55)' : filter === 'conservation' ? 'linear-gradient(90deg,#1e3a8a,#22d3ee,#34d399,#10b981)' : 'linear-gradient(90deg,#1e3a8a,#06b6d4,#22d3ee,#67e8f9)' }} />
              <span className="font-mono text-[9px] tracking-wide text-white/40 uppercase">High</span>
            </div>
          </div>

          {/* panel */}
          <div className="rounded-3xl border border-white/10 bg-panel p-6 lg:p-8">
            <AnimatePresence mode="wait">
              {!suburb ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex h-full flex-col justify-center text-center">
                  <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-water/20 to-ocean/10"><Droplets className="h-5 w-5 text-water" /></span>
                  <p className="mt-4 text-white/55">Select a suburb on the map to see its aggregated water intelligence.</p>
                  <div className="mt-6 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-300">
                    <ShieldCheck className="h-4 w-4" /> Data is anonymised — no household is identifiable.
                  </div>
                </motion.div>
              ) : (
                <motion.div key={suburb.name + filter} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="font-mono text-[11px] tracking-architectural text-water/70 uppercase">Suburb Profile</div>
                  <h2 className="mt-2 font-display text-2xl font-semibold">{suburb.name}</h2>
                  <p className="mt-1 text-sm text-white/45">Greater Adelaide · {suburb.lat.toFixed(3)}, {suburb.lng.toFixed(3)}</p>
                  <div className="mt-5 space-y-3">
                    {FILTERS.map((f) => {
                      const v = suburb[f.id];
                      return (
                        <div key={f.id}>
                          <div className="flex items-center justify-between text-sm"><span className="flex items-center gap-1.5 text-white/60"><f.Icon className="h-3.5 w-3.5" /> {f.label}</span><span className="font-display font-semibold" style={{ color: colorFor(f.id, v) }}>{Math.round(v * 100)}%</span></div>
                          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full" style={{ width: `${v * 100}%`, background: colorFor(f.id, v) }} /></div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 flex items-center gap-2 rounded-xl border border-water/20 bg-water/5 p-3 text-xs text-water/80">
                    <TrendingDown className="h-4 w-4" /> H2 is reducing this suburb's non-revenue water loss by an est. {Math.round(suburb.leaks * 30)}%.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
