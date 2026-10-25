"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function TrackPage() {
  const router = useRouter();
  const [orderId, setOrderId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const id = orderId.trim();
    if (!id) {
      setError("Enter an order id from your confirmation.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(id)}`);
      if (!res.ok) {
        setError("We couldn’t find that order on this storefront.");
        return;
      }
      router.push(`/orders/${id}`);
    } catch {
      setError("Lookup failed. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        Track your order
      </h1>
      <p className="mt-3 text-[var(--muted)]">
        Status lives on your site — easier for customers than bouncing between a
        Square Online page and your brand.
      </p>

      <form
        onSubmit={handleLookup}
        className="mt-8 space-y-4 rounded-2xl border border-[var(--line)] bg-white/80 p-5"
      >
        <div className="space-y-2">
          <Label htmlFor="orderId">Order ID</Label>
          <Input
            id="orderId"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="nl_xxxxxxxx"
            className="bg-white"
          />
        </div>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
            {error}
          </p>
        ) : null}
        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-[var(--moss)] text-white hover:bg-[var(--ink)]"
        >
          {loading ? "Looking up…" : "View status"}
        </Button>
      </form>
    </div>
  );
}
