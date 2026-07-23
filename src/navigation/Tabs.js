import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Icon from '../components/Icon';
import { colors, fonts } from '../theme';

import TodayScreen from '../screens/tabs/TodayScreen';
import StoriesStack from './StoriesStack';
import ReadingStack from './ReadingStack';
import YouStack from './YouStack';

const Tab = createBottomTabNavigator();
const ICONS = { Today: 'today', Stories: 'stories', Reading: 'reading', You: 'you' };
const tapTick = { tabPress: () => Haptics.selectionAsync() };

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.brass,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarIcon: ({ color, focused }) => (
          <View style={focused ? styles.pill : styles.iconWrap}>
            <Icon name={ICONS[route.name]} color={color} active={focused} size={24} />
          </View>
        ),
      })}
    >
      <Tab.Screen name="Today" component={TodayScreen} listeners={tapTick} />
      <Tab.Screen name="Stories" component={StoriesStack} listeners={tapTick} />
      <Tab.Screen name="Reading" component={ReadingStack} listeners={tapTick} />
      <Tab.Screen name="You" component={YouStack} listeners={tapTick} />
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
    shadowColor: '#6b5d4e',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 8,
  },
  label: { fontFamily: fonts.sansMed, fontSize: 11, letterSpacing: 0.2 },
  iconWrap: { paddingHorizontal: 16, paddingVertical: 6 },
  pill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(230,207,148,0.22)' },
});
