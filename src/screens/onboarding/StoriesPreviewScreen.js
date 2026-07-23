import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import Waveform from '../../components/Waveform';
import { colors, fonts, radius, shadow } from '../../theme';

const PEEK = [
  { title: 'Ruth stays', hook: 'When leaving would be easier' },
  { title: "David's rooftop era", hook: 'A king, a mistake, a reckoning' },
];

export default function StoriesPreviewScreen({ navigation }) {
  return (
    <Screen bg={colors.ivory} style={styles.wrap} ambient>
      <View style={styles.head}>
        <GraceDove size={62} wings="folded" motion="loading" />
        <Text style={styles.title}>Want to hear a true story from the Bible?</Text>
      </View>
      <Text style={styles.sub}>Real people. Real struggle. Real faith.</Text>

      <View style={styles.audio}>
        <Text style={styles.audioTitle}>Esther walks in uninvited</Text>
        <Text style={styles.audioSub}>And changes everything · 4 min</Text>
        <View style={styles.audioRow}>
          <View style={styles.play}><Text style={{ color: colors.espresso, fontSize: 16 }}>▶</Text></View>
          <Waveform width={220} color={colors.gold} />
        </View>
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        {PEEK.map((s) => (
          <View key={s.title} style={styles.peek}>
            <View style={styles.peekPlay}><Text style={{ color: colors.brass }}>▶</Text></View>
            <View>
              <Text style={styles.peekTitle}>{s.title}</Text>
              <Text style={styles.peekHook}>{s.hook}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={() => navigation.navigate('Rhythm')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 28, color: colors.ink, lineHeight: 31 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, marginTop: 14, marginBottom: 22 },
  audio: { backgroundColor: colors.espressoSoft, borderRadius: radius.xl, padding: 22, ...shadow.lift },
  audioTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.onDark },
  audioSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark, marginTop: 3 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  play: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  peek: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 16 },
  peekPlay: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#D6CAB6', alignItems: 'center', justifyContent: 'center' },
  peekTitle: { fontFamily: fonts.serifSemi, fontSize: 21, color: colors.ink },
  peekHook: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
});
