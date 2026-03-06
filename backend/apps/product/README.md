# Product service

Product catalog: create and manage products. HTTP-only; no messaging.

## Role

- **HTTP:** Create products (and any other CRUD the API exposes). Used by the rest of the system or by clients that need product data; orders reference products by id.

## Ports

- **IProductRepositoryPort** — Persist and load products (Postgres/Prisma).

## Inbound

- **HTTP:** REST API (e.g. `POST /products` to create a product).

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
