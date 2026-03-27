# Frontend

Next.js web app for the dl-orders monorepo: public catalog, authentication, checkout, orders, and payment flows. The browser talks to backend microservices only through **BFF** Route Handlers under `app/api/*`, using an **httpOnly** cookie for the JWT.

## Role

- **BFF:** Server-side proxies to Auth, Users, Product, Orders, Payment, Inventory, and Notification (reminders); keeps tokens out of `localStorage` and aligns with the shared HTTP error shape from the backend.
- **UX:** Catalog, browser cart (`localStorage`, TTL ~20 min), per-item checkout (one order per product on the API), authenticated areas and payment return using TanStack Query, React Hook Form, and Zod.

## Stack

- **Next.js** (App Router), **Tailwind CSS** v4, **TanStack Query**, **React Hook Form**, **Zod**.

## Run locally

From the repo root:

```bash
npm run dev:frontend
```

Or from this directory:

```bash
npm run dev
```

Default URL: **http://localhost:3000** (see `package.json` `dev` script).

## Environment

Use **`.env`** (do not commit — it is in the monorepo `.gitignore`). **`.env.example`** is only a template and **is not** read at runtime. Copy and adjust:

```bash
cp .env.example .env
```

Restart `npm run dev` after changing variables. Without `INVENTORY_SERVICE_URL` and `SERVICE_AUTH_SECRET`, the BFF `POST /api/inventory/stock` returns 500. For abandoned-cart reminders (optional), also set `NOTIFICATION_SERVICE_URL` and the same `SERVICE_AUTH_SECRET` as on the Notification service.

Typical values (local ports):

| Variable | Typical value |
|----------|----------------|
| `PRODUCT_SERVICE_URL` | `http://localhost:3003` |
| `ORDERS_SERVICE_URL` | `http://localhost:3001` |
| `AUTH_SERVICE_URL` | `http://localhost:3005` |
| `USERS_SERVICE_URL` | `http://localhost:3006` |
| `PAYMENT_SERVICE_URL` | `http://localhost:3007` |
| `INVENTORY_SERVICE_URL` | `http://localhost:3002` |
| `NOTIFICATION_SERVICE_URL` | `http://localhost:3004` (BFF forwards cart-reminder scheduling). |
| `SERVICE_AUTH_SECRET` | Same secret used with `x-service-auth` on Inventory, Orders, and Notification. |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

### BFF stock (catalog)

- **`POST /api/inventory/stock`** — body `{ "productIds": string[] }` (max 50). Response `{ success, timestamp, data }` where `data` is a map `productId → { quantity, inStock, lastUnits }`. The handler calls **`POST /api/v1/inventories/lookup`** on Inventory with `x-service-auth`. Upstream errors return the same status and error JSON as the backend.

### BFF abandoned cart

- **`PUT /api/cart/abandonment`** — JSON body `{ sessionKey, email, resumeUrl, pendingUntil` (ISO datetime), `summaryLines }`. Forwards to **`PUT /api/v1/internal/cart-abandonment`** on Notification with `x-service-auth`. The client should only call this after explicit user consent.
- **`DELETE /api/cart/abandonment?sessionKey=`** — cancels scheduling on Notification (e.g. empty cart, checkout completed, or expiry).

## Cart (MVP)

- Items and TTL (~20 min, renewed on each change) live in **`localStorage`** (`lib/cart-storage.ts`). Checkout stays **one product per order**; in the cart, each line links to **Checkout** with `productId` and `quantity` in the query string.
- Email reminder (~15 min after last consented update) is **scheduled on the server** (Notification + cron); do not rely only on `setTimeout` in the browser.

## Suggested manual smoke (PR)

1. PDP: change quantity, **Buy** opens checkout with correct quantity; **Add to cart** updates the header badge.
2. **`/cart`**: refresh stock, adjust quantities, **Checkout** on one line; after the order is created, that item leaves the cart.
3. Expired cart: clear message and CTA back to the catalog.
4. Consent off: no need to call `PUT /api/cart/abandonment`; with consent and email, verify scheduling (Notification + `RESEND_API_KEY` for a real email).
5. **`npm run test`** in **`frontend/`** — unit tests for cart storage.

## Project layout

- **`app/`** — Routes, layouts, and Route Handlers (BFF).
- **`modules/`** — Feature-oriented code (auth, products, cart, orders, payments, account).
- **`components/ui/`** — Shared UI primitives.
- **`lib/`**, **`services/`**, **`types/`**, **`hooks/`** — Shared utilities and client integration.

## Where to read more

- **Monorepo architecture and quick start** — [Root README](../README.md).
