"use client";

import type { ReactNode } from "react";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import type { AuthUser } from "@/lib/AuthContext";
import type { DashboardTab } from "@/lib/dashboardTabs";

type DashboardPageShellProps = {
  activeTab: DashboardTab;
  title: string;
  description: string;
  lastUpdated: Date | null;
  onRefresh: () => void;
  refreshing?: boolean;
  systemOnline: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
  actions?: ReactNode;
  children: ReactNode;
};

export default function DashboardPageShell({
  activeTab,
  title,
  description,
  lastUpdated,
  onRefresh,
  refreshing = false,
  systemOnline,
  user,
  onLogout,
  actions,
  children,
}: DashboardPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        systemOnline={systemOnline}
        user={user}
        onLogout={onLogout}
      />

      <main className="min-h-screen flex-1 pt-14 md:ml-64 md:pt-0">
        <div className="p-8">
          <DashboardHeader
            title={title}
            description={description}
            lastUpdated={lastUpdated}
            onRefresh={onRefresh}
            refreshing={refreshing}
            actions={actions}
          />

          {children}
        </div>
      </main>
    </div>
  );
}

