# Grace web — task slices

Linear project: Grace Expo Beta. File boundaries are the contract. Plan and ticket map stay in `PLAN.md` and `TICKETS.md`.

No slice blocks another. Allowed paths do not overlap. Only SEL-62 may write `web/package-lock.json`. Other slices must not run `npm install`.

| Issue | Title | Allowed paths | Done when |
|---|---|---|---|
| [SEL-62](https://linear.app/selve-apps/issue/SEL-62) | WEB: Install and prove the existing Vitest suite | `web/package.json` (only if install rewrites it), `web/package-lock.json` | `cd web && npm test` passes. No new pages. |
| [SEL-63](https://linear.app/selve-apps/issue/SEL-63) | WEB: Splash and guest session start | `web/app/page.tsx` | Begin calls existing `ensureGuest`, then `/onboarding`. Implements SEL-10, SEL-17. |
| [SEL-64](https://linear.app/selve-apps/issue/SEL-64) | WEB: Onboarding page | `web/app/onboarding/page.tsx` | Renders existing `OnboardingWizard`. Implements SEL-17, SEL-14, SEL-19. |
| [SEL-65](https://linear.app/selve-apps/issue/SEL-65) | WEB: Today with Psalm 23 fallback | `web/app/(app)/today/page.tsx`, `web/app/(app)/today/Retry.tsx` only if needed | Failed or empty `GET /today` still shows Psalm 23 and a retry. Implements SEL-18. |
| [SEL-66](https://linear.app/selve-apps/issue/SEL-66) | WEB: Reading index and chapter | `web/app/(app)/reading/page.tsx`, `web/app/(app)/reading/[book]/[chapter]/page.tsx`, optional `not-found.tsx` in that chapter folder | OT/NT index and cached chapter. `PUT /progress` via existing `RememberChapter`. No offline queue. Implements SEL-12, SEL-18, SEL-22. |
| [SEL-67](https://linear.app/selve-apps/issue/SEL-67) | WEB: Reading search and theme passages | `web/app/(app)/reading/search/page.tsx`, `web/app/(app)/reading/themes/[theme]/page.tsx` | Search shows unclipped `total`. Theme page uses `GET /bible/passage`. Implements SEL-13, SEL-20, SEL-12. |
| [SEL-68](https://linear.app/selve-apps/issue/SEL-68) | WEB: Stories list and detail | `web/app/(app)/stories/page.tsx`, `web/app/(app)/stories/[id]/page.tsx` | List, detail, existing `AudioPlayer`, transcript. Implements SEL-31. |
| [SEL-69](https://linear.app/selve-apps/issue/SEL-69) | WEB: Tea archive, today, and detail | `web/app/(app)/tea/page.tsx`, `web/app/(app)/tea/today/page.tsx`, `web/app/(app)/tea/[id]/page.tsx` | Catalog, daily sermon, detail. Save uses existing `SaveTeaButton`. Implements DEC-014. |
| [SEL-70](https://linear.app/selve-apps/issue/SEL-70) | WEB: You, saved verses, and reflections | `web/app/(app)/you/page.tsx`, `web/app/(app)/you/saved/page.tsx`, `web/app/(app)/you/reflections/page.tsx` | Profile, saved, reflections. No `you/layout.tsx`. Implements SEL-14, SEL-19. |
| [SEL-71](https://linear.app/selve-apps/issue/SEL-71) | WEB: Reminders, support, subscription, and settings | `web/app/(app)/you/reminders/page.tsx`, `web/app/(app)/you/support/page.tsx`, `web/app/(app)/you/subscription/page.tsx`, `web/app/(app)/you/settings/page.tsx` | Existing forms only. Plans display `grace.monthly` $12.99 and `grace.yearly` $69.99 plus `POST /beta/redeem`. No web checkout. Implements SEL-31, SEL-16, SEL-23, SEL-28 (names only), SEL-14. |
| [SEL-72](https://linear.app/selve-apps/issue/SEL-72) | WEB: Agent docs, DEC-017, and RUN-016 | `web/README.md`, `web/AGENTS.md`, one Layout row in `AGENTS.md`, append DEC-017, append RUN-016, one CHANGELOG Unreleased note | Docs only. RUN-015 is already the blank-Home entry, so the notebook id is RUN-016. |

Parallel: all eleven. Do not add a shared `reading/layout.tsx` or `you/layout.tsx`.
