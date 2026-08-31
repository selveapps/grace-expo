# M11 — Real IAP with RevenueCat + Superwall

Scaffold for **GRACE-025** (backend webhooks) and **GRACE-026** (EAS dev build).  
Branch: `feat/m11-iap-revenuecat` · worktree: `../grace-expo-iap`

## Architecture

| Layer | Role |
|-------|------|
| **App Store Connect** | Products `grace.yearly`, `grace.monthly` (3-day trial) |
| **RevenueCat** | Receipt validation, entitlements, customer identity (`app_user_id` = Grace `user.id`) |
| **Superwall** | Paywall UI / A-B tests; purchases delegate to RevenueCat |
| **grace-api** | `POST /webhooks/revenuecat` → `subscription` table + `profile.subscribed` |
| **Mobile** | `react-native-purchases` + `expo-superwall`; `GET /me` is source of truth for gating |

**Decision:** RevenueCat replaces custom `POST /purchase/validate` for receipt parsing (see DEC-016).  
Direct StoreKit validate remains documented in `BACKEND.md` as optional fallback only.

## Limitations

- **Expo Go does not work** for IAP — no native StoreKit / RevenueCat module.
- Keep `EXPO_PUBLIC_IAP_ENABLED` unset (or `false`) for Expo Go; beta redeem via `POST /beta/redeem` still works.
- **EAS development build required:** `eas build --profile development --platform ios`
- RevenueCat on Expo SDK 54 + New Architecture may need `react-native.config.js` (included) — rebuild after adding deps.
- Sandbox purchases only until ASC products + Paid Apps agreement are live.

---

## 1. App Store Connect

1. **Paid Apps Agreement** — active in ASC → Agreements, Tax, and Banking.
2. **Subscription group** — e.g. `Grace Plus`.
3. **Products** (auto-renewable):

   | Product ID | Price | Trial |
   |------------|-------|-------|
   | `grace.yearly` | $69.99/year | 3 days |
   | `grace.monthly` | $12.99/month | 3 days |

4. App bundle: `com.selveapps.grace` (matches `app.json`).

---

## 2. RevenueCat project

1. Create project at [app.revenuecat.com](https://app.revenuecat.com).
2. Add **iOS app** with bundle ID `com.selveapps.grace`.
3. Link ASC shared secret / App Store Connect API key (StoreKit 2 recommended).
4. Create **entitlement** `grace_plus` and attach both products.
5. Create **offering** `default` with packages (identifiers used in app):
   - `$rc_annual` → `grace.yearly`
   - `$rc_monthly` → `grace.monthly`
6. Copy **public SDK keys** (iOS / Android) for EAS secrets.
7. **Integrations → Webhooks:**
   - URL: `https://<your-api>/webhooks/revenuecat`
   - Authorization header: `Bearer <random-secret>` → set as `REVENUECAT_WEBHOOK_AUTH` on API
   - Enable **HMAC signing** (recommended) → `REVENUECAT_WEBHOOK_SIGNING_SECRET`
8. Enable Superwall integration in RevenueCat dashboard (Settings → Integrations → Superwall).

**Customer identity:** Mobile calls `Purchases.configure({ appUserID: graceUserId })` so webhooks carry `app_user_id` matching `user.id` UUID.

---

## 3. Superwall dashboard

1. Create app at [superwall.com](https://superwall.com) linked to same bundle ID.
2. Connect RevenueCat (uses RC entitlements for gating).
3. Create placements (must match `src/services/SuperwallService.js`):

   | Placement ID | Use |
   |--------------|-----|
   | `onboarding_paywall` | Onboarding paywall (optional replacement for custom PaywallScreen) |
   | `settings_upgrade` | Manage subscription upsell |
   | `feature_gate` | Premium feature gate |

4. Copy **Public API keys** for iOS (and Android when ready).

---

## 4. Environment variables

### Mobile (EAS secrets — never commit)

Set via `eas secret:create` or EAS project env for `development` / `production` profiles:

| Variable | Example | Required |
|----------|---------|----------|
| `EXPO_PUBLIC_IAP_ENABLED` | `true` | Dev/prod IAP builds |
| `EXPO_PUBLIC_REVENUECAT_IOS_API_KEY` | `appl_...` | iOS |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY` | `goog_...` | Android (when shipped) |
| `EXPO_PUBLIC_SUPERWALL_IOS_API_KEY` | `pk_...` | iOS Superwall |
| `EXPO_PUBLIC_SUPERWALL_ANDROID_API_KEY` | `pk_...` | Android Superwall |

`eas.json` `development` profile sets `EXPO_PUBLIC_IAP_ENABLED=true`; keys must be added in EAS.

### Backend (Railway / `.env`)

| Variable | Purpose |
|----------|---------|
| `REVENUECAT_WEBHOOK_AUTH` | `Bearer …` value RevenueCat sends in `Authorization` |
| `REVENUECAT_WEBHOOK_SIGNING_SECRET` | HMAC secret from RC webhook settings (optional but preferred) |

---

## 5. Build & test

```bash
# From grace-expo-iap worktree
npm install
cd backend && npm install

# Backend typecheck + unit tests
npm run typecheck
npm test -- test/revenuecat.unit.test.ts

# EAS dev client (requires Apple dev account + ASC products in sandbox)
eas build --profile development --platform ios
```

**Test flow (sandbox):**

1. Install dev build on device.
2. Sign in as guest (or Apple) — note `user.id` in logs if debugging webhooks.
3. Complete purchase on PaywallScreen (RevenueCat path when IAP enabled).
4. Verify RC dashboard shows active entitlement.
5. Verify `POST /webhooks/revenuecat` received event → `GET /me` returns `profile.subscribed: true`.

Send test webhook from RevenueCat dashboard → expect `200 { received: true }`.

---

## 6. Code map

| File | Purpose |
|------|---------|
| `src/services/RevenueCatService.js` | RC configure, purchase, restore |
| `src/services/SuperwallService.js` | Placement IDs + fallback stub |
| `src/services/SubscriptionService.js` | Routes to RC when `IAP_ENABLED` |
| `src/iap/IAPProviders.js` | SuperwallProvider + RC bootstrap |
| `backend/src/routes/revenuecat.ts` | Webhook endpoint |
| `backend/src/services/revenueCatService.ts` | Event → DB sync |
| `react-native.config.js` | Autolinking for `react-native-purchases` |

---

## 7. Next steps (post-scaffold)

- [ ] ASC products approved + sandbox tester account
- [ ] RevenueCat offering live; Superwall paywall designed in dashboard
- [ ] Wire `usePlacement` in PaywallScreen when ready to replace custom UI
- [ ] Railway env: webhook URL + secrets
- [ ] Disable `POST /beta/redeem` in production (`BETA_REDEEM_DISABLED=true`) when IAP ships
- [ ] Integration test: webhook → DB → `/me` (needs test user UUID)

## References

- [RevenueCat Expo install](https://www.revenuecat.com/docs/getting-started/installation/expo)
- [Superwall Expo SDK](https://superwall.com/docs/sdk-installation/installation-via-expo)
- Linear: GRACE-025 · GRACE-026 · SEL-28 · SEL-29
