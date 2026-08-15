import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import StoriesScreen from '../screens/tabs/StoriesScreen';
import StoryDetailScreen from '../screens/stories/StoryDetailScreen';
import CollectionScreen from '../screens/stories/CollectionScreen';
import PlayerScreen from '../screens/stories/PlayerScreen';
import TeaDetailScreen from '../screens/stories/TeaDetailScreen';

const Stack = createNativeStackNavigator();

export default function StoriesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StoriesHome" component={StoriesScreen} />
      <Stack.Screen name="Collection" component={CollectionScreen} />
      <Stack.Screen name="StoryDetail" component={StoryDetailScreen} />
      <Stack.Screen name="TeaDetail" component={TeaDetailScreen} />
      {/*
        Deliberately NOT `presentation: 'modal'`.

        As a modal the player covered the tab bar and made it inert, so once it
        was open the only way out was its own small chevron. That was survivable
        while the only route in was Story Detail, but Home's listen and continue
        cards now open it directly, and the result was being unable to get back
        to the Stories list or Tea at all: "I can't navigate to Tea or all
        Stories now? Only the chosen ones for the day."

        As a normal push it keeps the slide-up feel, the tab bar stays live, and
        back returns to whatever opened it.
      */}
      <Stack.Screen name="Player" component={PlayerScreen} options={{ animation: 'slide_from_bottom' }} />
    </Stack.Navigator>
  );
}
