/** A customer account (a company) on Crewdesk. Every user, job and customer belongs to one. */
export interface Account {
  id: string;
  name: string;
  plan: "starter" | "team" | "business";
  seats: number;
  createdAt: string;
}

/** How an account pays, as the admin app's billing form edits it. */
export interface Billing {
  accountId: string;
  billingEmail: string;
  cardholderName: string;
  cardLast4: string;
  billingCycle: "monthly" | "annual";
  /** The plan's price per seat, in cents. */
  pricePerSeat: number;
}

export type Role = "owner" | "dispatcher" | "technician";

export interface User {
  id: string;
  accountId: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

/** A user as the store keeps it, with the password the sign-in route checks. */
export interface StoredUser extends User {
  password: string;
}

export interface Customer {
  id: string;
  accountId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type JobStatus = "scheduled" | "in_progress" | "done";

export interface Job {
  id: string;
  accountId: string;
  customerId: string;
  title: string;
  status: JobStatus;
  priority: "low" | "normal" | "urgent";
  /** ISO date, such as "2026-11-03". */
  scheduledFor: string;
  assignedUserId: string | null;
  notes: string;
}

/** One message of a Copilot conversation, as the web app sends it. */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
