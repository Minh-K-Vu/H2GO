import { PowerIcon, WavesIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type ValveControlCardProps = {
  deviceName: string;
  state: "Open" | "Closed";
  buttonLabel: string;
  onToggle: () => void;
  loading?: boolean;
  disabled?: boolean;
  helperText?: string;
};

export default function ValveControlCard({
  deviceName,
  state,
  buttonLabel,
  onToggle,
  loading = false,
  disabled = false,
  helperText,
}: ValveControlCardProps) {
  const isOpen = state === "Open";

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Valve Control</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{deviceName}</p>
        </div>
        <div
          className={cn(
            "h-3 w-3 rounded-full",
            isOpen
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
              : "bg-muted-foreground",
          )}
        />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div
          className={cn(
            "relative flex h-28 w-28 items-center justify-center rounded-full transition-all duration-500",
            isOpen ? "bg-primary/10 shadow-2xl shadow-primary/20" : "bg-muted",
          )}
        >
          {isOpen ? (
            <div className="absolute inset-0 animate-ping rounded-full bg-primary/5" />
          ) : null}
          <WavesIcon
            className={cn(
              "h-10 w-10 transition-colors duration-300",
              isOpen ? "text-primary" : "text-muted-foreground",
            )}
          />
        </div>

        <div className="text-center">
          <p
            className={cn(
              "text-2xl font-bold",
              isOpen ? "text-emerald-500" : "text-muted-foreground",
            )}
          >
            {state.toUpperCase()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Water is {isOpen ? "flowing" : "stopped"}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={loading || disabled}
          className={cn(
            "flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-200",
            disabled
              ? "cursor-not-allowed bg-muted text-muted-foreground"
              : isOpen
              ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
              : "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90",
            loading && "cursor-wait opacity-80",
          )}
        >
          <PowerIcon className={cn("h-4 w-4", loading && "animate-pulse")} />
          {buttonLabel}
        </button>
        {helperText ? (
          <p className="max-w-[16rem] text-center text-xs leading-5 text-muted-foreground">
            {helperText}
          </p>
        ) : null}
      </div>
    </section>
  );
}
