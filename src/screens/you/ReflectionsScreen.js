import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

export default function ReflectionsScreen({ navigation }) {
  const { profile } = useProfile();
  const reflections = profile.reflections || [];

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
        <Text style={styles.h1}>Reflections</Text>
        <Text style={styles.sub}>Private. Only for you and Grace.</Text>
      </View>

      {reflections.length === 0 ? (
        <View style={styles.empty}>
          <GraceDove size={140} wings="folded" motion="breathe" />
          <Text style={styles.emptyTitle}>Nothing here yet.</Text>
          <Text style={styles.emptyText}>The word you carry and the notes you keep will rest here.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
          {reflections.map((r) => (
            <View key={r.id} style={styles.card}>
              <View style={styles.cardHead}>
                <Text style={styles.word}>{r.word}</Text>
                <Text style={styles.date}>{r.date}</Text>
              </View>
              {r.note ? <Text style={styles.note}>{r.note}</Text> : null}
              {r.ref ? <Text style={styles.ref}>{r.ref}</Text> : null}
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
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  word: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.brass },
  date: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  note: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  ref: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass, marginTop: 10 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, marginTop: 12 },
  emptyText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 22 },
});
