import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import {
  ArrowRight,
  CircleAlert,
  Droplet,
  Pause,
  Play,
  Power,
  ShieldCheck,
} from "lucide-react";
import InstallationStory from "@/components/InstallationStory";
import ProductHeroScene from "@/components/ProductHeroScene";
import ProtectionScrollStory from "@/components/ProtectionScrollStory";
import WholeHomeFlowMap from "@/components/WholeHomeFlowMap";
import usePrefersReducedMotion from "@/hooks/usePrefersReducedMotion";

const week = [62, 84, 58, 92, 76, 48, 55];

const demoStages = [
  {
    label: "Monitoring",
    title: "Water moving normally",
    detail: "Live flow 6.2 L/min",
    tone: "text-[#087fbd]",
  },
  {
    label: "Detected",
    title: "Unusual flow found",
    detail: "Continuous use for 18 minutes",
    tone: "text-[#b75b13]",
  },
  {
    label: "Responded",
    title: "Main valve closed",
    detail: "Flow reduced to 0.0 L/min",
    tone: "text-[#147b52]",
  },
];

const leakResponseSteps = [
  ["01", "Flow continues beyond the usual pattern"],
  ["02", "H2GO surfaces a clear household alert"],
  ["03", "You check the home and control the valve"],
];

function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 94%", "end 6%"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.25 });
  const enterEnd = Math.min(0.3, 0.16 + delay * 0.8);
  const opacity = useTransform(smoothProgress, [0, enterEnd, 0.82, 1], [0, 1, 1, 0.32]);
  const y = useTransform(smoothProgress, [0, enterEnd, 0.82, 1], [42, 0, 0, -28]);
  const scale = useTransform(smoothProgress, [0, enterEnd, 0.82, 1], [0.98, 1, 1, 0.99]);

  return (
    <motion.div
      ref={ref}
      data-scroll-reveal
      style={reduceMotion ? undefined : { opacity, y, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, light = false }) {
  return (
    <p className={`text-sm font-semibold ${light ? "text-[#73d9eb]" : "text-[#087fbd]"}`}>
      {children}
    </p>
  );
}

function ScrollTrace() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 130, damping: 28, mass: 0.25 });

  return (
    <motion.div
      data-scroll-trace
      className="pointer-events-none fixed inset-x-0 top-[102px] z-[60] h-[2px] origin-left bg-[#18b8d0] motion-reduce:hidden"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
}

function ScrollTransition({ from, to }) {
  const ref = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 95, damping: 24, mass: 0.3 });
  const reveal = useTransform(smoothProgress, [0.08, 0.84], [0, 1]);

  return (
    <div
      ref={ref}
      data-scroll-transition
      className="relative h-16 overflow-hidden sm:h-20"
      style={{ backgroundColor: from }}
      aria-hidden="true"
    >
      <motion.div
        data-transition-fill
        className="absolute inset-0 origin-bottom"
        style={{ backgroundColor: to, scaleY: reduceMotion ? 1 : reveal }}
      />
    </div>
  );
}

function CountUp({ to }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.7 });
  const reduceMotion = usePrefersReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return undefined;
    if (reduceMotion) {
      setValue(to);
      return undefined;
    }

    let frame;
    let start;
    const duration = 1250;
    const tick = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(to * eased));
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [inView, reduceMotion, to]);

  return <span ref={ref} className="inline-block min-w-[3ch] tabular-nums">{value}</span>;
}

function AppPreview() {
  const reduceMotion = usePrefersReducedMotion();

  return (
    <div data-app-preview className="overflow-hidden rounded-[8px] border border-black/10 bg-white shadow-[0_24px_70px_rgba(13,31,38,0.12)]">
      <div className="flex h-16 items-center justify-between border-b border-black/10 px-5 sm:px-7">
        <div className="flex items-center gap-3">
          <motion.span
            animate={reduceMotion ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="flex h-6 w-6 items-center justify-center"
          >
            <Droplet className="h-5 w-5 fill-[#18b8d0] text-[#18b8d0]" />
          </motion.span>
          <div>
            <p className="text-sm font-semibold text-[#10181c]">Home</p>
            <p className="mt-0.5 text-xs text-[#6b777c]">Updated just now</p>
          </div>
        </div>
        <span className="flex items-center gap-2 text-xs font-semibold text-[#147b52]">
          <motion.span
            className="h-2 w-2 rounded-full bg-[#22a86f]"
            animate={reduceMotion ? undefined : { scale: [1, 1.7, 1], opacity: [1, 0.45, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          />
          Protected
        </span>
      </div>

      <div className="grid md:grid-cols-[1.4fr_0.8fr]">
        <div className="border-b border-black/10 p-5 sm:p-7 md:border-b-0 md:border-r">
          <p className="text-xs font-semibold text-[#6b777c]">Water used today</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-5xl font-semibold leading-none text-[#10181c]"><CountUp to={184} /></span>
            <span className="pb-1 text-sm text-[#6b777c]">litres</span>
          </div>
          <div className="relative mt-8 flex h-40 items-end gap-3 overflow-hidden border-b border-black/10 pb-3 sm:gap-5">
            <motion.span
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 top-0 z-10 w-px bg-[#087fbd]/35"
              animate={reduceMotion ? { left: "55%" } : { left: ["0%", "100%"] }}
              transition={reduceMotion ? { duration: 0 } : { duration: 4, repeat: Infinity, ease: "linear" }}
            />
            {week.map((height, index) => (
              <div key={`${height}-${index}`} className="flex h-full flex-1 items-end">
                <motion.div
                  className={`origin-bottom w-full rounded-t-[2px] ${index === 3 ? "bg-[#087fbd]" : "bg-[#9edce5]"}`}
                  style={{ height: `${height}%` }}
                  initial={reduceMotion ? false : { scaleY: 0 }}
                  whileInView={reduceMotion ? undefined : { scaleY: 1 }}
                  viewport={{ once: true, amount: 0.6 }}
                  transition={{ duration: 0.7, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            ))}
          </div>
          <div className="mt-3 flex justify-between text-[11px] text-[#7b8589]">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
        </div>

        <div className="flex min-h-[310px] flex-col justify-between p-5 sm:p-7">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-[#6b777c]">Main valve</p>
              <p className="mt-2 text-2xl font-semibold text-[#10181c]">Open</p>
            </div>
            <motion.span
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e8f7f1] text-[#147b52]"
              animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              <ShieldCheck className="h-5 w-5" />
            </motion.span>
          </div>

          <div className="border-y border-black/10 py-5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6b777c]">Current flow</span>
              <span className="font-semibold text-[#10181c]">0.0 L/min</span>
            </div>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-[#6b777c]">Water pressure</span>
              <span className="font-semibold text-[#10181c]">3.1 bar</span>
            </div>
          </div>

          <motion.div
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#10181c] px-5 text-sm font-semibold text-white"
          >
            <Power className="h-4 w-4" />
            Valve control
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function LeakVideoStory() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const [paused, setPaused] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const videoY = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const videoScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.08, 1.04, 1.08]);

  useEffect(() => {
    if (!reduceMotion || !videoRef.current) return;
    videoRef.current.pause();
    setPaused(true);
  }, [reduceMotion]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setPaused(false);
    } else {
      video.pause();
      setPaused(true);
    }
  };

  const updateVideoProgress = (event) => {
    const { currentTime, duration } = event.currentTarget;
    if (!duration) return;

    const progress = currentTime / duration;
    setVideoProgress(progress * 100);
    setActiveStep(Math.min(leakResponseSteps.length - 1, Math.floor(progress * leakResponseSteps.length)));
  };

  return (
    <section ref={sectionRef} data-leak-story className="grid overflow-hidden bg-[#071c27] text-white lg:grid-cols-[1.16fr_0.84fr]">
      <div className="relative min-h-[440px] overflow-hidden sm:min-h-[580px] lg:min-h-[720px]">
        <motion.video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-cover"
          style={reduceMotion ? undefined : { y: videoY, scale: videoScale }}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/videos/water-leak-poster.jpg"
          onTimeUpdate={updateVideoProgress}
          onPlay={() => setPaused(false)}
          onPause={() => setPaused(true)}
          aria-label="A close-up video of water dripping from a household tap"
        >
          <source src="/videos/water-leak-faucet.mp4" type="video/mp4" />
        </motion.video>

        <AnimatePresence>
          {activeStep >= 1 && (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-5 top-5 max-w-[250px] border-l-4 border-[#f59e42] bg-white px-4 py-3 text-[#10181c] shadow-lg sm:right-8 sm:top-8"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <CircleAlert className="h-4 w-4 text-[#b75b13]" />
                Unusual flow detected
              </div>
              <p className="mt-1 pl-6 text-xs text-[#667277]">Continuous use for 18 minutes</p>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          onClick={togglePlayback}
          className="absolute bottom-5 left-5 flex h-11 w-11 items-center justify-center rounded-full bg-black/65 text-white backdrop-blur-sm transition-colors hover:bg-black/85 sm:bottom-8 sm:left-8"
          aria-label={paused ? "Play leak footage" : "Pause leak footage"}
          title={paused ? "Play video" : "Pause video"}
        >
          {paused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4 fill-current" />}
        </button>

        <div className="absolute inset-x-0 bottom-0 h-1 bg-white/15" aria-hidden="true">
          <motion.div
            className="h-full bg-[#73d9eb]"
            animate={{ width: `${videoProgress}%` }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: "linear" }}
          />
        </div>
      </div>

      <div className="flex items-center px-5 py-16 sm:px-10 sm:py-20 lg:px-14 lg:py-24 xl:px-20">
        <Reveal className="max-w-[520px]">
          <Eyebrow light>See the change while it is small</Eyebrow>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[54px]">
            A slow leak should not become a surprise.
          </h2>
          <p className="mt-6 text-lg leading-8 text-white/65">
            Persistent flow is easy to miss at the tap. H2GO keeps watching at the main line and brings the change to your attention.
          </p>
          <div className="mt-9 border-t border-white/20">
            {leakResponseSteps.map(([number, text], index) => (
              <motion.div
                key={number}
                data-video-timeline-step={index}
                data-active={index === activeStep}
                animate={{ opacity: index === activeStep || reduceMotion ? 1 : 0.48, x: index === activeStep && !reduceMotion ? 6 : 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="relative grid grid-cols-[36px_1fr] gap-3 border-b border-white/20 py-4 pl-3 text-sm"
              >
                <motion.span
                  className="absolute inset-y-3 left-0 w-[2px] origin-center bg-[#73d9eb]"
                  animate={{ scaleY: index === activeStep ? 1 : 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.3 }}
                  aria-hidden="true"
                />
                <span className={index === activeStep ? "text-[#73d9eb]" : "text-white/55"}>{number}</span>
                <span className="font-medium">{text}</span>
              </motion.div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Home() {
  const reduceMotion = usePrefersReducedMotion();
  const [demoPhase, setDemoPhase] = useState(0);
  const [demoPaused, setDemoPaused] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);
  const activeStage = demoStages[demoPhase];

  useEffect(() => {
    if (reduceMotion) setDemoPaused(true);
  }, [reduceMotion]);

  useEffect(() => {
    if (demoPaused) return undefined;
    const interval = window.setInterval(() => {
      setDemoPhase((current) => (current + 1) % demoStages.length);
    }, 3600);
    return () => window.clearInterval(interval);
  }, [demoPaused]);

  return (
    <div className="h2-marketing overflow-x-clip bg-white text-[#10181c]">
      <ScrollTrace />
      <section className="h2-product-hero relative flex min-h-[780px] items-end overflow-hidden pt-[104px] md:min-h-[700px] lg:h-[calc(100svh-44px)] lg:max-h-[880px]">
        <ProductHeroScene
          phase={demoPhase}
          paused={demoPaused}
          onReady={() => setSceneReady(true)}
        />

        <div
          data-desktop-demo-control
          className={`absolute right-5 top-[126px] z-20 hidden w-[calc(100%-40px)] max-w-[310px] border border-black/10 bg-white/90 p-4 shadow-[0_14px_40px_rgba(16,24,28,0.1)] backdrop-blur-md transition-opacity duration-500 md:block md:right-8 md:top-[130px] lg:bottom-12 lg:right-12 lg:top-auto ${sceneReady ? "opacity-100" : "opacity-0"}`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase text-[#778287]">Live product demo</p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={`desktop-${demoPhase}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={{ duration: reduceMotion ? 0 : 0.28 }}
                  className="min-h-[68px]"
                >
                  <p className={`mt-2 text-sm font-semibold ${activeStage.tone}`}>{activeStage.label}</p>
                  <p className="mt-1 font-semibold text-[#10181c]">{activeStage.title}</p>
                  <p className="mt-1 text-xs text-[#667277]">{activeStage.detail}</p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              type="button"
              onClick={() => setDemoPaused((current) => !current)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/15 text-[#10181c] hover:border-black/40"
              aria-label={demoPaused ? "Play product animation" : "Pause product animation"}
              title={demoPaused ? "Play animation" : "Pause animation"}
            >
              {demoPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
            </button>
          </div>
          <div className="mt-4 flex gap-2">
            {demoStages.map((stage, index) => (
              <button
                key={stage.label}
                type="button"
                onClick={() => {
                  setDemoPhase(index);
                  setDemoPaused(true);
                }}
                className="relative h-1 flex-1 overflow-hidden bg-black/12"
                aria-label={`Show ${stage.label.toLowerCase()} stage`}
                aria-current={index === demoPhase ? "step" : undefined}
              >
                {index === demoPhase && (
                  <motion.span
                    key={`${stage.label}-${demoPaused ? "paused" : "playing"}`}
                    className="absolute inset-0 origin-left bg-[#087fbd]"
                    initial={{ scaleX: demoPaused || reduceMotion ? 1 : 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: demoPaused || reduceMotion ? 0 : 3.6, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 mx-auto w-full max-w-[1320px] px-5 pb-12 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20"
        >
          <div className="max-w-[570px]">
            <div data-mobile-demo-control className="mb-5 border-b border-black/15 pb-4 md:hidden">
              <div className="flex items-center justify-between gap-3">
                <div className="min-h-[40px] min-w-0 flex-1">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={`mobile-${demoPhase}`}
                      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                      transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    >
                      <p className={`text-xs font-semibold ${activeStage.tone}`}>{activeStage.label}</p>
                      <p className="mt-1 truncate text-sm font-semibold">{activeStage.title}</p>
                    </motion.div>
                  </AnimatePresence>
                </div>
                <button
                  type="button"
                  onClick={() => setDemoPaused((current) => !current)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-black/20"
                  aria-label={demoPaused ? "Play product animation" : "Pause product animation"}
                >
                  {demoPaused ? <Play className="h-3.5 w-3.5 fill-current" /> : <Pause className="h-3.5 w-3.5 fill-current" />}
                </button>
              </div>
              <div className="mt-3 flex gap-2">
                {demoStages.map((stage, index) => (
                  <button
                    key={`mobile-${stage.label}`}
                    type="button"
                    onClick={() => {
                      setDemoPhase(index);
                      setDemoPaused(true);
                    }}
                    className="relative h-1 flex-1 overflow-hidden bg-black/12"
                    aria-label={`Show ${stage.label.toLowerCase()} stage`}
                    aria-current={index === demoPhase ? "step" : undefined}
                  >
                    {index === demoPhase && (
                      <motion.span
                        key={`mobile-${stage.label}-${demoPaused ? "paused" : "playing"}`}
                        className="absolute inset-0 origin-left bg-[#087fbd]"
                        initial={{ scaleX: demoPaused || reduceMotion ? 1 : 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ duration: demoPaused || reduceMotion ? 0 : 3.6, ease: "linear" }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
            <h1 className="text-[42px] font-semibold leading-[1.02] sm:text-5xl lg:text-[64px]">
              H2GO Smart Water Monitor
            </h1>
            <p className="mt-5 max-w-[500px] text-xl font-medium leading-7 sm:text-2xl sm:leading-8">
              Know sooner. Take control faster.
            </p>
            <p className="mt-4 max-w-[500px] text-base leading-7 text-[#445257] sm:text-lg">
              Whole-home monitoring, useful alerts and remote valve control in one connected system.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/Register"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-[#087fbd] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#066c9f]"
              >
                Request early access <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#product"
                className="inline-flex h-12 items-center justify-center rounded-[4px] border border-black/25 bg-white/75 px-6 text-sm font-semibold text-[#10181c] transition-colors hover:border-black/55 hover:bg-white"
              >
                See how it works
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      <ScrollTransition from="#e8edeb" to="#071c27" />

      <section id="product" className="scroll-mt-[104px] overflow-hidden bg-[#071c27] py-20 text-white sm:py-24 lg:py-28">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-8 lg:grid-cols-[1.05fr_0.75fr] lg:items-end lg:gap-20">
            <Reveal>
              <Eyebrow light>Live whole-home visibility</Eyebrow>
              <h2 className="mt-4 max-w-[700px] text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[54px]">
                Every tap starts at one line.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-[520px] text-lg leading-8 text-white/65">
                H2GO watches water at the point it enters your property, turning flow, pressure and temperature into a live view of how the home is behaving.
              </p>
              <div className="mt-7 flex items-center gap-3 text-xs font-semibold text-white/55">
                <motion.span
                  className="h-2 w-2 rounded-full bg-[#22a86f]"
                  animate={reduceMotion ? undefined : { scale: [1, 1.7, 1], opacity: [1, 0.45, 1] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />
                Monitoring the full property in real time
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-12 sm:mt-16" delay={0.1}>
            <WholeHomeFlowMap />
          </Reveal>
        </div>
      </section>

      <ScrollTransition from="#071c27" to="#ffffff" />

      <section id="protection" className="scroll-mt-[104px] bg-white">
        <ProtectionScrollStory />
      </section>

      <ScrollTransition from="#e8edeb" to="#071c27" />

      <LeakVideoStory />

      <ScrollTransition from="#071c27" to="#f2f5f5" />

      <section id="app" className="scroll-mt-[104px] bg-[#f2f5f5] py-20 sm:py-24 lg:py-32">
        <div className="mx-auto grid max-w-[1240px] gap-12 px-5 sm:px-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center lg:gap-20 lg:px-10">
          <Reveal>
            <Eyebrow>The H2GO app</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Your water, without the guesswork.
            </h2>
            <p className="mt-6 text-lg leading-8 text-[#5a686d]">
              A simple home status, live usage and valve control give you the information needed to make the next decision.
            </p>
            <Link href="/Login" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-[#087fbd] hover:text-[#066c9f]">
              Open the web dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={0.08}>
            <AppPreview />
          </Reveal>
        </div>
      </section>

      <ScrollTransition from="#f2f5f5" to="#ffffff" />

      <section id="installation" className="scroll-mt-[104px] bg-white py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-[1240px] px-5 sm:px-8 lg:px-10">
          <div className="grid gap-12 lg:grid-cols-[0.68fr_1.32fr] lg:items-center lg:gap-16">
            <Reveal>
              <Eyebrow>From main line to online</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl">
                Built around the way your home receives water.
              </h2>
              <p className="mt-6 max-w-[480px] text-lg leading-8 text-[#5a686d]">
                Once H2GO is fitted to the main line, the app brings setup, monitoring and valve status into one place.
              </p>
            </Reveal>

            <InstallationStory />
          </div>
        </div>
      </section>

      <ScrollTransition from="#ffffff" to="#087fbd" />

      <section className="relative overflow-hidden bg-[#087fbd] py-16 text-white sm:py-20 lg:py-24">
        {!reduceMotion && (
          <motion.span
            className="pointer-events-none absolute inset-y-0 w-px bg-white/20"
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            aria-hidden="true"
          />
        )}
        <div className="relative z-10 mx-auto flex max-w-[1240px] flex-col justify-between gap-8 px-5 sm:px-8 lg:flex-row lg:items-center lg:px-10">
          <Reveal className="max-w-[760px]">
            <p className="text-sm font-semibold text-white/75">H2 early access</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[1.08] sm:text-5xl">
              Protection starts at the main line.
            </h2>
          </Reveal>
          <Reveal delay={0.06} className="shrink-0">
            <Link
              href="/Register"
              className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-[4px] bg-white px-7 text-sm font-semibold text-[#10181c] transition-colors hover:bg-[#eaf4f7] sm:w-auto"
            >
              Request access <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      <ScrollTransition from="#087fbd" to="#071c27" />

      <footer className="bg-[#071c27] text-white">
        <div className="mx-auto max-w-[1240px] px-5 py-12 sm:px-8 lg:px-10">
          <div className="flex flex-col justify-between gap-10 border-b border-white/15 pb-10 md:flex-row">
            <div>
              <div className="flex items-center gap-2 text-xl font-semibold">
                <Droplet className="h-5 w-5 fill-[#73d9eb] text-[#73d9eb]" />
                H2
              </div>
              <p className="mt-4 max-w-[350px] text-sm leading-6 text-white/55">
                Smart water monitoring and control for connected homes.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-14 gap-y-4 text-sm sm:grid-cols-3">
              <Link href="#product" className="text-white/65 hover:text-white">Product</Link>
              <Link href="#app" className="text-white/65 hover:text-white">App</Link>
              <Link href="#installation" className="text-white/65 hover:text-white">Installation</Link>
              <Link href="/Homeowners" className="text-white/65 hover:text-white">Homeowners</Link>
              <Link href="/Partner" className="text-white/65 hover:text-white">Partners</Link>
              <Link href="/Login" className="text-white/65 hover:text-white">Sign in</Link>
            </div>
          </div>
          <div className="flex flex-col gap-3 pt-6 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; 2026 H2 Water Intelligence.</p>
            <p>Designed in Australia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

Home.fullBleed = true;

export default Home;
