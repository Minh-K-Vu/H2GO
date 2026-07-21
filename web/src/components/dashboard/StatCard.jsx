import { cn } from "@/lib/utils";

export default function StatCard({ title, value, unit, subtitle, icon: Icon, trend, color = "blue", loading }) {
  const colorMap = {
    blue: "bg-primary/10 text-primary",
    cyan: "bg-accent/10 text-accent",
    green: "bg-emerald-500/10 text-emerald-500",
    red: "bg-destructive/10 text-destructive",
    amber: "bg-amber-500/10 text-amber-500",
  };

  const glowMap = {
    blue: "shadow-primary/10",
    cyan: "shadow-accent/10",
    green: "shadow-emerald-500/10",
    red: "shadow-destructive/10",
    amber: "shadow-amber-500/10",
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-4" />
        <div className="h-8 w-32 bg-muted rounded mb-2" />
        <div className="h-3 w-20 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className={cn("bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200", glowMap[color])}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-muted-foreground text-sm font-medium">{title}</p>
        {Icon && (
          <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", colorMap[color])}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>
      <div className="flex items-end gap-1 mb-1">
        <span className="text-3xl font-bold text-foreground">{value ?? "—"}</span>
        {unit && <span className="text-muted-foreground text-sm pb-1">{unit}</span>}
      </div>
      {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
      {trend !== undefined && (
        <div className={cn("mt-2 text-xs font-medium", trend >= 0 ? "text-emerald-500" : "text-destructive")}>
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% vs yesterday
        </div>
      )}
    </div>
  );
}