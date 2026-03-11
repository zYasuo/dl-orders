# Orders service

Orchestrates the order lifecycle: create, confirm, or cancel orders and coordinate with inventory via events.

## Role

- **HTTP:** Create order, find by ID. On create, the service fetches the product from the product service (by `productId`) to get name, description, and price; it then stores `productName`, `productDescription`, `unitPrice`, and `totalPrice` (quantity × unit price) on the order and publishes `order.creation_requested` so inventory can reserve stock.
- **Events in:** Listens for `inventory.reserved` (confirm order) and `inventory.reservation_failed` (cancel order). On confirm, publishes `order.confirmed` (including real `totalPrice` and product data) for the notification service.

## Ports

- **IOrdersRepositoryPort** — Persist and load orders (Postgres/Prisma).
- **IProductCatalogPort** — Fetch product by id from the product service (HTTP `GET /api/v1/products/:id`); response is validated against the v1 contract so the orders service does not break when the product service evolves.
- **IOrderEventsPublisherPort** — Publish order events to RabbitMQ (`order.creation_requested`, `order.confirmed`).
- **IOrderAuditLogPort** — Append audit entries (MongoDB).
- **IOrderSummaryPort** — Read/write order summary read model (MongoDB).

## Inbound

- **HTTP:** REST API (e.g. create order, find by id).
- **Messaging:** `inventory.reserved`, `inventory.reservation_failed` (from inventory service).

## Outbound

- **Persistence:** `persistence/sql/` (orders via Prisma), `persistence/mongodb/` (order audit log, order summary).
- **Events:** `order.creation_requested` (after create), `order.confirmed` (after confirm).

## Data

- **Postgres** — Orders and related data; connection via `DATABASE_URL` in `apps/orders/.env`.
- **MongoDB** — Audit log and order summaries; connection via `MONGODB_URI` in `apps/orders/.env`.

## Run locally

From repo root:

```bash
npm run start:dev:orders
```

Or from `backend/`:

```bash
npm run start:dev:orders
```

Ensure RabbitMQ, Postgres, and MongoDB are up, and that `apps/orders/.env` has `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, `PRODUCT_SERVICE_URL` (e.g. `http://localhost:3003`), and optionally `PORT` (default 3001). The product service must be reachable when creating orders.
