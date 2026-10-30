import { useEffect, useState, type FormEvent } from "react";
import { Button, Card, Notice, PageHeader, SelectField, TextField, formatMoney } from "@crewdesk/ui";
import { adminApi, type Billing } from "../api/client";
import { useAdminSession } from "../auth/AdminSession";

export function BillingPage() {
  const { account } = useAdminSession();
  const [billing, setBilling] = useState<Billing | null>(null);
  const [billingEmail, setBillingEmail] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    adminApi
      .getBilling()
      .then((current) => {
        setBilling(current);
        setBillingEmail(current.billingEmail);
        setCardholderName(current.cardholderName);
        setBillingCycle(current.billingCycle);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaved(false);
    setError(null);
    try {
      setBilling(await adminApi.saveBilling({ billingEmail, cardholderName, cardNumber, billingCycle }));
      setCardNumber("");
      setSaved(true);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const seats = account?.seats ?? 0;
  return (
    <>
      <PageHeader title="Billing" subtitle={`${account?.name} · ${account?.plan} plan · ${seats} seats`} />
      {billing && (
        <Card title="This month">
          <p>
            {seats} seats × {formatMoney(billing.pricePerSeat)} = <strong>{formatMoney(seats * billing.pricePerSeat)}</strong>, charged to
            the card ending {billing.cardLast4}.
          </p>
        </Card>
      )}
      <Card title="Payment details">
        <form onSubmit={save}>
          <TextField label="Billing email" type="email" value={billingEmail} onChange={setBillingEmail} />
          <TextField label="Cardholder name" value={cardholderName} onChange={setCardholderName} />
          <TextField label="New card number" inputMode="numeric" value={cardNumber} onChange={setCardNumber} placeholder="Leave empty to keep the current card" />
          <SelectField
            label="Billing cycle"
            value={billingCycle}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "annual", label: "Annual (2 months free)" },
            ]}
            onChange={setBillingCycle}
          />
          <Button type="submit">Save billing</Button>
        </form>
      </Card>
      {saved && <Notice kind="success">Billing saved.</Notice>}
      {error && <Notice kind="error">{error}</Notice>}
    </>
  );
}
