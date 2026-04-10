export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            Water Guard Dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Monitor flow, detect leaks, and control the valve remotely.
          </p>
        </header>

        <section className="mb-6 rounded-xl bg-green-100 px-4 py-3 text-sm font-semibold text-green-800">
          SYSTEM SAFE
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Current Flow</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              0.00 <span className="text-base text-zinc-600">L/min</span>
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Today’s Usage</p>
            <p className="mt-2 text-3xl font-semibold text-zinc-900">
              0.0 <span className="text-base text-zinc-600">L</span>
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Leak Status</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-900">Normal</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
            <p className="text-sm font-medium text-zinc-600">Valve Control</p>
            <p className="mt-2 text-lg font-semibold text-zinc-900">Open</p>
            <button className="mt-4 w-full rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white hover:bg-red-500">
              Turn Off Valve
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900">
              Recent Alerts
            </h2>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
              0 total
            </span>
          </div>

          <p className="text-sm text-zinc-600">No alerts yet.</p>
        </section>
      </div>
    </div>
  );
}
