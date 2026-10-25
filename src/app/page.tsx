import Link from "next/link";
import { ProductGrid } from "@/components/product-grid";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div>
      <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden">
        <div className="absolute inset-0 animate-pan bg-[radial-gradient(circle_at_20%_20%,rgba(61,90,69,0.28),transparent_42%),radial-gradient(circle_at_80%_30%,rgba(196,165,116,0.22),transparent_40%),linear-gradient(135deg,#1a1f1c_0%,#2f4636_48%,#1a1f1c_100%)]" />
        <div className="absolute inset-0 bg-[url('/hero-grain.svg')] opacity-40 mix-blend-soft-light" />
        <div className="relative mx-auto flex min-h-[calc(100vh-7rem)] max-w-6xl flex-col justify-end px-4 pb-16 pt-24 sm:px-6 sm:pb-20">
          <p className="animate-rise text-xs uppercase tracking-[0.28em] text-white/70">
            Your storefront · Square behind the scenes
          </p>
          <h1 className="animate-rise mt-4 max-w-3xl font-[family-name:var(--font-display)] text-5xl leading-[0.95] text-white sm:text-7xl">
            Northline
          </h1>
          <p className="animate-rise mt-5 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            Browse, pay, and track every order on this site. Square handles
            tokenization and payments — customers never visit a Square Online page.
          </p>
          <div className="animate-rise mt-8 flex flex-wrap gap-3">
            <Button
              asChild
              className="h-11 bg-white px-5 text-[var(--ink)] hover:bg-[var(--wash)]"
            >
              <Link href="#menu">Shop the shelf</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="h-11 border-white/30 bg-transparent px-5 text-white hover:bg-white/10 hover:text-white"
            >
              <Link href="/track">Track an order</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="menu" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--muted)]">
            Menu
          </p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--ink)]">
            Order here. Track here.
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            This demo mirrors the recommended Square pattern: Web Payments SDK on
            your frontend, Orders + Payments APIs on your backend, status on your
            own tracking page.
          </p>
        </div>
        <ProductGrid />
      </section>

      <section className="border-t border-[var(--line)] bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:grid-cols-3 sm:px-6">
          {[
            {
              title: "Your UI",
              body: "Catalog, cart, and checkout stay on Northline. No redirect to Square Online.",
            },
            {
              title: "Square SDKs",
              body: "Web Payments SDK tokenizes cards in-browser. Server SDK creates the order and payment.",
            },
            {
              title: "Easier tracking",
              body: "Orders live in your app (and Square Dashboard). Customers check status on /track.",
            },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
