import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Notice, PageHeader, formatDate } from "@crewdesk/ui";
import { jobsApi } from "../api/jobs";
import type { Job } from "../api/types";
import { useAuth } from "../auth/AuthContext";

export function DashboardPage() {
  const { user, account } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    jobsApi
      .list()
      .then(setJobs)
      .catch((e: Error) => setError(e.message));
  }, []);

  const open = jobs.filter((job) => job.status !== "done");
  const urgent = open.filter((job) => job.priority === "urgent");

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name ?? ""}`} subtitle={`${account?.name} · ${account?.plan} plan`} />
      <div className="stats">
        <Card title="Open jobs">
          <p className="stat">{open.length}</p>
        </Card>
        <Card title="Urgent">
          <p className="stat">{urgent.length}</p>
        </Card>
      </div>
      <Card title="Coming up">
        <ul className="plain-list">
          {open.slice(0, 5).map((job) => (
            <li key={job.id}>
              <Link to={`/jobs/${job.id}`}>{job.title}</Link> · {formatDate(job.scheduledFor)}
            </li>
          ))}
        </ul>
      </Card>
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
