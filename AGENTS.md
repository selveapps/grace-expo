# Grace Expo — Agent Instructions

Thin router. Deep docs live in linked files — do not duplicate here.

## Project

Premium audio-first Bible app (Expo SDK 54) + `backend/` API (Node 20, Fastify, Prisma, Postgres).
Beta target: Expo Go + guest auth + KJV scripture from own API.

## Layout

| Path | Purpose |
|------|---------|
| `src/` | Expo app; screens import only from `src/services/` |
| `backend/` | `grace-api` — Fastify server, Prisma, seed scripts |
| `docs/BACKEND_ARCHITECTURE.md` | Milestones M0–M11 + verify matrix |
| `docs/LINEAR_ISSUES.md` | GRACE-XXX ↔ SEL-XXX tickets |
| `BACKEND.md` | HTTP API contract |

## Worktrees

| Path | Branch |
|------|--------|
| `grace-expo/` | `main` |
| `grace-expo-sid/` (this worktree) | `backend-dev` |

Never implement features on `main` in-place. See `.cursor/rules/git-worktrees.mdc`.

## Backend commands (`cd backend`)

```bash
npm run db:up              # Docker Postgres :5433
npm run migrate:dev        # first-time / schema change
npm run seed:prepare       # sample KJV from bible-api.com
npm run seed:bible         # load into bible_verse
npm run dev                # API on :3000
npm test                   # integration tests
npm run verify:phase1      # full Phase 1 E2E gate (run before claiming done)
```

## App commands (repo root)

```bash
npm install && npx expo start
```

## Agent docs (read when relevant)

- Methodology: `docs/AGENTIC_CODING_METHODOLOGY.md`
- Surprises log: `SURPRISES.md` (append on every correction loop)
- Build log: `CHANGELOG.md`
- Railway deploy: `docs/RAILWAY_DEPLOYMENT.md`

## Dependency skills (`.cursor/skills/dependencies/`)

Load the matching skill before editing that stack:

- `prisma` — schema, migrations, client
- `fastify` — routes, ESM imports
- `docker-postgres` — local DB
- `railway` — staging deploy
- `bible-api` — KJV seed fetch

## Definition of done

1. Acceptance criteria in `docs/LINEAR_ISSUES.md` met
2. `npm run verify:phaseN` passes (or equivalent milestone verify)
3. Surprise logged in `SURPRISES.md` if agent was corrected
4. Atomic commit; reference `SEL-XXX` / `GRACE-XXX` in message

## Avoid

- Committing `.env`, `.railway/`, or secrets
- Native auth/IAP in Expo Go scope
- Broad refactors outside the requested milestone
- Guessing dependency APIs — read skill + official docs first
