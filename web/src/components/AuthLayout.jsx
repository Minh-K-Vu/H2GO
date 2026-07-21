import { Droplets } from "lucide-react";

export default function AuthLayout({ children, icon: Icon = Droplets, title, subtitle, footer }) {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-deep px-6 py-12 text-white">
      <div className="w-full max-w-md rounded-3xl border border-water/15 bg-panel/80 p-7 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-water/10 text-water glow-box">
            <Icon className="h-5 w-5" />
          </div>
          {title ? <h1 className="font-display text-2xl font-semibold text-white">{title}</h1> : null}
          {subtitle ? <p className="mt-2 text-sm text-white/70">{subtitle}</p> : null}
        </div>
        {children}
        {footer ? <div className="mt-6 text-center text-sm text-white/70">{footer}</div> : null}
      </div>
    </main>
  );
}
