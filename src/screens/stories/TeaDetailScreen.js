import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import TeaImage from '../../components/TeaImage';
import GIcon from '../../components/GIcon';
import { TeaService } from '../../services';
import { resolveStaticAudioUrl } from '../../api/audio';
import { colors, fonts, radius, shadow } from '../../theme';

const HEAT_PILL = {
  1: 'rgba(230,207,148,0.20)',
  2: 'rgba(230,207,148,0.28)',
  3: 'rgba(143,106,44,0.72)',
};

export default function TeaDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [tea, setTea] = useState(null);
  const [loading, setLoading] = useState(true);
  const [teas, setTeas] = useState([]);
  const [eng, setEng] = useState({ liked: false, saved: false });
  const [audio, setAudio] = useState('idle'); // idle | loading | playing | error
  const soundRef = useRef(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setAudio('idle');
    TeaService.getOne(id)
      .then((t) => { if (alive) setTea(t); })
      .finally(() => { if (alive) setLoading(false); });
    TeaService.getEngagement(id).then((e) => { if (alive) setEng(e); });
    TeaService.getAll().then((all) => { if (alive) setTeas(all); });
    return () => {
      alive = false;
      if (soundRef.current) { soundRef.current.unloadAsync().catch(() => {}); soundRef.current = null; }
    };
  }, [id]);

  const togglePlay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) { await soundRef.current.pauseAsync(); setAudio('idle'); return; }
      if (status.isLoaded) { await soundRef.current.playAsync(); setAudio('playing'); return; }
    }
    setAudio('loading');
    try {
      // playsInSilentModeIOS matters: without it a user on silent hears nothing
      // and reports that audio is broken.
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const uri = await resolveStaticAudioUrl(tea.audioUrl || `/audio/tea-${tea.id}.mp3`);
      if (!uri) { setAudio('error'); return; }
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true }, (s) => {
        if (!s.isLoaded) { if (s.error) setAudio('error'); return; }
        if (s.didJustFinish) setAudio('idle');
      });
      soundRef.current = sound;
      setAudio('playing');
    } catch {
      setAudio('error');
    }
  };

  const like = async () => { Haptics.selectionAsync(); setEng(await TeaService.toggleLike(id)); };
  const save = async () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setEng(await TeaService.save(id)); };
  const share = async () => {
    Haptics.selectionAsync();
    try {
      await Share.share({ message: `${tea.hook}\n\n${tea.ref} · via Grace` });
    } catch { /* dismissed */ }
  };
  const openScripture = () => {
    Haptics.selectionAsync();
    navigation.getParent()?.navigate('Reading', { screen: 'Book', params: { book: tea.book } });
  };
  const nextTea = () => {
    if (!teas.length) return;
    const i = teas.findIndex((t) => t.id === id);
    const next = teas[(i + 1) % teas.length];
    Haptics.selectionAsync();
    navigation.replace('TeaDetail', { id: next.id });
  };

  if (loading) {
    return <Screen bg={colors.ivory}><View style={styles.loading}><ActivityIndicator color={colors.brass} /></View></Screen>;
  }
  if (!tea) {
    return (
      <Screen bg={colors.ivory} edges={['top', 'bottom']} style={styles.scroll}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}><Text style={styles.back}>‹ Tea</Text></Pressable>
        <View style={styles.loading}>
          <GraceDove size={90} crop="head" motion="peek" />
          <Text style={styles.emptyTitle}>This tea has gone cold.</Text>
          <Text style={styles.emptyText}>We couldn’t find that one. Try another from the archive.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.ivory} edges={['bottom']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Full-bleed art, with the hook sitting on the scrim. */}
        <TeaImage tea={tea} style={styles.cover} scrim="rgba(43,32,21,0.55)">
          <View style={styles.coverBody}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backHit}>
              <Text style={styles.backOnCover}>‹ Tea</Text>
            </Pressable>
            <View style={{ flex: 1 }} />
            <View style={[styles.badge, { backgroundColor: HEAT_PILL[tea.heat] || HEAT_PILL[1] }]}>
              <Text style={styles.badgeText}>{tea.heat === 3 ? 'Wild' : tea.badge}</Text>
            </View>
            <Text style={styles.hook}>{tea.hook}</Text>
          </View>
        </TeaImage>

        <View style={styles.sheet}>
          <Text style={styles.tea}>{tea.tea}</Text>

          <Pressable style={styles.chip} onPress={openScripture} accessibilityRole="button">
            <Text style={styles.chipText}>{tea.ref}</Text>
            <GIcon name="chevronRight" size={14} color={colors.brassDeep} />
          </Pressable>

          <View style={styles.narrator}>
            <GraceDove size={40} crop="head" motion="peek" />
            <Text style={styles.narratorText}>Grace reads this, one minute</Text>
            <Pressable
              style={styles.playBtn}
              onPress={togglePlay}
              accessibilityRole="button"
              accessibilityLabel={audio === 'playing' ? 'Pause narration' : 'Play narration'}
            >
              {audio === 'loading'
                ? <ActivityIndicator color={colors.espresso} size="small" />
                : <GIcon name={audio === 'playing' ? 'pause' : 'play'} size={18} color={colors.espresso} filled={audio !== 'playing'} />}
            </Pressable>
          </View>
          {audio === 'error' && <Text style={styles.err}>Audio isn’t ready yet. Tap play to try again.</Text>}
        </View>

        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={like} accessibilityRole="button" accessibilityLabel="Like">
            <GIcon name="heart" size={22} color={eng.liked ? colors.brass : colors.textMuted} filled={eng.liked} />
            <Text style={styles.actionLabel}>Like</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={save} accessibilityRole="button" accessibilityLabel={eng.saved ? 'Saved' : 'Save'}>
            <GIcon name={eng.saved ? 'check' : 'download'} size={22} color={eng.saved ? colors.brass : colors.textMuted} />
            <Text style={styles.actionLabel}>{eng.saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={share} accessibilityRole="button" accessibilityLabel="Share">
            <GIcon name="share" size={22} color={colors.textMuted} />
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
        </View>

        <Pressable onPress={nextTea} style={styles.next}>
          <Text style={styles.nextText}>Next tea</Text>
          <GIcon name="chevronRight" size={16} color={colors.brassDeep} />
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, textAlign: 'center', marginTop: 8 },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center' },
  scroll: { paddingBottom: 110 },
  back: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
  backHit: { minHeight: 44, justifyContent: 'center' },
  backOnCover: { fontFamily: fonts.sans, fontSize: 15, color: colors.onDark },
  cover: { minHeight: 340, paddingTop: 8 },
  coverBody: { flex: 1, paddingHorizontal: 22, paddingBottom: 24, paddingTop: 8 },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.5, color: colors.gold },
  hook: { fontFamily: fonts.serifSemi, fontSize: 32, lineHeight: 39, color: colors.onDark, marginTop: 14 },
  sheet: { paddingHorizontal: 22, paddingTop: 22 },
  tea: { fontFamily: fonts.sans, fontSize: 17, lineHeight: 27, color: colors.textMuted },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', marginTop: 20, minHeight: 44, backgroundColor: 'rgba(181,138,63,0.12)', borderRadius: radius.pill, paddingHorizontal: 16 },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 14, letterSpacing: 0.3, color: colors.brassDeep },
  narrator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, padding: 14, ...shadow.card },
  narratorText: { flex: 1, fontFamily: fonts.serifItalic, fontSize: 17, color: colors.textMuted },
  playBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  err: { fontFamily: fonts.sans, fontSize: 13, lineHeight: 20, color: colors.danger, marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 22, marginHorizontal: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, paddingVertical: 14 },
  action: { alignItems: 'center', gap: 6, minWidth: 64, minHeight: 44, justifyContent: 'center' },
  actionLabel: { fontFamily: fonts.sansMed, fontSize: 12, color: colors.textMuted },
  next: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 20, minHeight: 44 },
  nextText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.brassDeep },
});
