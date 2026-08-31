// IAP provider shell — Superwall + RevenueCat bootstrap for EAS dev builds.
import React, { useEffect } from 'react';
import { IAP_ENABLED, RevenueCatService } from '../services/RevenueCatService';
import { AuthService } from '../services/AuthService';

function SuperwallShell({ children }) {
  if (!IAP_ENABLED) return children;

  const iosKey = process.env.EXPO_PUBLIC_SUPERWALL_IOS_API_KEY;
  const androidKey = process.env.EXPO_PUBLIC_SUPERWALL_ANDROID_API_KEY;
  if (!iosKey && !androidKey) return children;

  try {
    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const { SuperwallProvider } = require('expo-superwall');
    return (
      <SuperwallProvider apiKeys={{ ios: iosKey, android: androidKey }}>
        {children}
      </SuperwallProvider>
    );
  } catch {
    return children;
  }
}

export function IAPProviders({ children }) {
  useEffect(() => {
    if (!RevenueCatService.isAvailable()) return undefined;
    let cancelled = false;
    AuthService.ensureGuest()
      .then((session) => {
        const userId = session?.userId;
        if (!cancelled && userId) return RevenueCatService.configure(userId);
        return null;
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  return <SuperwallShell>{children}</SuperwallShell>;
}
