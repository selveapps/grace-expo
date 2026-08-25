# Grace — App Store submission assets

Everything App Store Connect needs for the v1.0 listing, kept in the repo so v1.1
is reproducible rather than rebuilt from memory.

- `LISTING.md` — the full listing spec: name, subtitle, keyword field, description,
  promotional text, categories, subscription metadata, App Review notes.
- `01-hero.png` … `05-reading.png` — the five screenshots, in upload order.
- `00-app-preview-plays-in-browser.html` — the animated preview mockup. **Not
  uploadable.** See "App preview video" below.

---

## Upload order

Screenshots appear in App Store Connect in the order they are uploaded, and
slots 1–3 are the only ones visible in search results without a tap.

| Slot | File | Caption on the frame |
|---|---|---|
| 1 | `01-hero.png` | Your Bible, made for you. |
| 2 | `02-tea.png` | Bible takes worth sharing. |
| 3 | `03-verse.png` | A verse for what you're carrying. |
| 4 | `04-audio.png` | Bible stories, beautifully told. |
| 5 | `05-reading.png` | The whole Bible, gently arranged. |

If an app preview video is uploaded it takes the first slot automatically and
its poster frame becomes the thumbnail, pushing the screenshots down one.

---

## Which frame maps to which app screen

These are **rendered mockups**, not device captures. The mapping below is what
each frame is meant to depict, so a regenerated frame can be matched to the real
screen it stands for.

| File | App screen | Source | What it shows |
|---|---|---|---|
| `01-hero.png` | Today tab | `src/screens/tabs/TodayScreen.js` | Greeting, "I kept our place", verse card (Psalm 23:1), "Listen to today's reading" audio bar |
| `02-tea.png` | Stories tab → Tea | `src/screens/stories/`, `src/components/TeaArt.js` | Today's Tea card (Esther 1:12), the 30-card archive grid, tab bar |
| `03-verse.png` | Onboarding → Verse | `src/screens/onboarding/VerseScreen.js` | Carry chips (Worry / Hope / Rest / Gratitude), verse card, "Keep this verse" |
| `04-audio.png` | Story player | `src/screens/stories/`, `src/components/Waveform.js` | Now Playing, Esther 4–5 Part 2, scrubber, speed and skip controls |
| `05-reading.png` | Reading tab → Chapter | `src/screens/reading/ChapterScreen.js` | Psalm 23 in the sepia reader, verse 3 highlighted, Save / Highlight / Share sheet |

---

## Dimensions

All five PNGs are **1290 × 2796**.

App Store Connect **accepts** 1290 × 2796 for the 6.9 inch iPhone class, so these
can be uploaded as they are. But 1290 × 2796 is the native size of the 6.7 inch
class; the 6.9 inch native size is **1320 × 2868**. Uploading the smaller set
means Apple upscales it, which is visibly softer on an iPhone Pro Max — the
device most likely to be looking at the listing.

**Regenerate at 1320 × 2868 whenever a frame is being redone anyway.** Mixed
sizes across the set are fine; App Store Connect takes each frame on its own.

`03-verse.png` has to be redone regardless — see below — so that one should come
back at 1320 × 2868.

---

## `03-verse.png` must be regenerated — scripture licensing

The verse card in this frame reads:

> Do not be anxious about anything, but in every situation, present your requests
> to God. — PHILIPPIANS 4:6

That is the **New International Version**. The NIV is owned by Biblica and
licensed through HarperCollins Christian Publishing. Grace does not hold a
licence for it and must not ship it in store metadata.

The app itself is clean: it serves **King James Version** throughout, from
`backend/data/kjv.normalized.json` and from `bible-api.com?translation=kjv`
(`src/api/bible.js`). The NIV wording exists only in this mockup and in
`00-app-preview-plays-in-browser.html`. It never reached shipped content.

The KJV text for the same reference is:

> Be careful for nothing; but in every thing by prayer and supplication with
> thanksgiving let your requests be made known unto God.

That is considerably longer than the NIV line and will not drop into the same
card at the same type size. Two options when regenerating:

1. Use a shorter KJV passage that suits the "carrying" frame — the app maps
   `Worry → Matthew 6:25-27` in `src/api/bible.js`, which is the mapping the real
   screen would actually produce.
2. Keep Philippians 4:6 and set the card in the stepped-down size the real
   `VerseCard` uses for long passages (`scaleFor()` in
   `src/components/VerseCard.js` drops to 0.72 past 320 characters).

Option 1 matches what a user would really see, so it is the better frame.

Do not hand-write replacement verse text. Pull it from the KJV seed or from
bible-api.com so the screenshot and the app cannot drift apart again.

---

## App preview video

**The HTML file in this folder cannot be uploaded, and screen-recording it is not
an acceptable substitute.** Apple requires app previews to be captured from the
real app running on a real device, and rejects previews containing non-device
footage. `00-app-preview-plays-in-browser.html` is a design mockup — recording
the browser window would be rejected, and it also still contains the NIV text.

To produce an uploadable preview:

- Capture on device from the shipped build.
- **15 to 30 seconds.** App Store Connect rejects anything outside that range.
  The mockup is cut to 10 seconds, so it is short by at least five even as a
  storyboard.
- Portrait, H.264, 30fps, 1080 × 1920 (or 886 × 1920).
- Show audio starting within the first three seconds.
- Choose the poster frame deliberately — it becomes slot 1.

The beat sheet in the mockup is still a usable storyboard: Tea card and archive
(0–2s), the share card (2–4s), Psalm 23 in the reader (4–6s), verse card and
audio bar (6–8s), wordmark and CTA (8–10s). Hold the end card longer to clear
the 15 second floor.

---

## Blocking: the paywall does not charge

v1.0 cannot be submitted as it stands. `SubscriptionService.purchase()` calls
`POST /beta/redeem` and grants a beta entitlement; it never requests a product
from the store. A subscription app whose paywall does not transact fails
Guideline 3.1.1, and the two products cannot be reviewed against a build that
never exercises them.

The client code exists and is not the blocker — see `feat/m11-iap-revenuecat`
(RevenueCat + Superwall, plus the API webhook) and `docs/IAP_REVENUECAT_SUPERWALL.md`.
It is held back on App Store Connect setup, in this order, each step gated by the
one above it:

1. **Paid Applications Agreement active** — Agreements, Tax, and Banking. Needs
   banking details and tax forms, not just a signature, and verification runs on
   Apple's clock. This is the long pole.
2. **Create `grace.plus.annual` and `grace.plus.monthly`** — App Store Connect
   does not allow in-app purchases to be created until step 1 is active.
3. **RevenueCat** — entitlement `grace_plus`, offering `default`, webhook
   secrets on Railway.
4. **EAS dev build** — IAP has no native module in Expo Go, and
   `react-native-purchases` is a new native dependency, so this is a full build
   rather than an OTA update.
5. **Sandbox purchase**, then confirm the webhook flips `GET /me` to
   `subscribed: true`.

Also on the checklist and not yet done: the demo account in `LISTING.md` still
has `[fill in]` for a password.

---

## Known mismatches with `LISTING.md`

Worth reconciling before submission; neither is fixed here because both are
content decisions.

1. **Frame count and captions.** `LISTING.md` §5 specifies six frames with
   different captions ("A Bible that reads itself to you", "She keeps your place,
   not a streak", and an evening-prayer frame). The delivered bundle is five
   frames with different copy. The spec's frame 3, "She keeps your place, not a
   streak", is called out there as the sharpest frame in the set and has no
   corresponding PNG.
2. **Translation named in the App Review notes.** `LISTING.md` §6 tells the
   reviewer the scripture is "the World English Bible (public domain), served via
   bible-api.com". The app serves **KJV** — see `src/legal.js`
   `scriptureAttribution` and the `?translation=kjv` request in `src/api/bible.js`.
   The note should say King James Version.
