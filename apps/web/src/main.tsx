import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@crewdesk/ui/ui.css";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import "./styles.css";

// Boot Pendo once, before the app renders. An empty visitor id lets the agent resume the previous visitor, or
// start an anonymous one; AuthProvider identifies the signed-in user.
pendo.initialize({
  visitor: {
    id: "",
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
