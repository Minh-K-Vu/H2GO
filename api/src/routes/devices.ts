import { Router } from "express";
import { pool } from "../db/pool";

const devicesRouter = Router();

devicesRouter.get("/devices/:id/latest", async (req, res) => {
  const deviceId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT device_id, flow_lpm, ts
       FROM readings
       WHERE device_id = $1
       ORDER BY ts DESC
       LIMIT 1`,
      [deviceId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: "No readings found for this device",
      });
    }

    const row = result.rows[0];

    return res.status(200).json({
      deviceId: row.device_id,
      flowLpm: Number(row.flow_lpm),
      timestamp: row.ts,
    });
  } catch (error) {
    console.error("Failed to fetch latest reading", error);

    return res.status(500).json({
      error: "Failed to fetch latest reading",
    });
  }
});

devicesRouter.get("/devices/:id/today-total", async (req, res) => {
  const deviceId = req.params.id;

  try {
    const result = await pool.query(
      `SELECT COALESCE(SUM(flow_lpm), 0) AS litres_today
       FROM readings
       WHERE device_id = $1
         AND ts >= date_trunc('day', now())`,
      [deviceId],
    );

    return res.status(200).json({
      deviceId,
      litresToday: Number(result.rows[0].litres_today),
    });
  } catch (error) {
    console.error("Failed to fetch today total", error);

    return res.status(500).json({
      error: "Failed to fetch today total",
    });
  }
});

export default devicesRouter;
