import { Waves, Power, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ValveControl({ device, onUpdate }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await base44.entities.Device.update(device.id, { is_on: !device.is_on });
    onUpdate();
    setLoading(false);
  };

  const isOpen = device?.is_on;

  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-foreground">Valve Control</h3>
          <p className="text-muted-foreground text-xs mt-0.5">{device?.name ?? "—"}</p>
        </div>
        <div className={cn(
          "w-3 h-3 rounded-full",
          isOpen ? "bg-emerald-500 shadow-lg shadow-emerald-500/50 animate-pulse" : "bg-muted-foreground"
        )} />
      </div>

      <div className="flex flex-col items-center gap-6">
        <div className={cn(
          "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500",
          isOpen ? "bg-primary/10 shadow-2xl shadow-primary/20" : "bg-muted"
        )}>
          {isOpen && (
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" />
          )}
          <Waves className={cn("w-10 h-10 transition-colors duration-300", isOpen ? "text-primary" : "text-muted-foreground")} />
        </div>

        <div className="text-center">
          <p className={cn(
            "text-2xl font-bold",
            isOpen ? "text-emerald-500" : "text-muted-foreground"
          )}>
            {isOpen ? "OPEN" : "CLOSED"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Water is {isOpen ? "flowing" : "stopped"}</p>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200",
            isOpen
              ? "bg-destructive/10 text-destructive hover:bg-destructive hover:text-white"
              : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/30"
          )}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
          {isOpen ? "Close Valve" : "Open Valve"}
        </button>
      </div>
    </div>
  );
}