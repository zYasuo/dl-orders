# Product service

Product catalog: create and manage products. HTTP-only; no messaging.

## Role

- **HTTP:** Create and read products. The orders service calls `GET /api/v1/products/:id` when creating an order to fetch name, description, and price so it can store a price snapshot and compute the order total (versioned contract).

## Ports

- **IProductRepositoryPort** — Persist and load products (Postgres/Prisma).

## Inbound

- **HTTP:** REST API (v1) — `POST /api/v1/products` (create product), `GET /api/v1/products/:id` (get product by id). Global prefix `api/v1` keeps the contract stable for consumers (e.g. orders service).

## Outbound

- **Persistence:** `persistence/sql/` (products via Prisma) only; no events, no DynamoDB.

## Data

- **Postgres** — Products; connection via `DATABASE_URL` in `apps/product/.env`.

## Run locally

From repo root:

```bash
npm run start:dev:product
```

Or from `backend/`:

```bash
npm run start:dev:product
```

Ensure Postgres is up and `apps/product/.env` has `DATABASE_URL`. Port 3003 if exposing HTTP.
