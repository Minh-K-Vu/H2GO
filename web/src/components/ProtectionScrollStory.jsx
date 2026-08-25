import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  Activity,
  Bell,
  Check,
  CircleAlert,
  Droplet,
  Power,
  ShieldCheck,
} from "lucide-react";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const stages = [
  {
    number: "01",
    shortTitle: "Pattern",
    title: "See unusual water use sooner",
    body: "H2GO compares live household flow with the home's normal pattern and makes persistent activity easy to spot.",
    Icon: Activity,
    kicker: "Protection that makes sense",
    facts: [["Live flow", "8.7 L/min"], ["Continuous", "18 min"]],
  },
  {
    number: "02",
    shortTitle: "Alert",
    title: "Get a clear alert when it matters",
    body: "The change becomes a useful notification with enough context to understand what is happening before you respond.",
    Icon: Bell,
    kicker: "Useful context",
    facts: [["Alert", "Delivered"], ["Home status", "Live"]],
  },
  {
    number: "03",
    shortTitle: "Respond",
    title: "Check the home and close the valve",
    body: "Confirm the household status, send the command remotely and watch the main valve stop the flow.",
    Icon: Power,
    kicker: "Remote response",
    facts: [["Main valve", "Closed"], ["Current flow", "0.0 L/min"]],
  },
];

const normalPath = "M 14 168 C 62 156 98 174 142 162 S 224 166 270 154 S 334 166 372 158";
const unusualPath = "M 372 158 C 394 150 402 92 424 78 S 476 82 512 68 S 558 72 586 62";

function PatternScene({ reduceMotion }) {
  return (
    <div data-protection-scene="pattern" className="relative h-full">
      <div className="absolute inset-x-5 bottom-12 top-[72px] sm:inset-x-8 sm:bottom-14 sm:top-[82px]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold text-white/45">LIVE FLOW</p>
            <motion.p
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.4 }}
              className="mt-1 text-3xl font-semibold tabular-nums text-white sm:text-4xl"
            >
              8.7 <span className="text-xs font-medium text-white/45">L/min</span>
            </motion.p>
          </div>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.55 }}
            className="flex items-center gap-2 text-right text-[10px] font-semibold text-[#f3b36e]"
          >
            <CircleAlert className="h-4 w-4" />
            ABOVE EXPECTED RANGE
          </motion.div>
        </div>

        <div className="absolute inset-x-0 bottom-0 top-[72px]">
          <svg viewBox="0 0 600 210" preserveAspectRatio="none" className="h-full w-full" aria-hidden="true">
            {[38, 82, 126, 170].map((y) => (
              <line key={y} x1="8" x2="592" y1={y} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            ))}
            <motion.rect
              x="382"
              y="28"
              width="206"
              height="154"
              fill="rgba(183,91,19,0.1)"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.75 }}
            />
            <path d={normalPath} fill="none" stroke="rgba(115,217,235,0.4)" strokeWidth="2" strokeDasharray="5 7" />
            <motion.path
              d={normalPath}
              fill="none"
              stroke="#73d9eb"
              strokeWidth="4"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.path
              d={unusualPath}
              fill="none"
              stroke="#f3b36e"
              strokeWidth="4"
              strokeLinecap="round"
              initial={reduceMotion ? false : { pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.8, delay: reduceMotion ? 0 : 0.85, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.circle
              r="6"
              fill="#f3b36e"
              animate={reduceMotion ? { cx: 586, cy: 62 } : {
                cx: [14, 142, 270, 372, 424, 512, 586],
                cy: [168, 162, 154, 158, 78, 68, 62],
                opacity: [0, 1, 1, 1, 1, 1, 0],
              }}
              transition={{ duration: reduceMotion ? 0 : 2.8, repeat: reduceMotion ? 0 : Infinity, ease: "linear" }}
            />
            <motion.circle
              cx="424"
              cy="78"
              r="13"
              fill="none"
              stroke="#f3b36e"
              strokeWidth="2"
              animate={reduceMotion ? undefined : { r: [7, 20], opacity: [0.8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[9px] font-medium text-white/35">
            <span>USUAL HOUSEHOLD FLOW</span>
            <span className="text-[#f3b36e]">PERSISTENT ACTIVITY</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompactDevice({ reduceMotion }) {
  return (
    <div className="absolute left-[7%] top-[43%] -translate-y-1/2 sm:left-[12%]">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -28 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.55 }}
        className="relative flex h-[86px] w-[68px] flex-col items-center justify-center border border-white/30 bg-[#edf3f1] text-[#10181c] shadow-[0_18px_45px_rgba(0,0,0,0.28)] sm:h-[104px] sm:w-[82px]"
      >
        <div className="absolute left-1/2 top-0 h-5 w-8 -translate-x-1/2 -translate-y-[70%] bg-[#10181c] sm:h-6 sm:w-10" />
        <motion.span
          className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#22a86f]"
          animate={reduceMotion ? undefined : { opacity: [1, 0.35, 1], scale: [1, 1.25, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        <Droplet className="h-5 w-5 fill-[#18b8d0] text-[#18b8d0] sm:h-6 sm:w-6" />
        <span className="mt-1 text-[9px] font-bold">H2GO</span>
        <span className="mt-0.5 text-[7px] font-semibold text-[#6b777c]">MAIN LINE</span>
      </motion.div>
    </div>
  );
}

function AlertScene({ reduceMotion }) {
  return (
    <div data-protection-scene="alert" className="relative h-full">
      <CompactDevice reduceMotion={reduceMotion} />

      <motion.div
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.35 }}
        className="absolute left-[24%] right-[47%] top-[43%] h-px origin-left border-t border-dashed border-[#73d9eb]/55 sm:left-[27%] sm:right-[44%]"
      />

      {!reduceMotion && [0, 1].map((index) => (
        <motion.span
          key={index}
          initial={{ left: "25%", opacity: 0 }}
          animate={{ left: "54%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.65, delay: 0.7 + index * 0.7, repeat: Infinity, ease: "linear" }}
          className="absolute top-[43%] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#73d9eb]"
        />
      ))}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: 48, rotate: 2 }}
        animate={{ opacity: 1, x: 0, rotate: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.65, delay: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-9 right-[6%] top-[66px] w-[142px] rounded-[20px] border-[6px] border-[#17262c] bg-[#eef2f1] p-2 text-[#10181c] shadow-[0_26px_65px_rgba(0,0,0,0.35)] sm:bottom-12 sm:right-[12%] sm:top-[76px] sm:w-[184px] sm:rounded-[24px] sm:border-[7px] sm:p-3"
      >
        <div className="mx-auto h-1 w-8 rounded-full bg-[#17262c]" />
        <div className="mt-3 flex items-center justify-between px-1 text-[8px] font-semibold text-[#68777c] sm:mt-5 sm:text-[9px]">
          <span>H2GO HOME</span>
          <span>NOW</span>
        </div>

        <motion.div
          data-alert-notification
          initial={reduceMotion ? false : { opacity: 0, y: -42, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : 0.42, type: "spring", stiffness: 150, damping: 17 }}
          className="mt-3 border-l-[3px] border-[#d97a25] bg-white p-2.5 shadow-[0_10px_24px_rgba(16,24,28,0.12)] sm:mt-4 sm:p-3"
        >
          <div className="flex items-start gap-2">
            <motion.span
              animate={reduceMotion ? undefined : { rotate: [0, -12, 10, -8, 0] }}
              transition={{ duration: 0.7, delay: 0.85, repeat: Infinity, repeatDelay: 2.2 }}
              className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#fff1e4] text-[#b75b13] sm:h-7 sm:w-7"
            >
              <Bell className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </motion.span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold sm:text-[11px]">Unusual water use</p>
              <p className="mt-1 text-[8px] leading-3 text-[#68777c] sm:text-[9px] sm:leading-4">Continuous flow for 18 minutes.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.82 }}
          className="mt-3 flex items-center justify-between border-t border-black/10 px-1 pt-3 text-[8px] sm:mt-5 sm:text-[9px]"
        >
          <span className="text-[#68777c]">Live flow</span>
          <strong className="text-[#b75b13]">8.7 L/min</strong>
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : 0.8 }}
        className="absolute bottom-4 left-5 flex items-center gap-2 text-[10px] font-semibold text-[#f3b36e] sm:bottom-6 sm:left-8"
      >
        <CircleAlert className="h-4 w-4" />
        ALERT DELIVERED WITH CONTEXT
      </motion.div>
    </div>
  );
}

function ValveScene({ reduceMotion }) {
  const [closed, setClosed] = useState(false);
  const isClosed = reduceMotion || closed;

  useEffect(() => {
    if (reduceMotion) return undefined;

    const timers = [];
    const queueClose = () => {
      timers.push(window.setTimeout(() => setClosed(true), 1150));
    };

    queueClose();
    const cycle = window.setInterval(() => {
      setClosed(false);
      queueClose();
    }, 4200);

    return () => {
      window.clearInterval(cycle);
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [reduceMotion]);

  return (
    <div data-protection-scene="valve" data-valve-state={isClosed ? "closed" : "open"} className="relative h-full">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, x: -38 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.6 }}
        className="absolute bottom-9 left-[5%] top-[70px] w-[124px] rounded-[18px] border-[5px] border-[#17262c] bg-white p-2.5 text-[#10181c] shadow-[0_24px_60px_rgba(0,0,0,0.32)] sm:bottom-12 sm:left-[9%] sm:top-[78px] sm:w-[164px] sm:rounded-[22px] sm:border-[6px] sm:p-3"
      >
        <div className="mx-auto h-1 w-7 rounded-full bg-[#17262c]" />
        <p className="mt-4 text-[8px] font-semibold text-[#68777c] sm:mt-6 sm:text-[9px]">HOME STATUS</p>
        <motion.div
          initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.4, delay: reduceMotion ? 0 : 0.35, type: "spring" }}
          className="mt-2 flex items-center gap-2 text-[9px] font-semibold text-[#147b52] sm:text-[10px]"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f7f1]"><ShieldCheck className="h-3.5 w-3.5" /></span>
          Home checked
        </motion.div>
        <div className="mt-5 border-t border-black/10 pt-4 sm:mt-7">
          <p className="text-[8px] text-[#68777c] sm:text-[9px]">Main valve</p>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={isClosed ? "closed" : "open"}
              initial={reduceMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -5 }}
              transition={{ duration: reduceMotion ? 0 : 0.22 }}
              className={`mt-1 text-lg font-semibold sm:text-xl ${isClosed ? "text-[#147b52]" : "text-[#10181c]"}`}
            >
              {isClosed ? "Closed" : "Open"}
            </motion.p>
          </AnimatePresence>
        </div>
        <motion.div
          animate={{ backgroundColor: isClosed ? "#147b52" : "#10181c" }}
          transition={{ duration: reduceMotion ? 0 : 0.35 }}
          className="absolute bottom-3 left-2.5 right-2.5 flex h-9 items-center justify-center gap-1.5 rounded-[4px] text-[9px] font-semibold text-white sm:bottom-4 sm:left-3 sm:right-3 sm:h-10 sm:text-[10px]"
        >
          {isClosed ? <Check className="h-3.5 w-3.5" /> : <Power className="h-3.5 w-3.5" />}
          {isClosed ? "Valve closed" : "Close valve"}
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduceMotion ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.4 }}
        className="absolute left-[39%] right-[34%] top-[37%] h-px origin-left border-t border-dashed border-[#73d9eb]/55 sm:left-[37%] sm:right-[36%]"
      />
      {!reduceMotion && !isClosed && (
        <motion.span
          initial={{ left: "39%", opacity: 0 }}
          animate={{ left: "66%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[37%] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#73d9eb]"
        />
      )}

      <div className="absolute right-0 top-[57%] h-12 w-[57%] -translate-y-1/2 sm:w-[59%]">
        <div className="absolute left-0 top-2 h-8 w-[42%] border-y border-[#9badb2] bg-[#53676e]" />
        <div className="absolute right-0 top-2 h-8 w-[42%] border-y border-[#9badb2] bg-[#53676e]" />

        <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ borderColor: isClosed ? "#79cd9d" : "#73d9eb" }}
            transition={{ duration: reduceMotion ? 0 : 0.3 }}
            className="relative flex h-16 w-16 items-center justify-center rounded-full border-[3px] bg-[#102b36] sm:h-20 sm:w-20"
          >
            <motion.span
              animate={{ rotate: isClosed ? -90 : 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="absolute h-2 w-16 rounded-full bg-[#eef3f1] sm:w-20"
            />
            <span className="relative z-10 h-5 w-5 rounded-full bg-[#17262c] sm:h-6 sm:w-6" />
          </motion.div>
        </div>

        <AnimatePresence>
          {!isClosed && !reduceMotion && [0, 1, 2].map((index) => (
            <motion.span
              key={index}
              initial={{ left: "1%", opacity: 0 }}
              animate={{ left: "99%", opacity: [0, 1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.55, delay: index * 0.4, repeat: Infinity, ease: "linear" }}
              className="absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-[#73d9eb]"
            />
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isClosed && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.55, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, scale: 0.7 }}
            transition={{ duration: reduceMotion ? 0 : 0.4, type: "spring", stiffness: 170, damping: 16 }}
            className="absolute bottom-5 right-[6%] flex items-center gap-2 text-[10px] font-semibold text-[#79cd9d] sm:bottom-7 sm:right-[10%]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#153c35]"><Check className="h-3.5 w-3.5" /></span>
            FLOW STOPPED
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProtectionScene({ index, reduceMotion }) {
  if (index === 0) return <PatternScene reduceMotion={reduceMotion} />;
  if (index === 1) return <AlertScene reduceMotion={reduceMotion} />;
  return <ValveScene reduceMotion={reduceMotion} />;
}

function ProtectionChapter({ stage, index, reduceMotion }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { amount: 0.2, margin: "-5% 0px -5% 0px" });
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 88%", "end 12%"],
  });
  const progress = useSpring(scrollYProgress, { stiffness: 95, damping: 25, mass: 0.28 });
  const opacity = useTransform(progress, [0, 0.16, 0.82, 1], [0.06, 1, 1, 0.08]);
  const copyY = useTransform(progress, [0, 0.18, 0.82, 1], [72, 0, 0, -64]);
  const visualY = useTransform(progress, [0, 0.2, 0.8, 1], [90, 0, 0, -82]);
  const copyX = useTransform(progress, [0, 0.2, 0.82, 1], [index % 2 === 0 ? -24 : 24, 0, 0, index % 2 === 0 ? 14 : -14]);
  const visualX = useTransform(progress, [0, 0.2, 0.82, 1], [index % 2 === 0 ? 32 : -32, 0, 0, index % 2 === 0 ? -18 : 18]);
  const visualScale = useTransform(progress, [0, 0.2, 0.8, 1], [0.965, 1, 1, 0.975]);
  const Icon = stage.Icon;
  const reverse = index % 2 === 1;
  const sceneName = stage.shortTitle.toLowerCase();

  return (
    <section
      ref={sectionRef}
      data-protection-chapter={sceneName}
      className="relative flex min-h-[78svh] items-center overflow-hidden py-10 sm:py-12 lg:min-h-[80svh] lg:py-14"
    >
      <div className={`mx-auto grid w-full max-w-[1240px] gap-10 px-5 sm:px-8 lg:items-center lg:gap-16 lg:px-10 ${reverse ? "lg:grid-cols-[1.25fr_0.75fr]" : "lg:grid-cols-[0.75fr_1.25fr]"}`}>
        <motion.div
          data-protection-copy={sceneName}
          style={reduceMotion ? undefined : { opacity, x: copyX, y: copyY }}
          className={`min-w-0 ${reverse ? "lg:order-2" : "lg:order-1"}`}
        >
          <p className="text-sm font-semibold text-[#087fbd]">{stage.kicker}</p>
          <div className="mt-5 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e5f6f8] text-[#087fbd]">
              <Icon className="h-4 w-4" />
            </span>
            <span className="text-xs font-semibold text-[#788489]">STEP {stage.number} / 03</span>
          </div>
          <h2 className="mt-5 max-w-[560px] text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[52px]">
            {stage.title}
          </h2>
          <p className="mt-6 max-w-[520px] text-lg leading-8 text-[#5a686d]">{stage.body}</p>

          <dl className="mt-8 grid max-w-[520px] grid-cols-2 border-y border-black/15">
            {stage.facts.map(([label, value], factIndex) => (
              <div key={label} className={`py-4 ${factIndex === 0 ? "border-r border-black/15 pr-4" : "pl-4"}`}>
                <dt className="text-[10px] font-semibold text-[#7c888c]">{label.toUpperCase()}</dt>
                <dd className="mt-1 text-base font-semibold text-[#10181c]">{value}</dd>
              </div>
            ))}
          </dl>
        </motion.div>

        <motion.div
          data-protection-visual={sceneName}
          style={reduceMotion ? undefined : { opacity, x: visualX, y: visualY, scale: visualScale }}
          className={`min-w-0 ${reverse ? "lg:order-1" : "lg:order-2"}`}
        >
          <div
            data-protection-stage={sceneName}
            className="relative h-[320px] overflow-hidden rounded-[8px] border border-black/10 bg-[#071c27] text-white shadow-[0_26px_75px_rgba(13,31,38,0.16)] sm:h-[440px] lg:h-[560px]"
            role="img"
            aria-label={stage.title}
          >
            <div className="absolute left-5 right-5 top-5 z-30 flex items-center justify-between sm:left-8 sm:right-8 sm:top-7">
              <div>
                <p className="text-[10px] font-semibold text-white/40">LIVE PROTECTION</p>
                <p className="mt-1 text-sm font-semibold text-white">{stage.number} / 03</p>
              </div>
              <span className={`flex h-9 w-9 items-center justify-center rounded-full border ${index === 0 ? "border-[#f3b36e]/40 text-[#f3b36e]" : index === 1 ? "border-[#73d9eb]/35 text-[#73d9eb]" : "border-[#79cd9d]/40 text-[#79cd9d]"}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>

            <AnimatePresence initial={false}>
              {(inView || reduceMotion) && (
                <motion.div
                  key={sceneName}
                  className="absolute inset-0"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.985, filter: "blur(5px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.99, filter: "blur(4px)" }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProtectionScene index={index} reduceMotion={reduceMotion} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default function ProtectionScrollStory() {
  const storyRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: storyRef,
    offset: ["start start", "end end"],
  });
  const backgroundColor = useTransform(
    scrollYProgress,
    [0, 0.38, 0.62, 1],
    ["#ffffff", "#ffffff", "#f2f5f5", "#e8edeb"],
  );

  return (
    <motion.div
      ref={storyRef}
      data-protection-story
      className="overflow-hidden bg-white"
      style={{ backgroundColor: reduceMotion ? "#e8edeb" : backgroundColor }}
    >
      {stages.map((stage, index) => (
        <ProtectionChapter key={stage.number} stage={stage} index={index} reduceMotion={reduceMotion} />
      ))}
    </motion.div>
  );
}
