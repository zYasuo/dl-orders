# Orders service

Orchestrates the order lifecycle: create, confirm, or cancel orders and coordinate with inventory via events.

## Role

- **HTTP:** Create order, find by ID. After creating an order, publishes `order.creation_requested` so inventory can reserve stock.
- **Events in:** Listens for `inventory.reserved` (confirm order) and `inventory.reservation_failed` (cancel order). On confirm, publishes `order.confirmed` for the notification service.

## Ports

- **IOrdersRepositoryPort** — Persist and load orders (Postgres/Prisma).
- **IOrderEventsPublisherPort** — Publish order events to RabbitMQ (`order.creation_requested`, `order.confirmed`).
- **IOrderAuditLogPort** — Append audit entries (DynamoDB).

## Inbound

- **HTTP:** REST API (e.g. create order, find by id).
- **Messaging:** `inventory.reserved`, `inventory.reservation_failed` (from inventory service).

## Outbound

- **Persistence:** Postgres via Prisma (orders), DynamoDB (audit log).
- **Events:** `order.creation_requested` (after create), `order.confirmed` (after confirm).

## Data

- **Postgres** — Orders and related data; connection via `DATABASE_URL` in `apps/orders/.env`.
- **DynamoDB** — Audit log table (e.g. OrderAuditLog); LocalStack in dev, config via AWS env vars.

## Run locally

From repo root:

```bash
npm run start:dev:orders
```

Or from `backend/`:

```bash
npm run start:dev:orders
```

Ensure RabbitMQ, Postgres, and LocalStack (if using DynamoDB) are up, and that `apps/orders/.env` has `DATABASE_URL`, `RABBITMQ_URL`, `QUEUE_NAME`, and optionally `PORT` (default 3001).
