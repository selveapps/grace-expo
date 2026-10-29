# Grace web — ticket map

The web app does not invent a backlog. Each route implements a ticket that already exists on [Grace Expo Beta](https://linear.app/selve-apps/project/grace-expo-beta-8eb9cf365622), or a decision already recorded in `DECISIONS.md`.

GitHub issues were not opened. The `gh` credential on this agent is read-only, and a second tracker would drift from Linear. This file is the index. Linear remains the tracker.

| Web slice | Existing ticket | Acceptance on the web |
|---|---|---|
| Guest session | [SEL-10](https://linear.app/selve-apps/issue/SEL-10) / GRACE-008, [SEL-17](https://linear.app/selve-apps/issue/SEL-17) / GRACE-013 | Begin creates a guest via `POST /auth/guest` and stores the session in httpOnly cookies. |
| Profile, saved verses, reflections | [SEL-14](https://linear.app/selve-apps/issue/SEL-14) / GRACE-009, [SEL-19](https://linear.app/selve-apps/issue/SEL-19) / GRACE-015 | Onboarding writes `PATCH /me`. Saved and reflections pages use `/saved` and `/reflections`. |
| Scripture chapter and passage | [SEL-12](https://linear.app/selve-apps/issue/SEL-12) / GRACE-007, [SEL-18](https://linear.app/selve-apps/issue/SEL-18) / GRACE-014 | Chapter pages call `GET /bible/:book/:chapter`. Theme notes call `GET /bible/passage`. |
| Search | [SEL-13](https://linear.app/selve-apps/issue/SEL-13) / GRACE-010, [SEL-20](https://linear.app/selve-apps/issue/SEL-20) / GRACE-017 | `/reading/search` calls `GET /bible/search` and shows the unclipped `total`. |
| Reading progress | [SEL-22](https://linear.app/selve-apps/issue/SEL-22) / GRACE-018 (offline queue still backlog) | Opening a chapter sends `PUT /progress` when a session exists. No offline queue on the web. |
| Beta entitlement | [SEL-16](https://linear.app/selve-apps/issue/SEL-16) / GRACE-011 | `/you/subscription` redeems `POST /beta/redeem` and shows `profile.subscribed`. |
| Subscription products | [SEL-23](https://linear.app/selve-apps/issue/SEL-23) / GRACE-016, [SEL-28](https://linear.app/selve-apps/issue/SEL-28) / GRACE-025 | Plans display `grace.monthly` ($12.99) and `grace.yearly` ($69.99). Checkout stays on iOS. |
| Stories and support copy | [SEL-31](https://linear.app/selve-apps/issue/SEL-31) / GRACE-027 | Story transcript uses `GET /stories/:id/transcript`. Support uses `POST /ai/support`. Reminders use `POST /ai/reminder`. |
| Tea | DEC-014 | `/tea` lists the catalog. `/tea/today` is the daily sermon. |
| Today load failure | App Review 2.1(a), fixed on mobile in #47 | `/today` still shows Psalm 23 and a retry when `GET /today` fails. |

Not claimed by this slice: Apple and Google sign-in ([SEL-26](https://linear.app/selve-apps/issue/SEL-26), [SEL-27](https://linear.app/selve-apps/issue/SEL-27)), the offline write queue ([SEL-22](https://linear.app/selve-apps/issue/SEL-22)), and a dev-client IAP build ([SEL-29](https://linear.app/selve-apps/issue/SEL-29)).

## WEB implementation slices

These are the implementation tickets for the Next.js client. Each is Done on Linear once its pull request is on `main`.

| Issue | Pull request | Merge |
|---|---|---|
| [SEL-62](https://linear.app/selve-apps/issue/SEL-62) | [#80](https://github.com/selveapps/grace-expo/pull/80) | `a53b55e` |
| [SEL-63](https://linear.app/selve-apps/issue/SEL-63), [SEL-64](https://linear.app/selve-apps/issue/SEL-64) | [#73](https://github.com/selveapps/grace-expo/pull/73) | `e05718b` |
| [SEL-65](https://linear.app/selve-apps/issue/SEL-65) | [#78](https://github.com/selveapps/grace-expo/pull/78) | `8d03717` |
| [SEL-66](https://linear.app/selve-apps/issue/SEL-66), [SEL-67](https://linear.app/selve-apps/issue/SEL-67) | [#77](https://github.com/selveapps/grace-expo/pull/77) | `bfbcf80` |
| [SEL-68](https://linear.app/selve-apps/issue/SEL-68) | [#74](https://github.com/selveapps/grace-expo/pull/74) | `cc55118` |
| [SEL-69](https://linear.app/selve-apps/issue/SEL-69) | [#75](https://github.com/selveapps/grace-expo/pull/75) | `6ed03c9` |
| [SEL-70](https://linear.app/selve-apps/issue/SEL-70), [SEL-71](https://linear.app/selve-apps/issue/SEL-71) | [#76](https://github.com/selveapps/grace-expo/pull/76) | `6b509fc` |
| [SEL-72](https://linear.app/selve-apps/issue/SEL-72) | [#79](https://github.com/selveapps/grace-expo/pull/79) | docs, DEC-017, RUN-016 |

## Library slice

These stay In Progress until the pull request is on `main`.

| Issue | Route | Acceptance |
|---|---|---|
| [SEL-74](https://linear.app/selve-apps/issue/SEL-74) | `/you/tea` | `GET /tea/saved` joined to `GET /tea` titles. Empty state links to `/tea`. A missing session links home. |
| [SEL-75](https://linear.app/selve-apps/issue/SEL-75) | `/you` | Newest `GET /progress` row links to that chapter. No rows links to `/reading`. |
| [SEL-76](https://linear.app/selve-apps/issue/SEL-76) | `/you/settings` | Two-step control calls `DELETE /me`, clears the session, and returns to `/`. |
| [SEL-77](https://linear.app/selve-apps/issue/SEL-77) | not-found | Branded page with links to scripture, stories, and Tea. It does not create a guest. |
| [SEL-78](https://linear.app/selve-apps/issue/SEL-78) | search | Backlog. Full KJV index on production. The web client does not invent verses. |
