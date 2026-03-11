# Product service

Product catalog: create and manage products. HTTP-only; no messaging.

## Role

- **HTTP:** Create and read products. The orders service calls `GET /api/v1/products/:id` when creating an order to fetch name, description, and price so it can store a price snapshot and compute the order total (versioned contract).

## Ports

- **IProductRepositoryPort** — Persist and load products (MongoDB).
- **IProductCachePort** — Cache product by ID (Redis); invalidated on create.

## Inbound

- **HTTP:** REST API (v1) — `POST /api/v1/products` (create product), `GET /api/v1/products/:id` (get product by id). Global prefix `api/v1` keeps the contract stable for consumers (e.g. orders service).

## Outbound

- **Persistence:** `persistence/mongodb/` (products), `persistence/redis/` (product cache); no events.

## Data

- **MongoDB** — Product catalog; connection via `MONGODB_URI` in `apps/product/.env`.
- **Redis** — Shared instance; `REDIS_URL` in `apps/product/.env`. Port 6379 in Docker. Keys use prefix `product:` (e.g. item by id).

## Run locally

From repo root:

```bash
npm run start:dev:product
```

Or from `backend/`:

```bash
npm run start:dev:product
```

Ensure Redis and MongoDB are up and `apps/product/.env` has `MONGODB_URI`, `REDIS_URL`. Copy from `apps/product/.env.example`. Port 3003 if exposing HTTP.
