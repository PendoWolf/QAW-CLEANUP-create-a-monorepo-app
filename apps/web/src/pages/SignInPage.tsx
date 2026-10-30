import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Button, Card, Notice, TextField } from "@crewdesk/ui";
import { useAuth } from "../auth/AuthContext";

export function SignInPage() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  if (user) {
    return <Navigate to="/" replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSigningIn(true);
    setError(null);
    try {
      await signIn(email, password);
      const from = (location.state as { from?: string } | null)?.from ?? "/";
      navigate(from, { replace: true });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setSigningIn(false);
    }
  };

  return (
    <main className="sign-in">
      <Card title="Sign in to Crewdesk">
        <form onSubmit={submit}>
          <TextField label="Email" type="email" autoComplete="username" value={email} onChange={setEmail} required />
          <TextField
            label="Password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={setPassword}
            required
          />
          {error && <Notice kind="error">{error}</Notice>}
          <Button type="submit" disabled={signingIn}>
            {signingIn ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </Card>
    </main>
  );
}
