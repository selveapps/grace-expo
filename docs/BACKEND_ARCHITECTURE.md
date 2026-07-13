# Grace Backend — Architecture & Milestone Plan

**Goal:** Ship a **fully functional prototype** where the Expo app talks to a **real deployed backend**, distributable to beta testers via **Expo Go** (QR / `exp://` link).

**Source spec:** [`BACKEND.md`](../BACKEND.md)  
**App seam:** [`src/services/`](../src/services/) — swap implementations without touching screens.

---

## 1. Constraints that shape the plan

### Expo Go beta (in scope for v1 prototype)

| Capability | Expo Go | Approach for beta |
|------------|---------|-------------------|
| HTTP API calls | ✅ | Primary integration path |
| AsyncStorage offline cache | ✅ | Keep as local cache; server is source of truth when online |
| Guest / anonymous session | ✅ | Device-scoped guest JWT (no native modules) |
| Email sign-in UI | ✅ (mocked today) | Optional: magic-link or PIN via backend email |
| Apple / Google Sign-In | ❌ native | **Defer** to dev-build milestone (post-beta) |
| Real IAP / StoreKit | ❌ native | **Defer**; beta uses server-granted `subscribed` or invite codes |

### Out of scope for beta prototype (explicit deferrals)

- App Store / Play receipt validation and webhooks
- Apple/Google token verification (real OAuth)
- Licensed translations (ESV/NIV) — use **KJV/WEB** (public domain)
- Production hardening (rate limits, WAF, multi-region) — staging-grade only

---

## 2. Target architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Expo Go app (grace-expo)                                   │
│  ┌─────────────┐   ┌──────────────────────────────────────┐ │
│  │ Screens     │──▶│ src/services/*  (interface layer)    │ │
│  └─────────────┘   └──────────────┬───────────────────────┘ │
│                                   │                         │
│                    ┌──────────────▼───────────────┐         │
│                    │ src/api/client.js            │         │
│                    │  API_BASE + JWT + retry      │         │
│                    └──────────────┬───────────────┘         │
│         AsyncStorage cache ◀──────┴──────▶ sync on login    │
└───────────────────────────────────┬─────────────────────────┘
                                    │ HTTPS
┌───────────────────────────────────▼─────────────────────────┐
│  grace-api (Node 20 + TypeScript + Fastify)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐ │
│  │ /health  │ │ /auth/*  │ │ /me …    │ │ /bible/*    │ │
│  └──────────┘ └──────────┘ └──────────┘ └─────────────┘ │
│                          │                                │
│                    ┌─────▼─────┐                          │
│                    │ Postgres  │                          │
│                    │ + FTS idx │                          │
│                    └───────────┘                          │
└───────────────────────────────────────────────────────────┘
         Deployed: Railway Hobby (HTTPS, always-on, integrated Postgres)
```

**Repo layout (proposed):**

```
grace-expo/                 # mobile app (this repo)
├── src/                    # existing app
├── docs/
│   ├── BACKEND_ARCHITECTURE.md   # this file
│   └── BACKEND.md                # original API spec
└── backend/                # NEW — API service (M1)
    ├── src/
    ├── prisma/ or drizzle/
    ├── scripts/seed-bible.ts
    └── package.json
```

---

## 3. Milestones

Each milestone is **independently testable**. "Done" includes a verification command or checklist.

### M0 — Planning & branch hygiene

| Item | Detail |
|------|--------|
| Deliverable | This doc + git worktree rule |
| Verify | `git worktree list` shows `backend-dev`; doc reviewed |

**Status:** ✅ Done on branch `backend-dev` (`b4288c6`). See [`LINEAR_ISSUES.md`](./LINEAR_ISSUES.md) GRACE-001.

---

### M1 — API scaffold

| Item | Detail |
|------|--------|
| Deliverable | `backend/` package: Fastify + TypeScript + `GET /health` |
| Verify | `curl http://localhost:3000/health` → `{ "ok": true }`; Railway deploy per `RAILWAY_DEPLOYMENT.md` |
| Depends on | M0 |

**Status:** ✅ Scaffold landed on `backend-dev`. Deploy guide: [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md).

**Parallel with:** M2 (schema can start now).

---

### M2 — Database schema & migrations

| Item | Detail |
|------|--------|
| Deliverable | Postgres tables per `BACKEND.md` §2 + `guest_device_id` column on `user` for Expo Go auth |
| Verify | `npm run migrate` succeeds; `\dt` shows all tables; integration test inserts + reads a row |
| Depends on | M1 (folder layout) |

**Tables:** `user`, `profile`, `saved_verse`, `reflection`, `subscription`, `reading_progress`, `bible_verse` (for search).

**Status:** ✅ Done. Migration `20260713204416_init`; integration tests pass.

---

### M3 — Scripture data layer

| Item | Detail |
|------|--------|
| Deliverable | Seed KJV (or WEB) into `bible_verse`; public endpoints: |
| | `GET /bible/:book/:chapter` |
| | `GET /bible/passage?ref=` |
| | `GET /today/verse` |
| | `GET /verse/for-carrying?tags=` |
| Verify | `curl /bible/psalms/23` returns 6 verses; passage ref matches app shape `{ reference, verses: [{n,t}] }`; daily verse stable per UTC day |
| Depends on | M2 |

**Status:** ✅ HTTP routes done (sample seed). Full canon + search index still pending for beta search.

**Parallel with:** M4, M5 (no auth required for public bible routes).

---

### M4 — Guest auth (Expo Go–compatible)

| Item | Detail |
|------|--------|
| Deliverable | `POST /auth/guest { deviceId }` → JWT; `POST /auth/refresh`; middleware validates Bearer token |
| Verify | Postman/curl: guest login → use JWT on `GET /me` → 401 without token |
| Depends on | M1, M2 |

**Status:** ✅ Done. `jose` HS256; `GET /me` read-only (full PATCH in M5).

**Note:** `deviceId` = stable UUID generated on first launch (`expo-application` or stored UUID). No native auth modules.

**Parallel with:** M3, M5.

---

### M5 — Profile & library CRUD

| Item | Detail |
|------|--------|
| Deliverable | Authed routes: `GET/PATCH /me`, `GET/POST/DELETE /saved`, `GET/POST /reflections`, `GET/PUT /progress` |
| Verify | Integration tests: create guest → patch name → save verse → list saved → delete; data persists across token refresh |
| Depends on | M4 |

---

### M6 — Scripture search

| Item | Detail |
|------|--------|
| Deliverable | `GET /bible/search?q=` → `{ ot: [...], nt: [...] }` via Postgres full-text or trigram index |
| Verify | `?q=peace` returns grouped OT/NT hits; empty query returns `{ ot: [], nt: [] }`; latency < 500ms on seed data |
| Depends on | M3 |

**Status:** ✅ Done on `backend-dev`. ILIKE search on sample seed; full KJV + FTS index optional before production search scale.

**Parallel with:** M5 after M4 is done.

---

### M7 — Beta entitlement (no real IAP)

| Item | Detail |
|------|--------|
| Deliverable | `subscription` row + `GET /me` exposes `profile.subscribed`; optional `POST /beta/redeem { code }` |
| Verify | Redeem code → `subscribed: true`; expired trial flips to `expired`; paywall reads server state |
| Depends on | M5 |

**Status:** ✅ Done on `backend-dev`. `BETA_REDEEM_CODE` on Railway; 3-day `trialing` expiry on `GET /me`.

**Expo Go:** Client calls redeem or server auto-grants beta cohort — no StoreKit.

---

### M8 — App client wiring

| Item | Detail |
|------|--------|
| Deliverable | `src/api/client.js`; env `EXPO_PUBLIC_API_BASE`; services call API instead of mocks/local-only |
| | `AuthService` → guest JWT flow |
| | `ReadingService.getChapter` → `/bible/...` with AsyncStorage fallback |
| | `profile.js` hydrates from `GET /me` on boot when token exists; mirrors writes |
| Verify | Expo Go: onboarding → save verse → kill app → relaunch → verse still on server (second device optional) |
| Depends on | M3, M4, M5 (M6, M7 optional for first wire-up) |

---

### M9 — Offline sync & conflict policy

| Item | Detail |
|------|--------|
| Deliverable | Documented rule: **server wins** on login hydrate; local queue for writes when offline; replay on reconnect |
| Verify | Airplane mode: save verse locally → online: syncs to server; `GET /saved` matches device |
| Depends on | M8 |

---

### M10 — Staging deploy & beta distribution

| Item | Detail |
|------|--------|
| Deliverable | HTTPS API on Fly/Render/Railway; `EXPO_PUBLIC_API_BASE` in EAS/env; `npx expo start --tunnel` for remote testers |
| Verify | Tester outside LAN opens Expo Go link → app loads → `GET /health` from device network succeeds |
| Depends on | M1–M8 minimum |

**Beta handoff artifact:** README section with QR instructions + known Expo Go limitations.

---

### M11 — Real OAuth + IAP (post–Expo Go beta)

| Item | Detail |
|------|--------|
| Deliverable | `/auth/apple`, `/auth/google`, `/purchase/validate`, webhooks per `BACKEND.md` |
| Verify | EAS dev build: real sign-in + purchase updates `subscription.status` |
| Depends on | M10 + `eas build --profile development` |

**Not required for Expo Go beta.**

---

## 4. Parallel work lanes

```
Week / lane     A: Backend API          B: Scripture data       C: Mobile wiring        D: Ops
─────────────────────────────────────────────────────────────────────────────────────────────
Early           M1 scaffold             (prep KJV seed file)    —                       pick host + Postgres
                M2 schema               M3 seed + endpoints       —                       —
Mid             M4 guest auth           M6 search index           M8 client.js (stub)     M10 deploy skeleton
                M5 CRUD                 —                         M8 service swaps        env vars
Late            M7 beta entitlement     —                         M9 offline sync         M10 tunnel + beta doc
Post-beta       M11 OAuth + IAP         —                         dev build               production
```

**Safe parallel pairs:**

| Track 1 | Track 2 | Why |
|---------|---------|-----|
| M3 bible endpoints | M4 guest auth | No shared code; different routers |
| M6 search | M8 app wiring | Search is additive; app can ship without it first |
| M2 migrations | KJV seed script authoring | Schema + data prep are independent until seed runs |
| M10 deploy | M8 app wiring | Deploy URL can be placeholder until integration tests pass locally |

**Sequential gates (do not skip):**

1. M4 before M5 (auth middleware)
2. M3 before M8 bible calls
3. M5 before M9 (sync needs server CRUD)
4. M8 before M10 beta handoff

---

## 5. Verification matrix (beta-ready definition)

Beta-ready = all rows ✅:

| # | Check | How to verify |
|---|-------|---------------|
| 1 | API health | `curl $API_BASE/health` |
| 2 | Guest session | Fresh install → auto guest → JWT in storage |
| 3 | Profile sync | Change name in onboarding → `GET /me` shows name |
| 4 | Chapter read | Open Psalms 23 → text from your API (not bible-api.com) |
| 5 | Save verse | Save in reader → `GET /saved` includes it |
| 6 | Reflection | Add reflection → persists after restart |
| 7 | Daily verse | Today tab matches `GET /today/verse` |
| 8 | Offline | Cached chapter loads offline; sync on reconnect |
| 9 | Beta access | Paywall / premium state reflects server `subscribed` |
| 10 | Remote tester | Non-dev phone via Expo tunnel reaches API |

---

## 6. Locked decisions

| Decision | Choice | Notes |
|----------|--------|-------|
| **Backend host** | **Railway Hobby** | ~$5/mo; always-on; no cold starts. See [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) |
| **Auth (beta)** | Guest + email magic link | Expo Go compatible; real OAuth deferred to M11 |
| **Premium (beta)** | Beta redeem codes | `POST /beta/redeem`; no StoreKit in Expo Go |
| **Search** | Required for beta | GRACE-010 on critical path |
| **Translation** | KJV only | Public domain; WEB optional later |
| **Monorepo** | `grace-expo/backend/` | Same repo, Railway root dir `backend/` |

---

## 7. Suggested implementation order (critical path)

```
M0 → M1 → M2 → M3 → M4 → M5 → M8 → M9 → M10
              ↘ M6 (parallel)
              ↘ M7 (after M5)
```

**Estimated critical path for Expo Go beta:** M0–M5 + M8 + M10 (M6/M7 can slip if needed).

---

## 8. References

- [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) — Railway Hobby setup & env vars
- [`BACKEND.md`](../BACKEND.md) — canonical HTTP contract
- [`LINEAR_ISSUES.md`](./LINEAR_ISSUES.md) — Linear/GitHub issue backlog (GRACE-001–026)
- [`src/services/index.js`](../src/services/index.js) — app integration seam
- [`src/api/bible.js`](../src/api/bible.js) — current scripture client (to be replaced)
