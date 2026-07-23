# Agentic Build Changelog

Milestone-level history for the Grace Expo agentic build. Not the npm package changelog.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- M9 offline sync queue
- M11 real OAuth + IAP

---

## [TestFlight V1 feedback — audio, Tea, motion, polish] — 2026-07-22

Branch: `feat/tf-v1-feedback`. Covers the 14 TestFlight feedback items (`grace-branch-spec/`).

### Fixed
- **Story audio 503'd for every story** (#5,#8,#10a): every story now has a static `audioUrl`; TTS route 302-redirects to the pre-rendered MP3 on failure instead of returning a raw 503. Works with no key in production once MP3s are hosted. (DEC-010, SURPRISES 2026-07-22)

### Added
- **Tea feature** (#9): `Stories | Tea` segmented control → 2-column grid of 10 cards → detail (hook, tea, scripture chip deep-link, Grace narration, like/save/share). Backend `/tea` routes + `TeaEngagement` model + migration. (DEC-011)
- Pre-render script `npm run generate:audio` (stories + Teas) and provider-switchable `ttsService` (elevenlabs/openai) with `voiceProfiles.pickVoice`.
- `AmbientBackdrop` drifting motes behind all non-reading screens (honors `reducedMotion`).
- `GraceDove` eye-blink (every screen) + wing-flap (`motion="flap"`).
- Grace dove app icon + splash; background/lock-screen audio (`UIBackgroundModes:["audio"]`, `staysActiveInBackground`).

### Changed
- Onboarding (#2,#3,#4): ValueAdd women-first copy + subhead; stray em-dashes removed; Verse keeps + advances in one tap, no overflow, full-width CTA.
- Paywall (#7): removed "Maybe later"; tap anywhere off the plan cards/CTA enters Home; `onboarded` set on both paths.
- Player (#10b): Save / Share quote / Transcript are real 44pt buttons with icons, haptics, and active/disabled states.
- Reading (#11): chapter-number grid uses exact computed cell widths + `includeFontPadding:false` so numbers center on iOS + Android.
- Tab bar (#12): active brass pill + subtle lift + selection-tick haptics on tab press.
- Motion (#13,#14): You/settings dove folded (no open-wing look); Today header shows an enlarged blinking head crop; arrival screen flaps.

### Verified
- Backend `npm run typecheck` → clean; `npx expo export -p ios` → full bundle, no resolution errors.
- Deferred (needs Docker + keys): `npm test`, `verify:phase2`, `prisma migrate dev`, `eas build`.

---

## [M10 — Staging & beta distribution] — 2026-07-13

Tickets: GRACE-019–022 (SEL-21,24,25). Milestone M10.

### Added
- Default app API → Railway staging (`app.config.js`, `client.js`)
- `.env.staging.example`, `npm run start:staging` / `start:tunnel`
- `verify:staging:full` (15 checks) + `record:staging:full`
- `docs/BETA_DISTRIBUTION.md`, `docs/BETA_VERIFICATION.md`

### Verified
- Staging full verify → 15/15 pass
- E2E log: `docs/runs/staging-full-*-3920ddd.log`

---

## [M8 — Mobile API wiring] — 2026-07-13

Tickets: GRACE-012–016 (SEL-15,17,18,19,23). Milestone M8.

### Added
- `src/api/client.js` + `session.js` — JWT fetch wrapper, 401 refresh
- `app.config.js`, `.env.example` — `EXPO_PUBLIC_API_BASE`, `EXPO_PUBLIC_BETA_REDEEM_CODE`
- Wired `AuthService`, `bible.js`, `profile.js`, `SubscriptionService`, `ReadingService`
- `SearchScreen` + interactive search on Reading tab
- Expo web target + Playwright E2E (`e2e/api-endpoints.spec.js`, `e2e/app-wiring.spec.js`)

### Verified
- `npm run e2e` → **16/16 pass** (12 API + 4 FE wiring)
- All backend endpoints callable from app flows

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
