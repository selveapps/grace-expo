# Grace — TestFlight QA checklist

**Build 10** · staging API · ~20–30 minutes on a real iPhone.

Work top to bottom; the order matters (onboarding must be first, offline last).
Mark each row and add a note on anything that is not a clean pass.

> **Reset between full runs:** delete the app and reinstall from TestFlight.
> Onboarding only shows once per install.

Legend: **P** = pass · **F** = fail · put anything odd in Notes even if it passed.

---

## 1. Install and first launch

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 1.1 | Home-screen icon | The new Grace icon (halo dove on cream). Not the old one, not a white square | ☐ | |
| 1.2 | App name under icon | `Grace` | ☐ | |
| 1.3 | Cold launch | Branded splash, no white flash, no spinner on a different background | ☐ | |
| 1.4 | Launch time | Usable in under ~3s on a modern phone | ☐ | |

## 2. Onboarding

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 2.1 | Welcome → Continue | Advances | ☐ | |
| 2.2 | Name step, empty Continue | Blocks and prompts; does not advance | ☐ | |
| 2.3 | Enter a name | Greeting line updates live with your name | ☐ | |
| 2.4 | "What are you carrying" | Multi-select works; Continue needs ≥1 | ☐ | |
| 2.5 | Gentleness slider | Moves, label updates | ☐ | |
| 2.6 | **Verse step** | A **multi-verse passage** relevant to your choices. **Not** a single line, **not** Psalm 23:1 | ☐ | |
| 2.7 | Pick `Courage` earlier, check verse | Should be Psalm 27:1-3, not Psalm 23:1 | ☐ | |
| 2.8 | Keep this verse | Advances; verse later appears on Home | ☐ | |
| 2.9 | Stories preview | Sample plays, ~18–35s, not a full 3-minute story | ☐ | |
| 2.10 | Review prompt | "Not right now" advances without a store prompt | ☐ | |

## 3. Authentication (the gate)

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 3.1 | Scan the auth screen | **No** "Skip for now". **No** "Continue with Google" (expected: no client IDs yet) | ☐ | |
| 3.2 | Tap empty space around the buttons | Nothing happens; you stay on the gate | ☐ | |
| 3.3 | Swipe back / Back control | Returns to the previous onboarding step, never forward into the app | ☐ | |
| 3.4 | **Continue with Apple** | Real Apple sheet → Preparing → paywall | ☐ | |
| 3.5 | Apple sheet, then cancel | Returns to the gate with **no** error message | ☐ | |
| 3.6 | Airplane mode → Continue with Apple | Clear error + **Try again**; does **not** enter the app | ☐ | |
| 3.7 | Network back on → Try again | Same attempt replays and succeeds | ☐ | |
| 3.8 | "Use my email instead" → bad address | Rejected inline, no network call | ☐ | |
| 3.9 | Email, valid address | Advances. Copy says it will **not** email to verify | ☐ | |
| 3.10 | Force-quit mid-auth, relaunch | Still in onboarding, not in the app | ☐ | |

## 4. Paywall

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 4.1 | Layout | Annual + Monthly, prices visible, 3-day timeline | ☐ | |
| 4.2 | Footer | **No** `$69.99/year after a 3-day free trial…` line. `Details`, `Terms`, `Privacy` present | ☐ | |
| 4.3 | Tap `Details` | Expands full renewal terms | ☐ | |
| 4.4 | `Restore purchase` | Present and tappable; reports honestly when nothing to restore | ☐ | |
| 4.5 | **Decline:** tap empty space | Smooth fade → Home. No paywall reappearing, no "Your place is ready" | ☐ | |
| 4.6 | Check You → Subscription after 4.5 | **Not** subscribed | ☐ | |
| 4.7 | **Success:** Start 3-day free trial | → Confirmation showing **your real name**, not "friend" | ☐ | |
| 4.8 | Confirmation subtext | "Everything is open for the next three days. Let's begin." | ☐ | |
| 4.9 | Enter Grace | Lands on Home promptly; no long stall, no bounce back to paywall | ☐ | |
| 4.10 | **Failure:** airplane mode → Start trial | Stays on paywall, recoverable error, **no** entitlement granted | ☐ | |

## 5. Home (Today)

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 5.1 | Greeting | Time-appropriate + your name | ☐ | |
| 5.2 | Verse card | Multi-verse passage, readable, not overflowing the card | ☐ | |
| 5.3 | `Today's listen` | Shows a real title + duration, **not** "Preparing…" | ☐ | |
| 5.4 | Tap it | Opens the player and **starts playing** | ☐ | |
| 5.5 | `Read · <book> <ch>` | Opens the reader at that chapter | ☐ | |
| 5.6 | Back from that chapter | Leaves the reader; does **not** dead-end | ☐ | |
| 5.7 | `Continue ·` row | Only appears once something is genuinely part-played | ☐ | |

## 6. Tea — the priority surface

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 6.1 | Stories tab → Tea segment | Tea surface loads | ☐ | |
| 6.2 | Overall look | **Light/ivory**, not dark brown | ☐ | |
| 6.3 | Card titles | Every card has a short 3–4 word title | ☐ | |
| 6.4 | Card art | Motif relates to the passage (crown, wheat, scroll, coins…) | ☐ | |
| 6.5 | Scroll the archive | Smooth, no blank cards, no jank | ☐ | |
| 6.6 | Tap a card | Title holds briefly, lifts away; goes into art + captions. No duplicate heading | ☐ | |
| 6.7 | Grace lockup | Bird + "Grace" **top-centre**, clear of the notch. Only one on screen | ☐ | |
| 6.8 | Press play | Audio starts; **lockup stays visible** while playing | ☐ | |
| 6.9 | **Captions** | Track the audio word-for-word, no drift by the end of the clip | ☐ | |
| 6.10 | Chrome while playing | Back/Share recede; tapping the frame brings them back | ☐ | |
| 6.11 | Replay control | Restarts from 0:00 | ☐ | |
| 6.12 | Time remaining | Counts down and reaches ~0 as audio ends (**not** stuck) | ☐ | |
| 6.13 | Scripture chip | Opens that book in Reading; back returns cleanly | ☐ | |
| 6.14 | Share | Sheet shows hook + reference + "Tea from Grace" | ☐ | |
| 6.15 | Next tea | Loads the next one with its title carried in | ☐ | |
| 6.16 | Like / Save | Toggle and persist across app restart | ☐ | |
| 6.17 | Sample 5 clips end-to-end | Voice is energetic/conversational; audio matches on-screen captions | ☐ | |
| 6.18 | Old-style clips | 6 clips are the previous narration style: `priscilla-teach`, `hagar-seen`, `zelophehad`, `widow-mite`, `joanna-fund`, `dorcas-needle`. Confirm they still play and caption correctly | ☐ | |
| 6.19 | **End of any clip** | The last caption is the last words of the script. A literal `---` must **never** appear | ☐ | |
| 6.20 | The 7 rewritten clips | `phoebe-letter`, `magdalene-first`, `canaanite-mother`, `bleeding-woman`, `sarah-laugh`, `huldah-scroll`, `mary-perfume` — audio matches captions word for word | ☐ | |
| 6.21 | Quoted scripture | Quotes inside the narration are KJV wording ("Truth, Lord…", "Nay; but thou didst laugh") | ☐ | |

## 7. Mini player

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 7.1 | Play a Tea, then go back to the Tea list | Bar appears above the tab bar, audio keeps playing | ☐ | |
| 7.2 | Bar contents | Title, reference, play/pause, progress, close | ☐ | |
| 7.3 | Switch to Today / Reading / You | Bar persists on every tab | ☐ | |
| 7.4 | Pause from the bar | Audio stops, icon flips to play | ☐ | |
| 7.5 | Resume from the bar | Audio continues from where it paused | ☐ | |
| 7.6 | Close (✕) | Audio stops and the bar disappears | ☐ | |
| 7.7 | Re-enter that Tea's detail screen | Bar hides (detail owns the controls); no double controls | ☐ | |
| 7.8 | Bar vs tab bar | Bar never covers the tabs; tabs stay tappable | ☐ | |

## 8. Background audio and interruptions

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 8.1 | Play Tea, lock the phone | Audio continues | ☐ | |
| 8.2 | Play Tea, go to another app | Audio continues | ☐ | |
| 8.3 | Silent switch on | Audio still audible (`playsInSilentModeIOS`) | ☐ | |
| 8.4 | Incoming call / timer alarm | Audio ducks or pauses, then app is still usable afterwards | ☐ | |
| 8.5 | Play Spotify/Music, then play a Tea | Sensible hand-off, no double audio | ☐ | |
| 8.6 | Unplug/replug headphones mid-clip | No crash | ☐ | |
| 8.7 | Play a Story, then open a Tea | Only one audio stream at a time | ☐ | |

## 9. Stories

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 9.1 | Stories tab | Featured card with artwork, 6 collection chips, story list | ☐ | |
| 9.2 | All 6 collections tappable | Each opens; back returns to Stories | ☐ | |
| 9.3 | `Jesus' Parables` | Empty state (known limitation), not a crash | ☐ | |
| 9.4 | Open a story | Detail shows hook, parts, narration preview | ☐ | |
| 9.5 | Play | Audio starts | ☐ | |
| 9.6 | **Remaining time** | Shows a real value, **not** `-0:00` | ☐ | |
| 9.7 | **+15s / −15s** | Both move playback | ☐ | |
| 9.8 | **Scrub the bar** | Seeks to that point | ☐ | |
| 9.9 | Speed control | Cycles 1× → 1.25× → 1.5× → 0.75× and audibly changes | ☐ | |
| 9.10 | Transcript | Opens; tapping a line seeks there | ☐ | |
| 9.11 | Close player, reopen | Resumes near where you left off | ☐ | |
| 9.12 | After playing from Home, tap Stories tab | Returns to the Stories **list** — Tea and collections still reachable | ☐ | |

## 10. Reading

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 10.1 | Reading tab | Continue card, OT/NT, themes | ☐ | |
| 10.2 | Old Testament → Wisdom & Poetry → Psalms | Book screen opens | ☐ | |
| 10.3 | **Book title** | "Psalms" clearly legible against the dark header | ☐ | |
| 10.4 | Chapter count | 150, and range chips 1-25 … 126-150 | ☐ | |
| 10.5 | Resume card | Names a real chapter | ☐ | |
| 10.6 | Open a chapter | Text loads, verse numbers present | ☐ | |
| 10.7 | Page forward 2–3 chapters | Advances each time | ☐ | |
| 10.8 | **Back after paging** | Returns to the **book**, not one chapter at a time | ☐ | |
| 10.9 | Font size / theme controls | Apply immediately and persist | ☐ | |
| 10.10 | Long-press a verse | Options sheet (save, copy, highlight) | ☐ | |
| 10.11 | Save a verse | Appears in You → Saved | ☐ | |

### 10a. Browse by theme (new — these chips did nothing before)

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 10a.1 | Tap **Courage** | Theme screen opens. It must *navigate*, not just buzz | ☐ | |
| 10a.2 | Passage list | 8 passages, each with reference, verse text and a one-line note | ☐ | |
| 10a.3 | Verse text | Real KJV text, not a spinner that never resolves | ☐ | |
| 10a.4 | Tap **Psalm 27:1-3** | Opens Psalms 27 **scrolled to verse 1**, lightly highlighted | ☐ | |
| 10a.5 | Back | Returns to Reading, not out of the tab | ☐ | |
| 10a.6 | All 8 chips | Comfort, Anxiety, Grief, Hope, Forgiveness, Courage, Rest, Gratitude each open a populated screen | ☐ | |
| 10a.7 | Airplane mode | References and notes still render; verse text degrades without crashing | ☐ | |

## 11. Search

Every one of these returned "No verses found" before this build.

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 11.1 | Search "peace" | Results in **both** OT and NT | ☐ | |
| 11.2 | Type, do not press Go | Results appear on their own (~350ms) | ☐ | |
| 11.3 | Matched words | Highlighted in brass inside each verse | ☐ | |
| 11.4 | Result count | Reads "Showing 100 of 420 verses", not "100 verses" | ☐ | |
| 11.5 | **Search "John 3:16"** | Returns that exact verse | ☐ | |
| 11.6 | Search "Psalm 23" | Returns all 6 verses of the psalm | ☐ | |
| 11.7 | Search "ps 23:1-4" | Abbreviation and range both resolve | ☐ | |
| 11.8 | Search "faith hope charity" | Finds 1 Corinthians 13:13 (all words, not one phrase) | ☐ | |
| 11.9 | Tap a result | Opens that chapter at that verse | ☐ | |
| 11.10 | Suggestion chips | Shown before first search; tapping one runs it | ☐ | |
| 11.11 | Clear (✕) | Returns to suggestions | ☐ | |
| 11.12 | Search gibberish | "No verses found for …", calm, no crash | ☐ | |
| 11.13 | Empty / one character | No request fired, no crash | ☐ | |
| 11.14 | **Airplane mode, then search** | Says the library is unreachable — must **not** say "No verses found" | ☐ | |

## 12. You / Settings

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 12.1 | You tab | Name, saved verses, reflections | ☐ | |
| 12.2 | Subscription | Reflects real state (subscribed vs not) | ☐ | |
| 12.3 | Reminders | Toggle; permission prompt appears once | ☐ | |
| 12.4 | Reading/Audio preferences | Persist across relaunch | ☐ | |
| 12.5 | Privacy policy / Terms links | Open in browser | ☐ | |
| 12.6 | Help & support | Composes correctly | ☐ | |
| 12.7 | **Sign out** | Returns to onboarding, not a blank screen | ☐ | |
| 12.8 | **Delete account** | Confirms, deletes, returns to onboarding (Guideline 5.1.1(v)) | ☐ | |

## 13. Relaunch and persistence

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 13.1 | Force-quit and reopen | Straight to Home, onboarding does **not** repeat | ☐ | |
| 13.2 | Saved verses, reflections, progress | All still there | ☐ | |
| 13.3 | Reopen after Tea playing | No orphan mini player with no audio | ☐ | |

## 14. Offline

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 14.1 | Airplane mode → Home | Loads from cache, no crash, no infinite spinner | ☐ | |
| 14.2 | Airplane mode → Tea list | Cards still listed | ☐ | |
| 14.3 | Airplane mode → play a Tea | Calm error, no crash | ☐ | |
| 14.4 | Airplane mode → a cached chapter | Still readable | ☐ | |
| 14.5 | Restore network | Recovers without a restart | ☐ | |

## 15. Visual polish and performance

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 15.1 | Tab bar | Frosted, no hard line, labels not clipped | ☐ | |
| 15.2 | Safe areas | Nothing under the notch or home indicator | ☐ | |
| 15.3 | Long name in onboarding | Greeting does not overflow | ☐ | |
| 15.4 | Rotate the device | No broken layout (portrait-locked is fine) | ☐ | |
| 15.5 | iOS text size XXL | Nothing unreadable or clipped | ☐ | |
| 15.6 | Scroll Tea + Stories fast | 60fps, no blank frames | ☐ | |
| 15.7 | 10 minutes of use | No memory-pressure crash, no runaway battery | ☐ | |
| 15.8 | Dark mode | App is light-locked; confirm nothing turns unreadable | ☐ | |

## 16. Edge cases

| # | Test | Expected | P/F | Notes |
|---|---|---|---|---|
| 16.1 | Tap a Tea card repeatedly, fast | One detail screen, no stacking | ☐ | |
| 16.2 | Start a Tea, immediately go back | No orphan audio | ☐ | |
| 16.3 | Play Tea + open a Story | Only one stream | ☐ | |
| 16.4 | Leave a Tea playing to the end from another tab | Bar clears itself when the clip finishes | ☐ | |
| 16.5 | Tap Share and cancel | No crash | ☐ | |
| 16.6 | Low Power Mode | Audio still plays | ☐ | |
| 16.7 | Very slow network (Network Link Conditioner) | Loading states, not frozen UI | ☐ | |
| 16.8 | Background 10+ minutes, return | App resumes, no white screen | ☐ | |

---

## Sign-off

| | |
|---|---|
| Tester | |
| Device / iOS | |
| Build | 10 |
| Date | |
| Blocking failures | |
| Non-blocking notes | |
