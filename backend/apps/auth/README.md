# Auth service

Handles user signup (with email OTP verification), sign-in, and JWT issuance. Tracks failed login attempts and temporarily locks the account after 3 failures (5 minutes); publishes `account.locked_notify` so notification sends the lockout email. Uses its own Postgres and publishes `user.verified` when email is confirmed.

## Role

- **HTTP:** `POST /auth/signup` (email, password, name) — creates user, publishes `otp.send_requested` (notification service sends OTP email).
- **HTTP:** `POST /auth/verify-otp` (email, code) — validates OTP, marks email verified, publishes `user.verified`, returns JWT.
- **HTTP:** `POST /auth/signin` (email, password) — validates credentials and email verified; returns JWT. If the account is locked (after 3 failed attempts), returns `403` with a message to try again after X minutes. IP is captured from the request for audit.

JWT payload: `{ sub: userId, email }`; other services validate it with the same `JWT_SECRET`.

## Ports

- **IAuthUserRepositoryPort** — Create/find user, mark email verified (Postgres/Prisma).
- **IAuthLogsRepositoryPort** — Find/upsert auth log per user (login attempts, lockout until).
- **IOtpRepositoryPort** — Create/find OTP, mark used.
- **IOtpSendRequestedPublisherPort** — Publish `otp.send_requested` (RabbitMQ → notification service sends OTP email).
- **IAccountLockedNotifyPublisherPort** — Publish `account.locked_notify` when account is locked (RabbitMQ → notification service sends lockout email).
- **IPasswordHasherPort** — Hash/compare password (Argon2).
- **IJwtPort** — Sign/verify JWT.
- **IUserVerifiedPublisherPort** — Publish `user.verified` (RabbitMQ).

## Inbound

- **HTTP:** `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/signin` (Zod-validated bodies).

## Outbound

- **Persistence:** `persistence/sql/` (users, otp_codes, auth_logs via Prisma). User relations use `onDelete: Cascade` for otp_codes and auth_logs.
- **Security:** Argon2 password hasher, JWT sign/verify.
- **Messaging:** `otp.send_requested` and `account.locked_notify` to notification queue; `user.verified` to users queue.

## Data

- **Postgres** — Users, OTP codes, auth_logs (per-user login attempts and lockout); `DATABASE_URL` in `apps/auth/.env`. Port 5436 in Docker.

## Run locally

From repo root:

```bash
npm run start:dev:auth
```

Or from `backend/`:

```bash
npm run start:dev:auth
```

Requires RabbitMQ, Postgres (auth DB), and env: `DATABASE_URL`, `PORT=3005`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OTP_EXPIRES_IN_MINUTES`, `RABBITMQ_URL`, `QUEUE_NAME`. Copy from `apps/auth/.env.example`.
