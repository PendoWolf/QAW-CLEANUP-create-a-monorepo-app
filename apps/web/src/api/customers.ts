import { apiRequest } from "./client";
import type { Customer, CustomerFields } from "./types";

export const customersApi = {
  list: () => apiRequest<Customer[]>("/api/customers"),
  create: (fields: CustomerFields) => apiRequest<Customer>("/api/customers", { method: "POST", body: fields }),
  update: (id: string, fields: CustomerFields) =>
    apiRequest<Customer>(`/api/customers/${encodeURIComponent(id)}`, { method: "PUT", body: fields }),
};
