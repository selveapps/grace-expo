# Surprises Log

Append-only. Counter-intuitive discoveries from agentic builds.
Format: **Context → Assumed → Actual → Prevention**

---

## 2026-07-13 — Profile has no `name` field

**Context:** Phase 1 integration test — user + profile roundtrip  
**Assumed:** `name` lives on `Profile` (mirrors onboarding UI mental model)  
**Actual:** `name` is on `User`; `Profile` has `carrying`, `gentleness`, `rhythm`, `onboarded`, `subscribed`  
**Prevention:** Prisma skill documents schema; test uses `User.name`

---

## 2026-07-13 — Fastify route imports use parent-relative paths

**Context:** `backend/src/routes/health.ts` imports `checkDatabase`  
**Assumed:** `./db.js` (same folder as route)  
**Actual:** `db.ts` lives in `src/`, routes in `src/routes/` → `../db.js`  
**Prevention:** Fastify skill notes ESM layout; `tsc` catches at build step in verify script

---

## 2026-07-13 — TypeScript ESM requires `.js` extensions in imports

**Context:** `backend/` uses `"type": "module"`  
**Assumed:** `import from './db'` works like CommonJS  
**Actual:** Must use `'./db.js'` even for `.ts` source files  
**Prevention:** Documented in fastify skill; match existing `index.ts` import style

---

## 2026-07-13 — Docker must be running before E2E

**Context:** `verify-phase1.sh` step [1/7]  
**Assumed:** `docker compose up` succeeds headless  
**Actual:** Docker Desktop not running → compose fails silently until started  
**Prevention:** verify script uses `--wait`; document `open -a Docker` on macOS in docker-postgres skill

---

## 2026-07-13 — `migrate dev` vs `migrate deploy`

**Context:** E2E verification pipeline  
**Assumed:** Same command for dev and CI  
**Actual:** `migrate dev` creates migrations interactively; E2E/CI uses `migrate deploy` (apply only)  
**Prevention:** Prisma skill lists both; verify script uses `deploy`

---

## 2026-07-13 — `railway run` uses internal Postgres hostname locally

**Context:** Seeding staging DB after deploy  
**Assumed:** `railway run npm run seed:bible` works from local machine  
**Actual:** Injected `DATABASE_URL` points to `postgres.railway.internal` — only reachable inside Railway network  
**Prevention:** Use `DATABASE_PUBLIC_URL` for local→staging ops, or `railway ssh` (requires registered SSH key)

---

## 2026-07-13 — `curl -f` hides HTTP 401 status in verify scripts

**Context:** `verify-phase2.sh` checking `GET /me` without token  
**Assumed:** `curl -sf -w "%{http_code}"` returns `401`  
**Actual:** `-f` (--fail) makes curl exit non-zero on 4xx; output empty → script saw `000`  
**Prevention:** Use `curl -s` (no `-f`) when asserting HTTP status codes; documented in jose skill

---

## 2026-07-13 — Git branch rename ≠ worktree folder rename

**Context:** Renamed `sid` → `backend-dev`  
**Assumed:** Worktree path `grace-expo-sid/` would rename too  
**Actual:** Only branch name changes; folder name is independent  
**Prevention:** git-worktrees rule documents path/branch mapping explicitly
