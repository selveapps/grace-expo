# Agentic Build Changelog

Milestone-level history for the Grace Expo agentic build. Not the npm package changelog.

Format based on [Keep a Changelog](https://keepachangelog.com/).

## [Unreleased]

### Planned
- M9 offline sync queue
- M11 real OAuth + IAP

---

## [Feedback v3 — submission readiness] — 2026-07-29

Branch: `feat/tf-v1-feedback`. Covers the 15 v3 feedback items (`grace-branch-spec 2/v3/`).

### Fixed
- **Grace's eyes flew out of her head on every screen** (#2): the blink animated `style.transform:[{scaleY}]`, which `react-native-svg` applies as a *view* transform about the viewBox origin `(0,0)`, ignoring `origin`. Now animates the ellipse `ry` so the centre cannot move. Honours `reducedMotion`. (DEC-012)
- **Slider never reached "Directly"** (#3): `onPanResponderMove` read `e.nativeEvent.locationX`, which becomes child-relative once the knob captures the touch (0…34), collapsing the index mid-track. Now measures the track with `measureInWindow` and works in absolute `pageX`, with `hitSlop` on both ends.
- **Onboarding audio didn't work** (#5): it resolved through `AudioService` → TTS and 503'd with no key in production. It now plays a **bundled** asset with `playsInSilentModeIOS: true`, so it works offline, on a fresh install, on silent, with no keys.
- **Transcripts didn't match the audio** (#8): the shown text was an LLM narrative regenerated per request. `GET /stories/:id/transcript` now serves the render's own sidecar. (DEC-013)
- **Non-payers got the paid celebration** (#6): the paywall pushed `Confirmation` on both the CTA and the tap-anywhere path. It now branches on the real purchase status; `Confirmation` also guards on `profile.subscribed`.
- `tsx` never auto-loaded `backend/.env`, so `generate:audio` had been running without the TTS keys; two voice ids in `.env` also carried trailing `# comments`. Scripts now use `--env-file-if-exists=.env` and `voiceProfiles` strips anything after a `#`.

### Added
- **Tea as a daily sermon** (#9,#10,#11): 30 entries, `heat` 1/2/3, stable `teaOfDay()` pick, `GET /tea/today`, `GET /img/tea/:filename`. Today's-Tea hero + scrollable archive with pull-to-refresh; `TeaImage` full-bleed art over a scrim with a deterministic gradient fallback. (DEC-014)
- **Review prompt in onboarding** (#1) replaces the notification-reminder screen: `ReviewScreen` (expo-store-review) + `ReviewPrompt` model + `POST /review/event` + `GET /review/should-ask` (90-day cooldown). `Rhythm` stays reachable via You → Reminders.
- **Sign in with Apple** + **in-app account deletion** (#14): `POST /auth/apple` verifies the identityToken against Apple's JWKS with `jose`; `DELETE /me` hard-deletes by cascade. The guest to migrate comes from the caller's bearer token, not the request body. (DEC-015)
- **Word timings + tap-to-seek**: `generate-audio.ts` writes a `.json` sidecar per MP3 (exact text + ElevenLabs word spans); the transcript sheet highlights the active line and seeks on tap. **Rendered:** 30 Tea clips + the onboarding cut, all 31 with word timings, sidecar text verified byte-identical to the catalog.
- **Real onboarding narration** bundled at `assets/audio/onboarding-preview.mp3` (ElevenLabs "Lily", 31.3s), byte-identical to the backend copy. The macOS `say` placeholder is gone.
- Player shows elapsed, remaining and **"Ends at HH:MM"**; `Waveform` animates only during real playback.
- Legal: `docs/legal/PRIVACY.md` + `TERMS.md`, URLs in `src/legal.js`, linked in Settings and under the paywall CTA with the subscription disclosure (3.1.2); KJV attribution in Settings → About.
- `backend/test/v3.unit.test.ts` — 8 DB-free tests (Tea invariants, day-cycle stability, story durations, word-timing collapse).

### Changed
- **Tab bar** (#12): absolute + `BlurView`, `borderTopWidth: 0`, 6%-opacity hairline and a top gradient fade; active state is ink weight + a 4px brass dot, not a pill. Scroll containers padded to 110.
- **All emoji/text-glyph icons replaced** (#13) by `GIcon` (24 grid, stroke 1.7) across Player, Stories, Tea, Chapter, Reading, Today, Saved and StoryDetail. `PlayIcon` retired.
- **Type** (#4): no body copy below 16px, line-height 1.5, `textFaint` → `textMuted` for read-me paragraphs, verse card 27/38, `adjustsFontSizeToFit` on headlines that take names.
- Story `durationSeconds` retargeted from 480–620s to **200–235s** (3:20–3:55) per part (#7).
- **No em-dashes** in user-facing copy, app and backend.
- App icon replaced with the locked v3 icon, flattened RGBA → RGB (alpha was uniformly 255, so no visual change) for the App Store no-alpha rule.

### Not done here
- **DB-backed tests** (`npm test` phase1–5, `verify:phase2`) and `prisma migrate dev` — Docker is unavailable in this environment. Migration SQL is hand-written to Prisma's format; `prisma generate` and `typecheck` pass.
- **Story audio + transcripts**: the 16 story-part MP3s were rendered before the sidecar change and `generate-audio.ts` skips existing files, so **no story has a transcript sidecar** and `GET /stories/:id/transcript` 404s for all of them. The Transcript button correctly disables itself. Fix with `FORCE=1 ONLY=stories npm run generate:audio` — best done together with the narration-length work below.
- **Durations are not honest yet**: `durationSeconds` claims 200-235s per story part and 62s per Tea, but the rendered audio is **7-11s** and **12-15s** respectively, because `narrationScripts.ts` and the Tea bodies are only 40-55 words. Cards therefore say "4 min" over a 10-second clip. Needs longer narration copy, then a re-render — a content decision, not a metadata one.
- **Tea card stills** (30) not licensed; deterministic gradients ship in their place.
- **IAP**: not wired — `expo-in-app-purchases` is not supported on SDK 54. (DEC-015)
- **Google sign-in** still links by email; native Google OAuth remains M11.
- EAS build/submit, ASC setup, Paid Apps agreement and publishing the legal URLs are external release steps.

---

## [TestFlight V1 feedback — audio, Tea, motion, polish] — 2026-07-22

Branch: `feat/tf-v1-feedback`. Covers the 14 TestFlight feedback items (`grace-branch-spec/`).

### Fixed
- **Story audio 503'd for every story** (#5,#8,#10a): every story now has a static `audioUrl`; TTS route 302-redirects to the pre-rendered MP3 on failure instead of returning a raw 503. Works with no key in production once MP3s are hosted. (DEC-010, SURPRISES 2026-07-22)
- **Real ElevenLabs narration** rendered for all 16 story parts + 10 Teas (`npm run generate:audio`), committed as `.mp3`. Per-persona voices — Ruth/Sarah, Esther/Lily, David/George, Hannah/Bella, Mary/Jessica — with mood-matched delivery (tender/steady/bold) and a weightier read for David. Tea is faster + sassier (Laura for dark, Jessica for light) with per-card speed/style variation (`speed` 1.12–1.18). Voices/settings are data-driven in `voiceProfiles.ts` + `storyCatalog.ts`; render is idempotent (skips existing, `FORCE=1` to redo).
- Key-free spoken placeholder path retained as a fallback (`npm run generate:audio:placeholder`, macOS `say` → `.m4a`); the app tries `.mp3` first, then `.m4a`. Audio route serves mp3/m4a/wav; `resolveStaticAudioUrl` handles the fallback. Player has a "Try again"; Tea detail has not-found + audio-retry states.

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
