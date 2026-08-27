import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import Waveform from '../../components/Waveform';
import GIcon from '../../components/GIcon';
import { AudioService, StoryService } from '../../services';
import { colors, fonts, radius } from '../../theme';

// The scrubber used a hardcoded 320pt inside a container of screenWidth-52,
// so on any modern iPhone it sat left-aligned with dead space on the right.
// Measured at layout instead, so it fills the column like everything else.
const TRACK_FALLBACK = 320;
const fmt = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const SPEEDS = [1, 1.25, 1.5, 0.75];

function FooterButton({ icon, label, onPress, active, disabled, filled }) {
  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.footerBtn, active && styles.footerBtnActive, disabled && styles.footerDisabled]}
    >
      <GIcon name={icon} size={20} color={active ? colors.gold : colors.onDarkMuted} filled={filled} />
      <Text style={[styles.footerLabel, active && styles.footerLabelActive]}>{label}</Text>
    </Pressable>
  );
}

/**
 * The transcript sheet. `tr.text` is the render's own text, so it is what the
 * audio actually says. When the render captured word timings we highlight the
 * current line and let her tap one to seek there, which is what makes a
 * transcript feel accurate rather than decorative.
 */
function TranscriptSheet({ visible, onClose, tr, position, onSeek }) {
  const scrollRef = useRef(null);
  const offsets = useRef({});

  // Split into sentences so a "line" is a tappable unit with a known start time.
  const lines = useMemo(() => {
    if (!tr?.text) return [];
    const sentences = tr.text.match(/[^.!?]+[.!?]*\s*/g) || [tr.text];
    if (!tr.words?.length) return sentences.map((t) => ({ text: t.trim(), start: null, end: null }));

    let cursor = 0;
    return sentences.map((sentence) => {
      const count = sentence.trim().split(/\s+/).filter(Boolean).length;
      const slice = tr.words.slice(cursor, cursor + count);
      cursor += count;
      return {
        text: sentence.trim(),
        start: slice.length ? slice[0].start : null,
        end: slice.length ? slice[slice.length - 1].end : null,
      };
    });
  }, [tr]);

  const activeLine = lines.findIndex((l) => l.start != null && position >= l.start && position < l.end);

  // Keep the active line in view without scrollIntoView: measure each line.
  useEffect(() => {
    if (!visible || activeLine < 0) return;
    const y = offsets.current[activeLine];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 80), animated: true });
  }, [activeLine, visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Transcript</Text>
          {tr?.ref ? <Text style={styles.modalRef}>Retold from {tr.ref}</Text> : null}
          <ScrollView ref={scrollRef} style={styles.modalScroll}>
            {lines.length === 0 ? (
              <Text style={styles.modalEmpty}>The transcript isn’t ready for this story yet.</Text>
            ) : (
              lines.map((line, i) => (
                <Pressable
                  key={i}
                  onLayout={(e) => { offsets.current[i] = e.nativeEvent.layout.y; }}
                  onPress={line.start != null ? () => { Haptics.selectionAsync(); onSeek(line.start); } : undefined}
                  disabled={line.start == null}
                >
                  <Text style={[styles.modalLine, i === activeLine && styles.modalLineActive]}>
                    {line.text}
                  </Text>
                </Pressable>
              ))
            )}
          </ScrollView>
          <Pressable onPress={onClose} style={styles.modalClose} hitSlop={8}>
            <Text style={styles.modalCloseText}>Close</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

export default function PlayerScreen({ route, navigation }) {
  const { id, autoplay = false } = route.params || {};
  const [story, setStory] = useState(null);
  const [st, setSt] = useState(AudioService.getState());
  const [showTranscript, setShowTranscript] = useState(false);
  const [savedThis, setSavedThis] = useState(false);
  const [tr, setTr] = useState(null);
  const [trackW, setTrackW] = useState(TRACK_FALLBACK);

  useEffect(() => {
    let alive = true;
    StoryService.getStory(id).then((s) => { if (alive) setStory(s); });
    StoryService.isSaved(id).then((v) => { if (alive) setSavedThis(v); });
    // `autoplay` is how Home's listen card behaves like a play button: we open
    // the player immediately rather than making her wait on the load, then start
    // as soon as the track is ready.
    const current = AudioService.getState();
    if (current.storyId !== id) {
      const load = AudioService.loadStory(id);
      if (autoplay) load.then(() => { if (alive) AudioService.play().catch(() => {}); }).catch(() => {});
      else load.catch(() => {});
    } else if (autoplay && !current.playing) {
      AudioService.play().catch(() => {});
    }
    const unsub = AudioService.subscribe(setSt);
    return () => {
      alive = false;
      unsub();
      AudioService.pause();
    };
  }, [id, autoplay]);

  const part = st.part || 1;
  useEffect(() => {
    let alive = true;
    setTr(null);
    StoryService.getTranscript(id, part).then((t) => { if (alive) setTr(t); });
    return () => { alive = false; };
  }, [id, part]);

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
    // Without a duration there is no position to scrub to, and the old maths
    // resolved to 0, so a tap anywhere on the track threw playback back to the
    // start. Leave it alone until we know how long the track is.
    if (!st.duration) return;
    const x = e.nativeEvent.locationX;
    AudioService.seek(Math.max(0, Math.min(1, x / trackW)) * st.duration);
    Haptics.selectionAsync();
  };

  const retry = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    AudioService.loadStory(id, st.part || 1, { force: true }).then(() => AudioService.play()).catch(() => {});
  };

  const saveThis = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    StoryService.save(id);
    setSavedThis(true);
  };
  const shareQuote = async () => {
    Haptics.selectionAsync();
    if (!story) return;
    try {
      await Share.share({ message: `“${story.hook}”\n\n${story.title} · ${story.scriptureRange}\nvia Grace` });
    } catch { /* dismissed */ }
  };

  const done = st.status === 'completed';
  const progress = st.duration ? st.position / st.duration : 0;
  const remaining = Math.max(0, st.duration - st.position);
  // The clock she will actually finish at. Quietly premium, and useful at night.
  const endsAt = st.duration
    ? new Date(Date.now() + remaining * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : null;

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
        <Pressable onPress={() => navigation.goBack()} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close player">
          <GIcon name="chevronDown" size={22} color={colors.onDarkMuted} />
        </Pressable>
        <Text style={styles.nowPlaying}>{done ? 'FINISHED' : 'NOW PLAYING'}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.center}>
        <GraceDove size={168} motion={done ? 'bless' : st.playing ? 'loading' : 'breathe'} wings={done ? 'open' : 'folded'} />
        <Text style={styles.title}>{story ? story.title : ''}</Text>
        <Text style={styles.sub}>{story ? story.scriptureRange : ''}</Text>
        {errored && (
          <>
            <Text style={styles.error}>{st.error || 'Audio unavailable'}</Text>
            <Pressable onPress={retry} style={styles.retry} hitSlop={8}><Text style={styles.retryText}>Try again</Text></Pressable>
          </>
        )}
        {done && <Text style={styles.blessing}>“Well done.” Grace kept this for you.</Text>}
      </View>

      {!done && (
        <View style={styles.waveWrap}>
          <Waveform width={trackW} color={colors.gold} height={34} fill animate={st.playing} />
        </View>
      )}

      <Pressable
        onPress={scrub}
        style={styles.trackWrap}
        onLayout={(e) => setTrackW(e.nativeEvent.layout.width)}
      >
        <View style={styles.track}>
          <View style={[styles.fill, { width: progress * trackW }]} />
          <View style={[styles.knob, { left: Math.min(trackW - 16, Math.max(0, progress * trackW - 8)) }]} />
        </View>
      </Pressable>
      <View style={styles.times}>
        <Text style={styles.time}>{fmt(st.position)}</Text>
        {/* Only claim a remaining time when the duration is real. A track whose
            length we genuinely do not know shows an honest placeholder instead
            of counting down from -0:00. */}
        <Text style={styles.time}>{st.duration > 0 ? `-${fmt(remaining)}` : '--:--'}</Text>
      </View>
      {endsAt && !done ? <Text style={styles.endsAt}>Ends at {endsAt}</Text> : null}

      <View style={styles.controls}>
        <Pressable onPress={cycleSpeed} hitSlop={10} accessibilityRole="button" accessibilityLabel={`Playback speed ${st.rate} times`}>
          <Text style={styles.speed}>{st.rate}×</Text>
        </Pressable>
        <Pressable onPress={() => skip(-15)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Back 15 seconds">
          <GIcon name="back15" size={26} color={colors.onDarkMuted} label="15" />
        </Pressable>
        <Pressable onPress={toggle} style={styles.playBtn} accessibilityRole="button" accessibilityLabel={st.playing ? 'Pause' : 'Play'}>
          <GIcon name={st.playing ? 'pause' : 'play'} size={24} color={colors.espresso} filled={!st.playing} strokeWidth={2.2} />
        </Pressable>
        <Pressable onPress={() => skip(15)} hitSlop={10} accessibilityRole="button" accessibilityLabel="Forward 15 seconds">
          <GIcon name="fwd15" size={26} color={colors.onDarkMuted} label="15" />
        </Pressable>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.footer}>
        <FooterButton icon={savedThis ? 'check' : 'download'} label={savedThis ? 'Saved' : 'Save'} active={savedThis} onPress={saveThis} />
        <FooterButton icon="share" label="Share quote" onPress={shareQuote} />
        <FooterButton icon="transcript" label="Transcript" disabled={!tr?.text} onPress={() => { Haptics.selectionAsync(); setShowTranscript(true); }} />
      </View>

      <TranscriptSheet
        visible={showTranscript}
        onClose={() => setShowTranscript(false)}
        tr={tr}
        position={st.position}
        onSeek={(t) => AudioService.seek(t)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 8, paddingBottom: 20 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  nowPlaying: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 2, color: colors.textFaintOnDark },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.onDark, marginTop: 16, textAlign: 'center' },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textFaintOnDark, marginTop: 4 },
  error: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: '#E8A598', marginTop: 10, textAlign: 'center', paddingHorizontal: 24 },
  retry: { marginTop: 14, minHeight: 44, justifyContent: 'center', paddingHorizontal: 22, borderRadius: radius.pill, backgroundColor: 'rgba(230,207,148,0.18)' },
  retryText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.gold },
  blessing: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.gold, marginTop: 16, textAlign: 'center', paddingHorizontal: 20 },
  waveWrap: { alignItems: 'stretch', marginBottom: 14 },
  trackWrap: { paddingVertical: 10 },
  track: { height: 5, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.18)', justifyContent: 'center' },
  fill: { position: 'absolute', height: 5, borderRadius: 5, backgroundColor: colors.gold },
  knob: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: colors.gold, top: -6 },
  times: { flexDirection: 'row', justifyContent: 'space-between' },
  time: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaintOnDark },
  endsAt: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaintOnDark, textAlign: 'center', marginTop: 6, opacity: 0.85 },
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 },
  speed: { fontFamily: fonts.sansSemi, fontSize: 14, color: colors.textFaintOnDark, width: 34 },
  playBtn: { width: 66, height: 66, borderRadius: 33, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', justifyContent: 'center', gap: 14, marginTop: 24 },
  footerBtn: { minWidth: 92, minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderRadius: radius.pill, backgroundColor: 'rgba(255,255,255,0.08)' },
  footerBtnActive: { backgroundColor: 'rgba(230,207,148,0.18)' },
  footerLabel: { fontFamily: fonts.sansMed, fontSize: 13, color: colors.textFaintOnDark },
  footerLabelActive: { color: colors.gold },
  footerDisabled: { opacity: 0.4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: colors.sepia, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 22, maxHeight: '72%' },
  modalTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, marginBottom: 4 },
  modalRef: { fontFamily: fonts.sansMed, fontSize: 13, color: colors.brassDeep, marginBottom: 12 },
  modalScroll: { marginBottom: 16 },
  modalEmpty: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted },
  modalLine: { fontFamily: fonts.serif, fontSize: 20, lineHeight: 30, color: colors.textMuted, marginBottom: 10 },
  modalLineActive: { color: colors.ink, backgroundColor: 'rgba(230,207,148,0.35)', borderRadius: 6 },
  modalClose: { alignItems: 'center', minHeight: 44, justifyContent: 'center' },
  modalCloseText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.brassDeep },
});
