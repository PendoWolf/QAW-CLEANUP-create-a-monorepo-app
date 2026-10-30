import { apiRequest } from "./client";
import type { Account, User } from "./types";

export interface SignInReply {
  token: string;
  user: User;
  account: Account;
}

export const authApi = {
  signIn: (email: string, password: string) =>
    apiRequest<SignInReply>("/api/auth/sign-in", { method: "POST", body: { email, password } }),
  me: () => apiRequest<{ user: User; account: Account }>("/api/auth/me"),
  signOut: () => apiRequest<void>("/api/auth/sign-out", { method: "POST" }),
  updateProfile: (fields: { name: string; email: string }) =>
    apiRequest<User>("/api/users/me", { method: "PATCH", body: fields }),
};
