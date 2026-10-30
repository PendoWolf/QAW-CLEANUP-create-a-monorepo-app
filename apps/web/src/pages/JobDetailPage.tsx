import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Notice, PageHeader } from "@crewdesk/ui";
import { customersApi } from "../api/customers";
import { jobsApi } from "../api/jobs";
import type { Customer, Job, JobFields } from "../api/types";
import { JobForm } from "../components/JobForm";

export function JobDetailPage() {
  const { jobId = "" } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.all([jobsApi.get(jobId), customersApi.list()])
      .then(([found, customerList]) => {
        setJob(found);
        setCustomers(customerList);
      })
      .catch((e: Error) => setError(e.message));
  }, [jobId]);

  const saveJob = async (fields: JobFields) => {
    try {
      setError(null);
      setJob(await jobsApi.update(jobId, fields));
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const deleteJob = async () => {
    try {
      await jobsApi.remove(jobId);
      navigate("/jobs");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  if (!job) {
    return error ? <Notice kind="error">{error}</Notice> : <p className="loading">Loading…</p>;
  }

  const { id: _id, ...fields } = job;
  return (
    <>
      <PageHeader
        title={job.title}
        subtitle="Edit the job, or delete it."
        actions={
          <Button variant="danger" onClick={() => void deleteJob()}>
            Delete job
          </Button>
        }
      />
      <JobForm key={job.id} heading="Job details" submitLabel="Save changes" customers={customers} initial={fields} onSubmit={saveJob} />
      {saved && <Notice kind="success">Saved.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
