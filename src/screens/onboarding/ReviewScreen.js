import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import * as StoreReview from 'expo-store-review';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { ReviewService } from '../../services';
import { colors, fonts } from '../../theme';

// Asks for the App Store review inside onboarding, at the moment of warmth,
// instead of the old notification-reminder screen. Never blocks: the native
// prompt is unavailable in Expo Go and capped by Apple at 3 per year, so both
// paths always continue to SignIn.
export default function ReviewScreen({ navigation }) {
  const [busy, setBusy] = useState(false);
  const stars = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(stars, {
      toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
  }, []);

  const ask = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    ReviewService.markPrompted('onboarding');
    try {
      if (await StoreReview.hasAction()) await StoreReview.requestReview();
    } catch {
      // no store action available (Expo Go, simulator) — carry on quietly
    }
    setBusy(false);
    navigation.navigate('SignIn');
  };

  const later = () => {
    Haptics.selectionAsync();
    ReviewService.markDeclined('onboarding');
    navigation.navigate('SignIn');
  };

  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC']} style={styles.wrap} ambient>
      <View style={{ alignItems: 'center' }}>
        <GraceDove size={132} wings="folded" motion="peek" />
      </View>
      <Text style={styles.title} adjustsFontSizeToFit numberOfLines={2}>
        Would you tell others about Grace?
      </Text>
      <Text style={styles.sub}>
        A word from you helps another woman find her quiet place. It takes a moment.
      </Text>
      <Animated.View
        style={[styles.stars, {
          opacity: stars,
          transform: [{ scale: stars.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) }],
        }]}
      >
        {[0, 1, 2, 3, 4].map((i) => <Text key={i} style={styles.star}>★</Text>)}
      </Animated.View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Leave a review" onPress={ask} />
      <Pressable onPress={later} style={styles.laterHit} hitSlop={8}>
        <Text style={styles.later}>Not right now</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 24, paddingBottom: 30 },
  title: { fontFamily: fonts.serif, fontSize: 38, lineHeight: 42, color: colors.ink, textAlign: 'center', marginTop: 18 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center', marginTop: 12, paddingHorizontal: 10 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginTop: 26 },
  star: { fontSize: 34, color: colors.brass },
  laterHit: { minHeight: 44, justifyContent: 'center' },
  later: { fontFamily: fonts.sans, fontSize: 16, color: colors.textMuted, textAlign: 'center' },
});
