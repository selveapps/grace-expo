// Browse by theme.
//
// The eight chips on the Reading tab used to be inert: `onPress={tick}` fired a
// haptic and nothing else, so the section read as a feature that existed. This
// is what is behind a chip now.
//
// Each passage renders straight away as reference plus the reason it is on the
// list, and the verse text fills in as it arrives. Loading eight passages before
// showing anything would put a spinner in front of content we already have.
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { useProfile } from '../../state/profile';
import { getPassage } from '../../api/bible';
import { THEME_PASSAGES, THEME_BLURB } from '../../data/themes';
import { colors, fonts, radius } from '../../theme';
import { readingTheme } from '../../readingTheme';

/** "1 Corinthians 16:13" / "Psalm 23:1-4" -> the Chapter route's params. */
export function parseRef(ref) {
  const m = String(ref).match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/);
  if (!m) return null;
  // The reader's book list uses "Psalms"; references are conventionally written
  // "Psalm 23", so the two have to be reconciled before navigating.
  const book = m[1] === 'Psalm' ? 'Psalms' : m[1];
  return { book, chapter: Number(m[2]), verse: Number(m[3]) };
}

export default function ThemeScreen({ navigation, route }) {
  const theme = route.params?.theme;
  const { profile } = useProfile();
  const RT = readingTheme(profile);

  const passages = THEME_PASSAGES[theme] || [];
  const [texts, setTexts] = useState({});

  useEffect(() => {
    let alive = true;
    // Each passage lands on its own so the list fills top-down instead of
    // waiting on the slowest request.
    passages.forEach((p) => {
      getPassage(p.ref)
        .then((data) => {
          if (alive && data?.text) setTexts((prev) => ({ ...prev, [p.ref]: data.text }));
        })
        .catch(() => {});
    });
    return () => { alive = false; };
  }, [theme]);

  const open = useCallback((ref) => {
    const parsed = parseRef(ref);
    if (!parsed) return;
    Haptics.selectionAsync();
    navigation.navigate('Chapter', parsed);
  }, [navigation]);

  if (!theme || !passages.length) {
    return (
      <Screen bg={RT.bg} edges={['top']}>
        <Pressable onPress={() => navigation.goBack()} testID="theme-back">
          <Text style={styles.back}>‹ Reading</Text>
        </Pressable>
        <Text style={styles.empty}>That theme has no passages yet.</Text>
      </Screen>
    );
  }

  return (
    <Screen bg={RT.bg} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="theme-back">
          <Text style={styles.back}>‹ Reading</Text>
        </Pressable>
        <Text style={[styles.h1, { color: RT.ink }]}>{theme}</Text>
        <Text style={styles.blurb}>{THEME_BLURB[theme]}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {passages.map((p) => (
          <Pressable
            key={p.ref}
            style={styles.card}
            onPress={() => open(p.ref)}
            accessibilityRole="button"
            accessibilityLabel={`${p.ref}. ${p.note}`}
            testID={`theme-passage-${p.ref}`}
          >
            <Text style={styles.ref}>{p.ref.toUpperCase()}</Text>
            {texts[p.ref] ? (
              <Text style={[styles.text, { color: RT.ink }]}>{texts[p.ref]}</Text>
            ) : (
              <ActivityIndicator color={colors.brass} style={styles.loading} />
            )}
            <Text style={styles.note}>{p.note}</Text>
          </Pressable>
        ))}
        <Text style={styles.footer}>Tap any passage to open the full chapter.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 4 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6 },
  blurb: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginTop: 6, lineHeight: 20 },
  // the tab bar floats over the content, so leave room for it
  body: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 110 },
  card: {
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine,
    borderRadius: radius.md, padding: 16, marginBottom: 10,
  },
  ref: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1, color: colors.brass },
  text: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginTop: 8, lineHeight: 26 },
  loading: { alignSelf: 'flex-start', marginTop: 10, marginBottom: 2 },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 10, lineHeight: 19 },
  footer: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, textAlign: 'center', marginTop: 8 },
  empty: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 40 },
});
