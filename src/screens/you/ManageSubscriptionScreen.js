import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { SubscriptionService } from '../../services';
import { colors, fonts, radius } from '../../theme';

const LABEL = { free: 'Free', trialing: 'Trial', active: 'Active', expired: 'Expired', canceled: 'Canceled' };

function fmtDate(ts) {
  if (!ts) return '';
  return new Date(ts).toLocaleDateString(undefined, { month: 'long', day: 'numeric' });
}

export default function ManageSubscriptionScreen({ navigation }) {
  const [sub, setSub] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => { SubscriptionService.getStatus().then(setSub); }, []);
  useFocusEffect(load);

  const restore = async () => {
    setBusy(true); Haptics.selectionAsync();
    const s = await SubscriptionService.restore();
    setSub(s); setBusy(false);
  };
  const cancel = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setSub(await SubscriptionService.cancel());
  };
  const startTrial = async () => {
    setBusy(true); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSub(await SubscriptionService.purchase('annual')); setBusy(false);
  };

  if (!sub) return <Screen bg={colors.ivory}><View style={styles.loading}><ActivityIndicator color={colors.brass} /></View></Screen>;

  const active = sub.status === 'trialing' || sub.status === 'active' || sub.status === 'canceled';

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }} ambient>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
      <Text style={styles.h1}>Subscription</Text>

      <View style={styles.card}>
        <View style={styles.cardHead}>
          <Text style={styles.plan}>Grace Plus</Text>
          <View style={styles.pill}><Text style={styles.pillText}>{LABEL[sub.status]}</Text></View>
        </View>
        {sub.status === 'trialing' && <Text style={styles.cardSub}>Free until {fmtDate(sub.trialEndsAt)} · then $69.99 / year</Text>}
        {sub.status === 'active' && <Text style={styles.cardSub}>Renews {fmtDate(sub.renewsAt)}</Text>}
        {sub.status === 'canceled' && <Text style={styles.cardSub}>Canceled — you keep access until {fmtDate(sub.trialEndsAt || sub.renewsAt)}</Text>}
        {sub.status === 'expired' && <Text style={styles.cardSub}>Your trial has ended. You can keep reading free, or continue with Plus.</Text>}
        {sub.status === 'free' && <Text style={styles.cardSub}>You're on the free plan.</Text>}
      </View>

      {(sub.status === 'free' || sub.status === 'expired') && (
        <Pressable style={styles.primary} onPress={startTrial}><Text style={styles.primaryText}>{busy ? 'Preparing…' : 'Start 3-day free trial'}</Text></Pressable>
      )}

      <View style={styles.rows}>
        <Pressable style={styles.row} onPress={restore}><Text style={styles.rowText}>Restore purchase</Text><Text style={styles.chev}>{busy ? '…' : '›'}</Text></Pressable>
        <Pressable style={styles.row}><Text style={styles.rowText}>Manage in App Store</Text><Text style={styles.chev}>›</Text></Pressable>
        {active && <Pressable style={styles.row} onPress={cancel}><Text style={[styles.rowText, { color: colors.danger }]}>Cancel subscription</Text><Text style={styles.chev}>›</Text></Pressable>}
      </View>

      <Text style={styles.note}>Billed through the App Store. Cancel anytime — you keep access until your period ends.</Text>
      <View style={styles.dove}><GraceDove size={90} wings="folded" motion="breathe" /></View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6, marginBottom: 20 },
  card: { backgroundColor: colors.brass, borderRadius: radius.lg, padding: 24 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  plan: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.white },
  pill: { backgroundColor: 'rgba(255,255,255,0.22)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  pillText: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.white },
  cardSub: { fontFamily: fonts.sans, fontSize: 14, color: 'rgba(255,255,255,0.9)', marginTop: 8 },
  primary: { backgroundColor: colors.espresso, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center', marginTop: 16 },
  primaryText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.onDark },
  rows: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, overflow: 'hidden', marginTop: 18 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 18, borderBottomWidth: 1, borderBottomColor: '#F1ECE2' },
  rowText: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  chev: { color: '#C9BCA6', fontSize: 16 },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 16, lineHeight: 19 },
  dove: { alignItems: 'center', marginTop: 20 },
});
