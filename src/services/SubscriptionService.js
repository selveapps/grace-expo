// SubscriptionService — mock RevenueCat/StoreKit surface. Persists a simulated
// subscription so trial/active/expired states are real across restarts.
// In a dev build, swap the bodies for react-native-iap / RevenueCat calls.
import { StorageService, KEYS } from './StorageService';

const OFFERINGS = [
  { id: 'annual', type: 'annual', price: 69.99, displayPrice: '$69.99', period: 'year', trialDays: 3, badge: 'Best value', platformProductId: 'grace.plus.annual' },
  { id: 'monthly', type: 'monthly', price: 12.99, displayPrice: '$12.99', period: 'month', trialDays: 3, badge: null, platformProductId: 'grace.plus.monthly' },
];

export const SubscriptionService = {
  getOfferings() { return OFFERINGS; },

  async getStatus() {
    const sub = await StorageService.get(KEYS.subscription, { status: 'free', planId: null, trialEndsAt: null, renewsAt: null });
    // derive expiry
    if (sub.status === 'trialing' && sub.trialEndsAt && Date.now() > sub.trialEndsAt) {
      sub.status = 'expired';
      await StorageService.set(KEYS.subscription, sub);
    }
    return sub;
  },

  // Simulated purchase: starts a 3-day trial. Returns the new status.
  async purchase(planId) {
    const plan = OFFERINGS.find((o) => o.id === planId) || OFFERINGS[0];
    const now = Date.now();
    const sub = {
      status: 'trialing',
      planId: plan.id,
      trialEndsAt: now + plan.trialDays * 86400000,
      renewsAt: now + plan.trialDays * 86400000,
      platform: 'ios',
    };
    await StorageService.set(KEYS.subscription, sub);
    return sub;
  },

  async restore() {
    // No prior purchase in mock → nothing to restore.
    return StorageService.get(KEYS.subscription, { status: 'free' });
  },

  async cancel() {
    const sub = await StorageService.get(KEYS.subscription, { status: 'free' });
    if (sub.status === 'trialing' || sub.status === 'active') { sub.status = 'canceled'; await StorageService.set(KEYS.subscription, sub); }
    return sub;
  },
};
