import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Bot } from 'lucide-react';

const SUGGESTIONS = [
  'I think I have a leak',
  'How much water did I save?',
  'Activate holiday mode',
  'Why is my bill high?',
];

function respond(text) {
  const t = text.toLowerCase();
  if (t.includes('leak')) return "Your overnight usage shows a continuous flow of 0.4 L/min — that points to a slow leak. I'd check the laundry tap first. Want me to run a shut-off test?";
  if (t.includes('save')) return "Approximately 4,600 litres this year — about $312 and 1.3 kg of CO₂. You're in the top 5% of efficient homes.";
  if (t.includes('holiday')) return "Holiday Mode activated. I'll monitor for any flow while you're away and auto-shut the main valve if anything looks off. Safe travels.";
  if (t.includes('bill')) return "Your bill is tracking 22% lower than last quarter — mostly from shorter showers and a more efficient dishwasher cycle.";
  if (t.includes('shower')) return "Your showers are running 18% longer than your weekly average. Cutting 2 minutes saves around $94 a year.";
  if (t.includes('dish')) return "Your dishwasher is 9% less efficient than last month — likely a clogged filter or worn washer. Replacing the washer could save $114/year.";
  if (t.includes('budget')) return "At your current rate you'll likely exceed your water budget this month by ~$6. I can suggest two easy reductions.";
  return "I'm watching your home's water in real time. Ask me about leaks, savings, your bill, or any appliance.";
}

export default function MeetAI() {
  const [messages, setMessages] = useState([{ from: 'ai', text: "Hi Cameron — I'm H2 AI. Ask me anything about your water, or try a suggestion below." }]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typing]);

  const send = (text) => {
    const msg = (text ?? input).trim();
    if (!msg || typing) return;
    setMessages((m) => [...m, { from: 'user', text: msg }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: 'ai', text: respond(msg) }]);
      setTyping(false);
    }, 850);
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-deep text-white">
      <section className="mx-auto max-w-[1400px] px-6 py-16 lg:px-10 lg:py-24">
        <div className="mb-10 max-w-2xl">
          <div className="mb-3 font-mono text-[11px] tracking-architectural text-water/70 uppercase">Meet the AI</div>
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-5xl lg:text-6xl">Don't just read about the AI. Talk to it.</h1>
          <p className="mt-4 text-lg text-white/60">This is a live demo of H2 AI — the intelligence watching over your water. Try a question.</p>
        </div>

        <div className="mx-auto max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-panel glow-box">
          <div className="flex items-center gap-2 border-b border-white/5 px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-water to-ocean"><Bot className="h-4 w-4 text-deep" /></span>
            <div>
              <div className="font-display text-sm font-semibold">H2 AI</div>
              <div className="flex items-center gap-1 font-mono text-[9px] tracking-wide text-emerald-400 uppercase"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Online</div>
            </div>
          </div>

          <div className="h-[420px] space-y-3 overflow-y-auto p-5">
            {messages.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-2.5 ${m.from === 'user' ? 'justify-end' : ''}`}>
                {m.from === 'ai' && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-water/15"><Sparkles className="h-4 w-4 text-water" /></span>}
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.from === 'user' ? 'bg-water text-deep' : 'bg-white/5 text-white/85'}`}>{m.text}</div>
              </motion.div>
            ))}
            <AnimatePresence>
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2.5">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-water/15"><Sparkles className="h-4 w-4 text-water" /></span>
                  <div className="flex items-center gap-1 rounded-2xl bg-white/5 px-4 py-3">
                    {[0, 1, 2].map((d) => (<span key={d} className="h-1.5 w-1.5 rounded-full bg-white/50 animate-pulse" style={{ animationDelay: `${d * 0.2}s` }} />))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={endRef} />
          </div>

          <div className="border-t border-white/5 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 font-display text-xs text-white/70 transition-colors hover:border-water hover:text-water">{s}</button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex items-center gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask H2 AI anything…" className="flex-1 rounded-xl border border-white/10 bg-deep/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-water focus:outline-none" />
              <button type="submit" className="flex h-11 w-11 items-center justify-center rounded-xl bg-water text-deep transition-transform hover:scale-105"><Send className="h-4 w-4" /></button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
