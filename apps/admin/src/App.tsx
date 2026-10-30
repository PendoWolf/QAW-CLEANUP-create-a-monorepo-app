import { NavLink, Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Button } from "@crewdesk/ui";
import { RequireAdmin, useAdminSession } from "./auth/AdminSession";
import { BillingPage } from "./pages/BillingPage";
import { SignInPage } from "./pages/SignInPage";
import { UsersPage } from "./pages/UsersPage";

function AdminLayout() {
  const { user, account, signOut } = useAdminSession();
  const navigate = useNavigate();
  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };
  return (
    <div className="admin">
      <header className="admin-bar">
        <strong>Crewdesk Admin</strong>
        <nav aria-label="Admin">
          <NavLink to="/users">Users</NavLink>
          <NavLink to="/billing">Billing</NavLink>
        </nav>
        <span className="who">
          {user?.name} · {account?.name}
        </span>
        <Button variant="secondary" onClick={() => void handleSignOut()}>
          Sign out
        </Button>
      </header>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/sign-in" element={<SignInPage />} />
      <Route
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/users" replace />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="billing" element={<BillingPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
