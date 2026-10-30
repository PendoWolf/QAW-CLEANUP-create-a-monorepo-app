import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@crewdesk/ui";
import { useAuth } from "../auth/AuthContext";
import { CopilotPanel } from "./CopilotPanel";

/** The signed-in app's frame: the side navigation, the signed-in user, sign-out, and the Copilot panel. */
export function AppLayout() {
  const { user, account, signOut } = useAuth();
  const navigate = useNavigate();
  const [copilotOpen, setCopilotOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/sign-in", { replace: true });
  };

  return (
    <div className={copilotOpen ? "layout with-copilot" : "layout"}>
      <nav className="sidebar" aria-label="Main">
        <strong className="brand">Crewdesk</strong>
        <NavLink to="/" end>
          Dashboard
        </NavLink>
        <NavLink to="/jobs">Jobs</NavLink>
        <NavLink to="/customers">Customers</NavLink>
        <NavLink to="/settings">Settings</NavLink>
        <div className="signed-in">
          <span>{user?.name}</span>
          <span className="muted">{account?.name}</span>
          <Button variant="secondary" onClick={() => void handleSignOut()}>
            Sign out
          </Button>
        </div>
      </nav>

      <main className="content">
        {!copilotOpen && (
          <div className="copilot-launcher">
            <Button onClick={() => setCopilotOpen(true)}>Ask Copilot</Button>
          </div>
        )}
        <Outlet />
      </main>

      {copilotOpen && <CopilotPanel onClose={() => setCopilotOpen(false)} />}
    </div>
  );
}
