# Agentic Build Changelog

Milestone-level history for the Grace Expo agentic build. Not the npm package changelog.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- Mobile integration (GRACE-012+ / M8)

---

## [Phase 5] — 2026-07-13

Tickets: GRACE-011 / SEL-16. Milestone M7.

### Added
- `POST /beta/redeem { code }` — beta entitlement without IAP
- `subscriptionService.ts` — trial expiry on `GET /me`, redeem upsert
- `GET /me` resolves expired `trialing` → `subscribed: false`
- `test/phase5.integration.test.ts`, `verify:phase5`, `record:phase5`
- `BETA_REDEEM_CODE` env (default `grace-beta`)

### Verified
- `npm test` → 24/24 pass
- `npm run verify:phase5` → 5/5 pass
- E2E log: `docs/runs/phase5-*-*.log`

---

## [Phase 4] — 2026-07-13

Tickets: GRACE-010 / SEL-13. Milestone M6.

### Added
- `GET /bible/search?q=` → `{ ot: [...], nt: [...] }` (ILIKE on `bible_verse.text`)
- `searchScripture()` in `bibleService.ts`
- `test/phase4.integration.test.ts`, `verify:phase4`, `record:phase4`

### Verified
- `npm test` → 21/21 pass (phases 1–4)
- `npm run verify:phase4` → 5/5 pass
- E2E log: `docs/runs/phase4-*-*.log`

---

## [Phase 3] — 2026-07-13

Tickets: GRACE-009 / SEL-14. Milestone M5.

### Added
- `PATCH /me`, `GET/POST/DELETE /saved`, `GET/POST /reflections`, `GET/PUT /progress`
- `libraryService.ts`, `test/phase3.integration.test.ts`, `verify:phase3`

### Verified
- `npm test` → 18/18 pass
- `npm run verify:phase3` → 6/6 pass

---

## [Phase 2] — 2026-07-13

Milestones M3 (HTTP) + M4 (guest auth). Tickets: GRACE-007, GRACE-008 (SEL-12, SEL-10).

### Added
- Scripture routes: `/bible/:book/:chapter`, `/bible/passage`, `/today/verse`, `/verse/for-carrying`
- Guest auth: `POST /auth/guest`, `POST /auth/refresh`, `GET /me` (read-only)
- `jose` JWT (HS256, access 1h / refresh 30d)
- `src/app.ts` extracted for `fastify.inject` tests
- `test/phase2.integration.test.ts` (10 tests)
- `npm run verify:phase2`
- `DECISIONS.md`, `docs/LAB_NOTEBOOK.md` (scientific reproducibility protocol)

### Verified
- `npm test` → **14/14 pass**
- `npm run verify:phase2` → **13/13 pass** (includes phase 1 prerequisite)
- Staging: `curl https://grace-api-production.up.railway.app/bible/psalms/23` → 6 verses

### Documentation
- DEC-006 through DEC-008 recorded
- RUN-003 completed in `docs/LAB_NOTEBOOK.md`

---

## [Railway staging] — 2026-07-13

### Added
- Railway project `grace-api-staging` with Postgres + `grace-api` service
- Public URL: `https://grace-api-production.up.railway.app`
- `railway.toml`, `setup-railway.sh`, `verify-staging.sh`
- Migrations auto-run on deploy; sample KJV seeded on staging

### Verified
- `STAGING_API_URL=... npm run verify:staging` → PASS

---

## [Phase 1] — 2026-07-13

Milestones M1–M2 foundation. Tickets: GRACE-002, 003, 004, 005 (SEL-6, 7, 8, 9).

### Added
- `backend/` package: Fastify + TypeScript + CORS
- Prisma schema (7 tables) + initial migration `20260713204416_init`
- Docker Compose Postgres on `localhost:5433`
- KJV prepare/seed scripts (sample: 5 chapters, 129 verses)
- `GET /health` with DB connectivity check
- Integration tests (`backend/test/phase1.integration.test.ts`)
- `npm run verify:phase1` E2E gate script
- Agentic coding scaffold: `AGENTS.md`, `SURPRISES.md`, dependency skills

### Verified
- `npm run verify:phase1` → **9/9 pass**
- Psalms 23: 6 verses, KJV text spot-check

### Changed
- Branch `sid` → `backend-dev` (local + remote)

### Commits
- `8dfa1fd` — Railway scaffold
- `8a2541d` — Phase 1 foundation
- `c382f6d` — Branch rename doc updates
