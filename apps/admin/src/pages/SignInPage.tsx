import { useState, type FormEvent } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Button, Card, Notice, TextField } from "@crewdesk/ui";
import { useAdminSession } from "../auth/AdminSession";

export function SignInPage() {
  const { user, signIn } = useAdminSession();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/users" replace />;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await signIn(email, password);
      navigate("/users", { replace: true });
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <main className="sign-in">
      <Card title="Crewdesk Admin">
        <form onSubmit={submit}>
          <TextField label="Email" type="email" value={email} onChange={setEmail} required />
          <TextField label="Password" type="password" value={password} onChange={setPassword} required />
          {error && <Notice kind="error">{error}</Notice>}
          <Button type="submit">Sign in</Button>
        </form>
      </Card>
    </main>
  );
}
