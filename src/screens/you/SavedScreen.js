import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

export default function SavedScreen({ navigation }) {
  const { profile, removeVerse } = useProfile();
  const saved = profile.savedVerses || [];

  const remove = (ref) => { Haptics.selectionAsync(); removeVerse(ref); };

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
        <Text style={styles.h1}>Saved verses</Text>
        <Text style={styles.sub}>The verses that met you.</Text>
      </View>

      {saved.length === 0 ? (
        <View style={styles.empty}>
          <GraceDove size={140} wings="folded" motion="breathe" />
          <Text style={styles.emptyTitle}>Nothing saved yet.</Text>
          <Text style={styles.emptyText}>Press & hold a verse in the reader, and I'll keep it here for you.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {saved.map((v) => (
            <View key={v.ref} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.ref}>{v.ref.toUpperCase()}</Text>
                <Pressable onPress={() => remove(v.ref)} hitSlop={10}><Text style={styles.remove}>✦</Text></Pressable>
              </View>
              <Text style={styles.verse}>{v.text}</Text>
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 6 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginTop: 2 },
  body: { paddingHorizontal: 22, paddingTop: 14, paddingBottom: 30, gap: 12 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 18 },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  ref: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass },
  remove: { fontFamily: fonts.sans, fontSize: 16, color: colors.brass },
  verse: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, lineHeight: 28 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginTop: 12 },
  emptyText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
