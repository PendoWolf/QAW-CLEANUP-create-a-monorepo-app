import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { adminApi, adminToken, type AdminAccount, type AdminUser } from "../api/client";

interface AdminSessionState {
  user: AdminUser | null;
  account: AdminAccount | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminSessionContext = createContext<AdminSessionState | null>(null);

/** The admin's sign-in session, kept for the browser tab only. */
export function AdminSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [account, setAccount] = useState<AdminAccount | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminToken.read()) {
      setLoading(false);
      return;
    }
    adminApi
      .me()
      .then((session) => {
        setUser(session.user);
        setAccount(session.account);
      })
      .catch(() => adminToken.clear())
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (email: string, password: string) => {
    const session = await adminApi.signIn(email, password);
    if (session.user.role !== "owner") {
      throw new Error("Only account owners can use Crewdesk Admin");
    }
    adminToken.save(session.token);
    setUser(session.user);
    setAccount(session.account);
  };

  const signOut = async () => {
    try {
      await adminApi.signOut();
    } finally {
      adminToken.clear();
      setUser(null);
      setAccount(null);
    }
  };

  return (
    <AdminSessionContext.Provider value={{ user, account, loading, signIn, signOut }}>
      {children}
    </AdminSessionContext.Provider>
  );
}

export function useAdminSession(): AdminSessionState {
  const session = useContext(AdminSessionContext);
  if (!session) {
    throw new Error("useAdminSession must be used inside <AdminSessionProvider>");
  }
  return session;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAdminSession();
  if (loading) return <p className="loading">Loading…</p>;
  if (!user) return <Navigate to="/sign-in" replace />;
  return <>{children}</>;
}
