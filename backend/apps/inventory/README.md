# Inventory service

Reserves stock when an order is created and tells the orders service whether the reservation succeeded or failed.

## Role

- **Events in:** Listens for `order.creation_requested` (from orders). Tries to reserve inventory and publishes either `inventory.reserved` or `inventory.reservation_failed`.
- **HTTP:** Optional endpoints (e.g. create inventory) for setup or admin; main flow is event-driven.

## Ports

- **IInventoryRepositoryPort** — Persist and load inventory/reservations (Postgres/Prisma).
- **IInventoryEventsPublisherPort** — Publish inventory events to RabbitMQ (`inventory.reserved`, `inventory.reservation_failed`).
- **IReservationAuditLogPort** — Append reservation audit entries (DynamoDB).

## Inbound

- **HTTP:** REST (e.g. create inventory).
- **Messaging:** `order.creation_requested` (from orders service).

## Outbound

- **Persistence:** `persistence/sql/` (inventory via Prisma), `persistence/dynamodb/` (reservation audit log).
- **Events:** `inventory.reserved`, `inventory.reservation_failed`.

## Data

- **Postgres** — Inventory and reservations; connection via `DATABASE_URL` in `apps/inventory/.env`.
- **DynamoDB** — Reservation audit log table (e.g. ReservationAuditLog); LocalStack in dev.

## Run locally

From repo root:

```bash
npm run start:dev:inventory
```

Or from `backend/`:

```bash
npm run start:dev:inventory
```

Ensure RabbitMQ, Postgres, and LocalStack (if using DynamoDB) are up, and that `apps/inventory/.env` has `DATABASE_URL`, `RABBITMQ_URL`, and `QUEUE_NAME`. Port 3002 if exposing HTTP.
