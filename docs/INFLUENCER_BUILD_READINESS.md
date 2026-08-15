# Influencer TestFlight — build readiness

Track B of the v5 pass. Everything here is preparation: nothing in this document
has been deployed, submitted or merged.

Target build contents:

- improved Tea scripts + approved new Tea audio (Track A — awaiting approval)
- live captions synced to that audio
- current Tea visual design
- Google auth working
- latest staging backend

Out of scope for this build unless they block it: collection content (the
26-story render) and StoreKit.

---

## 1. Google OAuth — client setup

Code is complete on both sides. It cannot run until these client IDs exist,
because only you can create them in Google Cloud.

### 1a. Google Cloud console

1. <https://console.cloud.google.com> → create (or pick) a project for Grace.
2. **APIs & Services → OAuth consent screen**
   - User type: **External**, then **Publish** (in Testing mode only
     allow-listed accounts can sign in — fine for influencers, but add each
     tester's Google account under *Test users* if you leave it in Testing).
   - App name `Grace`, support email, developer email.
   - Scopes: `openid`, `email`, `profile` only. Nothing else is requested, so
     the consent screen stays trivial and no Google verification review is
     triggered.
3. **APIs & Services → Credentials → Create credentials → OAuth client ID**,
   twice:

   | Type | Field | Value |
   |---|---|---|
   | **iOS** | Bundle ID | `com.selveapps.grace` |
   | **Web application** | Authorised redirect URI | `https://auth.expo.io/@selveapps/grace` |

   The iOS client is what the TestFlight/App Store build uses. The Web client is
   what Expo Go uses via its auth proxy — you only need it if you want Google
   sign-in to work while developing in Expo Go.

### 1b. App-side env (EAS) — drop-in for the CTO

Add these two keys to `build.staging.env` (and `build.production.env`) in
`eas.json`, or set them as EAS project secrets:

```
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=<iOS client id>.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=<Web client id>.apps.googleusercontent.com
```

Nothing else changes. `app.config.js` already reads both and exposes them via
`expoConfig.extra`; `AuthService` already picks iOS vs web by platform.

Two guard rails worth knowing:
- The keys are deliberately **absent** rather than empty, because EAS rejects
  an empty env value and refuses to build.
- `app.config.js` accepts a value only if it ends in
  `.apps.googleusercontent.com`. A placeholder left in by mistake is treated as
  unset, so it can never light up a Google button that cannot sign anyone in.

### 1c. API-side env (Railway)

```
GOOGLE_CLIENT_IDS=<iOS client id>.apps.googleusercontent.com,<Web client id>.apps.googleusercontent.com
```

Comma separated, **no spaces**. This is the audience allow-list that
`POST /auth/google` verifies the ID token against. An ID token minted for any
other client is rejected.

### 1d. Behaviour when unset

Deliberate and already verified: the app asks `GET /auth/google/available` and
**hides the Google button entirely** rather than offering a sign-in that cannot
complete. So a missing client ID degrades to "no Google button", never to a
broken one or a fake success.

---

## 2. Staging Railway environment

Service `grace-api` (config-as-code lives in `backend/railway.toml`; build
`npm run build`, pre-deploy `npm run migrate`, start `npm start`, healthcheck
`/health`).

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **yes** | Railway Postgres. Without it `/me`, `/today`, `/verse/for-carrying` and all progress 500. |
| `JWT_SECRET` | **yes** | Sessions. Rotating it signs everyone out. |
| `APPLE_BUNDLE_ID` | **yes** | `com.selveapps.grace`. Apple sign-in verification fails without it. |
| `GOOGLE_CLIENT_IDS` | **yes for this build** | See 1c. Empty ⇒ Google button hidden. |
| `CORS_ORIGINS` | yes | Comma separated. |
| `BETA_REDEEM_CODE` | yes | Must match `EXPO_PUBLIC_BETA_REDEEM_CODE`, currently `grace-beta`. |
| `ELEVENLABS_API_KEY` | optional | Only for the *live* TTS fallback. Tea and stories play from pre-rendered MP3s, so the influencer build does not need it at runtime. |
| `OPENAI_API_KEY` | optional | Legacy narrative route; nothing in the app calls it. |
| `NODE_ENV` | yes | `production`. |

### Database seeding

`/verse/for-carrying` and `/bible/*` read `bible_verse`. If staging's DB is
empty the app still works (it falls back to bible-api.com) but every verse takes
the slow path. Seed with:

```
npm run seed:prepare && npm run seed:bible
```

---

## 3. Backend deploy plan

The API **must** ship before the app build, because two v4/v5 fixes are
server-side and the app cannot compensate for them:

1. **Byte-range audio** (`/audio/:filename`). Without it iOS AVFoundation treats
   every clip as non-seekable: the player shows `-0:00` and ±15s does nothing.
   This is the single most visible regression if the API is stale.
2. **Detailed carry verses** (`scriptureMeta.ts`). Without it onboarding hands
   out Psalm 23:1 again.
3. `POST /auth/google` + `GET /auth/google/available` — the Google button stays
   hidden until this is live.

Order:

1. Set env from §2 (including `GOOGLE_CLIENT_IDS`).
2. Deploy `grace-api` staging from this branch.
3. Migrations run automatically via `preDeployCommand`.
4. Smoke the API (§4a).
5. Only then cut the EAS build.

Nothing here is production. Production deploy and `main` merge are explicitly
out of scope.

### Staging host — corrected

An earlier draft of this document called `eas.json` →
`build.staging.env.EXPO_PUBLIC_API_BASE` a misconfiguration. **That was wrong**,
and the correction matters if anyone acts on the old note.

`https://grace-expo-production.up.railway.app` IS the staging API. The Railway
service is named `grace-expo` but it lives in the project `grace-api-staging`,
so the hostname reads like the Expo app while actually serving the API. It
returns `{"ok":true,"db":true}` and is the host the staging profile should use.
No change needed.

`grace-api-production.up.railway.app` is a separate, older deployment and is
**stale** — no `/auth/google`, v1 Tea copy, no byte-range audio. Do not point a
build at it without deploying to it first.

Staging deploys automatically from `feat/tf-v1-feedback` on push, and takes
about a minute.

---

## 4. Verification

### 4a. API smoke (run against the deployed staging host)

```bash
API=https://<staging-api-host>

curl -s $API/health
curl -s $API/auth/google/available            # expect {"available":true}
curl -s "$API/verse/for-carrying?tags=Courage" # expect Psalm 27:1-3, multi-verse
curl -s $API/tea | head -c 200                 # expect cardTitle on every tea
curl -sD- -o /dev/null -H 'Range: bytes=0-1' \
  $API/audio/tea-vashti-no.mp3                 # expect 206 + Content-Range
```

The last one is the audio fix. A `200` instead of `206` means the deploy is
stale and the player will regress to `-0:00`.

### 4b. Auth verification (on device, TestFlight)

| Case | Expected |
|---|---|
| Continue with Apple | Real Apple sheet → lands on Preparing → paywall |
| Continue with Google | Google consent screen → lands on Preparing → paywall |
| Cancel either sheet | Stays on the gate, **no** error message |
| Airplane mode, then tap | Clear error + **Try again**; onboarding not completed |
| Re-enable network, tap Try again | Same attempt replays and succeeds |
| Kill the app mid-auth, reopen | Still on onboarding, not in the app |
| Sign in on a second device | Same account, saved verses/progress carried over |

Server-side already verified locally: unconfigured ⇒ `available:false` + `503`;
configured ⇒ `available:true`, forged token ⇒ `401`, missing token ⇒ `400`.

### 4c. Final TestFlight checks

Tea (the point of this build):

- [ ] Tea tab reachable from Stories segment and after playing from Home
- [ ] All 30 cards show a 3–4 word title
- [ ] Card → detail: title holds, departs, no duplicate heading
- [ ] Grace lockup top-centre and **stays visible during playback**
- [ ] Captions track the new audio word-for-word
- [ ] A 15s screen-record from any point stands alone
- [ ] Share sheet carries hook + reference + "Tea from Grace"

Rest of app:

- [ ] Player shows a real remaining time, ±15s works, scrubber seeks
- [ ] Home listen + continue + read cards all open and can be backed out of
- [ ] Reading: back from a chapter leaves for the book, however far you paged
- [ ] Paywall: success → Confirmation with the real name → Enter Grace → Home
- [ ] Paywall: decline (tap outside) → Home, no entitlement
- [ ] Paywall: failed purchase → stays gated with a recoverable error
- [ ] Paywall footer no longer shows the `$69.99/year…` line
- [ ] Onboarding verse is a multi-verse passage matching her choices
- [ ] App icon is GraceIconV4

Known gaps accepted for this build:

- **Jesus' Parables collection is empty**; no collection reaches 10. Needs the
  26-story render.
- **StoreKit is not wired** — the paywall does not transact. Fine for TestFlight,
  will be rejected by App Review.
