import React from 'react';
import { Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '../theme';

// Primary CTA button. variant: 'dark' | 'gold' | 'quiet'
export default function PrimaryButton({ label, onPress, variant = 'dark', style }) {
  const bg = variant === 'gold' ? colors.gold : variant === 'quiet' ? 'transparent' : colors.espresso;
  const fg = variant === 'gold' ? colors.espresso : variant === 'quiet' ? colors.textFaint : colors.onDark;
  const handle = () => {
    Haptics.impactAsync(
      variant === 'gold' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light
    );
    onPress && onPress();
  };
  return (
    <Pressable
      onPress={handle}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: bg, opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] },
        variant === 'quiet' && styles.quiet,
        style,
      ]}
    >
      <Text style={[styles.label, { color: fg }]} numberOfLines={1}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { alignSelf: 'stretch', paddingVertical: 18, paddingHorizontal: 20, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  quiet: { paddingVertical: 12 },
  label: { fontFamily: fonts.sansSemi, fontSize: 17 },
});
