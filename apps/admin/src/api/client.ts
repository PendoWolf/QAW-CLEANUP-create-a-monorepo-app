// The admin app calls the same Crewdesk API as the web app (apps/api).
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "crewdesk.adminToken";

export const adminToken = {
  read: () => sessionStorage.getItem(TOKEN_KEY),
  save: (token: string) => sessionStorage.setItem(TOKEN_KEY, token),
  clear: () => sessionStorage.removeItem(TOKEN_KEY),
};

/** Calls the Crewdesk API as the signed-in admin, and returns its JSON reply. */
export async function adminRequest<T>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const token = adminToken.read();
  const headers: Record<string, string> = {};
  if (init.body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  if (!response.ok) {
    const reply = (await response.json().catch(() => ({}))) as { error?: string };
    throw new Error(reply.error ?? `${init.method ?? "GET"} ${path} failed: ${response.status}`);
  }
  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: "owner" | "dispatcher" | "technician";
  createdAt: string;
}

export interface AdminAccount {
  id: string;
  name: string;
  plan: "starter" | "team" | "business";
  seats: number;
}

export interface Billing {
  accountId: string;
  billingEmail: string;
  cardholderName: string;
  cardLast4: string;
  billingCycle: "monthly" | "annual";
  pricePerSeat: number;
}

export const adminApi = {
  signIn: (email: string, password: string) =>
    adminRequest<{ token: string; user: AdminUser; account: AdminAccount }>("/api/auth/sign-in", {
      method: "POST",
      body: { email, password },
    }),
  me: () => adminRequest<{ user: AdminUser; account: AdminAccount }>("/api/auth/me"),
  signOut: () => adminRequest<void>("/api/auth/sign-out", { method: "POST" }),
  listUsers: () => adminRequest<AdminUser[]>("/api/users"),
  inviteUser: (fields: { email: string; name: string; role: AdminUser["role"] }) =>
    adminRequest<AdminUser>("/api/users", { method: "POST", body: fields }),
  changeRole: (id: string, role: AdminUser["role"]) =>
    adminRequest<AdminUser>(`/api/users/${encodeURIComponent(id)}`, { method: "PATCH", body: { role } }),
  removeUser: (id: string) => adminRequest<void>(`/api/users/${encodeURIComponent(id)}`, { method: "DELETE" }),
  getBilling: () => adminRequest<Billing>("/api/accounts/current/billing"),
  saveBilling: (fields: { billingEmail: string; cardholderName: string; cardNumber: string; billingCycle: string }) =>
    adminRequest<Billing>("/api/accounts/current/billing", { method: "PUT", body: fields }),
};
