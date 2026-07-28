import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { REFLECTION_WORDS } from '../../data/content';
import { colors, fonts, radius } from '../../theme';

export default function ReflectionScreen({ navigation }) {
  const { setProfile, addReflection } = useProfile();
  const [word, setWord] = useState('Trust');
  const pick = (w) => { Haptics.selectionAsync(); setWord(w); };
  const keep = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile((p) => ({ ...p, reflectionWord: word }));
    addReflection({ word, note: 'Carried from my first day with Grace.', ref: '' });
    navigation.navigate('StoriesPreview');
  };
  return (
    <Screen bg={colors.ivory} style={styles.wrap} ambient>
      <Text style={styles.title}>One word to carry with you?</Text>
      <Text style={styles.sub}>Just one. You can change it anytime.</Text>
      <View style={{ gap: 12, marginTop: 30 }}>
        {REFLECTION_WORDS.map((w) => {
          const on = w === word;
          return (
            <Pressable key={w} onPress={() => pick(w)} style={[styles.opt, on && styles.optOn]}>
              <Text style={[styles.optText, on && styles.optTextOn]}>{w}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={keep} />
      <Pressable onPress={() => navigation.navigate('StoriesPreview')} style={{ paddingVertical: 12 }}>
        <Text style={styles.skip}>Skip for now</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 24 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, lineHeight: 42 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, marginTop: 8 },
  opt: { paddingVertical: 18, paddingHorizontal: 24, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sandLine, alignItems: 'center' },
  optOn: { backgroundColor: 'rgba(230,207,148,0.22)', borderColor: colors.brass },
  optText: { fontFamily: fonts.serifSemi, fontSize: 26, color: colors.ink },
  optTextOn: { color: colors.brassDeep },
  skip: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.textFaint, textAlign: 'center' },
});
