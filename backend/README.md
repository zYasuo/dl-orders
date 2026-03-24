# Backend

NestJS monorepo for the dl-orders system: seven apps and a shared library.

## Layout

- **apps/** - Microservices: `orders`, `inventory`, `product`, `notification`, `auth`, `users`, `payment`. Each has its own `main.ts`; most have a Prisma schema (under `apps/<app>/prisma/`) for Postgres; Product uses MongoDB only. Outbound persistence is under `src/infrastructure/outbound/persistence/` with **sql/** (Prisma/Postgres) and **mongodb/** (MongoDB audit logs and Product catalog) subfolders.
- **libs/shared** - Shared code: queue names, event pattern names, event payloads, Zod validation pipe, MongoDB module. Import as `@app/shared`.

## Where to read more

- **Architecture and quick start** - See the [root README](../README.md).
- **Per-service details** - See the README in each app folder:
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

## HTTP response contract

All backend HTTP routes follow the same envelope:

- Success: `{ success: true, timestamp, data }`
- Paginated success: `{ success: true, timestamp, data, meta }`
- Error: `{ success: false, timestamp, statusCode, error, message, details? }`

Examples:

```json
{
  "success": true,
  "timestamp": "2026-03-24T12:00:00.000Z",
  "data": {
    "id": "ord_123"
  }
}
```

```json
{
  "success": true,
  "timestamp": "2026-03-24T12:00:00.000Z",
  "data": [
    {
      "id": "prod_1"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "totalPages": 5
  }
}
```

```json
{
  "success": false,
  "timestamp": "2026-03-24T12:00:00.000Z",
  "statusCode": 404,
  "error": "Not Found",
  "message": "Order not found"
}
```

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
