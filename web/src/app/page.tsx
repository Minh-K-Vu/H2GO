import AlertsPanel from "@/components/AlertsPanel";
import DashboardHeader from "@/components/DashboardHeader";
import MetricCard from "@/components/MetricCard";
import SafetyBanner from "@/components/SafetyBanner";
import ValveControlCard from "@/components/ValveControlCard";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        <DashboardHeader
          title="Water Guard Dashboard"
          description="Monitor flow, detect leaks, and control the valve remotely."
        />

        <SafetyBanner status="safe" message="SYSTEM SAFE" />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard title="Current Flow" value="0.00" unit="L/min" />

          <MetricCard title="Today's Usage" value="0.0" unit="L" />

          <MetricCard title="Leak Status" value="Normal" />

          <ValveControlCard state="Open" buttonLabel="Turn Off Valve" />
        </section>

        <AlertsPanel total={0} message="No alerts yet." />
      </div>
    </div>
  );
}
