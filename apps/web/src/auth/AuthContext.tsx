import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authApi } from "../api/auth";
import { clearSessionToken, readSessionToken, saveSessionToken } from "../api/client";
import type { Account, User } from "../api/types";

interface AuthState {
  /** The signed-in user, or null when signed out. */
  user: User | null;
  /** The company the signed-in user belongs to, or null when signed out. */
  account: Account | null;
  /** True until the stored session has been checked with the API. */
  loading: boolean;
  /** Signs in, and resolves with who signed in and to which account. */
  signIn: (email: string, password: string) => Promise<{ user: User; account: Account }>;
  signOut: () => Promise<void>;
  /** Replaces the signed-in user after a profile change. */
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthState | null>(null);

/** Holds the sign-in session for the whole app: who is signed in, and to which account. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore the session a previous visit saved.
  useEffect(() => {
    if (!readSessionToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((session) => {
        setUser(session.user);
        setAccount(session.account);
      })
      .catch(() => clearSessionToken())
      .finally(() => setLoading(false));
  }, []);

  // Identify the signed-in user to Pendo after sign-in, a restored session, or a profile change.
  useEffect(() => {
    if (!user || !account) {
      return;
    }
    pendo.identify({
      visitor: {
        id: user.id,
        email: user.email,
        full_name: user.name,
        accountId: user.accountId,
        role: user.role,
      },
      account: {
        id: account.id,
        name: account.name,
        plan: account.plan,
        seats: account.seats,
      },
    });
  }, [user, account]);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await authApi.signIn(email, password);
    saveSessionToken(session.token);
    setUser(session.user);
    setAccount(session.account);
    return { user: session.user, account: session.account };
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authApi.signOut();
    } finally {
      clearSessionToken();
      setUser(null);
      setAccount(null);
      // Start a fresh anonymous Pendo visitor. clearSession is not queued by the install snippet, so skip it if the
      // agent has not finished loading yet.
      if (typeof pendo.clearSession === "function") {
        pendo.clearSession();
      }
    }
  }, []);

  const value = useMemo(
    () => ({ user, account, loading, signIn, signOut, setUser }),
    [user, account, loading, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return auth;
}

/** Shows `children` only to a signed-in user, and sends everyone else to the sign-in page. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return <p className="loading">Loading…</p>;
  }
  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
