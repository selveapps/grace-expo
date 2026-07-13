# Grace Backend Beta — Linear Issue Backlog

**Project:** Grace Expo Go Beta  
**Goal:** Real backend + app integration, distributable via Expo Go  
**Parent doc:** [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md)

**Linear project:** [Grace Expo Beta](https://linear.app/selve-apps/project/grace-expo-beta-8eb9cf365622) (team: **Selve**)

Import these into Linear (or GitHub Issues). IDs are stable references for PRs and commits.

## Linear ID mapping (synced 2026-07-13)

| GRACE ID | Linear | Title | Status |
|----------|--------|-------|--------|
| GRACE-001 | [SEL-5](https://linear.app/selve-apps/issue/SEL-5) | Architecture & worktree setup | Done |
| GRACE-002 | [SEL-6](https://linear.app/selve-apps/issue/SEL-6) | Provision staging Postgres | Done (Railway) |
| GRACE-003 | [SEL-7](https://linear.app/selve-apps/issue/SEL-7) | Scaffold backend/ package | Done |
| GRACE-004 | [SEL-8](https://linear.app/selve-apps/issue/SEL-8) | Source KJV seed dataset | Done (sample) |
| GRACE-005 | [SEL-9](https://linear.app/selve-apps/issue/SEL-9) | Database schema & migrations | Done |
| GRACE-006 | [SEL-11](https://linear.app/selve-apps/issue/SEL-11) | Seed bible into Postgres | Done (sample) |
| GRACE-007 | [SEL-12](https://linear.app/selve-apps/issue/SEL-12) | Scripture HTTP endpoints | Backlog |
| GRACE-008 | [SEL-10](https://linear.app/selve-apps/issue/SEL-10) | Guest JWT auth | Backlog |
| GRACE-009 | [SEL-14](https://linear.app/selve-apps/issue/SEL-14) | Profile & library CRUD | Backlog |
| GRACE-010 | [SEL-13](https://linear.app/selve-apps/issue/SEL-13) | Scripture search endpoint | Backlog |
| GRACE-011 | [SEL-16](https://linear.app/selve-apps/issue/SEL-16) | Beta entitlement (no IAP) | Backlog |
| GRACE-012 | [SEL-15](https://linear.app/selve-apps/issue/SEL-15) | API client module | Backlog |
| GRACE-013 | [SEL-17](https://linear.app/selve-apps/issue/SEL-17) | Wire AuthService to guest API | Backlog |
| GRACE-014 | [SEL-18](https://linear.app/selve-apps/issue/SEL-18) | Wire scripture layer to private API | Backlog |
| GRACE-015 | [SEL-19](https://linear.app/selve-apps/issue/SEL-19) | Sync profile & library to server | Backlog |
| GRACE-016 | [SEL-23](https://linear.app/selve-apps/issue/SEL-23) | Wire SubscriptionService to server | Backlog |
| GRACE-017 | [SEL-20](https://linear.app/selve-apps/issue/SEL-20) | Wire ReadingService.search to API | Backlog |
| GRACE-018 | [SEL-22](https://linear.app/selve-apps/issue/SEL-22) | Offline write queue & sync | Backlog |
| GRACE-019 | [SEL-21](https://linear.app/selve-apps/issue/SEL-21) | Deploy API to staging HTTPS | Backlog |
| GRACE-020 | [SEL-24](https://linear.app/selve-apps/issue/SEL-24) | Configure app for staging API | Backlog |
| GRACE-021 | [SEL-25](https://linear.app/selve-apps/issue/SEL-25) | Beta distribution playbook | Backlog |
| GRACE-022 | [SEL-30](https://linear.app/selve-apps/issue/SEL-30) | Beta verification checklist run | Backlog |
| GRACE-023 | [SEL-26](https://linear.app/selve-apps/issue/SEL-26) | Apple Sign-In server verification | Backlog |
| GRACE-024 | [SEL-27](https://linear.app/selve-apps/issue/SEL-27) | Google Sign-In server verification | Backlog |
| GRACE-025 | [SEL-28](https://linear.app/selve-apps/issue/SEL-28) | IAP receipt validation & webhooks | Backlog |
| GRACE-026 | [SEL-29](https://linear.app/selve-apps/issue/SEL-29) | EAS dev build for auth + IAP | Backlog |

**GitHub mirror:** [issues #1–#27](https://github.com/selveapps/grace-expo/issues) (same GRACE IDs in titles)

---

| Field | Meaning |
|-------|---------|
| **Blocked by** | Must complete before starting |
| **Parallel** | Safe to work simultaneously |
| **Priority** | P0 = beta blocker · P1 = beta polish · P2 = post-beta |
| **Lane** | `backend` · `mobile` · `ops` · `data` |

---

## Phase 0 — Planning (done)

### GRACE-001 · Architecture & worktree setup

| | |
|---|---|
| **Milestone** | M0 |
| **Priority** | P0 |
| **Lane** | ops |
| **Status** | ✅ Done (`backend-dev` @ `b4288c6`) |
| **Blocked by** | — |
| **Parallel** | — |

**Description**  
Publish milestone architecture doc and Cursor git-worktree rule.

**Acceptance criteria**
- [x] `docs/BACKEND_ARCHITECTURE.md` exists with milestones M0–M11
- [x] `.cursor/rules/git-worktrees.mdc` committed
- [x] `git worktree list` shows `grace-expo-sid` on branch `backend-dev`

**Verify**  
`git worktree list && test -f docs/BACKEND_ARCHITECTURE.md`

---

## Phase 1 — Foundation (critical path start)

### GRACE-002 · Provision staging Postgres

| | |
|---|---|
| **Milestone** | M2 (prep) |
| **Priority** | P0 |
| **Lane** | ops |
| **Blocked by** | GRACE-001 |
| **Parallel** | GRACE-003, GRACE-004 |

**Description**  
Create a staging Postgres instance (Neon / Supabase / Railway). Store `DATABASE_URL` in team secrets.

**Acceptance criteria**
- [ ] Staging DB reachable from local machine
- [ ] `DATABASE_URL` documented in `backend/.env.example`
- [ ] Connection tested with `psql` or Prisma `db pull`

**Verify**  
`psql $DATABASE_URL -c 'SELECT 1'`

---

### GRACE-003 · Scaffold `backend/` package

| | |
|---|---|
| **Milestone** | M1 |
| **Priority** | P0 |
| **Lane** | backend |
| **Blocked by** | GRACE-001 |
| **Parallel** | GRACE-002, GRACE-004 |

**Description**  
Add `backend/` monorepo package: Node 20, TypeScript, Fastify, ESLint, `npm run dev`.

**Acceptance criteria**
- [ ] `backend/package.json` with `dev`, `build`, `start`, `test` scripts
- [ ] `GET /health` returns `{ "ok": true }` on `localhost:3000`
- [ ] TypeScript compiles with zero errors
- [ ] README in `backend/` with local run instructions

**Verify**  
`cd backend && npm run dev & curl -s localhost:3000/health`

---

### GRACE-004 · Source KJV seed dataset

| | |
|---|---|
| **Milestone** | M3 (prep) |
| **Priority** | P0 |
| **Lane** | data |
| **Blocked by** | GRACE-001 |
| **Parallel** | GRACE-002, GRACE-003 |

**Description**  
Acquire public-domain KJV in machine-readable form (JSON/CSV). Add `backend/scripts/` normalizer that outputs `{ book, chapter, verse, text }[]`.

**Acceptance criteria**
- [ ] Seed file covers all 66 books with correct chapter counts (validate against `src/data/bookMeta.js`)
- [ ] `npm run seed:prepare` produces normalized JSON without errors
- [ ] Psalms 23 spot-check matches bundled app text

**Verify**  
`node backend/scripts/prepare-kjv.js && jq '.[] | select(.book=="Psalms" and .chapter==23)' backend/data/kjv.normalized.json`

---

## Phase 2 — Data layer

### GRACE-005 · Database schema & migrations

| | |
|---|---|
| **Milestone** | M2 |
| **Priority** | P0 |
| **Lane** | backend |
| **Blocked by** | GRACE-003, GRACE-002 |
| **Parallel** | GRACE-004 |

**Description**  
Implement Prisma/Drizzle schema: `user`, `profile`, `saved_verse`, `reflection`, `subscription`, `reading_progress`, `bible_verse`. Add `guest_device_id` on `user`.

**Acceptance criteria**
- [ ] Migration runs clean on empty staging DB
- [ ] All tables from `BACKEND.md` §2 present + `bible_verse`
- [ ] Integration test: insert user + profile, read back
- [ ] `npm run migrate` documented in `backend/README.md`

**Verify**  
`cd backend && npm run migrate && npm test -- --grep schema`

---

### GRACE-006 · Seed bible into Postgres

| | |
|---|---|
| **Milestone** | M3 |
| **Priority** | P0 |
| **Lane** | data |
| **Blocked by** | GRACE-004, GRACE-005 |
| **Parallel** | GRACE-007 |

**Description**  
Run seed script to load KJV into `bible_verse`. Add indexes on `(book, chapter)` and verse text for search.

**Acceptance criteria**
- [ ] Full KJV loaded (row count matches expected verse count ±0)
- [ ] `SELECT count(*) FROM bible_verse WHERE book='Psalms' AND chapter=23` = 6
- [ ] Seed is idempotent (re-run safe)

**Verify**  
`cd backend && npm run seed:bible && npm run verify:seed`

---

### GRACE-007 · Scripture HTTP endpoints

| | |
|---|---|
| **Milestone** | M3 |
| **Priority** | P0 |
| **Lane** | backend |
| **Blocked by** | GRACE-006 |
| **Parallel** | GRACE-008 |

**Description**  
Implement public routes matching app shapes:
- `GET /bible/:book/:chapter`
- `GET /bible/passage?ref=`
- `GET /today/verse`
- `GET /verse/for-carrying?tags=`

**Acceptance criteria**
- [ ] Response shape matches `src/api/bible.js` consumer (`{ reference, verses: [{n,t}] }`)
- [ ] `today/verse` stable per UTC calendar day
- [ ] `for-carrying` maps tags per `CARRY_VERSE` in `bible.js`
- [ ] API tests for Psalms 23, John 3:16, daily verse

**Verify**  
`curl localhost:3000/bible/psalms/23 | jq '.verses | length'  # → 6`

---

## Phase 3 — Auth & user data

### GRACE-008 · Guest JWT auth

| | |
|---|---|
| **Milestone** | M4 |
| **Priority** | P0 |
| **Lane** | backend |
| **Blocked by** | GRACE-005 |
| **Parallel** | GRACE-007 |

**Description**  
`POST /auth/guest { deviceId }` upserts user, returns `{ session, user }`. `POST /auth/refresh`. Bearer middleware on protected routes.

**Acceptance criteria**
- [ ] Guest login creates user + empty profile
- [ ] Same `deviceId` returns same user id
- [ ] Protected route returns 401 without token
- [ ] JWT expiry + refresh flow tested

**Verify**  
`curl -X POST localhost:3000/auth/guest -d '{"deviceId":"test-uuid"}' | jq .session`

---

### GRACE-009 · Profile & library CRUD

| | |
|---|---|
| **Milestone** | M5 |
| **Priority** | P0 |
| **Lane** | backend |
| **Blocked by** | GRACE-008 |
| **Parallel** | GRACE-010 |

**Description**  
Authed routes per `BACKEND.md` §3: `/me`, `/saved`, `/reflections`, `/progress`.

**Acceptance criteria**
- [ ] `PATCH /me` updates name, carrying, gentleness, rhythm, onboarded
- [ ] Saved verses: POST, GET, DELETE with `unique(user_id, ref)`
- [ ] Reflections: POST, GET with stable ids
- [ ] Progress: PUT, GET per book
- [ ] Integration test covers full guest → save → list → delete flow

**Verify**  
`npm test -- --grep "profile crud"`

---

### GRACE-010 · Scripture search endpoint

| | |
|---|---|
| **Milestone** | M6 |
| **Priority** | P1 |
| **Lane** | backend |
| **Blocked by** | GRACE-006 |
| **Parallel** | GRACE-009 |

**Description**  
`GET /bible/search?q=` → `{ ot: [...], nt: [...] }` using Postgres FTS/trigram.

**Acceptance criteria**
- [ ] `?q=peace` returns grouped OT/NT results
- [ ] Empty query returns empty arrays
- [ ] p95 latency < 500ms on staging
- [ ] Results include `ref` and `text` snippet

**Verify**  
`curl 'localhost:3000/bible/search?q=peace' | jq '.ot | length'`

---

### GRACE-011 · Beta entitlement (no IAP)

| | |
|---|---|
| **Milestone** | M7 |
| **Priority** | P1 |
| **Lane** | backend |
| **Blocked by** | GRACE-009 |
| **Parallel** | GRACE-012 |

**Description**  
Server-side subscription state for Expo Go beta. `GET /me` includes `profile.subscribed`. Optional `POST /beta/redeem { code }` or auto-grant beta cohort.

**Acceptance criteria**
- [ ] New users default to `subscribed: false` (or configurable beta default)
- [ ] Redeem code (or admin flag) sets `subscribed: true`
- [ ] Trial expiry logic mirrors `SubscriptionService` (3-day trialing → expired)
- [ ] Document beta entitlement decision in `backend/README.md`

**Verify**  
`curl -H "Authorization: Bearer $JWT" localhost:3000/me | jq .profile.subscribed`

---

## Phase 4 — Mobile integration

### GRACE-012 · API client module

| | |
|---|---|
| **Milestone** | M8 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-008 |
| **Parallel** | GRACE-011 |

**Description**  
Add `src/api/client.js`: `EXPO_PUBLIC_API_BASE`, fetch wrapper, JWT attach, 401 refresh, timeout/retry.

**Acceptance criteria**
- [ ] `app.config.js` or `.env` exposes `EXPO_PUBLIC_API_BASE`
- [ ] Token stored via `StorageService` (`KEYS.session`)
- [ ] `api.get/post/patch/delete` helpers used by services
- [ ] Network errors surface `{ ok: false, error }` without crashing

**Verify**  
Unit test: mock fetch, assert Authorization header present

---

### GRACE-013 · Wire AuthService to guest API

| | |
|---|---|
| **Milestone** | M8 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-012, GRACE-008 |
| **Parallel** | GRACE-014 |

**Description**  
Replace mock guest auth with `POST /auth/guest`. Generate stable `deviceId` on first launch. `ensureGuest()` calls API if no session.

**Acceptance criteria**
- [ ] Fresh install obtains JWT without user action
- [ ] Session survives app restart
- [ ] Sign-in screens still work (mock UI OK for beta; server session is guest-backed)
- [ ] `signOut` clears session and re-guests

**Verify**  
Expo Go: fresh install → check AsyncStorage for session → `GET /me` succeeds

---

### GRACE-014 · Wire scripture layer to private API

| | |
|---|---|
| **Milestone** | M8 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-012, GRACE-007 |
| **Parallel** | GRACE-013, GRACE-015 |

**Description**  
Point `src/api/bible.js` (or new `src/api/scripture.js`) at `API_BASE/bible/*`. Keep AsyncStorage cache + offline fallback.

**Acceptance criteria**
- [ ] Chapter reader loads from staging API (verify via network log)
- [ ] Onboarding verse + daily verse use API
- [ ] Offline: previously opened chapter loads from cache
- [ ] `online: false` flag still set when using cache

**Verify**  
Expo Go: open Psalms 23 with API up → kill API → reopen chapter → still renders

---

### GRACE-015 · Sync profile & library to server

| | |
|---|---|
| **Milestone** | M8 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-013, GRACE-009 |
| **Parallel** | GRACE-014 |

**Description**  
On boot: hydrate `profile` from `GET /me` when session exists. Mirror writes: `PATCH /me`, `POST /saved`, `POST /reflections`.

**Acceptance criteria**
- [ ] Onboarding name appears on server after completion
- [ ] Saved verse in reader appears in `GET /saved`
- [ ] Reflection added in app appears in `GET /reflections`
- [ ] AsyncStorage remains local cache; server wins on hydrate

**Verify**  
Complete onboarding → `curl /saved` with JWT shows saved onboarding verse

---

### GRACE-016 · Wire SubscriptionService to server

| | |
|---|---|
| **Milestone** | M8 / M7 |
| **Priority** | P1 |
| **Lane** | mobile |
| **Blocked by** | GRACE-011, GRACE-015 |
| **Parallel** | — |

**Description**  
`SubscriptionService.getStatus()` reads from `GET /me`. Paywall `purchase()` calls server trial endpoint or redeem (no StoreKit).

**Acceptance criteria**
- [ ] Paywall reflects server `subscribed` state
- [ ] Trial start updates server (not local-only)
- [ ] App restart preserves subscription state from server

**Verify**  
Start trial in app → `GET /me` shows `trialing`

---

### GRACE-017 · Wire ReadingService.search to API

| | |
|---|---|
| **Milestone** | M6 / M8 |
| **Priority** | P1 |
| **Lane** | mobile |
| **Blocked by** | GRACE-010, GRACE-012 |
| **Parallel** | GRACE-016 |

**Description**  
Replace client-side search stub with `GET /bible/search`.

**Acceptance criteria**
- [ ] Search screen (when built) calls API
- [ ] Graceful empty state when search not yet in UI (service method ready)

**Verify**  
`ReadingService.search('peace')` returns OT/NT groups from API

---

## Phase 5 — Reliability & ship

### GRACE-018 · Offline write queue & sync

| | |
|---|---|
| **Milestone** | M9 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-015 |
| **Parallel** | GRACE-019 |

**Description**  
Queue `PATCH /me`, `POST /saved`, `POST /reflections` when offline. Replay on reconnect. Document conflict policy: server wins on hydrate.

**Acceptance criteria**
- [ ] Airplane mode: save verse locally, shows in UI
- [ ] Reconnect: verse appears on server
- [ ] `docs/OFFLINE_SYNC.md` documents policy
- [ ] No duplicate saved verses on replay

**Verify**  
Airplane on → save verse → airplane off → `GET /saved` matches

---

### GRACE-019 · Deploy API to staging HTTPS

| | |
|---|---|
| **Milestone** | M10 |
| **Priority** | P0 |
| **Lane** | ops |
| **Blocked by** | GRACE-007, GRACE-009 |
| **Parallel** | GRACE-018 |

**Description**  
Deploy `backend/` to Fly/Render/Railway. Set `DATABASE_URL`, `JWT_SECRET`. CI runs tests before deploy.

**Acceptance criteria**
- [ ] `https://<staging>/health` returns 200
- [ ] All integration tests pass against staging
- [ ] CORS allows Expo Go origins
- [ ] Deploy documented in `backend/README.md`

**Verify**  
`curl https://<staging>/health`

---

### GRACE-020 · Configure app for staging API

| | |
|---|---|
| **Milestone** | M10 |
| **Priority** | P0 |
| **Lane** | mobile |
| **Blocked by** | GRACE-019, GRACE-014 |
| **Parallel** | — |

**Description**  
Set `EXPO_PUBLIC_API_BASE=https://<staging>` for beta builds. Add `.env.staging` example.

**Acceptance criteria**
- [ ] Expo app hits staging from physical device (not localhost)
- [ ] No hardcoded `localhost` in committed code
- [ ] README beta section lists env setup

**Verify**  
Phone on LTE: open app → scripture loads from staging URL

---

### GRACE-021 · Beta distribution playbook

| | |
|---|---|
| **Milestone** | M10 |
| **Priority** | P0 |
| **Lane** | ops |
| **Blocked by** | GRACE-020 |
| **Parallel** | — |

**Description**  
Document how to send Grace to beta testers via Expo Go: `npx expo start --tunnel`, QR sharing, known limitations.

**Acceptance criteria**
- [ ] `docs/BETA_DISTRIBUTION.md` with step-by-step tester instructions
- [ ] Lists Expo Go limitations (no Apple/Google auth, no real IAP)
- [ ] Remote tester successfully loads app (verified once)

**Verify**  
Non-dev tester opens tunnel QR → completes onboarding → data on server

---

### GRACE-022 · Beta verification checklist run

| | |
|---|---|
| **Milestone** | M10 |
| **Priority** | P0 |
| **Lane** | ops |
| **Blocked by** | GRACE-021 |
| **Parallel** | — |

**Description**  
Execute full verification matrix from `BACKEND_ARCHITECTURE.md` §5. File pass/fail report.

**Acceptance criteria**
- [ ] All 10 beta-ready checks pass (or documented exceptions)
- [ ] `docs/BETA_VERIFICATION.md` with dated results
- [ ] Blocking bugs filed as new Linear issues

**Verify**  
Checklist in §5 of `BACKEND_ARCHITECTURE.md` all ✅

---

## Phase 6 — Post-beta (deferred)

### GRACE-023 · Apple Sign-In server verification

| | |
|---|---|
| **Milestone** | M11 |
| **Priority** | P2 |
| **Lane** | backend |
| **Blocked by** | GRACE-022 |
| **Parallel** | GRACE-024 |

**Description**  
`POST /auth/apple` with identity token validation per `BACKEND.md`.

---

### GRACE-024 · Google Sign-In server verification

| | |
|---|---|
| **Milestone** | M11 |
| **Priority** | P2 |
| **Lane** | backend |
| **Blocked by** | GRACE-022 |
| **Parallel** | GRACE-023 |

**Description**  
`POST /auth/google` with id token validation.

---

### GRACE-025 · IAP receipt validation & webhooks

| | |
|---|---|
| **Milestone** | M11 |
| **Priority** | P2 |
| **Lane** | backend |
| **Blocked by** | GRACE-023, GRACE-024 |
| **Parallel** | GRACE-026 |

**Description**  
`POST /purchase/validate` + App Store / Play webhooks. Requires EAS dev build.

---

### GRACE-026 · EAS dev build for auth + IAP

| | |
|---|---|
| **Milestone** | M11 |
| **Priority** | P2 |
| **Lane** | mobile |
| **Blocked by** | GRACE-025 |
| **Parallel** | — |

**Description**  
`eas build --profile development` with `expo-apple-authentication`, Google Sign-In, `react-native-iap`.

---

## Dependency graph (Linear blocking)

```
GRACE-001
 ├── GRACE-002 ──┐
 ├── GRACE-003 ──┼── GRACE-005 ── GRACE-006 ── GRACE-007 ──┐
 └── GRACE-004 ──┘         │                    │           │
                           └── GRACE-008 ── GRACE-009 ──┐   │
                                    │         │         │   │
                                    │    GRACE-010      │   │
                                    │    GRACE-011      │   │
                                    └── GRACE-012 ──────┼───┘
                                              │         │
                         GRACE-013 ── GRACE-015 ── GRACE-018
                         GRACE-014 ──────────────┘
                         GRACE-016 (after 011+015)
                         GRACE-017 (after 010+012)
                                              │
                         GRACE-019 ── GRACE-020 ── GRACE-021 ── GRACE-022
                                              │
                         GRACE-023/024 ── GRACE-025 ── GRACE-026 (post-beta)
```

## Critical path (minimum beta)

```
001 → 003 → 005 → 006 → 007 → 008 → 009 → 012 → 013 → 014 → 015 → 019 → 020 → 021 → 022
```

**22 issues** to beta-ready. GRACE-010, 011, 016, 017 are P1 polish (can slip).

## Suggested Linear labels

`backend` · `mobile` · `ops` · `data` · `p0-beta` · `p1-polish` · `p2-post-beta` · `expo-go`

## GitHub sync

Issues also mirrored on GitHub: https://github.com/selveapps/grace-expo/issues

**Linear is source of truth** for blocking relations and project board. Use GRACE-XXX in branch names and PR titles; link both `SEL-XXX` and GitHub `#N` in PR descriptions.
