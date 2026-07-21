import { useState, useEffect } from "react";
import { Droplets, Waves, Shield, Zap, BarChart3, Bell, ArrowRight, CheckCircle, Leaf, ChevronDown } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const features = [
  { icon: Waves, title: "Real-Time Flow", desc: "Monitor every liter flowing through your home — live, to the milliliter." },
  { icon: Shield, title: "Leak Detection", desc: "AI catches anomalies the moment they appear, before damage is done." },
  { icon: Zap, title: "Remote Control", desc: "Open or close any valve from anywhere in the world with one tap." },
  { icon: BarChart3, title: "Deep Analytics", desc: "Understand your consumption patterns and cut waste intelligently." },
  { icon: Bell, title: "Smart Alerts", desc: "Precision notifications — only when something actually needs your attention." },
  { icon: Leaf, title: "Eco Tracker", desc: "See your real environmental impact. Every drop saved, measured." },
];

const specs = [
  { label: "Flow Accuracy", value: "±0.5%" },
  { label: "Response Time", value: "<1 sec" },
  { label: "Water Saved", value: "30% avg" },
  { label: "Uptime", value: "99.9%" },
];

export default function Landing() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogin = () => base44.auth.redirectToLogin(window.location.href);

  const navBlur = scrollY > 10;

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-inter overflow-x-hidden">

      {/* NAV */}
      <nav className={`hidden fixed top-0 left-0 right-0 z-50 items-center justify-between px-8 py-4 transition-all duration-300 ${navBlur ? "bg-white/80 backdrop-blur-2xl border-b border-black/5 shadow-sm" : "bg-transparent"}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center">
            <Droplets className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-[#1d1d1f]">H2GO</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Features", "Device", "Impact"].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors font-medium">
              {item}
            </a>
          ))}
        </div>
        <button
          onClick={handleLogin}
          className="flex items-center gap-1.5 px-5 py-2 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-sm font-semibold transition-all duration-200"
        >
          Sign In
        </button>
      </nav>

      {/* HERO */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20 bg-white overflow-hidden">
        {/* Subtle radial bg */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(0,113,227,0.06),transparent)]" />

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <p className="text-[#0071e3] text-sm font-semibold tracking-wide uppercase mb-5">
            Introducing H2GO
          </p>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[-0.03em] leading-[1.02] mb-6 max-w-4xl mx-auto text-[#1d1d1f]">
            Water, intelligently{" "}
            <span className="bg-gradient-to-r from-[#0071e3] to-[#34aadc] bg-clip-text text-transparent">
              protected.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-[#6e6e73] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            Real-time monitoring. Instant leak detection. Remote valve control.
            <br className="hidden md:block" />
            H2GO gives you complete command over every drop.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-8 py-3.5 bg-[#0071e3] hover:bg-[#0077ed] text-white rounded-full text-base font-semibold transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-[1.02]"
            >
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
            <a href="#features" className="flex items-center gap-1.5 px-8 py-3.5 rounded-full text-base font-semibold text-[#0071e3] hover:bg-blue-50 transition-all duration-200">
              Learn more <ChevronDown className="w-4 h-4" />
            </a>
          </div>
        </motion.div>

        {/* Hero Device Visual */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-2xl mx-auto"
        >
          {/* Glow under device */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-16 bg-blue-400/20 rounded-full blur-3xl" />

          <div className="relative mx-auto w-64 h-64 md:w-80 md:h-80">
            {/* Outer rings */}
            <motion.div
              className="absolute inset-0 rounded-full border border-blue-100"
              animate={{ scale: [1, 1.08, 1], opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border border-blue-100"
              animate={{ scale: [1, 1.06, 1], opacity: [0.6, 0.2, 0.6] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            />
            <motion.div
              className="absolute inset-8 rounded-full border border-blue-200/50"
              animate={{ scale: [1, 1.04, 1], opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            />

            {/* Device card */}
            <div className="absolute inset-12 rounded-3xl bg-gradient-to-b from-[#f5f5f7] to-white border border-black/8 shadow-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#34aadc] flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div className="text-center">
                <p className="font-bold text-[#1d1d1f] text-sm tracking-tight">H2GO Sensor</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-[#6e6e73] font-medium">Live</span>
                </div>
              </div>
            </div>

            {/* Floating data pills */}
            <motion.div
              className="absolute -left-6 top-1/3 bg-white border border-black/8 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <Waves className="w-3 h-3 text-[#0071e3]" />
              </div>
              <div>
                <p className="text-[10px] text-[#6e6e73]">Flow Rate</p>
                <p className="text-xs font-bold text-[#1d1d1f]">1.4 L/min</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute -right-6 top-1/2 bg-white border border-black/8 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2"
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <Shield className="w-3 h-3 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] text-[#6e6e73]">Status</p>
                <p className="text-xs font-bold text-emerald-500">All Clear</p>
              </div>
            </motion.div>

            <motion.div
              className="absolute left-1/2 -translate-x-1/2 -bottom-8 bg-white border border-black/8 shadow-xl rounded-2xl px-3 py-2 flex items-center gap-2"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            >
              <div className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center">
                <BarChart3 className="w-3 h-3 text-amber-500" />
              </div>
              <div>
                <p className="text-[10px] text-[#6e6e73]">Pressure</p>
                <p className="text-xs font-bold text-[#1d1d1f]">3.1 bar</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* SPECS BAR */}
      <section className="bg-[#f5f5f7] py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-black/5 rounded-3xl overflow-hidden">
          {specs.map(({ label, value }) => (
            <div key={label} className="bg-[#f5f5f7] px-8 py-8 text-center">
              <p className="text-3xl font-extrabold tracking-tight text-[#1d1d1f] mb-1">{value}</p>
              <p className="text-xs text-[#6e6e73] font-medium uppercase tracking-widest">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="py-32 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <p className="text-[#0071e3] text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f] mb-4">
              Everything water. Nothing wasted.
            </h2>
            <p className="text-[#6e6e73] text-lg max-w-xl mx-auto font-light">
              Purpose-built tools that give you total control, awareness, and peace of mind.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="group p-8 rounded-3xl bg-[#f5f5f7] hover:bg-white hover:shadow-xl hover:shadow-black/5 border border-transparent hover:border-black/6 transition-all duration-300 cursor-default"
              >
                <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-black/6 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-5 h-5 text-[#0071e3]" />
                </div>
                <h3 className="font-bold text-[#1d1d1f] text-lg mb-2 tracking-tight">{title}</h3>
                <p className="text-[#6e6e73] text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* DEVICE SECTION */}
      <section id="device" className="py-32 px-6 bg-[#f5f5f7]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-1"
          >
            <p className="text-[#0071e3] text-sm font-semibold uppercase tracking-widest mb-5">The H2GO Device</p>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f] mb-6 leading-tight">
              A sensor built to last. Designed to impress.
            </h2>
            <p className="text-[#6e6e73] text-lg mb-8 leading-relaxed font-light">
              The H2GO module installs inline with your water supply in minutes.
              It continuously measures flow, pressure, and temperature — sending encrypted readings every second.
            </p>
            <ul className="space-y-4">
              {[
                "10-minute install — no plumber required",
                "Ultrasonic non-invasive measurement",
                "Battery + wired power options",
                "WPA3 Wi-Fi with offline buffering",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-[#1d1d1f] text-sm font-medium">
                  <div className="w-5 h-5 rounded-full bg-[#0071e3] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="flex-shrink-0 w-full md:w-80"
          >
            <div className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-black/10 border border-black/6 p-10 flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0071e3] to-[#34aadc] flex items-center justify-center shadow-xl shadow-blue-500/30">
                <Droplets className="w-10 h-10 text-white" />
              </div>
              <div className="text-center">
                <h3 className="font-bold text-xl text-[#1d1d1f] tracking-tight">H2GO Sensor</h3>
                <p className="text-[#6e6e73] text-sm mt-1">Smart Flow Monitor</p>
              </div>
              <div className="w-full grid grid-cols-2 gap-3">
                {[
                  { label: "Flow", value: "1.4 L/min" },
                  { label: "Pressure", value: "3.1 bar" },
                  { label: "Temp", value: "18.2 °C" },
                  { label: "Signal", value: "Excellent" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#f5f5f7] rounded-2xl p-3 text-center">
                    <p className="text-[10px] text-[#6e6e73] uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-sm font-bold text-[#1d1d1f]">{value}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-600 text-xs font-semibold">Live Monitoring Active</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IMPACT / CTA */}
      <section id="impact" className="py-32 px-6 bg-white text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto"
        >
          <Leaf className="w-10 h-10 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#1d1d1f] mb-4">
            4.2 million liters saved.
          </h2>
          <p className="text-[#6e6e73] text-lg mb-12 font-light leading-relaxed">
            H2GO households reduce water consumption by an average of 30%.
            Join thousands of homes making a measurable impact on the planet.
          </p>
          <button
            onClick={handleLogin}
            className="inline-flex items-center gap-2 px-10 py-4 bg-[#1d1d1f] hover:bg-black text-white rounded-full text-base font-semibold transition-all duration-200 hover:scale-[1.02] shadow-xl shadow-black/10"
          >
            Sign In to Dashboard <ArrowRight className="w-5 h-5" />
          </button>
          <p className="text-[#6e6e73] text-sm mt-5 font-light">Set up in minutes. No hardware knowledge needed.</p>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-black/6 px-8 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-black flex items-center justify-center">
              <Droplets className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-[#1d1d1f]">H2GO</span>
          </div>
          <p className="text-[#6e6e73] text-sm">© 2026 H2GO Water Intelligence. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-sm text-[#6e6e73] hover:text-[#1d1d1f] transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
