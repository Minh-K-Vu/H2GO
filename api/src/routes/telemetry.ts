import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";

const telemetryRouter = Router();

const telemetrySchema = z.object({
  deviceId: z.string().min(1, "deviceId is required"),
  flowLpm: z.number().nonnegative("flowLpm must be non-negative"),
  timestamp: z.string().datetime().optional(),
});

const LEAK_THRESHOLD = 2.5;
const RECENT_COUNT = 5;

telemetryRouter.post("/telemetry", async (req, res) => {
  const parsed = telemetrySchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: "Invalid telemetry payload",
      details: parsed.error.format(),
    });
  }

  const { deviceId, flowLpm, timestamp } = parsed.data;

  try {
    const ts = timestamp ? new Date(timestamp) : new Date();

    // 1. Store the new reading
    await pool.query(
      `INSERT INTO readings (device_id, flow_lpm, ts)
       VALUES ($1, $2, $3)`,
      [deviceId, flowLpm, ts],
    );

    // 2. Get the most recent readings for this device
    const recentResult = await pool.query(
      `SELECT flow_lpm
       FROM readings
       WHERE device_id = $1
       ORDER BY ts DESC
       LIMIT $2`,
      [deviceId, RECENT_COUNT],
    );

    const recentFlows = recentResult.rows.map((row) => Number(row.flow_lpm));

    const sustainedHighFlow =
      recentFlows.length === RECENT_COUNT &&
      recentFlows.every((value) => value > LEAK_THRESHOLD);

    if (sustainedHighFlow) {
      // 3. Prevent duplicate leak alerts in a short time window
      const existingAlertResult = await pool.query(
        `SELECT id
         FROM alerts
         WHERE device_id = $1
           AND type = 'LEAK'
           AND ts > now() - interval '10 minutes'
         LIMIT 1`,
        [deviceId],
      );

      const hasRecentLeakAlert = existingAlertResult.rowCount > 0;

      if (!hasRecentLeakAlert) {
        await pool.query(
          `INSERT INTO alerts (device_id, type, message)
           VALUES ($1, $2, $3)`,
          [deviceId, "LEAK", "Possible leak detected"],
        );
      }
    }

    return res.status(201).json({
      ok: true,
      message: "Telemetry stored successfully",
      data: {
        deviceId,
        flowLpm,
        timestamp: ts,
      },
    });
  } catch (error) {
    console.error("Database insert failed", error);

    return res.status(500).json({
      error: "Failed to store telemetry",
    });
  }
});

export default telemetryRouter;
