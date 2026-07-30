import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { SubscriptionService, TodayService } from '../../services';
import { useProfile } from '../../state/profile';
import { LEGAL } from '../../legal';
import { colors, fonts, radius } from '../../theme';

const OFFERS = SubscriptionService.getOfferings();
const PRICE = Object.fromEntries(OFFERS.map((o) => [o.id, `${o.displayPrice} / ${o.period}`]));

// Guideline 3.1.2 wants the subscription's name, length and price per period
// stated on the purchase screen itself, not only inside the store sheet.
const DISCLOSURE = Object.fromEntries(OFFERS.map((o) => [
  o.id,
  `Grace Plus, ${o.type === 'annual' ? '1 year' : '1 month'}, ${o.displayPrice} per ${o.period}. `
  + `${o.trialDays}-day free trial, then it renews automatically until cancelled. `
  + 'Cancel any time in your App Store account settings.',
]));

// The one-line version that always shows: price, period and renewal in a glance.
const SUMMARY = Object.fromEntries(OFFERS.map((o) => [
  o.id,
  `${o.displayPrice}/${o.period} after a ${o.trialDays}-day free trial. Cancel anytime.`,
]));

const openLegal = (url) => Linking.openURL(url).catch(() => {});

const TRIAL = [
  { when: 'Today', text: 'Full access begins, free.' },
  { when: 'Day 2', text: "We'll send a gentle reminder." },
  { when: 'Day 3', text: 'Trial ends. Cancel anytime.' },
];

export default function PaywallScreen({ navigation }) {
  const { profile, setProfile } = useProfile();
  const [plan, setPlan] = useState('annual');
  const [busy, setBusy] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [legalOpen, setLegalOpen] = useState(false);
  const veil = useRef(new Animated.Value(1)).current;   // light veil from Preparing → fades out
  const outro = useRef(new Animated.Value(0)).current;  // ivory bloom on the way out
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

  // Hand off the light: bloom the dark paywall out to ivory before navigating, so
  // Confirmation/Home fade in from the same colour and it reads as one screen.
  const leave = (fn) => {
    Animated.timing(outro, {
      toValue: 1, duration: 420, easing: Easing.out(Easing.ease), useNativeDriver: true,
    }).start(fn);
  };

  // The one route out of the paywall: a real entitlement. `celebrate` is passed
  // explicitly rather than left for Confirmation to infer from profile.subscribed,
  // because the context write below has not necessarily re-rendered by the time
  // Confirmation mounts. That race is what made Confirmation eject on arrival.
  const grant = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Mark subscribed but NOT onboarded yet: onboarded flips the navigator key
    // and remounts the tree, which would yank Confirmation out from under her.
    // Confirmation sets onboarded when she taps Enter Grace.
    setProfile((p) => ({ ...p, subscribed: true }));
    leave(() => navigation.replace('Confirmation', { celebrate: true }));
  };

  const start = async () => {
    if (busy || restoring) return;
    setBusy(true);
    setError(null);
    setNotice(null);
    const res = await SubscriptionService.purchase(plan).catch(() => null);
    setBusy(false);

    // Only a real trialing/active result earns the celebration. Anything else
    // leaves her here, entitled to nothing and told so plainly. A failure must
    // never fall through into the app.
    if (res && (res.status === 'trialing' || res.status === 'active')) {
      grant();
    } else if (res && res.status === 'cancelled') {
      // She backed out of the sheet. Stay put, no scolding.
    } else {
      setError("That didn't go through, and you haven't been charged. Tap to try again.");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  };

  // Soft paywall: a tap on empty space, meaning anywhere that is not a plan
  // card, the CTA island or a legal link, enters the app. She is not a payer, so
  // there is no celebration and `subscribed` stays false.
  //
  // Note how this differs from a FAILED purchase: that stays on this screen with
  // a recoverable error and never falls through, because a charge that did not
  // go through must not read as access granted. This path is someone choosing
  // not to buy, which is a different thing and gets a graceful exit.
  const enterHome = () => {
    // Warm Home so the tab tree has nothing left to fetch when it mounts.
    TodayService.prime(profile);
    leave(() => {
      // `onboarded` is what makes the NEXT cold start skip onboarding. It does
      // not navigate: see RootNavigator on why the old key-remount silently
      // restored this very screen instead of opening the app.
      setProfile((p) => ({ ...p, onboarded: true }));
      // The actual move, with onboarding dropped off the back stack.
      navigation.reset({ index: 0, routes: [{ name: 'App' }] });
    });
  };

  // Restoring is the other legitimate way in, and the App Store expects it to be
  // reachable from the purchase screen rather than only from Settings.
  const restore = async () => {
    if (busy || restoring) return;
    setRestoring(true);
    setError(null);
    setNotice(null);
    const res = await SubscriptionService.restore().catch(() => null);
    setRestoring(false);

    if (res && (res.status === 'trialing' || res.status === 'active')) {
      grant();
    } else {
      setNotice('No previous subscription found on this Apple ID.');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
  };

  return (
    <Pressable style={{ flex: 1 }} onPress={enterHome} accessibilityLabel="Continue without subscribing">
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
      {/* CTA island — swallows taps so the soft-paywall exit never fires on the
          trial button, Restore, or the legal links. */}
      <View onStartShouldSetResponder={() => true}>
        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}
        <PrimaryButton label={busy ? 'Preparing…' : 'Start 3-day free trial'} variant="gold" onPress={start} testID="paywall-start-trial" />
        <Pressable onPress={restore} hitSlop={8} style={styles.restore} accessibilityRole="button" testID="paywall-restore">
          <Text style={styles.restoreText}>{restoring ? 'Checking…' : 'Restore purchase'}</Text>
        </Pressable>
        {/* Guideline 3.1.2 needs title, length and price per period beside the
            CTA with both documents linked. It stays fully present, but as one
            quiet line plus a tap to expand, so it stops dominating the screen. */}
        <Pressable onPress={() => { Haptics.selectionAsync(); setLegalOpen((v) => !v); }} hitSlop={8} style={styles.legalToggle}>
          <Text style={styles.legalSummary}>
            {SUMMARY[plan]}  <Text style={styles.legalMore}>{legalOpen ? 'Less' : 'Details'}</Text>
          </Text>
        </Pressable>
        {legalOpen ? <Text style={styles.disclosure}>{DISCLOSURE[plan]}</Text> : null}
        <View style={styles.legalRow}>
          <Pressable onPress={() => openLegal(LEGAL.termsUrl)} hitSlop={10}><Text style={styles.legalLink}>Terms</Text></Pressable>
          <Text style={styles.legalDot}>·</Text>
          <Pressable onPress={() => openLegal(LEGAL.privacyUrl)} hitSlop={10}><Text style={styles.legalLink}>Privacy</Text></Pressable>
        </View>
      </View>
      </Animated.View>

      {/* light veil carried over from Preparing — fades to reveal the blessing */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FDF6E4', opacity: veil }]} />
      {/* outro bloom — carries the eye out of the dark screen into ivory */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: '#FDF6E4', opacity: outro }]} />
    </Screen>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 12 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.onDark, textAlign: 'center', lineHeight: 42, marginTop: 2 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 23, color: colors.onDarkMuted, textAlign: 'center', marginTop: 8, marginBottom: 20 },
  plan: { padding: 16, borderRadius: radius.lg, backgroundColor: 'rgba(230,207,148,0.14)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.15)', marginBottom: 12 },
  planQuiet: { padding: 16, borderRadius: radius.lg, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.15)' },
  planOn: { borderColor: colors.gold },
  badge: { position: 'absolute', top: -11, left: 20, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.sansBold, fontSize: 11, letterSpacing: 0.5, color: colors.espresso },
  planRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  planName: { fontFamily: fonts.sansBold, fontSize: 18, color: colors.onDark },
  planPrice: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkMuted, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  radioOn: { borderColor: colors.gold, backgroundColor: colors.gold },
  timeline: { marginTop: 18, marginBottom: 4 },
  tRow: { flexDirection: 'row', gap: 14 },
  tCol: { alignItems: 'center' },
  tDot: { width: 12, height: 12, borderRadius: 6, marginTop: 3 },
  tLine: { width: 2, flex: 1, backgroundColor: 'rgba(230,207,148,0.4)' },
  tWhen: { fontFamily: fonts.sansBold, fontSize: 14, color: colors.onDark },
  tText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  error: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: '#E8A598', textAlign: 'center', marginBottom: 12 },
  notice: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.onDarkMuted, textAlign: 'center', marginBottom: 12 },
  restore: { minHeight: 40, justifyContent: 'center', alignItems: 'center', marginTop: 6 },
  restoreText: { fontFamily: fonts.sansMed, fontSize: 14, color: 'rgba(230,207,148,0.9)' },
  legalToggle: { minHeight: 34, justifyContent: 'center', marginTop: 10 },
  legalSummary: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 17, color: 'rgba(203,185,143,0.78)', textAlign: 'center' },
  legalMore: { fontFamily: fonts.sansSemi, color: colors.gold },
  disclosure: { fontFamily: fonts.sans, fontSize: 11.5, lineHeight: 17, color: 'rgba(203,185,143,0.72)', textAlign: 'center', marginTop: 6, paddingHorizontal: 6 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, minHeight: 40 },
  legalLink: { fontFamily: fonts.sansMed, fontSize: 12, color: 'rgba(230,207,148,0.85)' },
  legalDot: { color: 'rgba(203,185,143,0.55)', fontSize: 12 },
});
