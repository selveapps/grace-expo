import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useProfile } from '../state/profile';

import SplashScreen from '../screens/onboarding/SplashScreen';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import CarryScreen from '../screens/onboarding/CarryScreen';
import SliderScreen from '../screens/onboarding/SliderScreen';
import ValueAddScreen from '../screens/onboarding/ValueAddScreen';
import VerseScreen from '../screens/onboarding/VerseScreen';
import ReflectionScreen from '../screens/onboarding/ReflectionScreen';
import StoriesPreviewScreen from '../screens/onboarding/StoriesPreviewScreen';
import RhythmScreen from '../screens/onboarding/RhythmScreen';
import SignInScreen from '../screens/onboarding/SignInScreen';
import PreparingScreen from '../screens/onboarding/PreparingScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import ConfirmationScreen from '../screens/onboarding/ConfirmationScreen';
import Tabs from './Tabs';

const Stack = createNativeStackNavigator();

// The onboarding flow is a single stack that ends by replacing into the tab app.
// Returning users (profile.onboarded persisted) skip straight to the app.
export default function RootNavigator() {
  const { profile, hydrated } = useProfile();
  if (!hydrated) return null; // wait for AsyncStorage so we don't flash onboarding
  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: '#F7F3EC' } }}
      initialRouteName={profile.onboarded ? 'App' : 'Splash'}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Name" component={NameScreen} />
      <Stack.Screen name="Carry" component={CarryScreen} />
      <Stack.Screen name="Slider" component={SliderScreen} />
      <Stack.Screen name="ValueAdd" component={ValueAddScreen} />
      <Stack.Screen name="Verse" component={VerseScreen} />
      <Stack.Screen name="Reflection" component={ReflectionScreen} />
      <Stack.Screen name="StoriesPreview" component={StoriesPreviewScreen} />
      <Stack.Screen name="Rhythm" component={RhythmScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Preparing" component={PreparingScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} />
      <Stack.Screen name="App" component={Tabs} />
    </Stack.Navigator>
  );
}
