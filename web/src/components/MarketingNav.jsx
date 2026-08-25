import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Droplet, Menu, X } from "lucide-react";

const links = [
  { label: "Product", href: "/#product" },
  { label: "Protection", href: "/#protection" },
  { label: "H2GO app", href: "/#app" },
  { label: "Installation", href: "/#installation" },
];

export default function MarketingNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="h2-marketing fixed inset-x-0 top-0 z-50 text-[#10181c]">
      <Link
        href="/Register"
        className="flex h-[34px] items-center justify-center gap-2 bg-[#087fbd] px-4 text-center text-xs font-semibold text-white hover:bg-[#066c9f]"
      >
        H2 early access is now open
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      <nav className="border-b border-black/10 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-[1320px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Droplet className="h-5 w-5 fill-[#18b8d0] text-[#18b8d0]" />
            <span className="text-xl font-semibold">H2</span>
          </Link>

          <div className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-[#48565b] transition-colors hover:text-black"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-5 lg:flex">
            <Link href="/Login" className="text-sm font-semibold text-[#48565b] hover:text-black">
              Sign in
            </Link>
            <Link
              href="/Register"
              className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-[#10181c] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2a3539]"
            >
              Request access <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center lg:hidden"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen ? (
          <div className="border-t border-black/10 bg-white px-5 pb-6 pt-2 sm:px-8 lg:hidden">
            <div className="mx-auto grid max-w-[1320px]">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="border-b border-black/10 py-3.5 text-base font-medium text-[#263338]"
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <Link
                  href="/Login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 items-center justify-center rounded-[4px] border border-black/20 text-sm font-semibold"
                >
                  Sign in
                </Link>
                <Link
                  href="/Register"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-[#10181c] px-4 text-sm font-semibold text-white"
                >
                  Request access
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>
    </header>
  );
}
