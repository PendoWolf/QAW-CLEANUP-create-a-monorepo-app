import { Router } from "express";
import { jobs, newId } from "../store/data.js";
import type { Job } from "../types.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const STATUSES: Job["status"][] = ["scheduled", "in_progress", "done"];
const PRIORITIES: Job["priority"][] = ["low", "normal", "urgent"];

type JobFields = Omit<Job, "id" | "accountId">;

/** Returns the job's fields from a request body, or why they aren't valid. */
function readFields(body: unknown): JobFields | string {
  const fields = (body ?? {}) as Partial<JobFields>;
  if (!fields.title?.trim()) return "title is required";
  if (!fields.customerId) return "customerId is required";
  if (!fields.scheduledFor || !ISO_DATE.test(fields.scheduledFor)) return "scheduledFor must be a date like 2026-11-03";
  return {
    title: fields.title.trim(),
    customerId: fields.customerId,
    scheduledFor: fields.scheduledFor,
    status: fields.status && STATUSES.includes(fields.status) ? fields.status : "scheduled",
    priority: fields.priority && PRIORITIES.includes(fields.priority) ? fields.priority : "normal",
    assignedUserId: fields.assignedUserId ?? null,
    notes: fields.notes?.trim() ?? "",
  };
}

export const jobsRouter = Router();

jobsRouter.get("/", (req, res) => {
  res.json(
    [...jobs.values()]
      .filter((job) => job.accountId === req.session!.account.id)
      .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)),
  );
});

jobsRouter.get("/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || job.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "job not found" });
    return;
  }
  res.json(job);
});

jobsRouter.post("/", (req, res) => {
  const fields = readFields(req.body);
  if (typeof fields === "string") {
    res.status(400).json({ error: fields });
    return;
  }
  const job: Job = { id: newId("job"), accountId: req.session!.account.id, ...fields };
  jobs.set(job.id, job);
  res.status(201).json(job);
});

jobsRouter.put("/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || job.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "job not found" });
    return;
  }
  const fields = readFields(req.body);
  if (typeof fields === "string") {
    res.status(400).json({ error: fields });
    return;
  }
  Object.assign(job, fields);
  res.json(job);
});

jobsRouter.delete("/:id", (req, res) => {
  const job = jobs.get(req.params.id);
  if (!job || job.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "job not found" });
    return;
  }
  jobs.delete(job.id);
  res.status(204).end();
});
