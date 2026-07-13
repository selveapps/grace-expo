---
name: prisma
description: >-
  Prisma schema, migrations, and client for grace-api Postgres. Use when editing
  prisma/, running migrations, seeding bible_verse, or debugging DATABASE_URL
  connectivity.
---

# Prisma (grace-api)

## Official docs

https://www.prisma.io/docs

Read before changing schema or migration workflow — APIs change between major versions.

## Commands

| Command | When |
|---------|------|
| `npm run migrate:dev` | Local schema change — creates + applies migration |
| `npm run migrate` | CI, E2E, Railway — applies pending migrations only |
| `npx prisma generate` | After schema change (also in `npm run build`) |
| `npm run seed:bible` | Load `data/kjv.normalized.json` into `bible_verse` |

## Schema location

`backend/prisma/schema.prisma`

## Project conventions

- `User.name` is on **User**, not Profile
- `guest_device_id` on User for Expo Go guest auth
- Tables map to snake_case via `@@map`
- Client singleton: `backend/src/db.ts` — use `checkDatabase()` for health

## Verify

```bash
cd backend && npm run verify:phase1   # steps 3, 5
cd backend && npm test
```

## Common pitfalls

- `migrate dev` in CI will hang or fail — use `migrate deploy`
- Forgetting `prisma generate` after pull → stale client types
- `package.json#prisma` seed config runs with `prisma db seed`

## Surprises

See root `SURPRISES.md` — Profile/name, migrate dev vs deploy.
