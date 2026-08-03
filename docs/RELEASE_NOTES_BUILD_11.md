# Grace — release notes

**Changes since Build 10** · branch `feat/tf-v1-feedback`

> No TestFlight build has been cut for this work yet. Everything below is
> committed, and the API half is **live on staging** (`grace-api-staging`,
> commit `f36c43e`) — pushing this branch deploys staging automatically. The
> client half needs `eas build`, which has not been run.
>
> The production service `grace-api-prod` was **not** touched; it remains on
> `75385ce` and is currently returning 502 (see `CTO_HANDOFF.md` §2).

---

## Tea — 7 scripts rewritten

Seven Teas now use the supplied scripts, re-recorded with matching captions:

| Card | Id | Length |
|---|---|---|
| A Succourer Of Many | `phoebe-letter` | 60s |
| The First To See | `magdalene-first` | 56s |
| She Argued For Crumbs | `canaanite-mother` | 57s |
| Twelve Years, One Touch | `bleeding-woman` | 50s |
| Laughter Behind The Tent | `sarah-laugh` | 66s |
| They Asked The Prophetess | `huldah-scroll` | 50s |
| A Year Poured Out | `mary-perfume` | 58s |

Four of these (`phoebe-letter`, `sarah-laugh`, `huldah-scroll`, `mary-perfume`)
were among the ten left on the earlier narration in Build 10, so **24 of 30**
are now the current style. The remaining six are listed under *Known
limitations*.

### One deliberate change to the supplied text

The drafts quoted modern paraphrases inside quotation marks. Those are now
verbatim KJV, because the product's whole claim is that she can look the line up
and find it exactly as she heard it. What changed:

| Draft | Shipped (KJV) |
|---|---|
| "Yes, Lord, yet even the dogs eat the crumbs that fall from their masters' table." | "Truth, Lord: yet the dogs eat of the crumbs which fall from their masters' table." |
| "I did not laugh." / "No, but you did laugh." | "I laughed not." / "Nay; but thou didst laugh." |
| "Leave her alone. She has kept this for the day of My burial…" | "Let her alone: against the day of my burying hath she kept this." |

Four other quotes were extended to a full clause rather than cut mid-verse
without an ellipsis, and one cross-verse splice was rewritten as narration plus a
single-verse quote.

Three factual corrections were also made where the drafts stated inference as
fact: Phoebe carrying the letter to Rome is now marked as inference (it is not in
the text); Sarah's visitors are "three men" (Genesis 18:2 — the two angels arrive
in Genesis 19); and the Huldah delegation no longer says "they don't go to the
priests", because Hilkiah the high priest was himself in it.

**Every quoted span in all seven scripts is now verbatim KJV** — checked
programmatically against the full text, 0 failures.

### The `---` marker is gone

Seventeen Teas carried a `---` separator left over from the original drafting
format. It was never content, but it was in the text sent to TTS, so it came back
as a trailing word timing — meaning **every one of those clips ended by drawing a
literal `---` caption over the artwork.** On an influencer screen recording that
was the last thing on screen.

Removed from the catalog and from the caption sidecars. No audio was
re-rendered: the marker was the final token in all seventeen, so the clips keep a
fraction of a second of trailing silence and no caption is drawn for it. A unit
test now fails if it comes back.

---

## Reading — browse by theme

The eight theme chips were inert. `onPress` fired a haptic and nothing else.

Each chip now opens a curated set of **eight passages**, with the verse text and
a one-line reason it is on the list. Tapping a passage opens that chapter and
scrolls to and highlights that verse. 64 passages, every reference verified
against the KJV.

---

## Reading — search actually works

Search returned nothing for every query. Two independent causes:

1. **The verse table is empty.** Search read `bible_verse`, which is populated by
   a seed that crawls 1,189 chapters from a public API that rate-limits after
   about fifteen. It had never completed, so the table was empty on staging and
   every query returned `{"ot":[],"nt":[]}` — rendered as "No verses found",
   indistinguishable from a real empty result. The same gap made
   `/bible/:book/:chapter` 404 for every chapter and sent
   `/verse/for-carrying` to its hardcoded Psalm 23:1.
2. **References could never match.** The query was a substring match against
   verse *text*, so "John 3:16" — the most obvious thing to type — matched
   nothing, because no verse contains its own reference.

Fixed by shipping the KJV with the API (`backend/data/kjv.full.json`, 4.2 MB, 66
books, 31,100 verses, public domain) and reading Postgres first, that file
second. Also in this pass:

- Reference queries resolve to the passage: `John 3:16`, `Psalm 23`, `ps 23:1-4`,
  `1 Cor 13:4`.
- Multi-word queries require all words rather than one exact adjacent phrase, so
  "faith hope charity" finds 1 Corinthians 13:13.
- Whole-phrase matches rank first; everything else stays in canonical order.
- The result cap is split across testaments. Canonical order meant a common word
  filled the entire 100-result budget with Old Testament verses and reported the
  New Testament as empty.
- Results arrive as you type, matched words are highlighted, and the count says
  "Showing 100 of 420" rather than implying it found 100.
- A failed request now says the library is unreachable instead of claiming the
  word is not in the Bible.

**Side effect worth knowing:** `/verse/for-carrying?tags=Courage` now returns
Psalm 27:1-3 from the server. It previously returned Psalm 23:1 and the client
carried a workaround to distrust that answer. Reading also now survives a
Postgres outage.

---

## Drift that was found and closed

Two files claimed to be generated and were not, so both had drifted:

- `src/services/TeaService.js` — the offline Tea fallback still held the **v1
  scripts** with `---` markers and durations no rendered file had matched for
  several builds. Offline, the app told a different story than online.
  `npm run sync:tea-fallback` now generates it.
- `docs/TEA_SCRIPTS.md` — same problem. `npm run sync:tea-doc` now generates it.

---

## Verification

| Check | Result |
|---|---|
| Backend typecheck | clean |
| Backend unit tests | 43 passed |
| `verify:audio` (MP3 + sidecar + text + duration) | 48 assets, all verified |
| KJV fidelity of the 7 scripts | 0 non-verbatim quotes |
| Theme references resolve | 64/64 |
| e2e — themes and search | 8 passed |
| e2e — regression (tabs, screens, tea titles) | 7 passed |
| Scripture routes with **no database at all** | search, chapters and carry-verse all correct |

Confirmed on staging after deploy: `search "peace"` → 420 total, 50 OT + 50 NT;
`"faith hope charity"` → 1 Corinthians 13:13; `"ps 23:1-4"` → 4 verses;
`/bible/Psalms/23` and `/bible/Genesis/1` → 200; `/verse/for-carrying?tags=Courage`
→ Psalm 27:1-3; audio Range → 206; 30 teas, 0 `---` markers, new durations live.

Integration tests still need Postgres and were not run; there is no Docker in
this environment.

---

## Known limitations

| Area | Limitation |
|---|---|
| **Tea scripts** | 6 of 30 remain the earlier narration: `priscilla-teach`, `hagar-seen`, `zelophehad`, `widow-mite`, `joanna-fund`, `dorcas-needle`. Each is internally consistent; they just read differently. ~5,000 ElevenLabs characters remain this period, resetting 29 Aug 2026. |
| **Trailing silence** | The 17 clips that had `---` keep 0.2–0.7s of trailing audio where it was rendered. Inaudible, and no caption is drawn, but the MP3s were not re-cut. |
| **Search scope** | Keyword search is a linear scan over 31,100 verses in the API process (~5ms). Fine at this size; if the corpus grows, move to Postgres full-text. |
| **Offline search** | Requires the API. Chapters still fall back to `bible-api.com` and then to cache; search does not. |
| **Google sign-in** | Still inactive, pending OAuth client IDs. |
| **StoreKit** | Still unwired. The hard App Review blocker, unchanged. |
| **Collections** | `Jesus' Parables` still empty; still 5 stories. |
