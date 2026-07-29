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

---

## 2026-07-22 — TTS hard-throws without a key, so all story audio 503'd

**Context:** TestFlight reported story audio failing for every story (feedback #5,#8,#10a)
**Assumed:** `synthesizeSpeech` would degrade like `llmService.completeChat` (which has a no-key fallback)
**Actual:** `ttsService.synthesizeSpeech` throws `OPENAI_API_KEY not configured` when the key is unset. `OPENAI_API_KEY` is not set on Railway, and only `mary-annunciation` had an `audioUrl` (pointing at MP3s that weren't in the repo), so **100%** of plays fell through to TTS and returned 503.
**Prevention:** Ship pre-rendered static MP3s as the primary path (every story gets an `audioUrl`), make the TTS route 302-redirect to the static file on failure instead of 503, and never assume a synth/LLM helper degrades gracefully — check for a no-key branch. See DEC-010.

---

## 2026-07-29 — `tsx` does not auto-load `.env`, so the TTS keys were never in scope

**Expected:** `npm run generate:audio` (`tsx scripts/generate-audio.ts`) would pick up
`backend/.env` the way `prisma` and most Node tooling do.

**Actual:** it does not. A probe (`console.log(!!process.env.ELEVENLABS_API_KEY)` via
`npx tsx`) printed `false` for every TTS variable. The documented render command could only ever
have worked when the vars were exported into the shell by hand — the recorded "key lacks the
`text_to_speech` scope" 401 may well have been a *missing key*, not a scope problem.

**Corrected:** every `tsx` script now runs with `--env-file-if-exists=.env` (safe when the file is
absent, as on Railway and CI). Re-probed: the key loads.

**Second surprise, found by the same probe:** `ELEVENLABS_DEFAULT_VOICE` and `ELEVENLABS_TEA_VOICE`
are written with trailing `# which voice this is` notes. Node's `--env-file` strips those (20-char
ids resolve cleanly), but not every loader does, and a voice id with a comment glued on 404s at the
API. `voiceProfiles.voiceId()` now takes the first `#`-delimited token defensively.

**Lesson:** verify that config is actually *in scope*, not merely *on disk*. "The key is in `.env`"
and "the process can see the key" are different claims.

---

## 2026-07-29 — `origin` on `react-native-svg` does not apply to `style.transform`

**Expected:** `<AEllipse origin="194, 188" style={{ transform: [{ scaleY }] }} />` would scale the
eye about its own centre, the way `origin` implies.

**Actual:** `origin` governs `react-native-svg`'s own `scale`/`rotation` **props**. A
`style.transform` is applied as a *view* transform, which ignores it and scales about the viewBox
origin `(0,0)` — so every blink translated the eye up and off the head. This shipped to TestFlight
and was the most-reported visual bug.

**Corrected:** animate the `ry` attribute instead. The centre is fixed by construction, so no
combination of props can make it drift. (DEC-012)

**Lesson:** a prop that *looks* like it configures a transform may only configure one of two
different transform pipelines. When a fix must hold under composition, prefer the formulation with
no degree of freedom to get wrong.
