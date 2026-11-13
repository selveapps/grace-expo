import React, { useCallback, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  CormorantGaramond_500Medium,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_500Medium_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import RootNavigator from './src/navigation/RootNavigator';
import { ProfileProvider } from './src/state/profile';
import { AuthService } from './src/services/AuthService';
import { IAPProviders } from './src/iap/IAPProviders';
import AppErrorBoundary from './src/components/AppErrorBoundary';
import BootView from './src/components/BootView';

SplashScreen.preventAutoHideAsync().catch(() => {});

// App Review 2.1(a), "blank page upon initial launch". Every wait on the way to
// the first screen is now capped, and nothing in the chain renders `null`:
// - fonts that error or stall fall back to system fonts after FONT_WAIT_MS;
// - the guest session is created in the background and never gates the
//   navigator (it never decided the initial route anyway, see profile.js);
// - the native splash hides once the navigator has mounted its first screen,
//   or after SPLASH_FAILSAFE_MS, whichever comes first.
const FONT_WAIT_MS = 2500;
const GUEST_BOOT_TIMEOUT_MS = 3000;
const SPLASH_FAILSAFE_MS = 5000;

export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const [fontWaitOver, setFontWaitOver] = useState(false);
  const [guestReady, setGuestReady] = useState(false);
  const fontsDone = fontsLoaded || !!fontError || fontWaitOver;

  useEffect(() => {
    const t = setTimeout(() => setFontWaitOver(true), FONT_WAIT_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timeout = setTimeout(() => {
      if (!cancelled) setGuestReady(true);
    }, GUEST_BOOT_TIMEOUT_MS);
    AuthService.ensureGuest()
      .catch(() => {})
      .finally(() => {
        clearTimeout(timeout);
        if (!cancelled) setGuestReady(true);
      });
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  const hideSplash = useCallback(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const t = setTimeout(hideSplash, SPLASH_FAILSAFE_MS);
    return () => clearTimeout(t);
  }, [hideSplash]);

  if (!fontsDone) return <BootView />;

  return (
    <AppErrorBoundary>
      <SafeAreaProvider>
        <IAPProviders>
          <ProfileProvider booted={guestReady}>
            <NavigationContainer onReady={hideSplash}>
              <StatusBar style="dark" />
              <RootNavigator />
            </NavigationContainer>
          </ProfileProvider>
        </IAPProviders>
      </SafeAreaProvider>
    </AppErrorBoundary>
  );
}
