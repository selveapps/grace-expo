import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import Icon from '../../components/Icon';
import { THEMES } from '../../data/content';
import { colors, fonts, radius } from '../../theme';

const tick = () => Haptics.selectionAsync();

export default function ReadingScreen({ navigation }) {
  const go = (route, params) => { tick(); navigation.navigate(route, params); };
  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Reading</Text>
        <Text style={styles.sub}>Choose a place to begin. I'll keep it for you.</Text>

        <Pressable style={styles.search} onPress={() => go('Search')} testID="reading-search">
          <Icon name="search" size={20} color={colors.textFaint} /><Text style={styles.searchText}>Search scripture</Text>
        </Pressable>

        <Pressable style={styles.continue} onPress={() => go('Chapter', { book: 'Psalms', chapter: 23 })}>
          <View style={styles.continueThumb}><Text style={{ color: '#fff' }}>↳</Text></View>
          <View><Text style={styles.continueLabel}>CONTINUE READING</Text><Text style={styles.continueRef}>Psalm 23 · verse 1</Text></View>
        </Pressable>

        <View style={styles.tRow}>
          <Pressable style={styles.testament} onPress={() => go('OldTestament')}>
            <Text style={styles.tCount}>39 books</Text><Text style={styles.tName}>Old{'\n'}Testament</Text>
          </Pressable>
          <Pressable style={styles.testament} onPress={() => go('NewTestament')}>
            <Text style={styles.tCount}>27 books</Text><Text style={styles.tName}>New{'\n'}Testament</Text>
          </Pressable>
        </View>

        <Text style={styles.section}>BROWSE BY THEME</Text>
        <View style={styles.chips}>
          {THEMES.map((t) => (<Pressable key={t} onPress={tick} style={styles.chip}><Text style={styles.chipText}>{t}</Text></Pressable>))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
  h1: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginBottom: 16 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 18, marginBottom: 16 },
  searchText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textFaint },
  continue: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.brass, borderRadius: radius.lg, padding: 18, marginBottom: 16 },
  continueThumb: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  continueLabel: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: 'rgba(255,255,255,0.85)' },
  continueRef: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.white },
  tRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  testament: { flex: 1, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, padding: 20 },
  tCount: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  tName: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink, marginTop: 4, lineHeight: 26 },
  section: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sand },
  chipText: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
});
