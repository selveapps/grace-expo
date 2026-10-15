import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Icon from '../components/Icon';
import TeaMiniPlayer from '../components/TeaMiniPlayer';
import ScreenErrorBoundary from '../components/ScreenErrorBoundary';
import { colors, fonts } from '../theme';

import TodayScreen from '../screens/tabs/TodayScreen';
import StoriesStack from './StoriesStack';
import ReadingStack from './ReadingStack';
import YouStack from './YouStack';

const Tab = createBottomTabNavigator();
const ICONS = { Today: 'today', Stories: 'stories', Reading: 'reading', You: 'you' };

// One boundary per tab scene. A throw stays inside that scene, so the bar
// remains and the reviewer can leave a broken Home for Reading.
function guard(ScreenComponent) {
  return function GuardedScreen(props) {
    return (
      <ScreenErrorBoundary>
        <ScreenComponent {...props} />
      </ScreenErrorBoundary>
    );
  };
}

const GuardedToday = guard(TodayScreen);
const GuardedStories = guard(StoriesStack);
const GuardedReading = guard(ReadingStack);
const GuardedYou = guard(YouStack);

/**
 * Tapping a tab always returns that tab to its own root.
 *
 * Without this, a tab remembers wherever you left it: open the player from
 * Home's listen card and the Stories tab kept showing the player, so the
 * Stories list and the Tea segment became unreachable. Tapping the tab you are
 * already on is the universal "take me back to the top of this section"
 * gesture, and it is what makes every collection reachable again.
 */
const tabListeners = ({ navigation, route }) => ({
  tabPress: (e) => {
    Haptics.selectionAsync();
    const state = navigation.getState();
    const nested = state?.routes?.find((r) => r.name === route.name)?.state;
    // Only intervene when this tab is already showing something above its root.
    if (!nested || !nested.index) return;
    // The default tabPress action re-applies the tab's stored state, which is
    // what put the player back on screen. Replace it rather than racing it.
    e.preventDefault();
    navigation.navigate(route.name, { screen: nested.routeNames[0], params: undefined });
  },
});

// The old bar had a hard 1px top line plus a brass pill behind the active icon,
// which is the "clear demarcation" the feedback flagged. Now the bar reads as
// the same surface as the content: frosted, no line, weight carried by
// ink weight alone. Screens add paddingBottom so nothing hides underneath.
export default function Tabs() {
  return (
    <View style={styles.fill}>
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        freezeOnBlur: false,
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
      <Tab.Screen name="Today" component={GuardedToday} listeners={tabListeners} />
      <Tab.Screen name="Stories" component={GuardedStories} listeners={tabListeners} />
      <Tab.Screen name="Reading" component={GuardedReading} listeners={tabListeners} />
      <Tab.Screen name="You" component={GuardedYou} listeners={tabListeners} />
    </Tab.Navigator>
    {/* Above the tab navigator so a playing Tea can be stopped from any tab. */}
    <TeaMiniPlayer />
    </View>
  );
}

const styles = StyleSheet.create({
  // A fragment as the native-stack scene can lay out at zero height, which is
  // a blank screen after Enter Grace. One flex child fills the scene.
  fill: { flex: 1, backgroundColor: colors.ivory },
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
