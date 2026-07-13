# Lab Notebook — Grace Expo Backend Build

**Purpose:** Session-level reproducibility log. Complements `CHANGELOG.md` (milestones), `DECISIONS.md` (rationale), `SURPRISES.md` (failures).

Update this file **during** work, not after — like a lab notebook, not a retrospective.

---

## Entry format

```
### RUN-NNN | YYYY-MM-DD HH:MM UTC±X | agent session
**Objective:** …
**Environment:** branch, commit, DB target
**Procedure:** numbered steps (exact commands)
**Observations:** raw outputs, counts, errors
**Result:** pass/fail + artifact (commit SHA, URL)
**Follow-up:** next RUN or ticket
```

---

### RUN-001 | 2026-07-13 | Phase 1 foundation

**Objective:** SEL-6,7,8,9 — local Postgres, schema, sample seed, `/health`, E2E gate.

**Environment:**
- Branch: `backend-dev`
- DB: `postgresql://grace:grace@localhost:5433/grace` (Docker)
- Commit baseline: `8dfa1fd` (scaffold)

**Procedure:**
1. `docker compose up -d --wait`
2. `npx prisma migrate dev --name init`
3. `npm run seed:prepare && npm run seed:bible`
4. `npm test`
5. `./scripts/verify-phase1.sh`

**Observations:**
- Initial test failure: `Profile.name` invalid (schema has `User.name`)
- Initial build failure: `health.ts` imported `./db.js` not `../db.js`
- After fixes: verify **9/9 pass**

**Result:** PASS → commit `8a2541d`

**Follow-up:** RUN-002 Railway staging

---

### RUN-002 | 2026-07-13 | Railway staging provision

**Objective:** SEL-6 staging Postgres + deployed API (SEL-21 partial).

**Environment:**
- Railway account: `admin@selveapps.xyz`
- Project: `grace-api-staging` (`d8bf7ae3-bdaf-4500-924c-9f5ef36e652a`)
- CLI: `railway 5.26.1`

**Procedure:**
1. `railway login` (browser flow)
2. `railway init --name grace-api-staging`
3. `railway add --database postgres`
4. `railway add --service grace-api`
5. `railway variable set` → `DATABASE_URL=${{Postgres.DATABASE_URL}}`, `JWT_SECRET`, `CORS_ORIGINS=*`
6. `railway domain --service grace-api`
7. `railway up --service grace-api --detach`
8. Seed via `DATABASE_PUBLIC_URL` (not `railway run` — see SURPRISES.md)
9. `STAGING_API_URL=... npm run verify:staging`

**Observations:**
- Browserless login timed out; browser login succeeded
- Deploy URL: `https://grace-api-production.up.railway.app`
- Health: `{"ok":true,"db":true}`
- Migration applied in preDeploy logs
- Sample seed: 129 verses on staging

**Result:** PASS → commits `e07c3a7`, `2b968ae`

**Follow-up:** RUN-003 Phase 2 scripture + auth

---

### RUN-003 | 2026-07-13 | Phase 2 implementation (in progress)

**Objective:** GRACE-007 / SEL-12 scripture HTTP + GRACE-008 / SEL-10 guest JWT.

**Environment:**
- Branch: `backend-dev` @ `2b968ae`
- Local DB: Docker `:5433` (129 verses)
- Staging: `grace-api-production.up.railway.app`
- New dependency: `jose@^6` (JWT)

**Procedure:**
1. Add `src/lib/{books,passageRef,scriptureMeta,jwt}.ts`
2. Add `src/services/{bibleService,authService}.ts`
3. Add `src/routes/{bible,auth,me}.ts` + `src/middleware/auth.ts`
4. Extract `src/app.ts` for testability
5. `test/phase2.integration.test.ts`
6. `scripts/verify-phase2.sh`
7. `npm run verify:phase2`

**Design notes (see DEC-006, DEC-007):**
- Scripture metadata duplicated from `src/api/bible.js` intentionally — document sync obligation
- `GET /me` read-only in Phase 2 to prove 401/200 auth gate (full CRUD = Phase 3)

**Observations:**
- `npm test` → 14/14 pass (4 phase1 + 10 phase2)
- `verify-phase2.sh` initial fail: `curl -sf` on `/me` without token returned empty (not 401) — fixed to `curl -s`
- Scripture sample outputs: Psalm 23 (6 verses), John 3:16, Philippians 4:6-7 for `tags=Worry`
- Auth: guest upsert by `guestDeviceId`; same device → same `user.id`; refresh rotates tokens

**Result:** PASS → commit pending

**Follow-up:** RUN-004 deploy Phase 2 to Railway; RUN-005 Phase 3 CRUD

---

### RUN-004 | 2026-07-13 | Deploy Phase 2 to Railway

**Objective:** Staging serves scripture + auth routes after Phase 2 code push.

**Environment:**
- URL: `https://grace-api-production.up.railway.app`
- Command: `railway up --service grace-api --detach` from `backend/`

**Procedure:**
1. `railway up --service grace-api --detach`
2. Wait ~90s for build + preDeploy migrate
3. `curl /health` and `curl /bible/psalms/23`

**Observations:**
- Health: `{"ok":true,"db":true}`
- Psalms 23: 6 verses on staging (sample seed from RUN-002)

**Result:** PASS

**Follow-up:** RUN-005 Phase 3 CRUD; wire Expo app (M8)

---

### RUN-005 | 2026-07-13 | Recorded E2E transcripts (infrastructure)

**Objective:** Make E2E runs reproducible like supplementary data — full stdout + environment header.

**Environment:**
- Commit: `1df5852` (Phase 2)
- Script: `backend/scripts/record-e2e.sh`

**Procedure:**
1. `cd backend && npm run record:phase2`
2. `cd backend && npm run record:staging`

**Observations:**
- `docs/runs/phase2-20260713T214952Z-1df5852.log` → exit 0, 13/13 checks
- `docs/runs/staging-20260713T215020Z-1df5852.log` → exit 0, health `db:true`

**Result:** PASS — recording infrastructure validated

**Follow-up:** RUN-006 Phase 3; always `record:phaseN` before milestone commit
