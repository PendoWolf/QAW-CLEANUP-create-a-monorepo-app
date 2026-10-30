import { useEffect, useState } from "react";
import { Button, DataTable, Notice, PageHeader } from "@crewdesk/ui";
import { customersApi } from "../api/customers";
import type { Customer, CustomerFields } from "../api/types";
import { CustomerForm } from "../components/CustomerForm";

export function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    customersApi
      .list()
      .then(setCustomers)
      .catch((e: Error) => setError(e.message));
  }, []);

  const addCustomer = async (fields: CustomerFields) => {
    try {
      setError(null);
      const customer = await customersApi.create(fields);
      setCustomers((current) => [...current, customer]);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const updateCustomer = async (fields: CustomerFields) => {
    if (!editing) return;
    try {
      setError(null);
      const updated = await customersApi.update(editing.id, fields);
      setCustomers((current) => current.map((customer) => (customer.id === updated.id ? updated : customer)));
      setEditing(null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <>
      <PageHeader title="Customers" subtitle="The people and businesses you do jobs for." />
      {editing ? (
        <CustomerForm
          key={editing.id}
          heading={`Edit ${editing.name}`}
          submitLabel="Save customer"
          initial={{ name: editing.name, email: editing.email, phone: editing.phone, address: editing.address }}
          onSubmit={updateCustomer}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <CustomerForm heading="Add a customer" submitLabel="Add customer" onSubmit={addCustomer} />
      )}
      <DataTable
        label="Customers"
        rows={customers}
        empty="No customers yet."
        columns={[
          { key: "name", header: "Name", render: (customer) => customer.name },
          { key: "email", header: "Email", render: (customer) => customer.email },
          { key: "phone", header: "Phone", render: (customer) => customer.phone },
          {
            key: "edit",
            header: "",
            render: (customer) => (
              <Button variant="secondary" onClick={() => setEditing(customer)} aria-label={`Edit ${customer.name}`}>
                Edit
              </Button>
            ),
          },
        ]}
      />
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
