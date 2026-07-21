import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Droplets, AlertTriangle, Home } from 'lucide-react';

const FLOW = 'https://media.base44.com/videos/public/6a5eb45ca7f42d986b8e625f/3a92c63ed_Water_Flow_Vision.mp4';
const BURST = 'https://media.base44.com/videos/public/6a5eb45ca7f42d986b8e625f/22e5acaa6_Burst_Pipe_Damage.mp4';
const HOME = 'https://media.base44.com/videos/public/6a5eb45ca7f42d986b8e625f/c75ffcaf1_Water_POV_Journey.mp4';

export default function VisionModal({ open, onClose }) {
  const [tab, setTab] = useState('flow');

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const src = tab === 'flow' ? FLOW : tab === 'burst' ? BURST : HOME;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-deep/90 p-4 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-panel glow-box"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-deep/60 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap gap-2 border-b border-white/5 p-4">
              <TabButton active={tab === 'flow'} onClick={() => setTab('flow')} Icon={Droplets} label="The Flow — Global Water Network" />
              <TabButton active={tab === 'home'} onClick={() => setTab('home')} Icon={Home} label="The Journey — Water to Home" />
              <TabButton active={tab === 'burst'} onClick={() => setTab('burst')} Icon={AlertTriangle} label="The Burst — Damage Unchecked" />
            </div>

            <div className="relative aspect-video w-full bg-deep">
              <AnimatePresence mode="wait">
                <motion.video
                  key={tab}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  src={src}
                  autoPlay
                  loop
                  muted
                  playsInline
                  controls
                  className="h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-deep/40 to-transparent" />
            </div>

            <div className="px-6 py-5">
              {tab === 'flow' ? (
                <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                  Every H2 device is a node in a living network — water flows through your home, across oceans, and connects to homes around the world. A single, intelligent water system protecting every drop.
                </p>
              ) : tab === 'home' ? (
                <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                  From the pipes in your walls to the cup in your hand, to a backyard full of life — this is the journey H2 protects. Every drop, monitored from source to splash.
                </p>
              ) : (
                <p className="max-w-2xl text-sm leading-relaxed text-white/60">
                  Without intelligence, a single burst pipe can flood a home in minutes. This is what water damage looks like unchecked — the exact scenario H2 detects and stops before a drop is lost.
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-4 py-2 font-display text-xs font-medium transition-all ${
        active ? 'bg-water text-deep' : 'bg-white/5 text-white/60 hover:text-water'
      }`}
    >
      <Icon className="h-3.5 w-3.5" /> {label}
    </button>
  );
}