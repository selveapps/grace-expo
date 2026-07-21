import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import Waveform from '../../components/Waveform';
import { AudioService, StoryService } from '../../services';
import { colors, fonts, radius } from '../../theme';

const TRACK = 320;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const SPEEDS = [1, 1.25, 1.5, 0.75];

export default function PlayerScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [story, setStory] = useState(null);
  const [st, setSt] = useState(AudioService.getState());
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    let alive = true;
    StoryService.getStory(id).then((s) => { if (alive) setStory(s); });
    const current = AudioService.getState();
    if (current.storyId !== id) {
      AudioService.loadStory(id).catch(() => {});
    }
    const unsub = AudioService.subscribe(setSt);
    return () => {
      alive = false;
      unsub();
      AudioService.pause();
    };
  }, [id]);

  const loading = st.status === 'loading';
  const errored = st.status === 'error';

  const toggle = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (st.playing) await AudioService.pause();
    else await AudioService.play();
  };
  const skip = (delta) => { Haptics.selectionAsync(); AudioService.seek(st.position + delta); };
  const cycleSpeed = () => {
    const next = SPEEDS[(SPEEDS.indexOf(st.rate) + 1) % SPEEDS.length];
    Haptics.selectionAsync();
    AudioService.setSpeed(next);
  };
  const scrub = (e) => {
    const x = e.nativeEvent.locationX;
    AudioService.seek(Math.max(0, Math.min(1, x / TRACK)) * st.duration);
    Haptics.selectionAsync();
  };

  const done = st.status === 'completed';
  const progress = st.duration ? st.position / st.duration : 0;

  if (loading) {
    return (
      <Screen gradient={['#3A2C22', '#2B2015']} edges={['top', 'bottom']} style={[styles.wrap, styles.center]}>
        <GraceDove size={120} motion="loading" wings="folded" />
        <Text style={styles.sub}>Preparing audio…</Text>
      </Screen>
    );
  }

  return (
    <Screen gradient={['#3A2C22', '#2B2015']} edges={['top', 'bottom']} style={styles.wrap}>
      <View style={styles.topBar}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.chev}>▾</Text></Pressable>
        <Text style={styles.nowPlaying}>{done ? 'FINISHED' : 'NOW PLAYING'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.center}>
        <GraceDove size={168} motion={done ? 'bless' : st.playing ? 'loading' : 'breathe'} wings={done ? 'open' : 'folded'} />
        <Text style={styles.title}>{story ? story.title : ''}</Text>
        <Text style={styles.sub}>{story ? story.scriptureRange : ''}</Text>
        {errored && <Text style={styles.error}>{st.error || 'Audio unavailable'}</Text>}
        {done && <Text style={styles.blessing}>“Well done.” — Grace kept this for you.</Text>}
      </View>

      {!done && (
        <View style={styles.waveWrap}><Waveform width={TRACK} color={colors.gold} height={34} bars={30} /></View>
      )}

      <Pressable onPress={scrub} style={styles.trackWrap}>
        <View style={styles.track}><View style={[styles.fill, { width: progress * TRACK }]} /><View style={[styles.knob, { left: progress * TRACK - 8 }]} /></View>
      </Pressable>
      <View style={styles.times}><Text style={styles.time}>{fmt(st.position)}</Text><Text style={styles.time}>{fmt(st.duration)}</Text></View>

      <View style={styles.controls}>
        <Pressable onPress={cycleSpeed}><Text style={styles.speed}>{st.rate}×</Text></Pressable>
        <Pressable onPress={() => skip(-15)}><Text style={styles.skip}>↺15</Text></Pressable>
        <Pressable onPress={toggle} style={styles.playBtn}><Text style={styles.playIcon}>{st.playing ? '❚❚' : '▶'}</Text></Pressable>
        <Pressable onPress={() => skip(15)}><Text style={styles.skip}>15↻</Text></Pressable>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerItem}>Save</Text>
        <Text style={styles.footerItem}>Share quote</Text>
        <Pressable onPress={() => setShowTranscript(true)} disabled={!st.narrative}>
          <Text style={[styles.footerItem, !st.narrative && styles.footerDisabled]}>Transcript</Text>
        </Pressable>
      </View>

      <Modal visible={showTranscript} animationType="slide" transparent onRequestClose={() => setShowTranscript(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Transcript</Text>
            <ScrollView style={styles.modalScroll}>
              <Text style={styles.modalBody}>{st.narrative || 'No transcript yet.'}</Text>
            </ScrollView>
            <Pressable onPress={() => setShowTranscript(false)} style={styles.modalClose}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chev: { fontSize: 22, color: colors.onDarkMuted },
  nowPlaying: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 2, color: colors.textFaintOnDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.onDark, marginTop: 16, textAlign: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaintOnDark, marginTop: 4 },
  error: { fontFamily: fonts.sans, fontSize: 13, color: '#E8A598', marginTop: 10, textAlign: 'center', paddingHorizontal: 24 },
  blessing: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.gold, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
  waveWrap: { alignItems: 'center', marginBottom: 14 },
  trackWrap: { paddingVertical: 10 },
  track: { height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' },
  fill: { position: 'absolute', height: 5, borderRadius: 5, backgroundColor: colors.gold },
  knob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: colors.gold, top: -6 },
  times: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaintOnDark },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  speed: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.textFaintOnDark, width: 34 },
  skip: { fontFamily: fonts.sans, fontSize: 20, color: colors.onDarkMuted },
  playBtn: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 22, color: colors.espresso },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 30, marginTop: 24 },
  footerItem: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  footerDisabled: { opacity: 0.4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.ivory, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, maxHeight: '70%' },
  modalTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 12 },
  modalScroll: { marginBottom: 16 },
  modalBody: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, lineHeight: 23 },
  modalClose: { alignItems: 'center', paddingVertical: 12 },
  modalCloseText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brassDeep },
});
