import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

const ROWS = [
  { label: 'Saved verses', route: 'Saved' },
  { label: 'Reflections', route: 'Reflections' },
  { label: 'Reminders', route: 'Reminders' },
  { label: 'Subscription', route: 'ManageSubscription' },
  { label: 'Settings', route: 'Settings' },
  { label: 'Help & support', route: 'Support' },
];
const RHYTHM_LABEL = { morning: 'Meeting each morning', evening: 'Meeting each evening', both: 'Morning & evening', later: 'No set rhythm yet' };

export default function YouScreen({ navigation }) {
  const { profile } = useProfile();
  const name = profile.name || 'friend';
  const carrying = (profile.carrying && profile.carrying[0]) || '—';
  const kept = profile.savedVerses ? profile.savedVerses.length : 0;
  return (
    <Screen gradient={['#2B2740', '#3A2C22']} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.head}>
          <GraceDove size={72} motion="halo" />
          <View><Text style={styles.name}>{name}</Text><Text style={styles.meeting}>{RHYTHM_LABEL[profile.rhythm] || RHYTHM_LABEL.morning}</Text></View>
        </View>
        <View style={styles.stats}>
          <View><Text style={styles.statLabel}>Carrying</Text><Text style={styles.statValue}>{carrying}</Text></View>
          <View style={{ alignItems: 'flex-end' }}><Text style={styles.statLabel}>Verses kept</Text><Text style={styles.statValue}>{kept}</Text></View>
        </View>
        <View style={{ marginTop: 22 }}>
          {ROWS.map((r) => (
            <Pressable key={r.label} onPress={() => r.route && navigation.navigate(r.route)} style={styles.row}>
              <Text style={styles.rowText}>{r.label}</Text>
              <Text style={styles.chev}>›</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  name: { fontFamily: fonts.serif, fontSize: 32, color: colors.onDark },
  meeting: { fontFamily: fonts.sans, fontSize: 14, color: '#B9AC9A' },
  stats: { marginTop: 22, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', borderRadius: radius.lg, padding: 20, flexDirection: 'row', justifyContent: 'space-between' },
  statLabel: { fontFamily: fonts.sans, fontSize: 13, color: '#B9AC9A' },
  statValue: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.gold },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  rowText: { flex: 1, fontFamily: fonts.sans, fontSize: 16, color: colors.onDark },
  chev: { color: colors.textFaint, fontSize: 18 },
});
