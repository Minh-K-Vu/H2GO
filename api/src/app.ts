import express from "express";
import cors from "cors";
import alertsRouter from "./routes/alerts";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import telemetryRouter from "./routes/telemetry";
import devicesRouter from "./routes/devices";
import { env } from "./config/env";
import { attachAuthSession } from "./middleware/auth";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.webOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(attachAuthSession);

app.use(healthRouter);
app.use(authRouter);
app.use(telemetryRouter);
app.use(alertsRouter);
app.use(devicesRouter);

app.use(errorHandler);

export default app;
