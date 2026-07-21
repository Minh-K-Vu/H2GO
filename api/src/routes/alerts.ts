import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireRegisteredUser, requireRole } from "../middleware/auth";

const alertsRouter = Router();

const ALERT_TYPES = [
  "LEAK",
  "HIGH_FLOW",
  "LOW_PRESSURE",
  "DEVICE_OFFLINE",
  "VALVE_CLOSED",
] as const;
const ALERT_SEVERITIES = ["low", "medium", "high", "critical"] as const;
const ALERT_SORT_OPTIONS = [
  "created_date",
  "-created_date",
  "resolved_at",
  "-resolved_at",
] as const;
const ALERT_STATUS_OPTIONS = ["active", "resolved", "all"] as const;

type AlertRow = {
  id: string;
  device_id: string;
  device_name: string | null;
  type: (typeof ALERT_TYPES)[number];
  severity: (typeof ALERT_SEVERITIES)[number];
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  ts: string;
};

type DeviceNameRow = {
  id: string;
  name: string;
};

const alertsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(1000).optional(),
  sort: z.enum(ALERT_SORT_OPTIONS).optional(),
  status: z.enum(ALERT_STATUS_OPTIONS).optional(),
  deviceId: z.string().trim().min(1).optional(),
  device_id: z.string().trim().min(1).optional(),
});

const createAlertSchema = z.object({
  deviceId: z.string().trim().min(1).optional(),
  device_id: z.string().trim().min(1).optional(),
  type: z.enum(ALERT_TYPES),
  severity: z.enum(ALERT_SEVERITIES).optional(),
  message: z.string().trim().min(1).max(300),
  isResolved: z.boolean().optional(),
  is_resolved: z.boolean().optional(),
  resolvedAt: z.string().datetime().nullable().optional(),
  resolved_at: z.string().datetime().nullable().optional(),
  timestamp: z.string().datetime().optional(),
});

const updateAlertSchema = z
  .object({
    type: z.enum(ALERT_TYPES).optional(),
    severity: z.enum(ALERT_SEVERITIES).optional(),
    message: z.string().trim().min(1).max(300).optional(),
    isResolved: z.boolean().optional(),
    is_resolved: z.boolean().optional(),
    resolvedAt: z.string().datetime().nullable().optional(),
    resolved_at: z.string().datetime().nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field must be provided.",
  });

function buildAlertOrderBy(
  sort: (typeof ALERT_SORT_OPTIONS)[number] | undefined,
) {
  const orderBy = {
    created_date: "a.ts ASC",
    "-created_date": "a.ts DESC",
    resolved_at: "a.resolved_at ASC NULLS LAST",
    "-resolved_at": "a.resolved_at DESC NULLS LAST",
  } as const;

  return orderBy[sort ?? "-created_date"];
}

function getAlertSeverity(type: (typeof ALERT_TYPES)[number]) {
  const severityByType = {
    LEAK: "critical",
    HIGH_FLOW: "high",
    LOW_PRESSURE: "medium",
    DEVICE_OFFLINE: "low",
    VALVE_CLOSED: "medium",
  } as const;

  return severityByType[type];
}

function mapAlertRow(row: AlertRow) {
  return {
    id: row.id,
    device_id: row.device_id,
    device_name: row.device_name,
    type: row.type,
    severity: row.severity,
    message: row.message,
    is_resolved: row.is_resolved,
    resolved_at: row.resolved_at,
    timestamp: row.ts,
    created_date: row.ts,
  };
}

async function fetchDeviceName(deviceId: string) {
  const result = await pool.query<DeviceNameRow>(
    `SELECT id, name
     FROM devices
     WHERE id = $1
     LIMIT 1`,
    [deviceId],
  );

  return result.rows[0] ?? null;
}

alertsRouter.use(requireRegisteredUser);

alertsRouter.get("/alerts", async (req, res) => {
  const parsedQuery = alertsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid alerts query.",
      details: parsedQuery.error.format(),
    });
  }

  const { limit = 100, sort, status = "all" } = parsedQuery.data;
  const deviceId = parsedQuery.data.deviceId ?? parsedQuery.data.device_id;
  const filters: string[] = [];
  const params: Array<string | number | boolean> = [];

  if (deviceId) {
    params.push(deviceId);
    filters.push(`a.device_id = $${params.length}`);
  }

  if (status === "active") {
    params.push(false);
    filters.push(`a.is_resolved = $${params.length}`);
  } else if (status === "resolved") {
    params.push(true);
    filters.push(`a.is_resolved = $${params.length}`);
  }

  const whereSql = filters.length > 0 ? `WHERE ${filters.join(" AND ")}` : "";

  try {
    const result = await pool.query<AlertRow>(
      `SELECT
         a.id,
         a.device_id,
         a.device_name,
         a.type,
         a.severity,
         a.message,
         a.is_resolved,
         a.resolved_at,
         a.ts
       FROM alerts a
       ${whereSql}
       ORDER BY ${buildAlertOrderBy(sort)}
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    return res.status(200).json(result.rows.map(mapAlertRow));
  } catch (error) {
    console.error("Failed to fetch alerts", error);

    return res.status(500).json({
      error: "Failed to fetch alerts.",
    });
  }
});

alertsRouter.get("/alerts/:id", async (req, res) => {
  try {
    const result = await pool.query<AlertRow>(
      `SELECT
         a.id,
         a.device_id,
         a.device_name,
         a.type,
         a.severity,
         a.message,
         a.is_resolved,
         a.resolved_at,
         a.ts
       FROM alerts a
       WHERE a.id = $1
       LIMIT 1`,
      [req.params.id],
    );

    if ((result.rowCount ?? 0) === 0) {
      return res.status(404).json({
        error: "Alert not found.",
      });
    }

    return res.status(200).json(mapAlertRow(result.rows[0]));
  } catch (error) {
    console.error("Failed to fetch alert", error);

    return res.status(500).json({
      error: "Failed to fetch alert.",
    });
  }
});

alertsRouter.post(
  "/alerts",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = createAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid alert payload.",
        details: parsed.error.format(),
      });
    }

    const deviceId = parsed.data.deviceId ?? parsed.data.device_id;

    if (!deviceId) {
      return res.status(400).json({
        error: "Device ID is required.",
      });
    }

    const device = await fetchDeviceName(deviceId);

    if (!device) {
      return res.status(404).json({
        error: "Device not found.",
      });
    }

    const isResolved = parsed.data.isResolved ?? parsed.data.is_resolved ?? false;
    const timestamp = parsed.data.timestamp
      ? new Date(parsed.data.timestamp)
      : new Date();
    const resolvedAt =
      parsed.data.resolvedAt ??
      parsed.data.resolved_at ??
      (isResolved ? timestamp.toISOString() : null);

    try {
      const result = await pool.query<AlertRow>(
        `INSERT INTO alerts (
           device_id,
           device_name,
           type,
           severity,
           message,
           is_resolved,
           resolved_at,
           ts
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING
           id,
           device_id,
           device_name,
           type,
           severity,
           message,
           is_resolved,
           resolved_at,
           ts`,
        [
          device.id,
          device.name,
          parsed.data.type,
          parsed.data.severity ?? getAlertSeverity(parsed.data.type),
          parsed.data.message,
          isResolved,
          resolvedAt ? new Date(resolvedAt) : null,
          timestamp,
        ],
      );

      return res.status(201).json(mapAlertRow(result.rows[0]));
    } catch (error) {
      console.error("Failed to create alert", error);

      return res.status(500).json({
        error: "Failed to create alert.",
      });
    }
  },
);

alertsRouter.patch(
  "/alerts/:id",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = updateAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid alert update payload.",
        details: parsed.error.format(),
      });
    }

    try {
      const existingResult = await pool.query<AlertRow>(
        `SELECT
           a.id,
           a.device_id,
           a.device_name,
           a.type,
           a.severity,
           a.message,
           a.is_resolved,
           a.resolved_at,
           a.ts
         FROM alerts a
         WHERE a.id = $1
         LIMIT 1`,
        [req.params.id],
      );

      if ((existingResult.rowCount ?? 0) === 0) {
        return res.status(404).json({
          error: "Alert not found.",
        });
      }

      const existingAlert = existingResult.rows[0];
      const nextType = parsed.data.type ?? existingAlert.type;
      const nextIsResolved =
        parsed.data.isResolved ?? parsed.data.is_resolved ?? existingAlert.is_resolved;
      const nextResolvedAtInput =
        parsed.data.resolvedAt ?? parsed.data.resolved_at;
      const nextResolvedAt =
        nextResolvedAtInput !== undefined
          ? nextResolvedAtInput
          : nextIsResolved
            ? existingAlert.resolved_at ?? new Date().toISOString()
            : null;

      const result = await pool.query<AlertRow>(
        `UPDATE alerts
         SET
           type = $2,
           severity = $3,
           message = $4,
           is_resolved = $5,
           resolved_at = $6
         WHERE id = $1
         RETURNING
           id,
           device_id,
           device_name,
           type,
           severity,
           message,
           is_resolved,
           resolved_at,
           ts`,
        [
          req.params.id,
          nextType,
          parsed.data.severity ?? existingAlert.severity ?? getAlertSeverity(nextType),
          parsed.data.message ?? existingAlert.message,
          nextIsResolved,
          nextResolvedAt ? new Date(nextResolvedAt) : null,
        ],
      );

      return res.status(200).json(mapAlertRow(result.rows[0]));
    } catch (error) {
      console.error("Failed to update alert", error);

      return res.status(500).json({
        error: "Failed to update alert.",
      });
    }
  },
);

export default alertsRouter;

