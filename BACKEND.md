# Grace — Deployable Backend Spec

The app in `grace-expo/` already runs against a **real public scripture API**
(`bible-api.com`) with on-device persistence (AsyncStorage). This document specifies
the **private backend** you'd deploy to own accounts, personalization, sync, and
purchase validation. It's written so a developer (or Claude Code) can build it directly.

Point the app at it by changing one line — `BASE` in `grace-expo/src/api/bible.js` — and
adding an `API_BASE` for the new endpoints below.

---

## 1. Stack (recommended)
- **Runtime:** Node 20 + TypeScript
- **Framework:** Fastify (or Express) — small, fast, easy to host
- **DB:** Postgres (Supabase / Neon / RDS). Prisma or Drizzle for the schema.
- **Auth:** Apple + Google Sign-In verification (server-side token validation) issuing your own JWT session
- **Hosting:** Fly.io, Render, Railway, or a container on AWS/GCP. All give you a public HTTPS URL.
- **Scripture text:** license a translation (ESV/NIV APIs require keys & terms) or bundle a
  public-domain translation (KJV/WEB) in the DB. Serve it from your own `/bible` endpoints so
  the client depends only on you.

---

## 2. Data model (Postgres)

```sql
user            (id uuid pk, apple_sub text, google_sub text, email text,
                 name text, created_at timestamptz, updated_at timestamptz)

profile         (user_id uuid fk -> user.id, carrying text[], gentleness text,
                 rhythm text, onboarded bool, subscribed bool)

saved_verse     (id uuid pk, user_id uuid fk, ref text, text text, created_at timestamptz,
                 unique(user_id, ref))

reflection      (id uuid pk, user_id uuid fk, word text, note text, ref text,
                 created_at timestamptz)

subscription    (user_id uuid fk, platform text /* ios|android */, product_id text,
                 status text /* trialing|active|expired|canceled */,
                 expires_at timestamptz, original_txn_id text, updated_at timestamptz)

reading_progress(user_id uuid fk, book text, chapter int, position float,
                 updated_at timestamptz, unique(user_id, book))
```

---

## 3. HTTP API

All authed routes require `Authorization: Bearer <session_jwt>`.

**Auth**
```
POST /auth/apple    { identityToken }            -> { session, user }
POST /auth/google   { idToken }                  -> { session, user }
POST /auth/refresh  { refresh }                  -> { session }
```
Server verifies the provider token (Apple: validate against Apple's public keys /
`appleid.apple.com`; Google: `tokeninfo` / google-auth-library), upserts the user, returns
your own signed JWT.

**Profile & library (authed)**
```
GET  /me                                         -> { user, profile }
PATCH/me            { name?, carrying?, gentleness?, rhythm?, onboarded? }
GET  /saved                                      -> [{ ref, text }]
POST /saved         { ref, text }                -> 201
DELETE /saved/:ref                               -> 204
GET  /reflections                                -> [{ id, word, note, ref, date }]
POST /reflections   { word, note?, ref? }        -> 201
GET  /progress                                   -> [{ book, chapter, position }]
PUT  /progress      { book, chapter, position }  -> 200
```

**Scripture (can be public or authed)**
```
GET /bible/:book/:chapter        -> { reference, verses: [{ n, t }] }
GET /bible/passage?ref=John+3:16 -> { ref, text }
GET /bible/search?q=peace        -> { ot: [...], nt: [...] }   // your own index
GET /today/verse                 -> { ref, text }              // stable per day
GET /verse/for-carrying?tags=Worry,Hope -> { ref, text }       // personalization
```
`/bible/search` is the one thing the current public API can't do — a real reason to own the
backend. Index the translation's verses (Postgres full-text or a small search table) and
return grouped OT/NT results.

**Purchases (authed) — the money path**
```
POST /purchase/validate  { platform, receipt }   -> { subscription }
POST /purchase/webhook   (App Store / Play Server Notifications)  -> 200
```
- iOS: verify the receipt / transaction with the **App Store Server API** (JWS transactions),
  store `expires_at`, and subscribe to **App Store Server Notifications v2** for renewals/cancels.
- Android: verify with **Google Play Developer API**, subscribe to **Real-time Developer
  Notifications** via Pub/Sub.
- The client never decides entitlement — `GET /me` returns `subscribed` derived from
  `subscription.status`.

---

## 4. Wiring the app to it
1. Add `src/api/client.js` with `const API_BASE = 'https://your-host'` and a `fetch` wrapper
   that attaches the session JWT.
2. Replace the direct `bible-api.com` calls in `src/api/bible.js` with `API_BASE/bible/...`.
3. In `src/state/profile.js`, after local writes, mirror to the server
   (`PATCH /me`, `POST /saved`, `POST /reflections`) and hydrate from `GET /me` on login —
   AsyncStorage becomes the offline cache, the server the source of truth.
4. Add real Sign-In: `expo-apple-authentication` + `@react-native-google-signin/google-signin`
   in a **dev build** (not Expo Go), POST the provider token to `/auth/*`.
5. Add `react-native-iap` (or `expo-in-app-purchases`) in the dev build; on purchase, send the
   receipt to `/purchase/validate`.

---

## 5. Why a dev build (not Expo Go) for the last mile
Apple/Google Sign-In and StoreKit/Billing are **native modules** that Expo Go doesn't include.
`eas build --profile development` produces an installable dev client where auth + IAP work for
real. Everything else in this app already runs in plain Expo Go today.

---

## 6. Minimal deploy checklist
- [ ] Provision Postgres, run migrations
- [ ] Load a public-domain translation into `bible` + build the search index
- [ ] Implement `/auth/apple` + `/auth/google` (token verification → JWT)
- [ ] Implement profile/saved/reflections/progress CRUD
- [ ] Implement `/purchase/validate` + store-notification webhooks
- [ ] Deploy to Fly/Render, set `API_BASE` in the app
- [ ] `eas build --profile development` for auth + IAP testing
