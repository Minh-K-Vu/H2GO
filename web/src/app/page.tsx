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

export default function Home() {
  const [latest, setLatest] = useState<LatestReading | null>(null);
  const [today, setToday] = useState<TodayTotal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchDashboardData() {
    try {
      setError(null);

      const [latestRes, todayRes] = await Promise.all([
        fetch(`${API_BASE}/devices/${DEVICE_ID}/latest`),
        fetch(`${API_BASE}/devices/${DEVICE_ID}/today-total`),
      ]);

      if (!latestRes.ok) {
        throw new Error("Failed to load latest reading");
      }

      if (!todayRes.ok) {
        throw new Error("Failed to load today's total");
      }

      const latestData: LatestReading = await latestRes.json();
      const todayData: TodayTotal = await todayRes.json();

      setLatest(latestData);
      setToday(todayData);
    } catch (err) {
      console.error(err);
      setError("Could not load dashboard data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-6xl p-6">
          <p className="text-sm text-zinc-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <div className="mx-auto max-w-6xl p-6">
        <DashboardHeader
          title="Water Guard Dashboard"
          description="Monitor flow, detect leaks, and control the valve remotely."
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

          <ValveControlCard state="Open" buttonLabel="Turn Off Valve" />
        </section>

        <AlertsPanel
          total={0}
          message={error ? "Unable to load alerts yet." : "No alerts yet."}
        />
      </div>
    </div>
  );
}
