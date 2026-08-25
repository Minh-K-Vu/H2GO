import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Bath, Droplet, Gauge, Sprout, Thermometer, Utensils, Waves } from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const zones = [
  {
    id: "kitchen",
    label: "Kitchen",
    reading: "2.8 L/min",
    Icon: Utensils,
    color: "#73d9eb",
    desktopPath: "M 360 330 H 520 V 160 H 810",
    desktopX: [360, 520, 520, 810],
    desktopY: [330, 330, 160, 160],
    desktopTimes: [0, 0.38, 0.62, 1],
    desktopPosition: { left: "83%", top: "28.6%" },
    mobilePath: "M 180 245 V 325 H 74",
    mobileX: [180, 180, 74],
    mobileY: [245, 325, 325],
    mobileTimes: [0, 0.55, 1],
    mobilePosition: "left",
    mobileTop: "52.5%",
  },
  {
    id: "bathroom",
    label: "Bathroom",
    reading: "3.4 L/min",
    Icon: Bath,
    color: "#69a9ee",
    desktopPath: "M 360 330 H 620 V 310 H 810",
    desktopX: [360, 620, 620, 810],
    desktopY: [330, 330, 310, 310],
    desktopTimes: [0, 0.5, 0.58, 1],
    desktopPosition: { left: "83%", top: "55.4%" },
    mobilePath: "M 180 245 V 415 H 286",
    mobileX: [180, 180, 286],
    mobileY: [245, 415, 415],
    mobileTimes: [0, 0.62, 1],
    mobilePosition: "right",
    mobileTop: "67%",
  },
  {
    id: "garden",
    label: "Garden",
    reading: "0.7 L/min",
    Icon: Sprout,
    color: "#79cd9d",
    desktopPath: "M 360 330 H 550 V 460 H 810",
    desktopX: [360, 550, 550, 810],
    desktopY: [330, 330, 460, 460],
    desktopTimes: [0, 0.38, 0.62, 1],
    desktopPosition: { left: "83%", top: "82.1%" },
    mobilePath: "M 180 245 V 505 H 74",
    mobileX: [180, 180, 74],
    mobileY: [245, 505, 505],
    mobileTimes: [0, 0.72, 1],
    mobilePosition: "left",
    mobileTop: "81.5%",
  },
];

const flowSamples = ["6.2", "6.4", "6.1", "6.3"];

function DeviceNode({ compact = false, reduceMotion }) {
  return (
    <div className="relative" role="img" aria-label="H2GO monitor installed on the main water line">
      <motion.span
        className="absolute -inset-5 rounded-full border border-[#73d9eb]/45"
        animate={reduceMotion ? undefined : { scale: [0.8, 1.25], opacity: [0.6, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
        aria-hidden="true"
      />
      <div className={`relative flex flex-col items-center justify-center border border-white/30 bg-[#eef3f1] text-[#0d1b20] shadow-[0_20px_60px_rgba(0,0,0,0.35)] ${compact ? "h-[112px] w-[92px]" : "h-[138px] w-[116px]"}`}>
        <div className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[72%] rounded-t-[6px] bg-[#10181c] ${compact ? "h-7 w-10" : "h-9 w-12"}`} />
        <motion.span
          className="absolute right-3 top-3 h-2 w-2 rounded-full bg-[#22a86f]"
          animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 1.35, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <Droplet className={`fill-[#18b8d0] text-[#18b8d0] ${compact ? "h-7 w-7" : "h-9 w-9"}`} />
        <span className="mt-2 text-xs font-bold">H2GO</span>
        <span className="mt-1 text-[9px] font-semibold text-[#607078]">MAIN LINE</span>
      </div>
    </div>
  );
}

function ZoneNode({ zone, active, onSelect, reduceMotion, mobile = false }) {
  const node = (
    <motion.button
      type="button"
      onClick={onSelect}
      animate={{ opacity: active ? 1 : 0.52, x: active && !reduceMotion ? (mobile && zone.mobilePosition === "right" ? -5 : 5) : 0 }}
      whileHover={{ opacity: 1, scale: 1.03 }}
      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative flex w-[150px] items-center gap-3 text-left ${mobile && zone.mobilePosition === "right" ? "flex-row-reverse text-right" : ""}`}
      aria-label={`Show ${zone.label.toLowerCase()} water flow`}
      aria-pressed={active}
      data-active={active}
    >
      <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/25 bg-[#0b2631]">
        {active && (
          <motion.span
            className="absolute -inset-2 rounded-full border"
            style={{ borderColor: zone.color }}
            initial={reduceMotion ? false : { opacity: 0.7, scale: 0.7 }}
            animate={reduceMotion ? { opacity: 0.5, scale: 1 } : { opacity: 0, scale: 1.35 }}
            transition={{ duration: reduceMotion ? 0 : 1.5, repeat: reduceMotion ? 0 : Infinity, ease: "easeOut" }}
            aria-hidden="true"
          />
        )}
        <zone.Icon className="h-5 w-5" style={{ color: zone.color }} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-white">{zone.label}</span>
        <span className="mt-1 block text-xs tabular-nums" style={{ color: zone.color }}>{zone.reading}</span>
      </span>
    </motion.button>
  );

  if (mobile) {
    return (
      <div
        className={`absolute z-20 ${zone.mobilePosition === "right" ? "right-4" : "left-4"}`}
        style={{ top: zone.mobileTop }}
      >
        {node}
      </div>
    );
  }

  return (
    <div
      className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
      style={zone.desktopPosition}
    >
      {node}
    </div>
  );
}

function FlowPath({ zone, active, reduceMotion, mobile = false }) {
  const path = mobile ? zone.mobilePath : zone.desktopPath;
  const x = mobile ? zone.mobileX : zone.desktopX;
  const y = mobile ? zone.mobileY : zone.desktopY;
  const times = mobile ? zone.mobileTimes : zone.desktopTimes;
  const opacity = x.length === 3 ? [0, 1, 0] : [0, 1, 1, 0];

  return (
    <>
      <path d={path} fill="none" stroke="rgba(255,255,255,0.13)" strokeWidth="13" strokeLinecap="round" />
      <motion.path
        d={path}
        fill="none"
        stroke={zone.color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray="9 17"
        initial={{ opacity: active ? 0.95 : 0.25, strokeDashoffset: 0 }}
        animate={reduceMotion ? { opacity: active ? 0.9 : 0.24 } : { strokeDashoffset: [0, -52], opacity: active ? 0.95 : 0.25 }}
        transition={{
          strokeDashoffset: { duration: 1.35, repeat: Infinity, ease: "linear" },
          opacity: { duration: 0.4 },
        }}
      />
      {active && (
        <motion.circle
          key={`${mobile ? "mobile" : "desktop"}-${zone.id}`}
          r="6"
          fill={zone.color}
          initial={{ opacity: 0, cx: x[0], cy: y[0] }}
          animate={reduceMotion ? { opacity: 1, cx: x[x.length - 1], cy: y[y.length - 1] } : { opacity, cx: x, cy: y }}
          transition={reduceMotion ? { duration: 0 } : { duration: 2.1, repeat: Infinity, ease: "linear", times }}
        />
      )}
    </>
  );
}

function ActiveReading({ activeZone, reduceMotion }) {
  return (
    <div className="flex min-w-[150px] items-center justify-end gap-3 text-right">
      <span className="relative flex h-2 w-2 rounded-full bg-[#22a86f]">
        <motion.span
          className="absolute inset-0 rounded-full bg-[#22a86f]"
          animate={reduceMotion ? undefined : { scale: [1, 2.2], opacity: [0.7, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
        />
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={activeZone.id}
          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.28 }}
        >
          <p className="text-[10px] font-semibold text-white/45">READING {activeZone.label.toUpperCase()}</p>
          <p className="mt-1 text-sm font-semibold tabular-nums" style={{ color: activeZone.color }}>{activeZone.reading}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TelemetryRail({ flow }) {
  const readings = [
    { label: "Whole-home flow", value: `${flow} L/min`, Icon: Waves },
    { label: "Line pressure", value: "3.1 bar", Icon: Gauge },
    { label: "Water temperature", value: "18.7 C", Icon: Thermometer },
  ];

  return (
    <div className="grid grid-cols-3 divide-x divide-white/15 border-t border-white/15">
      {readings.map(({ label, value, Icon }) => (
        <div key={label} className="min-w-0 px-3 py-5 sm:flex sm:items-center sm:gap-3 sm:px-6">
          <Icon className="h-4 w-4 shrink-0 text-[#73d9eb]" />
          <div className="mt-2 min-w-0 sm:mt-0">
            <p className="hidden text-[10px] font-semibold text-white/40 sm:block">{label}</p>
            <p className="truncate text-xs font-semibold text-white sm:mt-1 sm:text-sm">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function WholeHomeFlowMap() {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.25 });
  const reduceMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [flowIndex, setFlowIndex] = useState(0);
  const activeZone = zones[activeIndex];

  useEffect(() => {
    if (!inView || reduceMotion) return undefined;

    const zoneTimer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % zones.length);
    }, 2600);
    const flowTimer = window.setInterval(() => {
      setFlowIndex((current) => (current + 1) % flowSamples.length);
    }, 1200);

    return () => {
      window.clearInterval(zoneTimer);
      window.clearInterval(flowTimer);
    };
  }, [inView, reduceMotion]);

  return (
    <div ref={ref} data-whole-home-map className="border-y border-white/15">
      <div data-flow-map-layout="desktop" className="relative hidden h-[520px] overflow-hidden md:block">
        <div className="absolute left-6 top-6 z-20">
          <p className="text-[10px] font-semibold text-white/40">PROPERTY MAIN</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={flowSamples[flowIndex]}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1 text-sm font-semibold text-[#73d9eb]"
            >
              {flowSamples[flowIndex]} L/min
            </motion.p>
          </AnimatePresence>
        </div>
        <div className="absolute right-6 top-6 z-20"><ActiveReading activeZone={activeZone} reduceMotion={reduceMotion} /></div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 560" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 425 160 L 660 55 L 900 160 V 490 H 425 Z" fill="#0a232d" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          <path d="M 425 315 H 900 M 650 160 V 490 M 770 160 V 490" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="2" />
          {!reduceMotion && (
            <motion.rect
              x="430"
              y="56"
              width="2"
              height="433"
              fill="#73d9eb"
              animate={{ x: [430, 896], opacity: [0, 0.35, 0] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: "linear" }}
            />
          )}

          <path d="M 0 330 H 360" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="17" strokeLinecap="round" />
          <motion.path
            d="M 0 330 H 360"
            fill="none"
            stroke="#73d9eb"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="10 18"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -56] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          {!reduceMotion && (
            <motion.circle
              r="6"
              fill="#73d9eb"
              animate={{ cx: [10, 125, 245, 355], cy: [330, 330, 330, 330], opacity: [0, 1, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          )}

          {zones.map((zone, index) => (
            <FlowPath key={zone.id} zone={zone} active={index === activeIndex} reduceMotion={reduceMotion} />
          ))}
        </svg>

        <div className="absolute left-[36%] top-[59%] z-20 -translate-x-1/2 -translate-y-1/2">
          <DeviceNode reduceMotion={reduceMotion} />
        </div>
        {zones.map((zone, index) => (
          <ZoneNode key={zone.id} zone={zone} active={index === activeIndex} onSelect={() => setActiveIndex(index)} reduceMotion={reduceMotion} />
        ))}
      </div>

      <div data-flow-map-layout="mobile" className="relative h-[620px] overflow-hidden md:hidden">
        <div className="absolute left-4 top-5 z-20">
          <p className="text-[9px] font-semibold text-white/40">PROPERTY MAIN</p>
          <p className="mt-1 text-xs font-semibold text-[#73d9eb]">{flowSamples[flowIndex]} L/min</p>
        </div>
        <div className="absolute right-4 top-5 z-20"><ActiveReading activeZone={activeZone} reduceMotion={reduceMotion} /></div>

        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 360 620" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 46 220 L 180 112 L 314 220 V 570 H 46 Z" fill="#0a232d" stroke="rgba(255,255,255,0.14)" strokeWidth="2" />
          <path d="M 46 392 H 314 M 180 220 V 570" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="2" />
          <path d="M 180 0 V 245" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="15" strokeLinecap="round" />
          <motion.path
            d="M 180 0 V 245"
            fill="none"
            stroke="#73d9eb"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="9 17"
            animate={reduceMotion ? undefined : { strokeDashoffset: [0, -52] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
          />
          {zones.map((zone, index) => (
            <FlowPath key={`mobile-${zone.id}`} zone={zone} active={index === activeIndex} reduceMotion={reduceMotion} mobile />
          ))}
        </svg>

        <div className="absolute left-1/2 top-[32%] z-20 -translate-x-1/2 -translate-y-1/2">
          <DeviceNode compact reduceMotion={reduceMotion} />
        </div>
        {zones.map((zone, index) => (
          <ZoneNode key={`mobile-${zone.id}`} zone={zone} active={index === activeIndex} onSelect={() => setActiveIndex(index)} reduceMotion={reduceMotion} mobile />
        ))}
      </div>

      <TelemetryRail flow={flowSamples[flowIndex]} />
    </div>
  );
}
