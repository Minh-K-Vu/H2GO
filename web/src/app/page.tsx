"use client";

import { useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import SafetyBanner from "@/components/SafetyBanner";
import MetricCard from "@/components/MetricCard";
import ValveControlCard from "@/components/ValveControlCard";
import AlertsPanel from "@/components/AlertsPanel";

const API_BASE = "http://localhost:4000";
const DEVICE_ID = "dev-1";

type LatestReading = {
  deviceId: string;
  flowLpm: number;
  timestamp: string;
};

type TodayTotal = {
  deviceId: string;
  litresToday: number;
};

type DeviceState = {
  id: string;
  is_on: boolean;
};

type Alert = {
  id: number;
  deviceId: string;
  type: string;
  message: string;
  timestamp: string;
};

export default function Home() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [today, setToday] = useState<TodayTotal | null>(null);
  const [deviceState, setDeviceState] = useState<DeviceState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  async function fetchDashboardData() {
    try {
      setError(null);

      const [latestRes, todayRes, deviceRes, alertsRes] = await Promise.all([
        fetch(`${API_BASE}/devices/${DEVICE_ID}/latest`),
        fetch(`${API_BASE}/devices/${DEVICE_ID}/today-total`),
        fetch(`${API_BASE}/devices/${DEVICE_ID}`),
        fetch(`${API_BASE}/devices/${DEVICE_ID}/alerts`),
      ]);

      if (!latestRes.ok) {
        throw new Error("Failed to load latest reading");
      }

      if (!todayRes.ok) {
        throw new Error("Failed to load today's total");
      }

      if (!deviceRes.ok) {
        throw new Error("Failed to load device state");
      }

      if (!alertsRes.ok) {
        throw new Error("Failed to load alerts");
      }

      const latestData: LatestReading = await latestRes.json();
      const todayData: TodayTotal = await todayRes.json();
      const deviceData: DeviceState = await deviceRes.json();
      const alertsData: Alert[] = await alertsRes.json();

      setLatest(latestData);
      setToday(todayData);
      setDeviceState(deviceData);
      setAlerts(alertsData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleValve() {
    if (!deviceState) return;

    const nextState = !deviceState.is_on;

    try {
      const res = await fetch(`${API_BASE}/devices/${DEVICE_ID}/power`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isOn: nextState,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to update valve state");
      }

      await fetchDashboardData();
    } catch (err) {
      console.error(err);
      setError("Could not update valve state");
    }
  }

  useEffect(() => {
    fetchDashboardData();

    const intervalId = setInterval(() => {
      fetchDashboardData();
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-6xl p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-zinc-200" />
            <div className="h-12 rounded bg-zinc-200" />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <div className="h-32 rounded-xl bg-zinc-200" />
              <div className="h-32 rounded-xl bg-zinc-200" />
              <div className="h-32 rounded-xl bg-zinc-200" />
              <div className="h-32 rounded-xl bg-zinc-200" />
            </div>
            <div className="h-40 rounded-xl bg-zinc-200" />
          </div>
        </div>
      </div>
    );
  }

  const isOpen = deviceState?.is_on ?? false;

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        <DashboardHeader
          title="Water Guard Dashboard"
          description="Monitor flow, detect leaks, and control the valve remotely."
          lastUpdated={lastUpdated}
          onRefresh={fetchDashboardData}
        />

        <SafetyBanner
          status={error ? "warning" : "safe"}
          message={error ? "DATA UNAVAILABLE" : "SYSTEM SAFE"}
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Current Flow"
            value={latest ? latest.flowLpm.toFixed(2) : "—"}
            unit="L/min"
            subtitle={
              latest
                ? `Last updated: ${new Date(latest.timestamp).toLocaleString()}`
                : "No reading available"
            }
          />

          <MetricCard
            title="Today's Usage"
            value={today ? today.litresToday.toFixed(1) : "—"}
            unit="L"
            subtitle="Usage since midnight"
          />

          <MetricCard
            title="Leak Status"
            value={error ? "Unknown" : "Normal"}
          />

          <ValveControlCard
            state={isOpen ? "Open" : "Closed"}
            buttonLabel={isOpen ? "Turn Off Valve" : "Turn On Valve"}
            onToggle={handleToggleValve}
          />
        </section>

        <AlertsPanel alerts={alerts} />
      </div>
    </div>
  );
}
