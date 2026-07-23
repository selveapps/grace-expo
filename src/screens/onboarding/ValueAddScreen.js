import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts, radius, shadow } from '../../theme';

// Value-add — shows what Grace keeps, revealing one item at a time. Demonstrated
// value before the paywall. Maps to real modules: Verse / Story / Reading / Reflection.
const ICONS = {
  verse: (c) => <Path d="M6 4h9a3 3 0 0 1 3 3v13l-6-3-6 3V4z" stroke={c} strokeWidth={1.7} fill="none" strokeLinejoin="round" />,
  story: (c) => <><Circle cx="12" cy="12" r="9" stroke={c} strokeWidth={1.7} fill="none" /><Path d="M10 8.5v7l6-3.5-6-3.5z" fill={c} /></>,
  reading: (c) => <Path d="M12 6c-1.6-1.2-4-1.6-6.5-1.4A1 1 0 0 0 4.5 5.6v11.2a1 1 0 0 0 1.1 1c2.3-.2 4.7.2 6.4 1.2 1.7-1 4.1-1.4 6.4-1.2a1 1 0 0 0 1.1-1V5.6a1 1 0 0 0-1-1C16.4 4.4 13.6 4.8 12 6zM12 6v13" stroke={c} strokeWidth={1.7} fill="none" strokeLinejoin="round" />,
  reflection: (c) => <Path d="M12 4c3 3 3.5 7 1 11-2.5-4-2-8-1-11zM12 15c-3 0-5 2-5 5" stroke={c} strokeWidth={1.7} fill="none" strokeLinecap="round" />,
};

const ITEMS = [
  { key: 'verse', tint: '#F1E6CF', title: 'A daily verse', sub: 'Chosen for what you carry' },
  { key: 'story', tint: '#E7EDE7', title: 'Bible stories', sub: 'Real people, beautifully narrated' },
  { key: 'reading', tint: '#E6EDF1', title: 'The whole Bible', sub: 'To read at your own pace' },
  { key: 'reflection', tint: '#EFE3D3', title: 'Your reflections', sub: 'Private, kept between us' },
];

function Row({ item, av }) {
  return (
    <Animated.View style={[styles.card, { opacity: av, transform: [{ translateX: av.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }] }]}>
      <View style={[styles.icon, { backgroundColor: item.tint }]}>
        <Svg width={24} height={24} viewBox="0 0 24 24">{ICONS[item.key](colors.brassDeep)}</Svg>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardSub}>{item.sub}</Text>
      </View>
    </Animated.View>
  );
}

export default function ValueAddScreen({ navigation }) {
  const avs = useRef(ITEMS.map(() => new Animated.Value(0))).current;
  const cta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(360, [
      ...avs.map((a) => Animated.timing(a, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true })),
      Animated.timing(cta, { toValue: 1, duration: 520, useNativeDriver: true }),
    ]).start();
    // a soft tick as each card lands
    const timers = ITEMS.map((_, i) => setTimeout(() => Haptics.selectionAsync(), 200 + i * 360));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC']} style={styles.wrap} ambient>
      <View style={styles.progress}><View style={[styles.progressFill, { width: '55%' }]} /></View>
      <View style={{ alignItems: 'center' }}><GraceDove size={90} crop="head" motion="peek" /></View>
      <Text style={styles.title}>Your Bible,{'\n'}made for you.</Text>
      <Text style={styles.subhead}>A quiet, audio-first companion for women.</Text>
      <View style={styles.list}>
        {ITEMS.map((it, i) => <Row key={it.key} item={it} av={avs[i]} />)}
      </View>
      <View style={{ flex: 1 }} />
      <Animated.View style={{ opacity: cta, transform: [{ translateY: cta.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }}>
        <PrimaryButton label="Continue" onPress={() => navigation.navigate('Verse')} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 30 },
  progress: { height: 4, borderRadius: 4, backgroundColor: colors.sand, overflow: 'hidden', marginBottom: 26 },
  progressFill: { height: '100%', backgroundColor: colors.brass },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink, textAlign: 'center', marginTop: 14, lineHeight: 40 },
  subhead: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 8, marginBottom: 26 },
  list: { gap: 12 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, padding: 18, ...shadow.card },
  icon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontFamily: fonts.serifSemi, fontSize: 21, color: colors.ink },
  cardSub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, marginTop: 2 },
});
