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
import ReviewScreen from '../screens/onboarding/ReviewScreen';
import SignInScreen from '../screens/onboarding/SignInScreen';
import PreparingScreen from '../screens/onboarding/PreparingScreen';
import PaywallScreen from '../screens/onboarding/PaywallScreen';
import ConfirmationScreen from '../screens/onboarding/ConfirmationScreen';
import Tabs from './Tabs';

const Stack = createNativeStackNavigator();

// The onboarding flow is a single stack that ends by navigating into the tab app.
// Returning users (profile.onboarded persisted) skip straight to the app.
//
// This used to carry `key={profile.onboarded ? 'app' : 'onboarding'}` and treat
// that remount as the only way into the app. It does not work. React Navigation
// rebuilds a remounted navigator from the existing state whenever the route
// names still match, and they always match here because it is one stack with a
// fixed screen list. So `initialRouteName` was ignored, the stack was restored
// with Paywall still on top, and flipping `onboarded` left the user looking at
// the screen they had just finished with: the "same screen pops up" report.
//
// `initialRouteName` now only decides where a COLD start begins. Moving into the
// app mid-session is an explicit navigation.reset by the screen that earns it
// (Paywall's soft exit, Confirmation's Enter Grace). Dropping the key also drops
// a full remount of the tab tree, which is what made Enter Grace feel slow.
export default function RootNavigator() {
  const { profile, hydrated } = useProfile();
  if (!hydrated) return null; // wait for AsyncStorage so we don't flash onboarding
  return (
    <Stack.Navigator
      // Named so a deeply nested screen (Settings, inside You, inside Tabs) can
      // reach the root to send the user back to onboarding after a sign-out.
      id="root"
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
      <Stack.Screen name="Review" component={ReviewScreen} />
      {/* Rhythm is out of the onboarding flow but still reachable from You -> Reminders */}
      <Stack.Screen name="Rhythm" component={RhythmScreen} />
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="Preparing" component={PreparingScreen} />
      <Stack.Screen name="Paywall" component={PaywallScreen} />
      <Stack.Screen name="Confirmation" component={ConfirmationScreen} options={{ animation: 'fade', animationDuration: 420 }} />
      <Stack.Screen name="App" component={Tabs} options={{ animation: 'fade', animationDuration: 520 }} />
    </Stack.Navigator>
  );
}
