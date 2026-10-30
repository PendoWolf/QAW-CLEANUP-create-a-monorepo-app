// Every request goes to the Crewdesk API, a separate backend service (apps/api). Its base URL comes from
// VITE_API_URL at build time and defaults to the local API.
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

const TOKEN_KEY = "crewdesk.sessionToken";

export function readSessionToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveSessionToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearSessionToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/** Calls the Crewdesk API as the signed-in user, and returns its JSON reply. */
export async function apiRequest<T>(
  path: string,
  init: { method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"; body?: unknown } = {},
): Promise<T> {
  const token = readSessionToken();
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
    throw new ApiError(reply.error ?? `${init.method ?? "GET"} ${path} failed: ${response.status}`, response.status);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
