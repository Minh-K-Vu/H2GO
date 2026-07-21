"use client";

import AccessRestrictedPage from "@/components/AccessRestrictedPage";
import AlertsPage from "@/components/AlertsPage";
import DashboardApp from "@/components/DashboardApp";
import DevicesPage from "@/components/DevicesPage";
import H2AuthPage from "@/components/H2AuthPage";
import LoadingScreen from "@/components/LoadingScreen";
import TelemetryPage from "@/components/TelemetryPage";
import type { DashboardTab } from "@/lib/dashboardTabs";
import { useAuth } from "@/lib/AuthContext";

type ProtectedDashboardPageProps = {
  activeTab: DashboardTab;
};

export default function ProtectedDashboardPage({
  activeTab,
}: ProtectedDashboardPageProps) {
  const {
    user,
    isAuthenticated,
    isAuthorized,
    isLoadingAuth,
    authChecked,
    authError,
    refreshAuthState,
    logout,
  } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <H2AuthPage initialMode="login" />;
  }

  if (!isAuthorized) {
    return (
      <AccessRestrictedPage
        user={user}
        authError={authError}
        onLogout={logout}
        onRefresh={refreshAuthState}
      />
    );
  }

  if (activeTab === "devices") {
    return <DevicesPage />;
  }

  if (activeTab === "telemetry") {
    return <TelemetryPage />;
  }

  if (activeTab === "alerts") {
    return <AlertsPage />;
  }

  return <DashboardApp activeTab={activeTab} />;
}
