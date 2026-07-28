import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { colors, fonts, radius } from '../../theme';

// 6 columns, 8px gaps, 22px horizontal body padding — compute exact cell width so
// every cell sits flush and the number stays centered on iOS + Android.
const COLS = 6;
const GAP = 8;
const BODY_PAD = 22;
const CELL = (Dimensions.get('window').width - BODY_PAD * 2 - GAP * (COLS - 1)) / COLS;

// Chapter counts for common books; default 30 for demo. Extend as needed.
const CHAPTERS = { Psalms: 150, Genesis: 50, Isaiah: 66, Ruth: 4, Esther: 10, John: 21, Romans: 16 };
const INTROS = {
  Psalms: '150 songs of lament, praise and trust — the prayer book of the Bible.',
};
const RANGE = 25; // chapters per range page

export default function BookScreen({ route, navigation }) {
  const book = route.params?.book || 'Psalms';
  const count = CHAPTERS[book] || 30;
  const pages = Math.ceil(count / RANGE);
  const [page, setPage] = useState(0);
  const start = page * RANGE + 1;
  const end = Math.min((page + 1) * RANGE, count);
  const chapters = Array.from({ length: end - start + 1 }, (_, i) => start + i);
  const ranges = Array.from({ length: pages }, (_, i) => {
    const s = i * RANGE + 1;
    const e = Math.min((i + 1) * RANGE, count);
    return { i, label: s + '–' + e };
  });

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Books</Text></Pressable>
          <Text style={styles.title}>{book}</Text>
          {INTROS[book] ? <Text style={styles.intro}>{INTROS[book]}</Text> : null}
        </View>
        <View style={styles.body}>
          <Pressable style={styles.continue} onPress={() => { Haptics.selectionAsync(); navigation.navigate('Chapter', { book, chapter: 1 }); }}>
            <Text style={styles.continueText}>Continue · {book} 1</Text>
          </Pressable>
          <Text style={styles.section}>CHAPTERS</Text>
          {pages > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ranges}>
              {ranges.map((r) => (
                <Pressable key={r.i} onPress={() => { Haptics.selectionAsync(); setPage(r.i); }} style={[styles.range, r.i === page && styles.rangeOn]}>
                  <Text style={[styles.rangeText, r.i === page && styles.rangeTextOn]}>{r.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          )}
          <View style={styles.grid}>
            {chapters.map((c) => (
              <Pressable key={c} style={styles.cell} onPress={() => { Haptics.selectionAsync(); navigation.navigate('Chapter', { book, chapter: c }); }}>
                <Text style={styles.cellText}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: colors.espressoSoft, paddingHorizontal: 24, paddingTop: 8, paddingBottom: 26 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  title: { fontFamily: fonts.serif, fontSize: 40, color: colors.onDark, marginTop: 14 },
  intro: { fontFamily: fonts.sans, fontSize: 14, color: colors.onDarkMuted, marginTop: 6, lineHeight: 21 },
  body: { paddingHorizontal: 22, paddingTop: 22, paddingBottom: 30 },
  continue: { backgroundColor: colors.brass, borderRadius: radius.pill, paddingVertical: 15, alignItems: 'center' },
  continueText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.white },
  section: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginTop: 20, marginBottom: 12 },
  ranges: { gap: 8, paddingBottom: 14 },
  range: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sand },
  rangeOn: { backgroundColor: colors.espresso, borderColor: colors.espresso },
  rangeText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.textMuted },
  rangeTextOn: { color: colors.ivory },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: { width: CELL, height: CELL, borderRadius: radius.sm, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, alignItems: 'center', justifyContent: 'center' },
  cellText: { fontFamily: fonts.sansMed, fontSize: 15, color: '#4A3D30', textAlign: 'center', includeFontPadding: false, lineHeight: 15 },
  more: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, textAlign: 'center', marginTop: 12 },
});
