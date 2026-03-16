# Auth service

Handles user signup (with email OTP verification), sign-in, and JWT issuance. Tracks failed login attempts and temporarily locks the account after 3 failures (5 minutes); publishes `account.locked_notify` so notification sends the lockout email. Uses its own Postgres and publishes `user.verified` when email is confirmed.

## Role

- **HTTP:** `POST /auth/signup` (email, password, name) — creates user, publishes `otp.send_requested` (notification service sends OTP email).
- **HTTP:** `POST /auth/verify-otp` (email, code) — validates OTP, marks email verified, publishes `user.verified`, returns JWT.
- **HTTP:** `POST /auth/signin` (email, password) — validates credentials and email verified; returns JWT. If the account is locked (after 3 failed attempts), returns `403` with a message to try again after X minutes. IP is captured from the request for audit. Rate limit per IP applies; when exceeded, returns `429 Too Many Requests` with optional `Retry-After` header.
- **HTTP:** `POST /auth/reset-password-link` (email) — requests a password reset link; publishes `reset_password.link_requested` (notification service sends email with link).
- **HTTP:** `POST /auth/change-password` (email, token, new_password) — changes password using the token from the reset link; publishes `auth.password_changed` (notification service sends confirmation email).

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
- **IPasswordResetRepositoryPort** — Create/find/consume password reset tokens (Postgres).
- **IResetPasswordPublisherPort** — Publish `reset_password.link_requested` (RabbitMQ → notification).
- **IPasswordChangedPublisherPort** — Publish `auth.password_changed` (RabbitMQ → notification).

## Inbound

- **HTTP:** `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/signin`, `POST /auth/reset-password-link`, `POST /auth/change-password` (Zod-validated bodies). Each endpoint is rate-limited per IP via Redis; excess requests return `429 Too Many Requests`.

## Outbound

- **Persistence:** `persistence/sql/` (users, otp_codes, auth_logs via Prisma). User relations use `onDelete: Cascade` for otp_codes and auth_logs.
- **Security:** Argon2 password hasher, JWT sign/verify.
- **Messaging:** `otp.send_requested`, `account.locked_notify`, `reset_password.link_requested`, and `auth.password_changed` to notification queue; `user.verified` to users queue.

## Data

- **Postgres** — Users, OTP codes, auth_logs (per-user login attempts and lockout); `DATABASE_URL` in `apps/auth/.env`. Port 5436 in Docker.
- **Redis** — Shared instance; `REDIS_URL` in `apps/auth/.env`. Port 6379 in Docker. All keys use the `auth:` prefix (lockout attempts/until, rate limit per endpoint and IP). Rate limit is configurable via optional env vars: `RATE_LIMIT_SIGNUP_MAX`, `RATE_LIMIT_SIGNUP_WINDOW_SECONDS`, `RATE_LIMIT_VERIFY_OTP_*`, `RATE_LIMIT_SIGNIN_*` (defaults: signup 5/hour, verify-otp 10/15min, signin 10/1min).

## Run locally

From repo root:

```bash
npm run start:dev:auth
```

Or from `backend/`:

```bash
npm run start:dev:auth
```

Requires RabbitMQ, Redis, Postgres (auth DB), and env: `DATABASE_URL`, `PORT=3005`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OTP_EXPIRES_IN_MINUTES`, `RABBITMQ_URL`, `QUEUE_NAME`, `REDIS_URL`. Copy from `apps/auth/.env.example`.
