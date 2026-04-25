# FFXIV Guide Engine

Monorepo for a Final Fantasy XIV guide platform: public web (SEO), admin console, NestJS API, BullMQ-backed scraper worker, and Expo mobile client.

## Requirements

- Node.js 20+
- pnpm 9 (`corepack enable && corepack prepare pnpm@9.15.4 --activate`)
- Docker (optional, for local stack)

## Quick start (local)

1. Copy environment template:

```bash
cp .env.example .env
```

2. Start infrastructure:

```bash
docker compose up -d postgres redis
```

3. Install and build packages:

```bash
pnpm install
pnpm turbo run build
```

4. Run API (applies schema when `SCHEMA_SYNC=true`):

```bash
pnpm --filter @ffxiv-guide-engine/api start:dev
```

5. Run web and admin:

```bash
pnpm --filter @ffxiv-guide-engine/web dev
pnpm --filter @ffxiv-guide-engine/admin dev
```

6. Run scraper worker:

```bash
pnpm --filter @ffxiv-guide-engine/scraper dev
```

7. Mobile:

```bash
pnpm --filter @ffxiv-guide-engine/mobile start
```

## Docker (full stack)

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3001`
- Web: `http://localhost:3100`
- Admin: `http://localhost:3002`
- Postgres: `localhost:55432`
- Redis: `localhost:6379`

## Coolify

Use `docker-compose.coolify.yml` when deploying as a Coolify Docker Compose application.

Expose these services through Coolify domains:

- `web` on container port `3000`
- `admin` on container port `3002`
- `api` on container port `3001`

Do not expose `postgres`, `redis`, or `scraper` publicly.

Required production variables:

- `JWT_SECRET`
- `INTERNAL_API_TOKEN`
- `POSTGRES_PASSWORD`
- `BOOTSTRAP_ADMIN_EMAIL`
- `BOOTSTRAP_ADMIN_PASSWORD`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_API_URL`

## CI

GitHub Actions workflow `.github/workflows/ci.yml` runs lint, typecheck, build, and tests on pushes and PRs to `main` and `develop`.

## Documentation

- [`docs/runbook.md`](docs/runbook.md)
- [`docs/scraper-policy.md`](docs/scraper-policy.md)
- [`CHANGELOG.md`](CHANGELOG.md)
