# Notification service

Sends notifications (e.g. email) when an order is confirmed or when the inventory is running low. Listens for `order.confirmed` and `inventory.low_stock` and exposes HTTP to list user notifications.

## Role

- **Events in:** Listens for `order.confirmed` (from orders), `reset_password.link_requested` and `auth.password_changed` (from auth), `account.locked_notify`, `otp.send_requested`, and `inventory.low_stock`. Runs the corresponding notification use case (e.g. send email via Resend) and records the outcome in an audit log and in the user-notifications read model. For low-stock alerts, it uses the `inventory-low-stock` email template and expects an `IInventoryLowStockEvent` payload (`id`, `name`, `productId`, `quantity`, `createdBy` as the email snapshot).
- **HTTP:** `GET /users/me/notifications` (JWT) to list notifications for the authenticated user; optional query `limit` (1–100).

## Ports

- **NotificationRepositoryPort** - Persist notification records (Postgres/Prisma).
- **EmailSenderPort** - Send email (e.g. Resend adapter).
- **NotificationAuditLogPort** - Append notification audit entries (MongoDB).
- **UserNotificationsPort** - Read/write user notifications list (MongoDB).

## Inbound

- **HTTP:** `GET /users/me/notifications` (Bearer JWT; optional query `limit`).
- **Messaging:** `order.confirmed`, `reset_password.link_requested`, `auth.password_changed`, `account.locked_notify`, `otp.send_requested`, `inventory.low_stock` (consumed from `notification_queue`).

## Outbound

- **Persistence:** `persistence/sql/` (notifications via Prisma), `persistence/mongodb/` (notification audit log, user notifications).
- **Email:** Outbound email via Resend (or similar) using `EmailSenderPort`.

## Data

- **Postgres** - Notifications; connection via `DATABASE_URL` in `apps/notification/.env`.
- **MongoDB** - Notification audit log and user notifications; connection via `MONGODB_URI` in `apps/notification/.env`.

## HTTP response contract

All HTTP endpoints in this service return:

- Success: `{ success: true, timestamp, data }`
- Error: `{ success: false, timestamp, statusCode, error, message, details? }`

For paginated responses, `meta` is included at top level:

- Paginated success: `{ success: true, timestamp, data, meta }`

## Run locally

From repo root:

```bash
npm run start:dev:notification
```

Or from `backend/`:

```bash
npm run start:dev:notification
```

Ensure RabbitMQ, Postgres, and MongoDB are up. Set `apps/notification/.env` with `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, `JWT_SECRET` (same as auth for JWT validation), and any email provider keys (e.g. Resend).

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
