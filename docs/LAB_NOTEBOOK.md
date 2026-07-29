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

**Follow-up:** RUN-006 Phase 3 CRUD; always `record:phaseN` before milestone commit

---

### RUN-006 | 2026-07-13 | Phase 3 CRUD (SEL-14)

**Objective:** GRACE-009 — authed profile + library routes.

**Procedure:**
1. Implement `libraryService` + expand `routes/me.ts`
2. `npm test` → 18/18
3. `npm run record:phase3`

**Observations:**
- DELETE uses `/saved/*` wildcard for refs containing `:`
- verify: 6/6 pass

**Result:** PASS → commit `b145809`

**Follow-up:** RUN-007 Phase 4 search

---

### RUN-007 | 2026-07-13 | Phase 4 scripture search (SEL-13)

**Objective:** GRACE-010 — `GET /bible/search?q=` with OT/NT grouping.

**Procedure:**
1. Add `searchScripture()` to `bibleService.ts` + route in `bible.ts`
2. `test/phase4.integration.test.ts`
3. `npm test` → 21/21 (phases 1–4 only; phase 5 test deferred)
4. `npm run record:phase4`

**Observations:**
- ILIKE `%query%` on sample seed; `peace` returns NT hits (e.g. John 14:27)
- Empty `?q=` → `{ ot: [], nt: [] }`
- verify: 5/5 pass

**Result:** PASS → commit `98cf1b1`

**Follow-up:** RUN-008 Phase 5 beta entitlement

---

### RUN-008 | 2026-07-13 | Phase 5 beta entitlement (SEL-16)

**Objective:** GRACE-011 — server-side `subscribed` + `POST /beta/redeem`.

**Procedure:**
1. `subscriptionService.ts` + `routes/beta.ts` + auth `resolveSubscription` on `GET /me`
2. `test/phase5.integration.test.ts`
3. `npm test` → 24/24
4. `npm run record:phase5`
5. Set `BETA_REDEEM_CODE` on Railway; `railway up`

**Observations:**
- New guests: `profile.subscribed: false`
- Redeem `grace-beta` → `trialing` + `subscribed: true`
- Expired trial flips on next `GET /me`
- verify: 5/5 pass

**Result:** PASS → commit `36e5155`

**Follow-up:** RUN-009 mobile API wiring + Playwright E2E

---

### RUN-009 | 2026-07-13 | M8 mobile API wiring (GRACE-012–016)

**Objective:** Wire Expo app to Grace API; E2E verify all endpoints from FE.

**Procedure:**
1. Add `src/api/client.js`, `session.js`, `app.config.js`
2. Wire AuthService, bible.js, profile sync, SubscriptionService, ReadingService.search
3. Add `SearchScreen`, Expo web, Playwright (`e2e/`)
4. `npm run e2e` → 16/16

**Observations:**
- Profile sync preserves local `onboarded` until server confirms
- `bible.js` uses Grace API first, bible-api.com fallback
- Playwright drives Expo web against local API (`localhost:3000`)

**Result:** PASS → commit `899534c`

**Follow-up:** RUN-010 M10 staging + beta distribution

---

### RUN-010 | 2026-07-13 | M10 staging & beta distribution (GRACE-019–022)

**Objective:** Staging HTTPS verified; app defaults to Railway; beta playbook.

**Procedure:**
1. `verify:staging:full` → 15/15 on Railway
2. App default API → staging; `start:tunnel`, `.env.staging.example`
3. `docs/BETA_DISTRIBUTION.md`, `docs/BETA_VERIFICATION.md`
4. `npm run record:staging:full`

**Observations:**
- Matrix 9/10 automated; remote tester QR = manual per playbook
- M9 offline queue still partial

**Result:** PASS → commit `5258cf1`

---

### RUN-011 | 2026-07-22 | TestFlight V1 feedback (14 items) — audio, Tea, motion, onboarding, paywall, polish

**Objective:** Execute the `grace-branch-spec/` execution brief on `feat/tf-v1-feedback`: fix story audio, add the Tea feature, motion, onboarding polish, fake paywall, and UI polish; verify; prep TestFlight.

**Procedure:**
1. **Audio (01/01b/02b):** every story gets `audioUrl`; `storyForClient.hasAudio = Boolean(audioUrl)`; TTS route 302→static on failure; `ttsService` provider switch (elevenlabs/openai) + `voiceProfiles.pickVoice`; `scripts/generate-audio.ts` (`npm run generate:audio`) renders stories + Teas; `staysActiveInBackground` + `UIBackgroundModes:["audio"]`.
2. **Tea (02):** `teaCatalog.ts`, `/tea` routes, `TeaEngagement` model + migration `20260722000000_tea_engagement`, `libraryService.toggleTeaLike/saveTea/listSavedTea`, `TeaService`, `TeaScreen` (grid), `TeaDetailScreen`, `Stories | Tea` segmented control.
3. **Icon + rename (03):** `assets/icon.png` (Grace dove) → `app.json` icon/splash; build name stays "Grace" (App Store listing name set at submit).
4. **Motion (04):** `GraceDove` eye-blink (always) + wing-flap (`motion="flap"`); ConfirmationScreen flaps + haptic; You/settings dove folded+breathe; `AmbientBackdrop` + `Screen ambient` prop on all non-reading screens (excl. Chapter/Book); Today header head-crop.
5. **Onboarding (05):** ValueAdd women-first copy; stray em-dashes removed across onboarding; Verse = keep+advance one tap, overflow fixed (`adjustsFontSizeToFit`, `maxHeight`), full-width CTA. Slider already matched the corrected geometry — no change.
6. **Paywall (06):** removed "Maybe later"; whole screen wrapped in `Pressable` → tap-off enters Home; `onboarded` set on both paths.
7. **Polish (07):** Player Save/Share/Transcript are real `FooterButton`s (icons, haptics, states); BookScreen chapter grid computes exact cell width from `Dimensions` + `includeFontPadding:false`; tab bar active brass pill + lift shadow + `tabPress` haptics.

**Observations:**
- Backend `npm run typecheck` → clean.
- `npx expo export -p ios` → bundles the full module graph (2.87 MB hbc), no import/resolution errors — validates all new screens/components compile.
- Docker not available in this env → DB-backed `npm test` / `verify:phase2` and `prisma migrate dev` were **not run here**; the migration SQL is hand-written to match Prisma format and `prisma generate` succeeded.
- Audio MP3 asset generation, R2/CDN hosting, and `eas build`/`submit` are external release steps requiring keys/accounts (see DEC-010).

**Result:** Code complete + typecheck/bundle green. DB tests + EAS build deferred to an environment with Docker + keys.

---

### RUN-012 | 2026-07-29 | Feedback v3 (15 items) — blink, slider, transcripts, Tea daily sermon, Apple auth, tab bar

**Objective:** Apply `grace-branch-spec 2/v3/` (A–G) into the working repo on `feat/tf-v1-feedback`, preserving Expo/EAS identity, bundle id, ASC config, backend config and secrets.

**Procedure:**
1. **Motion (A #2,#3):** `GraceDove` blink now animates the ellipse `ry` (open 13.5 → 1.2) with `useNativeDriver:false` instead of `style.transform:[{scaleY}]`. Root cause confirmed in source: `react-native-svg` honours `origin` for its `scale`/`rotation` **props**, not for a style transform, so the old transform scaled about the viewBox origin `(0,0)` and dragged the pupil out of frame. Catchlights fade via `opacity` on `ACircle`. `profile.reducedMotion` skips the loop. `SliderScreen` switched from `e.nativeEvent.locationX` (which becomes child-relative mid-drag, collapsing the index) to absolute `pageX` minus a `measureInWindow` track origin, plus `onPanResponderTerminationRequest:()=>false` and `hitSlop`.
2. **Type (A #4):** body copy raised to ≥16px with 1.5 line-height across onboarding; `textFaint` → `textMuted` for paragraphs that must be read; verse card 27/38 with `maxHeight:'58%'`; `adjustsFontSizeToFit` on the headlines that can take long names.
3. **Review prompt (A #1):** new `ReviewScreen` (expo-store-review) replaces `Rhythm` in the onboarding flow; `Rhythm` stays registered and the preference still lives at You → Reminders. Backend `ReviewPrompt` model + `POST /review/event` + `GET /review/should-ask` (90-day cooldown, never after `completed`); app `ReviewService` degrades to a local log offline.
4. **Audio + transcript (B #5,#7,#8):** onboarding plays a **bundled** asset (`assets/audio/onboarding-preview.m4a`) with `playsInSilentModeIOS`, so it never touches TTS or the network — that was the actual cause of the onboarding 503. `Waveform` gained `animate` so it reflects real playback. Player shows elapsed, remaining and "Ends at HH:MM". Story `durationSeconds` retargeted to 200–235s. `generate-audio.ts` now writes a `.json` sidecar per MP3 holding the exact narration text + ElevenLabs word timings (`/with-timestamps`, collapsed to word spans); `GET /stories/:id/transcript` serves that sidecar and nothing regenerates display text any more. Transcript sheet highlights the active line and taps seek to it.
5. **Tea (C #9,#10,#11):** catalog expanded 10 → **30** daily sermons with `heat` 1/2/3, `image`, `durationSeconds`; `teaOfDay()` picks a stable card per calendar day with no repeat inside 30; `GET /tea/today` added; `GET /img/tea/:filename` static route added. `TeaScreen` is now a Today's-Tea hero + scrollable archive with pull-to-refresh; `TeaImage` renders full-bleed art over a scrim with a deterministic gradient fallback so a missing still is never a broken image. App fallback catalog is generated from the backend seed so the two cannot drift.
6. **Paywall/auth (D #6,#14):** paywall branches on the real `SubscriptionService.purchase()` status — only `trialing`/`active` reaches `Confirmation`; `cancelled` stays put; failure shows calm copy. Ivory outro bloom + slower fade animations carry the eye from the dark paywall into the light. `ConfirmationScreen` guards on `profile.subscribed`. Subscription disclosure (title/length/price per period) + Privacy/Terms links sit under the CTA (3.1.2). Backend `POST /auth/apple` verifies the identityToken against Apple's JWKS via `jose`, and `DELETE /me` hard-deletes via cascade (5.1.1(v)); Settings gained Privacy/Terms/Delete-account rows and KJV attribution.
7. **Tab bar + icons (E #12,#13):** bar is `position:absolute`, transparent, `borderTopWidth:0`, with a `BlurView` + 6%-opacity hairline + top gradient fade; active state is ink weight plus a 4px brass dot, no pill. Scroll containers got `paddingBottom:110`. New `GIcon` (24 grid, stroke 1.7) replaces every emoji/text glyph across Player, Stories, Tea, Chapter, Reading, Today, Saved, StoryDetail; `PlayIcon` retired.
8. **Legal/icon (G):** `docs/legal/PRIVACY.md` + `TERMS.md` committed, URLs centralised in `src/legal.js`; locked icon copied from the spec and flattened RGBA → RGB (alpha was uniformly 255, so no visual change) to satisfy the App Store no-alpha rule.

**Observations:**
- Backend `npm run typecheck` → clean. New `test/v3.unit.test.ts` → **8/8 pass** (DB-free: Tea invariants, `teaOfDay` stability + 30-day cycle, story durations, word-timing collapse).
- DB-free route smoke via `app.inject`: `/tea` → 30 items, `/tea/today` → stable pick, `/tea/:id`, `/stories/*`, `POST /auth/apple` → 400 without a token, `/review/should-ask` and `DELETE /me` → 401 unauth. Transcript + tea-image routes correctly 404 until assets are rendered.
- `npx expo export -p ios` → 2.93 MB hbc, no resolution errors; the bundled onboarding `.m4a` is present in the export. `npx expo start` serves a 7.07 MB dev bundle, HTTP 200, no errors.
- `npx expo-doctor` → 17/18. The one failure is **pre-existing** patch/minor drift (`async-storage` 2.1.2 vs 2.2.0, `expo` 54.0.35 vs 54.0.36, `react-native` 0.81.4 vs 0.81.5); not touched, to preserve the working build.
- Docker unavailable in this environment → DB-backed `npm test` (phase1–5) and `verify:phase2` were **not run here**; migration SQL is hand-written to match Prisma's format and `prisma generate` succeeded.
- **Surprise:** `tsx` does not auto-load `.env`, so `npm run generate:audio` had been running without the TTS keys; and two voice-id values in `backend/.env` carry trailing `# comments`. Fixed both — scripts now use `--env-file-if-exists=.env`, and `voiceProfiles.voiceId()` strips anything after a `#`.
- **Spec discrepancy:** `C-TEA.md` prose says "Nine entries above are `heat: 3`" but its array contains **seven**. Transcribed the data faithfully (7), not the prose.

**Result:** Code complete; typecheck, unit tests, route smoke, iOS bundle and dev server all green. DB tests, real MP3 re-render, Tea stills, IAP wiring and EAS build deferred (see CHANGELOG "Not done here").

**RUN-012 addendum | 2026-07-29 | post-render verification**

Ran `generate:audio` with a working key, then verified rather than assumed:
- **Rendered OK:** 30 Tea MP3s + `onboarding-preview.mp3`, each with a `.json` sidecar carrying word timings (31/31). Sidecar `text` verified byte-identical to `hook + " " + tea` for all 30 Teas. The `voice` field is a clean 20-char id, confirming the `voiceProfiles.voiceId()` `#`-stripping fix works against the real API.
- **Stories were skipped.** `render()` short-circuits on `existsSync(mp3)`, and the 16 story parts already existed from the 2026-07-22 render, so none got a sidecar. `GET /stories/:id/transcript` 404s for every story; the Transcript button disables itself, which is the designed degradation but not the goal. `FORCE=1 ONLY=stories npm run generate:audio` fixes it. Deliberately **not** run here: it spends API quota, and the narration should be lengthened first so the re-render is not thrown away.
- **Durations are fiction.** Measured with `afinfo`: story parts are 7-11s against a claimed 200-235s; Teas are 12-15s against a claimed 62s. Root cause is copy length, not metadata: `narrationScripts.ts` parts are ~40 words and Tea bodies ~55 words. The spec's "written to land in 55 to 70 seconds" was never true of the text it shipped. Flagged for a product/copy decision; metadata deliberately left unchanged so the gap stays visible rather than being papered over.
- **Cleaned:** deleted the 10 stale `tea-01…tea-10.mp3` from the old id scheme (unreferenced by the new catalog, confirmed by grep). Replaced the bundled macOS `say` placeholder with the real 31.3s ElevenLabs cut; no `.m4a` files remain anywhere in the repo.
- **Re-verified:** backend `typecheck` clean; `v3.unit.test.ts` 8/8; `expo export -p ios` 2.93 MB hbc with a new bundle hash (confirming the `require()` switch to `.mp3` took effect) and the 502 KB asset present in the export.
- **Secret scan:** 137 changed/new files scanned against the 8 live `.env` values plus patterns for `sk_`/`sk-`/AWS/bearer/private-key material. No API key material anywhere. The only matches are public values that already existed in the repo at HEAD: the bundle id, the two ElevenLabs *premade* voice ids, the model name, and the `.env.example` dev placeholders (`JWT_SECRET=change-me-in-production`, the localhost Postgres URL).
