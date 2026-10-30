import { useState, type FormEvent } from "react";
import { Button, Card, TextField } from "@crewdesk/ui";
import type { CustomerFields } from "../api/types";

const EMPTY_CUSTOMER: CustomerFields = { name: "", email: "", phone: "", address: "" };

/** The form that adds a customer, or edits one when `initial` is given. */
export function CustomerForm({
  heading,
  submitLabel,
  initial,
  onSubmit,
  onCancel,
}: {
  heading: string;
  submitLabel: string;
  initial?: CustomerFields;
  onSubmit: (fields: CustomerFields) => Promise<void>;
  onCancel?: () => void;
}) {
  const [fields, setFields] = useState<CustomerFields>(initial ?? EMPTY_CUSTOMER);
  const [saving, setSaving] = useState(false);
  const set = (key: keyof CustomerFields, value: string) => setFields((current) => ({ ...current, [key]: value }));

  const canSubmit = fields.name.trim() !== "" && fields.email.includes("@") && !saving;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      await onSubmit(fields);
      if (!initial) setFields(EMPTY_CUSTOMER);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title={heading}>
      <form onSubmit={submit}>
        <TextField label="Name" value={fields.name} onChange={(value) => set("name", value)} />
        <div className="row">
          <TextField label="Email" type="email" value={fields.email} onChange={(value) => set("email", value)} />
          <TextField label="Phone" value={fields.phone} onChange={(value) => set("phone", value)} />
        </div>
        <TextField label="Address" value={fields.address} onChange={(value) => set("address", value)} />
        <div className="row">
          <Button type="submit" disabled={!canSubmit}>
            {saving ? "Saving…" : submitLabel}
          </Button>
          {onCancel && (
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
