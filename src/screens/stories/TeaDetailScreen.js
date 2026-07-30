import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Share, ActivityIndicator, Dimensions, Animated, Easing, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import TeaImage from '../../components/TeaImage';
import GIcon from '../../components/GIcon';
import LiveCaptions from '../../components/LiveCaptions';
import { TeaService } from '../../services';
import { resolveStaticAudioUrl } from '../../api/audio';
import { colors, fonts, radius, shadow } from '../../theme';

// Tea Detail doubles as a recording surface: someone screen-records this with
// audio and posts the clip straight to a vertical feed. That drives the layout.
//
//   - The art is full-bleed behind everything, so the frame is never a flat
//     panel. Title, art and live captions are the hero; chrome is pushed to the
//     edges and kept inside the safe areas so it does not compete.
//   - Captions come from the render's real word timings, so a recording stays
//     in sync with the audio with no editing afterwards.
//
// The surface runs LIGHT. It was previously espresso with a dark scrim and a
// dark legibility gradient on top of that, which is why a recording of it was a
// near-black frame with a brown smudge behind the words. A light frame also
// shares better: it survives being reposted onto a white feed, and the serif
// hook in ink is legible in a thumbnail.
//
// Deliberately not Instagram-branded and not an Instagram UI clone; this is the
// Grace palette and type, arranged for a phone-shaped video.

const HEAT_LABEL = { 1: null, 2: null, 3: 'Wild' };
const { height: SCREEN_H } = Dimensions.get('window');

export default function TeaDetailScreen({ route, navigation }) {
  // `cardTitle` and `ref` arrive with the tap so the first frame already carries
  // the line she pressed. Without them this screen opened on a spinner and the
  // title reappeared later somewhere else, which read as a hard jump.
  const { id, cardTitle: handoffTitle, ref: handoffRef } = route.params || {};
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teas, setTeas] = useState([]);
  const [eng, setEng] = useState({ liked: false, saved: false });
  const [tr, setTr] = useState(null);
  const [audio, setAudio] = useState('idle'); // idle | loading | playing | error
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const soundRef = useRef(null);
  // Chrome recedes while the clip plays. A screen recording then shows art,
  // hook and captions, with the app's own controls out of the way. Tapping the
  // frame brings them back, so nothing becomes unreachable.
  const chrome = useRef(new Animated.Value(1)).current;
  const [chromeHeld, setChromeHeld] = useState(false);
  // The hero arriving. Same timing language as the Stories/Tea cross-fade
  // (short, eased, no spring), so this reads as the same product rather than a
  // new animation system. Only used when we arrived without a card title, e.g.
  // a deep link; otherwise the hook crossfades off `depart` instead.
  const settle = useRef(new Animated.Value(0)).current;
  // The card title's exit, on its own clock. It holds long enough to be read as
  // the thing that was tapped, then lifts away; sharing `settle` made it vanish
  // inside ~120ms, which reads as a flash rather than a handover.
  const depart = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setAudio('idle');
    setPosition(0);
    setTr(null);
    TeaService.getOne(id)
      .then((t) => { if (alive) setTea(t); })
      .finally(() => { if (alive) setLoading(false); });
    TeaService.getEngagement(id).then((e) => { if (alive) setEng(e); });
    TeaService.getAll().then((all) => { if (alive) setTeas(all); });
    TeaService.getTranscript(id).then((t) => { if (alive) setTr(t); });
    // Settle the hero as the screen arrives, not when the fetch returns.
    settle.setValue(0);
    depart.setValue(0);
    Animated.timing(settle, {
      toValue: 1, duration: 260, easing: Easing.out(Easing.cubic), useNativeDriver: true,
    }).start();
    Animated.sequence([
      Animated.delay(240),
      Animated.timing(depart, {
        toValue: 1, duration: 420, easing: Easing.inOut(Easing.ease), useNativeDriver: true,
      }),
    ]).start();
    return () => { alive = false; };
  }, [id]);

  const stop = useCallback(async () => {
    const snd = soundRef.current;
    soundRef.current = null;
    setAudio('idle');
    setPosition(0);
    if (snd) await snd.unloadAsync().catch(() => {});
  }, []);

  // Leaving the screen must silence the clip; a native stack keeps it mounted.
  useFocusEffect(useCallback(() => () => { stop(); }, [stop]));

  const onStatus = (s) => {
    if (!s.isLoaded) { if (s.error) setAudio('error'); return; }
    setPosition((s.positionMillis ?? 0) / 1000);
    setDuration((s.durationMillis ?? 0) / 1000);
    if (s.didJustFinish) { setAudio('idle'); setPosition(0); }
  };

  const togglePlay = async () => {
    // The card hands over a title, not a media url; wait for the real record.
    if (!tea) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (soundRef.current) {
      const st = await soundRef.current.getStatusAsync();
      if (st.isLoaded && st.isPlaying) { await soundRef.current.pauseAsync(); setAudio('idle'); return; }
      if (st.isLoaded) { await soundRef.current.playAsync(); setAudio('playing'); return; }
    }
    setAudio('loading');
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const uri = await resolveStaticAudioUrl(tea.audioUrl || `/audio/tea-${tea.id}.mp3`);
      if (!uri) { setAudio('error'); return; }
      const { sound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true, progressUpdateIntervalMillis: 60 }, // tight for caption sync
        onStatus,
      );
      soundRef.current = sound;
      setAudio('playing');
    } catch {
      setAudio('error');
    }
  };

  const replay = async () => {
    Haptics.selectionAsync();
    if (!soundRef.current) return togglePlay();
    await soundRef.current.setPositionAsync(0);
    await soundRef.current.playAsync();
    setPosition(0);
    setAudio('playing');
  };

  const like = async () => { Haptics.selectionAsync(); setEng(await TeaService.toggleLike(id)); };
  const save = async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEng(await TeaService.save(id)); };
  const share = async () => {
    if (!tea) return;
    Haptics.selectionAsync();
    try {
      await Share.share({ message: `${tea.hook}\n\n${tea.ref} · Tea from Grace` });
    } catch { /* dismissed */ }
  };
  const openScripture = () => {
    if (!tea?.book) return;
    Haptics.selectionAsync();
    navigation.getParent()?.navigate('Reading', { screen: 'Book', params: { book: tea.book } });
  };
  const nextTea = () => {
    if (!teas.length) return;
    const i = teas.findIndex((t) => t.id === id);
    Haptics.selectionAsync();
    const next = teas[(i + 1) % teas.length];
    // Carry the title forward so the next card lands the same way this one did.
    navigation.replace('TeaDetail', { id: next.id, cardTitle: next.cardTitle, ref: next.ref });
  };

  const playing = audio === 'playing';

  useEffect(() => {
    Animated.timing(chrome, {
      toValue: playing && !chromeHeld ? 0 : 1,
      duration: playing && !chromeHeld ? 520 : 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [playing, chromeHeld]);

  // Any tap on the frame reveals the controls again for a while.
  const revealChrome = () => {
    setChromeHeld(true);
    clearTimeout(revealChrome._t);
    revealChrome._t = setTimeout(() => setChromeHeld(false), 3200);
  };
  const captionWords = tr?.words ?? null;
  const remaining = Math.max(0, Math.round((duration || tea?.durationSeconds || 0) - position));

  const heat = useMemo(() => HEAT_LABEL[tea?.heat] ?? tea?.badge, [tea]);

  // The tea we can draw right now. Until the fetch lands that is whatever the
  // card handed over, which is enough for the art, the title and the reference.
  const display = tea || (handoffTitle ? { id, cardTitle: handoffTitle, ref: handoffRef } : null);

  // Only spin when we arrived with nothing to show, e.g. a deep link.
  if (loading && !display) {
    return <Screen bg={colors.ivory}><View style={styles.center}><ActivityIndicator color={colors.brass} /></View></Screen>;
  }
  if (!loading && !tea) {
    return (
      <Screen bg={colors.ivory} edges={['top', 'bottom']} style={styles.pad}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹ Tea</Text></Pressable>
        <View style={styles.center}>
          <GraceDove size={90} crop="head" motion="peek" />
          <Text style={styles.emptyTitle}>This tea has gone cold.</Text>
          <Text style={styles.emptyText}>We couldn’t find that one. Try another from the archive.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" />
      {/* Full-bleed art behind everything, so the frame reads as a picture. */}
      <TeaImage tea={display} style={StyleSheet.absoluteFill} scrim="rgba(253,247,234,0.18)" />
      {/* Legibility wash only where text sits, keeping the art visible between. */}
      <LinearGradient
        colors={['rgba(253,247,234,0.72)', 'rgba(253,247,234,0.06)', 'rgba(250,242,226,0.9)']}
        locations={[0, 0.36, 0.78]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />

      <Screen bg="transparent" edges={['top', 'bottom']} style={styles.frame}>
        {/* Top chrome, kept small so it never competes in a recording. */}
        <Animated.View style={[styles.topBar, { opacity: chrome }]}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Back to Tea">
            <GIcon name="chevronDown" size={20} color={colors.espresso} />
          </Pressable>
          {/* The single Grace lockup on this screen: bird over wordmark, dead
              centre. It replaces the old bottom-right mark, so a reposted clip
              is still branded but only once. */}
          {/* Sized to be legible as a brand in a screen recording without
              crowding the frame: this is the mark that survives a repost. */}
          <View style={styles.mark} pointerEvents="none">
            <GraceDove size={65} crop="head" motion="none" />
            <Text style={styles.markText}>Grace</Text>
          </View>
          <Pressable onPress={share} hitSlop={12} style={styles.shareBtn} accessibilityRole="button" accessibilityLabel="Share">
            <GIcon name="share" size={17} color={colors.espresso} />
            <Text style={styles.shareText}>Share</Text>
          </Pressable>
        </Animated.View>

        {/* Tapping the empty middle restores the controls mid-playback. */}
        <Pressable style={{ flex: 1 }} onPress={revealChrome} accessibilityLabel="Show controls" />

        {/* HERO: hook, then live captions, over the artwork. This is what a
            recording shows.

            The card's preview title is NOT a heading here. It is painted on the
            first frame so the tap has something to hold on to, then lifts away
            as the hero settles: the card title disappears instead of becoming a
            second, competing headline. Absolutely positioned so its exit does
            not reflow the hook underneath it. */}
        <View style={styles.hero}>
          {display.cardTitle ? (
            <Animated.Text
              style={[
                styles.handoff,
                {
                  opacity: depart.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                  transform: [{
                    translateY: depart.interpolate({ inputRange: [0, 1], outputRange: [0, -20] }),
                  }],
                },
              ]}
              numberOfLines={2}
              pointerEvents="none"
              accessibilityElementsHidden
            >
              {display.cardTitle}
            </Animated.Text>
          ) : null}

          {/* Crossfades in exactly where the card title was, so the eye stays
              put while the title hands over to the words being spoken.

              There is deliberately no hook heading here any more. It restated
              the opening of the narration that the captions were already
              showing, one truncated line above the other, which is the
              duplication the brief rules out. Captions are the text. */}
          <Animated.View style={{ opacity: display.cardTitle ? depart : settle }}>
            {captionWords ? (
              <LiveCaptions
                words={captionWords}
                position={position}
                playing={playing}
                tone="onLight"
                style={styles.captions}
              />
            ) : (
              // No sidecar: show the body rather than captions that would drift.
              <Text style={styles.body} numberOfLines={6}>{tea?.tea ?? ''}</Text>
            )}
          </Animated.View>

          {/* The reference, and the heat badge when a tea earns one. The Grace
              lockup that used to sit here has moved to the top centre, so the
              brand appears exactly once on this screen. */}
          <View style={styles.heroFoot}>
            <Pressable style={styles.chip} onPress={openScripture} accessibilityRole="button">
              <Text style={styles.chipText}>{display.ref}</Text>
              <GIcon name="chevronRight" size={13} color={colors.brassDeep} />
            </Pressable>
            {heat ? (
              <View style={[styles.badge, display.heat === 3 && styles.badgeWild]}>
                <Text style={styles.badgeText}>{heat}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* Controls sit low and quiet, inside the safe area. */}
        <Animated.View style={[styles.controls, { opacity: chrome }]}>
          <Pressable
            onPress={togglePlay}
            disabled={!tea}
            style={[styles.playBtn, !tea && styles.playBtnWaiting]}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'Pause' : 'Play this tea'}
            testID="tea-play"
          >
            {audio === 'loading'
              ? <ActivityIndicator color={colors.espresso} size="small" />
              : <GIcon name={playing ? 'pause' : 'play'} size={22} color={colors.espresso} filled={!playing} strokeWidth={2.2} />}
          </Pressable>

          <View style={styles.meta}>
            <Text style={styles.metaTop}>{playing ? 'Grace is reading' : 'Grace reads this'}</Text>
            <Text style={styles.metaSub}>{remaining > 0 ? `${remaining}s left` : `${Math.round(tea?.durationSeconds || 60)}s`}</Text>
          </View>

          <Pressable onPress={replay} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Replay from the start">
            <GIcon name="back15" size={21} color={colors.textMuted} />
          </Pressable>
          <Pressable onPress={like} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Like">
            <GIcon name="heart" size={21} color={eng.liked ? colors.brass : colors.textMuted} filled={eng.liked} />
          </Pressable>
          <Pressable onPress={save} hitSlop={10} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel={eng.saved ? 'Saved' : 'Save'}>
            <GIcon name={eng.saved ? 'check' : 'bookmark'} size={21} color={eng.saved ? colors.brass : colors.textMuted} />
          </Pressable>
        </Animated.View>

        {audio === 'error' ? <Text style={styles.err}>Audio isn’t ready yet. Tap play to try again.</Text> : null}

        <Animated.View style={{ opacity: chrome }}>
          <Pressable onPress={nextTea} style={styles.next} accessibilityRole="button">
            <Text style={styles.nextText}>Next tea</Text>
            <GIcon name="chevronRight" size={15} color={colors.brassDeep} />
          </Pressable>
        </Animated.View>
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.ivoryWarm },
  // The tab bar floats over this screen, so the controls and the next-tea row
  // need room to clear it. Adding the carried-through title pushed the hero
  // down far enough that the play button was landing underneath the bar.
  // paddingTop clears the dove's halo, which was being cropped by the safe-area
  // edge once the lockup moved to the top bar.
  frame: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 96 },
  pad: { paddingHorizontal: 22 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, textAlign: 'center', marginTop: 8 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center' },
  back: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, minHeight: 44 },

  // Back and Share are fixed-width so the centre lockup is optically centred on
  // the screen rather than centred in the space left over between them.
  topBar: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', minHeight: 128 },
  iconBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  // Share is the point of this screen, so it is a labelled affordance rather
  // than one more unlabelled glyph in a row.
  shareBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40,
    paddingHorizontal: 14, borderRadius: radius.pill,
    backgroundColor: 'rgba(255,253,249,0.78)', borderWidth: 1, borderColor: colors.cardBorder,
  },
  shareText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.espresso },
  badge: { backgroundColor: 'rgba(255,253,249,0.8)', borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeWild: { backgroundColor: colors.brassDeep, borderColor: colors.brassDeep },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1, color: colors.brassDeep, textTransform: 'uppercase' },

  hero: { paddingBottom: 10 },
  // The card's title as it leaves. Absolute so its exit costs no layout, and
  // anchored where the hook begins so the two read as the same place.
  handoff: {
    position: 'absolute', left: 0, right: 0, top: 0,
    fontFamily: fonts.serifSemi, fontSize: SCREEN_H > 800 ? 34 : 30,
    lineHeight: SCREEN_H > 800 ? 39 : 35, color: colors.ink,
  },
  captions: { marginTop: 20 },
  body: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 26, color: colors.textMuted, marginTop: 18 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', marginTop: 18, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: 'rgba(181,138,63,0.14)', borderWidth: 1, borderColor: 'rgba(181,138,63,0.28)' },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13, letterSpacing: 0.3, color: colors.brassDeep },
  heroFoot: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  // Top-centre lockup: bird above the wordmark. Absolute, so it centres on the
  // SCREEN rather than in the gap left between Back and the wider Share button.
  // Dropped clear of the notch/safe-area edge so the halo has air above it, and
  // sized to read as a brand in a screen recording.
  mark: { position: 'absolute', left: 0, right: 0, top: 22, alignItems: 'center', justifyContent: 'center' },
  markText: { fontFamily: fonts.serifSemi, fontSize: 25, color: colors.ink, letterSpacing: 0.5, marginTop: 0 },

  controls: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 18 },
  playBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  playBtnWaiting: { opacity: 0.5 },
  meta: { flex: 1, marginLeft: 4 },
  metaTop: { fontFamily: fonts.serifItalic, fontSize: 17, color: colors.ink },
  metaSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginTop: 2 },
  err: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger, marginTop: 10 },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, minHeight: 44 },
  nextText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brassDeep },
});
