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
import { colors } from './src/theme';

// Hold the native splash until fonts and the guest session are ready. Without
// this the splash auto-hides the moment JS boots, exposing a spinner on a
// different background: launch read as three screens (dark icon plate, ivory
// spinner, then the dove). One surface, one branded moment.
SplashScreen.preventAutoHideAsync().catch(() => {});

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
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AuthService.ensureGuest()
      .catch(() => {})
      .finally(() => { if (!cancelled) setBooted(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (loaded && booted) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, booted]);

  // Native splash is still up; rendering nothing avoids a second background.
  if (!loaded || !booted) return null;

  return (
    <SafeAreaProvider>
      <ProfileProvider booted={booted}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootNavigator />
        </NavigationContainer>
      </ProfileProvider>
    </SafeAreaProvider>
  );
}
