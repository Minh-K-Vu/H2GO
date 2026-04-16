import { Router } from "express";
import { z } from "zod";
import { pool } from "../db/pool";

const telemetryRouter = Router();

const telemetrySchema = z.object({
  deviceId: z.string().min(1, "deviceId is required"),
  flowLpm: z.number().nonnegative("flowLpm must be non-negative"),
  timestamp: z.string().datetime().optional(),
});

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

    await pool.query(
      `INSERT INTO readings (device_id, flow_lpm, ts)
       VALUES ($1, $2, $3)`,
      [deviceId, flowLpm, ts],
    );

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
