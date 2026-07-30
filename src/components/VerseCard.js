import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fonts, radius, shadow } from '../theme';

// One verse card, used by onboarding and by Home. These had drifted apart
// (padding 34 vs 22, radius.xl vs .lg, 27/38 type vs 24/32), so the same
// component read as two different things depending where you met it.
//
// `size` scales the card without forking it: onboarding gets the roomier
// treatment because the verse is the whole screen there, Home gets the compact
// one because it sits in a scroll. Proportions stay identical.
const SIZES = {
  hero: { padding: 30, radius: radius.xl, verse: 27, line: 38, ref: 13, gap: 20 },
  compact: { padding: 22, radius: radius.lg, verse: 24, line: 34, ref: 12, gap: 14 },
};

export default function VerseCard({
  verse,
  reference,
  size = 'compact',
  kicker,
  footer,
  style,
}) {
  const s = SIZES[size] ?? SIZES.compact;
  return (
    <View style={[styles.card, { padding: s.padding, borderRadius: s.radius }, style]}>
      {kicker ? <Text style={[styles.kicker, { marginBottom: s.gap - 6 }]}>{kicker}</Text> : null}
      <Text
        style={[styles.verse, { fontSize: s.verse, lineHeight: s.line }]}
        adjustsFontSizeToFit
        minimumFontScale={0.8}
      >
        {verse}
      </Text>
      {reference ? (
        <Text style={[styles.ref, { fontSize: s.ref, marginTop: s.gap }]}>{reference}</Text>
      ) : null}
      {footer}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.sandLine,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  kicker: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1.6, color: colors.brass, textTransform: 'uppercase' },
  verse: { fontFamily: fonts.serif, color: colors.ink, textAlign: 'center', letterSpacing: 0.2 },
  ref: { fontFamily: fonts.sans, letterSpacing: 1.2, color: colors.textMuted, textAlign: 'center' },
});
