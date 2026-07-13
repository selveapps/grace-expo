// SubscriptionService — beta entitlement via Grace API (Expo Go). StoreKit = dev build.
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

  async purchase(planId) {
    const plan = OFFERINGS.find((o) => o.id === planId) || OFFERINGS[0];
    const res = await api.post('/beta/redeem', { code: BETA_CODE });
    const now = Date.now();
    const sub = {
      status: res.data.status || 'trialing',
      planId: plan.id,
      trialEndsAt: res.data.expiresAt ? new Date(res.data.expiresAt).getTime() : now + plan.trialDays * 86400000,
      renewsAt: res.data.expiresAt ? new Date(res.data.expiresAt).getTime() : now + plan.trialDays * 86400000,
      platform: 'beta',
    };
    await StorageService.set(KEYS.subscription, sub);
    return sub;
  },

  async restore() {
    return this.getStatus();
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
