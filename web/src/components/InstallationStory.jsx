import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import {
  Activity,
  Check,
  Droplet,
  Gauge,
  House,
  Pause,
  Play,
  Smartphone,
  Thermometer,
  Wifi,
  Wrench,
} from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const STEP_DURATION = 4200;

const steps = [
  {
    number: "01",
    title: "Install",
    body: "Fit H2GO to the property's main water line.",
    Icon: Wrench,
  },
  {
    number: "02",
    title: "Connect",
    body: "Pair the monitor and confirm the home in the app.",
    Icon: Smartphone,
  },
  {
    number: "03",
    title: "Monitor",
    body: "Build a useful view of normal household water use.",
    Icon: Activity,
  },
];

function H2GODevice({ compact = false, reduceMotion = false }) {
  return (
    <div className={`relative flex flex-col items-center justify-center border border-white/35 bg-[#eef3f1] text-[#10181c] shadow-[0_20px_55px_rgba(0,0,0,0.3)] ${compact ? "h-[88px] w-[74px]" : "h-[126px] w-[104px]"}`}>
      <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[72%] rounded-t-[5px] bg-[#10181c] ${compact ? "h-6 w-9" : "h-8 w-11"}`} />
      <motion.span
        data-device-status
        className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#22a86f]"
        animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 1.25, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
      <Droplet className={`fill-[#18b8d0] text-[#18b8d0] ${compact ? "h-6 w-6" : "h-8 w-8"}`} />
      <span className={`${compact ? "mt-1.5 text-[10px]" : "mt-2 text-xs"} font-bold`}>H2GO</span>
      <span className="mt-1 text-[8px] font-semibold text-[#68777c]">MAIN LINE</span>
    </div>
  );
}

function SceneCaption({ step, title, body, reduceMotion }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.25 }}
      className="absolute bottom-5 left-5 right-5 z-20 flex items-end justify-between gap-5 border-t border-white/15 pt-4 sm:bottom-6 sm:left-7 sm:right-7"
    >
      <div>
        <p className="text-[10px] font-semibold text-[#73d9eb]">STEP {step}</p>
        <p className="mt-1 text-lg font-semibold text-white">{title}</p>
      </div>
      <p className="hidden max-w-[280px] text-right text-xs leading-5 text-white/55 sm:block">{body}</p>
    </motion.div>
  );
}

function InstallScene({ reduceMotion }) {
  return (
    <div className="relative h-full" data-installation-scene="install">
      <div className="absolute inset-x-0 top-[46%] h-10 -translate-y-1/2">
        <motion.div
          initial={reduceMotion ? false : { x: -90, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-1 h-8 w-[43%] border-y border-[#9badb2] bg-[#53676e]"
        />
        <motion.div
          initial={reduceMotion ? false : { x: 90, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-1 h-8 w-[43%] border-y border-[#9badb2] bg-[#53676e]"
        />
        {!reduceMotion && [0, 1, 2].map((index) => (
          <motion.span
            key={index}
            data-water-packet
            className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#73d9eb]"
            initial={{ left: "1%", opacity: 0 }}
            animate={{ left: "99%", opacity: [0, 1, 1, 0] }}
            transition={{ duration: 2.5, delay: 1.45 + index * 0.55, repeat: Infinity, ease: "linear" }}
          />
        ))}
      </div>

      <div className="absolute left-1/2 top-[46%] z-10 -translate-x-1/2 -translate-y-1/2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: -110, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.32, type: "spring", stiffness: 120, damping: 16 }}
        >
          <H2GODevice reduceMotion={reduceMotion} />
          <motion.span
            className="absolute -left-3 top-1/2 h-[52px] w-3 -translate-y-1/2 border-y border-l border-[#73d9eb]"
            initial={reduceMotion ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 1.05 }}
          />
          <motion.span
            className="absolute -right-3 top-1/2 h-[52px] w-3 -translate-y-1/2 border-y border-r border-[#73d9eb]"
            initial={reduceMotion ? false : { scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 1.05 }}
          />
        </motion.div>
      </div>

      <motion.span
        initial={reduceMotion ? false : { opacity: 0, x: 36, y: -20, rotate: -55 }}
        animate={reduceMotion ? { opacity: 1, x: 0, y: 0, rotate: 0 } : { opacity: [0, 1, 1, 0], x: [36, 4, 0, -14], y: [-20, 0, 0, 14], rotate: [-55, 18, -16, 28] }}
        transition={{ duration: reduceMotion ? 0 : 1.65, delay: reduceMotion ? 0 : 0.75, times: [0, 0.28, 0.78, 1] }}
        className="absolute right-[18%] top-[27%] flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-[#102b36] text-[#73d9eb]"
      >
        <Wrench className="h-5 w-5" />
      </motion.span>

      <div className="absolute left-1/2 top-[65%] -translate-x-1/2">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, scale: 0.5, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 1.75, type: "spring" }}
          className="flex items-center gap-2 whitespace-nowrap text-xs font-semibold text-[#79cd9d]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#153c35]"><Check className="h-3.5 w-3.5" /></span>
          Secure fit confirmed
        </motion.div>
      </div>

      <SceneCaption step="01" title="Installed on the main line" body="The monitor sits where water first enters the property." reduceMotion={reduceMotion} />
    </div>
  );
}

function ConnectScene({ reduceMotion }) {
  return (
    <div className="relative h-full" data-installation-scene="connect">
      <div className="absolute left-[16%] top-[43%] -translate-y-1/2 sm:left-[19%]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <H2GODevice compact reduceMotion={reduceMotion} />
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.45 }}
        className="absolute left-[35%] right-[34%] top-[43%] h-px origin-left border-t border-dashed border-[#73d9eb]/65"
      />
      {!reduceMotion && [0, 1, 2].map((index) => (
        <motion.span
          key={index}
          initial={{ left: "35%", opacity: 0 }}
          animate={{ left: "66%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.8, delay: 0.8 + index * 0.5, repeat: Infinity, ease: "linear" }}
          className="absolute top-[43%] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#73d9eb]"
        />
      ))}
      <div className="absolute left-1/2 top-[34%] -translate-x-1/2">
        <motion.span
          initial={reduceMotion ? false : { opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.72 }}
          className="relative flex items-center justify-center text-[#73d9eb]"
        >
          <Wifi className="h-6 w-6" />
          {!reduceMotion && (
            <motion.span
              className="absolute -inset-4 rounded-full border border-[#73d9eb]/35"
              animate={{ scale: [0.7, 1.4], opacity: [0.7, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
            />
          )}
        </motion.span>
      </div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 50, rotate: 3 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute right-[12%] top-[24%] h-[190px] w-[104px] rounded-[16px] border-[5px] border-[#17262c] bg-white p-2 text-[#10181c] shadow-[0_22px_55px_rgba(0,0,0,0.35)] sm:right-[16%] sm:h-[208px] sm:w-[116px]"
      >
        <div className="mx-auto h-1 w-8 rounded-full bg-[#17262c]" />
        <div className="mt-5 flex justify-center"><Droplet className="h-6 w-6 fill-[#18b8d0] text-[#18b8d0]" /></div>
        <p className="mt-2 text-center text-[10px] font-bold">H2GO HOME</p>
        <motion.div
          initial={reduceMotion ? false : { scale: 0.55, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 1.25, type: "spring" }}
          className="mx-auto mt-5 flex h-10 w-10 items-center justify-center rounded-full bg-[#e8f7f1] text-[#147b52]"
        >
          <Check className="h-5 w-5" />
        </motion.div>
        <p className="mt-2 text-center text-[9px] font-semibold text-[#147b52]">CONNECTED</p>
      </motion.div>

      <SceneCaption step="02" title="Connected to your home" body="The app confirms the device and establishes a secure live connection." reduceMotion={reduceMotion} />
    </div>
  );
}

const chartBars = [42, 68, 54, 82, 64, 38, 58];

function MonitorScene({ reduceMotion }) {
  return (
    <div className="relative h-full" data-installation-scene="monitor">
      <div className="absolute left-4 top-[39%] -translate-y-1/2 sm:left-[8%]">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, x: -42 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.55 }}
        >
          <H2GODevice compact reduceMotion={reduceMotion} />
        </motion.div>
      </div>

      <motion.div
        initial={reduceMotion ? false : { scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.42 }}
        className="absolute left-[23%] right-[68%] top-[39%] h-px origin-left border-t border-dashed border-[#73d9eb]/70 sm:left-[21%] sm:right-[72%]"
      />

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 70, scale: 0.96 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-[84px] left-[31%] right-4 top-[70px] overflow-hidden rounded-[6px] border border-white/15 bg-white text-[#10181c] shadow-[0_24px_65px_rgba(0,0,0,0.35)] sm:left-[28%] sm:right-7"
      >
        <div className="flex h-12 items-center justify-between border-b border-black/10 px-3 sm:px-4">
          <div className="flex items-center gap-2">
            <House className="h-4 w-4 text-[#087fbd]" />
            <span className="text-[10px] font-semibold">Home</span>
          </div>
          <span className="flex items-center gap-1.5 text-[9px] font-semibold text-[#147b52]">
            <motion.span
              className="h-1.5 w-1.5 rounded-full bg-[#22a86f]"
              animate={reduceMotion ? undefined : { scale: [1, 1.7, 1], opacity: [1, 0.45, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            LIVE
          </span>
        </div>
        <div className="grid h-[calc(100%-48px)] grid-cols-[0.9fr_1.1fr]">
          <div className="border-r border-black/10 p-3 sm:p-4">
            <p className="text-[9px] font-semibold text-[#6b777c]">TODAY</p>
            <p className="mt-1 text-2xl font-semibold">184 <span className="text-[10px] font-medium text-[#6b777c]">L</span></p>
            <div className="mt-4 flex h-16 items-end gap-1.5 border-b border-black/10 pb-1">
              {chartBars.map((height, index) => (
                <motion.span
                  key={`${height}-${index}`}
                  className={`flex-1 origin-bottom rounded-t-[1px] ${index === 3 ? "bg-[#087fbd]" : "bg-[#9edce5]"}`}
                  style={{ height: `${height}%` }}
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.55 + index * 0.07 }}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-between p-3 sm:p-4">
            <div>
              <p className="text-[9px] font-semibold text-[#6b777c]">MAIN VALVE</p>
              <p className="mt-1 text-base font-semibold">Open</p>
            </div>
            <div className="space-y-2 border-t border-black/10 pt-3 text-[9px]">
              <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1 text-[#6b777c]"><Gauge className="h-3 w-3" /> Flow</span><strong>0.0</strong></div>
              <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-1 text-[#6b777c]"><Thermometer className="h-3 w-3" /> Water</span><strong>18.7 C</strong></div>
            </div>
          </div>
        </div>
      </motion.div>

      <SceneCaption step="03" title="Monitoring the whole home" body="Live usage, pressure and valve status become visible in one place." reduceMotion={reduceMotion} />
    </div>
  );
}

function Scene({ index, reduceMotion }) {
  if (index === 0) return <InstallScene reduceMotion={reduceMotion} />;
  if (index === 1) return <ConnectScene reduceMotion={reduceMotion} />;
  return <MonitorScene reduceMotion={reduceMotion} />;
}

export default function InstallationStory() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduceMotion = usePrefersReducedMotion();
  const [activeStep, setActiveStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const animationPaused = paused || reduceMotion;

  useEffect(() => {
    if (!inView || animationPaused) return undefined;
    const timer = window.setInterval(() => {
      setActiveStep((current) => (current + 1) % steps.length);
    }, STEP_DURATION);
    return () => window.clearInterval(timer);
  }, [inView, animationPaused]);

  return (
    <div ref={ref} data-installation-story>
      <div
        id="installation-stage"
        role="tabpanel"
        aria-labelledby={`installation-tab-${activeStep}`}
        data-installation-stage
        className="relative h-[470px] overflow-hidden rounded-[8px] border border-black/10 bg-[#071c27] text-white shadow-[0_24px_70px_rgba(13,31,38,0.14)] sm:h-[500px]"
      >
        <div className="absolute left-5 right-5 top-5 z-30 flex items-center justify-between sm:left-7 sm:right-7 sm:top-6">
          <div>
            <p className="text-[10px] font-semibold text-white/40">FROM MAIN LINE TO ONLINE</p>
            <p className="mt-1 text-sm font-semibold text-white">{steps[activeStep].number} / 03</p>
          </div>
          <button
            type="button"
            onClick={() => setPaused((current) => !current)}
            disabled={reduceMotion}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-white/55 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={reduceMotion ? "Installation animation disabled by reduced motion" : paused ? "Play installation animation" : "Pause installation animation"}
            title={reduceMotion ? "Animation disabled by reduced motion" : paused ? "Play animation" : "Pause animation"}
          >
            {animationPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
          </button>
        </div>

        <AnimatePresence mode="wait" initial={!reduceMotion}>
          <motion.div
            key={activeStep}
            className="absolute inset-0"
            initial={reduceMotion ? false : { opacity: 0, x: 48, filter: "blur(5px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            exit={reduceMotion ? undefined : { opacity: 0, x: -48, filter: "blur(5px)" }}
            transition={{ duration: reduceMotion ? 0 : 0.48, ease: [0.22, 1, 0.36, 1] }}
          >
            <Scene index={activeStep} reduceMotion={reduceMotion} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div role="tablist" aria-label="Installation stages" className="grid grid-cols-3 border-b border-black/15">
        {steps.map(({ number, title, Icon }, index) => {
          const active = index === activeStep;
          return (
            <button
              key={title}
              type="button"
              role="tab"
              id={`installation-tab-${index}`}
              aria-controls="installation-stage"
              aria-selected={active}
              onClick={() => {
                setActiveStep(index);
                setPaused(true);
              }}
              className="relative min-w-0 border-r border-black/15 px-2 py-4 text-left last:border-r-0 sm:px-4 sm:py-5"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className={`hidden text-[10px] font-semibold sm:block ${active ? "text-[#087fbd]" : "text-[#8b969a]"}`}>{number}</span>
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${active ? "bg-[#e5f6f8] text-[#087fbd]" : "bg-[#f2f4f4] text-[#7b878b]"}`}>
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className={`truncate text-xs font-semibold sm:text-sm ${active ? "text-[#10181c]" : "text-[#7b878b]"}`}>{title}</span>
              </div>
              {active && (
                <motion.span
                  key={`${title}-${animationPaused ? "paused" : "playing"}`}
                  className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[#087fbd]"
                  initial={{ scaleX: animationPaused ? 1 : 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: animationPaused ? 0 : STEP_DURATION / 1000, ease: "linear" }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
