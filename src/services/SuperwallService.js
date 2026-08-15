// Superwall paywall placements — UI layer on top of RevenueCat (M11).
//
// Requires EAS dev build + expo-superwall. Expo Go: registerPlacement is a no-op.
// Dashboard: create placements matching PAYWALL_PLACEMENTS below and attach
// a RevenueCat-powered paywall template.

import { IAP_ENABLED } from './RevenueCatService';

/** Placement identifiers — must match Superwall dashboard. */
export const PAYWALL_PLACEMENTS = {
  onboarding: 'onboarding_paywall',
  settingsUpgrade: 'settings_upgrade',
  featureGate: 'feature_gate',
};

let SuperwallHooks = null;

function loadSuperwall() {
  if (SuperwallHooks) return SuperwallHooks;
  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    SuperwallHooks = require('expo-superwall');
    return SuperwallHooks;
  } catch {
    return null;
  }
}

export const SuperwallService = {
  isAvailable() {
    return IAP_ENABLED && !!process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY && !!loadSuperwall();
  },

  placements: PAYWALL_PLACEMENTS,

  /**
   * Present a Superwall placement. Falls back to `onFallback` when SDK unavailable
   * (Expo Go, missing API key, or dev build not yet created).
   */
  async registerPlacement(placementId, { onFallback, params } = {}) {
    const sw = loadSuperwall();
    if (!this.isAvailable() || !sw?.usePlacement) {
      if (typeof onFallback === 'function') await onFallback();
      return { presented: false, reason: 'unavailable' };
    }

    // Hooks must run inside React components; this stub documents the contract.
    // PaywallScreen keeps custom UI until Superwall templates are configured.
    if (typeof onFallback === 'function') await onFallback();
    return { presented: false, reason: 'use_usePlacement_hook_in_screen', placementId, params };
  },
};
