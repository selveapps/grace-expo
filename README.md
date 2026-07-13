# Grace — Expo (React Native) App + Design Handoff

Grace is a premium, audio-first Bible companion for a discerning adult audience.
This package is **both** a runnable Expo app **and** the complete build spec so the
remaining screens can be finished without missing a detail.

---

## 1. What's in this package

```
grace-expo/
├── App.js                     # font loading, providers, navigation root
├── app.json, package.json, babel.config.js
├── src/
│   ├── theme.js               # ALL design tokens (colors, fonts, radius, type)
│   ├── data/content.js        # Bible structure (OT/NT), offline fallback text
│   ├── api/bible.js           # LIVE scripture — fetches KJV from bible-api.com
│   ├── state/profile.js       # persistent store (AsyncStorage): name, saves, reflections
│   ├── components/
│   │   ├── GraceDove.js        # ⭐ the animated mascot (svg + Animated)
│   │   ├── Waveform.js         # animated audio waveform
│   │   ├── PrimaryButton.js    # CTA w/ haptics
│   │   ├── Screen.js           # safe-area + gradient wrapper
│   │   └── Icon.js             # stroke icon set (tab bar etc.)
│   ├── navigation/
│   │   ├── RootNavigator.js    # onboarding stack -> App tabs
│   │   ├── Tabs.js             # Today / Stories / Reading / You
│   │   └── ReadingStack.js     # Reading -> OT/NT/Book/Chapter
│   └── screens/
│       ├── onboarding/         # 13 screens, fully wired end-to-end
│       ├── tabs/               # Today, Stories, Reading, You
│       └── reading/            # OldTestament, NewTestament, Book, Chapter
└── design-reference/          # the HTML design boards = pixel source of truth
```

**`design-reference/` holds the HTML design boards** (`Grace Journey`, `Grace Product`,
plus the reusable `Grace Mascot` / `Grace TabBar` / `Grace Spec`). These are **design
references** — prototypes that show the intended look, copy, motion and haptics. They are
**not** meant to ship; the RN app recreates them. Open any `.dc.html` in a browser to see
the exact target. Every remaining screen in §6 points back to a labeled screen on these boards.

---

## 2. Run it (Expo Go)

Built for **Expo SDK 50 / React Native 0.73** — the older, stable release with the widest
iOS reach (**minimum iOS 13.4**). Install the matching **Expo Go (SDK 50)** build on your
device (from the App Store; if you're on the newest Expo Go, use an SDK-50 dev build or
grab the SDK-50-compatible Expo Go).

```bash
cd grace-expo
npm install
# pin native/font deps to SDK 50 exactly:
npx expo install react-native-svg react-native-screens react-native-safe-area-context \
  expo-linear-gradient expo-haptics expo-font @react-native-async-storage/async-storage
npx expo start
```

Scan the QR with **Expo Go** (iOS/Android). The app boots into the Splash and runs the
whole flow: **Splash → Welcome → Name → Carry → Slider → Verse → Reflection → Stories
preview → Rhythm → Sign in → Preparing → Paywall → Confirmation → the 4-tab app**.

### Beta testers (staging API + tunnel)

Grace now uses the **Grace API** on Railway (not bible-api.com alone). For remote testers:

```bash
cp .env.staging.example .env
npm run start:tunnel          # share QR — works on LTE
# or: npm run start:staging   # same API, LAN only
```

Default API (no `.env`): `https://grace-api-production.up.railway.app`

Full playbook: [`docs/BETA_DISTRIBUTION.md`](docs/BETA_DISTRIBUTION.md)

> Purchases & real auth need a dev build; here they're simulated (the paywall CTA advances
> to the confirmation, "Maybe later" drops straight into the app). This matches the intended
> Expo Go testing behaviour.

Pinned to **Expo SDK 50 / RN 0.73 / iOS 13.4+**. To move to a newer SDK later, run
`npx expo install expo@^51` (or latest) then `npx expo install --fix` to realign native deps —
the `src/` code is SDK-agnostic.

---

## 3. Fidelity

**High-fidelity.** Colors, typography, spacing, copy, motion and haptics are all final and
specified. Recreate pixel-for-pixel using the tokens in `src/theme.js`. When a value isn't
in a screen file, read it off the matching board in `design-reference/`.

---

## 4. Design tokens  (`src/theme.js` is the source — summary here)

**Colors**
- Paper `#FBF9F4` · Ivory `#F7F3EC` · Ivory-warm `#FDF6E4` · Sand `#E7DDCD` · Card border `#E0D5C2`
- Brass `#B58A3F` · Brass-deep `#8F6A2C` · Gold `#E6CF94` · Ochre `#D99B4C`
- Espresso `#3A2C22` · Espresso-soft `#4A382C` · Night `#2B2740`
- Text muted `#6B5D4E` · Text faint `#9A8C76` · On-dark muted `#D8CBB8`
- Danger `#B06A4A` · Sepia (reader) `#F3E9D6` · White `#FFFDF9`

**Type** — Display: **Cormorant Garamond** (500 / 600 / 500-italic). Body/UI: **Hanken
Grotesk** (400 / 500 / 600 / 700). Loaded via `@expo-google-fonts/*` in `App.js`.

**Radius** sm 12 · md 18 · lg 22 · xl 26 · pill 100
**Spacing** 6 / 10 / 16 / 22 / 32

---

## 5. GraceDove — the emotional system

`<GraceDove size={} wings="open|folded" motion="..." />`

Implemented motions (outer, native-driver): `float`, `breathe`, `peek` (head tilt),
`celebrate` (bounce), `halo` / `loading` (revolving halo glint). `none` for static.

**Companion state → prop mapping** (used across the product):

| State | wings | motion | Where |
|---|---|---|---|
| Waiting / resting | folded | breathe | Home, empty, saved |
| Listening | folded | peek | Name, reflect, search, support |
| Guiding | open | float | Reading, navigation |
| Carrying | folded | (breathe) | Saved verses, return |
| Searching | open | loading | Loading, search, restore |
| Concerned but calm | folded | breathe + dim | Errors, offline, failed |
| Blessing / completion | open | celebrate | Success, complete, trial |

**To add per-part motion** (blink, wing flap, tail wag) beyond the outer transforms:
animate the relevant `<G>` with `react-native-svg`'s animated props (or `moti`/`reanimated`).
The exact keyframes are in `design-reference/Grace Mascot.dc.html` (the `@keyframes`
`gm-blink`, `gm-wag`, `gm-flap-*`, `gm-tilt`, `gm-glint`). Faithful outer motion already ships.

---

## 6. Screen inventory  — what's built vs. to build

Legend: ✅ implemented in this package · ⬜ to build (spec + board reference given).

### Onboarding / activation  (all ✅ — see `src/screens/onboarding/`)
Splash · Welcome · Name · Carry (chips) · Slider (feeling) · Verse reveal · Reflection ·
Stories preview · Rhythm · Sign in (Apple/Google/email) · Preparing · Paywall · Confirmation.
Board: **`design-reference/Grace Journey.dc.html`** (screens 01–13).

### Tabs  (all ✅ — `src/screens/tabs/`)
Today · Stories · Reading · You. Board: **`Grace Product.dc.html`** §01–04.

### Reading system
- ✅ Reading home, Old Testament, New Testament, Book (Psalms grid), Chapter reader (sepia).
- ⬜ **Verse action sheet** — bottom sheet: Save · Highlight · Copy · Share · Reflect ·
  Listen from here. Board: `Grace Product` "Verse · actions". Use `@gorhom/bottom-sheet`.
- ⬜ **Search** — grouped OT/NT results, recent searches. Board: "Search".
- ⬜ **Saved passages** — filter by book/theme; empty = "Nothing saved yet…". Board: "Saved passages".
- ⬜ **Light / Night reading themes** + font-size control (sepia is the default shown).

### Stories
- ✅ Stories home. ⬜ **Story detail** (Esther, play/save/related/reflect) and ⬜ **Audio
  player** (scrubber, ±15s, speed, sleep timer, transcript, save, share quote; Grace `loading`).
  Board: `Grace Product` §02 "Story · detail" and "Audio player".

### You
- ✅ You home. ⬜ **Reflections** (list/detail/edit/delete), ⬜ **Reminders** (morning/
  evening/both + time picker + pause), ⬜ **Settings** (grouped), ⬜ **Reading & Audio
  preferences**. Board: `Grace Product` §04.

### Subscription / billing  (⬜ — Board: `Grace Product` §05)
Premium-locked modal · Purchase success (Grace `celebrate`) · Purchase failed ("You haven't
been charged", Grace concerned) · Manage / restore. Copy is transparent — no fear/urgency.

### Support · Account · Permissions  (⬜ — Board: `Grace Product` §06)
Help home · Contact support (category, message, attach, email) · Account · **Delete account**
(list what's deleted; App-Store note; serious, no animation) · Notifications pre-permission.

### Edge states  (⬜ — Board: `Grace Product` §08; copy is final there)
Network (offline / audio unavailable / content failed) · Auth (signed out / session expired /
sign-in failed) · Content (no results / no saved / end of book) · Payment (trial expired /
restore failed / canceled-but-active) · Accessibility (large font / reduced motion / night).
Every message is written in Grace's voice on the board — copy them verbatim.

> The **offline Today**, **purchase failed**, and **premium-locked** patterns are already
> demonstrated (offline Today is on the Product board; wire it behind a NetInfo check).

---

## 7. Interactions, state, haptics

**Navigation.** Onboarding is one native-stack (`RootNavigator`); the last step
`reset`s into the `App` tab navigator so back doesn't return to the paywall. Reading is its
own nested stack so chapter/book pushes keep the tab bar.

**State & persistence.** `src/state/profile.js` is a real **AsyncStorage-backed store** —
name, carrying[], gentleness, rhythm, **savedVerses[]**, **reflections[]**, and an `onboarded`
flag, all persisted on every change and rehydrated on boot. `useProfile()` exposes
`setProfile`, `saveVerse`, `removeVerse`, `isSaved`, `addReflection`. Because it persists:
- the name entered in onboarding shows on Today / Verse / Confirmation / You and **survives restarts**;
- **relaunching the app skips onboarding** and lands returning users on Today (gated on `profile.onboarded`);
- verses you keep (onboarding "Amen", or press-and-hold in the reader) are stored and marked ✦.

**Live scripture backend.** `src/api/bible.js` calls **bible-api.com** (a free, public, no-key
KJV API) — this is a real network backend, not mock data:
- `getChapter(book, chapter)` loads the actual chapter into the reader;
- `verseForCarrying([...])` maps the user's intention to a fitting reference and fetches it for the onboarding reveal;
- `todaysVerse()` returns a real verse that's stable per calendar day.
Every call **falls back to bundled text offline** so the app never dead-ends. (A private
server can't be hosted from the design tool; this public API is the genuine, running backend.
Swap in your own endpoint/translation by editing `BASE` in `api/bible.js`.)

**Services layer (`src/services/`) — the backend seam.** Every screen talks to these
interfaces, never to storage or the network directly, so a real server swaps in without
touching UI. Import from `../services`:
- **`StorageService`** — the only place AsyncStorage is touched (`get/set/remove/clearUserData`), namespaced keys in `KEYS`.
- **`AuthService`** — guest-first: `ensureGuest`, `signInWith{Apple,Google,Email}` (mocked in Expo Go; real providers need a dev build), `linkGuestAccount`, `signOut`.
- **`ReadingService`** — `getTestaments/getBooks/getBook` (from `data/bookMeta` — all 66 books, real chapter counts), `getChapter` (live text), `search`, saved verses, and reading progress.
- **`VerseService`** — `getDaily`, `getForCarrying`, `getByRef`.
- **`StoryService`** — stories, collections, continue-listening, per-story progress (mock content, real progress).
- **`AudioService`** — subscribe-able player (`loadStory/play/pause/seek/setSpeed`); runs a mock engine now, swap for `expo-av` when audio assets land.
- **`SubscriptionService`** — `getOfferings/getStatus/purchase/restore/cancel`; **wired into the Paywall** — starting the trial persists a real `trialing` state that expires after 3 days.
- **`NotificationService`** — reminder prefs + scheduling (uses `expo-notifications` if present, else persists and no-ops — Expo Go safe).
- **`SupportService`** — `submitTicket` with categories.
- **`TodayService`** — `getToday(profile)` assembles the daily payload from the services above.

`state/profile.js` (React context) remains the live UI binding for name/carrying/saved/
reflections; the services are the lower-level data layer it (and future screens) delegate to.
See **`BACKEND.md`** for the server that replaces the mocked/public pieces.

**Haptics** (via `expo-haptics`, already wired in `PrimaryButton` and inputs):

| Action | Feedback |
|---|---|
| Button tap | `impactAsync(Light)` |
| Chip / plan / slider detent | `selectionAsync()` |
| Name accepted / purchase success | `notificationAsync(Success)` |
| Verse reveal / arrival | `impactAsync(Soft)` |
| Error | muted low `impactAsync(Light)` — never alarming |

**Motion principles:** glow, settle, breathe, reveal, unfold — never bounce/confetti/flash.
Errors soften (dim halo), never shake. Loading is a slow halo, not a spinner. Lapses never shame.

---

## 8. Assets
No raster assets — GraceDove and all icons are vector (`react-native-svg`). Fonts come from
`@expo-google-fonts`. Bible text in `data/content.js` is KJV (public domain) sample content;
swap in your licensed translation + full text for production.

---

## 9. Suggested build order for the rest
1. Verse action sheet + Saved passages (completes the reading loop).
2. Story detail + Audio player (the audio-first promise).
3. You sub-screens (Reflections, Reminders, Settings).
4. Subscription states + real IAP (dev build) .
5. Support / Account / Delete.
6. Edge states via NetInfo + error boundaries, using the board copy verbatim.
7. Per-part GraceDove motion (blink/flap/tail) from the Mascot board keyframes.
```
