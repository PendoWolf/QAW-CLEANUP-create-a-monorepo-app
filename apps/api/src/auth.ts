import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { accounts, sessions, users } from "./store/data.js";
import type { Account, StoredUser, User } from "./types.js";

/** What a signed-in request carries: the user and the account (company) they belong to. */
export interface Session {
  token: string;
  user: User;
  account: Account;
}

declare module "express-serve-static-core" {
  interface Request {
    session?: Session;
  }
}

export function publicUser({ password: _password, ...user }: StoredUser): User {
  return user;
}

/** Signs a user in with their email and password, and returns their new session, or null. */
export function signIn(email: string, password: string): Session | null {
  const user = [...users.values()].find((candidate) => candidate.email === email.trim().toLowerCase());
  if (!user || user.password !== password) {
    return null;
  }
  const account = accounts.get(user.accountId);
  if (!account) {
    return null;
  }
  const token = randomUUID();
  sessions.set(token, user.id);
  return { token, user: publicUser(user), account };
}

export function signOut(token: string): void {
  sessions.delete(token);
}

/** Express middleware: answers 401 unless the request has a valid "Authorization: Bearer <token>". */
export function requireSession(req: Request, res: Response, next: NextFunction): void {
  const token = req.header("authorization")?.replace(/^Bearer /, "") ?? "";
  const userId = sessions.get(token);
  const user = userId ? users.get(userId) : undefined;
  const account = user ? accounts.get(user.accountId) : undefined;
  if (!user || !account) {
    res.status(401).json({ error: "sign in first" });
    return;
  }
  req.session = { token, user: publicUser(user), account };
  next();
}
