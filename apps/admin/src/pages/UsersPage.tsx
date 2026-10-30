import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, DataTable, Notice, PageHeader, SelectField, TextField, formatDate } from "@crewdesk/ui";
import { adminApi, type AdminUser } from "../api/client";

const ROLE_OPTIONS = [
  { value: "owner", label: "Owner" },
  { value: "dispatcher", label: "Dispatcher" },
  { value: "technician", label: "Technician" },
];

export function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<AdminUser["role"]>("technician");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .listUsers()
      .then(setUsers)
      .catch((e: Error) => setError(e.message));
  }, []);

  const invite = async (event: FormEvent) => {
    event.preventDefault();
    try {
      setError(null);
      const user = await adminApi.inviteUser({ email, name, role });
      setUsers((current) => [...current, user]);
      setEmail("");
      setName("");
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const changeRole = async (user: AdminUser, next: string) => {
    try {
      const updated = await adminApi.changeRole(user.id, next as AdminUser["role"]);
      setUsers((current) => current.map((candidate) => (candidate.id === updated.id ? updated : candidate)));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const remove = async (user: AdminUser) => {
    try {
      await adminApi.removeUser(user.id);
      setUsers((current) => current.filter((candidate) => candidate.id !== user.id));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Users" subtitle="Everyone who can sign in to your Crewdesk account." />
      <DataTable
        label="Users"
        rows={users}
        empty="No users yet."
        columns={[
          { key: "name", header: "Name", render: (user) => user.name },
          { key: "email", header: "Email", render: (user) => user.email },
          {
            key: "role",
            header: "Role",
            render: (user) => (
              <SelectField label={`Role for ${user.name}`} value={user.role} options={ROLE_OPTIONS} onChange={(next) => void changeRole(user, next)} />
            ),
          },
          { key: "since", header: "Added", render: (user) => formatDate(user.createdAt.slice(0, 10)) },
          {
            key: "remove",
            header: "",
            render: (user) => (
              <Button variant="danger" onClick={() => void remove(user)} aria-label={`Remove ${user.name}`}>
                Remove
              </Button>
            ),
          },
        ]}
      />
      <Card title="Invite a user">
        <form onSubmit={invite} className="row">
          <TextField label="Name" value={name} onChange={setName} />
          <TextField label="Email" type="email" value={email} onChange={setEmail} />
          <SelectField label="Role" value={role} options={ROLE_OPTIONS} onChange={(next) => setRole(next as AdminUser["role"])} />
          <Button type="submit" disabled={name.trim() === "" || !email.includes("@")}>
            Invite
          </Button>
        </form>
      </Card>
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
