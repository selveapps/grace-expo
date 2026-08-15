# Grace — TestFlight release notes

**Build 10** · staging profile · branch `feat/tf-v1-feedback`
API: `https://grace-expo-production.up.railway.app` (Railway project `grace-api-staging`, service `grace-expo`)

Supersedes **Build 7**. Builds 8 and 9 were intermediate; everything in them is
included here.

---

## User-visible changes since Build 7

### Tea

- **20 of the 30 Tea scripts are now the voice-note style** from
  `Grace_Tea_Scripts_Voice_Actors.md`, re-recorded. All performer direction is
  stripped: the Performance Guide, the notation key, and every inline tag.
  `[pause]` became an ellipsis so the read still breathes; `[soft]`,
  `[whisper]`, `[laugh]`, `[fast]`, bold, italics and inflection arrows are
  gone. The other 10 keep their previous script **and** their previous audio.
- **New mini player.** A Tea now keeps playing when you leave the Tea tab, and a
  bar above the tab bar gives you play/pause, progress and a close that stops
  it. Previously, leaving the screen silently killed playback.
- **Clip lengths shown on cards are now correct.** They had been stale: the
  duration sync had silently stopped working, so cards claimed a length the file
  did not have.
- Captions match the new audio word for word (verified 30/30).
- Em-dashes removed from caption copy, per house style.

### Carried in from Builds 8–9

- Staging host note corrected in the internal docs (see below).
- Google client IDs made drop-in for the CTO; a placeholder value can no longer
  switch on a Google button that cannot complete a sign-in.

---

## Known limitations

| Area | Limitation |
|---|---|
| **Tea scripts** | 10 of 30 are still the previous narration style: `priscilla-teach`, `sarah-laugh`, `hagar-seen`, `zelophehad`, `huldah-scroll`, `widow-mite`, `joanna-fund`, `dorcas-needle`, `phoebe-letter`, `mary-perfume`. The ElevenLabs quota ran 6,338 characters short. Quota resets **29 Aug 2026**, or top up and it is one command. |
| **Today's Tea rotation** | The daily pick rotates across all 30, so on some days the featured Tea will be one of the 10 older-style clips. Worth knowing before an influencer shoot. |
| **Clip length** | Voice-note scripts render shorter than their written targets (a human performer supplies pauses that TTS does not). Measured spread is **37–77s, avg 52s**; several sit below the original 45–70s target. |
| **Google sign-in** | Not active. No OAuth client IDs exist, so the button hides itself rather than offering a sign-in that cannot finish. Apple and email both work. |
| **Collections** | `Jesus' Parables` is empty and no collection reaches 10 stories. Needs the 26-story content render, which has not been started. |
| **Story catalogue** | Still 5 stories. |
| **Tea artwork** | Drawn vector motifs, not commissioned photography. `/img/tea/*.jpg` returns 404 by design and the app falls back cleanly. |

---

## Remaining CTO tasks

Full detail in `CTO_HANDOFF.md`. Summary:

1. Create Google OAuth client IDs (iOS + Web) and set three env vars.
2. Provision and deploy the **production** Railway service (staging is the only
   deployed environment today; `grace-api-production` is stale).
3. Wire StoreKit / IAP — the paywall does not transact.
4. App Review metadata, screenshots, privacy policy, terms, review account.
5. Analytics, crash reporting, push notifications.

---

## App Review blockers

These will fail review as the build stands:

1. **No StoreKit transaction.** The paywall shows real prices ($69.99/yr,
   $12.99/mo) but purchase calls `POST /beta/redeem`, not an IAP. Guideline
   3.1.1. **Hard blocker.**
2. **Paywall price disclosure.** The `$69.99/year after a 3-day free trial`
   footer line was removed on request. Price and period remain on the plan
   cards and the trial timeline, and full renewal terms sit under *Details*, so
   this is arguably compliant, but 3.1.2 is a known risk area. The line to
   restore is `SUMMARY[plan]` in `PaywallScreen.js`.
3. **Backend is staging.** Review must not point at a staging service.
4. **Account deletion** is implemented (5.1.1(v)) and works.
5. **Sign in with Apple** is implemented and required-compliant, given third
   party sign-in exists.

Not blockers, but reviewers may comment: empty `Jesus' Parables` collection,
and only 5 stories.
