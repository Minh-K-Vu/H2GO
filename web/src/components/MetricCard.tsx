import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/cn";

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

type MetricCardProps = {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon?: IconComponent;
  color?: "blue" | "cyan" | "green" | "red" | "amber";
  loading?: boolean;
};

const colorMap = {
  blue: "bg-primary/10 text-primary",
  cyan: "bg-accent/10 text-accent",
  green: "bg-emerald-500/10 text-emerald-500",
  red: "bg-destructive/10 text-destructive",
  amber: "bg-amber-500/10 text-amber-500",
};

const shadowMap = {
  blue: "shadow-lg",
  cyan: "shadow-lg",
  green: "shadow-lg",
  red: "shadow-lg",
  amber: "shadow-lg",
};

export default function MetricCard({
  title,
  value,
  unit,
  subtitle,
  icon: Icon,
  color = "blue",
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="mb-4 h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="mb-2 h-8 w-36 animate-pulse rounded bg-muted" />
        <div className="h-3 w-24 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl",
        shadowMap[color],
      )}
    >
      <div className="mb-4 flex items-start justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon ? (
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              colorMap[color],
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        ) : null}
      </div>

      <div className="mb-1 flex items-end gap-1">
        <span className="text-3xl font-bold text-foreground">{value}</span>
        {unit ? (
          <span className="pb-1 text-sm text-muted-foreground">{unit}</span>
        ) : null}
      </div>

      {subtitle ? (
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  );
}
