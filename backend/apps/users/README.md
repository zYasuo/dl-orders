# Users service

Stores and serves user profiles (id, email, name). Listens for `user.verified` from auth and creates the profile; HTTP endpoints require JWT.

## Role

- **Events in:** Listens for `user.verified` (from auth). Creates `UserProfile` with userId, email, name.
- **HTTP:** `GET /users/me` — returns current user profile (JWT required).
- **HTTP:** `PATCH /users/me` — updates profile (e.g. name); JWT required.

Uses shared `JwtAuthGuard` and `@CurrentUser()` from `@app/shared` to validate JWT and inject user into request.

## Ports

- **IUserProfileRepositoryPort** — Create, findById, update profile (Postgres/Prisma).
- **IJwtPort** — Verify token only (used by guard / optional).

## Inbound

- **HTTP:** `GET /users/me`, `PATCH /users/me` (protected by JwtAuthGuard).
- **Messaging:** `user.verified`.

## Outbound

- **Persistence:** `persistence/sql/` (user_profiles via Prisma).

## Data

- **Postgres** — User profiles; `DATABASE_URL` in `apps/users/.env`. Port 5437 in Docker.

## Run locally

From repo root:

```bash
npm run start:dev:users
```

Or from `backend/`:

```bash
npm run start:dev:users
```

Requires RabbitMQ, Postgres (users DB), and env: `DATABASE_URL`, `PORT=3006`, `JWT_SECRET` (same as auth), `RABBITMQ_URL`, `QUEUE_NAME`. Copy from `apps/users/.env.example`.
