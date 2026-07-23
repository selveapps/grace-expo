import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { SubscriptionService } from '../../services';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

const OFFERS = SubscriptionService.getOfferings();
const PRICE = Object.fromEntries(OFFERS.map((o) => [o.id, `${o.displayPrice} / ${o.period}`]));

const TRIAL = [
  { when: 'Today', text: 'Full access begins, free.' },
  { when: 'Day 2', text: "We'll send a gentle reminder." },
  { when: 'Day 3', text: 'Trial ends. Cancel anytime.' },
];

export default function PaywallScreen({ navigation }) {
  const { setProfile } = useProfile();
  const [plan, setPlan] = useState('annual');
  const [busy, setBusy] = useState(false);
  const veil = useRef(new Animated.Value(1)).current;   // light veil from Preparing → fades out
  const dove = useRef(new Animated.Value(0)).current;   // Grace blooms in
  const body = useRef(new Animated.Value(0)).current;   // content rises
  const bloom = useRef(new Animated.Value(0)).current;  // halo glow

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(dove, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(bloom, { toValue: 1, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(veil, { toValue: 0, duration: 850, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.timing(body, { toValue: 1, duration: 650, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft), 700); // blessing settle
    return () => clearTimeout(t);
  }, []);

  const pick = (p) => { Haptics.selectionAsync(); setPlan(p); };
  const start = async () => {
    if (busy) return;
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await SubscriptionService.purchase(plan);
    setProfile((p) => ({ ...p, subscribed: true, onboarded: true }));
    setBusy(false);
    navigation.navigate('Confirmation');
  };

  // Soft fake paywall: a tap on any empty area (not a plan card or the CTA)
  // quietly enters the app. Mark onboarded so RootNavigator won't bounce back.
  const enterHome = () => {
    setProfile((p) => ({ ...p, onboarded: true }));
    navigation.reset({ index: 0, routes: [{ name: 'App' }] });
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={enterHome}>
    <Screen gradient={['#5A4632', '#3A2C22', '#2B2015']} style={styles.wrap} ambient>
      <Animated.View style={{ alignItems: 'center', height: 168, justifyContent: 'center' }}>
        <Animated.View style={{
          position: 'absolute', width: 260, height: 260, borderRadius: 260, backgroundColor: colors.gold,
          opacity: bloom.interpolate({ inputRange: [0, 1], outputRange: [0, 0.22] }),
          transform: [{ scale: bloom.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }} />
        <Animated.View style={{
          opacity: dove,
          transform: [
            { scale: dove.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) },
            { translateY: dove.interpolate({ inputRange: [0, 1], outputRange: [-20, 0] }) },
          ],
        }}>
          <GraceDove size={150} wings="open" motion="bless" />
        </Animated.View>
      </Animated.View>
      <Animated.View style={{ opacity: body, transform: [{ translateY: body.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) }] }}>
      <Text style={styles.title}>Begin your quiet{'\n'}place with Grace.</Text>
      <Text style={styles.sub}>Three days free. Then continue if it feels right.</Text>

      <Pressable onPress={() => pick('annual')} style={[styles.plan, plan === 'annual' && styles.planOn]}>
        {plan === 'annual' && <View style={styles.badge}><Text style={styles.badgeText}>BEST VALUE</Text></View>}
        <View style={styles.planRow}>
          <View><Text style={styles.planName}>Annual</Text><Text style={styles.planPrice}>{PRICE.annual}</Text></View>
          <View style={[styles.radio, plan === 'annual' && styles.radioOn]}>{plan === 'annual' && <Text style={{ color: colors.espresso, fontSize: 13 }}>✓</Text>}</View>
        </View>
      </Pressable>
      <Pressable onPress={() => pick('monthly')} style={[styles.planQuiet, plan === 'monthly' && styles.planOn]}>
        <View style={styles.planRow}>
          <View><Text style={styles.planName}>Monthly</Text><Text style={styles.planPrice}>{PRICE.monthly}</Text></View>
          <View style={[styles.radio, plan === 'monthly' && styles.radioOn]}>{plan === 'monthly' && <Text style={{ color: colors.espresso, fontSize: 13 }}>✓</Text>}</View>
        </View>
      </Pressable>

      <View style={styles.timeline}>
        {TRIAL.map((t, i) => (
          <View key={t.when} style={styles.tRow}>
            <View style={styles.tCol}>
              <View style={[styles.tDot, { backgroundColor: i === 0 ? colors.gold : 'rgba(230,207,148,0.6)' }]} />
              {i < 2 && <View style={styles.tLine} />}
            </View>
            <View style={{ paddingBottom: 12 }}>
              <Text style={styles.tWhen}>{t.when}</Text><Text style={styles.tText}>{t.text}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      {/* CTA island — swallow taps so the fake-paywall enterHome doesn't fire here */}
      <View onStartShouldSetResponder={() => true}>
        <PrimaryButton label={busy ? 'Preparing…' : 'Start 3-day free trial'} variant="gold" onPress={start} testID="paywall-start-trial" />
      </View>
      </Animated.View>

      {/* light veil carried over from Preparing — fades to reveal the blessing */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FDF6E4', opacity: veil }]} />
    </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.onDark, textAlign: 'center', lineHeight: 40, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.onDarkMuted, textAlign: 'center', marginTop: 10, marginBottom: 22 },
  plan: { padding: 18, borderRadius: radius.lg, backgroundColor: 'rgba(230,207,148,0.14)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  planQuiet: { padding: 18, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  planOn: { borderColor: colors.gold },
  badge: { position: 'absolute', top: -11, left: 20, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.5, color: colors.espresso },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.onDark },
  planPrice: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkMuted, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.gold, backgroundColor: colors.gold },
  timeline: { marginTop: 20 },
  tRow: { flexDirection: 'row', gap: 14 },
  tCol: { alignItems: 'center' },
  tDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  tLine: { width: 2, flex: 1, backgroundColor: 'rgba(230,207,148,0.4)' },
  tWhen: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.onDark },
  tText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
});
