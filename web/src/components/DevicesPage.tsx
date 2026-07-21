"use client";

import { useCallback, useEffect, useState } from "react";
import DashboardPageShell from "@/components/DashboardPageShell";
import {
  CheckCircle2Icon,
  CpuIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  PowerIcon,
  RefreshCwIcon,
  Trash2Icon,
  WifiIcon,
  WifiOffIcon,
  XIcon,
} from "@/components/icons";
import { useAuth } from "@/lib/AuthContext";
import { apiRequest, ApiError } from "@/lib/api";
import { cn } from "@/lib/cn";
import { formatDistanceToNow } from "@/lib/time";

type DeviceStatus = "online" | "offline" | "warning";

type Device = {
  id: string;
  name: string;
  location: string | null;
  status: DeviceStatus;
  is_on: boolean;
  last_seen: string | null;
  created_date: string;
  updated_date: string;
};

type DeviceFormState = {
  name: string;
  location: string;
  status: DeviceStatus;
  is_on: boolean;
};

const defaultFormState: DeviceFormState = {
  name: "",
  location: "",
  status: "online",
  is_on: true,
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return fallback;
}

export default function DevicesPage() {
  const { user, logout } = useAuth();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busyDeviceId, setBusyDeviceId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);
  const [form, setForm] = useState<DeviceFormState>(defaultFormState);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const canManage = user?.role === "admin" || user?.role === "operator";
  const canDelete = user?.role === "admin";

  const fetchDevices = useCallback(async () => {
    setRefreshing(true);

    try {
      const data = await apiRequest<Device[]>("/devices?sort=-created_date&limit=50");
      setDevices(data);
      setError(null);
      setLastUpdated(new Date());
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to load devices."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchDevices();
  }, [fetchDevices]);

  function closeModal() {
    setShowModal(false);
    setEditingDevice(null);
    setForm(defaultFormState);
  }

  function openAddModal() {
    setEditingDevice(null);
    setForm(defaultFormState);
    setShowModal(true);
  }

  function openEditModal(device: Device) {
    setEditingDevice(device);
    setForm({
      name: device.name,
      location: device.location ?? "",
      status: device.status,
      is_on: device.is_on,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      location: form.location.trim() || null,
      status: form.status,
      is_on: form.is_on,
      last_seen: new Date().toISOString(),
    };

    try {
      if (editingDevice) {
        await apiRequest<Device>(`/devices/${editingDevice.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest<Device>("/devices", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      closeModal();
      await fetchDevices();
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          editingDevice ? "Failed to update device." : "Failed to create device.",
        ),
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(device: Device) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(
      `Delete ${device.name}? This removes the device from the H2GO system.`,
    );

    if (!confirmed) {
      return;
    }

    setBusyDeviceId(device.id);

    try {
      await apiRequest<{ ok: boolean }>(`/devices/${device.id}`, {
        method: "DELETE",
      });
      await fetchDevices();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to delete device."));
    } finally {
      setBusyDeviceId(null);
    }
  }

  async function toggleValve(device: Device) {
    if (!canManage) {
      return;
    }

    setBusyDeviceId(device.id);

    try {
      await apiRequest<{ ok: boolean }>(`/devices/${device.id}/power`, {
        method: "POST",
        body: JSON.stringify({
          isOn: !device.is_on,
        }),
      });
      await fetchDevices();
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Failed to update device valve."));
    } finally {
      setBusyDeviceId(null);
    }
  }

  const systemOnline =
    devices.length === 0 || devices.some((device) => device.status !== "offline");

  return (
    <DashboardPageShell
      activeTab="devices"
      title="Devices"
      description="Manage your H2GO monitoring devices."
      lastUpdated={lastUpdated}
      onRefresh={() => void fetchDevices()}
      refreshing={refreshing}
      systemOnline={systemOnline}
      user={user}
      onLogout={logout}
      actions={
        canManage ? (
          <button
            type="button"
            onClick={openAddModal}
            className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors hover:bg-primary/90"
          >
            <PlusIcon className="h-4 w-4" />
            Add Device
          </button>
        ) : null
      }
    >
      {error ? (
        <div className="mb-6 rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : devices.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-24 text-center shadow-lg">
          <CpuIcon className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h3 className="text-lg font-semibold text-foreground">No devices yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add your first H2GO monitoring device to get started.
          </p>
          {canManage ? (
            <button
              type="button"
              onClick={openAddModal}
              className="mt-6 flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
            >
              <PlusIcon className="h-4 w-4" />
              Add Device
            </button>
          ) : null}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {devices.map((device) => {
            const isBusy = busyDeviceId === device.id;
            const isOnline = device.status === "online";

            return (
              <div
                key={device.id}
                className="group rounded-2xl border border-border bg-card p-6 shadow-lg transition-all hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-xl",
                        isOnline ? "bg-primary/10" : "bg-muted",
                      )}
                    >
                      <CpuIcon
                        className={cn(
                          "h-5 w-5",
                          isOnline ? "text-primary" : "text-muted-foreground",
                        )}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{device.name}</h3>
                      <div className="mt-0.5 flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {device.location ?? "No location"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {canManage ? (
                    <div className="flex items-center gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => openEditModal(device)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${device.name}`}
                      >
                        <PencilIcon className="h-3.5 w-3.5" />
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          onClick={() => void handleDelete(device)}
                          disabled={isBusy}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-wait disabled:opacity-60"
                          aria-label={`Delete ${device.name}`}
                        >
                          {isBusy ? (
                            <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2Icon className="h-3.5 w-3.5" />
                          )}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      {isOnline ? (
                        <WifiIcon className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <WifiOffIcon className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="text-sm capitalize text-foreground">
                        {device.status}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "h-2 w-2 rounded-full",
                        isOnline ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground",
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                    <span className="text-sm text-muted-foreground">Valve</span>
                    <button
                      type="button"
                      onClick={() => void toggleValve(device)}
                      disabled={!canManage || isBusy}
                      className={cn(
                        "flex items-center gap-1.5 rounded-lg px-3 py-1 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60",
                        device.is_on
                          ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80",
                      )}
                    >
                      {isBusy ? (
                        <RefreshCwIcon className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <PowerIcon className="h-3.5 w-3.5" />
                      )}
                      {device.is_on ? "Open" : "Closed"}
                    </button>
                  </div>

                  {device.last_seen ? (
                    <p className="px-1 text-xs text-muted-foreground">
                      Last seen {formatDistanceToNow(device.last_seen)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-7 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">
                {editingDevice ? "Edit Device" : "Add New Device"}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-muted"
                aria-label="Close dialog"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Device Name *
                </label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Kitchen Sensor"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Location
                </label>
                <input
                  value={form.location}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      location: event.target.value,
                    }))
                  }
                  placeholder="e.g. Backyard, Main Line"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      status: event.target.value as DeviceStatus,
                    }))
                  }
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="online">Online</option>
                  <option value="offline">Offline</option>
                  <option value="warning">Warning</option>
                </select>
              </div>

              <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-4">
                <span className="flex-1 text-sm font-medium text-foreground">
                  Valve Open on Start
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      is_on: !current.is_on,
                    }))
                  }
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    form.is_on ? "bg-primary" : "bg-muted-foreground/40",
                  )}
                  aria-pressed={form.is_on}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
                      form.is_on ? "translate-x-5" : "translate-x-0.5",
                    )}
                  />
                </button>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleSave()}
                disabled={!form.name.trim() || saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCwIcon className="h-4 w-4 animate-spin" />
                ) : editingDevice ? (
                  <CheckCircle2Icon className="h-4 w-4" />
                ) : (
                  <PlusIcon className="h-4 w-4" />
                )}
                {editingDevice ? "Save Changes" : "Add Device"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </DashboardPageShell>
  );
}
