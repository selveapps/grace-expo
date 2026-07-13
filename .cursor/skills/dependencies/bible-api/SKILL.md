---
name: bible-api
description: >-
  KJV scripture fetch and normalization from bible-api.com for grace-api seed
  pipeline. Use when running seed:prepare, validating chapter counts, or
  debugging bible_verse seed data.
---

# bible-api.com (KJV seed)

## Public API

https://bible-api.com — no API key; rate-limit politely.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run seed:prepare` | Sample 5 chapters (fast, E2E) |
| `npm run seed:prepare:full` | Full 66-book canon (~30 min) |
| `npm run seed:bible` | Upsert JSON → `bible_verse` table |

## Data flow

```
bible-api.com → scripts/prepare-kjv.ts → data/kjv.normalized.json → scripts/seed-bible.ts → Postgres
```

## Chapter metadata

`scripts/bookMeta.ts` — chapter counts mirror app `src/data/bookMeta.js`.

## Sample chapters (default)

Psalms 23, John 3, Philippians 4, Isaiah 40, Romans 15 → 129 verses

## Validation built-in

`prepare-kjv.ts` exits non-zero if Psalms 23 ≠ 6 verses.

## Rate limiting

`DELAY_MS = 120` between chapter fetches in prepare script.

## Verify

```bash
cd backend && npm run verify:phase1   # steps 4, 5
cd backend && npm test                # Psalms 23 count + text spot-check
```

## Production note

Beta serves KJV from own `bible_verse` table, not live bible-api.com calls.
App will hit `GET /bible/...` on grace-api (Phase 2).

## Surprises

None logged yet. Append to `SURPRISES.md` if API response shape differs from expected.
