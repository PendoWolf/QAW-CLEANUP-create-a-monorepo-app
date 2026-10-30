/** The signed-in user. */
export interface User {
  id: string;
  accountId: string;
  email: string;
  name: string;
  role: "owner" | "dispatcher" | "technician";
}

/** The company the signed-in user belongs to. */
export interface Account {
  id: string;
  name: string;
  plan: "starter" | "team" | "business";
  seats: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

export type CustomerFields = Omit<Customer, "id">;

export interface Job {
  id: string;
  customerId: string;
  title: string;
  status: "scheduled" | "in_progress" | "done";
  priority: "low" | "normal" | "urgent";
  scheduledFor: string;
  assignedUserId: string | null;
  notes: string;
}

export type JobFields = Omit<Job, "id">;
