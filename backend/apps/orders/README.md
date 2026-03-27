# Orders service

Orchestrates the order lifecycle: create, confirm, or cancel orders and coordinate with inventory via events.

## Role

- **HTTP:** Create order, list paginada, find by ID, audit log, summary — all require **Bearer JWT** (same `JWT_SECRET` as auth) **or** header **`x-service-auth`** matching **`SERVICE_AUTH_SECRET`** (used by the payment service to fetch any order). **End-user JWT:** list/find/audit/summary are scoped to orders whose `recipient` email matches the token (case-insensitive); create order sets `recipient` from the JWT email (body `recipient` is ignored for JWT clients). Reusing another user’s `idempotencyKey` returns **403**. **Service auth:** full access for integration (e.g. payment). On create, the service fetches the product from the product service (`GET /api/v1/products/:id`, public) for name, description, and price; then publishes `order.creation_requested`.
- **Events in:** Listens for `inventory.reserved` (confirm order) and `inventory.reservation_failed` (cancel order). On confirm, publishes `order.confirmed` (including real `totalPrice` and product data) for the notification service.

## Ports

- **OrdersRepositoryPort** - Persist and load orders (Postgres/Prisma). Includes `findPage`, `count`, `findPageByRecipient`, `countByRecipient`, `confirmIfPending` e `cancelIfPending` for atomic status transitions.
- **ProductCatalogPort** - Fetch product by id from the product service (HTTP `GET /api/v1/products/:id`); response is validated against the v1 contract so the orders service does not break when the product service evolves.
- **OrderEventsPublisherPort** - Publish order events to RabbitMQ (`order.creation_requested`, `order.confirmed`).
- **OrderAuditLogPort** - Append audit entries (MongoDB).
- **OrderSummaryPort** - Read/write order summary read model (MongoDB).
- **CachePort** - Cache genérico para listagem paginada versionada e cache por id.

## Inbound

- **HTTP:** REST API (create order, list paginada, find by id, audit log, summary) — JWT or `x-service-auth` (see `backend/SECURITY.md`).
- **Messaging:** `inventory.reserved`, `inventory.reservation_failed` (from inventory service).

## Outbound

- **Persistence:** `persistence/sql/` (orders via Prisma), `persistence/mongodb/` (order audit log, order summary), cache Redis via `CachePort`.
- **Events:** `order.creation_requested` (after create), `order.confirmed` (after confirm).

## Data

- **Postgres** - Orders and related data; connection via `DATABASE_URL` in `apps/orders/.env`.
- **MongoDB** - Audit log and order summaries; connection via `MONGODB_URI` in `apps/orders/.env`.
- **Redis** - Shared cache instance; connection via `REDIS_URL` in `apps/orders/.env`. Chaves: item por id (`orders:{id}`), listas paginadas versionadas por âmbito (`orders:all:...` para serviço interno; `orders:u:{email}:...` para JWT de utilizador) e versão (`orders:all:version`).

## HTTP response contract

All HTTP endpoints in this service return:

- Success: `{ success: true, timestamp, data }`
- Error: `{ success: false, timestamp, statusCode, error, message, details? }`

For paginated responses, `meta` is included at top level:

- Paginated success: `{ success: true, timestamp, data, meta }`

## Run locally

From repo root:

```bash
npm run start:dev:orders
```

Or from `backend/`:

```bash
npm run start:dev:orders
```

Ensure RabbitMQ, Postgres, MongoDB, and Redis are up, and that `apps/orders/.env` has `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, `PRODUCT_SERVICE_URL`, `REDIS_URL`, `JWT_SECRET`, `SERVICE_AUTH_SECRET` (shared with payment), and optionally `PORT` (default 3001). The product service must be reachable when creating orders.
