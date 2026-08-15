import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GIcon from '../../components/GIcon';
import { ReadingService } from '../../services';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius, shadow } from '../../theme';
import { readingTheme } from '../../readingTheme';

// 6 columns, 8px gaps, 22px horizontal body padding — compute exact cell width so
// every cell sits flush and the number stays centered on iOS + Android.
const COLS = 6;
const GAP = 8;
const BODY_PAD = 22;
const CELL = (Dimensions.get('window').width - BODY_PAD * 2 - GAP * (COLS - 1)) / COLS;

const RANGE = 25; // chapters per range page

export default function BookScreen({ route, navigation }) {
  const { profile } = useProfile();
  const RT = readingTheme(profile);
  const book = route.params?.book || 'Psalms';

  // The screen used to carry its own 7-book CHAPTERS map with a default of 30,
  // so most of the Bible showed the wrong number of chapters. bookMeta already
  // knows the real counts and the intros, via ReadingService.
  const meta = ReadingService.getBook(book);
  const count = ReadingService.chapterCount(book);

  const [resume, setResume] = useState(null);

  // Read on focus so returning from a chapter updates the resume point.
  useFocusEffect(useCallback(() => {
    let alive = true;
    ReadingService.getReadingProgress()
      .then((prog) => { if (alive) setResume(prog?.[book] ?? null); })
      .catch(() => {});
    return () => { alive = false; };
  }, [book]));

  const resumeChapter = Math.min(Math.max(1, resume?.chapter || 1), count);
  const [page, setPage] = useState(0);

  // Snap to the range holding her resume point, once, and only until she picks a
  // range herself. Progress arrives after first paint, so this cannot be an
  // initial useState value.
  const autoPaged = useRef(false);
  useEffect(() => { autoPaged.current = false; }, [book]);
  useEffect(() => {
    if (autoPaged.current || !resume?.chapter) return;
    autoPaged.current = true;
    setPage(Math.floor((resumeChapter - 1) / RANGE));
  }, [resume, resumeChapter]);

  const pickRange = (i) => { autoPaged.current = true; Haptics.selectionAsync(); setPage(i); };

  const pages = Math.ceil(count / RANGE);
  const start = page * RANGE + 1;
  const end = Math.min((page + 1) * RANGE, count);
  const chapters = useMemo(
    () => Array.from({ length: Math.max(0, end - start + 1) }, (_, i) => start + i),
    [start, end],
  );
  const ranges = useMemo(() => Array.from({ length: pages }, (_, i) => {
    const s = i * RANGE + 1;
    const e = Math.min((i + 1) * RANGE, count);
    return { i, label: s + '–' + e };
  }), [pages, count]);

  const open = (chapter) => {
    Haptics.selectionAsync();
    navigation.navigate('Chapter', { book, chapter });
  };

  const started = !!resume?.chapter;

  return (
    <Screen bg={RT.bg} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero stays espresso in every reader theme, so the title is always set
            on-dark. It previously took RT.ink, which is a dark ink meant for
            light paper, and on this dark hero the book name vanished. */}
        <LinearGradient colors={['#5A4632', '#4A382C', '#3A2C22']} style={styles.hero}>
          <Pressable
            onPress={() => navigation.goBack()}
            hitSlop={10}
            style={styles.backHit}
            accessibilityRole="button"
            accessibilityLabel="Back to books"
          >
            <GIcon name="chevronRight" size={15} color={colors.gold} style={styles.backChevron} />
            <Text style={styles.back}>Books</Text>
          </Pressable>

          <Text style={styles.title}>{book}</Text>
          {meta?.intro ? <Text style={styles.intro}>{meta.intro}</Text> : null}

          <View style={styles.heroMeta}>
            <Text style={styles.heroMetaText}>{count} {count === 1 ? 'chapter' : 'chapters'}</Text>
            {meta?.group ? (
              <>
                <Text style={styles.heroMetaDot}>·</Text>
                <Text style={styles.heroMetaText}>{meta.group}</Text>
              </>
            ) : null}
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Resume card. The old CTA was a flat brass pill hardcoded to chapter
              1, so it said "Continue · Psalms 1" however far in she actually was. */}
          <Pressable
            onPress={() => open(resumeChapter)}
            style={({ pressed }) => [styles.resume, pressed && styles.resumePressed]}
            accessibilityRole="button"
            accessibilityLabel={`${started ? 'Continue' : 'Start'} reading ${book} ${resumeChapter}`}
            testID="book-resume"
          >
            <View style={styles.resumeGlyph}>
              <GIcon name="bookmark" size={18} color={colors.espresso} filled={started} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumeLabel}>{started ? 'CONTINUE READING' : 'START READING'}</Text>
              <Text style={styles.resumeWhere}>{book} {resumeChapter}</Text>
            </View>
            <GIcon name="chevronRight" size={17} color={colors.gold} />
          </Pressable>

          <Text style={[styles.section, { color: RT.sub }]}>CHAPTERS</Text>

          {pages > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ranges}>
              {ranges.map((r) => {
                const on = r.i === page;
                return (
                  <Pressable
                    key={r.i}
                    onPress={() => pickRange(r.i)}
                    style={[styles.range, { backgroundColor: RT.card, borderColor: RT.line }, on && styles.rangeOn]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                  >
                    <Text style={[styles.rangeText, { color: RT.sub }, on && styles.rangeTextOn]}>{r.label}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.grid}>
            {chapters.map((c) => {
              const current = started && c === resumeChapter;
              return (
                <Pressable
                  key={c}
                  onPress={() => open(c)}
                  style={({ pressed }) => [
                    styles.cell,
                    { backgroundColor: RT.card, borderColor: RT.line },
                    current && styles.cellCurrent,
                    pressed && styles.cellPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`${book} chapter ${c}${current ? ', where you left off' : ''}`}
                >
                  <Text style={[styles.cellText, { color: RT.ink }, current && styles.cellTextCurrent]}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 28 },
  backHit: { flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40, alignSelf: 'flex-start' },
  backChevron: { transform: [{ rotate: '180deg' }] },
  back: { fontFamily: fonts.sansMed, fontSize: 14, color: colors.gold },
  title: { fontFamily: fonts.serif, fontSize: 42, color: colors.onDark, marginTop: 10, lineHeight: 46 },
  intro: { fontFamily: fonts.sans, fontSize: 14, color: colors.onDarkMuted, marginTop: 8, lineHeight: 21 },
  heroMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  heroMetaText: { fontFamily: fonts.sansMed, fontSize: 12, letterSpacing: 0.6, color: colors.textFaintOnDark },
  heroMetaDot: { color: colors.textFaintOnDark, fontSize: 12 },

  body: { paddingHorizontal: BODY_PAD, paddingTop: 20, paddingBottom: 110 },

  resume: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.espresso, borderRadius: radius.lg,
    paddingVertical: 15, paddingHorizontal: 18, minHeight: 44,
    ...shadow.card,
  },
  resumePressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },
  resumeGlyph: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  resumeLabel: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: colors.gold },
  resumeWhere: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.onDark, marginTop: 1 },

  section: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, marginTop: 26, marginBottom: 12 },
  ranges: { gap: 8, paddingBottom: 16 },
  range: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: radius.pill, borderWidth: 1 },
  rangeOn: { backgroundColor: colors.espresso, borderColor: colors.espresso },
  rangeText: { fontFamily: fonts.sansSemi, fontSize: 13 },
  rangeTextOn: { color: colors.gold },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  cell: {
    width: CELL, height: CELL, borderRadius: radius.sm, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  cellPressed: { opacity: 0.65 },
  // Where she stopped: a gold ring rather than another filled block, so the grid
  // keeps one clear focal point.
  cellCurrent: { borderColor: colors.brass, borderWidth: 2, backgroundColor: 'rgba(230,207,148,0.22)' },
  cellText: { fontFamily: fonts.serifSemi, fontSize: 18, textAlign: 'center', includeFontPadding: false },
  cellTextCurrent: { color: colors.brassDeep },
});
