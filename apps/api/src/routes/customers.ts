import { Router } from "express";
import { customers, newId } from "../store/data.js";
import type { Customer } from "../types.js";

export const customersRouter = Router();

type CustomerFields = Omit<Customer, "id" | "accountId">;

function readFields(body: unknown): CustomerFields | string {
  const { name, email, phone, address } = (body ?? {}) as Partial<CustomerFields>;
  if (!name?.trim()) return "name is required";
  if (!email?.includes("@")) return "a valid email is required";
  return { name: name.trim(), email: email.trim(), phone: phone?.trim() ?? "", address: address?.trim() ?? "" };
}

customersRouter.get("/", (req, res) => {
  res.json([...customers.values()].filter((customer) => customer.accountId === req.session!.account.id));
});

customersRouter.get("/:id", (req, res) => {
  const customer = customers.get(req.params.id);
  if (!customer || customer.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "customer not found" });
    return;
  }
  res.json(customer);
});

customersRouter.post("/", (req, res) => {
  const fields = readFields(req.body);
  if (typeof fields === "string") {
    res.status(400).json({ error: fields });
    return;
  }
  const customer: Customer = { id: newId("cus"), accountId: req.session!.account.id, ...fields };
  customers.set(customer.id, customer);
  res.status(201).json(customer);
});

customersRouter.put("/:id", (req, res) => {
  const customer = customers.get(req.params.id);
  if (!customer || customer.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "customer not found" });
    return;
  }
  const fields = readFields(req.body);
  if (typeof fields === "string") {
    res.status(400).json({ error: fields });
    return;
  }
  Object.assign(customer, fields);
  res.json(customer);
});

customersRouter.delete("/:id", (req, res) => {
  const customer = customers.get(req.params.id);
  if (!customer || customer.accountId !== req.session!.account.id) {
    res.status(404).json({ error: "customer not found" });
    return;
  }
  customers.delete(customer.id);
  res.status(204).end();
});
