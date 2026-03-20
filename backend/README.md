# Backend

NestJS monorepo for the dl-orders system: seven apps and a shared library.

## Layout

- **apps/** â€” Microservices: `orders`, `inventory`, `product`, `notification`, `auth`, `users`, `payment`. Each has its own `main.ts`; most have a Prisma schema (under `apps/<app>/prisma/`) for Postgres; Product uses MongoDB only. Outbound persistence is under `src/infrastructure/outbound/persistence/` with **sql/** (Prisma/Postgres) and **mongodb/** (MongoDB audit logs and Product catalog) subfolders.
- **libs/shared** â€” Shared code: queue names, event pattern names, event payloads, Zod validation pipe, MongoDB module. Import as `@app/shared`.

## Where to read more

- **Architecture and quick start** â€” See the [root README](../README.md).
- **Per-service details** â€” See the README in each app folder:
  - [apps/orders](apps/orders/README.md)
  - [apps/inventory](apps/inventory/README.md)
  - [apps/product](apps/product/README.md)
  - [apps/notification](apps/notification/README.md)
  - [apps/auth](apps/auth/README.md)
  - [apps/users](apps/users/README.md)
  - [apps/payment](apps/payment/README.md)

## Scripts (from backend)

Run from this directory or via `npm run <script> -w backend` from the repo root.

- **Build:** `npm run build` (all) or `npm run build:orders`, `build:inventory`, etc.
- **Run (dev):** `npm run start:dev:orders`, `start:dev:inventory`, `start:dev:product`, `start:dev:notification`, `start:dev:auth`, `start:dev:users`, `start:dev:payment`.
- **Prisma:** `prisma:<app>:generate`, `prisma:<app>:push`, `prisma:<app>:migrate`; or `prisma:generate:all` (Product does not use Prisma).

Full list: [package.json](package.json).

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
