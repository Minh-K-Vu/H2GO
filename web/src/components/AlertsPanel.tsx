type Alert = {
  id: number;
  deviceId: string;
  type: string;
  message: string;
  timestamp: string;
};

type AlertsPanelProps = {
  alerts: Alert[];
};

export default function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="mt-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-zinc-200">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900">Recent Alerts</h2>
        <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700">
          {alerts.length} total
        </span>
      </div>

      {alerts.length === 0 ? (
        <p className="text-sm text-zinc-600">No alerts yet.</p>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-lg border p-4 ${
                alert.type === "LEAK"
                  ? "border-red-200 bg-red-50"
                  : "border-zinc-200 bg-zinc-50"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-zinc-900">
                    {alert.type}
                  </p>
                  <p className="mt-1 text-sm text-zinc-700">{alert.message}</p>
                </div>

                <p className="text-xs text-zinc-500">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
