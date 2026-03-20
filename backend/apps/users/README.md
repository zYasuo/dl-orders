# Users service

Stores and serves user profiles (id, email, name). Listens for `user.verified` from auth and creates the profile; HTTP endpoints require JWT.

## Role

- **Events in:** Listens for `user.verified` (from auth). Creates `UserProfile` with userId, email, name.
- **HTTP:** `GET /users/me` â€” returns current user profile (JWT required).
- **HTTP:** `PATCH /users/me` â€” updates profile (e.g. name); JWT required.

Uses shared `JwtAuthGuard` and `@CurrentUser()` from `@app/shared` to validate JWT and inject user into request.

## Ports

- **UserProfileRepositoryPort** â€” Create, findById, update profile (Postgres/Prisma).
- **JwtPort** â€” Verify token only (used by guard / optional).

## Inbound

- **HTTP:** `GET /users/me`, `PATCH /users/me` (protected by JwtAuthGuard).
- **Messaging:** `user.verified`.

## Outbound

- **Persistence:** `persistence/sql/` (user_profiles via Prisma).

## Data

- **Postgres** â€” User profiles; `DATABASE_URL` in `apps/users/.env`. Port 5437 in Docker.

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

## Regra de Ouro de Repositorio

- Repositorios de escrita recebem entidade de dominio, nao DTO de aplicacao.
- Padrao esperado: `create(entity)` e `update(entity)`.
- Use case monta entidade de dominio antes de chamar repositorio.
- Adapter de persistencia faz apenas mapeamento entidade <-> banco.
