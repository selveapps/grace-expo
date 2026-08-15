// SubscriptionService — entitlement via Grace API.
//
// Expo Go (default): beta redeem via POST /beta/redeem.
// EAS dev build (EXPO_PUBLIC_IAP_ENABLED=true): RevenueCat + Superwall;
// backend sync via POST /webhooks/revenuecat → GET /me.subscribed.
//
// StoreKit seam: `purchase()` and `restore()` always resolve to a normalized
// { status } — 'trialing' | 'active' | 'free' | 'cancelled' | 'failed'.
import { api } from '../api/client';
import { StorageService, KEYS } from './StorageService';
import { IAP_ENABLED, RevenueCatService } from './RevenueCatService';

const OFFERINGS = RevenueCatService.getOfferings();

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
        platform: IAP_ENABLED ? 'ios' : 'beta',
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
    if (IAP_ENABLED && RevenueCatService.isAvailable()) {
      return RevenueCatService.purchase(planId);
    }

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
    if (IAP_ENABLED && RevenueCatService.isAvailable()) {
      return RevenueCatService.restore();
    }
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
