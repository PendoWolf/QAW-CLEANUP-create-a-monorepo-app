import { Router } from "express";
import { accounts, billing } from "../store/data.js";
import type { Account, Billing } from "../types.js";

export const accountsRouter = Router();

// The signed-in user's account (company).
accountsRouter.get("/current", (req, res) => {
  res.json(req.session!.account);
});

// Renames the account or changes its plan and seats.
accountsRouter.patch("/current", (req, res) => {
  const account = accounts.get(req.session!.account.id)!;
  const { name, plan, seats } = (req.body ?? {}) as Partial<Account>;
  if (name !== undefined) account.name = name.trim();
  if (plan !== undefined) account.plan = plan;
  if (seats !== undefined && Number.isInteger(seats) && seats > 0) account.seats = seats;
  res.json(account);
});

accountsRouter.get("/current/billing", (req, res) => {
  res.json(billing.get(req.session!.account.id));
});

// Saves the billing form: billing email, cardholder, card and billing cycle.
accountsRouter.put("/current/billing", (req, res) => {
  const current = billing.get(req.session!.account.id)!;
  const body = (req.body ?? {}) as Partial<Billing> & { cardNumber?: string };
  if (!body.billingEmail?.includes("@") || !body.cardholderName?.trim()) {
    res.status(400).json({ error: "a billing email and the cardholder's name are required" });
    return;
  }
  const digits = (body.cardNumber ?? "").replace(/\D/g, "");
  const updated: Billing = {
    ...current,
    billingEmail: body.billingEmail.trim(),
    cardholderName: body.cardholderName.trim(),
    billingCycle: body.billingCycle === "annual" ? "annual" : "monthly",
    cardLast4: digits.length >= 12 ? digits.slice(-4) : current.cardLast4,
  };
  billing.set(updated.accountId, updated);
  res.json(updated);
});
