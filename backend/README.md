# grace-api

Grace backend API (Node 20 + TypeScript + Fastify). Deployed on **Railway Hobby**.

## Quick start

```bash
npm install
cp .env.example .env
npm run db:up          # local Postgres on :5433
npm run migrate:dev    # first-time schema
npm run seed:prepare   # sample KJV chapters
npm run seed:bible
npm run dev
curl http://localhost:3000/health   # → {"ok":true,"db":true}
```

## Phase 1 verification

```bash
npm run verify:phase1   # Docker + migrate + seed + tests + /health E2E
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local dev with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run production build |
| `npm run typecheck` | Typecheck without emit |
| `npm run db:up` | Start local Postgres (`docker compose`) |
| `npm run db:down` | Stop local Postgres |
| `npm run migrate` | Apply migrations (staging/prod) |
| `npm run migrate:dev` | Create/apply migrations in dev |
| `npm run seed:prepare` | Fetch sample KJV from bible-api.com |
| `npm run seed:prepare:full` | Fetch full KJV canon (~30 min) |
| `npm run seed:bible` | Load normalized JSON into `bible_verse` |
| `npm test` | Integration tests (schema + seed) |
| `npm run verify:phase1` | Full Phase 1 E2E gate |
| `npm run verify:phase4` | Phase 4 search E2E gate |
| `npm run verify:phase5` | Phase 5 beta entitlement E2E gate |

## Beta entitlement (Phase 5)

Expo Go beta uses server-side subscription state — no StoreKit.

- `GET /me` → `profile.subscribed` (default `false` for new guests)
- `POST /beta/redeem` `{ "code": "..." }` → sets `subscribed: true` + 3-day trial row
- Set `BETA_REDEEM_CODE` in `.env` / Railway (default in dev: `grace-beta`)

Trial expiry: `trialing` past `expiresAt` flips to `expired` and `subscribed: false` on next `GET /me`.

## Railway

See [`../docs/RAILWAY_DEPLOYMENT.md`](../docs/RAILWAY_DEPLOYMENT.md).

- **Root directory:** `backend/`
- **Build:** `npm run build`
- **Start:** `npm start`
- **Health:** `GET /health`

## Spec

HTTP contract: [`../BACKEND.md`](../BACKEND.md)  
Milestones: [`../docs/BACKEND_ARCHITECTURE.md`](../docs/BACKEND_ARCHITECTURE.md)
