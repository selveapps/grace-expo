import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { CARRY_OPTIONS } from '../../data/content';
import { colors, fonts, radius } from '../../theme';

// Carrying — Grace listens (face + halo) and collects what you're carrying.
export default function CarryScreen({ navigation }) {
  const { setProfile } = useProfile();
  const [selected, setSelected] = useState(['Worry', 'Hope']);
  const [error, setError] = useState(false);

  const toggle = (opt) => {
    Haptics.selectionAsync();
    if (error) setError(false);
    setSelected((s) => (s.includes(opt) ? s.filter((x) => x !== opt) : [...s, opt]));
  };

  const onContinue = () => {
    if (selected.length === 0) { setError(true); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); return; }
    setProfile((p) => ({ ...p, carrying: selected }));
    navigation.navigate('Slider');
  };

  return (
    <Screen bg={colors.ivory} style={styles.wrap}>
      <View style={styles.progress}><View style={[styles.progressFill, { width: '30%' }]} /></View>
      <View style={{ marginBottom: 4 }}><GraceDove size={78} crop="head" motion="peek" /></View>
      <Text style={styles.title}>What are you carrying today?</Text>
      <Text style={styles.sub}>Choose all that feel true. Grace listens.</Text>
      <ScrollView contentContainerStyle={styles.chips} showsVerticalScrollIndicator={false}>
        {CARRY_OPTIONS.map((opt) => {
          const on = selected.includes(opt);
          return (
            <Pressable key={opt} onPress={() => toggle(opt)} style={[styles.chip, on && styles.chipOn]}>
              {on && <View style={styles.dot} />}
              <Text style={[styles.chipText, on && styles.chipTextOn]}>{opt}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {selected.length > 0 ? (
        <View style={styles.carried}>
          <Text style={styles.carriedLabel}>Carrying</Text>
          <Text style={styles.carriedList} numberOfLines={1}>{selected.join(' · ')}</Text>
        </View>
      ) : error ? (
        <Text style={styles.hint}>Choose one thing for Grace to carry with you.</Text>
      ) : null}

      <PrimaryButton label="Continue" onPress={onContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 30 },
  progress: { height: 4, borderRadius: 4, backgroundColor: colors.sand, overflow: 'hidden', marginBottom: 28 },
  progressFill: { height: '100%', backgroundColor: colors.brass },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink, lineHeight: 40 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, marginTop: 8, marginBottom: 22 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, paddingBottom: 16 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 20, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sand },
  chipOn: { backgroundColor: 'rgba(230,207,148,0.24)', borderColor: colors.brass },
  dot: { width: 7, height: 7, borderRadius: 7, backgroundColor: colors.brass },
  chipText: { fontFamily: fonts.sansMed, fontSize: 17, color: colors.textMuted },
  chipTextOn: { color: colors.ink },
  carried: { backgroundColor: 'rgba(181,138,63,0.08)', borderWidth: 1, borderColor: '#E6D9BF', borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  carriedLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  carriedList: { flex: 1, fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brass, textAlign: 'right' },
  hint: { fontFamily: fonts.sans, fontSize: 15, color: colors.danger, marginBottom: 14, textAlign: 'center' },
});
