import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, StatusBar } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { TodayService } from '../../services';
import { useProfile } from '../../state/profile';
import { colors, fonts } from '../../theme';

const UNLOCKED = ['Your verse', 'Your rhythm', 'Your stories'];

export default function ConfirmationScreen({ navigation, route }) {
  const { profile, setProfile } = useProfile();
  const [leaving, setLeaving] = useState(false);
  const handoff = useRef(new Animated.Value(0)).current;

  // The paywall says so explicitly. Reading entitlement off profile.subscribed
  // alone was a race: the context write that grants it has not necessarily
  // re-rendered by the time this screen mounts, so a genuine payer could be
  // bounced straight back out of her own celebration.
  const celebrate = route?.params?.celebrate === true;

  // Run once. Re-running on every profile change is what turned a slow context
  // write into a redirect.
  useEffect(() => {
    if (!celebrate && !profile.subscribed) {
      // No entitlement and no completed purchase behind us. Stay gated rather
      // than falling through into the app.
      navigation.replace('Paywall');
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Enter Grace flips `onboarded`, which changes the navigator key and
    // remounts the whole tree. Fetch what that tree needs now, while she is
    // reading, so the tap lands on a Home that is already populated.
    TodayService.prime(profile);
  }, []);

  const enter = () => {
    if (leaving) return;
    setLeaving(true);
    // Cover the remount with the ivory the next screen opens on, so the rebuild
    // reads as one continuous surface instead of a stalled button.
    Animated.timing(handoff, {
      toValue: 1, duration: 260, easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start(() => {
      // Persist for the next cold start, then actually navigate. Flipping
      // `onboarded` alone does not move anywhere: RootNavigator explains why the
      // old key-remount restored the current screen rather than opening the app.
      setProfile((p) => ({ ...p, onboarded: true }));
      navigation.reset({ index: 0, routes: [{ name: 'App' }] });
    });
  };

  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC', '#F1EBE0']} style={styles.wrap} ambient>
      <StatusBar barStyle="dark-content" />
      <View style={styles.center}>
        <GraceDove size={210} wings="open" motion="bless" />
        <Text style={styles.title} adjustsFontSizeToFit numberOfLines={2}>
          Your place is ready,{'\n'}{profile.name?.trim() || 'friend'}.
        </Text>
        <Text style={styles.sub}>Everything is open for the next three days. Let's begin.</Text>
        <View style={styles.row}>
          {UNLOCKED.map((u) => (
            <View key={u} style={styles.item}>
              <View style={styles.check}><Text style={{ color: colors.white, fontSize: 12 }}>✓</Text></View>
              <Text style={styles.itemText}>{u}</Text>
            </View>
          ))}
        </View>
      </View>
      <PrimaryButton label="Enter Grace" onPress={enter} testID="confirmation-enter" />

      {/* Handoff veil — held over the navigator remount that Enter Grace causes. */}
      <Animated.View
        pointerEvents={leaving ? 'auto' : 'none'}
        style={[StyleSheet.absoluteFill, { backgroundColor: colors.ivory, opacity: handoff }]}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 30, paddingBottom: 30, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 42, color: colors.ink, textAlign: 'center', marginTop: 16, lineHeight: 46 },
  sub: { fontFamily: fonts.sans, fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 12, marginHorizontal: 24 },
  row: { flexDirection: 'row', gap: 22, marginTop: 30 },
  item: { alignItems: 'center', gap: 6 },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brass, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
});
