"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Badge } from "@/components/ui/badge";

export function SiteHeader() {
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)]/70 bg-[color-mix(in_oklab,var(--paper)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--ink)] transition-colors group-hover:text-[var(--moss)]">
            Northline
          </span>
          <span className="hidden text-xs uppercase tracking-[0.22em] text-[var(--muted)] sm:inline">
            Goods
          </span>
        </Link>

        <nav className="flex items-center gap-5 text-sm text-[var(--ink)]">
          <Link
            href="/#menu"
            className="hidden transition-colors hover:text-[var(--moss)] sm:inline"
          >
            Shop
          </Link>
          <Link
            href="/track"
            className="transition-colors hover:text-[var(--moss)]"
          >
            Track order
          </Link>
          <Link
            href="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/70 px-3 py-1.5 transition-colors hover:border-[var(--moss)]"
          >
            <ShoppingBag className="size-4" />
            <span>Cart</span>
            {count > 0 ? (
              <Badge className="h-5 min-w-5 rounded-full bg-[var(--moss)] px-1.5 text-[11px] text-white">
                {count}
              </Badge>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}
