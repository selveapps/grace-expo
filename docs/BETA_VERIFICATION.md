# Grace Beta Verification Report

**Date:** 2026-07-13  
**Branch:** `backend-dev`  
**API:** `https://grace-api-production.up.railway.app`  
**Tickets:** GRACE-019, GRACE-020, GRACE-021, GRACE-022 (M10)

---

## Automated gates

| Gate | Command | Result |
|------|---------|--------|
| Staging health | `npm run verify:staging` | PASS |
| Staging full API | `npm run verify:staging:full` | **15/15 PASS** |
| Local E2E | `npm run e2e` (from repo root) | **16/16 PASS** |

E2E log: `docs/runs/staging-full-*-<sha>.log` (recorded at commit time)

---

## Verification matrix (BACKEND_ARCHITECTURE §5)

| # | Check | Status | Evidence |
|---|-------|--------|----------|
| 1 | API health | ✅ | `curl /health` → `{"ok":true,"db":true}` |
| 2 | Guest session | ✅ | Staging `POST /auth/guest`; app boot E2E |
| 3 | Profile sync | ✅ | Staging `PATCH /me` + app `profile.js` sync |
| 4 | Chapter read | ✅ | Staging `GET /bible/psalms/23`; app Reading E2E |
| 5 | Save verse | ✅ | Staging `POST/GET/DELETE /saved` |
| 6 | Reflection | ✅ | Staging `POST/GET /reflections` |
| 7 | Daily verse | ✅ | Staging `GET /today/verse`; Today tab E2E |
| 8 | Offline | ⚠️ Partial | Chapter cache works; M9 sync queue not implemented |
| 9 | Beta access | ✅ | Staging `POST /beta/redeem` → `subscribed: true` |
| 10 | Remote tester | 📋 Manual | Procedure in [`BETA_DISTRIBUTION.md`](./BETA_DISTRIBUTION.md) §3–4 |

**Beta-ready:** 9/10 automated ✅ · 1 manual (remote tester QR smoke test)

---

## Known exceptions

| Item | Notes |
|------|-------|
| Offline sync (M9) | Deferred — local AsyncStorage cache only; server wins on reconnect via profile hydrate |
| Apple/Google auth | Mocked in Expo Go — M11 |
| Real IAP | Beta redeem only — M11 |
| Full KJV search | Sample seed (129 verses) on staging — run `seed:prepare:full` before production |

---

## How to re-run

```bash
# API against Railway
cd backend
STAGING_API_URL=https://grace-api-production.up.railway.app npm run verify:staging:full
npm run record:staging:full

# App + local API
cd ..
npm run e2e

# Device beta (maintainer)
cp .env.staging.example .env
npm run start:tunnel
# Share QR — tester completes onboarding
```

---

## References

- [`BETA_DISTRIBUTION.md`](./BETA_DISTRIBUTION.md) — tester handoff
- [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) — deploy & env vars
