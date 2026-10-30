import { Router } from "express";
import { requireSession, signIn, signOut } from "../auth.js";

export const authRouter = Router();

// Signs in with an email and password. The web and admin apps keep the token and send it as a bearer token.
authRouter.post("/sign-in", (req, res) => {
  const { email, password } = (req.body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "email and password are required" });
    return;
  }
  const session = signIn(email, password);
  if (!session) {
    res.status(401).json({ error: "wrong email or password" });
    return;
  }
  res.json(session);
});

// The signed-in user and their account.
authRouter.get("/me", requireSession, (req, res) => {
  const { user, account } = req.session!;
  res.json({ user, account });
});

authRouter.post("/sign-out", requireSession, (req, res) => {
  signOut(req.session!.token);
  res.status(204).end();
});
