# Northline Goods — Square-backed custom storefront

Yes: Square can power payments and orders while **your website** is the only customer-facing frontend. Customers never need a Square Online site.

This demo app shows that pattern end-to-end:

1. Browse a catalog on **your** store
2. Cart + checkout on **your** pages
3. Card entry via [Square Web Payments SDK](https://developer.squareup.com/docs/web-payments/overview) (embedded, not hosted checkout)
4. Your backend creates the Square **Order** + **Payment**
5. Order status / tracking stays on **your** `/orders/[id]` and `/track` pages

## Architecture

| Layer | Role |
| --- | --- |
| Next.js storefront | Catalog, cart, checkout UI, tracking |
| Web Payments SDK | Tokenizes card / wallets in the browser |
| Square Node SDK | `Orders.create` + `Payments.create` on the server |
| Local order store | Demo tracking timeline (swap for DB + Square webhooks in production) |

Official SDK overview: [developer.squareup.com/docs/sdks](https://developer.squareup.com/docs/sdks)

## Run locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Demo mode (default)

If Square env vars are missing, checkout uses a mock payment nonce and still creates a trackable order. Status advances automatically (Received → Preparing → Ready) so you can see tracking without credentials.

### Live Square sandbox

Copy `.env.example` to `.env.local` and fill:

```bash
SQUARE_ACCESS_TOKEN=...
SQUARE_LOCATION_ID=...
NEXT_PUBLIC_SQUARE_APPLICATION_ID=...
SQUARE_ENVIRONMENT=sandbox
```

Then restart the dev server. The payment form loads Square’s sandbox Web Payments SDK; paid orders appear in the Square Seller Dashboard for that location.

## Scripts

- `npm run dev` — development server on port **43123**
- `npm run build` / `npm start` — production build
- `npm run lint` — ESLint

## What Square Online does *not* give you (and this pattern replaces)

- Hosted Square Online checkout / branded Square pages
- Built-in Square Online buyer tracking pages

You still get payments, itemized orders, Dashboard/POS visibility (when using Orders API), and kitchen/fulfillment hooks — while owning the full customer journey on your domain.
