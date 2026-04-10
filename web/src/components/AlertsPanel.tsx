type AlertsPanelProps = {
  total: number;
  message: string;
};

export default function AlertsPanel({ total, message }: AlertsPanelProps) {
  return (
    <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Recent Alerts</h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {total} total
        </span>
      </div>

      <p className="text-sm text-zinc-600">{message}</p>
    </section>
  );
}
