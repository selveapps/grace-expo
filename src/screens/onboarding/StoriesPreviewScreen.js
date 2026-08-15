import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import Waveform from '../../components/Waveform';
import GIcon from '../../components/GIcon';
import { colors, fonts, radius, shadow } from '../../theme';

// Onboarding must never depend on the network for its emotional beat, and it
// must never hit TTS: that is exactly why this used to 503 in production when no
// API key was set. The sample is a bundled asset, so it plays offline, on a
// fresh install, with no keys.
//
// This is the real ElevenLabs render (Lily, the Grace narrator), byte-identical
// to backend/public/audio/onboarding-preview.mp3. To re-cut it:
//   cd backend && ONLY=onboarding FORCE=1 npm run generate:audio
//   cp public/audio/onboarding-preview.mp3 ../assets/audio/
const SAMPLE = require('../../../assets/audio/onboarding-preview.mp3');

// Onboarding plays SHORT previews only. The full Ruth story is four parts of
// roughly three minutes each and lives in the Stories tab; a teaser that opens
// with a three minute commitment is not a teaser. `ruth-preview.mp3` is an ~17s
// verbatim excerpt of the same narration, in the same voice.
const PEEK = [
  {
    title: 'Ruth stays',
    hook: 'When leaving would be easier',
    sample: require('../../../assets/audio/ruth-preview.mp3'),
  },
  // No preview rendered for David yet, so the card shows no play affordance
  // rather than a button that does nothing.
  { title: "David's rooftop era", hook: 'A king, a mistake, a reckoning' },
];

const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export default function StoriesPreviewScreen({ navigation }) {
  const soundRef = useRef(null);
  const [nowPlaying, setNowPlaying] = useState(null); // 'hero' | peek title | null
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const stop = useCallback(async () => {
    const snd = soundRef.current;
    soundRef.current = null;
    setNowPlaying(null);
    setPosition(0);
    if (snd) await snd.unloadAsync().catch(() => {});
  }, []);

  // A native stack keeps this screen mounted when you advance, so unmount
  // cleanup never ran and the preview kept playing over the next screen. Stop on
  // blur instead, which also covers swiping back to it in a known-idle state.
  useFocusEffect(useCallback(() => () => { stop(); }, [stop]));

  const onStatus = (s) => {
    if (!s.isLoaded) return;
    setPosition((s.positionMillis ?? 0) / 1000);
    setDuration((s.durationMillis ?? 0) / 1000);
    if (s.didJustFinish) { setNowPlaying(null); setPosition(0); }
  };

  // One player, one clip at a time. Switching cards unloads the previous sound
  // so two previews can never overlap.
  const play = async (key, asset) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (nowPlaying === key && soundRef.current) {
      const st = await soundRef.current.getStatusAsync();
      if (st.isLoaded && st.isPlaying) { await soundRef.current.pauseAsync(); setNowPlaying(null); return; }
      if (st.isLoaded) { await soundRef.current.playAsync(); setNowPlaying(key); return; }
    }
    if (soundRef.current) {
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
    setPosition(0);
    setDuration(0);
    // playsInSilentModeIOS matters: without it a woman on silent hears nothing
    // and reports that the audio is broken.
    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false });
    const { sound } = await Audio.Sound.createAsync(asset, { shouldPlay: true }, onStatus);
    soundRef.current = sound;
    setNowPlaying(key);
  };

  const playing = nowPlaying === 'hero';
  const toggle = () => play('hero', SAMPLE);

  return (
    <Screen bg={colors.ivory} style={styles.wrap} ambient>
      <View style={styles.head}>
        <GraceDove size={62} wings="folded" motion={playing ? 'loading' : 'breathe'} />
        <Text style={styles.title}>Want to hear a true story from the Bible?</Text>
      </View>
      <Text style={styles.sub}>Real people. Real struggle. Real faith.</Text>

      <View style={styles.audio}>
        <Text style={styles.audioTitle}>Esther walks in uninvited</Text>
        <Text style={styles.audioSub}>And changes everything</Text>
        <View style={styles.audioRow}>
          <Pressable
            onPress={toggle}
            style={styles.play}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause sample' : 'Play sample'}
          >
            <GIcon name={playing ? 'pause' : 'play'} size={18} color={colors.espresso} filled={!playing} />
          </Pressable>
          <Waveform width={200} color={colors.gold} animate={playing} />
        </View>
        <Text style={styles.times}>{fmt(position)} / {fmt(duration)}</Text>
      </View>

      <View style={{ gap: 12, marginTop: 16 }}>
        {PEEK.map((s) => {
          const isOn = nowPlaying === s.title;
          const Row = s.sample ? Pressable : View;
          return (
            <Row
              key={s.title}
              style={styles.peek}
              {...(s.sample
                ? {
                    onPress: () => play(s.title, s.sample),
                    accessibilityRole: 'button',
                    accessibilityLabel: `${isOn ? 'Pause' : 'Play'} a short preview of ${s.title}`,
                  }
                : {})}
            >
              {s.sample ? (
                <View style={styles.peekPlay}>
                  <GIcon name={isOn ? 'pause' : 'play'} size={14} color={colors.brass} filled={!isOn} />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Text style={styles.peekTitle}>{s.title}</Text>
                <Text style={styles.peekHook}>{s.hook}</Text>
              </View>
            </Row>
          );
        })}
      </View>

      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={() => navigation.navigate('Review')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  title: { flex: 1, fontFamily: fonts.serif, fontSize: 30, color: colors.ink, lineHeight: 34 },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, marginTop: 14, marginBottom: 22 },
  audio: { backgroundColor: colors.espressoSoft, borderRadius: radius.xl, padding: 22, ...shadow.lift },
  audioTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.onDark },
  audioSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark, marginTop: 3 },
  audioRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18 },
  play: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  times: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaintOnDark, marginTop: 12, textAlign: 'right' },
  peek: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 16 },
  peekPlay: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#D6CAB6', alignItems: 'center', justifyContent: 'center' },
  peekTitle: { fontFamily: fonts.serifSemi, fontSize: 21, color: colors.ink },
  peekHook: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
});
