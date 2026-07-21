import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Image } from "@/components/ui/image";
import { Droplets, Home, Network, ShieldCheck, Sparkles, TrendingDown } from "lucide-react";

const EARTH =
  "https://media.base44.com/images/public/6a5eb45ca7f42d986b8e625f/53d0f1ded_generated_image.png";

const CAUSTICS =
  "https://media.base44.com/images/public/6a5eb45ca7f42d986b8e625f/6ed4e525c_generated_image.png";

const DOTS = [
  { x: "26%", y: "36%" },
  { x: "30%", y: "42%" },
  { x: "23%", y: "45%" },
  { x: "34%", y: "62%" },
  { x: "36%", y: "68%" },
  { x: "50%", y: "37%" },
  { x: "53%", y: "42%" },
  { x: "48%", y: "52%" },
  { x: "52%", y: "57%" },
  { x: "45%", y: "58%" },
  { x: "63%", y: "40%" },
  { x: "67%", y: "45%" },
  { x: "61%", y: "47%" },
  { x: "73%", y: "62%" },
  { x: "75%", y: "66%" },
];

const LINKS = [
  [26, 36, 50, 37],
  [50, 37, 63, 40],
  [63, 40, 67, 45],
  [48, 52, 52, 57],
  [34, 62, 48, 52],
  [61, 47, 73, 62],
  [30, 42, 48, 52],
  [53, 42, 63, 40],
  [23, 45, 34, 62],
  [67, 45, 75, 66],
  [36, 68, 45, 58],
  [30, 42, 50, 37],
  [45, 58, 52, 57],
  [61, 47, 67, 45],
  [26, 36, 23, 45],
];

const telemetry = [
  {
    className: "left-4 top-[122px] sm:left-5 lg:left-5",
    Icon: Home,
    label: "Homes Protected",
    value: "2,408,914",
  },
  {
    className: "right-4 top-[122px] sm:right-5 lg:right-5",
    Icon: Droplets,
    label: "Water Saved",
    value: "1.24B L",
  },
];

const storyPanels = [
  {
    eyebrow: "Live Network",
    title: "Every home becomes a water signal.",
    body: "H2 reads real-time flow, pressure and valve status, then turns those readings into one connected water map.",
    Icon: Network,
    align: "left",
    range: [0.16, 0.32, 0.46],
  },
  {
    eyebrow: "Leak Protection",
    title: "Problems surface before they become damage.",
    body: "The system watches usage patterns continuously and can close the valve the moment a burst or abnormal run is detected.",
    Icon: ShieldCheck,
    align: "right",
    range: [0.38, 0.54, 0.68],
  },
  {
    eyebrow: "Water Intelligence",
    title: "Savings become visible, measurable and automatic.",
    body: "Daily, monthly and yearly insights show litres saved, cost avoided and habits that can improve without guesswork.",
    Icon: TrendingDown,
    align: "left",
    range: [0.62, 0.78, 0.92],
  },
];

function TelemetryCard({ Icon, label, value, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className={`absolute z-30 hidden sm:block ${className}`}
    >
      <div className="flex min-w-[150px] items-center gap-3 rounded-2xl border border-water/15 bg-panel/58 px-4 py-3 backdrop-blur-xl glow-box">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-water/10 text-water">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <div className="flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-architectural text-white/42">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {label}
          </div>
          <div className="mt-1 font-display text-lg font-semibold leading-none text-white">
            {value}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Globe() {
  return (
    <div className="animate-spin-slow relative h-full w-full overflow-hidden rounded-full glow-box">
      <Image
        src={EARTH}
        alt="Glowing Earth from space"
        className="h-full w-full"
        fittingType="fill"
      />
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow:
            "inset 0 0 92px rgba(0,0,0,0.58), inset 0 0 34px rgba(34,211,238,0.28)",
        }}
      />
      {DOTS.map((dot, index) => (
        <span
          key={index}
          className="animate-pulse-dot absolute h-1.5 w-1.5 rounded-full bg-water"
          style={{
            left: dot.x,
            top: dot.y,
            boxShadow: "0 0 8px rgba(34,211,238,0.9)",
          }}
        />
      ))}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <g stroke="#22D3EE" strokeWidth="0.35" opacity="0.62" fill="none">
          {LINKS.map(([a, b, c, d], index) => {
            const mx = (a + c) / 2;
            const my = (b + d) / 2;
            const ox = mx + (mx - 50) * 0.25;
            const oy = my + (my - 50) * 0.25;
            return (
              <path
                key={index}
                d={`M ${a} ${b} Q ${ox} ${oy} ${c} ${d}`}
                strokeDasharray="1.5 1.5"
                className="animate-flow"
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function StoryPanel({ panel, progress, reducedMotion }) {
  const [start, peak, end] = panel.range;
  const opacity = useTransform(progress, [start, peak, end], [0, 1, 0]);
  const y = useTransform(progress, [start, peak, end], [28, 0, -28]);
  const x = useTransform(progress, [start, peak, end], [panel.align === "left" ? -24 : 24, 0, 0]);
  const Icon = panel.Icon;

  return (
    <motion.div
      style={reducedMotion ? undefined : { opacity, x, y }}
      className={`pointer-events-none absolute z-30 w-[min(86vw,360px)] rounded-2xl border border-water/15 bg-panel/68 p-5 text-left shadow-2xl shadow-black/30 backdrop-blur-xl ${
        panel.align === "left"
          ? "left-1/2 top-[58%] -translate-x-1/2 md:left-8 md:top-[56%] md:translate-x-0 lg:left-10"
          : "left-1/2 top-[58%] -translate-x-1/2 md:left-auto md:right-8 md:top-[48%] md:translate-x-0 lg:right-10"
      } ${reducedMotion ? "relative left-auto top-auto mb-4 translate-x-0 opacity-100 md:absolute" : ""}`}
    >
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-water/10 text-water">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-mono text-[10px] uppercase tracking-architectural text-water/70">
        {panel.eyebrow}
      </div>
      <h2 className="mt-3 font-display text-2xl font-semibold leading-tight text-white">
        {panel.title}
      </h2>
      <p className="mt-3 text-sm leading-6 text-white/62">{panel.body}</p>
    </motion.div>
  );
}

export default function CinematicHero() {
  const sectionRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.14, 0.24], [1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0, 0.24], [0, -72]);
  const globeScale = useTransform(scrollYProgress, [0, 0.36, 0.78, 1], [0.78, 1, 1.85, 2.45]);
  const globeY = useTransform(scrollYProgress, [0, 0.38, 1], [78, 8, -56]);
  const globeOpacity = useTransform(scrollYProgress, [0, 0.08, 0.94, 1], [0.9, 1, 1, 0.18]);
  const causticsY = useTransform(scrollYProgress, [0, 1], [0, -180]);
  const finalCopyOpacity = useTransform(scrollYProgress, [0.84, 0.95], [0, 1]);

  return (
    <section ref={sectionRef} className="relative h-[360vh] bg-deep text-white">
      <div className="sticky top-0 h-screen overflow-hidden bg-deep">
        <div className="absolute inset-0 starfield opacity-80" />
        <motion.div style={reducedMotion ? undefined : { y: causticsY }} className="absolute inset-0">
          <Image
            src={CAUSTICS}
            alt=""
            fittingType="fill"
            aria-hidden="true"
            className="pointer-events-none h-full w-full opacity-42 mix-blend-screen"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-deep via-deep/40 to-deep/96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,rgba(34,211,238,0.17),transparent_30%),radial-gradient(circle_at_82%_24%,rgba(34,211,238,0.10),transparent_20%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.18),transparent_34%)]" />

        <motion.div
          style={reducedMotion ? undefined : { opacity: titleOpacity, y: titleY }}
          className="absolute left-1/2 top-[86px] z-30 w-full -translate-x-1/2 px-6 text-center sm:top-[90px]"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-water/15 bg-panel/42 px-4 py-2 font-mono text-[9px] uppercase tracking-architectural text-water/70 backdrop-blur-xl">
            <Sparkles className="h-3.5 w-3.5" />
            Live water network
          </div>
          <h1 className="font-body text-[36px] font-normal uppercase leading-none tracking-[0.015em] text-white glow-text sm:text-[48px] md:text-[58px] lg:text-[66px]">
            H2 Water Intelligence
          </h1>
        </motion.div>

        {telemetry.map((item) => (
          <TelemetryCard key={item.label} {...item} />
        ))}

        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          style={
            reducedMotion
              ? undefined
              : { scale: globeScale, y: globeY, opacity: globeOpacity }
          }
          className="absolute left-1/2 top-[205px] z-20 h-[min(560px,74vw)] w-[min(560px,74vw)] min-h-[300px] min-w-[300px] -translate-x-1/2 sm:top-[190px] md:h-[min(620px,58vw)] md:w-[min(620px,58vw)] lg:top-[210px]"
        >
          <Globe />
        </motion.div>

        {storyPanels.map((panel) => (
          <StoryPanel
            key={panel.title}
            panel={panel}
            progress={scrollYProgress}
            reducedMotion={reducedMotion}
          />
        ))}

        <motion.div
          style={reducedMotion ? undefined : { opacity: finalCopyOpacity }}
          className="absolute bottom-12 left-1/2 z-30 w-[min(88vw,720px)] -translate-x-1/2 text-center"
        >
          <div className="font-mono text-[10px] uppercase tracking-architectural text-water/70">
            Scroll into the system
          </div>
          <p className="mx-auto mt-3 max-w-xl font-display text-xl leading-snug text-white/80 sm:text-2xl">
            From planet-scale water intelligence to one valve in one home, H2 keeps every drop visible.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
