import { Router } from "express";
import type { PoolClient } from "pg";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireRegisteredUser, requireRole } from "../middleware/auth";
import {
  createSimulatedHistory,
  getSimulationBucket,
} from "../simulation/telemetry";

const simulatorsRouter = Router();

type SimulatorRow = {
  id: string;
  serial_number: string;
  model: string;
  simulation_seed: number;
  connected_device_id: string | null;
  created_at: string;
};

type ConnectedDeviceRow = {
  id: string;
  name: string;
  location: string | null;
  status: "online" | "offline" | "warning";
  is_on: boolean;
  last_seen: string | null;
  simulator_id: string;
  created_at: string;
  updated_at: string;
};

const simulatorQuerySchema = z.object({
  status: z.enum(["available", "connected", "all"]).optional(),
});

const connectSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(160).optional(),
});

function mapSimulator(row: SimulatorRow) {
  return {
    id: row.id,
    serialNumber: row.serial_number,
    model: row.model,
    isAvailable: row.connected_device_id === null,
    connectedDeviceId: row.connected_device_id,
    signalStrength: 72 + (row.simulation_seed % 27),
    createdAt: row.created_at,
  };
}

function mapConnectedDevice(row: ConnectedDeviceRow, serialNumber: string) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    is_on: row.is_on,
    last_seen: row.last_seen,
    is_simulated: true,
    serial_number: serialNumber,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

async function insertSimulator(client: PoolClient) {
  const sequenceResult = await client.query<{ value: string }>(
    "SELECT nextval('simulated_device_sequence')::text AS value",
  );
  const sequence = Number(sequenceResult.rows[0].value);
  const serialNumber = `H2-SIM-${String(sequence).padStart(4, "0")}`;
  const simulationSeed = sequence * 7919;
  const result = await client.query<SimulatorRow>(
    `INSERT INTO simulated_devices (serial_number, simulation_seed)
     VALUES ($1, $2)
     RETURNING
       id,
       serial_number,
       model,
       simulation_seed,
       NULL::text AS connected_device_id,
       created_at`,
    [serialNumber, simulationSeed],
  );

  return result.rows[0];
}

simulatorsRouter.use(requireRegisteredUser);

simulatorsRouter.get("/simulators", async (req, res) => {
  const parsed = simulatorQuerySchema.safeParse(req.query);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid simulator query.",
      details: parsed.error.format(),
    });
  }

  const status = parsed.data.status ?? "available";
  const statusFilter =
    status === "available"
      ? "WHERE d.id IS NULL"
      : status === "connected"
        ? "WHERE d.id IS NOT NULL"
        : "";

  if (status === "available") {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query("SELECT pg_advisory_xact_lock($1)", [8242026]);
      const result = await client.query<SimulatorRow>(
        `SELECT
           s.id,
           s.serial_number,
           s.model,
           s.simulation_seed,
           d.id AS connected_device_id,
           s.created_at
         FROM simulated_devices s
         LEFT JOIN devices d ON d.simulator_id = s.id
         WHERE d.id IS NULL
         ORDER BY s.created_at DESC`,
      );

      if (result.rows.length === 0) {
        result.rows.push(await insertSimulator(client));
      }

      await client.query("COMMIT");
      return res.status(200).json(result.rows.map(mapSimulator));
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to fetch available simulators", error);
      return res.status(500).json({ error: "Failed to fetch simulators." });
    } finally {
      client.release();
    }
  }

  try {
    const result = await pool.query<SimulatorRow>(
      `SELECT
         s.id,
         s.serial_number,
         s.model,
         s.simulation_seed,
         d.id AS connected_device_id,
         s.created_at
       FROM simulated_devices s
       LEFT JOIN devices d ON d.simulator_id = s.id
       ${statusFilter}
       ORDER BY s.created_at DESC`,
    );

    return res.status(200).json(result.rows.map(mapSimulator));
  } catch (error) {
    console.error("Failed to fetch simulators", error);
    return res.status(500).json({ error: "Failed to fetch simulators." });
  }
});

simulatorsRouter.post(
  "/simulators",
  requireRole(["admin", "operator"]),
  async (_req, res) => {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const simulator = await insertSimulator(client);
      await client.query("COMMIT");

      return res.status(201).json(mapSimulator(simulator));
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to create simulator", error);
      return res.status(500).json({ error: "Failed to create simulator." });
    } finally {
      client.release();
    }
  },
);

simulatorsRouter.post(
  "/simulators/:id/connect",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = connectSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid connection details.",
        details: parsed.error.format(),
      });
    }

    const simulatorId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;
    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      const simulatorResult = await client.query<SimulatorRow>(
        `SELECT
           s.id,
           s.serial_number,
           s.model,
           s.simulation_seed,
           d.id AS connected_device_id,
           s.created_at
         FROM simulated_devices s
         LEFT JOIN devices d ON d.simulator_id = s.id
         WHERE s.id = $1
         FOR UPDATE OF s`,
        [simulatorId],
      );
      const simulator = simulatorResult.rows[0];

      if (!simulator) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Simulator not found." });
      }

      if (simulator.connected_device_id) {
        await client.query("ROLLBACK");
        return res.status(409).json({
          error: "This simulator is already connected.",
        });
      }

      const defaultName = `H2 Monitor ${simulator.serial_number.slice(-4)}`;
      const deviceResult = await client.query<ConnectedDeviceRow>(
        `INSERT INTO devices (
           name,
           location,
           status,
           is_on,
           last_seen,
           simulator_id
         )
         VALUES ($1, $2, 'online', true, now(), $3)
         RETURNING
           id,
           name,
           location,
           status,
           is_on,
           last_seen,
           simulator_id,
           created_at,
           updated_at`,
        [
          parsed.data.name ?? defaultName,
          parsed.data.location ?? "Main water line",
          simulator.id,
        ],
      );
      const device = deviceResult.rows[0];
      const history = createSimulatedHistory(
        simulator.simulation_seed,
        new Date(),
        device.is_on,
      );
      const values: unknown[] = [];
      const placeholders = history.map((reading, index) => {
        const offset = index * 7;
        values.push(
          device.id,
          device.name,
          reading.flowLpm,
          reading.pressureBar,
          reading.temperatureC,
          getSimulationBucket(reading.timestamp),
          reading.timestamp,
        );
        return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
      });

      await client.query(
        `INSERT INTO readings (
           device_id,
           device_name,
           flow_lpm,
           pressure_bar,
           temperature_c,
           simulation_bucket,
           ts
         )
         VALUES ${placeholders.join(", ")}`,
        values,
      );
      await client.query("COMMIT");

      return res
        .status(201)
        .json(mapConnectedDevice(device, simulator.serial_number));
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Failed to connect simulator", error);
      return res.status(500).json({ error: "Failed to connect simulator." });
    } finally {
      client.release();
    }
  },
);

simulatorsRouter.delete(
  "/simulators/:id",
  requireRole(["admin"]),
  async (req, res) => {
    const simulatorId = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    try {
      const result = await pool.query<{ id: string }>(
        `DELETE FROM simulated_devices s
         WHERE s.id = $1
           AND NOT EXISTS (
             SELECT 1 FROM devices d WHERE d.simulator_id = s.id
           )
         RETURNING s.id`,
        [simulatorId],
      );

      if ((result.rowCount ?? 0) === 0) {
        return res.status(409).json({
          error: "Only an available simulator can be removed.",
        });
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error("Failed to remove simulator", error);
      return res.status(500).json({ error: "Failed to remove simulator." });
    }
  },
);

export default simulatorsRouter;
