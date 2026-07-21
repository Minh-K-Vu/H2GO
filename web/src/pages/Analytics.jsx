import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function Analytics() {
  return <ProtectedDashboardPage activeTab="analytics" />;
}

Analytics.hideMarketingNav = true;

export default Analytics;
