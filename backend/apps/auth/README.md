# Auth service

Handles user signup (with email OTP verification), sign-in, and JWT issuance. Uses its own Postgres and publishes `user.verified` when email is confirmed.

## Role

- **HTTP:** `POST /auth/signup` (email, password, name) — creates user, publishes `otp.send_requested` (notification service sends OTP email).
- **HTTP:** `POST /auth/verify-otp` (email, code) — validates OTP, marks email verified, publishes `user.verified`, returns JWT.
- **HTTP:** `POST /auth/signin` (email, password) — validates credentials and email verified, returns JWT.

JWT payload: `{ sub: userId, email }`; other services validate it with the same `JWT_SECRET`.

## Ports

- **IAuthUserRepositoryPort** — Create/find user, mark email verified (Postgres/Prisma).
- **IOtpRepositoryPort** — Create/find OTP, mark used.
- **IOtpSendRequestedPublisherPort** — Publish `otp.send_requested` (RabbitMQ → notification service sends OTP email).
- **IPasswordHasherPort** — Hash/compare password (Argon2).
- **IJwtPort** — Sign/verify JWT.
- **IUserVerifiedPublisherPort** — Publish `user.verified` (RabbitMQ).

## Inbound

- **HTTP:** `POST /auth/signup`, `POST /auth/verify-otp`, `POST /auth/signin` (Zod-validated bodies).

## Outbound

- **Persistence:** `persistence/sql/` (users, otp_codes via Prisma).
- **Security:** Argon2 password hasher, JWT sign/verify.
- **Messaging:** `otp.send_requested` to notification queue; `user.verified` to users queue.

## Data

- **Postgres** — Users, OTP codes; `DATABASE_URL` in `apps/auth/.env`. Port 5436 in Docker.

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
