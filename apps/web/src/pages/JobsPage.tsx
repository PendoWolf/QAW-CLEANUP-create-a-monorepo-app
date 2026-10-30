import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DataTable, Notice, PageHeader, formatDate } from "@crewdesk/ui";
import { trackEvent } from "../analytics/pendo";
import { customersApi } from "../api/customers";
import { jobsApi } from "../api/jobs";
import type { Customer, Job, JobFields } from "../api/types";
import { JobForm } from "../components/JobForm";

/** Whole days from today until a job's scheduled date (negative when it's in the past). */
function daysUntil(scheduledFor: string): number {
  const scheduled = new Date(`${scheduledFor.slice(0, 10)}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((scheduled.getTime() - today.getTime()) / 86_400_000);
}

export function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([jobsApi.list(), customersApi.list()])
      .then(([jobList, customerList]) => {
        setJobs(jobList);
        setCustomers(customerList);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const createJob = async (fields: JobFields) => {
    try {
      setError(null);
      const job = await jobsApi.create(fields);
      // The API accepted the job, so it is actually scheduled.
      trackEvent("job_created", {
        jobId: job.id,
        priority: job.priority,
        status: job.status,
        scheduledFor: job.scheduledFor,
        daysUntilScheduled: daysUntil(job.scheduledFor),
        hasNotes: job.notes.trim() !== "",
        isAssigned: job.assignedUserId !== null,
        customerId: job.customerId,
      });
      setJobs((current) => [...current, job].sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor)));
      setCreated(job.title);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const customerName = (id: string) => customers.find((customer) => customer.id === id)?.name ?? "—";

  return (
    <>
      <PageHeader title="Jobs" subtitle="Every job your crew has on the books." />
      <JobForm heading="Schedule a job" submitLabel="Create job" customers={customers} onSubmit={createJob} />
      {created && <Notice kind="success">Created “{created}”.</Notice>}
      <DataTable
        label="Jobs"
        rows={jobs}
        empty="No jobs yet. Schedule one above."
        columns={[
          { key: "title", header: "Job", render: (job) => <Link to={`/jobs/${job.id}`}>{job.title}</Link> },
          { key: "customer", header: "Customer", render: (job) => customerName(job.customerId) },
          { key: "date", header: "Scheduled for", render: (job) => formatDate(job.scheduledFor) },
          { key: "status", header: "Status", render: (job) => job.status.replace("_", " ") },
          { key: "priority", header: "Priority", render: (job) => job.priority },
        ]}
      />
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
