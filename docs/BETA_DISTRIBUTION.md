# Grace Expo Go — Beta Distribution Playbook

**Milestone:** M10 (GRACE-021)  
**API:** `https://grace-api-production.up.railway.app`  
**Branch:** `backend-dev`

---

## Who this is for

- **Maintainers** — ship a beta build to testers
- **Testers** — open Grace in Expo Go without Xcode

---

## Prerequisites (maintainer)

| Item | Detail |
|------|--------|
| Node 20+ | `node -v` |
| Expo account | [expo.dev](https://expo.dev) (free) |
| Expo Go app | Testers install from App Store / Play Store |
| Railway API | Already live — see [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) |

---

## 1. Configure staging API

```bash
cd grace-expo-sid   # or your clone of grace-expo on backend-dev
cp .env.staging.example .env
```

`.env` should contain:

```
EXPO_PUBLIC_API_BASE=https://grace-api-production.up.railway.app
EXPO_PUBLIC_BETA_REDEEM_CODE=grace-beta
```

> **Local dev only:** use `EXPO_PUBLIC_API_BASE=http://localhost:3000` and run `cd backend && npm run dev`.

---

## 2. Verify staging API (before sharing)

```bash
cd backend
STAGING_API_URL=https://grace-api-production.up.railway.app npm run verify:staging:full
# Expect: Staging full verify: PASS (12/12)
```

Record the run (optional, for reproducibility):

```bash
npm run record:staging:full
```

---

## 3. Start Expo tunnel (remote testers)

```bash
cd ..   # repo root (mobile app)
npm install
npx expo start --tunnel
```

`--tunnel` exposes Metro through ngrok so testers on LTE/Wi‑Fi (not your LAN) can load the bundle.

**Share:** QR code from the terminal or Expo Dev Tools in the browser.

---

## 4. Tester instructions (send verbatim)

1. Install **Expo Go** on your iPhone or Android.
2. Open the QR link the maintainer sends (or scan the QR in the terminal).
3. Wait for Grace to load (~30s first time).
4. Complete onboarding: name → intentions → paywall → **Start 3-day free trial**.
5. Open **Reading** → tap **Continue Reading** → Psalm 23 should load.
6. Try **Search scripture** → search `peace` → tap a result.
7. Your data is saved on our server — reinstalling Expo Go and re-opening should restore your profile.

**Beta redeem code** (if paywall asks): `grace-beta` — already wired in the app for Expo Go.

---

## 5. Known Expo Go limitations

| Feature | Expo Go | Dev / production build |
|---------|---------|------------------------|
| Apple Sign-In | Mocked UI only | Real (`expo-apple-authentication`) |
| Google Sign-In | Mocked UI only | Real (native module) |
| In-app purchase | `POST /beta/redeem` | StoreKit / RevenueCat |
| Push notifications | Limited | Full `expo-notifications` |
| Offline sync queue | Local cache only | M9 durable queue |

These are expected for beta — not bugs.

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| "Network error" on scripture | Check `curl $STAGING_API_URL/health` — redeploy if down |
| Paywall redeem fails | Confirm `BETA_REDEEM_CODE` on Railway matches app env |
| QR won't load | Use `--tunnel`; ensure tester has internet |
| Stuck on splash | Force-close Expo Go, rescan QR |
| Old bundle cached | Shake device → Reload, or `npx expo start --tunnel --clear` |

---

## 7. Maintainer deploy checklist

```bash
cd backend
railway up --service grace-api --detach   # deploy latest API
STAGING_API_URL=https://grace-api-production.up.railway.app npm run verify:staging:full
```

Then start tunnel and share QR.

---

## References

- [`RAILWAY_DEPLOYMENT.md`](./RAILWAY_DEPLOYMENT.md) — hosting & env vars
- [`BETA_VERIFICATION.md`](./BETA_VERIFICATION.md) — beta-ready checklist results
- [`BACKEND_ARCHITECTURE.md`](./BACKEND_ARCHITECTURE.md) §5 — verification matrix
