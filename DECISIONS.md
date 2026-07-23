# Engineering Decisions Log

Append-only record of **decisions** made during the Grace Expo agentic build.
Goal: reproducibility comparable to a methods section in a scientific paper.

**Format:** Each entry is self-contained — a reader with only this repo can understand *what* was decided, *why*, and *how to verify*.

---

## How to write an entry

```markdown
## DEC-NNN — Short title (YYYY-MM-DD)

**Tickets:** GRACE-XXX / SEL-XX  
**Status:** accepted | superseded by DEC-YYY

### Context
What problem or milestone triggered the decision.

### Options considered
| Option | Pros | Cons |
|--------|------|------|

### Decision
What we chose (one sentence).

### Rationale
Why — tie to constraints (Expo Go, cost, latency, etc.).

### Consequences
What maintainers/agents must do differently going forward.

### Verification
Exact command(s) or test that proves the decision is implemented.
```

**Rules:** Never delete entries. Supersede with a new DEC-NNN that references the old one.

---

## DEC-001 — Monorepo with git worktrees (2026-07-13)

**Tickets:** GRACE-001 / SEL-5  
**Status:** accepted

### Context
Parallel work on `main` (stable app) and `backend-dev` (API) without branch thrashing.

### Options considered
| Option | Pros | Cons |
|--------|------|------|
| Single clone + branch checkout | Simple | Dirty working tree; easy to commit to wrong branch |
| Separate repo for API | Clean isolation | Drift from app contract; two PR workflows |
| **Git worktrees** | One repo; isolated folders per branch | Extra disk; path/branch naming discipline |

### Decision
Use git worktrees: `grace-expo/` → `main`, `grace-expo-sid/` → `backend-dev`.

### Rationale
Keeps `BACKEND.md` and `src/api/bible.js` in one repo for contract parity; agents open the worktree matching the branch.

### Consequences
- Feature work only in worktree folders (see `.cursor/rules/git-worktrees.mdc`).
- Branch renames do **not** rename worktree directories.

### Verification
```bash
git worktree list
# → grace-expo-sid  [backend-dev]
```

---

## DEC-002 — Railway Hobby for staging Postgres + API (2026-07-13)

**Tickets:** GRACE-002, GRACE-019 / SEL-6, SEL-21  
**Status:** accepted

### Context
Expo Go beta needs always-on HTTPS API; cold starts hurt mobile UX.

### Options considered
| Option | Pros | Cons |
|--------|------|------|
| Render free + Neon | $0 | Cold starts; split dashboards |
| Fly.io | Good DX | More ops surface for beta |
| **Railway Hobby** | Always-on; integrated Postgres; ~$5/mo | Paid; env named `production` by default |

### Decision
Railway project `grace-api-staging`, service `grace-api`, Postgres plugin, public URL for staging.

### Rationale
Beta testers on LTE need reliable `/health` and scripture routes without 15-min spin-down.

### Consequences
- `backend/railway.toml` owns build/migrate/start.
- Secrets only in Railway variables — never committed.
- Staging URL: `https://grace-api-production.up.railway.app` (Railway env name ≠ our “staging” label).

### Verification
```bash
STAGING_API_URL=https://grace-api-production.up.railway.app npm run verify:staging
```

---

## DEC-003 — Prisma migrate deploy in preDeployCommand (2026-07-13)

**Tickets:** GRACE-005 / SEL-9  
**Status:** accepted

### Context
Schema must apply automatically on Railway deploy without manual shell.

### Options considered
| Option | Pros | Cons |
|--------|------|------|
| Manual migrate after deploy | Simple | Error-prone; not reproducible |
| Migrate in buildCommand | Runs even if deploy fails | Build shouldn't need live DB |
| **preDeployCommand: migrate deploy** | Official Railway pattern; DB required only at deploy | `prisma` must be production dependency |

### Decision
`railway.toml` → `preDeployCommand = ["npm run migrate"]`; move `prisma` to `dependencies`.

### Rationale
Matches Prisma's CI guidance; verified on first Railway deploy (migration `20260713204416_init` applied).

### Verification
Railway deploy logs show `Applying migration 20260713204416_init`; `GET /health` → `db: true`.

---

## DEC-004 — Sample KJV seed for E2E; full canon deferred (2026-07-13)

**Tickets:** GRACE-004, GRACE-006 / SEL-8, SEL-11  
**Status:** accepted (full canon before search milestone)

### Context
Phase 1 E2E must finish in minutes; full bible-api fetch is ~30 min.

### Options considered
| Option | Pros | Cons |
|--------|------|------|
| Bundle static JSON in repo | Fast CI | Large file; stale text |
| **5-chapter sample via prepare-kjv** | Covers Psalms 23, John 3, Philippians 4, Isaiah 40, Romans 15 | Search beta needs full seed later |
| Full canon in Phase 1 | Complete data | Blocks parallel API work |

### Decision
`npm run seed:prepare` (default) fetches 5 chapters / 129 verses; `seed:prepare:full` for production seed.

### Rationale
Acceptance tests only need Psalms 23 + passage refs in sample set; unblocks M3 HTTP routes immediately.

### Verification
```bash
cd backend && npm run verify:phase1
# step 4–5: 129 verses; Psalms 23 count = 6
```

---

## DEC-005 — Layered agent context (AGENTS + skills + lab notebook) (2026-07-13)

**Tickets:** GRACE-001 (process)  
**Status:** accepted

### Context
Agent config bloat hurts success rate (~20% cost increase per arxiv 2602.11988).

### Decision
| Artifact | Role |
|----------|------|
| `AGENTS.md` | Thin router (~80 lines) |
| `.cursor/skills/` | On-demand dependency procedures |
| `SURPRISES.md` | Append-only agent corrections |
| `CHANGELOG.md` | Milestone outcomes + verify evidence |
| **`DECISIONS.md`** | Rationale archive (this file) |

### Rationale
Separates *what happened* (changelog), *what went wrong* (surprises), and *why we chose X* (decisions) — same division as lab notebook / methods / results.

### Consequences
**Definition of done** now requires updating relevant notebook files in the same commit as code.

### Verification
Files exist at repo root; `docs/AGENTIC_CODING_METHODOLOGY.md` §2 references them.

---

## DEC-006 — `jose` for guest JWT (Phase 2, 2026-07-13)

**Tickets:** GRACE-008 / SEL-10  
**Status:** accepted

### Context
Expo Go beta needs `POST /auth/guest` → Bearer JWT; no Apple/Google native modules.

### Options considered
| Option | Pros | Cons |
|--------|------|------|
| `@fastify/jwt` | Fastify-native | Extra plugin coupling |
| `jsonwebtoken` | Common | CJS/ESM friction in `"type":"module"` |
| **`jose`** | ESM-first; Web Crypto | New dependency skill required |

### Decision
`jose` HS256: access token 1h, refresh 30d; payload `{ sub, type: 'access'|'refresh' }`.

### Rationale
Matches Node 20 ESM layout; refresh rotation on each `/auth/refresh` call; no refresh table for beta.

### Consequences
- `JWT_SECRET` required (Railway variable already set).
- Protected routes use `requireAuth` middleware; `request.userId` set after verify.

### Verification
```bash
cd backend && npm test -- --test-name-pattern "Phase 2"
```

---

## DEC-007 — Scripture routes read `bible_verse` table (Phase 2, 2026-07-13)

**Tickets:** GRACE-007 / SEL-12  
**Status:** accepted

### Context
App `src/api/bible.js` shapes must be served from own backend for beta.

### Decision
Public routes (no auth): `GET /bible/:book/:chapter`, `/bible/passage?ref=`, `/today/verse`, `/verse/for-carrying?tags=`.

### Rationale
Mirrors `bible-api.com` consumer shapes: `{ reference, verses: [{n,t}] }`, `{ ref, text }`.  
`scriptureMeta.ts` copies `CARRY_VERSE` and `DAILY` arrays from `src/api/bible.js` — **must stay in sync**.

### Consequences
- Book slug normalization: `psalm` → `Psalms` (`src/lib/books.ts`).
- Passage parser uses longest-prefix book match for `1 Samuel` etc.
- 404 when chapter not in seed data (not bundled fallback text).

### Verification
```bash
curl -s localhost:3000/bible/psalms/23 | jq '.verses | length'   # → 6
curl -s 'localhost:3000/bible/passage?ref=John+3:16' | jq .ref
```

---

## DEC-008 — Documentation equals code in definition of done (2026-07-13)

**Tickets:** process  
**Status:** accepted

### Context
User requirement: build should be as reproducible as a scientific paper.

### Decision
Every milestone commit includes updates to all touched notebook files:

1. `CHANGELOG.md` — what shipped + verify output  
2. `DECISIONS.md` — new architectural choices (DEC-NNN)  
3. `SURPRISES.md` — any correction loop  
4. `docs/LINEAR_ISSUES.md` — ticket status when milestone closes  
5. Dependency skill — if new package or infra  

### Rationale
Without synchronized docs, agents re-derive the same wrong assumptions; humans cannot audit *why* staging behaves differently from local.

### Verification
PR/commit diff includes both `backend/src/**` and root `*.md` changes.

---

## DEC-009 — Recorded E2E transcripts in `docs/runs/` (2026-07-13)

**Tickets:** process (reproducibility)  
**Status:** accepted

### Context
User requirement: E2E results as reproducible as a scientific paper — not just pass/fail in chat.

### Decision
`npm run record:phaseN` wraps `verify:phaseN` and writes immutable `.log` files to `docs/runs/` with:
- UTC timestamp, git branch/SHA, dirty/clean, Node version, platform
- Sanitized env (no secret values)
- Full stdout/stderr + final exit code

### Rationale
Lab notebook RUN-NNN entries summarize; log files are **raw supplementary data** another researcher can diff against a re-run.

### Consequences
- Before milestone commit: `npm run record:phaseN` and commit the `.log`
- Link log filename in `LAB_NOTEBOOK.md` Observations
- Reproduce: `git checkout <sha>` → `npm run verify:phaseN` → diff against log

### Verification
```bash
cd backend && npm run record:phase2
ls docs/runs/phase2-*.log
```

---

## DEC-010 — Pre-rendered CDN audio over per-request TTS (2026-07-22)

**Tickets:** SEL feedback #5,#8,#10a
**Status:** accepted

### Context
Story audio 503'd for every story on TestFlight. Root cause: `synthesizeSpeech` hard-throws when no key is set, and `OPENAI_API_KEY` is unset in production, so `GET /ai/stories/:id/audio` returned 503 for 100% of plays (see SURPRISES 2026-07-22).

### Decision
Ship **pre-rendered static MP3s** as the primary audio path, live TTS only as a personalization fallback:
- Every story carries `audioUrl` (`/audio/{storyId}-part-{part}.mp3`); `storyForClient.hasAudio = Boolean(audioUrl)`.
- `scripts/generate-audio.ts` renders all story parts + all Teas once, locally, with a key.
- `GET /ai/stories/:id/audio` degrades gracefully: on TTS failure it 302-redirects to the static MP3 instead of surfacing a raw 503.
- `ttsService` is provider-switchable (`TTS_PROVIDER=elevenlabs|openai`) with data-driven voice/style via `voiceProfiles.pickVoice`.

### Rationale
Instant, key-independent, edge-cacheable playback; zero per-play cost; works with **no OpenAI/ElevenLabs key in production** once MP3s are hosted. For real-user launch, host MP3s on Cloudflare R2 and point `audioUrl` at the absolute CDN URL (01b).

### Consequences
- The MP3 assets must be generated once with a key (`npm run generate:audio`) and committed or synced to CDN — this is a release step, not a code step.
- `staysActiveInBackground: true` + `UIBackgroundModes: ["audio"]` enable lock-screen playback (native build only, not Expo Go).

### Addendum (2026-07-22) — key-free placeholder narration
To make audio testable end-to-end before a keyed render, `scripts/generate-placeholder-audio.ts` (`npm run generate:audio:placeholder`, macOS only) renders real *spoken* narration with `say` + `afconvert` to **`.m4a`** (AAC) — a distinct voice per character (Moira/Karen/Daniel/Samantha) and a brisk/bright voice per Tea mood. macOS ships no MP3 encoder, hence AAC. To keep the `.mp3` contract intact and let a real render supersede placeholders automatically:
- `/audio/:filename` serves `.mp3` / `.m4a` / `.wav` with the right content type.
- The app resolves audio via `resolveStaticAudioUrl()` which tries `.mp3` first, then the `.m4a` placeholder (both `AudioService` and `TeaDetailScreen`).
So dropping in real `.mp3`s later (via `generate:audio` + the key) wins with no code change. Placeholders are committed and ~1.1 MB total. Note: the app defaults to staging — placeholders only serve where the branch is deployed or against `npm run start:local`.

---

## DEC-011 — "Tea" feature: static catalog + grid, not a reel (2026-07-22)

**Tickets:** SEL feedback #9
**Status:** accepted

### Context
Feedback asked for short, sassy-but-reverent Bible takes. The 08 brief called it "Steeped"; the detailed spec (02) renamed it **"Tea" ("keep it literal — the user's call")** — the later, explicit decision wins.

### Decision
Ship **Tea** as a simple 2-column grid of 10 placeholder cards under a `Stories | Tea` segmented control (not a vertical paging feed — too few creatives yet). Backend: `teaCatalog.ts` (10 cards), public `/tea` + `/tea/:id`, auth'd `/tea/:id/like`, `/tea/:id/save`, `/tea/saved`, and a `TeaEngagement` Prisma model. App: `TeaService`, `TeaScreen` (grid), `TeaDetailScreen` (hook + tea + scripture chip deep-linking Reading + Grace narration + like/save/share).

### Consequences
- Copy is a draft — needs product/theology review before ship.
- Tea audio uses the same pre-rendered-MP3 contract (`/audio/{teaId}.mp3`); narration renders via `generate-audio.ts` with `pickVoice({ kind: 'tea' })`.
- Share uses React Native's built-in `Share` (text), avoiding a new native `expo-sharing` dependency so Expo Go keeps working.
