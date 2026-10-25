"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { PaymentForm } from "@/components/payment-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalCents, clear } = useCart();
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [fulfillment, setFulfillment] = useState<"PICKUP" | "SHIPPING">(
    "PICKUP",
  );
  const [formError, setFormError] = useState<string | null>(null);

  const amountLabel = useMemo(
    () => formatMoney(subtotalCents),
    [subtotalCents],
  );

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Nothing to check out
        </h1>
        <p className="mt-2 text-[var(--muted)]">Add items from the shelf first.</p>
        <Button asChild className="mt-6 bg-[var(--ink)] text-white">
          <Link href="/#menu">Shop</Link>
        </Button>
      </div>
    );
  }

  async function placeOrder(sourceId: string) {
    setFormError(null);
    if (!customerName.trim() || !customerEmail.trim()) {
      setFormError("Name and email are required before paying.");
      throw new Error("Missing customer details");
    }

    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerName,
        customerEmail,
        phone,
        note,
        fulfillment,
        sourceId,
        lines: lines.map((line) => ({
          itemId: line.item.id,
          quantity: line.quantity,
        })),
      }),
    });

    const data = (await res.json()) as {
      order?: { id: string };
      error?: string;
    };

    if (!res.ok || !data.order) {
      throw new Error(data.error ?? "Checkout failed");
    }

    clear();
    router.push(`/orders/${data.order.id}`);
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[1.1fr_0.9fr] sm:px-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
          Checkout
        </h1>
        <p className="mt-2 text-[var(--muted)]">
          Pay on Northline. Square never hosts this page.
        </p>

        <form className="mt-8 space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="bg-white"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="bg-white"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label>Fulfillment</Label>
            <div className="flex gap-3">
              {(["PICKUP", "SHIPPING"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setFulfillment(option)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    fulfillment === option
                      ? "border-[var(--moss)] bg-[var(--moss)] text-white"
                      : "border-[var(--line)] bg-white text-[var(--ink)]"
                  }`}
                >
                  {option === "PICKUP" ? "Pickup" : "Shipping"}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="note">Order note</Label>
            <Input
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. grind for pour-over"
              className="bg-white"
            />
          </div>
        </form>

        {formError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {formError}
          </p>
        ) : null}

        <div className="mt-8 rounded-2xl border border-[var(--line)] bg-white/80 p-5">
          <PaymentForm amountLabel={amountLabel} onToken={placeOrder} />
        </div>
      </div>

      <aside className="h-fit rounded-2xl border border-[var(--line)] bg-white/80 p-5">
        <h2 className="font-[family-name:var(--font-display)] text-xl">
          Order summary
        </h2>
        <ul className="mt-4 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.item.id} className="flex justify-between gap-4">
              <span>
                {line.item.name} × {line.quantity}
              </span>
              <span className="tabular-nums">
                {formatMoney(line.item.priceCents * line.quantity)}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex justify-between border-t border-[var(--line)] pt-4 font-medium">
          <span>Total</span>
          <span className="tabular-nums">{amountLabel}</span>
        </div>
      </aside>
    </div>
  );
}
