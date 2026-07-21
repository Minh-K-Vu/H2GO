import { AlertTriangle, Info, ShieldAlert, Wifi, X, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { base44 } from "@/api/base44Client";

const alertConfig = {
  LEAK: { icon: ShieldAlert, color: "text-destructive", bg: "bg-destructive/10", label: "Leak Detected" },
  HIGH_FLOW: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", label: "High Flow" },
  LOW_PRESSURE: { icon: Info, color: "text-primary", bg: "bg-primary/10", label: "Low Pressure" },
  DEVICE_OFFLINE: { icon: Wifi, color: "text-muted-foreground", bg: "bg-muted", label: "Device Offline" },
  VALVE_CLOSED: { icon: Info, color: "text-accent", bg: "bg-accent/10", label: "Valve Closed" },
};

const severityBadge = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-600",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
};

export default function AlertsList({ alerts, onUpdate, limit }) {
  const displayAlerts = limit ? alerts.slice(0, limit) : alerts;

  const resolveAlert = async (id) => {
    await base44.entities.Alert.update(id, { is_resolved: true, resolved_at: new Date().toISOString() });
    onUpdate();
  };

  if (displayAlerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-3" />
        <p className="font-medium text-foreground">All clear!</p>
        <p className="text-muted-foreground text-sm">No active alerts at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayAlerts.map((alert) => {
        const config = alertConfig[alert.type] ?? alertConfig.HIGH_FLOW;
        const Icon = config.icon;
        return (
          <div
            key={alert.id}
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl border transition-all",
              alert.is_resolved ? "opacity-50 bg-muted/30 border-border" : "bg-card border-border hover:border-primary/30"
            )}
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0", config.bg)}>
              <Icon className={cn("w-4 h-4", config.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-sm font-semibold text-foreground">{config.label}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", severityBadge[alert.severity ?? "medium"])}>
                  {alert.severity ?? "medium"}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">{alert.message}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {alert.device_name ?? alert.device_id}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-xs text-muted-foreground">
                  {alert.timestamp
                    ? formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })
                    : formatDistanceToNow(new Date(alert.created_date), { addSuffix: true })}
                </span>
              </div>
            </div>
            {!alert.is_resolved && (
              <button
                onClick={() => resolveAlert(alert.id)}
                className="flex-shrink-0 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}