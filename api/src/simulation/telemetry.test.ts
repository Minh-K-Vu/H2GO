import assert from "node:assert/strict";
import test from "node:test";
import {
  createSimulatedHistory,
  createSimulatedTelemetry,
  getSimulationBucket,
} from "./telemetry";

const timestamp = new Date("2026-08-24T10:00:00.000Z");

test("different simulator seeds produce different readings", () => {
  const first = createSimulatedTelemetry(101, timestamp, true);
  const second = createSimulatedTelemetry(202, timestamp, true);

  assert.notDeepEqual(first, second);
});

test("a simulator changes values over time", () => {
  const first = createSimulatedTelemetry(101, timestamp, true);
  const later = createSimulatedTelemetry(
    101,
    new Date(timestamp.getTime() + 5 * 60_000),
    true,
  );

  assert.notEqual(first.flowLpm, later.flowLpm);
});

test("closing the valve reduces simulated flow to zero", () => {
  const reading = createSimulatedTelemetry(101, timestamp, false);

  assert.equal(reading.flowLpm, 0);
});

test("history is chronological and contains the requested sample count", () => {
  const history = createSimulatedHistory(101, timestamp, true, 12, 30);

  assert.equal(history.length, 12);
  assert.ok(history[0].timestamp < history[11].timestamp);
  assert.equal(history[11].timestamp.toISOString(), timestamp.toISOString());
});

test("timestamps within one sample window share a bucket", () => {
  const first = new Date("2026-08-24T10:00:01.000Z");
  const second = new Date("2026-08-24T10:00:14.000Z");
  const nextWindow = new Date("2026-08-24T10:00:16.000Z");

  assert.equal(getSimulationBucket(first), getSimulationBucket(second));
  assert.notEqual(getSimulationBucket(first), getSimulationBucket(nextWindow));
});
