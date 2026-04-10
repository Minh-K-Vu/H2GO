import { Router } from "express";

const healthRouter = Router();

healthRouter.get("/health", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "h2go-api",
  });
});

export default healthRouter;
