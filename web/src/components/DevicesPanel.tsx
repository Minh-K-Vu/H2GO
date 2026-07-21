import Link from "next/link";

type DeviceSummary = {
  id: string;
  name?: string;
  location?: string | null;
  status?: string;
  last_seen?: string | null;
  is_on: boolean;
};

type DevicesPanelProps = {
  devices: DeviceSummary[];
  loading?: boolean;
  maxItems?: number;
};

export default function DevicesPanel({
  devices,
  loading = false,
  maxItems = 4,
}: DevicesPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Devices</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {devices.length} registered
          </p>
        </div>
        <Link
          href="/devices"
          className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
        >
          Manage →
        </Link>
      </div>

      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="h-14 animate-pulse rounded-xl bg-muted"
            />
          ))
        ) : devices.length === 0 ? (
          <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
            No registered devices were returned by the local API.
          </div>
        ) : (
          devices.slice(0, maxItems).map((device) => (
            <div
              key={device.id}
              className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted"
            >
              <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {device.name ?? device.id}
                </p>
                <p className="text-xs text-muted-foreground">
                  {device.location ?? device.status ?? "Local H2GO device"}
                </p>
              </div>
              <span
                className={
                  device.is_on
                    ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-600"
                    : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                }
              >
                {device.is_on ? "Open" : "Closed"}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
