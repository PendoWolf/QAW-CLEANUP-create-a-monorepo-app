import { Router } from "express";
import { publicUser } from "../auth.js";
import { newId, users } from "../store/data.js";
import type { Role } from "../types.js";

const ROLES: Role[] = ["owner", "dispatcher", "technician"];

export const usersRouter = Router();

// The users of the signed-in user's account.
usersRouter.get("/", (req, res) => {
  const { account } = req.session!;
  res.json([...users.values()].filter((user) => user.accountId === account.id).map(publicUser));
});

// Invites a user to the account.
usersRouter.post("/", (req, res) => {
  const { account } = req.session!;
  const { email, name, role } = (req.body ?? {}) as { email?: string; name?: string; role?: Role };
  if (!email?.includes("@") || !name?.trim() || !role || !ROLES.includes(role)) {
    res.status(400).json({ error: "email, name and a role are required" });
    return;
  }
  const user = {
    id: newId("usr"),
    accountId: account.id,
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
    password: "crewdesk",
    createdAt: new Date().toISOString(),
  };
  users.set(user.id, user);
  res.status(201).json(publicUser(user));
});

// Updates the signed-in user's own profile.
usersRouter.patch("/me", (req, res) => {
  const stored = users.get(req.session!.user.id)!;
  const { name, email } = (req.body ?? {}) as { name?: string; email?: string };
  if (name !== undefined) stored.name = name.trim();
  if (email !== undefined) stored.email = email.trim().toLowerCase();
  res.json(publicUser(stored));
});

// Changes a user's name or role.
usersRouter.patch("/:id", (req, res) => {
  const stored = users.get(req.params.id);
  if (!stored || stored.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  const { name, role } = (req.body ?? {}) as { name?: string; role?: Role };
  if (name !== undefined) stored.name = name.trim();
  if (role !== undefined && ROLES.includes(role)) stored.role = role;
  res.json(publicUser(stored));
});

usersRouter.delete("/:id", (req, res) => {
  const stored = users.get(req.params.id);
  if (!stored || stored.accountId !== req.session!.account.id || stored.id === req.session!.user.id) {
    res.status(404).json({ error: "user not found" });
    return;
  }
  users.delete(stored.id);
  res.status(204).end();
});
