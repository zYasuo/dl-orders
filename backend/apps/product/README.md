# Product service

Product catalog: create and manage products. HTTP-only; no messaging.

## Role

- **HTTP:** Create and read products. The orders service calls `GET /api/v1/products/:id` when creating an order to fetch name, description, and price so it can store a price snapshot and compute the order total (versioned contract).

## Ports

- **ProductRepositoryPort** — Persist and load products (MongoDB).
- **ProductCachePort** — Cache product by ID (Redis); invalidated on create.

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

## Seed (populate DB from JSON)

To populate the `products` collection from a JSON file (e.g. CSV exported as an array of objects):

1. Place the JSON file in **`apps/product/scripts/seed-data/`** and name it `csvjson.json`, or keep it anywhere and pass the path.
2. From the `backend/` folder, run:

If the file is at `apps/product/scripts/seed-data/csvjson.json`, just run:

```bash
npm run seed:product
```

Otherwise pass the path:

```bash
npm run seed:product -- "C:\path\to\your.json"
```

Or set `SEED_JSON_PATH` (PowerShell: `$env:SEED_JSON_PATH="C:\path\to\your.json"; npm run seed:product`).

The script maps: `title` → `name`, `description` → `description`, `final_price` (or `initial_price`) → `price`. Optional: `SEED_BATCH_SIZE` (default 500), `SEED_LIMIT` (e.g. 1000 to import only the first 1000 items).
