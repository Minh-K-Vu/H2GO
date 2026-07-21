import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Droplets, Thermometer, Gauge, DollarSign, Sparkles, Power, Bell, Leaf, ShieldAlert, TrendingUp, Waves, Check } from 'lucide-react';

const HOUSE = 'https://media.base44.com/images/public/6a5eb45ca7f42d986b8e625f/e108e66e6_generated_image.png';

const ROOMS = {
  kitchen: {
    label: 'Kitchen', x: '70%', y: '62%',
    currentFlow: 4.2, today: 38, month: 1.14, temp: 22, efficiency: 92, cost: 9.10, avg: 41, predicted: 1.08, carbon: 0.31, risk: 'Low',
    ai: 'Dishwasher cycle efficient. Consider running only at full load to save 6L/day.',
    alert: null,
    chart: [{ d: 'M', v: 12 }, { d: 'T', v: 18 }, { d: 'W', v: 9 }, { d: 'T', v: 15 }, { d: 'F', v: 21 }, { d: 'S', v: 8 }, { d: 'S', v: 11 }],
  },
  bathroom: {
    label: 'Bathroom', x: '45%', y: '50%',
    currentFlow: 7.8, today: 64, month: 1.92, temp: 41, efficiency: 78, cost: 15.30, avg: 72, predicted: 2.05, carbon: 0.52, risk: 'Medium',
    ai: 'Your shower is running 18% longer than your weekly average. Shortening by 2 minutes saves ~$94/yr.',
    alert: 'Showerhead efficiency declining — descale recommended.',
    chart: [{ d: 'M', v: 22 }, { d: 'T', v: 31 }, { d: 'W', v: 18 }, { d: 'T', v: 27 }, { d: 'F', v: 33 }, { d: 'S', v: 29 }, { d: 'S', v: 24 }],
  },
  laundry: {
    label: 'Laundry', x: '64%', y: '54%',
    currentFlow: 0, today: 19, month: 0.57, temp: 24, efficiency: 88, cost: 4.50, avg: 22, predicted: 0.55, carbon: 0.16, risk: 'Low',
    ai: 'Washing machine has a slow leak signature detected. Washer replacement could save $114/yr.',
    alert: 'Slow leak signature — inspect hose fittings.',
    chart: [{ d: 'M', v: 6 }, { d: 'T', v: 9 }, { d: 'W', v: 4 }, { d: 'T', v: 8 }, { d: 'F', v: 5 }, { d: 'S', v: 7 }, { d: 'S', v: 6 }],
  },
  garden: {
    label: 'Garden', x: '84%', y: '62%',
    currentFlow: 2.1, today: 28, month: 0.84, temp: 19, efficiency: 95, cost: 6.70, avg: 30, predicted: 0.80, carbon: 0.23, risk: 'Low',
    ai: 'Irrigation aligned with rainfall forecast. Skipping tonight saves 40L.',
    alert: null,
    chart: [{ d: 'M', v: 10 }, { d: 'T', v: 14 }, { d: 'W', v: 6 }, { d: 'T', v: 12 }, { d: 'F', v: 15 }, { d: 'S', v: 9 }, { d: 'S', v: 8 }],
  },
  pool: {
    label: 'Pool', x: '58%', y: '68%',
    currentFlow: 0.4, today: 12, month: 0.36, temp: 26, efficiency: 90, cost: 2.90, avg: 14, predicted: 0.34, carbon: 0.10, risk: 'Low',
    ai: 'Evaporation within normal range. Cover recommended to save 30L/week.',
    alert: null,
    chart: [{ d: 'M', v: 4 }, { d: 'T', v: 5 }, { d: 'W', v: 3 }, { d: 'T', v: 4 }, { d: 'F', v: 6 }, { d: 'S', v: 5 }, { d: 'S', v: 4 }],
  },
};

export default function SmartHome() {
  const [active, setActive] = useState('bathroom');
  const [shutOff, setShutOff] = useState(false);
  const [liveFlow, setLiveFlow] = useState(null);

  const room = ROOMS[active];

  useEffect(() => {
    const t = setInterval(() => {
      setLiveFlow((room.currentFlow * (0.92 + Math.random() * 0.16)).toFixed(1));
    }, 1800);
    return () => clearInterval(t);
  }, [active, room.currentFlow]);

  const stats = [
    { label: 'Current Flow', value: `${liveFlow ?? room.currentFlow} L/min`, Icon: Waves, live: true },
    { label: "Today's Usage", value: `${room.today} L`, Icon: Droplets },
    { label: 'Monthly Usage', value: `${room.month} kL`, Icon: TrendingUp },
    { label: 'Water Temp', value: `${room.temp}°C`, Icon: Thermometer },
    { label: 'Efficiency Score', value: `${room.efficiency}%`, Icon: Gauge },
    { label: 'Cost (mo)', value: `$${room.cost}`, Icon: DollarSign },
    { label: 'Predicted Usage', value: `${room.predicted} kL`, Icon: Sparkles },
    { label: 'Carbon Impact', value: `${room.carbon} kg CO₂`, Icon: Leaf },
    { label: 'Insurance Risk', value: room.risk, Icon: ShieldAlert },
  ];

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">The Smart Home</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
            Your home, aware of every drop.
          </h1>
          <p className="mt-4 text-lg text-white/60">
            Tap any room to explore live water data — flow, usage, efficiency, AI advice and emergency controls.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* HOUSE */}
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-panel">
            <div className="relative aspect-[16/11] w-full">
              <Image src={HOUSE} alt="Modern smart home" className="h-full w-full" fittingType="fill" />
              <div className="absolute inset-0 bg-gradient-to-t from-deep/80 via-transparent to-deep/20" />
              {Object.entries(ROOMS).map(([id, r]) => (
                <button
                  key={id}
                  onClick={() => { setActive(id); setShutOff(false); }}
                  className="group absolute -translate-x-1/2 -translate-y-1/2"
                  style={{ left: r.x, top: r.y }}
                  aria-label={r.label}
                >
                  <span className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all ${
                    active === id ? 'scale-110 border-water bg-water/20' : 'border-white/70 bg-deep/40 backdrop-blur group-hover:border-water'
                  }`}>
                    <span className={`h-2 w-2 rounded-full ${active === id ? 'bg-water' : 'bg-white/80'} ${active === id ? 'animate-pulse-dot' : ''}`} style={{ boxShadow: '0 0 10px rgba(34,211,238,0.8)' }} />
                  </span>
                  <span className={`absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap rounded bg-deep/80 px-2 py-0.5 font-mono text-[9px] tracking-wide text-aqua uppercase backdrop-blur transition-opacity ${active === id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 border-t border-white/5 p-4">
              {Object.entries(ROOMS).map(([id, r]) => (
                <button key={id} onClick={() => { setActive(id); setShutOff(false); }} className={`rounded-full px-3 py-1.5 font-display text-xs transition-colors ${active === id ? 'bg-water text-deep' : 'bg-white/5 text-white/60 hover:text-water'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {/* PANEL */}
          <div className="rounded-3xl border border-white/10 bg-panel p-6 lg:p-8">
            <AnimatePresence mode="wait">
              <motion.div key={active} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold">{room.label}</h2>
                  <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-architectural text-emerald-400 uppercase">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {stats.map((s) => (
                    <div key={s.label} className="rounded-xl border border-white/5 bg-deep/40 p-3">
                      <div className="flex items-center gap-1.5 text-water/70">
                        <s.Icon className="h-3.5 w-3.5" />
                        <span className="font-mono text-[9px] tracking-architectural uppercase">{s.label}</span>
                      </div>
                      <div className="mt-1.5 font-display text-lg font-semibold text-white">{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* chart */}
                <div className="mt-5 rounded-xl border border-white/5 bg-deep/40 p-4">
                  <div className="mb-3 font-mono text-[10px] tracking-architectural text-white/50 uppercase">7-day usage (L)</div>
                  <div className="h-32">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={room.chart}>
                        <XAxis dataKey="d" tick={{ fill: '#6B8AA6', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip cursor={{ fill: 'rgba(34,211,238,0.08)' }} contentStyle={{ background: '#0B1220', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
                        <Bar dataKey="v" radius={[4, 4, 0, 0]}>
                          {room.chart.map((_, i) => (<Cell key={i} fill="#22D3EE" />))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* AI advice */}
                <div className="mt-4 flex gap-3 rounded-xl border border-water/20 bg-water/5 p-4">
                  <Sparkles className="h-5 w-5 shrink-0 text-water" />
                  <p className="text-sm text-white/80">{room.ai}</p>
                </div>

                {room.alert && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-300">
                    <Bell className="h-4 w-4" /> {room.alert}
                  </div>
                )}

                {/* shutoff */}
                <button
                  onClick={() => setShutOff((s) => !s)}
                  className={`mt-5 flex w-full items-center justify-center gap-2 rounded-full py-3.5 font-display text-sm font-medium transition-all ${
                    shutOff ? 'bg-amber-500 text-deep' : 'bg-white/5 text-white hover:bg-white/10'
                  }`}
                >
                  <Power className="h-4 w-4" /> {shutOff ? 'Valve Closed — Water Off' : 'Emergency Shut-Off'}
                </button>
                {shutOff && <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-emerald-400"><Check className="h-3.5 w-3.5" /> Flow stopped to this room.</div>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    </div>
  );
}
