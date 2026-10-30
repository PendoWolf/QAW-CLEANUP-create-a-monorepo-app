import { useState, type FormEvent } from "react";
import { Button, Card, Notice, PageHeader, TextField } from "@crewdesk/ui";
import { trackEvent } from "../analytics/pendo";
import { authApi } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

export function SettingsPage() {
  const { user, account, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setError(null);
    try {
      const updated = await authApi.updateProfile({ name, email });
      // Only whether the name or email changed, never the values.
      trackEvent("profile_updated", {
        nameChanged: user?.name !== updated.name,
        emailChanged: user?.email !== updated.email,
        role: updated.role,
      });
      setUser(updated);
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Settings" subtitle={`Your profile at ${account?.name}`} />
      <Card title="Your profile">
        <form onSubmit={submit}>
          <TextField label="Name" value={name} onChange={setName} />
          <TextField label="Email" type="email" value={email} onChange={setEmail} />
          <p className="muted">Role: {user?.role}</p>
          <Button type="submit">Save profile</Button>
        </form>
      </Card>
      {saved && <Notice kind="success">Profile saved.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
