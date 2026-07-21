"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import AlertsPanel, { type DashboardAlert } from "@/components/AlertsPanel";
import AdminUsersPanel from "@/components/AdminUsersPanel";
import AppSidebar from "@/components/AppSidebar";
import DashboardHeader from "@/components/DashboardHeader";
import DevicesPanel from "@/components/DevicesPanel";
import FlowChart from "@/components/FlowChart";
import MetricCard from "@/components/MetricCard";
import SafetyBanner from "@/components/SafetyBanner";
import ValveControlCard from "@/components/ValveControlCard";
import {
  ActivityIcon,
  AlertTriangleIcon,
  BarChart3Icon,
  BellIcon,
  CpuIcon,
  DropletsIcon,
  GaugeIcon,
  PowerIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TrendingUpIcon,
  UserIcon,
  WifiIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, ApiError, API_BASE } from "@/lib/api";
import { cn } from "@/lib/cn";
import { dashboardTabMeta, type DashboardTab } from "@/lib/dashboardTabs";

const DEVICE_ID = "dev-1";

type LatestReading = {
  id?: string;
  deviceId: string;
  deviceName?: string | null;
  flowLpm: number;
  pressureBar?: number | null;
  temperatureC?: number | null;
  timestamp: string;
};

type HistoricalReading = LatestReading;

type TodayTotal = {
  deviceId: string;
  litresToday: number;
};

type DeviceState = {
  id: string;
  name?: string;
  location?: string | null;
  status?: "online" | "offline" | "warning";
  is_on: boolean;
  last_seen?: string | null;
  created_date?: string;
  updated_date?: string;
};

type DashboardAppProps = {
  activeTab: DashboardTab;
};

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

function SectionCard({
  title,
  subtitle,
  action,
  children,
  className,
}: SectionCardProps) {
  return (
    <section
      className={cn("rounded-2xl border border-border bg-card p-6 shadow-lg", className)}
    >
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">{title}</h3>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "No data yet";
  }

  const date = value instanceof Date ? value : new Date(value);

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatRelativeTime(value: string | null | undefined) {
  if (!value) {
    return "No recent events";
  }

  const delta = Date.now() - new Date(value).getTime();
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (delta < minute) {
    return "just now";
  }

  if (delta < hour) {
    return `${Math.round(delta / minute)}m ago`;
  }

  if (delta < day) {
    return `${Math.round(delta / hour)}h ago`;
  }

  return `${Math.round(delta / day)}d ago`;
}

function formatNumber(value: number | null, digits = 2) {
  if (value === null || Number.isNaN(value)) {
    return "—";
  }

  return value.toFixed(digits);
}

function getDeviceStatusTone(status: DeviceState["status"]) {
  if (status === "offline") {
    return "bg-destructive/10 text-destructive";
  }

  if (status === "warning") {
    return "bg-amber-500/10 text-amber-600";
  }

  return "bg-emerald-500/10 text-emerald-600";
}

function getAlertSeverityTone(severity: DashboardAlert["severity"]) {
  if (severity === "critical") {
    return "bg-destructive/10 text-destructive";
  }

  if (severity === "high") {
    return "bg-amber-500/10 text-amber-600";
  }

  if (severity === "medium") {
    return "bg-primary/10 text-primary";
  }

  return "bg-muted text-muted-foreground";
}

export default function DashboardApp({ activeTab }: DashboardAppProps) {
  const { user, logout } = useAuth();
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [readings, setReadings] = useState<HistoricalReading[]>([]);
  const [today, setToday] = useState<TodayTotal | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [devices, setDevices] = useState<DeviceState[]>([]);
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [togglingValve, setTogglingValve] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setRefreshing(true);

    const results = await Promise.allSettled([
      apiRequest<LatestReading | null>(`/devices/${DEVICE_ID}/latest`),
      apiRequest<TodayTotal>(`/devices/${DEVICE_ID}/today-total`),
      apiRequest<DeviceState>(`/devices/${DEVICE_ID}`),
      apiRequest<DashboardAlert[]>(`/devices/${DEVICE_ID}/alerts`),
      apiRequest<HistoricalReading[]>(`/devices/${DEVICE_ID}/readings?limit=30`),
      apiRequest<DeviceState[]>("/devices"),
    ]);

    let hadFailure = false;
    const latestResult =
      results[0].status === "fulfilled" ? results[0].value : null;
    const deviceResult =
      results[2].status === "fulfilled" ? results[2].value : null;

    if (results[0].status === "fulfilled") {
      setLatest(results[0].value);
    } else {
      hadFailure = true;
    }

    if (results[1].status === "fulfilled") {
      setToday(results[1].value);
    } else {
      hadFailure = true;
    }

    if (deviceResult) {
      setDeviceState(deviceResult);
    } else {
      hadFailure = true;
    }

    if (results[3].status === "fulfilled") {
      setAlerts(results[3].value);
    } else {
      hadFailure = true;
    }

    if (results[4].status === "fulfilled") {
      setReadings(results[4].value);
    } else if (latestResult) {
      setReadings([latestResult]);
      hadFailure = true;
    } else {
      hadFailure = true;
    }

    if (results[5].status === "fulfilled") {
      setDevices(results[5].value);
    } else if (deviceResult) {
      setDevices([deviceResult]);
      hadFailure = true;
    } else {
      hadFailure = true;
    }

    setError(hadFailure ? "Some dashboard data could not be loaded." : null);
    setLastUpdated(new Date());
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    void fetchDashboardData();

    const intervalId = window.setInterval(() => {
      void fetchDashboardData();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [fetchDashboardData]);

  async function handleToggleValve() {
    if (!deviceState) {
      return;
    }

    setTogglingValve(true);

    try {
      await apiRequest(`/devices/${DEVICE_ID}/power`, {
        method: "POST",
        body: JSON.stringify({
          isOn: !deviceState.is_on,
        }),
      });

      await fetchDashboardData();
    } catch (toggleError) {
      if (toggleError instanceof ApiError) {
        setError(toggleError.message);
      } else {
        setError("Could not update valve state.");
      }
    } finally {
      setTogglingValve(false);
    }
  }

  const isInitialLoading =
    loading &&
    !latest &&
    !today &&
    !deviceState &&
    readings.length === 0 &&
    devices.length === 0;
  const isOpen = deviceState?.is_on ?? false;
  const activeAlerts = alerts;
  const displayReadings =
    readings.length > 0 ? readings : latest ? [latest] : [];
  const displayDevices =
    devices.length > 0 ? devices : deviceState ? [deviceState] : [];
  const canToggleValve =
    user?.role === "admin" || user?.role === "operator";
  const pageMeta = dashboardTabMeta[activeTab];
  const onlineDevices = displayDevices.filter(
    (device) => device.status !== "offline",
  ).length;
  const offlineDevices = displayDevices.filter(
    (device) => device.status === "offline",
  ).length;
  const openValves = displayDevices.filter((device) => device.is_on).length;
  const telemetrySamples = displayReadings.length;
  const flowAverage =
    telemetrySamples > 0
      ? displayReadings.reduce((sum, reading) => sum + reading.flowLpm, 0) /
        telemetrySamples
      : null;
  const peakReading =
    telemetrySamples > 0
      ? displayReadings.reduce((peak, reading) =>
          reading.flowLpm > peak.flowLpm ? reading : peak,
        )
      : null;
  const lowestReading =
    telemetrySamples > 0
      ? displayReadings.reduce((lowest, reading) =>
          reading.flowLpm < lowest.flowLpm ? reading : lowest,
        )
      : null;
  const previousReading = displayReadings[1] ?? null;
  const recentFlowDelta =
    latest && previousReading
      ? latest.flowLpm - previousReading.flowLpm
      : null;
  const criticalAlerts = activeAlerts.filter(
    (alert) => alert.severity === "critical",
  ).length;
  const affectedDevices = new Set(activeAlerts.map((alert) => alert.deviceId)).size;
  const latestAlert = activeAlerts[0] ?? null;

  const safetyStatus =
    error !== null
      ? "warning"
      : activeAlerts.some((alert) => alert.type === "LEAK")
        ? "danger"
        : activeAlerts.length > 0
          ? "warning"
          : "safe";

  const safetyMessage =
    error !== null
      ? "Some dashboard services are unavailable. Live values may be stale."
      : safetyStatus === "danger"
        ? "LEAK DETECTED — Consider closing the main valve immediately."
        : "Unusual water flow detected. Please check your devices.";

  const sharedValveCard = (
    <ValveControlCard
      deviceName={deviceState?.name ?? deviceState?.id ?? DEVICE_ID}
      state={isOpen ? "Open" : "Closed"}
      buttonLabel={isOpen ? "Close Valve" : "Open Valve"}
      onToggle={handleToggleValve}
      loading={togglingValve}
      disabled={!canToggleValve}
      helperText={
        canToggleValve
          ? undefined
          : "Your role can view the dashboard but cannot control the valve."
      }
    />
  );

  function renderOverview() {
    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Current Flow Rate"
            value={latest ? latest.flowLpm.toFixed(2) : "—"}
            unit="L/min"
            icon={DropletsIcon}
            color="blue"
            subtitle="Real-time measurement"
            loading={isInitialLoading}
          />

          <MetricCard
            title="Today's Total Usage"
            value={today ? today.litresToday.toFixed(1) : "—"}
            unit="L"
            icon={TrendingUpIcon}
            color="cyan"
            subtitle="Since midnight"
            loading={isInitialLoading}
          />

          <MetricCard
            title="Pressure"
            value={formatNumber(latest?.pressureBar ?? null)}
            unit="bar"
            icon={GaugeIcon}
            color="green"
            subtitle="Latest reading"
            loading={isInitialLoading}
          />

          <MetricCard
            title="Active Alerts"
            value={String(activeAlerts.length)}
            icon={BellIcon}
            color={activeAlerts.length > 0 ? "red" : "green"}
            subtitle={
              activeAlerts.length === 0 ? "All systems normal" : "Needs attention"
            }
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FlowChart readings={displayReadings} loading={isInitialLoading} />
          </div>

          {sharedValveCard}

          <div className="lg:col-span-2">
            <AlertsPanel
              alerts={activeAlerts.slice(0, 4)}
              loading={isInitialLoading}
            />
          </div>

          <DevicesPanel devices={displayDevices} loading={isInitialLoading} />

          {user?.role === "admin" ? (
            <div className="lg:col-span-3">
              <AdminUsersPanel currentUserId={user.id} />
            </div>
          ) : null}
        </section>
      </>
    );
  }

  function renderDevicesView() {
    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Registered Devices"
            value={String(displayDevices.length)}
            icon={CpuIcon}
            color="blue"
            subtitle="Detected by the API"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Open Valves"
            value={String(openValves)}
            icon={PowerIcon}
            color={openValves > 0 ? "green" : "amber"}
            subtitle="Currently allowing flow"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Offline Devices"
            value={String(offlineDevices)}
            icon={WifiIcon}
            color={offlineDevices > 0 ? "red" : "green"}
            subtitle="Needs connectivity check"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Control Access"
            value={canToggleValve ? "Enabled" : "View"}
            icon={ShieldCheckIcon}
            color={canToggleValve ? "cyan" : "amber"}
            subtitle={user?.role ? `Role: ${user.role}` : "No role available"}
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DevicesPanel
              devices={displayDevices}
              loading={isInitialLoading}
              maxItems={Math.max(displayDevices.length, 4)}
            />
          </div>

          {sharedValveCard}

          <div className="lg:col-span-3">
            <SectionCard
              title="Device Fleet"
              subtitle="Live device health, connectivity, and control state."
            >
              {displayDevices.length === 0 && !isInitialLoading ? (
                <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  No devices are available yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {displayDevices.map((device) => (
                    <div
                      key={device.id}
                      className="flex flex-col gap-3 rounded-xl border border-border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {device.name ?? device.id}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {device.location ?? "No location assigned"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Last seen {formatDateTime(device.last_seen)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium capitalize",
                            getDeviceStatusTone(device.status),
                          )}
                        >
                          {device.status ?? "online"}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            device.is_on
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {device.is_on ? "Valve open" : "Valve closed"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>
          </div>
        </section>
      </>
    );
  }

  function renderTelemetryView() {
    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Current Flow Rate"
            value={latest ? latest.flowLpm.toFixed(2) : "—"}
            unit="L/min"
            icon={ActivityIcon}
            color="blue"
            subtitle="Latest sample"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Today's Total Usage"
            value={today ? today.litresToday.toFixed(1) : "—"}
            unit="L"
            icon={TrendingUpIcon}
            color="cyan"
            subtitle="Accumulated today"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Samples Loaded"
            value={String(telemetrySamples)}
            icon={BarChart3Icon}
            color="green"
            subtitle="Recent history in memory"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Last Sample"
            value={latest ? formatRelativeTime(latest.timestamp) : "—"}
            icon={DropletsIcon}
            color="amber"
            subtitle={latest ? formatDateTime(latest.timestamp) : "Waiting for telemetry"}
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FlowChart readings={displayReadings} loading={isInitialLoading} />
          </div>

          <SectionCard
            title="Latest Sample"
            subtitle="Most recent measurement received for the selected device."
          >
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Timestamp
                </p>
                <p className="mt-2 text-sm font-semibold text-foreground">
                  {latest ? formatDateTime(latest.timestamp) : "No telemetry available"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Flow</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {latest ? `${latest.flowLpm.toFixed(2)} L/min` : "—"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-4">
                  <p className="text-xs text-muted-foreground">Pressure</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {latest?.pressureBar !== null && latest?.pressureBar !== undefined
                      ? `${latest.pressureBar.toFixed(2)} bar`
                      : "—"}
                  </p>
                </div>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs text-muted-foreground">Temperature</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {latest?.temperatureC !== null && latest?.temperatureC !== undefined
                    ? `${latest.temperatureC.toFixed(1)}°C`
                    : "—"}
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="lg:col-span-3">
            <SectionCard
              title="Recent Telemetry"
              subtitle="Newest readings first for quick inspection."
            >
              {displayReadings.length === 0 && !isInitialLoading ? (
                <div className="rounded-xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  No telemetry history is available yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="text-left text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      <tr>
                        <th className="pb-3 pr-4 font-medium">Timestamp</th>
                        <th className="pb-3 pr-4 font-medium">Flow</th>
                        <th className="pb-3 pr-4 font-medium">Pressure</th>
                        <th className="pb-3 font-medium">Temperature</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {displayReadings.slice(0, 10).map((reading) => (
                        <tr key={reading.id ?? reading.timestamp}>
                          <td className="py-3 pr-4 text-foreground">
                            {formatDateTime(reading.timestamp)}
                          </td>
                          <td className="py-3 pr-4 text-foreground">
                            {reading.flowLpm.toFixed(2)} L/min
                          </td>
                          <td className="py-3 pr-4 text-muted-foreground">
                            {reading.pressureBar !== null &&
                            reading.pressureBar !== undefined
                              ? `${reading.pressureBar.toFixed(2)} bar`
                              : "—"}
                          </td>
                          <td className="py-3 text-muted-foreground">
                            {reading.temperatureC !== null &&
                            reading.temperatureC !== undefined
                              ? `${reading.temperatureC.toFixed(1)}°C`
                              : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </SectionCard>
          </div>
        </section>
      </>
    );
  }

  function renderAlertsView() {
    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Active Alerts"
            value={String(activeAlerts.length)}
            icon={BellIcon}
            color={activeAlerts.length > 0 ? "red" : "green"}
            subtitle="Currently unresolved"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Critical Alerts"
            value={String(criticalAlerts)}
            icon={AlertTriangleIcon}
            color={criticalAlerts > 0 ? "red" : "green"}
            subtitle="Highest severity incidents"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Affected Devices"
            value={String(affectedDevices)}
            icon={CpuIcon}
            color="amber"
            subtitle="Devices with active alerts"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Latest Alert"
            value={latestAlert ? formatRelativeTime(latestAlert.timestamp) : "—"}
            icon={ActivityIcon}
            color="blue"
            subtitle={
              latestAlert
                ? formatDateTime(latestAlert.timestamp)
                : "No active alerts"
            }
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AlertsPanel
              alerts={activeAlerts}
              loading={isInitialLoading}
              actionHref={null}
            />
          </div>

          <SectionCard
            title="Response Guidance"
            subtitle="Quick context for the current alert load."
          >
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Safety posture
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {safetyMessage}
                </p>
              </div>
              <div className="space-y-2">
                {activeAlerts.length === 0 ? (
                  <div className="rounded-xl bg-emerald-500/10 p-4 text-sm text-emerald-700">
                    No active alerts. The system is reporting a stable state.
                  </div>
                ) : (
                  activeAlerts.slice(0, 3).map((alert) => (
                    <div
                      key={alert.id}
                      className="rounded-xl border border-border bg-muted/20 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-foreground">
                          {alert.deviceName ?? alert.deviceId}
                        </p>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            getAlertSeverityTone(alert.severity),
                          )}
                        >
                          {alert.severity ?? "medium"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {alert.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </SectionCard>
        </section>
      </>
    );
  }

  function renderAnalyticsView() {
    const trendLabel =
      recentFlowDelta === null
        ? "Waiting for enough telemetry to measure the latest change."
        : recentFlowDelta > 0
          ? `Flow increased by ${recentFlowDelta.toFixed(2)} L/min between the latest two readings.`
          : recentFlowDelta < 0
            ? `Flow decreased by ${Math.abs(recentFlowDelta).toFixed(2)} L/min between the latest two readings.`
            : "The latest two readings are stable.";

    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Average Flow"
            value={formatNumber(flowAverage)}
            unit="L/min"
            icon={TrendingUpIcon}
            color="blue"
            subtitle="Across recent samples"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Peak Flow"
            value={peakReading ? peakReading.flowLpm.toFixed(2) : "—"}
            unit="L/min"
            icon={BarChart3Icon}
            color="cyan"
            subtitle={
              peakReading
                ? formatRelativeTime(peakReading.timestamp)
                : "No telemetry available"
            }
            loading={isInitialLoading}
          />
          <MetricCard
            title="Lowest Flow"
            value={lowestReading ? lowestReading.flowLpm.toFixed(2) : "—"}
            unit="L/min"
            icon={GaugeIcon}
            color="green"
            subtitle="Recent minimum"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Samples Analyzed"
            value={String(telemetrySamples)}
            icon={ActivityIcon}
            color="amber"
            subtitle="Pulled from recent history"
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <FlowChart readings={displayReadings} loading={isInitialLoading} />
          </div>

          <SectionCard
            title="Trend Summary"
            subtitle="High-level interpretation of the loaded readings."
          >
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Latest movement
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {trendLabel}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Peak observation
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {peakReading
                    ? `${peakReading.flowLpm.toFixed(2)} L/min at ${formatDateTime(peakReading.timestamp)}`
                    : "No peak can be calculated without telemetry."}
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Device availability
                </p>
                <p className="mt-2 text-sm font-medium text-foreground">
                  {onlineDevices} online, {offlineDevices} offline, {activeAlerts.length} active alerts.
                </p>
              </div>
            </div>
          </SectionCard>

          <div className="lg:col-span-3">
            <SectionCard
              title="Operational Snapshot"
              subtitle="A combined read on flow, safety, and device readiness."
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-muted/30 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Consumption today
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {today ? `${today.litresToday.toFixed(1)} L` : "—"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Total accumulated since local midnight.
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/30 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Valve state
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {isOpen ? "Open" : "Closed"}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Primary device {deviceState?.name ?? DEVICE_ID} is currently {isOpen ? "allowing" : "blocking"} flow.
                  </p>
                </div>
                <div className="rounded-2xl bg-muted/30 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Safety status
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground capitalize">
                    {safetyStatus}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {safetyMessage}
                  </p>
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </>
    );
  }

  function renderSettingsView() {
    return (
      <>
        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="User Role"
            value={user?.role ?? "—"}
            icon={UserIcon}
            color="blue"
            subtitle={user?.name ?? "No user loaded"}
            loading={isInitialLoading}
          />
          <MetricCard
            title="System Status"
            value={error ? "Degraded" : "Online"}
            icon={SettingsIcon}
            color={error ? "amber" : "green"}
            subtitle={error ?? "Connected to live services"}
            loading={isInitialLoading}
          />
          <MetricCard
            title="Auto Refresh"
            value="5 sec"
            icon={ActivityIcon}
            color="cyan"
            subtitle="Dashboard polling cadence"
            loading={isInitialLoading}
          />
          <MetricCard
            title="Managed Device"
            value={deviceState?.name ?? deviceState?.id ?? DEVICE_ID}
            icon={CpuIcon}
            color="amber"
            subtitle="Primary device target"
            loading={isInitialLoading}
          />
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard
            title="Account"
            subtitle="Current authenticated user for this dashboard session."
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Name
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {user?.name ?? "Unknown user"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Email
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {user?.email ?? "Unavailable"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Permissions
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {canToggleValve
                    ? "Can monitor devices and control valves."
                    : "Can monitor devices only."}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="System Connection"
            subtitle="Current runtime settings for the web dashboard."
          >
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  API Base URL
                </p>
                <p className="mt-1 break-all text-sm font-medium text-foreground">
                  {API_BASE}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Last sync
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(lastUpdated)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Status message
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {error ?? "All monitored services responded successfully."}
                </p>
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Dashboard Behavior"
            subtitle="The current monitoring profile for this interface."
          >
            <div className="space-y-3">
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Live polling every 5 seconds keeps tab data fresh without a reload.
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Alerts, telemetry, and device state are all read from the local API on each refresh cycle.
                </p>
              </div>
              <div className="rounded-xl bg-muted/30 p-4">
                <p className="text-sm font-medium text-foreground">
                  Sidebar navigation now maps each tab to its own route so the selected page stays addressable.
                </p>
              </div>
            </div>
          </SectionCard>

          {user?.role === "admin" ? (
            <div className="lg:col-span-3">
              <AdminUsersPanel currentUserId={user.id} />
            </div>
          ) : null}
        </section>
      </>
    );
  }

  function renderActiveView() {
    switch (activeTab) {
      case "devices":
        return renderDevicesView();
      case "telemetry":
        return renderTelemetryView();
      case "alerts":
        return renderAlertsView();
      case "analytics":
        return renderAnalyticsView();
      case "settings":
        return renderSettingsView();
      case "dashboard":
      default:
        return renderOverview();
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppSidebar
        activeTab={activeTab}
        systemOnline={error === null}
        user={user}
        onLogout={logout}
      />

      <main className="min-h-screen flex-1 pt-14 md:ml-64 md:pt-0">
        <div className="p-8">
          <DashboardHeader
            title={pageMeta.title}
            description={pageMeta.description}
            lastUpdated={lastUpdated}
            onRefresh={fetchDashboardData}
            refreshing={refreshing}
          />

          <SafetyBanner status={safetyStatus} message={safetyMessage} />

          {renderActiveView()}
        </div>
      </main>
    </div>
  );
}
