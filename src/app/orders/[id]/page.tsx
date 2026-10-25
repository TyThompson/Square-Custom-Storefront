"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { formatMoney } from "@/lib/catalog";
import type { FulfillmentStatus, StoreOrder } from "@/lib/order-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const STATUS_COPY: Record<FulfillmentStatus, string> = {
  RECEIVED: "Received",
  PREPARING: "Preparing",
  READY: "Ready",
  COMPLETED: "Completed",
  CANCELED: "Canceled",
};

const PIPELINE: FulfillmentStatus[] = [
  "RECEIVED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export default function OrderStatusPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const id = params.id;

    async function load() {
      try {
        const res = await fetch(`/api/orders/${id}`);
        const data = (await res.json()) as { order?: StoreOrder; error?: string };
        if (!res.ok || !data.order) {
          throw new Error(data.error ?? "Order not found");
        }
        if (!cancelled) {
          setOrder(data.order);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load order");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    const timer = window.setInterval(load, 2500);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [params.id]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <div className="h-40 animate-pulse rounded-2xl bg-[var(--wash)]" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
        <h1 className="font-[family-name:var(--font-display)] text-3xl">
          Order not found
        </h1>
        <p className="mt-2 text-[var(--muted)]">{error}</p>
        <Button asChild className="mt-6 bg-[var(--ink)] text-white">
          <Link href="/track">Try another id</Link>
        </Button>
      </div>
    );
  }

  const activeIndex = PIPELINE.indexOf(
    order.status === "CANCELED" ? "RECEIVED" : order.status,
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            Order status
          </p>
          <h1 className="mt-1 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
            {order.id}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Placed for {order.customerName} · {order.fulfillment.toLowerCase()}
          </p>
        </div>
        <Badge className="bg-[var(--moss)] text-white">
          {STATUS_COPY[order.status]}
        </Badge>
      </div>

      <div className="mt-10 rounded-2xl border border-[var(--line)] bg-white/80 p-5">
        <ol className="grid gap-4 sm:grid-cols-4">
          {PIPELINE.map((status, index) => {
            const done = activeIndex >= index && order.status !== "CANCELED";
            return (
              <li key={status} className="relative">
                <div className="flex items-center gap-2">
                  <span
                    className={`size-2.5 rounded-full ${
                      done
                        ? "animate-pulse-dot bg-[var(--moss)]"
                        : "bg-[var(--line)]"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      done ? "text-[var(--ink)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {STATUS_COPY[status]}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>

        <ul className="mt-8 space-y-3 border-t border-[var(--line)] pt-6">
          {order.timeline.map((event) => (
            <li key={`${event.at}-${event.label}`} className="flex gap-4 text-sm">
              <time className="w-28 shrink-0 tabular-nums text-[var(--muted)]">
                {new Date(event.at).toLocaleTimeString("en-US", {
                  timeZone: "America/New_York",
                  hour: "numeric",
                  minute: "2-digit",
                  second: "2-digit",
                })}{" "}
                ET
              </time>
              <span>{event.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 grid gap-6 rounded-2xl border border-[var(--line)] bg-white/80 p-5 sm:grid-cols-2">
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Items
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            {order.lines.map((line) => (
              <li key={line.itemId} className="flex justify-between gap-3">
                <span>
                  {line.name} × {line.quantity}
                </span>
                <span className="tabular-nums">
                  {formatMoney(line.unitPriceCents * line.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex justify-between border-t border-[var(--line)] pt-3 font-medium">
            <span>Total</span>
            <span className="tabular-nums">{formatMoney(order.totalCents)}</span>
          </p>
        </div>
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl">
            Square linkage
          </h2>
          <dl className="mt-3 space-y-2 text-sm text-[var(--muted)]">
            <div className="flex justify-between gap-3">
              <dt>Mode</dt>
              <dd className="text-[var(--ink)]">{order.mode}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt>Payment</dt>
              <dd className="text-[var(--ink)]">{order.paymentStatus}</dd>
            </div>
            {order.squareOrderId ? (
              <div className="flex justify-between gap-3">
                <dt>Square order</dt>
                <dd className="truncate text-[var(--ink)]">
                  {order.squareOrderId}
                </dd>
              </div>
            ) : null}
            {order.squarePaymentId ? (
              <div className="flex justify-between gap-3">
                <dt>Square payment</dt>
                <dd className="truncate text-[var(--ink)]">
                  {order.squarePaymentId}
                </dd>
              </div>
            ) : null}
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
            With live credentials, the same order appears in Square Dashboard /
            POS while customers keep tracking on your brand.
          </p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button asChild className="bg-[var(--ink)] text-white hover:bg-[var(--moss)]">
          <Link href="/#menu">Order again</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/track">Look up another order</Link>
        </Button>
      </div>
    </div>
  );
}
