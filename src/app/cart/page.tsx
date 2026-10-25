"use client";

import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CartPage() {
  const { lines, subtotalCents, setQuantity, removeItem } = useCart();

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <h1 className="font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
        Cart
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Everything stays on this storefront through checkout and tracking.
      </p>

      {lines.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-white/60 px-6 py-16 text-center">
          <p className="text-[var(--muted)]">Your cart is empty.</p>
          <Button asChild className="mt-6 bg-[var(--ink)] text-white hover:bg-[var(--moss)]">
            <Link href="/#menu">Browse the shelf</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-10 space-y-8">
          <ul className="space-y-4">
            {lines.map((line) => (
              <li
                key={line.item.id}
                className="flex flex-col gap-4 rounded-2xl border border-[var(--line)] bg-white/80 p-4 sm:flex-row sm:items-center"
              >
                <div
                  className="relative h-24 w-full overflow-hidden rounded-xl sm:w-28"
                  style={{
                    background: `linear-gradient(145deg, ${line.item.accent}33, #f3f1eb 70%)`,
                  }}
                >
                  <Image
                    src={line.item.image}
                    alt={line.item.name}
                    fill
                    unoptimized
                    className="object-contain p-3"
                  />
                </div>
                <div className="flex-1">
                  <h2 className="font-[family-name:var(--font-display)] text-xl">
                    {line.item.name}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {formatMoney(line.item.priceCents)} each
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="sr-only" htmlFor={`qty-${line.item.id}`}>
                    Quantity
                  </label>
                  <Input
                    id={`qty-${line.item.id}`}
                    type="number"
                    min={1}
                    max={20}
                    value={line.quantity}
                    onChange={(e) =>
                      setQuantity(line.item.id, Number(e.target.value) || 1)
                    }
                    className="w-20 bg-white"
                  />
                  <Button
                    variant="ghost"
                    onClick={() => removeItem(line.item.id)}
                    className="text-[var(--muted)]"
                  >
                    Remove
                  </Button>
                </div>
                <p className="min-w-20 text-right font-medium tabular-nums">
                  {formatMoney(line.item.priceCents * line.quantity)}
                </p>
              </li>
            ))}
          </ul>

          <div className="flex flex-col items-stretch justify-between gap-4 rounded-2xl border border-[var(--line)] bg-white/80 p-5 sm:flex-row sm:items-center">
            <div>
              <p className="text-sm text-[var(--muted)]">Subtotal</p>
              <p className="font-[family-name:var(--font-display)] text-3xl tabular-nums">
                {formatMoney(subtotalCents)}
              </p>
            </div>
            <Button
              asChild
              className="h-11 bg-[var(--moss)] px-6 text-white hover:bg-[var(--ink)]"
            >
              <Link href="/checkout">Continue to checkout</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
