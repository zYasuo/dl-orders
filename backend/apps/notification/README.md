# Notification service

Sends notifications (e.g. email) when an order is confirmed. Listens for `order.confirmed` and exposes HTTP to list user notifications.

## Role

- **Events in:** Listens for `order.confirmed` (from orders). Runs the notification use case (e.g. send email via Resend) and records the outcome in an audit log and in the user-notifications read model.
- **HTTP:** `GET /users/:userId/notifications` to list notifications for a user (e.g. by email until auth exists).

## Ports

- **INotificationRepositoryPort** — Persist notification records (Postgres/Prisma).
- **IEmailSenderPort** — Send email (e.g. Resend adapter).
- **INotificationAuditLogPort** — Append notification audit entries (DynamoDB).
- **IUserNotificationsPort** — Read/write user notifications list (DynamoDB).

## Inbound

- **HTTP:** `GET /users/:userId/notifications` (optional query `limit`, `cursor`).
- **Messaging:** `order.confirmed`.

## Outbound

- **Persistence:** `persistence/sql/` (notifications via Prisma), `persistence/dynamodb/` (notification audit log, user notifications).
- **Email:** Outbound email via Resend (or similar) using `IEmailSenderPort`.

## Data

- **Postgres** — Notifications; connection via `DATABASE_URL` in `apps/notification/.env`.
- **DynamoDB** — Notification audit log (NotificationAuditLog), user notifications (UserNotifications); LocalStack in dev.

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
