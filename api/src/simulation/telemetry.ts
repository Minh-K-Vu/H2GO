export type SimulatedTelemetry = {
  flowLpm: number;
  pressureBar: number;
  temperatureC: number;
  timestamp: Date;
};

function round(value: number, decimalPlaces: number) {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

// A simulator's seed acts like its hardware fingerprint. Time changes the
// reading while the seed keeps two simulated devices from sharing values.
export function createSimulatedTelemetry(
  seed: number,
  timestamp: Date,
  valveOpen: boolean,
): SimulatedTelemetry {
  const minute = timestamp.getTime() / 60_000;
  const phase = (seed % 360) * (Math.PI / 180);
  const flowBaseline = 1.1 + (seed % 47) / 10;
  const activityWave = Math.sin(minute / 3.7 + phase) * 0.72;
  const householdPulse = Math.sin(minute / 11.3 + phase * 0.5) * 0.38;
  const flowLpm = valveOpen
    ? Math.max(0.1, flowBaseline + activityWave + householdPulse)
    : 0;
  const pressureBaseline = 2.6 + ((seed >> 2) % 18) / 10;
  const temperatureBaseline = 16 + ((seed >> 4) % 95) / 10;

  return {
    flowLpm: round(flowLpm, 2),
    pressureBar: round(
      pressureBaseline - flowLpm * 0.025 + Math.sin(minute / 8 + phase) * 0.08,
      2,
    ),
    temperatureC: round(
      temperatureBaseline + Math.sin(minute / 29 + phase) * 0.65,
      1,
    ),
    timestamp,
  };
}

export function createSimulatedHistory(
  seed: number,
  endTime: Date,
  valveOpen: boolean,
  count = 24,
  intervalMinutes = 60,
) {
  return Array.from({ length: count }, (_, index) => {
    const minutesAgo = (count - index - 1) * intervalMinutes;
    const timestamp = new Date(endTime.getTime() - minutesAgo * 60_000);

    return createSimulatedTelemetry(seed, timestamp, valveOpen);
  });
}
