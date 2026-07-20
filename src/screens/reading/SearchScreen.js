import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { ReadingService } from '../../services/ReadingService';
import { colors, fonts, radius } from '../../theme';

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [busy, setBusy] = useState(false);

  const search = async (q) => {
    const term = (q ?? query).trim();
    if (!term) { setResults({ ot: [], nt: [] }); return; }
    setBusy(true);
    try {
      const data = await ReadingService.search(term);
      setResults(data);
    } catch {
      setResults({ ot: [], nt: [] });
    } finally {
      setBusy(false);
    }
  };

  const openHit = (hit) => {
    Haptics.selectionAsync();
    const m = hit.ref.match(/^(.+?)\s+(\d+):/);
    if (m) navigation.navigate('Chapter', { book: m[1], chapter: Number(m[2]) });
  };

  const renderGroup = (title, hits) => (
    hits.length > 0 ? (
      <View style={styles.group}>
        <Text style={styles.groupTitle}>{title}</Text>
        {hits.map((h) => (
          <Pressable key={h.ref + h.text.slice(0, 20)} style={styles.hit} onPress={() => openHit(h)}>
            <Text style={styles.hitRef}>{h.ref}</Text>
            <Text style={styles.hitText} numberOfLines={2}>{h.text}</Text>
          </Pressable>
        ))}
      </View>
    ) : null
  );

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Reading</Text></Pressable>
        <Text style={styles.h1}>Search scripture</Text>
      </View>
      <View style={styles.searchRow}>
        <Icon name="search" size={18} color={colors.textFaint} />
        <TextInput
          style={styles.input}
          placeholder="peace, hope, John 3:16…"
          placeholderTextColor={colors.textFaint}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => search()}
          returnKeyType="search"
          autoFocus
          testID="search-input"
        />
        <Pressable onPress={() => search()} style={styles.goBtn} testID="search-submit">
          <Text style={styles.goText}>Go</Text>
        </Pressable>
      </View>

      {busy ? <ActivityIndicator color={colors.brass} style={{ marginTop: 24 }} /> : null}
      {!busy && results ? (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {results.ot.length + results.nt.length === 0 ? (
            <Text style={styles.empty}>No verses found. Try another word.</Text>
          ) : null}
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
  goBtn: { backgroundColor: colors.brass, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 },
  goText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.white },
  body: { paddingHorizontal: 22, paddingTop: 16, paddingBottom: 30 },
  group: { marginBottom: 20 },
  groupTitle: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 8 },
  hit: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 14, marginBottom: 8 },
  hitRef: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass },
  hitText: { fontFamily: fonts.serif, fontSize: 17, color: colors.ink, marginTop: 4, lineHeight: 24 },
  empty: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 24 },
});
