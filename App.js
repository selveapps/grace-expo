import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
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

  if (!loaded || !booted) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.brass} />
      </View>
    );
  }

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
