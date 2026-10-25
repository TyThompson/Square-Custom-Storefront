import type { Metadata } from "next";
import { DM_Sans, Syne } from "next/font/google";
import { CartProvider } from "@/lib/cart-context";
import { ModeBanner } from "@/components/mode-banner";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const display = Syne({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Northline Goods — Square-backed storefront",
  description:
    "Custom storefront checkout with Square Web Payments SDK, Orders API, and on-site order tracking. No Square Online site required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} font-[family-name:var(--font-body)]`}>
        <CartProvider>
          <ModeBanner />
          <SiteHeader />
          <main>{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
