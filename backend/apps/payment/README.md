# Payment service

Creates payment preferences (Mercado Pago), receives webhooks, and publishes payment results so the orders service can confirm or cancel orders.

## Flow in the system

After **Inventory** reserves stock, **Orders** forwards the `inventory.reserved` event to Payment. This service creates a Payment record and a Mercado Pago preference (or reuses the existing one if the same order was already processed - see **Idempotency** below). When the user pays (or payment fails), the Mercado Pago webhook triggers; Payment publishes `payment.approved` or `payment.failed`. **Orders** then confirms the order (and notifies) or cancels and returns stock.

## Role

- **Events in:** Listens for `inventory.reserved` (forwarded by the orders service after inventory reserves stock). Fetches order details from the orders service (including the order's `idempotencyKey`), creates a Payment record (PENDING) or returns the existing one when the same idempotency key or orderId is used, then creates a Mercado Pago Preference (or skips if one already exists) and stores the checkout URL (`initPoint`).
- **HTTP:** Mercado Pago webhook (`POST /payments/webhook`, assinatura obrigatória e `MERCADOPAGO_WEBHOOK_SECRET` configurado); GET payment by order ID (`GET /payments/order/:orderId`, JWT) for the checkout link. Chamadas HTTP ao orders usam `SERVICE_AUTH_SECRET` no header `x-service-auth`.
- **Events out:** On webhook `approved` -> `payment.approved` (orders confirms); on `rejected`/cancelled -> `payment.failed` (orders cancels and returns stock).

## Ports

- **PaymentRepositoryPort** - Persist and load payments (Postgres/Prisma).
- **PaymentGatewayPort** - Mercado Pago SDK: create preference, get payment details.
- **PaymentEventsPublisherPort** - Publish payment events to RabbitMQ (`payment.approved`, `payment.failed`).
- **PaymentAuditLogPort** - Append payment audit entries (MongoDB).
- **OrderDetailsPort** - Fetch order details (e.g. total price) from the orders service (HTTP `GET /orders/:id`).

## Inbound

- **HTTP:** `POST /payments/webhook` (Mercado Pago; `data.id` + `x-signature` obrigatórios; sem `MERCADOPAGO_WEBHOOK_SECRET` o endpoint responde 503), `GET /payments/order/:orderId` (JWT).
- **Messaging:** `inventory.reserved` (forwarded by the orders service to the payment queue).

## Outbound

- **Persistence:** `persistence/sql/` (payments via Prisma), `persistence/mongodb/` (payment audit log).
- **Gateway:** Mercado Pago (preference creation, payment lookup).
- **Events:** `payment.approved`, `payment.failed` (consumed by orders).
- **HTTP:** Orders service for order details.

## Idempotency

The `inventory.reserved` event can be delivered more than once (e.g. at-least-once messaging or retries). Payment avoids duplicate records by using an **idempotency key** when creating a payment: it gets the key from the order details (orders service); if none is provided, it falls back to `orderId`. If a payment already exists for that key or for that order, the repository returns it and the use case skips creating a new preference. Result: one payment and one Mercado Pago preference per order even when the event is processed multiple times.

## Data

- **Postgres** - Payments (orderId, idempotencyKey, externalId, preferenceId, amount, status, etc.); connection via `DATABASE_URL` in `apps/payment/.env`.
- **MongoDB** - Payment audit log; connection via `MONGODB_URI` in `apps/payment/.env`.

## Credentials (Mercado Pago)

1. **Access token:** [Mercado Pago Developers](https://www.mercadopago.com.br/developers) -> Your app -> Credentials. Use **test** credentials (`TEST-...`) for development.
2. **Webhook secret:** Configure Webhooks with your `POST /payments/webhook` URL; Mercado Pago provides a secret. Set **`MERCADOPAGO_WEBHOOK_SECRET`** in `.env` (required for the webhook to accept traffic).

3. **Orders HTTP:** Set **`SERVICE_AUTH_SECRET`** to the same value as the orders service so `GET /api/v1/orders/:id` succeeds with header `x-service-auth`.

Copy `apps/payment/.env.example` to `apps/payment/.env` and fill in `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `JWT_SECRET`, and `SERVICE_AUTH_SECRET`.

## Run locally

From repo root:

```bash
npm run start:dev:payment
```

Or from `backend/`:

```bash
npm run start:dev:payment
```

Ensure RabbitMQ, Postgres (payment DB on port 5438), and LocalStack (if using DynamoDB) are up. Set `apps/payment/.env` with `DATABASE_URL`, `RABBITMQ_URL`, `QUEUE_NAME`, `ORDERS_SERVICE_URL`, `MERCADOPAGO_ACCESS_TOKEN`, `MERCADOPAGO_WEBHOOK_SECRET`, `JWT_SECRET`, `SERVICE_AUTH_SECRET` (same as orders), and `MONGODB_URI`.

Port: **3007** (HTTP + Swagger).

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
