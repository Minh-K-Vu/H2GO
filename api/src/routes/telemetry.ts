import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireRegisteredUser } from "../middleware/auth";

const telemetryRouter = Router();

const TELEMETRY_SORT_OPTIONS = ["created_date", "-created_date"] as const;
const HIGH_FLOW_THRESHOLD = 2.5;
const LOW_PRESSURE_THRESHOLD = 1.5;
const LEAK_CONFIRMATION_COUNT = 5;
const ALERT_COOLDOWN_MINUTES = 10;

type DeviceInfoRow = {
  id: string;
  name: string;
  is_on: boolean;
};

type ReadingRow = {
  id: string;
  device_id: string;
  device_name: string | null;
  flow_lpm: string | number;
  pressure_bar: string | number | null;
  temperature_c: string | number | null;
  ts: string;
};

const telemetryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  sort: z.enum(TELEMETRY_SORT_OPTIONS).optional(),
  deviceId: z.string().trim().min(1).optional(),
  device_id: z.string().trim().min(1).optional(),
});

const telemetryWriteSchema = z
  .object({
    deviceId: z.string().trim().min(1).optional(),
    device_id: z.string().trim().min(1).optional(),
    flowLpm: z.coerce.number().nonnegative().optional(),
    flow_lpm: z.coerce.number().nonnegative().optional(),
    pressureBar: z.coerce.number().nullable().optional(),
    pressure_bar: z.coerce.number().nullable().optional(),
    temperatureC: z.coerce.number().nullable().optional(),
    temperature_c: z.coerce.number().nullable().optional(),
    timestamp: z.string().datetime().optional(),
  })
  .superRefine((value, context) => {
    if (!value.deviceId && !value.device_id) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "deviceId is required.",
        path: ["deviceId"],
      });
    }

    if (value.flowLpm === undefined && value.flow_lpm === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "flowLpm is required.",
        path: ["flowLpm"],
      });
    }
  });

function buildTelemetryOrderBy(
  sort: (typeof TELEMETRY_SORT_OPTIONS)[number] | undefined,
) {
  return sort === "created_date" ? "r.ts ASC" : "r.ts DESC";
}

function toNumber(value: string | number | null) {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function normalizeTelemetryPayload(
  payload: z.infer<typeof telemetryWriteSchema>,
) {
  return {
    deviceId: payload.deviceId ?? payload.device_id ?? "",
    flowLpm: payload.flowLpm ?? payload.flow_lpm ?? 0,
    pressureBar: payload.pressureBar ?? payload.pressure_bar ?? null,
    temperatureC: payload.temperatureC ?? payload.temperature_c ?? null,
    timestamp: payload.timestamp,
  };
}

function mapTelemetryRow(row: ReadingRow) {
  return {
    id: row.id,
    device_id: row.device_id,
    device_name: row.device_name,
    flow_lpm: Number(row.flow_lpm),
    pressure_bar: toNumber(row.pressure_bar),
    temperature_c: toNumber(row.temperature_c),
    timestamp: row.ts,
    created_date: row.ts,
  };
}

function getAlertSeverity(type: string) {
  const severityByType = {
    LEAK: "critical",
    HIGH_FLOW: "high",
    LOW_PRESSURE: "medium",
    DEVICE_OFFLINE: "low",
    VALVE_CLOSED: "medium",
  } as const;

  return severityByType[type as keyof typeof severityByType] ?? "medium";
}

async function ensureDeviceRecord(deviceId: string, observedAt: Date) {
  const result = await pool.query<DeviceInfoRow>(
    `INSERT INTO devices (id, name, status, last_seen)
     VALUES ($1, $2, 'online', $3)
     ON CONFLICT (id)
     DO UPDATE SET
       status = 'online',
       last_seen = EXCLUDED.last_seen
     RETURNING id, name, is_on`,
    [deviceId, `H2GO ${deviceId}`, observedAt],
  );

  return result.rows[0];
}

async function createAlertIfNotRecent({
  deviceId,
  deviceName,
  type,
  message,
  observedAt,
}: {
  deviceId: string;
  deviceName: string | null;
  type: "LEAK" | "HIGH_FLOW" | "LOW_PRESSURE" | "VALVE_CLOSED";
  message: string;
  observedAt: Date;
}) {
  const existingAlertResult = await pool.query<{ id: string }>(
    `SELECT id
     FROM alerts
     WHERE device_id = $1
       AND type = $2
       AND ts > $3::timestamptz - interval '${ALERT_COOLDOWN_MINUTES} minutes'
     LIMIT 1`,
    [deviceId, type, observedAt.toISOString()],
  );

  if ((existingAlertResult.rowCount ?? 0) > 0) {
    return false;
  }

  await pool.query(
    `INSERT INTO alerts (device_id, device_name, type, severity, message, ts)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [deviceId, deviceName, type, getAlertSeverity(type), message, observedAt],
  );

  return true;
}

telemetryRouter.get("/telemetry", requireRegisteredUser, async (req, res) => {
  const parsedQuery = telemetryQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid telemetry query.",
      details: parsedQuery.error.format(),
    });
  }

  const limit = parsedQuery.data.limit ?? 100;
  const deviceId = parsedQuery.data.deviceId ?? parsedQuery.data.device_id;
  const filters: string[] = [];
  const params: Array<string | number> = [];

  if (deviceId) {
    params.push(deviceId);
    filters.push(`r.device_id = $${params.length}`);
  }

  const whereSql = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query<ReadingRow>(
      `SELECT
         r.id,
         r.device_id,
         r.device_name,
         r.flow_lpm,
         r.pressure_bar,
         r.temperature_c,
         r.ts
       FROM readings r
       ${whereSql}
       ORDER BY ${buildTelemetryOrderBy(parsedQuery.data.sort)}
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    return res.status(200).json(result.rows.map(mapTelemetryRow));
  } catch (error) {
    console.error("Failed to fetch telemetry", error);

    return res.status(500).json({
      error: "Failed to fetch telemetry.",
    });
  }
});

telemetryRouter.post("/telemetry", async (req, res) => {
  const parsed = telemetryWriteSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid telemetry payload.",
      details: parsed.error.format(),
    });
  }

  const payload = normalizeTelemetryPayload(parsed.data);
  const observedAt = payload.timestamp ? new Date(payload.timestamp) : new Date();

  try {
    const device = await ensureDeviceRecord(payload.deviceId, observedAt);

    await pool.query(
      `INSERT INTO readings (
         device_id,
         device_name,
         flow_lpm,
         pressure_bar,
         temperature_c,
         ts
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        payload.deviceId,
        device.name,
        payload.flowLpm,
        payload.pressureBar,
        payload.temperatureC,
        observedAt,
      ],
    );

    if (payload.flowLpm > HIGH_FLOW_THRESHOLD) {
      await createAlertIfNotRecent({
        deviceId: payload.deviceId,
        deviceName: device.name,
        type: "HIGH_FLOW",
        message: "Unusually high water flow detected",
        observedAt,
      });
    }

    if (
      payload.pressureBar !== null &&
      payload.pressureBar < LOW_PRESSURE_THRESHOLD
    ) {
      await createAlertIfNotRecent({
        deviceId: payload.deviceId,
        deviceName: device.name,
        type: "LOW_PRESSURE",
        message: "Water pressure dropped below the safe threshold",
        observedAt,
      });
    }

    const recentReadingsResult = await pool.query<{
      flow_lpm: string | number;
    }>(
      `SELECT flow_lpm
       FROM readings
       WHERE device_id = $1
       ORDER BY ts DESC
       LIMIT $2`,
      [payload.deviceId, LEAK_CONFIRMATION_COUNT],
    );

    const recentFlows = recentReadingsResult.rows.map((row) =>
      Number(row.flow_lpm),
    );

    const sustainedLeak =
      recentFlows.length === LEAK_CONFIRMATION_COUNT &&
      recentFlows.every((flow) => flow > HIGH_FLOW_THRESHOLD);

    if (sustainedLeak) {
      await createAlertIfNotRecent({
        deviceId: payload.deviceId,
        deviceName: device.name,
        type: "LEAK",
        message: "Possible leak detected",
        observedAt,
      });

      if (device.is_on) {
        await pool.query(
          `UPDATE devices
           SET is_on = false
           WHERE id = $1`,
          [payload.deviceId],
        );

        await createAlertIfNotRecent({
          deviceId: payload.deviceId,
          deviceName: device.name,
          type: "VALVE_CLOSED",
          message: "Valve closed automatically due to leak",
          observedAt,
        });
      }
    }

    return res.status(201).json({
      ok: true,
      message: "Telemetry stored successfully.",
      data: {
        deviceId: payload.deviceId,
        deviceName: device.name,
        flowLpm: payload.flowLpm,
        pressureBar: payload.pressureBar,
        temperatureC: payload.temperatureC,
        timestamp: observedAt,
      },
    });
  } catch (error) {
    console.error("Failed to store telemetry", error);

    return res.status(500).json({
      error: "Failed to store telemetry.",
    });
  }
});

export default telemetryRouter;

