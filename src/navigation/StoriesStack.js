import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoriesScreen from '../screens/tabs/StoriesScreen';
import StoryDetailScreen from '../screens/stories/StoryDetailScreen';
import PlayerScreen from '../screens/stories/PlayerScreen';
import TeaDetailScreen from '../screens/stories/TeaDetailScreen';

const Stack = createNativeStackNavigator();

export default function StoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoriesHome" component={StoriesScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen name="TeaDetail" component={TeaDetailScreen} />
      <Stack.Screen name="Player" component={PlayerScreen} options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
