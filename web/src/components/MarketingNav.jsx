import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown, Droplets, Menu, X } from "lucide-react";

const primaryLinks = [
  { label: "Smart Home", href: "/smart-home" },
  { label: "Dashboard", href: "/Dashboard" },
  { label: "AI", href: "/meet-ai" },
  { label: "Smart City", href: "/smart-city" },
  { label: "Impact", href: "/Impact" },
  { label: "Homeowners", href: "/Homeowners" },
];

const moreLinks = [
  { label: "Why H2 Wins", href: "/why-h2-wins" },
  { label: "Water Journey", href: "/water-journey" },
  { label: "H2OS", href: "/H2OS" },
  { label: "Partner", href: "/Partner" },
];

export default function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-deep/88 backdrop-blur-2xl">
      <nav className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-5 lg:px-9">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-water text-deep glow-box">
            <Droplets className="h-4 w-4" />
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-white">
            H2 <span className="ml-1 font-mono text-[10px] uppercase tracking-architectural text-water/60">Water Intelligence</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className="font-display text-sm font-medium text-white/50 transition-colors hover:text-water">
              {link.label}
            </Link>
          ))}
          <div className="group relative">
            <button className="flex items-center gap-1.5 font-display text-sm font-medium text-white/50 transition-colors hover:text-water">
              More <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <div className="invisible absolute right-0 top-8 min-w-48 translate-y-2 rounded-2xl border border-white/10 bg-panel/95 p-2 opacity-0 shadow-2xl shadow-black/30 backdrop-blur-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
              {moreLinks.map((link) => (
                <Link key={link.href} href={link.href} className="block rounded-xl px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-water">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <Link href="/Login" className="hidden items-center gap-2 rounded-full bg-water px-5 py-2.5 font-display text-sm font-semibold text-deep transition-transform hover:scale-105 lg:inline-flex">
          Get H2 <ArrowRight className="h-4 w-4" />
        </Link>

        <button className="flex h-10 w-10 items-center justify-center text-white lg:hidden" onClick={() => setMobileOpen((open) => !open)} aria-label="Toggle navigation">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="border-t border-white/5 bg-deep/95 px-5 py-4 lg:hidden">
          <div className="grid gap-1">
            {[...primaryLinks, ...moreLinks].map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-xl px-3 py-3 text-sm font-medium text-white/70 hover:bg-white/5 hover:text-water">
                {link.label}
              </Link>
            ))}
            <Link href="/Login" onClick={() => setMobileOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-water px-5 py-3 text-sm font-semibold text-deep">
              Get H2 <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
