"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardPageShell from "@/components/DashboardPageShell";
import {
  AlertTriangleIcon,
  BellIcon,
  CheckCircle2Icon,
  PlusIcon,
  RefreshCwIcon,
  ShieldAlertIcon,
  WifiIcon,
  XIcon,
  InfoIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDistanceToNow } from "@/lib/time";

type Device = {
  id: string;
  name: string;
  status: "online" | "offline" | "warning";
};

type AlertSeverity = "low" | "medium" | "high" | "critical";
type AlertType =
  | "LEAK"
  | "HIGH_FLOW"
  | "LOW_PRESSURE"
  | "DEVICE_OFFLINE"
  | "VALVE_CLOSED";
type AlertFilterStatus = "active" | "resolved" | "all";

type AlertRecord = {
  id: string;
  device_id: string;
  device_name: string | null;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  timestamp: string;
  created_date: string;
};

type AlertFormState = {
  device_id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
};

const alertConfig = {
  LEAK: {
    icon: ShieldAlertIcon,
    color: "text-destructive",
    background: "bg-destructive/10",
    label: "Leak Detected",
  },
  HIGH_FLOW: {
    icon: AlertTriangleIcon,
    color: "text-amber-500",
    background: "bg-amber-500/10",
    label: "High Flow",
  },
  LOW_PRESSURE: {
    icon: InfoIcon,
    color: "text-primary",
    background: "bg-primary/10",
    label: "Low Pressure",
  },
  DEVICE_OFFLINE: {
    icon: WifiIcon,
    color: "text-muted-foreground",
    background: "bg-muted",
    label: "Device Offline",
  },
  VALVE_CLOSED: {
    icon: InfoIcon,
    color: "text-accent",
    background: "bg-accent/10",
    label: "Valve Closed",
  },
} as const;

const severityBadge = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-amber-500/10 text-amber-600",
  medium: "bg-primary/10 text-primary",
  low: "bg-muted text-muted-foreground",
} as const;

const defaultFormState: AlertFormState = {
  device_id: "",
  type: "LEAK",
  severity: "high",
  message: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

export default function AlertsPage() {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<AlertFilterStatus>("active");
  const [form, setForm] = useState<AlertFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const canManage = user?.role === "admin" || user?.role === "operator";

  const fetchAlertsData = useCallback(async () => {
    setRefreshing(true);

    try {
      const [alertData, deviceData] = await Promise.all([
        apiRequest<AlertRecord[]>("/alerts?sort=-created_date&limit=100&status=all"),
        apiRequest<Device[]>("/devices?sort=-created_date&limit=50"),
      ]);

      setAlerts(alertData);
      setDevices(deviceData);
      setError(null);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load alerts."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchAlertsData();
  }, [fetchAlertsData]);

  const filteredAlerts = useMemo(() => {
    if (filterStatus === "active") {
      return alerts.filter((alert) => !alert.is_resolved);
    }

    if (filterStatus === "resolved") {
      return alerts.filter((alert) => alert.is_resolved);
    }

    return alerts;
  }, [alerts, filterStatus]);

  const activeCount = alerts.filter((alert) => !alert.is_resolved).length;
  const resolvedCount = alerts.filter((alert) => alert.is_resolved).length;
  const criticalCount = alerts.filter(
    (alert) => !alert.is_resolved && alert.severity === "critical",
  ).length;
  const systemOnline =
    devices.length === 0 || devices.some((device) => device.status !== "offline");

  async function handleCreateAlert() {
    if (!form.device_id || !form.message.trim()) {
      return;
    }

    setSaving(true);

    try {
      await apiRequest<AlertRecord>("/alerts", {
        method: "POST",
        body: JSON.stringify({
          device_id: form.device_id,
          type: form.type,
          severity: form.severity,
          message: form.message.trim(),
          is_resolved: false,
          timestamp: new Date().toISOString(),
        }),
      });

      setShowModal(false);
      setForm(defaultFormState);
      await fetchAlertsData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to create alert."));
    } finally {
      setSaving(false);
    }
  }

  async function resolveAlert(id: string) {
    setResolvingId(id);

    try {
      await apiRequest<AlertRecord>(`/alerts/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          isResolved: true,
          resolvedAt: new Date().toISOString(),
        }),
      });
      await fetchAlertsData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to resolve alert."));
    } finally {
      setResolvingId(null);
    }
  }

  async function resolveAll() {
    const activeAlerts = alerts.filter((alert) => !alert.is_resolved);

    if (activeAlerts.length === 0) {
      return;
    }

    setResolvingId("__all__");

    try {
      await Promise.all(
        activeAlerts.map((alert) =>
          apiRequest<AlertRecord>(`/alerts/${alert.id}`, {
            method: "PATCH",
            body: JSON.stringify({
              isResolved: true,
              resolvedAt: new Date().toISOString(),
            }),
          }),
        ),
      );
      await fetchAlertsData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to resolve all alerts."));
    } finally {
      setResolvingId(null);
    }
  }

  return (
    <DashboardPageShell
      activeTab="alerts"
      title="Alerts"
      description="Track incidents, resolve active issues, and log manual alerts."
      lastUpdated={lastUpdated}
      onRefresh={() => void fetchAlertsData()}
      refreshing={refreshing}
      systemOnline={systemOnline}
      user={user}
      onLogout={logout}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          {canManage && activeCount > 0 ? (
            <button
              type="button"
              onClick={() => void resolveAll()}
              disabled={resolvingId === "__all__"}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-50"
            >
              {resolvingId === "__all__" ? (
                <RefreshCwIcon className="h-4 w-4 animate-spin text-emerald-500" />
              ) : (
                <CheckCircle2Icon className="h-4 w-4 text-emerald-500" />
              )}
              Resolve All
            </button>
          ) : null}

          {canManage ? (
            <button
              type="button"
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Alert
            </button>
          ) : null}
        </div>
      }
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Total",
            value: loading ? "—" : alerts.length.toString(),
            color: "text-foreground",
            icon: BellIcon,
          },
          {
            label: "Active",
            value: loading ? "—" : activeCount.toString(),
            color: "text-destructive",
            icon: AlertTriangleIcon,
          },
          {
            label: "Resolved",
            value: loading ? "—" : resolvedCount.toString(),
            color: "text-emerald-500",
            icon: CheckCircle2Icon,
          },
          {
            label: "Critical",
            value: loading ? "—" : criticalCount.toString(),
            color: "text-amber-500",
            icon: ShieldAlertIcon,
          },
        ].map(({ label, value, color, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 flex w-fit items-center gap-1 rounded-xl border border-border bg-card p-1">
        {(["active", "resolved", "all"] as const).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilterStatus(status)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition-colors",
              filterStatus === status
                ? "bg-primary text-white"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {status}
          </button>
        ))}
      </div>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle2Icon className="mb-3 h-12 w-12 text-emerald-500" />
            <p className="font-medium text-foreground">All clear!</p>
            <p className="text-sm text-muted-foreground">
              No alerts match the selected filter right now.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAlerts.map((alert) => {
              const config = alertConfig[alert.type];
              const Icon = config.icon;
              const isResolving = resolvingId === alert.id;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    "flex items-start gap-3 rounded-xl border p-4 transition-all",
                    alert.is_resolved
                      ? "border-border bg-muted/30 opacity-60"
                      : "border-border bg-card hover:border-primary/30",
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg",
                      config.background,
                    )}
                  >
                    <Icon className={cn("h-4 w-4", config.color)} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">
                        {config.label}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          severityBadge[alert.severity],
                        )}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">{alert.message}</p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {alert.device_name ?? alert.device_id}
                      </span>
                      <span className="text-muted-foreground">·</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(alert.timestamp)}
                      </span>
                    </div>
                  </div>

                  {!alert.is_resolved && canManage ? (
                    <button
                      type="button"
                      onClick={() => void resolveAlert(alert.id)}
                      disabled={isResolving}
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      aria-label={`Resolve alert ${alert.id}`}
                    >
                      {isResolving ? (
                        <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <XIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">Create Alert</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-muted-foreground transition-colors hover:text-foreground"
                aria-label="Close dialog"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Device *
                </label>
                <select
                  value={form.device_id}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      device_id: event.target.value,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">Select device...</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Type *
                  </label>
                  <select
                    value={form.type}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        type: event.target.value as AlertType,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {(
                      [
                        "LEAK",
                        "HIGH_FLOW",
                        "LOW_PRESSURE",
                        "DEVICE_OFFLINE",
                        "VALVE_CLOSED",
                      ] as const
                    ).map((type) => (
                      <option key={type} value={type}>
                        {type.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Severity *
                  </label>
                  <select
                    value={form.severity}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        severity: event.target.value as AlertSeverity,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {(["low", "medium", "high", "critical"] as const).map(
                      (severity) => (
                        <option key={severity} value={severity}>
                          {severity}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Message *
                </label>
                <textarea
                  value={form.message}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      message: event.target.value,
                    }))
                  }
                  placeholder="Describe the alert..."
                  rows={3}
                  className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleCreateAlert()}
                disabled={!form.device_id || !form.message.trim() || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                Create Alert
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPageShell>
  );
}
