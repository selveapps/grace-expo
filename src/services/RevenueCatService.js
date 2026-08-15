// RevenueCat SDK wrapper — real StoreKit via EAS dev build (M11 / GRACE-026).
//
// RevenueCat validates receipts with Apple and exposes entitlements client-side.
// Backend entitlement is synced via POST /webhooks/revenuecat (GRACE-025).
// Entitlement is always re-read from GET /me after purchase/restore.
//
// Expo Go: native module absent — isAvailable() is false; SubscriptionService
// falls back to beta redeem when EXPO_PUBLIC_IAP_ENABLED is not 'true'.

import { Platform } from 'react-native';
import { api } from '../api/client';
import { StorageService, KEYS } from './StorageService';

export const IAP_ENABLED = process.env.EXPO_PUBLIC_IAP_ENABLED === 'true';
export const GRACE_PLUS_ENTITLEMENT = 'grace_plus';

const OFFERINGS = [
  { id: 'annual', type: 'annual', price: 69.99, displayPrice: '$69.99', period: 'year', trialDays: 3, badge: 'Best value', platformProductId: 'grace.plus.annual', rcPackageId: '$rc_annual' },
  { id: 'monthly', type: 'monthly', price: 12.99, displayPrice: '$12.99', period: 'month', trialDays: 3, badge: null, platformProductId: 'grace.plus.monthly', rcPackageId: '$rc_monthly' },
];

const IOS_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY;
const ANDROID_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

let configured = false;
let Purchases = null;

function loadPurchases() {
  if (Purchases) return Purchases;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    Purchases = require('react-native-purchases').default;
    return Purchases;
  } catch {
    return null;
  }
}

function apiKeyForPlatform() {
  if (Platform.OS === 'ios') return IOS_API_KEY;
  if (Platform.OS === 'android') return ANDROID_API_KEY;
  return null;
}

function normalizeFromEntitlement(customerInfo, planId) {
  const active = customerInfo?.entitlements?.active?.[GRACE_PLUS_ENTITLEMENT];
  if (!active) return { status: 'free', planId: null, trialEndsAt: null, renewsAt: null, platform: Platform.OS };

  const isTrial = active.periodType === 'TRIAL';
  const expiresMs = active.expirationDate ? new Date(active.expirationDate).getTime() : null;
  return {
    status: isTrial ? 'trialing' : 'active',
    planId: planId ?? (active.productIdentifier?.includes('annual') ? 'annual' : 'monthly'),
    trialEndsAt: isTrial ? expiresMs : null,
    renewsAt: expiresMs,
    platform: Platform.OS,
  };
}

async function refreshMeSubscription() {
  try {
    const res = await api.get('/me');
    const subscribed = !!res.data.profile?.subscribed;
    if (subscribed) {
      const sub = { status: 'active', planId: 'annual', trialEndsAt: null, renewsAt: null, platform: Platform.OS };
      await StorageService.set(KEYS.subscription, sub);
      return sub;
    }
  } catch {
    // webhook may lag; client entitlement still authoritative for UX
  }
  return null;
}

export const RevenueCatService = {
  isAvailable() {
    return IAP_ENABLED && !!loadPurchases() && !!apiKeyForPlatform();
  },

  getOfferings() {
    return OFFERINGS;
  },

  async configure(appUserId) {
    const sdk = loadPurchases();
    const apiKey = apiKeyForPlatform();
    if (!sdk || !apiKey || !appUserId) return false;
    if (configured) {
      try {
        await sdk.logIn(appUserId);
      } catch {
        // already logged in or transient — continue
      }
      return true;
    }
    sdk.configure({ apiKey, appUserID: appUserId });
    configured = true;
    return true;
  },

  async getCustomerInfo() {
    const sdk = loadPurchases();
    if (!sdk) return null;
    try {
      return await sdk.getCustomerInfo();
    } catch {
      return null;
    }
  },

  /**
   * Purchase via RevenueCat offerings. Resolves to normalized { status } for PaywallScreen.
   */
  async purchase(planId) {
    const plan = OFFERINGS.find((o) => o.id === planId) || OFFERINGS[0];
    const sdk = loadPurchases();
    if (!sdk) {
      return { status: 'failed', planId: plan.id, error: 'iap_unavailable' };
    }

    try {
      const offerings = await sdk.getOfferings();
      const current = offerings?.current;
      const pkg =
        current?.availablePackages?.find((p) => p.identifier === plan.rcPackageId)
        ?? current?.availablePackages?.find((p) => p.product?.identifier === plan.platformProductId)
        ?? current?.availablePackages?.[0];

      if (!pkg) {
        return { status: 'failed', planId: plan.id, error: 'offering_not_found' };
      }

      const { customerInfo } = await sdk.purchasePackage(pkg);
      const sub = normalizeFromEntitlement(customerInfo, plan.id);
      if (sub.status === 'trialing' || sub.status === 'active') {
        await StorageService.set(KEYS.subscription, sub);
        await refreshMeSubscription();
        return sub;
      }
      return { status: 'failed', planId: plan.id, error: 'no_entitlement' };
    } catch (e) {
      if (e?.userCancelled) {
        return { status: 'cancelled', planId: plan.id };
      }
      return { status: 'failed', planId: plan.id, error: e?.message || 'purchase_failed' };
    }
  },

  async restore() {
    const sdk = loadPurchases();
    if (!sdk) return { status: 'free' };

    try {
      const customerInfo = await sdk.restorePurchases();
      const sub = normalizeFromEntitlement(customerInfo);
      if (sub.status === 'trialing' || sub.status === 'active') {
        await StorageService.set(KEYS.subscription, sub);
        await refreshMeSubscription();
        return sub;
      }
      const fromApi = await refreshMeSubscription();
      return fromApi ?? { status: 'free' };
    } catch {
      return { status: 'free' };
    }
  },
};
