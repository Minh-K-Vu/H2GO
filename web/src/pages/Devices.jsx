import ProtectedDashboardPage from "@/components/ProtectedDashboardPage";

function Devices() {
  return <ProtectedDashboardPage activeTab="devices" />;
}

Devices.hideMarketingNav = true;

export default Devices;
