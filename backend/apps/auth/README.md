# Auth service

Handles user signup (with email OTP verification), sign-in, and JWT issuance. Tracks failed login attempts and temporarily locks the account after 3 failures (5 minutes); publishes `account.locked_notify` so notification sends the lockout email. Uses its own Postgres. When email is confirmed via OTP, it provisions the row in the users service over HTTP, then publishes `user.verified`. Each successful sign-in repeats the same idempotent HTTP provision so `/users/me` never 404s if the users DB was reset without the auth DB.

## Role

- **HTTP:** `POST /auth/signup` (email, password, name) â€” creates user, publishes `otp.send_requested` (notification service sends OTP email).
- **HTTP:** `POST /auth/verify-otp` (email, code) â€” validates OTP, marks email verified, calls users `POST /internal/user-profiles`, publishes `user.verified`, returns JWT.
- **HTTP:** `POST /auth/signin` (email, password) â€” validates credentials and email verified; ensures the user profile row exists in the users service (same internal HTTP provision as after OTP), then returns JWT. If the account is locked (after 3 failed attempts), returns `403` with a message to try again after X minutes. IP is captured from the request for audit. Rate limit per IP applies; when exceeded, returns `429 Too Many Requests` with optional `Retry-After` header.
- **HTTP:** `POST /auth/reset-password-link` (email) â€” requests a password reset link; publishes `reset_password.link_requested` (notification service sends email with link).
- **HTTP:** `PATCH /auth/change-password` (email, token, new_password) â€” changes password using the token from the reset link; publishes `auth.password_changed` (notification service sends confirmation email).

JWT payload: `{ sub: userId, email }`; other services validate it with the same `JWT_SECRET`.

## Ports

- **AuthUserRepositoryPort** â€” Create/find user, mark email verified (Postgres/Prisma).
- **AuthLogsRepositoryPort** â€” Find/upsert auth log per user (login attempts, lockout until).
- **OtpRepositoryPort** â€” Create/find OTP, mark used.
- **OtpSendRequestedPublisherPort** â€” Publish `otp.send_requested` (RabbitMQ â†’ notification service sends OTP email).
- **AccountLockedNotifyPublisherPort** â€” Publish `account.locked_notify` when account is locked (RabbitMQ â†’ notification service sends lockout email).
- **PasswordHasherPort** â€” Hash/compare password (Argon2).
- **JwtPort** â€” Sign/verify JWT.
- **UserVerifiedPublisherPort** â€” Publish `user.verified` (RabbitMQ).
- **UserProfileProvisionerPort** â€” HTTP provision of user profile on users service (`USERS_SERVICE_URL`, `INTERNAL_API_SECRET`, header `x-internal-secret`).
- **PasswordResetRepositoryPort** â€” Create/find/consume password reset tokens (Postgres).
- **ResetPasswordPublisherPort** â€” Publish `reset_password.link_requested` (RabbitMQ â†’ notification).
- **PasswordChangedPublisherPort** â€” Publish `auth.password_changed` (RabbitMQ â†’ notification).

## Inbound

- **HTTP:** `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/signin`, `POST /auth/reset-password-link`, `PATCH /auth/change-password` (Zod-validated bodies). Each endpoint is rate-limited per IP via Redis; excess requests return `429 Too Many Requests`.

## Outbound

- **Persistence:** `persistence/sql/` (users, otp_codes, auth_logs via Prisma). User relations use `onDelete: Cascade` for otp_codes and auth_logs.
- **Security:** Argon2 password hasher, JWT sign/verify.
- **HTTP (server-to-server):** After OTP verification and after successful sign-in, `POST` to users service internal profile route (idempotent `ensureExists`; see `UserProfileProvisionerPort`).
- **Messaging:** `otp.send_requested`, `account.locked_notify`, `reset_password.link_requested`, and `auth.password_changed` to notification queue; `user.verified` to users queue.

## Data

- **Postgres** â€” Users, OTP codes, auth_logs (per-user login attempts and lockout); `DATABASE_URL` in `apps/auth/.env`. Port 5436 in Docker.
- **Redis** â€” Shared instance; `REDIS_URL` in `apps/auth/.env`. Port 6379 in Docker. All keys use the `auth:` prefix (lockout attempts/until, rate limit per endpoint and IP). Rate limit is configurable via optional env vars: `RATE_LIMIT_SIGNUP_MAX`, `RATE_LIMIT_SIGNUP_WINDOW_SECONDS`, `RATE_LIMIT_VERIFY_OTP_*`, `RATE_LIMIT_SIGNIN_*` (defaults: signup 5/hour, verify-otp 10/15min, signin 10/1min).

## Run locally

From repo root:

```bash
npm run start:dev:auth
```

Or from `backend/`:

```bash
npm run start:dev:auth
```

Requires RabbitMQ, Redis, Postgres (auth DB), and env: `DATABASE_URL`, `PORT=3005`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `OTP_EXPIRES_IN_MINUTES`, `RABBITMQ_URL`, `QUEUE_NAME`, `REDIS_URL`, `USERS_SERVICE_URL`, `INTERNAL_API_SECRET` (must match users service). Copy from `apps/auth/.env.example`.

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
