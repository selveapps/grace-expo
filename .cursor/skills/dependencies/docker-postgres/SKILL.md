---
name: docker-postgres
description: >-
  Local Postgres via Docker Compose for grace-api development and E2E tests.
  Use when starting local DB, fixing DATABASE_URL errors, or running verify:phase1.
---

# Docker Postgres (grace-api)

## Compose file

`backend/docker-compose.yml` — Postgres 16 Alpine

## Connection

```
DATABASE_URL=postgresql://grace:grace@localhost:5433/grace
```

Port **5433** (not 5432) avoids conflict with system Postgres.

## Commands

```bash
cd backend
npm run db:up      # docker compose up -d --wait
npm run db:down    # docker compose down
```

## Health check

```bash
docker compose exec -T postgres pg_isready -U grace -d grace
```

## Prerequisites

Docker Desktop must be running. On macOS if compose fails:

```bash
open -a Docker
```

## Railway vs local

| Env | DATABASE_URL source |
|-----|---------------------|
| Local E2E | `docker-compose.yml` credentials |
| Railway staging | Postgres plugin → Connect tab (see `docs/RAILWAY_DEPLOYMENT.md`) |

Never commit `.env`. Template: `backend/.env.example`.

## Verify

`npm run verify:phase1` step [1/7]

## Surprises

See `SURPRISES.md` — Docker must be running before E2E.
