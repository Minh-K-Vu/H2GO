import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function Alerts() {
  return <ProtectedDashboardPage activeTab="alerts" />;
}

Alerts.hideMarketingNav = true;

export default Alerts;
