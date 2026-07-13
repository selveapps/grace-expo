---
name: railway
description: >-
  Railway Hobby deployment for grace-api staging. Use when deploying backend,
  configuring DATABASE_URL, or setting up Postgres plugin on Railway.
---

# Railway (grace-api staging)

## Full guide

`docs/RAILWAY_DEPLOYMENT.md`

## Project settings

| Setting | Value |
|---------|-------|
| Root directory | `backend/` |
| Branch | `backend-dev` (staging) |
| Build | `npm run build` |
| Start | `npm start` |
| Health check | `GET /health` |

| Project | `grace-api-staging` |
| URL | `https://grace-api-production.up.railway.app` |
| Config | `backend/railway.toml` |

## Postgres plugin

`grace-api` uses `DATABASE_URL=${{Postgres.DATABASE_URL}}` (private network inside Railway).

To seed from local machine, use Postgres service `DATABASE_PUBLIC_URL` (Connect tab) — not `postgres.railway.internal`.

## Local vs Railway

- **Local dev:** Docker Compose (`npm run db:up`) — see `docker-postgres` skill
- **Staging:** Railway Postgres; migrations via `preDeployCommand` in `railway.toml`

## Verify deploy

```bash
STAGING_API_URL=https://grace-api-production.up.railway.app npm run verify:staging
```

## CLI setup (already done)

```bash
cd backend && railway login && npm run setup:railway
```

## Status

✅ Live (2026-07-13). Health + DB + migrations + sample seed verified.

## Official docs

https://docs.railway.com/
