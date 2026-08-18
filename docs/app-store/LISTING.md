# Grace: App Store Connect Listing Spec

Version 1.0 submission. All copy is em dash free. Every string below is ready to paste.

---

## 1. Name and subtitle

### App Name (30 char limit)

**Your version:** `Grace: Bible BFF For Women` (26 chars)

**Recommended alternative:** `Grace: Daily Bible for Women` (28 chars)

The name field is the single heaviest ASO signal Apple has. "BFF" has negligible search volume in this demographic and conflicts with the locked brand register. "Daily" is a genuine high-volume modifier that pairs with devotional, verse, prayer and reading.

**Home screen name (CFBundleDisplayName):** `Grace`

Setting a shorter home screen name than the store name is normal and does not trigger review issues, because the first word matches.

### Subtitle (30 char limit)

`Daily audio devotions & prayer` (30 chars exactly)

Do not repeat words already in the name. Apple indexes name, subtitle and keyword field as one combined pool and duplicates waste characters.

---

## 2. Keyword field (100 char limit)

```
catholic,christian,verse,scripture,rosary,faith,jesus,god,journal,study,gospel,psalm,day,plan,night
```

99 characters used.

**Rules applied:**
- Comma separated, no spaces after commas. A space costs a character.
- No repeats of grace, bible, women, daily, audio, devotions or prayer, since those already sit in the name and subtitle.
- Singular forms only. Apple stems plurals automatically.
- No "app", no "free", no competitor brand names. Competitor names are a 5.2 rejection risk.
- Apple auto-combines across fields, so "bible" plus "study" already ranks you for "bible study" without spending characters on the phrase.

**Held in reserve for the 1.1 update, once you have install data:** lent, advent, saint, worship, hope, calm, sleep, meditation, verse of the day.

---

## 3. Description

The iOS description is **not** indexed for App Store search. It is a conversion asset, not a ranking asset. Only the first three lines show before the "more" fold, so those lines carry almost all the weight.

```
Grace is a Bible companion that reads to you.

Five quiet minutes in the morning. A little scripture, said aloud in a voice that is warm rather than solemn. Somewhere to put what you are carrying. That is the whole of it.

Most Bible apps are built like productivity software. Streaks to protect, plans to fall behind on, a badge for showing up. Grace is built like a sanctuary. She keeps your place. She does not guard a streak.


WHAT YOU GET

Daily audio devotions
A short passage each morning, read aloud, so scripture can meet you while you are making coffee or driving to work. No screen required.

Stories from scripture
The Bible is stranger and better than most of us were taught. Grace tells the stories properly, in episodes short enough for a commute.

Evening prayer and reflection
A gentler register for the end of the day. Something to close on rather than scroll through.

The full Bible, readable
Every book, clean typography, no clutter. Search a passage or simply pick up where you left off.

A place to write
Reflect on what you read. Private, kept for you, never shared anywhere.

Made for Catholic and Christian women
Written for women who already have a faith and want somewhere unhurried to keep it, not somewhere that will nag them about it.


A NOTE ON HOW SHE WORKS

Grace never sends a guilt notification. She will not tell you that you broke a streak or that you have not opened her in six days. If you disappear for a month, she will be exactly where you left her when you come back.


MEMBERSHIP

Grace is subscription only. No ads, no upsells, no data sold.

Three days free, then $12.99 per month or $69.99 per year.

Payment is charged to your Apple Account at confirmation of purchase. Your subscription renews automatically unless cancelled at least 24 hours before the end of the current period. Manage or cancel anytime in your Apple Account settings. Any unused portion of a free trial is forfeited when you purchase a subscription.

Terms of Use: https://www.selveapps.xyz/grace/terms
Privacy Policy: https://www.selveapps.xyz/grace/privacy
```

**Note:** the auto-renew paragraph is not optional decoration. Guideline 3.1.2 requires those exact disclosures, and reviewers check the description as well as the paywall.

---

## 4. Promotional text (170 char limit)

```
New: evening prayer, a gentler way to close the day. Three days free. She keeps your place, never a streak.
```

Promotional text sits above the description and is the **only** metadata field you can change without shipping a new build or waiting for review. Use it for seasonal hooks: Lent, Advent, New Year.

---

## 5. Screenshots

### Technical requirements

- Apple now requires only the **6.9 inch iPhone** set: **1320 x 2868 px** portrait. Everything smaller is auto scaled. Confirm the current requirement in App Store Connect before export, since Apple changes this with device launches.
- If the build supports iPad, a 13 inch iPad set is also required at **2064 x 2752 px**. If you do not intend to support iPad, set the target to iPhone only, because otherwise reviewers will run it on iPad and reject on layout.
- Up to 10 slots. Use 6.
- **Slots 1 to 3 are the ones that matter.** Only the first two or three appear in search results without a tap. Everything after slot 3 is read by people already deciding to install.

### Visual treatment

Ivory `#FAF5EC` background, device frame floating with a soft shadow, caption above the device. Caption in Fraunces at roughly 64 to 72 px, ink `#241F1A`, with the key noun in brass `#A8814A`. Keep captions to six words or fewer. Never let the caption run two lines on more than one frame in the set.

### The six frames

| # | Screen | Caption | Purpose |
|---|--------|---------|---------|
| 1 | Today screen, Grace mid-read, audio bar visible | **A Bible that reads itself to you** | The hook. Names the single differentiator in one line. |
| 2 | Today screen, morning passage in Fraunces | **Five quiet minutes each morning** | Sets the effort expectation. Low commitment converts. |
| 3 | Grace in resting state, soft "I kept our place" line | **She keeps your place, not a streak** | The wedge against every competitor. This is your sharpest frame. |
| 4 | Stories tab, episode list | **Scripture, told aloud like a story** | The shareable layer and the organic engine. |
| 5 | Night register, dusk palette, evening prayer | **A gentler way to close the day** | Second daily use case. Doubles perceived value. |
| 6 | Reading tab, clean typography, full Bible | **The whole Bible, beautifully readable** | Reassurance for anyone worried it is devotional only, not scripture. |

### App Preview video

Optional but worth it. Subscription apps typically see a meaningful conversion lift from a preview. 15 to 30 seconds, portrait, captured on device (Apple rejects previews containing non device footage). Show the audio starting within the first three seconds. The poster frame becomes slot 1, so choose it deliberately.

Reuse the creator footage where you can, but Apple requires previews to be captured device footage, so lifestyle b-roll cannot go in the preview. It can go in the Meta creative.

---

## 6. Everything else in App Store Connect

### Categories
- **Primary: Reference.** Less crowded than Lifestyle and where scripture apps index well.
- **Secondary: Lifestyle.** Where Hallow and the meditation adjacent apps sit.

You can change these later without a new build, so treat it as testable.

### Age rating
4+. Nothing in Grace triggers a higher tier. Answer the questionnaire honestly, since an inflated rating shrinks your addressable audience.

### URLs (all must be live and reachable before you hit submit)
- Privacy Policy URL: required, no exceptions
- Terms of Use / EULA URL: required because you sell subscriptions
- Support URL: required, and it must be a real page with a contact route, not a redirect to your homepage
- Marketing URL: optional

### Copyright
`© 2026 Selve App Studio LLP`

### Subscription metadata (separate from app metadata, and reviewers read it)
Each subscription needs its own display name, description and a 1024 x 1024 promotional image.

- **Grace Annual**: display name `Grace Annual`, description `Full access to Grace, billed yearly. Three days free.`
- **Grace Monthly**: display name `Grace Monthly`, description `Full access to Grace, billed monthly. Three days free.`

Both must be in **Ready to Submit** state and attached to the 1.0 version, or they will not be reviewed with the build.

### App Privacy nutrition labels
Complete the questionnaire before submitting. Be accurate about the journal entries and any analytics SDK. Mismatches between the label and observed network traffic are a common and slow rejection.

### Localizations
Add en-GB, en-CA and en-AU at zero marginal cost. Same copy, and it widens store surface. Skip non English for 1.0.

### Version release
Select **manually release this version**. You want approval and launch to be separate decisions, especially if creator footage or ASA campaigns are not ready on approval day.

### App Review notes (write this properly, it saves a rejection cycle)
```
Demo account:
Email: support@selveapps.xyz
Password: [fill in]

Notes for the reviewer:
- Grace is a subscription Bible and devotional app. Three day free trial, then $12.99/month or $69.99/year.
- The paywall appears at the end of onboarding. A "Maybe later" option is available.
- Restore Purchases is on the paywall and in Settings.
- Terms of Use and Privacy Policy are linked directly on the paywall.
- Account deletion is available in Settings > Account > Delete Account.
- Scripture text is the World English Bible (public domain), served via bible-api.com.
- The app is iPhone only.
```

---

## 7. Custom Product Pages

Worth setting up before Apple Search Ads goes live, not after. You get up to 35 alternate pages, each with its own screenshots and promotional text, each with its own URL, and each usable as an ASA ad variation.

Suggested first three, mapped to your five creative angles:

1. **Morning ritual** page: leads with frames 2, 1, 5
2. **Anti guilt** page: leads with frames 3, 1, 2
3. **Stories** page: leads with frames 4, 1, 6

You can run these against the default page in ASA and read conversion rate per page. This is the cheapest conversion experiment available to you and it runs on the same budget you were already spending.

---

## 8. Pre submit checklist

- [ ] Restore Purchases button on the paywall (currently missing)
- [ ] Terms of Use and Privacy Policy links on the paywall screen itself (currently missing)
- [ ] Both subscription products in Ready to Submit and attached to version 1.0
- [ ] Sign in with Apple present, since Google sign in is offered
- [ ] Account deletion path in Settings
- [ ] Privacy Policy, Terms and Support URLs live
- [ ] App Privacy questionnaire completed
- [ ] Export compliance set in app.json (`ITSAppUsesNonExemptEncryption: false`)
- [ ] Target set to iPhone only, or tested on iPad
- [ ] Bundle identifier changed off the placeholder `com.grace.app`
- [ ] Demo account created and working
- [ ] Manual release selected
- [ ] Bank details and tax forms complete, not just the Paid Apps agreement
