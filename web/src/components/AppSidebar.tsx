"use client";

import Link from "next/link";
import { useState, type ComponentType, type SVGProps } from "react";
import {
  ActivityIcon,
  BarChart3Icon,
  BellIcon,
  CpuIcon,
  DropletsIcon,
  LayoutDashboardIcon,
  LogOutIcon,
  MenuIcon,
  SettingsIcon,
  XIcon,
} from "@/components/icons";
import { cn } from "@/lib/cn";
import type { AuthUser } from "@/lib/AuthContext";
import type { DashboardTab } from "@/lib/dashboardTabs";
import { dashboardTabMeta } from "@/lib/dashboardTabs";

const navItems = [
  { icon: LayoutDashboardIcon, tab: "dashboard" },
  { icon: CpuIcon, tab: "devices" },
  { icon: ActivityIcon, tab: "telemetry" },
  { icon: BellIcon, tab: "alerts" },
  { icon: BarChart3Icon, tab: "analytics" },
  { icon: SettingsIcon, tab: "settings" },
] as const satisfies ReadonlyArray<{
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tab: DashboardTab;
}>;

type SidebarContentProps = {
  activeTab: DashboardTab;
  onClose?: () => void;
  systemOnline: boolean;
  onLogout: () => Promise<void>;
};

function SidebarContent({
  activeTab,
  onClose,
  systemOnline,
  onLogout,
}: SidebarContentProps) {
  return (
    <>
      <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lg">
          <DropletsIcon className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold leading-none text-white">H2GO</h1>
          <p className="text-xs text-sidebar-foreground/60">Water Intelligence</p>
        </div>
        <button
          type="button"
          className="ml-auto text-sidebar-foreground hover:text-white md:hidden"
          onClick={onClose}
        >
          <XIcon className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map(({ icon: Icon, tab }) => {
          const item = dashboardTabMeta[tab];
          const isActive = activeTab === tab;

          return (
            <Link
              key={tab}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              onClick={onClose}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-2 rounded-lg bg-sidebar-accent px-3 py-2">
          <div
            className={cn(
              "h-2 w-2 rounded-full",
              systemOnline ? "bg-green-400 animate-pulse" : "bg-amber-400",
            )}
          />
          <span className="text-xs text-sidebar-foreground/80">
            {systemOnline ? "System Online" : "System Degraded"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-150 hover:bg-sidebar-accent hover:text-white"
        >
          <LogOutIcon className="h-4 w-4 flex-shrink-0" />
          Log Out
        </button>
      </div>
    </>
  );
}

type AppSidebarProps = {
  activeTab: DashboardTab;
  systemOnline: boolean;
  user: AuthUser | null;
  onLogout: () => Promise<void>;
};

export default function AppSidebar({
  activeTab,
  systemOnline,
  onLogout,
}: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
        <SidebarContent
          activeTab={activeTab}
          systemOnline={systemOnline}
          onLogout={onLogout}
        />
      </aside>

      <div className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between border-b border-sidebar-border bg-sidebar px-4 py-3 md:hidden">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary">
            <DropletsIcon className="h-4 w-4 text-white" />
          </div>
          <span className="text-base font-bold text-white">H2GO</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="p-1 text-sidebar-foreground hover:text-white"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </div>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full w-72 flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 ease-in-out md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          activeTab={activeTab}
          systemOnline={systemOnline}
          onLogout={onLogout}
          onClose={() => setMobileOpen(false)}
        />
      </aside>
    </>
  );
}
