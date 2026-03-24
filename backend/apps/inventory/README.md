# Inventory service

Reserves stock when an order is created and tells the orders service whether the reservation succeeded or failed. Also periodically checks for low-stock items and triggers low-stock alerts.

## Role

- **Events in:** Listens for `order.creation_requested` (from orders). Tries to reserve inventory and publishes either `inventory.reserved` or `inventory.reservation_failed`. Additionally runs a low-stock check every 5 minutes and publishes `inventory.low_stock`.
- **HTTP:** Create inventory, list, reservation audit — require **Bearer JWT** or **`x-service-auth`** (same pattern as orders; see `backend/SECURITY.md`). Main flow is event-driven.

## Ports

- **InventoryRepositoryPort** - Persist and load inventory/reservations (Postgres/Prisma).
- **InventoryListCachePort** - Cache list of inventory items (Redis); invalidated on create and on reservation.
- **InventoryEventsPublisherPort** - Publish inventory events to RabbitMQ (`inventory.reserved`, `inventory.reservation_failed`).
- **InventoryLowStockPublisherPort** - Publish `inventory.low_stock` to RabbitMQ (`notification_queue`) so notification can send alert emails.
- **ReservationAuditLogPort** - Append reservation audit entries (MongoDB).

## Inbound

- **HTTP:** REST (create, list, reservation audit log) — JWT or `x-service-auth`.
- **Messaging:** `order.creation_requested` (from orders service).

## Outbound

- **Persistence:** `persistence/sql/` (inventory via Prisma), `persistence/mongodb/` (reservation audit log), `persistence/redis/` (list cache).
- **Events:** `inventory.reserved`, `inventory.reservation_failed`, `inventory.low_stock`.

## Data

- **Postgres** - Inventory and reservations; connection via `DATABASE_URL` in `apps/inventory/.env`.
- **MongoDB** - Reservation audit log; connection via `MONGODB_URI` in `apps/inventory/.env`.
- **Redis** - Shared instance; `REDIS_URL` in `apps/inventory/.env`. Port 6379 in Docker. Keys use prefix `inventory:` (e.g. list cache).

## Run locally

From repo root:

```bash
npm run start:dev:inventory
```

Or from `backend/`:

```bash
npm run start:dev:inventory
```

Ensure RabbitMQ, Redis, Postgres, and MongoDB are up, and that `apps/inventory/.env` has `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, `REDIS_URL`, `JWT_SECRET`. Copy from `apps/inventory/.env.example`. Port 3002 if exposing HTTP.

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
