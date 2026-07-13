# Agentic Coding Methodology

**Purpose:** A principled, reproducible way to build software with coding agents — demonstrated on Grace Expo backend (Phase 1).

**Audience:** Humans designing agent-native repos; agents loading project context.

---

## 1. Research synthesis

We evaluated converging patterns from 2025–2026 agentic tooling. No single file wins; **layered context** does.

| Pattern | Source | Role | Load model |
|---------|--------|------|------------|
| **AGENTS.md** | [agents.md](https://agents.md/) open standard (AAIF / Linux Foundation) | Project router: commands, structure, pointers | Always (nearest file in tree) |
| **SKILL.md** | Cursor, Anthropic, GitHub Copilot (`.github/skills/`) | Task- or dependency-specific procedures | On demand (description match) |
| **Rules (.mdc)** | Cursor `.cursor/rules/` | Hard behavioral constraints | Always when `alwaysApply: true` |
| **Karpathy guidelines** | [andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills) | Think first, simplicity, surgical diffs, verifiable goals | Always (rule) |
| **Karpathy wiki** | [karpathy-wiki](https://github.com/toolboxmd/karpathy-wiki) | Compounding session knowledge | Capture on surprise resolution |
| **Milestone gates** | Internal (this project) | `verify:*` scripts = definition of done | Run before commit |

### What research warns against

The [Configuration Smells catalog](https://agentpatterns.ai/anti-patterns/configuration-smells-agents-md/) (arxiv 2606.15828) found six recurring defects in agent config files:

| Smell | Prevalence | Fix |
|-------|------------|-----|
| Context Bloat | 42% | Keep AGENTS.md under ~100 lines; link out |
| Skill Leakage | 35% | Move task-specific content to `.cursor/skills/` |
| Lint Leakage | 62% | Don't restate what ESLint/Prettier already enforce |
| Conflicting Instructions | 28% | Single source of truth per concern |
| Init Fossilization | 24% | Update agent docs in the same PR as code |
| Blind References | 16% | Every link needs *when* and *why* to read |

[Benchmark work](https://arxiv.org/abs/2602.11988) shows bloated context files can **increase cost ~20%** and **hurt task success**. Human-written concise files help marginally; LLM-generated encyclopedias often hurt.

**Implication:** AGENTS.md is a **table of contents**, not documentation. Skills hold depth. Surprises capture what agents cannot infer.

---

## 2. Proposed directory structure

```
grace-expo/
├── AGENTS.md                      # Thin router (~80 lines max)
├── SURPRISES.md                   # Append-only: counter-intuitive discoveries
├── CHANGELOG.md                   # Milestone-level agentic build log
├── DECISIONS.md                   # DEC-NNN rationale archive (methods section)
├── README.md                      # Human-facing (unchanged role)
│
├── docs/
│   ├── AGENTIC_CODING_METHODOLOGY.md   # This file — the "why"
│   ├── LAB_NOTEBOOK.md                 # RUN-NNN session log (lab notebook)
│   ├── BACKEND_ARCHITECTURE.md         # Milestones M0–M11 + verify matrix
│   └── LINEAR_ISSUES.md                # Ticket ↔ milestone mapping
│
├── .cursor/
│   ├── rules/                     # Always-apply (keep tiny)
│   │   ├── karpathy-guidelines.mdc
│   │   └── git-worktrees.mdc
│   └── skills/
│       ├── milestone-gates/
│       │   └── SKILL.md           # How to run verify scripts, define "done"
│       └── dependencies/          # One folder per introduced dependency
│           ├── prisma/
│           ├── fastify/
│           ├── docker-postgres/
│           ├── railway/
│           └── bible-api/
│
└── backend/                       # Application code
    ├── scripts/verify-phase1.sh   # Executable gate (skills reference this)
    └── test/                      # Integration tests = partial gate
```

### Root files explained

| File | Owner | Update trigger |
|------|-------|----------------|
| `AGENTS.md` | Agent + human | New verify command, layout change, new skill |
| `SURPRISES.md` | Agent (append) | Any correction loop where agent assumed wrong |
| `CHANGELOG.md` | Human or agent | Milestone merged / phase gate passed |
| `DECISIONS.md` | Human or agent | Architectural/product choice with rationale |
| `docs/LAB_NOTEBOOK.md` | Agent (during work) | Each implementation session (RUN-NNN) |

**SURPRISES.md format** (append-only):

```markdown
## YYYY-MM-DD — Short title
**Context:** What task was in flight
**Assumed:** What the agent got wrong
**Actual:** Ground truth
**Prevention:** Skill update / test / verify step added
```

**CHANGELOG.md format** (Keep a Changelog style, milestone granularity):

```markdown
## [Phase 1] — 2026-07-13
### Added
- Prisma schema, Docker Postgres, KJV seed pipeline, verify:phase1
### Verified
- `npm run verify:phase1` → 9/9 pass
```

---

## 3. Alternate structures considered

### A. Standalone playbooks repo (`grace-agent-playbooks/`)

```
grace-agent-playbooks/
├── skills/dependencies/prisma/
└── SURPRISES.md
```

**Rejected for this project.** Skills drift from the code they describe. Verify scripts live in `backend/scripts/`; co-location keeps "how to verify Prisma" one hop from `prisma/schema.prisma`. Surprises without code context lack reproduction steps.

**When A wins:** Org-wide standards across 10+ repos with identical stacks.

### B. Flat `skills/` at repo root (no `.cursor/`)

**Rejected.** Cursor discovers `.cursor/skills/` natively. GitHub Copilot uses `.github/skills/`. Nesting under `.cursor/skills/` matches Cursor; symlink or duplicate for Copilot if needed later.

### C. Everything in AGENTS.md (no skills split)

**Rejected.** Violates Skill Leakage and Context Bloat smells. Prisma migrate semantics, Railway env injection, and Fastify ESM imports are **rarely needed together** — loading all three every session wastes context and invites conflicting instructions.

### D. Per-dependency `SURPRISES.md` inside each skill folder

**Optional extension.** Use when a dependency accumulates 5+ surprises (Prisma likely will). Root `SURPRISES.md` stays the index; dependency file holds depth:

```
.cursor/skills/dependencies/prisma/SURPRISES.md
```

---

## 4. The build loop (how Phase 1 was done)

This is the operational methodology — repeat per milestone.

```
┌─────────────┐
│ 1. PLAN     │  Milestone doc + Linear ticket + acceptance criteria
└──────┬──────┘
       ▼
┌─────────────┐
│ 2. SKILL    │  Add/update dependency skill BEFORE writing code
└──────┬──────┘  (read official docs — training data is stale)
       ▼
┌─────────────┐
│ 3. IMPLEMENT│  Surgical diff; match existing conventions
└──────┬──────┘
       ▼
┌─────────────┐
│ 4. VERIFY   │  Integration test + verify:* script (E2E gate)
└──────┬──────┘  Loop until pass — not "looks right"
       ▼
┌─────────────┐
│ 5. CAPTURE  │  SURPRISES.md + CHANGELOG.md + skill patch
└──────┬──────┘
       ▼
┌─────────────┐
│ 6. COMMIT   │  Atomic commit per milestone phase
└─────────────┘
```

### Phase 1 applied

| Step | Artifact |
|------|----------|
| Plan | `docs/BACKEND_ARCHITECTURE.md` M1–M2, `LINEAR_ISSUES.md` GRACE-002–005 |
| Skill | Dependency skills for Prisma, Fastify, Docker, bible-api (this commit) |
| Implement | `backend/` — schema, seed, health, docker-compose |
| Verify | `npm run verify:phase1` (9 checks: docker → migrate → seed → test → health → tsc) |
| Capture | `LAB_NOTEBOOK.md` RUN-NNN + `DECISIONS.md` + `SURPRISES.md` + `CHANGELOG.md` |
| Commit | `8a2541d` atomic Phase 1 commit |

### Definition of done (non-negotiable)

A milestone is **not done** when:

- Code compiles but verify script was not run
- Only unit tests exist without integration/E2E
- A new dependency was added without a skill folder
- A surprise was resolved but not logged

---

## 5. Dependency skill contract

Every new dependency gets a folder under `.cursor/skills/dependencies/<name>/`:

```
dependencies/prisma/
├── SKILL.md           # Required — triggers, commands, pitfalls
├── reference.md       # Optional — links to official docs
└── SURPRISES.md       # Optional — when root file gets long
```

### SKILL.md template

```markdown
---
name: prisma
description: >-
  Prisma schema, migrations, and client usage for grace-api Postgres.
  Use when editing prisma/, running migrations, or debugging DB connectivity.
---

# Prisma (grace-api)

## Commands
- Dev migration: `npm run migrate:dev`
- CI/E2E deploy: `npm run migrate`
- Generate client: `npx prisma generate` (runs in `npm run build`)

## Project conventions
- Schema: `backend/prisma/schema.prisma`
- `guest_device_id` on `User` — not Profile
- Integration tests: `backend/test/phase1.integration.test.ts`

## Verify
`npm run verify:phase1` step [3/7] and [5/7]

## Official docs
https://www.prisma.io/docs

## Surprises
See [SURPRISES.md](../../../SURPRISES.md) and dependency-specific notes.
```

### When to add a dependency skill

| Trigger | Example |
|---------|---------|
| New `package.json` dependency | `@prisma/client`, `fastify` |
| New external service | Railway Postgres, bible-api.com |
| New infra tool | Docker Compose, GitHub Actions |

Do **not** add skills for: lodash, dotenv, or anything fully inferable from types + existing code.

---

## 6. Context layering (what loads when)

```
Always loaded:
  .cursor/rules/karpathy-guidelines.mdc   (~80 lines)
  .cursor/rules/git-worktrees.mdc         (~40 lines)
  AGENTS.md                                 (~80 lines)

Loaded on match:
  .cursor/skills/dependencies/prisma/SKILL.md
  .cursor/skills/milestone-gates/SKILL.md

Loaded on explicit request:
  docs/AGENTIC_CODING_METHODOLOGY.md
  docs/BACKEND_ARCHITECTURE.md

Never auto-loaded (human docs):
  README.md
  BACKEND.md (read when implementing API contract)
```

**Budget rule:** Always-loaded context should stay under **~250 lines total** across rules + AGENTS.md.

---

## 7. Maintenance rules

1. **Same PR as code** — skill/surprise/changelog updates ship with the feature they document.
2. **Verify script is law** — if verify passes but prod breaks, fix verify first.
3. **Append surprises** — never delete; strikethrough if obsolete with date.
4. **Prune AGENTS.md** — if a section exceeds 15 lines, move to a skill.
5. **Phase gates** — each backend phase gets `scripts/verify-phaseN.sh` + skill reference.

---

## 8. Mapping to Grace milestones

| Milestone | Verify command | Skill(s) |
|-----------|----------------|----------|
| M0 Planning | `git worktree list` | git-worktrees rule |
| M1 Scaffold | `curl /health` | fastify |
| M2 Schema | `npm test` | prisma, docker-postgres |
| M3 Scripture | `npm run seed:bible` | bible-api |
| M1–M2 gate | `npm run verify:phase1` | milestone-gates |
| M3–M4 gate | `npm run verify:phase2` | milestone-gates, jose, fastify |

Future phases add: `verify-phase2.sh`, skills for JWT, FTS search, Railway deploy.

---

## 9. References

- [AGENTS.md open standard](https://agents.md/)
- [Cursor create-skill guide](https://cursor.com/docs) — `.cursor/skills/` layout
- [Agent Skills Guide (Termdock 2026)](https://www.termdock.com/en/blog/agent-skills-guide)
- [Configuration Smells catalog](https://agentpatterns.ai/anti-patterns/configuration-smells-agents-md/)
- [Karpathy coding pitfalls](https://x.com/karpathy/status/2015883857489522876)
- [multica-ai/andrej-karpathy-skills](https://github.com/multica-ai/andrej-karpathy-skills)
