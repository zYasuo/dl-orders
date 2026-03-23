# Frontend

Next.js web app for the dl-orders monorepo: public catalog, authentication, checkout, orders, and payment flows. The browser talks to backend microservices only through **BFF** Route Handlers under `app/api/*`, using an **httpOnly** cookie for the JWT.

## Role

- **BFF:** Server-side proxies to Auth, Users, Product, Orders, and Payment; keeps tokens out of `localStorage` and aligns with the shared HTTP error shape from the backend.
- **UX:** Catalog and authenticated areas (account, checkout, payment return) using TanStack Query, React Hook Form, and Zod.

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

Copy [`.env.local.example`](.env.local.example) to `.env.local` and set service base URLs. Defaults match the backend dev ports:

| Variable | Typical value |
|----------|----------------|
| `PRODUCT_SERVICE_URL` | `http://localhost:3003` |
| `ORDERS_SERVICE_URL` | `http://localhost:3001` |
| `AUTH_SERVICE_URL` | `http://localhost:3005` |
| `USERS_SERVICE_URL` | `http://localhost:3006` |
| `PAYMENT_SERVICE_URL` | `http://localhost:3007` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` |

See `.env.local.example` for the exact names.

## Project layout

- **`app/`** — Routes, layouts, and Route Handlers (BFF).
- **`modules/`** — Feature-oriented code (auth, products, orders, payments, account).
- **`components/ui/`** — Shared UI primitives.
- **`lib/`**, **`services/`**, **`types/`**, **`hooks/`** — Shared utilities and client integration.

## Where to read more

- **Monorepo architecture and quick start** — [Root README](../README.md).
