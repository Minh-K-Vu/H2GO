import { AlertTriangleIcon, BellIcon, ShieldAlertIcon } from "@/components/icons";
import { cn } from "@/lib/cn";

type SafetyBannerProp = {
  status: "safe" | "warning" | "danger";
  message: string;
};

export default function SafetyBanner({ status, message }: SafetyBannerProp) {
  if (status === "safe") {
    return null;
  }

  const Icon = status === "danger" ? ShieldAlertIcon : BellIcon;

  return (
    <section
      className={cn(
        "mb-6 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm font-medium",
        status === "danger"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-amber-500/20 bg-amber-500/10 text-amber-600",
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{message}</span>
      {status === "warning" && <AlertTriangleIcon className="ml-auto h-4 w-4" />}
    </section>
  );
}
