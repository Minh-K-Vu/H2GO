import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";
import { requireRegisteredUser, requireRole } from "../middleware/auth";

const devicesRouter = Router();

const DEVICE_STATUSES = ["online", "offline", "warning"] as const;
const SORT_OPTIONS = [
  "created_date",
  "-created_date",
  "updated_date",
  "-updated_date",
  "name",
  "-name",
] as const;
const ALERT_STATUS_OPTIONS = ["active", "resolved", "all"] as const;

type DeviceRow = {
  id: string;
  name: string;
  location: string | null;
  status: (typeof DEVICE_STATUSES)[number];
  is_on: boolean;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
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

type AlertRow = {
  id: string;
  device_id: string;
  device_name: string | null;
  type: string;
  severity: string;
  message: string;
  is_resolved: boolean;
  resolved_at: string | null;
  ts: string;
};

const deviceQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  sort: z.enum(SORT_OPTIONS).optional(),
  status: z.enum(DEVICE_STATUSES).optional(),
});

const readingsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(5000).optional(),
});

const alertsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(200).optional(),
  status: z.enum(ALERT_STATUS_OPTIONS).optional(),
});

const deviceWriteSchema = z
  .object({
    id: z.string().trim().min(1).optional(),
    name: z.string().trim().min(1).max(120).optional(),
    location: z.string().trim().max(160).nullable().optional(),
    status: z.enum(DEVICE_STATUSES).optional(),
    isOn: z.boolean().optional(),
    is_on: z.boolean().optional(),
    lastSeen: z.string().datetime().nullable().optional(),
    last_seen: z.string().datetime().nullable().optional(),
  })
  .superRefine((value, context) => {
    if (
      value.isOn === undefined &&
      value.is_on === undefined &&
      value.name === undefined &&
      value.location === undefined &&
      value.status === undefined &&
      value.lastSeen === undefined &&
      value.last_seen === undefined &&
      value.id === undefined
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field must be provided.",
      });
    }
  });

const createDeviceSchema = deviceWriteSchema.superRefine((value, context) => {
  if (!value.name) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Device name is required.",
      path: ["name"],
    });
  }
});

const powerSchema = z
  .object({
    isOn: z.boolean().optional(),
    is_on: z.boolean().optional(),
  })
  .superRefine((value, context) => {
    if (value.isOn === undefined && value.is_on === undefined) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "isOn is required.",
        path: ["isOn"],
      });
    }
  });

function buildDeviceOrderBy(sort: (typeof SORT_OPTIONS)[number] | undefined) {
  const orderBy = {
    created_date: "d.created_at ASC",
    "-created_date": "d.created_at DESC",
    updated_date: "d.updated_at ASC",
    "-updated_date": "d.updated_at DESC",
    name: "d.name ASC",
    "-name": "d.name DESC",
  } as const;

  return orderBy[sort ?? "-updated_date"];
}

function toNumber(value: string | number | null) {
  if (value === null) {
    return null;
  }

  return Number(value);
}

function mapDeviceRow(row: DeviceRow) {
  return {
    id: row.id,
    name: row.name,
    location: row.location,
    status: row.status,
    is_on: row.is_on,
    last_seen: row.last_seen,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

function mapDashboardReading(row: ReadingRow) {
  return {
    id: row.id,
    deviceId: row.device_id,
    deviceName: row.device_name,
    flowLpm: Number(row.flow_lpm),
    pressureBar: toNumber(row.pressure_bar),
    temperatureC: toNumber(row.temperature_c),
    timestamp: row.ts,
  };
}

function mapDashboardAlert(row: AlertRow) {
  return {
    id: row.id,
    deviceId: row.device_id,
    deviceName: row.device_name,
    type: row.type,
    severity: row.severity,
    message: row.message,
    isResolved: row.is_resolved,
    resolvedAt: row.resolved_at,
    timestamp: row.ts,
  };
}

function normalizeDeviceWritePayload(
  payload: z.infer<typeof deviceWriteSchema>,
) {
  return {
    id: payload.id,
    name: payload.name,
    location: payload.location === undefined ? undefined : payload.location,
    status: payload.status,
    isOn: payload.isOn ?? payload.is_on,
    lastSeen: payload.lastSeen ?? payload.last_seen,
  };
}

function getRouteParamId(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

async function fetchDeviceById(deviceId: string) {
  const result = await pool.query<DeviceRow>(
    `SELECT
       d.id,
       d.name,
       d.location,
       d.status,
       d.is_on,
       d.last_seen,
       d.created_at,
       d.updated_at
     FROM devices d
     WHERE d.id = $1
     LIMIT 1`,
    [deviceId],
  );

  return result.rows[0] ?? null;
}

async function createValveClosedAlert(
  device: Pick<DeviceRow, "id" | "name">,
  message: string,
) {
  await pool.query(
    `INSERT INTO alerts (device_id, device_name, type, severity, message)
     VALUES ($1, $2, 'VALVE_CLOSED', 'medium', $3)`,
    [device.id, device.name, message],
  );
}

devicesRouter.use(requireRegisteredUser);

devicesRouter.get("/devices", async (req, res) => {
  const parsedQuery = deviceQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid devices query.",
      details: parsedQuery.error.format(),
    });
  }

  const { limit = 50, sort, status } = parsedQuery.data;
  const whereClauses: string[] = [];
  const params: Array<string | number> = [];

  if (status) {
    params.push(status);
    whereClauses.push(`d.status = $${params.length}`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  try {
    const result = await pool.query<DeviceRow>(
      `SELECT
         d.id,
         d.name,
         d.location,
         d.status,
         d.is_on,
         d.last_seen,
         d.created_at,
         d.updated_at
       FROM devices d
       ${whereSql}
       ORDER BY ${buildDeviceOrderBy(sort)}
       LIMIT $${params.length + 1}`,
      [...params, limit],
    );

    return res.status(200).json(result.rows.map(mapDeviceRow));
  } catch (error) {
    console.error("Failed to fetch devices", error);

    return res.status(500).json({
      error: "Failed to fetch devices.",
    });
  }
});

devicesRouter.post(
  "/devices",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = createDeviceSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid device payload.",
        details: parsed.error.format(),
      });
    }

    const payload = normalizeDeviceWritePayload(parsed.data);
    const lastSeen = payload.lastSeen ? new Date(payload.lastSeen) : new Date();

    try {
      const result = await pool.query<DeviceRow>(
        `INSERT INTO devices (id, name, location, status, is_on, last_seen)
         VALUES (
           COALESCE($1, gen_random_uuid()::text),
           $2,
           $3,
           COALESCE($4, 'online'),
           COALESCE($5, true),
           $6
         )
         RETURNING
           id,
           name,
           location,
           status,
           is_on,
           last_seen,
           created_at,
           updated_at`,
        [
          payload.id ?? null,
          payload.name,
          payload.location ?? null,
          payload.status ?? null,
          payload.isOn ?? true,
          lastSeen,
        ],
      );

      return res.status(201).json(mapDeviceRow(result.rows[0]));
    } catch (error) {
      console.error("Failed to create device", error);

      return res.status(500).json({
        error: "Failed to create device.",
      });
    }
  },
);

devicesRouter.get("/devices/:id", async (req, res) => {
  const deviceId = getRouteParamId(req.params.id);
  const device = await fetchDeviceById(deviceId);

  if (!device) {
    return res.status(404).json({
      error: "Device not found.",
    });
  }

  return res.status(200).json(mapDeviceRow(device));
});

devicesRouter.patch(
  "/devices/:id",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = deviceWriteSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid device update payload.",
        details: parsed.error.format(),
      });
    }

    const deviceId = getRouteParamId(req.params.id);
    const existingDevice = await fetchDeviceById(deviceId);

    if (!existingDevice) {
      return res.status(404).json({
        error: "Device not found.",
      });
    }

    const payload = normalizeDeviceWritePayload(parsed.data);
    const nextDevice = {
      name: payload.name ?? existingDevice.name,
      location:
        payload.location === undefined
          ? existingDevice.location
          : payload.location,
      status: payload.status ?? existingDevice.status,
      isOn: payload.isOn ?? existingDevice.is_on,
      lastSeen:
        payload.lastSeen === undefined
          ? existingDevice.last_seen
          : payload.lastSeen,
    };

    try {
      const result = await pool.query<DeviceRow>(
        `UPDATE devices
         SET
           name = $2,
           location = $3,
           status = $4,
           is_on = $5,
           last_seen = $6
         WHERE id = $1
         RETURNING
           id,
           name,
           location,
           status,
           is_on,
           last_seen,
           created_at,
           updated_at`,
        [
          deviceId,
          nextDevice.name,
          nextDevice.location,
          nextDevice.status,
          nextDevice.isOn,
          nextDevice.lastSeen ? new Date(nextDevice.lastSeen) : null,
        ],
      );

      const updatedDevice = result.rows[0];

      if (
        existingDevice.status !== "offline" &&
        updatedDevice.status === "offline"
      ) {
        await pool.query(
          `INSERT INTO alerts (device_id, device_name, type, severity, message)
           VALUES ($1, $2, 'DEVICE_OFFLINE', 'low', 'Device reported offline')`,
          [updatedDevice.id, updatedDevice.name],
        );
      }

      if (existingDevice.is_on && !updatedDevice.is_on) {
        await createValveClosedAlert(updatedDevice, "Valve closed manually");
      }

      return res.status(200).json(mapDeviceRow(updatedDevice));
    } catch (error) {
      console.error("Failed to update device", error);

      return res.status(500).json({
        error: "Failed to update device.",
      });
    }
  },
);

devicesRouter.delete(
  "/devices/:id",
  requireRole(["admin"]),
  async (req, res) => {
    try {
      const result = await pool.query<{ id: string }>(
        `DELETE FROM devices
         WHERE id = $1
         RETURNING id`,
        [getRouteParamId(req.params.id)],
      );

      if ((result.rowCount ?? 0) === 0) {
        return res.status(404).json({
          error: "Device not found.",
        });
      }

      return res.status(200).json({
        ok: true,
      });
    } catch (error) {
      console.error("Failed to delete device", error);

      return res.status(500).json({
        error: "Failed to delete device.",
      });
    }
  },
);

devicesRouter.post(
  "/devices/:id/power",
  requireRole(["admin", "operator"]),
  async (req, res) => {
    const parsed = powerSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid power payload.",
        details: parsed.error.format(),
      });
    }

    const nextIsOn = parsed.data.isOn ?? parsed.data.is_on ?? false;
    const deviceId = getRouteParamId(req.params.id);
    const existingDevice = await fetchDeviceById(deviceId);

    if (!existingDevice) {
      return res.status(404).json({
        error: "Device not found.",
      });
    }

    try {
      const result = await pool.query<DeviceRow>(
        `UPDATE devices
         SET is_on = $2
         WHERE id = $1
         RETURNING
           id,
           name,
           location,
           status,
           is_on,
           last_seen,
           created_at,
           updated_at`,
        [deviceId, nextIsOn],
      );

      const updatedDevice = result.rows[0];

      if (existingDevice.is_on && !updatedDevice.is_on) {
        await createValveClosedAlert(updatedDevice, "Valve closed remotely");
      }

      return res.status(200).json({
        ok: true,
        message: "Device power updated.",
        data: mapDeviceRow(updatedDevice),
      });
    } catch (error) {
      console.error("Failed to update device power", error);

      return res.status(500).json({
        error: "Failed to update device power.",
      });
    }
  },
);

devicesRouter.get("/devices/:id/readings", async (req, res) => {
  const parsedQuery = readingsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid readings query.",
      details: parsedQuery.error.format(),
    });
  }

  const limit = parsedQuery.data.limit ?? 30;

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
       WHERE r.device_id = $1
       ORDER BY r.ts DESC
       LIMIT $2`,
      [getRouteParamId(req.params.id), limit],
    );

    return res.status(200).json(result.rows.map(mapDashboardReading));
  } catch (error) {
    console.error("Failed to fetch readings", error);

    return res.status(500).json({
      error: "Failed to fetch readings.",
    });
  }
});

devicesRouter.get("/devices/:id/latest", async (req, res) => {
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
       WHERE r.device_id = $1
       ORDER BY r.ts DESC
       LIMIT 1`,
      [getRouteParamId(req.params.id)],
    );

    if ((result.rowCount ?? 0) === 0) {
      return res.status(200).json(null);
    }

    return res.status(200).json(mapDashboardReading(result.rows[0]));
  } catch (error) {
    console.error("Failed to fetch latest reading", error);

    return res.status(500).json({
      error: "Failed to fetch latest reading.",
    });
  }
});

devicesRouter.get("/devices/:id/today-total", async (req, res) => {
  try {
    const result = await pool.query<{ litres_today: string | number }>(
      `SELECT COALESCE(SUM(flow_lpm), 0) AS litres_today
       FROM readings
       WHERE device_id = $1
         AND ts >= date_trunc('day', now())`,
      [getRouteParamId(req.params.id)],
    );

    return res.status(200).json({
      deviceId: getRouteParamId(req.params.id),
      litresToday: Number(result.rows[0]?.litres_today ?? 0),
    });
  } catch (error) {
    console.error("Failed to fetch today total", error);

    return res.status(500).json({
      error: "Failed to fetch today total.",
    });
  }
});

devicesRouter.get("/devices/:id/alerts", async (req, res) => {
  const parsedQuery = alertsQuerySchema.safeParse(req.query);

  if (!parsedQuery.success) {
    return res.status(400).json({
      error: "Invalid alerts query.",
      details: parsedQuery.error.format(),
    });
  }

  const limit = parsedQuery.data.limit ?? 10;
  const status = parsedQuery.data.status ?? "active";

  try {
    const filters: string[] = ["a.device_id = $1"];
    const params: Array<string | number | boolean> = [getRouteParamId(req.params.id)];

    if (status === "active") {
      params.push(false);
      filters.push(`a.is_resolved = $${params.length}`);
    } else if (status === "resolved") {
      params.push(true);
      filters.push(`a.is_resolved = $${params.length}`);
    }

    params.push(limit);

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
       WHERE ${filters.join(" AND ")}
       ORDER BY a.ts DESC
       LIMIT $${params.length}`,
      params,
    );

    return res.status(200).json(result.rows.map(mapDashboardAlert));
  } catch (error) {
    console.error("Failed to fetch alerts", error);

    return res.status(500).json({
      error: "Failed to fetch alerts.",
    });
  }
});

export default devicesRouter;
