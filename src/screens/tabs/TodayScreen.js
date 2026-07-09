import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { useProfile } from '../../state/profile';
import { todaysVerse } from '../../api/bible';
import { colors, fonts, radius, shadow } from '../../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function TodayScreen() {
  const { profile } = useProfile();
  const name = profile.name || 'friend';
  const word = (profile.reflectionWord) || (profile.carrying && profile.carrying[0]) || 'Trust';

  // Prefer the verse the user kept in onboarding; otherwise today's live verse.
  const kept = profile.savedVerses && profile.savedVerses[0];
  const [daily, setDaily] = useState(kept || null);
  useEffect(() => {
    if (kept) { setDaily(kept); return; }
    let alive = true;
    todaysVerse().then((v) => { if (alive) setDaily(v); });
    return () => { alive = false; };
  }, [kept && kept.ref]);

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.greeting}>{greeting()},{'\n'}{name}.</Text>
            <Text style={styles.kept}>I kept our place.</Text>
          </View>
          <GraceDove size={58} wings="folded" motion="peek" />
        </View>

        <View style={styles.verseCard}>
          <Text style={styles.verseLabel}>{kept ? 'YOUR VERSE' : "TODAY'S VERSE"}</Text>
          <Text style={styles.verse}>{daily ? daily.text : '…'}</Text>
          <Text style={styles.verseRef}>{daily ? daily.ref.toUpperCase() : ''}</Text>
        </View>

        <View style={styles.listen}>
          <View style={styles.listenPlay}><Text style={{ color: colors.espresso, fontSize: 17 }}>▶</Text></View>
          <View>
            <Text style={styles.listenTitle}>Listen to today's reading</Text>
            <Text style={styles.listenSub}>6 min · Psalm 23</Text>
          </View>
        </View>

        <View style={styles.rowCard}>
          <View style={styles.rowThumb}><Text style={{ color: colors.brass }}>▶</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Continue · Esther</Text>
            <Text style={styles.rowSub}>Chapter 2 of 4</Text>
          </View>
          <Text style={styles.pct}>38%</Text>
        </View>

        <View style={styles.carry}>
          <Text style={styles.carryLabel}>Carrying today</Text>
          <Text style={styles.carryWord}>{word}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, lineHeight: 38 },
  kept: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brass, marginTop: 4 },
  verseCard: { marginTop: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, padding: 22, alignItems: 'center' },
  verseLabel: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.5, color: colors.brass },
  verse: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, textAlign: 'center', lineHeight: 32, marginVertical: 10 },
  verseRef: { fontFamily: fonts.sans, fontSize: 12, letterSpacing: 1, color: colors.textFaint },
  listen: { marginTop: 16, backgroundColor: colors.espressoSoft, borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16 },
  listenPlay: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  listenTitle: { fontFamily: fonts.sansBold, fontSize: 17, color: colors.onDark },
  listenSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  rowCard: { marginTop: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  rowThumb: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F1E6CF', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  pct: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.brass },
  carry: { marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(181,138,63,0.08)', borderWidth: 1, borderColor: '#E6D9BF', borderRadius: radius.md, padding: 16 },
  carryLabel: { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  carryWord: { fontFamily: fonts.serifSemi, fontSize: 24, color: colors.brass },
});
