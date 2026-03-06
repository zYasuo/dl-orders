# Backend

NestJS monorepo for the dl-orders system: four apps and a shared library.

## Layout

- **apps/** — Microservices: `orders`, `inventory`, `product`, `notification`. Each has its own `main.ts`, Prisma schema (under `apps/<app>/prisma/`), and optional Dockerfile.
- **libs/shared** — Shared code: queue names, event pattern names, event payloads, Zod validation pipe. Import as `@app/shared`.
- **scripts/** — Utilities (e.g. `init-dynamodb-tables.js` for creating DynamoDB tables locally).

## Where to read more

- **Architecture and quick start** — See the [root README](../README.md).
- **Per-service details** — See the README in each app folder:
  - [apps/orders](apps/orders/README.md)
  - [apps/inventory](apps/inventory/README.md)
  - [apps/product](apps/product/README.md)
  - [apps/notification](apps/notification/README.md)

## Scripts (from backend)

Run from this directory or via `npm run <script> -w backend` from the repo root.

- **Build:** `npm run build` (all) or `npm run build:orders`, `build:inventory`, etc.
- **Run (dev):** `npm run start:dev:orders`, `start:dev:inventory`, `start:dev:product`, `start:dev:notification`.
- **Prisma:** `prisma:<app>:generate`, `prisma:<app>:push`, `prisma:<app>:migrate`; or `prisma:generate:all`.
- **DynamoDB:** `npm run dynamodb:init` to create audit tables (e.g. when not using LocalStack init).

Full list: [package.json](package.json).
