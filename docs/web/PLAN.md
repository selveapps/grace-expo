# Grace web — execution plan

Status: active. Written before `web/` application code.

## Goal

A Next.js app in `web/` with the same product surface as the Expo app, reading and writing the existing `grace-api`. No second scripture store, no second auth issuer.

## Constraints

- Same repository. Mobile stays in `src/`. API stays in `backend/`.
- Performance: public scripture, stories, and Tea render on the server and cache. Client JavaScript is limited to onboarding, audio, and forms.
- Native StoreKit and Sign in with Apple stay on iOS. The web app starts a guest session (the beta path, SEL-10 / SEL-17), can redeem a beta code (SEL-16), and reads `profile.subscribed`. Purchases are named as the iOS Grace Plus products `grace.monthly` and `grace.yearly`.
- KJV text comes from `GET /bible/...` and `GET /bible/passage`. The web app does not embed a Bible.
- Visual language matches `src/theme.js`: paper `#FBF9F4`, espresso `#3A2C22`, brass `#B58A3F`, Cormorant Garamond and Hanken Grotesk.

## Feature map

| Surface | Route | API | Ticket |
|---|---|---|---|
| Splash and enter | `/` | — | onboarding |
| Onboarding (name, carrying, gentleness, rhythm, reflection, plans, enter) | `/onboarding` | `POST /auth/guest`, `PATCH /me`, `POST /reflections` | SEL-17, SEL-14, SEL-19 |
| Today, with a visible fallback when `/today` fails | `/today` | `GET /today`, `GET /today/verse` | SEL-18 |
| Reading: Old and New Testament, chapter, search, themes | `/reading`, `/reading/[book]/[chapter]`, `/reading/search`, `/reading/themes/[theme]` | `GET /bible/:book/:chapter`, `GET /bible/search`, `GET /bible/passage`, `PUT /progress` | SEL-12, SEL-13, SEL-20 |
| Stories list, detail, audio, transcript | `/stories`, `/stories/[id]` | `GET /stories`, `GET /stories/:id`, `GET /stories/:id/transcript`, `PUT /stories/progress/:id` | catalog |
| Tea archive, today, detail, save | `/tea`, `/tea/[id]` | `GET /tea`, `GET /tea/today`, `GET /tea/:id`, `POST /tea/:id/save` | DEC-014 |
| You: profile, saved, reflections, reminders, support, subscription, settings | `/you` and nested routes | `GET/PATCH /me`, `/saved`, `/reflections`, `POST /ai/reminder`, `POST /ai/support`, `POST /beta/redeem` | SEL-14, SEL-16, SEL-23, SEL-31 |

Full ticket notes: `docs/web/TICKETS.md`.

## Tests first

Domain rules are pure functions under `web/lib/` and are covered by Vitest before the pages depend on them:

- Greeting by hour, and a non-blank Today when the payload is missing or failed.
- 66-book canon, slug round-trip, including `1 Samuel`.
- Onboarding cannot continue with an empty carrying list. The patch sent to `PATCH /me` matches the mobile field names.
- Relative `/audio/...` URLs become absolute against `GRACE_API_BASE`.
- Every feature row has a route and a ticket id.

`npm run typecheck` and `npm run build` are the route audit. Browser QA on a physical iPad is out of scope for this slice.

## Non-goals

- Rewriting Expo screens in React Native Web.
- Charging a card on the web.
- Duplicating Apple's Sign in with Apple sheet.
- A new database.
