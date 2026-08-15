import React, { useEffect, useState } from 'react';
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
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

const GUEST_BOOT_TIMEOUT_MS = 3000;

export default function App() {
  const [loaded] = useFonts({
    CormorantGaramond_500Medium,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_500Medium_Italic,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
  });
  const [guestReady, setGuestReady] = useState(false);

  useEffect(() => {
    if (!loaded) return undefined;
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
  }, [loaded]);

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
  }, [loaded]);

  if (!loaded) return null;

  return (
    <SafeAreaProvider>
      <IAPProviders>
        <ProfileProvider booted={guestReady}>
          <NavigationContainer>
            <StatusBar style="dark" />
            <RootNavigator />
          </NavigationContainer>
        </ProfileProvider>
      </IAPProviders>
    </SafeAreaProvider>
  );
}
