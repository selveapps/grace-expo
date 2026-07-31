# Grace — CTO handoff

Everything outstanding between TestFlight **Build 10** and App Store submission.

Current state: the app ships from `feat/tf-v1-feedback` against the **staging**
API. Nothing is deployed to production, `main` has not been merged, and no
production infrastructure has been touched.

Ordered by what blocks review.

---

## 1. Google OAuth client IDs — app code is done, credentials are not

Real OAuth is implemented end-to-end: `expo-auth-session` on the client,
`POST /auth/google` on the API verifying the ID token against Google's JWKS
(RS256, issuer + audience) before trusting any field, reusing the same
guest-migration path as Apple. `googleSub` already exists in the schema, so
**no migration is needed**.

It is inert only because no client IDs exist. Verified behaviour today:
unconfigured → `{"available":false}` and `503`; configured → `available:true`,
forged token → `401`, missing token → `400`.

### Create the clients

1. Google Cloud console → project for Grace.
2. **OAuth consent screen**: External, then Publish. Scopes `openid`, `email`,
   `profile` only — nothing sensitive, so no Google verification review.
3. **Credentials → OAuth client ID**, twice:

| Type | Field | Value |
|---|---|---|
| iOS | Bundle ID | `com.selveapps.grace` |
| Web application | Authorised redirect URI | `https://auth.expo.io/@selveapps/grace` |

### Then set three variables

`eas.json` → `build.<profile>.env` (or EAS secrets):

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<ios>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<web>.apps.googleusercontent.com
```

Railway (API):

```
GOOGLE_CLIENT_IDS=<ios>.apps.googleusercontent.com,<web>.apps.googleusercontent.com
```

Comma separated, no spaces. This is the audience allow-list.

**Two guard rails, deliberate:**
- The keys are *absent* rather than empty — EAS refuses to build on an empty env value.
- `app.config.js` accepts a value only if it ends `.apps.googleusercontent.com`,
  so a placeholder cannot switch on a button that cannot sign anyone in.

No code changes required. Rebuild and the button appears.

---

## 2. Production Railway deployment

**Nothing is deployed to production.** Today:

| Host | What it is |
|---|---|
| `grace-expo-production.up.railway.app` | The **staging** API. Railway project `grace-api-staging`, service `grace-expo` — the hostname reads like the Expo app but serves the API. Healthy, DB connected, current. |
| `grace-api-production.up.railway.app` | An older deployment. **Stale**: v1 Tea copy, no `/auth/google`, no byte-range audio. Do not point a build at it without deploying first. |

### Provision production

Service config is code (`backend/railway.toml`): build `npm run build`,
pre-deploy `npm run migrate`, start `npm start`, healthcheck `/health`.

Required env:

| Variable | Notes |
|---|---|
| `DATABASE_URL` | Production Postgres. Without it `/me`, `/today`, `/verse/for-carrying` and all progress 500. |
| `JWT_SECRET` | New secret for production. Rotating signs everyone out. |
| `APPLE_BUNDLE_ID` | `com.selveapps.grace`. Apple sign-in verification fails without it. |
| `GOOGLE_CLIENT_IDS` | See §1. Empty ⇒ Google button hidden. |
| `CORS_ORIGINS` | Comma separated. |
| `BETA_REDEEM_CODE` | Must match `EXPO_PUBLIC_BETA_REDEEM_CODE`. **Remove once StoreKit lands** (§3). |
| `NODE_ENV` | `production` |
| `ELEVENLABS_API_KEY` | Optional. Only the live-TTS fallback; Tea and Stories play pre-rendered MP3s. |
| `OPENAI_API_KEY` | Optional. Legacy narrative route; nothing calls it. |

### Seed the Bible text

`/verse/for-carrying` and `/bible/*` read `bible_verse`. Staging's table is
incomplete, which is why `Courage` returned Psalm 23:1 until the client learned
to distrust that fallback. Seed production properly:

```
npm run seed:prepare:full && npm run seed:bible
```

Then confirm `GET /verse/for-carrying?tags=Courage` returns **Psalm 27:1-3**, not
Psalm 23:1. If it returns Psalm 23:1 the seed is incomplete.

### Deploy order

The API must ship **before** the app build. Two fixes are server-side and the app
cannot compensate: byte-range audio (without it iOS shows `-0:00` and ±15s does
nothing) and the carry-verse passages.

---

## 3. StoreKit / IAP — the hard App Review blocker

`SubscriptionService.purchase()` calls `POST /beta/redeem`. There is **no
StoreKit transaction**, while the paywall displays $69.99/yr and $12.99/mo.
Guideline 3.1.1 will reject this.

Needed:
1. Paid Apps agreement active in App Store Connect.
2. Two auto-renewable subscriptions created:
   `grace.plus.annual`, `grace.plus.monthly` (IDs already in
   `SubscriptionService.OFFERINGS`), each with a 3-day free trial.
3. A maintained IAP module. `expo-in-app-purchases` is retired and absent from
   SDK 54 — use `expo-iap` or `react-native-iap`.
4. Implement `storeKitPurchase` behind the existing seam. `purchase()` and
   `restore()` already normalise to `{ status }` and the paywall only celebrates
   `trialing`/`active`, so the UI needs no change.
5. Server-side receipt validation via `POST /purchase/validate`; entitlement must
   be re-read from `GET /me`, never trusted from the client.
6. Remove the beta redeem path and `BETA_REDEEM_CODE`.

**Also decide before submission:** the paywall footer line
`$69.99/year after a 3-day free trial. Cancel anytime.` was removed on request.
Price/period remain on the plan cards and the trial timeline, with full renewal
terms under *Details* — arguably 3.1.2 compliant, but it is a known risk area.
Restore by re-adding `SUMMARY[plan]` in `PaywallScreen.js`.

---

## 4. App Review metadata

| Item | Status |
|---|---|
| App name | `Grace` (home screen) / `Grace: Bible BFF for Women` (listing) |
| Bundle ID | `com.selveapps.grace` |
| ASC App ID | `6792872214` |
| Team | `KPNKS58Y7T` — Selve App Studio LLP |
| Icon | ✅ `GraceIconV4.png`, 1024×1024, opaque |
| Subtitle, description, keywords | ❌ To write |
| Support + marketing URL | ❌ To confirm |
| Age rating | ❌ To complete. Some Tea content is frank (violence, sex work, adultery) — answer honestly |
| Category | ❌ Suggest Lifestyle or Reference |
| Export compliance | ✅ `ITSAppUsesNonExemptEncryption: false` set |

### Screenshots

Required 6.7" and 6.5". Suggested set, all real screens:
Today · Tea list · Tea detail mid-caption · Story player · Reading (Psalms) · Paywall.

### Review account

Reviewers **cannot get past the auth gate without one** — Skip was deliberately
removed. Provide either a demo Apple ID, or an email-path address plus a note
that "Continue with email" needs no password. **Do not ship without this.**

### Privacy

- Policy and terms live in `src/legal.js`; confirm both URLs are live and current.
- App Privacy questionnaire (nutrition label) still to complete. The app collects
  name, email, and usage/progress; declare accordingly.
- Account deletion is implemented in-app (5.1.1(v)) ✅.

---

## 5. Not yet integrated

| Area | Status | Notes |
|---|---|---|
| Analytics | ❌ None | No SDK. Pick one and instrument onboarding funnel, paywall conversion, Tea plays/completions. |
| Crash reporting | ❌ None | Sentry or Crashlytics. **Recommend before wide TestFlight** — today a crash is invisible. |
| Push notifications | ⚠️ Partial | `NotificationService` handles local reminders; no push credentials, no APNs key, no server-side sending. Reminders work; remote push does not exist. |

---

## 6. Remaining backend work

1. **Tea audio — 10 clips outstanding.** 20 of 30 are the new voice-note style.
   The ElevenLabs quota fell 6,338 characters short. Quota resets 29 Aug 2026, or
   top up. To finish:
   `cd backend && ONLY=<id> npx tsx --env-file-if-exists=.env scripts/generate-audio.ts`
   for each of `priscilla-teach`, `sarah-laugh`, `hagar-seen`, `zelophehad`,
   `huldah-scroll`, `widow-mite`, `joanna-fund`, `dorcas-needle`,
   `phoebe-letter`, `mary-perfume` — then `npm run sync:durations`. Their catalog
   text must be updated **in the same pass** or captions will drift.
2. **Story content.** Only 5 stories; `Jesus' Parables` is empty and no
   collection reaches 10. A 26-story plan with a verified coverage matrix and
   costings is ready and unstarted.
3. **Audio hosting.** ~79 MB of MP3s are committed to git. Fine now, but move to
   a CDN/object storage before the catalogue grows.
4. **Tea artwork.** Drawn vector motifs; `/img/tea/*.jpg` 404s by design. Drop
   real stills into `backend/public/img/tea/` and they light up with no code
   change.

---

## 7. Production rollout

1. Merge `feat/tf-v1-feedback` → `main` (not done; explicitly out of scope so far).
2. Provision production Railway + Postgres; set env (§2); seed the Bible text.
3. Deploy the API to production and smoke it:
   ```bash
   API=https://<production-host>
   curl -s $API/health                              # {"ok":true,"db":true}
   curl -s $API/auth/google/available                # {"available":true}
   curl -s "$API/verse/for-carrying?tags=Courage"    # Psalm 27:1-3
   curl -sD- -o /dev/null -H 'Range: bytes=0-1' \
     $API/audio/tea-vashti-no.mp3                    # 206 + Content-Range
   ```
   A `200` instead of `206` means the deploy is stale and the player will regress
   to `-0:00`.
4. Point `eas.json` → `build.production.env.EXPO_PUBLIC_API_BASE` at the
   production host and add the two Google keys.
5. Land StoreKit (§3) and verify a sandbox purchase and a restore.
6. `eas build --profile production` → `eas submit`.
7. Run `TESTFLIGHT_CHECKLIST.md` against the production build.
8. Complete metadata, screenshots, privacy answers, review account (§4).
9. Submit.

---

## Quick reference

| | |
|---|---|
| Branch | `feat/tf-v1-feedback` |
| Staging API | `https://grace-expo-production.up.railway.app` |
| Railway project | `grace-api-staging` / service `grace-expo` (auto-deploys on push) |
| EAS project | `0683c24c-9b77-4f1e-a9ec-54d6105dcb0c` |
| Expo account | `selveapps` |
| Latest build | 10 (staging profile) |
| Docs | `docs/RELEASE_NOTES_BUILD_10.md`, `docs/INFLUENCER_BUILD_READINESS.md`, `docs/TEA_SCRIPTS.md`, `TESTFLIGHT_CHECKLIST.md` |
