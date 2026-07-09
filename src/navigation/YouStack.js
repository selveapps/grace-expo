import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import YouScreen from '../screens/tabs/YouScreen';
import ReflectionsScreen from '../screens/you/ReflectionsScreen';
import SavedScreen from '../screens/you/SavedScreen';
import RemindersScreen from '../screens/you/RemindersScreen';
import ManageSubscriptionScreen from '../screens/you/ManageSubscriptionScreen';
import SupportScreen from '../screens/you/SupportScreen';
import SettingsScreen from '../screens/you/SettingsScreen';
import PreferencesScreen from '../screens/you/PreferencesScreen';

const Stack = createNativeStackNavigator();

export default function YouStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="YouHome" component={YouScreen} />
      <Stack.Screen name="Reflections" component={ReflectionsScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} />
      <Stack.Screen name="Reminders" component={RemindersScreen} />
      <Stack.Screen name="ManageSubscription" component={ManageSubscriptionScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
    </Stack.Navigator>
  );
}
