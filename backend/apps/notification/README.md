# Notification service

Sends notifications (e.g. email) when an order is confirmed. Listens for `order.confirmed` and exposes HTTP to list user notifications.

## Role

- **Events in:** Listens for `order.confirmed` (from orders), `reset_password.link_requested` and `auth.password_changed` (from auth), `account.locked_notify`, `otp.send_requested`. Runs the corresponding notification use case (e.g. send email via Resend) and records the outcome in an audit log and in the user-notifications read model.
- **HTTP:** `GET /users/:userId/notifications` to list notifications for a user (e.g. by email until auth exists).

## Ports

- **INotificationRepositoryPort** — Persist notification records (Postgres/Prisma).
- **IEmailSenderPort** — Send email (e.g. Resend adapter).
- **INotificationAuditLogPort** — Append notification audit entries (MongoDB).
- **IUserNotificationsPort** — Read/write user notifications list (MongoDB).

## Inbound

- **HTTP:** `GET /users/:userId/notifications` (optional query `limit`, `cursor`).
- **Messaging:** `order.confirmed`, `reset_password.link_requested`, `auth.password_changed`, `account.locked_notify`, `otp.send_requested`.

## Outbound

- **Persistence:** `persistence/sql/` (notifications via Prisma), `persistence/mongodb/` (notification audit log, user notifications).
- **Email:** Outbound email via Resend (or similar) using `IEmailSenderPort`.

## Data

- **Postgres** — Notifications; connection via `DATABASE_URL` in `apps/notification/.env`.
- **MongoDB** — Notification audit log and user notifications; connection via `MONGODB_URI` in `apps/notification/.env`.

## Run locally

From repo root:

```bash
npm run start:dev:notification
```

Or from `backend/`:

```bash
npm run start:dev:notification
```

Ensure RabbitMQ, Postgres, and MongoDB are up. Set `apps/notification/.env` with `DATABASE_URL`, `MONGODB_URI`, `RABBITMQ_URL`, `QUEUE_NAME`, and any email provider keys (e.g. Resend).
