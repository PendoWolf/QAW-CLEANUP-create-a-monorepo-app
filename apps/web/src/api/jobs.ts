import { apiRequest } from "./client";
import type { Job, JobFields } from "./types";

export const jobsApi = {
  list: () => apiRequest<Job[]>("/api/jobs"),
  get: (id: string) => apiRequest<Job>(`/api/jobs/${encodeURIComponent(id)}`),
  create: (fields: JobFields) => apiRequest<Job>("/api/jobs", { method: "POST", body: fields }),
  update: (id: string, fields: JobFields) =>
    apiRequest<Job>(`/api/jobs/${encodeURIComponent(id)}`, { method: "PUT", body: fields }),
  remove: (id: string) => apiRequest<void>(`/api/jobs/${encodeURIComponent(id)}`, { method: "DELETE" }),
};
