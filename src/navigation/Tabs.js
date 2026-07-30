import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
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

// The old bar had a hard 1px top line plus a brass pill behind the active icon,
// which is the "clear demarcation" the feedback flagged. Now the bar reads as
// the same surface as the content: frosted, no line, weight carried by
// ink weight alone. Screens add paddingBottom so nothing hides underneath.
export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.espresso,
        tabBarInactiveTintColor: '#A99A85',
        tabBarStyle: styles.bar,
        tabBarLabelStyle: styles.label,
        tabBarBackground: () => (
          <View style={StyleSheet.absoluteFill}>
            {/* content dissolves into the blur rather than meeting an edge */}
            <LinearGradient
              colors={['rgba(251,249,244,0)', 'rgba(251,249,244,0.9)']}
              style={styles.fade}
              pointerEvents="none"
            />
            <BlurView intensity={28} tint="light" style={[StyleSheet.absoluteFill, styles.blur]} />
            <View style={styles.hairline} pointerEvents="none" />
          </View>
        ),
        tabBarIcon: ({ color, focused }) => (
          <View style={styles.iconWrap}>
            <Icon name={ICONS[route.name]} color={color} active={focused} size={25} />
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
    position: 'absolute',          // content scrolls under the blur
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    borderTopWidth: 0,             // kill the hard line
    elevation: 0,
    shadowOpacity: 0,
    height: 86,
    paddingTop: 10,
    paddingBottom: 28,
  },
  blur: { backgroundColor: 'rgba(251,249,244,0.72)' },
  fade: { position: 'absolute', left: 0, right: 0, top: -18, height: 18 },
  // a 6%-opacity hairline instead of a 1px border: present, not a demarcation
  hairline: { position: 'absolute', left: 0, right: 0, top: 0, height: StyleSheet.hairlineWidth, backgroundColor: 'rgba(58,44,34,0.06)' },
  label: { fontFamily: fonts.sansMed, fontSize: 11, letterSpacing: 0.2, marginTop: 2 },
  iconWrap: { alignItems: 'center', justifyContent: 'center', height: 30 },
});
