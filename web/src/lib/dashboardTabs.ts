export const dashboardTabs = [
  "dashboard",
  "devices",
  "telemetry",
  "alerts",
  "analytics",
  "settings",
] as const;

export type DashboardTab = (typeof dashboardTabs)[number];

type DashboardTabMeta = {
  label: string;
  href: string;
  title: string;
  description: string;
};

export const dashboardTabMeta: Record<DashboardTab, DashboardTabMeta> = {
  dashboard: {
    label: "Dashboard",
    href: "/AppDashboard",
    title: "Dashboard",
    description: "Live overview of flow, device status, alerts, and valve health.",
  },
  devices: {
    label: "Devices",
    href: "/Devices",
    title: "Devices",
    description: "Manage connected valves and review each device's live status.",
  },
  telemetry: {
    label: "Telemetry",
    href: "/Telemetry",
    title: "Telemetry",
    description: "Inspect recent readings, current flow, and raw measurement history.",
  },
  alerts: {
    label: "Alerts",
    href: "/Alerts",
    title: "Alerts",
    description: "Track active incidents and respond quickly to risky events.",
  },
  analytics: {
    label: "Analytics",
    href: "/Analytics",
    title: "Analytics",
    description: "Review trends, peaks, and summary insights from recent water usage.",
  },
  settings: {
    label: "Settings",
    href: "/Settings",
    title: "Settings",
    description: "Review account access, system connectivity, and dashboard behavior.",
  },
};

export function isDashboardTab(value: string): value is DashboardTab {
  return dashboardTabs.includes(value as DashboardTab);
}
