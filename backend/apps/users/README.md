# Users service

Stores and serves user profiles (id, email, name). After email verification, auth calls `POST /api/v1/internal/user-profiles` (shared secret) to create the row immediately; it also publishes `user.verified` — the consumer remains idempotent if the event is processed later. JWT is required on public profile routes.

## Role

- **Events in:** Listens for `user.verified` (from auth). Ensures `UserProfile` exists (idempotent).
- **HTTP:** `POST /internal/user-profiles` - provisions profile (`userId`, `email`, `name`); header `x-internal-secret` must match `INTERNAL_API_SECRET` (called by auth after OTP).
- **HTTP:** `GET /users/me` - returns current user profile (JWT required).
- **HTTP:** `PATCH /users/me` - updates profile (e.g. name); JWT required.

Uses shared `JwtAuthGuard` and `@CurrentUser()` from `@app/shared` to validate JWT and inject user into request.

## Ports

- **UserProfileRepositoryPort** - Create, ensureExists (idempotent), findById, update profile (Postgres/Prisma).
- **JwtPort** - Verify token only (used by guard / optional).

## Inbound

- **HTTP:** `GET /users/me`, `PATCH /users/me` (protected by JwtAuthGuard); `POST /internal/user-profiles` (internal secret).
- **Messaging:** `user.verified`.

## Outbound

- **Persistence:** `persistence/sql/` (user_profiles via Prisma).

## Data

- **Postgres** - User profiles; `DATABASE_URL` in `apps/users/.env`. Port 5437 in Docker.

## HTTP response contract

All HTTP endpoints in this service return:

- Success: `{ success: true, timestamp, data }`
- Error: `{ success: false, timestamp, statusCode, error, message, details? }`

For paginated responses, `meta` is included at top level:

- Paginated success: `{ success: true, timestamp, data, meta }`

## Run locally

From repo root:

```bash
npm run start:dev:users
```

Or from `backend/`:

```bash
npm run start:dev:users
```

Requires RabbitMQ, Postgres (users DB), and env: `DATABASE_URL`, `PORT=3006`, `JWT_SECRET` (same as auth), `INTERNAL_API_SECRET`, `RABBITMQ_URL`, `QUEUE_NAME`. Copy from `apps/users/.env.example`.
