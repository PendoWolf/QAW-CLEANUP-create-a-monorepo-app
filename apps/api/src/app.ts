import cors from "cors";
import express from "express";
import { requireSession } from "./auth.js";
import { accountsRouter } from "./routes/accounts.js";
import { authRouter } from "./routes/auth.js";
import { copilotRouter } from "./routes/copilot.js";
import { customersRouter } from "./routes/customers.js";
import { jobsRouter } from "./routes/jobs.js";
import { usersRouter } from "./routes/users.js";

/** Builds the Crewdesk API: JSON only, no pages of its own. */
export function createApp(corsOrigins: string[]) {
  const app = express();
  app.use(cors({ origin: corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/users", requireSession, usersRouter);
  app.use("/api/accounts", requireSession, accountsRouter);
  app.use("/api/customers", requireSession, customersRouter);
  app.use("/api/jobs", requireSession, jobsRouter);
  app.use("/api/copilot", requireSession, copilotRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "not found" });
  });
  return app;
}
