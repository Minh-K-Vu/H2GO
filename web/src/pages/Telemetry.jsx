import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function Telemetry() {
  return <ProtectedDashboardPage activeTab="telemetry" />;
}

Telemetry.hideMarketingNav = true;

export default Telemetry;
