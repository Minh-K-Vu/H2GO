import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { RefreshCwIcon } from "@/components/icons";

type DashboardHeaderProps = {
  title: string;
  description: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing?: boolean;
  actions?: ReactNode;
};

export default function DashboardHeader({
  title,
  description,
  lastUpdated,
  onRefresh,
  refreshing = false,
  actions,
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {description}
        </p>
        <p className="mt-1 text-xs text-muted-foreground/80">
          {lastUpdated
            ? `Last updated ${lastUpdated.toLocaleTimeString()}`
            : "Loading live system data"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {actions}
        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors",
            refreshing ? "cursor-wait opacity-80" : "hover:bg-muted",
          )}
        >
          <RefreshCwIcon
            className={cn("h-4 w-4", refreshing && "animate-spin")}
          />
          Refresh
        </button>
      </div>
    </header>
  );
}
