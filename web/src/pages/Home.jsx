import { Link } from 'react-router-dom';
import { ArrowRight, Droplets } from 'lucide-react';
import CinematicHero from '@/components/home/CinematicHero';
import Problem from '@/components/home/Problem';
import Ecosystem from '@/components/home/Ecosystem';

function Home() {
  return (
    <div className="relative bg-deep">
      <CinematicHero />
      <Problem />
      <Ecosystem />

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-white/5 bg-deep py-24 text-center">
        <div className="water-radial absolute inset-0" />
        <div className="relative mx-auto max-w-2xl px-6">
          <div className="mb-5 flex justify-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-water to-ocean glow-box">
              <Droplets className="h-6 w-6 text-deep" />
            </span>
          </div>
          <h2 className="font-display text-3xl font-semibold leading-tight sm:text-5xl glow-text">
            Join the future of water intelligence.
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-white/60">
            Whether you own a home, build homes, insure them, or plan cities — there's a place for you in the H2 ecosystem.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link to="/partner" className="group inline-flex items-center gap-2 rounded-full bg-water px-7 py-3.5 font-display text-sm font-medium text-deep transition-transform hover:scale-105">
              Partner with H2 <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/smart-home" className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 font-display text-sm text-white transition-colors hover:border-water hover:text-water">
              Explore the Smart Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

Home.fullBleed = true;

export default Home;
