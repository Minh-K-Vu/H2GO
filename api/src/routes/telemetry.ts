import { Router } from "express";
import { z } from "zod";

const telemetryRouter = Router();

const telemetrySchema = z.object({
  deviceId: z.string().min(1, "deviceId is required"),
  flowLpm: z.number().nonnegative("flow must not be negative"),
  timestamp: z.string().datetime().optional(),
});

telemetryRouter.post("/telemetry", (req, res) => {
    const parsed = telemetrySchema.safeParse(req.body);
    
    if (!parsed.success) {
        return res.status(400).json({
            error: "Invalid telemetry information",
            details: parsed.error.format(),
        })
    }

    const { deviceId, flowLpm, timestamp } = parsed.data;

    return res.status(201).json({
        ok: true,
        message: "Telemtry received",
        data: {
            deviceId,
            flowLpm,
            timestamp: timestamp ?? null,
        }
    });
});

export default telemetryRouter;