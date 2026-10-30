import { useState, type FormEvent } from "react";
import { Button, Card, SelectField, TextField } from "@crewdesk/ui";
import type { Customer, JobFields } from "../api/types";

const EMPTY_JOB: JobFields = {
  title: "",
  customerId: "",
  status: "scheduled",
  priority: "normal",
  scheduledFor: "",
  assignedUserId: null,
  notes: "",
};

/** The form that creates a job, or edits one when `initial` is given. */
export function JobForm({
  heading,
  submitLabel,
  customers,
  initial,
  onSubmit,
}: {
  heading: string;
  submitLabel: string;
  customers: Customer[];
  initial?: JobFields;
  onSubmit: (fields: JobFields) => Promise<void>;
}) {
  const [fields, setFields] = useState<JobFields>(initial ?? EMPTY_JOB);
  const [saving, setSaving] = useState(false);
  const set = <Key extends keyof JobFields>(key: Key, value: JobFields[Key]) =>
    setFields((current) => ({ ...current, [key]: value }));

  const canSubmit = fields.title.trim() !== "" && fields.customerId !== "" && fields.scheduledFor !== "" && !saving;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSubmit(fields);
      if (!initial) setFields(EMPTY_JOB);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={heading}>
      <form onSubmit={submit}>
        <TextField label="Title" value={fields.title} onChange={(value) => set("title", value)} placeholder="Fix the leak" />
        <SelectField
          label="Customer"
          value={fields.customerId}
          onChange={(value) => set("customerId", value)}
          options={[{ value: "", label: "Choose a customer" }, ...customers.map((c) => ({ value: c.id, label: c.name }))]}
        />
        <div className="row">
          <TextField
            label="Scheduled for"
            type="date"
            value={fields.scheduledFor}
            onChange={(value) => set("scheduledFor", value)}
          />
          <SelectField
            label="Priority"
            value={fields.priority}
            onChange={(value) => set("priority", value as JobFields["priority"])}
            options={[
              { value: "low", label: "Low" },
              { value: "normal", label: "Normal" },
              { value: "urgent", label: "Urgent" },
            ]}
          />
          <SelectField
            label="Status"
            value={fields.status}
            onChange={(value) => set("status", value as JobFields["status"])}
            options={[
              { value: "scheduled", label: "Scheduled" },
              { value: "in_progress", label: "In progress" },
              { value: "done", label: "Done" },
            ]}
          />
        </div>
        <TextField label="Notes" value={fields.notes} onChange={(value) => set("notes", value)} />
        <Button type="submit" disabled={!canSubmit}>
          {saving ? "Saving…" : submitLabel}
        </Button>
      </form>
    </Card>
  );
}
