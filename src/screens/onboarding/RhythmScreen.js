import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { RHYTHM_OPTIONS } from '../../data/content';
import { colors, fonts, radius } from '../../theme';

export default function RhythmScreen({ navigation }) {
  const { setProfile } = useProfile();
  const [choice, setChoice] = useState('morning');
  const pick = (k) => { Haptics.selectionAsync(); setChoice(k); };
  return (
    <Screen gradient={['#FDF3DF', '#F7F3EC']} style={styles.wrap}>
      <Text style={styles.title}>When should we meet?</Text>
      <Text style={styles.sub}>No goals, no streaks. Just a gentle time.</Text>
      <View style={{ gap: 12, marginTop: 30 }}>
        {RHYTHM_OPTIONS.map((o) => {
          const on = o.key === choice;
          return (
            <Pressable key={o.key} onPress={() => pick(o.key)} style={[styles.row, on && styles.rowOn]}>
              <Text style={[styles.rowText, on && styles.rowTextOn]}>{o.label}</Text>
              <View style={[styles.dot, on && styles.dotOn]} />
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={() => { setProfile((p) => ({ ...p, rhythm: choice })); navigation.navigate('SignIn'); }} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 30, paddingBottom: 30 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, lineHeight: 42 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, marginTop: 8 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 20, paddingHorizontal: 22, borderRadius: radius.lg, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sandLine },
  rowOn: { backgroundColor: 'rgba(230,207,148,0.16)', borderColor: colors.brass },
  rowText: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 18, color: colors.ink },
  rowTextOn: { color: colors.brassDeep },
  dot: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#D6CAB6' },
  dotOn: { borderColor: colors.brass, backgroundColor: colors.brass },
});
