import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { colors, fonts } from '../../theme';

// 3 discrete states — the slider snaps to Softly / Steadily / Directly. Each
// shifts Grace's expression, the halo warmth, and the field's tone.
const STATES = [
  { key: 'softly', word: 'Softly', blurb: 'Quiet comfort', motion: 'breathe', grad: ['#FBF4E6', '#F7F3EC'] },
  { key: 'steadily', word: 'Steadily', blurb: 'Grounded encouragement', motion: 'peek', grad: ['#FDF3DF', '#F7F3EC'] },
  { key: 'directly', word: 'Directly', blurb: 'Clear guidance', motion: 'halo', grad: ['#FBEBCB', '#F5ECD8'] },
];
const TRACK = 300;

export default function SliderScreen({ navigation }) {
  const { setProfile } = useProfile();
  const [idx, setIdx] = useState(1);
  const anim = useRef(new Animated.Value(1)).current;

  const select = (i) => {
    const clamped = Math.max(0, Math.min(2, i));
    if (clamped !== idx) { Haptics.selectionAsync(); setIdx(clamped); }
    Animated.timing(anim, { toValue: clamped, duration: 240, easing: Easing.out(Easing.ease), useNativeDriver: false }).start();
  };

  // Mid-drag the touch target becomes a child view (knob or fill), so
  // `locationX` is measured against that child (0…34) instead of the track and
  // the index collapses toward the middle. Measure the track once and work in
  // absolute `pageX` so the knob can actually reach both ends.
  const wrapRef = useRef(null);
  const trackX = useRef(0);
  const trackW = useRef(TRACK);

  const posToIndex = (pageX) => {
    const KNOB_W = 34;
    const usable = Math.max(1, trackW.current - KNOB_W);
    const p = (pageX - trackX.current - KNOB_W / 2) / usable;   // 0…1 across knob-centre travel
    return Math.round(Math.max(0, Math.min(1, p)) * 2);
  };

  const measureTrack = () => {
    wrapRef.current?.measureInWindow?.((x, y, w) => {
      trackX.current = x;
      if (w) trackW.current = w;
    });
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderTerminationRequest: () => false,   // keep the gesture once it starts
      onPanResponderGrant: (e) => select(posToIndex(e.nativeEvent.pageX)),
      onPanResponderMove: (e) => select(posToIndex(e.nativeEvent.pageX)),
    })
  ).current;

  const s = STATES[idx];
  const KNOB = 34;
  const half = KNOB / 2;
  // knob CENTER travels from `half` to `TRACK - half`; ticks + fill align to that.
  const centerFor = (i) => half + (i / 2) * (TRACK - KNOB);
  const knobLeft = anim.interpolate({ inputRange: [0, 2], outputRange: [0, TRACK - KNOB] });
  const fillW = anim.interpolate({ inputRange: [0, 2], outputRange: [half, TRACK - half] });

  const onContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setProfile((p) => ({ ...p, gentleness: s.word, tone: s.key }));
    navigation.navigate('ValueAdd');
  };

  return (
    <Screen gradient={s.grad} style={styles.wrap} ambient>
      <View style={styles.progress}><View style={[styles.progressFill, { width: '42%' }]} /></View>
      <View style={{ alignItems: 'center' }}><GraceDove size={92} crop="head" motion={s.motion === 'halo' ? 'peek' : s.motion} /></View>
      <Text style={styles.title}>How gently should{'\n'}Grace meet you?</Text>
      <Text style={styles.sub}>This shapes your verse and her tone.</Text>

      <View style={styles.mid}>
        <Text style={styles.word}>{s.word}</Text>
        <Text style={styles.blurb}>{s.blurb}</Text>
        <View
          ref={wrapRef}
          style={styles.trackWrap}
          onLayout={measureTrack}
          hitSlop={{ top: 16, bottom: 16, left: 12, right: 12 }}
          {...pan.panHandlers}
        >
          <View style={styles.track}>
            <Animated.View style={[styles.fill, { width: fillW }]} />
            {[0, 1, 2].map((i) => (
              <View key={i} style={[styles.tick, { left: centerFor(i) - 2 }]} />
            ))}
            <Animated.View style={[styles.knob, { left: knobLeft }]} />
          </View>
        </View>
        <View style={styles.ends}>
          {STATES.map((st, i) => (
            <Text key={st.key} onPress={() => select(i)} style={[styles.end, i === idx && styles.endOn]}>{st.word}</Text>
          ))}
        </View>
      </View>

      <PrimaryButton label="Continue" onPress={onContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 30 },
  progress: { height: 4, borderRadius: 4, backgroundColor: colors.sand, overflow: 'hidden', marginBottom: 26 },
  progressFill: { height: '100%', backgroundColor: colors.brass },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, textAlign: 'center', marginTop: 14, lineHeight: 42 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  mid: { flex: 1, justifyContent: 'center' },
  word: { fontFamily: fonts.serifItalic, fontSize: 36, color: colors.brass, textAlign: 'center' },
  blurb: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 28 },
  trackWrap: { paddingVertical: 16, alignSelf: 'center', width: TRACK },
  track: { height: 10, borderRadius: 10, backgroundColor: colors.sand, justifyContent: 'center' },
  fill: { position: 'absolute', left: 0, height: 10, borderRadius: 10, backgroundColor: colors.brass },
  tick: { position: 'absolute', width: 4, height: 4, borderRadius: 4, backgroundColor: '#fff', opacity: 0.7 },
  knob: { position: 'absolute', width: 34, height: 34, borderRadius: 17, backgroundColor: colors.white, borderWidth: 2.5, borderColor: colors.brass, top: -12 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, width: TRACK, alignSelf: 'center' },
  end: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint },
  endOn: { fontFamily: fonts.sansSemi, color: colors.brass },
});
