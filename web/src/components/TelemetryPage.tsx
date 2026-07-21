"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardPageShell from "@/components/DashboardPageShell";
import FlowChart from "@/components/FlowChart";
import {
  ActivityIcon,
  ChevronDownIcon,
  FilterIcon,
  GaugeIcon,
  PlusIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  XIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import { formatShortDateTime, formatTimeOnly } from "@/lib/time";
import { cn } from "@/lib/cn";

type Device = {
  id: string;
  name: string;
  location: string | null;
  status: "online" | "offline" | "warning";
  is_on: boolean;
  last_seen: string | null;
};

type TelemetryReading = {
  id: string;
  device_id: string;
  device_name: string | null;
  flow_lpm: number;
  pressure_bar: number | null;
  temperature_c: number | null;
  timestamp: string;
  created_date: string;
};

type TelemetryFormState = {
  device_id: string;
  flow_lpm: string;
  pressure_bar: string;
  temperature_c: string;
};

const defaultFormState: TelemetryFormState = {
  device_id: "",
  flow_lpm: "",
  pressure_bar: "",
  temperature_c: "",
};

const SVG_WIDTH = 640;
const SVG_HEIGHT = 220;
const CHART_PADDING = {
  top: 18,
  right: 12,
  bottom: 32,
  left: 12,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

function PressureChart({
  readings,
  loading = false,
}: {
  readings: TelemetryReading[];
  loading?: boolean;
}) {
  const data = readings
    .slice()
    .reverse()
    .filter((reading) => reading.pressure_bar !== null)
    .slice(-20);

  if (loading) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <div className="mb-2 h-5 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-44 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="h-[200px] animate-pulse rounded-xl bg-muted/50" />
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-lg">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Pressure Readings</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Bar values across the latest readings
          </p>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex h-[200px] items-center justify-center rounded-xl bg-muted/30 text-sm text-muted-foreground">
          No pressure history available yet.
        </div>
      ) : (
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="h-[200px] w-full overflow-visible"
          role="img"
          aria-label="Pressure trend chart"
        >
          {Array.from({ length: 4 }).map((_, index) => {
            const y =
              CHART_PADDING.top +
              (index / 3) * (SVG_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom);

            return (
              <line
                key={index}
                x1={CHART_PADDING.left}
                y1={y}
                x2={SVG_WIDTH - CHART_PADDING.right}
                y2={y}
                stroke="hsl(var(--border))"
                strokeDasharray="4 6"
              />
            );
          })}

          {(() => {
            const chartWidth = SVG_WIDTH - CHART_PADDING.left - CHART_PADDING.right;
            const chartHeight = SVG_HEIGHT - CHART_PADDING.top - CHART_PADDING.bottom;
            const barSlot = chartWidth / data.length;
            const barWidth = Math.max(8, barSlot * 0.55);
            const maxPressure = Math.max(
              ...data.map((reading) => reading.pressure_bar ?? 0),
              2,
            );
            const labelIndexes = [0, 0.25, 0.5, 0.75, 1].map((ratio) =>
              Math.min(data.length - 1, Math.round((data.length - 1) * ratio)),
            );

            return (
              <>
                {data.map((reading, index) => {
                  const value = reading.pressure_bar ?? 0;
                  const height = (value / maxPressure) * chartHeight;
                  const x =
                    CHART_PADDING.left + index * barSlot + (barSlot - barWidth) / 2;
                  const y = CHART_PADDING.top + chartHeight - height;

                  return (
                    <rect
                      key={reading.id}
                      x={x}
                      y={y}
                      width={barWidth}
                      height={height}
                      rx="6"
                      fill="hsl(var(--accent))"
                      opacity={0.95}
                    />
                  );
                })}

                {labelIndexes.map((index, labelIndex) => {
                  const reading = data[index];
                  const x = CHART_PADDING.left + index * barSlot + barSlot / 2;

                  return (
                    <text
                      key={`${reading.id}-${labelIndex}`}
                      x={x}
                      y={SVG_HEIGHT - 8}
                      fill="hsl(var(--muted-foreground))"
                      fontSize="11"
                      textAnchor={
                        labelIndex === 0
                          ? "start"
                          : labelIndex === labelIndexes.length - 1
                            ? "end"
                            : "middle"
                      }
                    >
                      {formatTimeOnly(reading.created_date)}
                    </text>
                  );
                })}
              </>
            );
          })()}
        </svg>
      )}
    </section>
  );
}

export default function TelemetryPage() {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [readings, setReadings] = useState<TelemetryReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [filterDevice, setFilterDevice] = useState("all");
  const [form, setForm] = useState<TelemetryFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchTelemetryData = useCallback(async () => {
    setRefreshing(true);

    try {
      const [telemetryData, deviceData] = await Promise.all([
        apiRequest<TelemetryReading[]>("/telemetry?sort=-created_date&limit=100"),
        apiRequest<Device[]>("/devices?sort=-created_date&limit=50"),
      ]);

      setReadings(telemetryData);
      setDevices(deviceData);
      setError(null);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load telemetry."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchTelemetryData();
  }, [fetchTelemetryData]);

  const filteredReadings = useMemo(() => {
    if (filterDevice === "all") {
      return readings;
    }

    return readings.filter((reading) => reading.device_id === filterDevice);
  }, [filterDevice, readings]);

  const flowChartReadings = useMemo(
    () =>
      filteredReadings.slice(0, 40).map((reading) => ({
        timestamp: reading.created_date,
        flowLpm: reading.flow_lpm,
      })),
    [filteredReadings],
  );

  const totalReadings = filteredReadings.length;
  const averageFlow =
    totalReadings > 0
      ? (
          filteredReadings.reduce((total, reading) => total + reading.flow_lpm, 0) /
          totalReadings
        ).toFixed(2)
      : "—";
  const maxFlow =
    totalReadings > 0
      ? Math.max(...filteredReadings.map((reading) => reading.flow_lpm)).toFixed(2)
      : "—";

  const systemOnline =
    devices.length === 0 || devices.some((device) => device.status !== "offline");

  async function handleSubmit() {
    if (!form.device_id || !form.flow_lpm) {
      return;
    }

    setSaving(true);

    try {
      await apiRequest("/telemetry", {
        method: "POST",
        body: JSON.stringify({
          device_id: form.device_id,
          flow_lpm: Number(form.flow_lpm),
          pressure_bar: form.pressure_bar ? Number(form.pressure_bar) : null,
          temperature_c: form.temperature_c ? Number(form.temperature_c) : null,
          timestamp: new Date().toISOString(),
        }),
      });

      setShowModal(false);
      setForm(defaultFormState);
      await fetchTelemetryData();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to log telemetry reading."));
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardPageShell
      activeTab="telemetry"
      title="Telemetry"
      description="Inspect live readings, filters, and sensor history."
      lastUpdated={lastUpdated}
      onRefresh={() => void fetchTelemetryData()}
      refreshing={refreshing}
      systemOnline={systemOnline}
      user={user}
      onLogout={logout}
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <label className="relative flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            <select
              value={filterDevice}
              onChange={(event) => setFilterDevice(event.target.value)}
              className="appearance-none bg-transparent pr-5 text-sm text-foreground focus:outline-none"
            >
              <option value="all">All Devices</option>
              {devices.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 h-4 w-4 text-muted-foreground" />
          </label>

          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={devices.length === 0}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <PlusIcon className="h-4 w-4" />
            Log Reading
          </button>
        </div>
      }
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            label: "Total Readings",
            value: loading ? "—" : totalReadings.toString(),
            icon: ActivityIcon,
          },
          {
            label: "Avg Flow Rate",
            value: loading ? "—" : `${averageFlow} L/min`,
            icon: TrendingUpIcon,
          },
          {
            label: "Max Flow Rate",
            value: loading ? "—" : `${maxFlow} L/min`,
            icon: GaugeIcon,
          },
        ].map(({ label, value, icon: Icon }) => (
          <div
            key={label}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FlowChart readings={flowChartReadings} loading={loading} />
        <PressureChart readings={filteredReadings.slice(0, 40)} loading={loading} />
      </div>

      <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
        <div className="border-b border-border px-6 py-4">
          <h3 className="font-semibold text-foreground">Reading History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Device
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Flow (L/min)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Pressure (bar)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                  Temperature (°C)
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 8 }).map((_, index) => (
                  <tr key={index} className="border-b border-border">
                    {Array.from({ length: 5 }).map((__, cellIndex) => (
                      <td key={cellIndex} className="px-6 py-4">
                        <div className="h-4 animate-pulse rounded bg-muted" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredReadings.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-muted-foreground"
                  >
                    No telemetry readings match the selected filter yet.
                  </td>
                </tr>
              ) : (
                filteredReadings.slice(0, 50).map((reading) => (
                  <tr
                    key={reading.id}
                    className="border-b border-border transition-colors hover:bg-muted/30"
                  >
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {formatShortDateTime(reading.created_date)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {reading.device_name ?? reading.device_id}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={cn(
                          "text-sm font-semibold",
                          reading.flow_lpm > 2.5 ? "text-destructive" : "text-foreground",
                        )}
                      >
                        {reading.flow_lpm.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reading.pressure_bar !== null
                        ? reading.pressure_bar.toFixed(2)
                        : "—"}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {reading.temperature_c !== null
                        ? `${reading.temperature_c.toFixed(1)}°`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                Log Telemetry Reading
              </h2>
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

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Flow Rate (L/min) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={form.flow_lpm}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      flow_lpm: event.target.value,
                    }))
                  }
                  placeholder="e.g. 1.5"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Pressure (bar)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.pressure_bar}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        pressure_bar: event.target.value,
                      }))
                    }
                    placeholder="e.g. 3.2"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-foreground">
                    Temperature (°C)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.temperature_c}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        temperature_c: event.target.value,
                      }))
                    }
                    placeholder="e.g. 22.5"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
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
                onClick={() => void handleSubmit()}
                disabled={!form.device_id || !form.flow_lpm || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                Log Reading
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPageShell>
  );
}
