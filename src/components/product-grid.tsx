"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { formatMoney, type CatalogItem } from "@/lib/catalog";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
  const { addItem } = useCart();
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [source, setSource] = useState<"mock" | "square">("mock");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/catalog")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load catalog");
        return res.json() as Promise<{ items: CatalogItem[]; source: "mock" | "square" }>;
      })
      .then((data) => {
        setItems(data.items);
        setSource(data.source);
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleAdd(item: CatalogItem) {
    addItem(item);
    setAddedId(item.id);
    window.setTimeout(() => setAddedId((id) => (id === item.id ? null : id)), 1200);
  }

  if (loading) {
    return (
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-72 animate-pulse rounded-2xl bg-[var(--wash)]"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
        {error}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-[var(--muted)]">
        Catalog source:{" "}
        <span className="font-medium text-[var(--ink)]">
          {source === "square" ? "Square Catalog API" : "Demo catalog"}
        </span>
      </p>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, index) => (
          <article
            key={item.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--line)] bg-white/80 shadow-[0_1px_0_rgba(26,31,28,0.04)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-28px_rgba(26,31,28,0.45)]"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div
              className="relative aspect-[4/3] overflow-hidden"
              style={{
                background: `linear-gradient(145deg, ${item.accent}33, #f3f1eb 70%)`,
              }}
            >
              <Image
                src={item.image}
                alt={item.name}
                fill
                unoptimized
                className="object-contain p-8 transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                    {item.category}
                  </p>
                  <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                    {item.name}
                  </h3>
                </div>
                <p className="shrink-0 text-sm font-medium tabular-nums text-[var(--ink)]">
                  {formatMoney(item.priceCents)}
                </p>
              </div>
              <p className="flex-1 text-sm leading-relaxed text-[var(--muted)]">
                {item.description}
              </p>
              <Button
                onClick={() => handleAdd(item)}
                className="mt-2 h-10 bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--moss)]"
              >
                {addedId === item.id ? "Added" : "Add to cart"}
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
