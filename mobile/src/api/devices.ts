import { apiRequest } from "@/api/client";

export type DeviceStatus = "online" | "offline" | "warning";

export type Device = {
  id: string;
  name: string;
  location: string | null;
  status: DeviceStatus;
  is_on: boolean;
  last_seen: string | null;
  is_simulated: boolean;
  serial_number: string | null;
  created_date: string;
  updated_date: string;
};

export type Simulator = {
  id: string;
  serialNumber: string;
  model: string;
  isAvailable: boolean;
  connectedDeviceId: string | null;
  signalStrength: number;
  createdAt: string;
};

export type DeviceReading = {
  id: string;
  deviceId: string;
  deviceName: string | null;
  flowLpm: number;
  pressureBar: number | null;
  temperatureC: number | null;
  timestamp: string;
};

export type TodayTotal = {
  deviceId: string;
  litresToday: number;
};

export type UsageSummary = TodayTotal & {
  litresSevenDays: number;
  litresThisMonth: number;
};

export function fetchDevices() {
  return apiRequest<Device[]>("/devices?sort=-created_date&limit=50");
}

export function fetchAvailableSimulators() {
  return apiRequest<Simulator[]>("/simulators?status=available");
}

export function createSimulator() {
  return apiRequest<Simulator>("/simulators", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function removeSimulator(simulatorId: string) {
  return apiRequest<{ ok: boolean }>(`/simulators/${simulatorId}`, {
    method: "DELETE",
  });
}

export function connectSimulator(
  simulatorId: string,
  details: { name: string; location: string },
) {
  return apiRequest<Device>(`/simulators/${simulatorId}/connect`, {
    method: "POST",
    body: JSON.stringify(details),
  });
}

export function updateDevice(
  deviceId: string,
  details: { name: string; location: string },
) {
  return apiRequest<Device>(`/devices/${deviceId}`, {
    method: "PATCH",
    body: JSON.stringify(details),
  });
}

export function deleteDevice(deviceId: string) {
  return apiRequest<{ ok: boolean }>(`/devices/${deviceId}`, {
    method: "DELETE",
  });
}

export function setDeviceValve(deviceId: string, isOn: boolean) {
  return apiRequest<{ ok: boolean; data: Device }>(
    `/devices/${deviceId}/power`,
    {
      method: "POST",
      body: JSON.stringify({ isOn }),
    },
  );
}

export async function fetchDeviceTelemetry(deviceId: string) {
  const [latest, usage] = await Promise.all([
    apiRequest<DeviceReading | null>(`/devices/${deviceId}/latest`),
    apiRequest<UsageSummary>(`/devices/${deviceId}/usage-summary`),
  ]);

  return { latest, today: usage, usage };
}

export function fetchDeviceReadings(deviceId: string, limit = 12) {
  return apiRequest<DeviceReading[]>(
    `/devices/${deviceId}/readings?limit=${limit}`,
  );
}
