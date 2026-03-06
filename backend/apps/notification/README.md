# Notification service

Sends notifications (e.g. email) when an order is confirmed. Message-driven only; no HTTP API.

## Role

- **Events in:** Listens for `order.confirmed` (from orders). Runs the notification use case (e.g. send email via Resend) and records the outcome in an audit log.

## Ports

- **INotificationRepositoryPort** — Persist notification records (Postgres/Prisma).
- **IEmailSenderPort** — Send email (e.g. Resend adapter).
- **INotificationAuditLogPort** — Append notification audit entries (DynamoDB).

## Inbound

- **Messaging:** `order.confirmed` only; no HTTP controllers.

## Outbound

- **Persistence:** Postgres (notifications), DynamoDB (notification audit log).
- **Email:** Outbound email via Resend (or similar) using `IEmailSenderPort`.

## Data

- **Postgres** — Notifications; connection via `DATABASE_URL` in `apps/notification/.env`.
- **DynamoDB** — Notification audit log table (e.g. NotificationAuditLog); LocalStack in dev.

## Run locally

From repo root:

```bash
npm run start:dev:notification
```

Or from `backend/`:

```bash
npm run start:dev:notification
```

Ensure RabbitMQ, Postgres, and LocalStack (if using DynamoDB) are up. Set `apps/notification/.env` with `DATABASE_URL`, `RABBITMQ_URL`, `QUEUE_NAME`, and any email provider keys (e.g. Resend).
