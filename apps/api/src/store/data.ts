import { randomUUID } from "node:crypto";
import type { Account, Billing, Customer, Job, StoredUser } from "../types.js";

// Everything lives in memory and resets when the API restarts. A real deployment swaps this module for a
// database without touching the routes.
export const accounts = new Map<string, Account>();
export const billing = new Map<string, Billing>();
export const users = new Map<string, StoredUser>();
export const customers = new Map<string, Customer>();
export const jobs = new Map<string, Job>();
/** Sign-in sessions: bearer token to user id. */
export const sessions = new Map<string, string>();

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID().slice(0, 8)}`;
}

const now = new Date().toISOString();

for (const account of [
  { id: "acct_acme", name: "Acme Plumbing", plan: "team", seats: 5, createdAt: now },
  { id: "acct_northwind", name: "Northwind HVAC", plan: "business", seats: 12, createdAt: now },
] satisfies Account[]) {
  accounts.set(account.id, account);
}

billing.set("acct_acme", {
  accountId: "acct_acme",
  billingEmail: "billing@acme-plumbing.test",
  cardholderName: "Dana Reyes",
  cardLast4: "4242",
  billingCycle: "monthly",
  pricePerSeat: 2900,
});
billing.set("acct_northwind", {
  accountId: "acct_northwind",
  billingEmail: "ap@northwind-hvac.test",
  cardholderName: "Sam Okafor",
  cardLast4: "1881",
  billingCycle: "annual",
  pricePerSeat: 4900,
});

for (const user of [
  { id: "usr_dana", accountId: "acct_acme", email: "dana@acme-plumbing.test", name: "Dana Reyes", role: "owner" },
  { id: "usr_luis", accountId: "acct_acme", email: "luis@acme-plumbing.test", name: "Luis Moreno", role: "technician" },
  { id: "usr_sam", accountId: "acct_northwind", email: "sam@northwind-hvac.test", name: "Sam Okafor", role: "owner" },
] as const) {
  users.set(user.id, { ...user, password: "crewdesk", createdAt: now });
}

for (const customer of [
  { id: "cus_baker", accountId: "acct_acme", name: "Baker Street Cafe", email: "owner@bakerstreet.test", phone: "555-0101", address: "221 Baker St" },
  { id: "cus_lane", accountId: "acct_acme", name: "Penny Lane", email: "penny@lane.test", phone: "555-0102", address: "12 Penny Ln" },
] satisfies Customer[]) {
  customers.set(customer.id, customer);
}

for (const job of [
  {
    id: "job_leak",
    accountId: "acct_acme",
    customerId: "cus_baker",
    title: "Fix the kitchen sink leak",
    status: "scheduled",
    priority: "urgent",
    scheduledFor: "2026-11-03",
    assignedUserId: "usr_luis",
    notes: "Leak under the main prep sink.",
  },
  {
    id: "job_heater",
    accountId: "acct_acme",
    customerId: "cus_lane",
    title: "Replace the water heater",
    status: "in_progress",
    priority: "normal",
    scheduledFor: "2026-11-05",
    assignedUserId: null,
    notes: "",
  },
] satisfies Job[]) {
  jobs.set(job.id, job);
}
