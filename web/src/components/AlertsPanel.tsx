import Link from "next/link";
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  InfoIcon,
  ShieldAlertIcon,
  WifiIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";

export type DashboardAlert = {
  id: string | number;
  deviceId: string;
  deviceName?: string | null;
  type: string;
  severity?: "low" | "medium" | "high" | "critical";
  message: string;
  isResolved?: boolean;
  resolvedAt?: string | null;
  timestamp: string;
};

type AlertsPanelProps = {
  alerts: DashboardAlert[];
  loading?: boolean;
  actionHref?: string | null;
  actionLabel?: string;
};

const alertConfig = {
  LEAK: {
    icon: ShieldAlertIcon,
    color: "text-destructive",
    background: "bg-destructive/10",
    label: "Leak Detected",
    severity: "critical",
  },
  HIGH_FLOW: {
    icon: AlertTriangleIcon,
    color: "text-amber-500",
    background: "bg-amber-500/10",
    label: "High Flow",
    severity: "high",
  },
  LOW_PRESSURE: {
    icon: InfoIcon,
    color: "text-primary",
    background: "bg-primary/10",
    label: "Low Pressure",
    severity: "medium",
  },
  VALVE_CLOSED: {
    icon: InfoIcon,
    color: "text-primary",
    background: "bg-primary/10",
    label: "Valve Closed",
    severity: "medium",
  },
  VALVE: {
    icon: InfoIcon,
    color: "text-primary",
    background: "bg-primary/10",
    label: "Valve Closed",
    severity: "medium",
  },
  DEVICE_OFFLINE: {
    icon: WifiIcon,
    color: "text-muted-foreground",
    background: "bg-muted",
    label: "Device Offline",
    severity: "low",
  },
} as const;

const severityBadge = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-600",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

function formatDistanceToNow(timestamp: string) {
  const delta = Date.now() - new Date(timestamp).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < minute) {
    return "just now";
  }

  if (delta < hour) {
    return `${Math.round(delta / minute)}m ago`;
  }

  if (delta < day) {
    return `${Math.round(delta / hour)}h ago`;
  }

  return `${Math.round(delta / day)}d ago`;
}

export default function AlertsPanel({
  alerts,
  loading = false,
  actionHref = "/alerts",
  actionLabel = "View all →",
}: AlertsPanelProps) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Recent Alerts</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {alerts.length} active
          </p>
        </div>
        {actionHref ? (
          <Link
            href={actionHref}
            className="text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            {actionLabel}
          </Link>
        ) : null}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-xl border border-border bg-muted/40"
            />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <CheckCircle2Icon className="mb-3 h-12 w-12 text-emerald-500" />
          <p className="font-medium text-foreground">All clear!</p>
          <p className="text-sm text-muted-foreground">
            No active alerts at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const config =
              alertConfig[alert.type as keyof typeof alertConfig] ??
              alertConfig.HIGH_FLOW;
            const Icon = config.icon;
            const severity = alert.severity ?? config.severity;

            return (
              <div
                key={alert.id}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/30"
              >
                <div
                  className={cn(
                    "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                    config.background,
                  )}
                >
                  <Icon className={cn("h-4 w-4", config.color)} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-0.5 flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {config.label}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-medium",
                        severityBadge[severity],
                      )}
                    >
                      {severity}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">{alert.message}</p>

                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {alert.deviceName ?? alert.deviceId}
                    </span>
                    <span className="text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(alert.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
