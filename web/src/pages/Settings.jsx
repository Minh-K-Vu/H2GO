import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function Settings() {
  return <ProtectedDashboardPage activeTab="settings" />;
}

Settings.hideMarketingNav = true;

export default Settings;
