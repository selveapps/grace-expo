---
name: milestone-gates
description: >-
  Milestone verification gates for grace-expo backend. Use when claiming a phase
  is done, before committing, or when user asks for E2E verification. Runs
  verify:phaseN scripts and integration tests.
---

# Milestone Gates

## Rule

A milestone is done only when its verify script passes with zero failures.

## Phase 1

```bash
cd backend && npm run verify:phase1
```

Checks (9 total):
1. Docker Postgres healthy
2. Prisma generate
3. `prisma migrate deploy`
4. `seed:prepare` + `seed:bible`
5. `npm test` (4 integration tests)
6. Built API `/health` → `{"ok":true,"db":true}`
7. `tsc --noEmit`

## Phase 2

```bash
cd backend && npm run verify:phase2
```

Checks: phase 1 prerequisite + 14 integration tests + live HTTP curls for scripture + guest auth + 401 gate.

## Record (supplementary data)

```bash
cd backend && npm run record:phase2   # writes docs/runs/phase2-<timestamp>-<sha>.log
cd backend && npm run record:staging  # staging health transcript
```

Commit the `.log` with the milestone. Link filename in `docs/LAB_NOTEBOOK.md` RUN-NNN.

## On failure

1. Read failure output — do not retry blindly
2. Fix root cause
3. If the failure was non-obvious → append `SURPRISES.md`
4. Re-run full verify script (not individual steps only)

## Future phases

| Phase | Script | Tickets |
|-------|--------|---------|
| 2 | `verify-phase2.sh` (TBD) | Scripture API + guest auth |
| 3 | `verify-phase3.sh` (TBD) | CRUD + sync |

## References

- Verify script: `backend/scripts/verify-phase1.sh`
- Milestone map: `docs/BACKEND_ARCHITECTURE.md`
- Ticket map: `docs/LINEAR_ISSUES.md`
