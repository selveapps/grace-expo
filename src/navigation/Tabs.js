import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import Icon from '../components/Icon';
import { colors, fonts } from '../theme';

import TodayScreen from '../screens/tabs/TodayScreen';
import StoriesStack from './StoriesStack';
import ReadingStack from './ReadingStack';
import YouStack from './YouStack';

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brass,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, focused }) => {
          const map = { Today: 'today', Stories: 'stories', Reading: 'reading', You: 'you' };
          return <Icon name={map[route.name]} color={color} active={focused} size={24} />;
        },
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Stories" component={StoriesStack} />
      <Tab.Screen name="Reading" component={ReadingStack} />
      <Tab.Screen name="You" component={YouStack} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: colors.ivory,
    borderTopColor: colors.sand,
    borderTopWidth: 1,
    height: 88,
    paddingTop: 10,
    paddingBottom: 30,
  },
  label: { fontFamily: fonts.sansMed, fontSize: 11, letterSpacing: 0.2 },
});
