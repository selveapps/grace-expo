import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReadingScreen from '../screens/tabs/ReadingScreen';
import OldTestamentScreen from '../screens/reading/OldTestamentScreen';
import NewTestamentScreen from '../screens/reading/NewTestamentScreen';
import BookScreen from '../screens/reading/BookScreen';
import ChapterScreen from '../screens/reading/ChapterScreen';
import SearchScreen from '../screens/reading/SearchScreen';

const Stack = createNativeStackNavigator();

export default function ReadingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ReadingHome" component={ReadingScreen} />
      <Stack.Screen name="OldTestament" component={OldTestamentScreen} />
      <Stack.Screen name="NewTestament" component={NewTestamentScreen} />
      <Stack.Screen name="Book" component={BookScreen} />
      <Stack.Screen name="Chapter" component={ChapterScreen} />
      <Stack.Screen name="Search" component={SearchScreen} />
    </Stack.Navigator>
  );
}
