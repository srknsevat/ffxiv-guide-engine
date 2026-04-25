# Operations Runbook

## Services

| Service | Port | Purpose |
| --- | --- | --- |
| `api` | 3001 | NestJS HTTP API |
| `web` | 3100 | Public Next.js site |
| `admin` | 3002 | Admin Next.js console |
| `postgres` | 55432 | Primary database |
| `redis` | 6379 | BullMQ broker for scraper |

## Health checks

- API liveness: `GET /api/health`
- Controller smoke tests: `GET /api/*/admin/test` routes

## Database

- When `SCHEMA_SYNC=true`, the API runs `SchemaGenerator.updateSchema()` on startup.
- Prefer turning `SCHEMA_SYNC` off in production after introducing migrations.

## Admin bootstrap

Set `BOOTSTRAP_ADMIN_EMAIL` and `BOOTSTRAP_ADMIN_PASSWORD` to create the first admin user when no admin exists.

## Backups

1. Snapshot Postgres volume (`postgres_data`) on your VPS.
2. Test restores quarterly.

## Incident response

1. Check API logs and scraper logs.
2. Verify Redis connectivity (BullMQ).
3. Requeue jobs from the admin UI (`POST /api/jobs`).
