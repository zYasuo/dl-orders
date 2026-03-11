# Payment service

Creates payment preferences (Mercado Pago), receives webhooks, and publishes payment results so the orders service can confirm or cancel orders.

## Flow in the system

After **Inventory** reserves stock, **Orders** forwards the `inventory.reserved` event to Payment. This service creates a Mercado Pago preference and stores the checkout URL. When the user pays (or payment fails), the Mercado Pago webhook triggers; Payment publishes `payment.approved` or `payment.failed`. **Orders** then confirms the order (and notifies) or cancels and returns stock.

## Role

- **Events in:** Listens for `inventory.reserved` (forwarded by the orders service after inventory reserves stock). Fetches order details from the orders service, creates a Payment record (PENDING), creates a Mercado Pago Preference with `external_reference = orderId`, and stores the checkout URL (`initPoint`).
- **HTTP:** Webhook endpoint for Mercado Pago notifications (`POST /payments/webhook`); GET payment by order ID (`GET /payments/order/:orderId`, JWT required) to obtain the checkout link.
- **Events out:** On webhook `approved` → `payment.approved` (orders confirms); on `rejected`/cancelled → `payment.failed` (orders cancels and returns stock).

## Ports

- **IPaymentRepositoryPort** — Persist and load payments (Postgres/Prisma).
- **IPaymentGatewayPort** — Mercado Pago SDK: create preference, get payment details.
- **IPaymentEventsPublisherPort** — Publish payment events to RabbitMQ (`payment.approved`, `payment.failed`).
- **IPaymentAuditLogPort** — Append payment audit entries (MongoDB).
- **IOrderDetailsPort** — Fetch order details (e.g. total price) from the orders service (HTTP `GET /orders/:id`).

## Inbound

- **HTTP:** `POST /payments/webhook` (Mercado Pago; validate `x-signature` when `MERCADOPAGO_WEBHOOK_SECRET` is set), `GET /payments/order/:orderId` (JWT required).
- **Messaging:** `inventory.reserved` (forwarded by the orders service to the payment queue).

## Outbound

- **Persistence:** `persistence/sql/` (payments via Prisma), `persistence/mongodb/` (payment audit log).
- **Gateway:** Mercado Pago (preference creation, payment lookup).
- **Events:** `payment.approved`, `payment.failed` (consumed by orders).
- **HTTP:** Orders service for order details.

## Data

- **Postgres** — Payments (orderId, externalId, preferenceId, amount, status, etc.); connection via `DATABASE_URL` in `apps/payment/.env`.
- **MongoDB** — Payment audit log; connection via `MONGODB_URI` in `apps/payment/.env`.

## Credentials (Mercado Pago)

1. **Access token:** [Mercado Pago Developers](https://www.mercadopago.com.br/developers) → Your app → Credentials. Use **test** credentials (`TEST-...`) for development.
2. **Webhook secret:** In the same app, configure Webhooks with your `POST /payments/webhook` URL; Mercado Pago will show a secret. Set `MERCADOPAGO_WEBHOOK_SECRET` in `.env`. If unset, signature validation is skipped (dev only).

Copy `apps/payment/.env.example` to `apps/payment/.env` and fill in `MERCADOPAGO_ACCESS_TOKEN` (and `MERCADOPAGO_WEBHOOK_SECRET` for production).

## Run locally

From repo root:

```bash
npm run start:dev:payment
```

Or from `backend/`:

```bash
npm run start:dev:payment
```

Ensure RabbitMQ, Postgres (payment DB on port 5438), and LocalStack (if using DynamoDB) are up. Set `apps/payment/.env` with at least `DATABASE_URL`, `RABBITMQ_URL`, `QUEUE_NAME`, `ORDERS_SERVICE_URL` (e.g. `http://localhost:3001`), and `MERCADOPAGO_ACCESS_TOKEN`. Optional: `JWT_SECRET` for `GET /payments/order/:orderId`, `MERCADOPAGO_WEBHOOK_SECRET` for webhook signature validation.

Port: **3007** (HTTP + Swagger).
