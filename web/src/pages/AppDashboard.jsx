import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function AppDashboard() {
  return <ProtectedDashboardPage activeTab="dashboard" />;
}

AppDashboard.hideMarketingNav = true;

export default AppDashboard;
