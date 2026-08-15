// SubscriptionService — beta entitlement via Grace API (Expo Go).
//
// StoreKit seam: `purchase()` and `restore()` always resolve to a normalized
// { status } — 'trialing' | 'active' | 'free' | 'cancelled' | 'failed' — because
// PaywallScreen branches on it and must only celebrate a real purchase.
//
// Real StoreKit is NOT wired yet. The v3 spec named `expo-in-app-purchases`, but
// that module is absent from the Expo SDK 54 native-module list (Expo retired it
// after SDK 49), so installing it would break this build. When the Paid Apps
// agreement and the two ASC products are live, drop a maintained module
// (`expo-iap` or `react-native-iap`) into `storeKitPurchase` below: it must
// return the transaction receipt, which is then validated server-side by
// POST /purchase/validate. Entitlement is always re-read from GET /me.
import { api } from '../api/client';
import { StorageService, KEYS } from './StorageService';

const OFFERINGS = [
  { id: 'annual', type: 'annual', price: 69.99, displayPrice: '$69.99', period: 'year', trialDays: 3, badge: 'Best value', platformProductId: 'grace.plus.annual' },
  { id: 'monthly', type: 'monthly', price: 12.99, displayPrice: '$12.99', period: 'month', trialDays: 3, badge: null, platformProductId: 'grace.plus.monthly' },
];

const BETA_CODE = process.env.EXPO_PUBLIC_BETA_REDEEM_CODE || 'grace-beta';

export const SubscriptionService = {
  getOfferings() { return OFFERINGS; },

  async getStatus() {
    try {
      const res = await api.get('/me');
      const subscribed = !!res.data.profile?.subscribed;
      const sub = {
        status: subscribed ? 'trialing' : 'free',
        planId: subscribed ? 'beta' : null,
        trialEndsAt: subscribed ? Date.now() + 3 * 86400000 : null,
        renewsAt: null,
        platform: 'beta',
      };
      await StorageService.set(KEYS.subscription, sub);
      return sub;
    } catch {
      return StorageService.get(KEYS.subscription, { status: 'free', planId: null, trialEndsAt: null, renewsAt: null });
    }
  },

  /**
   * Resolves to a normalized { status, ... }. Never throws: the paywall shows
   * calm copy for 'failed' and stays put for 'cancelled'.
   */
  async purchase(planId) {
    const plan = OFFERINGS.find((o) => o.id === planId) || OFFERINGS[0];
    try {
      const res = await api.post('/beta/redeem', { code: BETA_CODE });
      const now = Date.now();
      const expiresAt = res.data.expiresAt
        ? new Date(res.data.expiresAt).getTime()
        : now + plan.trialDays * 86400000;
      const sub = {
        status: res.data.status || 'trialing',
        planId: plan.id,
        trialEndsAt: expiresAt,
        renewsAt: expiresAt,
        platform: 'beta',
      };
      await StorageService.set(KEYS.subscription, sub);
      return sub;
    } catch (e) {
      return { status: 'failed', planId: plan.id, error: e?.message || 'purchase_failed' };
    }
  },

  async restore() {
    const sub = await this.getStatus();
    return sub?.status ? sub : { status: 'free' };
  },

  async cancel() {
    const sub = await StorageService.get(KEYS.subscription, { status: 'free' });
    if (sub.status === 'trialing' || sub.status === 'active') {
      sub.status = 'canceled';
      await StorageService.set(KEYS.subscription, sub);
    }
    return sub;
  },
};
