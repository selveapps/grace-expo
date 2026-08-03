// Search scripture.
//
// This screen looked finished and returned nothing for every query. Two causes,
// both fixed here and in `backend/src/lib/kjv.ts`:
//
//  1. The server searched the `bible_verse` table, which is empty on any
//     environment where the 1,189-request KJV seed has not been run. Every
//     query came back `{ot:[],nt:[]}` and the screen dutifully rendered "No
//     verses found", which is indistinguishable from a genuinely empty result.
//  2. Typing a reference ("John 3:16"), the most obvious thing to type into a
//     Bible search box, could never match: the search was a substring match
//     against verse *text*, and no verse contains its own reference.
//
// On this side: results arrive as you type, matched words are visible in the
// text, and the count is honest about being capped.
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator, Keyboard } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { useProfile } from '../../state/profile';
import Icon from '../../components/Icon';
import { ReadingService } from '../../services/ReadingService';
import { parseRef } from './ThemeScreen';
import { colors, fonts, radius } from '../../theme';
import { readingTheme } from '../../readingTheme';

const DEBOUNCE_MS = 350;
const MIN_CHARS = 2;

// Shown before the first query. Deliberately a mix of a plain word, a reference
// and a phrase, because all three now work and none of that is discoverable.
const SUGGESTIONS = ['peace', 'John 3:16', 'fear not', 'Psalm 23', 'love one another', 'hope'];

/** Wrap each occurrence of a query word so the reason a verse matched is visible. */
function Highlighted({ text, tokens, style }) {
  if (!tokens.length) return <Text style={style}>{text}</Text>;

  const escaped = tokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`(${escaped.join('|')})`, 'gi'));
  const lower = tokens.map((t) => t.toLowerCase());

  return (
    <Text style={style}>
      {parts.map((part, i) =>
        lower.includes(part.toLowerCase())
          ? <Text key={i} style={styles.mark}>{part}</Text>
          : <Text key={i}>{part}</Text>,
      )}
    </Text>
  );
}

export default function SearchScreen({ navigation }) {
  const { profile } = useProfile();
  const RT = readingTheme(profile);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  const timer = useRef(null);
  // Only the newest query may write results; a slow early request must not
  // overwrite a fast later one.
  const seq = useRef(0);

  const run = useCallback(async (term) => {
    const q = term.trim();
    if (q.length < MIN_CHARS) { setResults(null); setBusy(false); setFailed(false); return; }

    const mine = ++seq.current;
    setBusy(true);
    setFailed(false);
    try {
      const data = await ReadingService.search(q);
      if (mine !== seq.current) return;
      setResults(data);
    } catch {
      if (mine !== seq.current) return;
      setResults({ ot: [], nt: [], total: 0 });
      setFailed(true);
    } finally {
      if (mine === seq.current) setBusy(false);
    }
  }, []);

  const onChange = useCallback((text) => {
    setQuery(text);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => run(text), DEBOUNCE_MS);
  }, [run]);

  const submit = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Keyboard.dismiss();
    run(query);
  }, [query, run]);

  const pick = useCallback((s) => {
    Haptics.selectionAsync();
    setQuery(s);
    if (timer.current) clearTimeout(timer.current);
    run(s);
  }, [run]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const openHit = useCallback((hit) => {
    const parsed = parseRef(hit.ref);
    if (!parsed) return;
    Haptics.selectionAsync();
    navigation.navigate('Chapter', parsed);
  }, [navigation]);

  const tokens = query.trim().split(/\s+/).filter((t) => t.length > 1);
  const shown = results ? results.ot.length + results.nt.length : 0;
  const total = results?.total ?? shown;

  const renderGroup = (title, hits) => (
    hits.length > 0 ? (
      <View style={styles.group}>
        <Text style={styles.groupTitle}>{title}</Text>
        {hits.map((h) => (
          <Pressable
            key={h.ref + h.text.slice(0, 20)}
            style={styles.hit}
            onPress={() => openHit(h)}
            accessibilityRole="button"
            accessibilityLabel={`${h.ref}. ${h.text}`}
          >
            <Text style={styles.hitRef}>{h.ref}</Text>
            <Highlighted text={h.text} tokens={tokens} style={styles.hitText} />
          </Pressable>
        ))}
      </View>
    ) : null
  );

  return (
    <Screen bg={RT.bg} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} testID="search-back">
          <Text style={styles.back}>‹ Reading</Text>
        </Pressable>
        <Text style={[styles.h1, { color: RT.ink }]}>Search scripture</Text>
      </View>

      <View style={styles.searchRow}>
        <Icon name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.input}
          placeholder="peace, hope, John 3:16…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={onChange}
          onSubmitEditing={submit}
          returnKeyType="search"
          autoCorrect={false}
          autoFocus
          testID="search-input"
        />
        {query.length > 0 ? (
          <Pressable onPress={() => { setQuery(''); setResults(null); }} hitSlop={10} testID="search-clear">
            <Text style={styles.clear}>✕</Text>
          </Pressable>
        ) : null}
        <Pressable onPress={submit} style={styles.goBtn} testID="search-submit">
          <Text style={styles.goText}>Go</Text>
        </Pressable>
      </View>

      {!results && !busy ? (
        <View style={styles.suggestWrap}>
          <Text style={styles.groupTitle}>TRY</Text>
          <View style={styles.chips}>
            {SUGGESTIONS.map((s) => (
              <Pressable key={s} onPress={() => pick(s)} style={styles.chip} testID={`search-suggest-${s}`}>
                <Text style={styles.chipText}>{s}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.hint}>
            Search a word, a phrase, or a reference. Whole phrases rank first.
          </Text>
        </View>
      ) : null}

      {busy ? <ActivityIndicator color={colors.brass} style={{ marginTop: 24 }} /> : null}

      {!busy && results ? (
        <ScrollView
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {shown === 0 ? (
            <Text style={styles.empty} testID="search-empty">
              {failed
                ? 'Could not reach the library. Check your connection and try again.'
                : `No verses found for “${query.trim()}”. Try another word.`}
            </Text>
          ) : (
            <Text style={styles.count} testID="search-count">
              {/* Results are capped server-side, so saying "128 verses" when we
                  are showing 100 would be a lie the user can count. */}
              {total > shown
                ? `Showing ${shown} of ${total} verses`
                : `${shown} ${shown === 1 ? 'verse' : 'verses'}`}
            </Text>
          )}
          {renderGroup('Old Testament', results.ot)}
          {renderGroup('New Testament', results.nt)}
        </ScrollView>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 6 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6 },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 22, marginTop: 12,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cardBorder,
    borderRadius: radius.pill, paddingVertical: 8, paddingHorizontal: 16,
  },
  input: { flex: 1, fontFamily: fonts.sans, fontSize: 15, color: colors.ink, paddingVertical: 4 },
  clear: { fontFamily: fonts.sans, fontSize: 15, color: colors.textFaint, paddingHorizontal: 2 },
  goBtn: { backgroundColor: colors.brass, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  goText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.white },
  suggestWrap: { paddingHorizontal: 22, paddingTop: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: {
    paddingVertical: 9, paddingHorizontal: 15, borderRadius: radius.pill,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sand,
  },
  chipText: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
  hint: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 16, lineHeight: 19 },
  // the tab bar floats over the content, so leave room for it
  body: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 110 },
  count: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginBottom: 12 },
  group: { marginBottom: 20 },
  groupTitle: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 8 },
  hit: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 14, marginBottom: 8 },
  hitRef: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass },
  hitText: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginTop: 4, lineHeight: 24 },
  mark: { color: colors.brass, fontFamily: fonts.serifSemi },
  empty: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 24, lineHeight: 22 },
});
