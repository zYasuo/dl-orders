# Inventory service

Reserves stock when an order is created and tells the orders service whether the reservation succeeded or failed. Also periodically checks for low-stock items and triggers low-stock alerts.

## Role

- **Events in:** Listens for `order.creation_requested` (from orders). Tries to reserve inventory and publishes either `inventory.reserved` or `inventory.reservation_failed`. Additionally runs a low-stock check every 5 minutes and publishes `inventory.low_stock`.
- **HTTP:** Optional endpoints (e.g. create inventory) for setup or admin; main flow is event-driven.

## Ports

- **InventoryRepositoryPort** â€” Persist and load inventory/reservations (Postgres/Prisma).
- **InventoryListCachePort** â€” Cache list of inventory items (Redis); invalidated on create and on reservation.
- **InventoryEventsPublisherPort** â€” Publish inventory events to RabbitMQ (`inventory.reserved`, `inventory.reservation_failed`).
- **InventoryLowStockPublisherPort** â€” Publish `inventory.low_stock` to RabbitMQ (`notification_queue`) so notification can send alert emails.
- **ReservationAuditLogPort** â€” Append reservation audit entries (MongoDB).

## Inbound

- **HTTP:** REST (e.g. create inventory).
- **Messaging:** `order.creation_requested` (from orders service).

## Outbound

- **Persistence:** `persistence/sql/` (inventory via Prisma), `persistence/mongodb/` (reservation audit log), `persistence/redis/` (list cache).
- **Events:** `inventory.reserved`, `inventory.reservation_failed`, `inventory.low_stock`.

## Data

- **Postgres** â€” Inventory and reservations; connection via `DATABASE_URL` in `apps/inventory/.env`.
- **MongoDB** â€” Reservation audit log; connection via `MONGODB_URI` in `apps/inventory/.env`.
- **Redis** â€” Shared instance; `REDIS_URL` in `apps/inventory/.env`. Port 6379 in Docker. Keys use prefix `inventory:` (e.g. list cache).

## Run locally

From repo root:

```bash
npm run start:dev:inventory
```

Or from `backend/`:

```bash
npm run start:dev:inventory
```

Ensure RabbitMQ, Redis, Postgres, and MongoDB are up, and that `apps/inventory/.env` has `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, `REDIS_URL`. Copy from `apps/inventory/.env.example`. Port 3002 if exposing HTTP.

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
