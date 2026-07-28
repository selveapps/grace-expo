import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Share, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { TeaService } from '../../services';
import { resolveStaticAudioUrl } from '../../api/audio';
import { colors, fonts, radius, shadow } from '../../theme';

const GRAD = {
  dark: ['#3A2C22', '#2B2015'],
  light: ['#FBF1DA', '#EFE0C0'],
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

  const dark = tea?.mood === 'dark';
  const fg = dark ? colors.onDark : colors.ink;
  const muted = dark ? colors.textFaintOnDark : colors.textMuted;

  const togglePlay = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (soundRef.current) {
      const status = await soundRef.current.getStatusAsync();
      if (status.isLoaded && status.isPlaying) { await soundRef.current.pauseAsync(); setAudio('idle'); return; }
      if (status.isLoaded) { await soundRef.current.playAsync(); setAudio('playing'); return; }
    }
    setAudio('loading');
    try {
      await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: true });
      const uri = await resolveStaticAudioUrl(tea.audioUrl || `/audio/${tea.id}.mp3`);
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
          <Text style={styles.emptyText}>We couldn’t find that one. Try another from the grid.</Text>
        </View>
      </Screen>
    );
  }

  return (
    <Screen bg={dark ? '#2B2015' : colors.ivory} edges={['top', 'bottom']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
            <Text style={[styles.back, { color: muted }]}>‹ Tea</Text>
          </Pressable>
        </View>

        <LinearGradient colors={GRAD[tea.mood]} style={styles.card}>
          <View style={[styles.badge, tea.mood === 'light' && styles.badgeLight]}>
            <Text style={[styles.badgeText, { color: tea.mood === 'light' ? colors.brassDeep : colors.gold }]}>{tea.badge}</Text>
          </View>
          <Text style={[styles.hook, { color: fg }]}>{tea.hook}</Text>
          <Text style={[styles.tea, { color: muted }]}>{tea.tea}</Text>

          <Pressable style={[styles.chip, dark && styles.chipDark]} onPress={openScripture}>
            <Text style={[styles.chipText, { color: dark ? colors.gold : colors.brassDeep }]}>{tea.ref} ›</Text>
          </Pressable>

          <View style={styles.narrator}>
            <GraceDove size={40} crop="head" motion="peek" />
            <Text style={[styles.narratorText, { color: muted }]}>Grace reads this</Text>
            <Pressable style={styles.playBtn} onPress={togglePlay}>
              {audio === 'loading'
                ? <ActivityIndicator color={colors.espresso} size="small" />
                : <Text style={styles.playIcon}>{audio === 'playing' ? '❚❚' : '▶'}</Text>}
            </Pressable>
          </View>
          {audio === 'error' && <Text style={styles.err}>Audio isn’t ready yet — tap play to try again.</Text>}
        </LinearGradient>

        <View style={styles.actions}>
          <Pressable style={styles.action} onPress={like}>
            <Text style={[styles.actionIcon, eng.liked && styles.actionOn]}>{eng.liked ? '♥' : '♡'}</Text>
            <Text style={styles.actionLabel}>Like</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={save}>
            <Text style={[styles.actionIcon, eng.saved && styles.actionOn]}>{eng.saved ? '★' : '☆'}</Text>
            <Text style={styles.actionLabel}>{eng.saved ? 'Saved' : 'Save'}</Text>
          </Pressable>
          <Pressable style={styles.action} onPress={share}>
            <Text style={styles.actionIcon}>⤴</Text>
            <Text style={styles.actionLabel}>Share</Text>
          </Pressable>
        </View>

        <Pressable onPress={nextTea} style={styles.next}>
          <Text style={styles.nextText}>Next tea →</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingHorizontal: 30 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 26, color: colors.ink, textAlign: 'center', marginTop: 8 },
  emptyText: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  scroll: { paddingHorizontal: 22, paddingTop: 8, paddingBottom: 30 },
  topBar: { marginBottom: 12 },
  back: { fontFamily: fonts.sans, fontSize: 14 },
  card: { borderRadius: radius.xl, padding: 24, ...shadow.card },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(230,207,148,0.18)', borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 5 },
  badgeLight: { backgroundColor: 'rgba(181,138,63,0.14)' },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 0.5 },
  hook: { fontFamily: fonts.serifSemi, fontSize: 30, lineHeight: 37, marginTop: 16 },
  tea: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25, marginTop: 16 },
  chip: { alignSelf: 'flex-start', marginTop: 20, backgroundColor: 'rgba(181,138,63,0.12)', borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  chipDark: { backgroundColor: 'rgba(230,207,148,0.14)' },
  chipText: { fontFamily: fonts.sansSemi, fontSize: 13, letterSpacing: 0.3 },
  narrator: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 22 },
  narratorText: { flex: 1, fontFamily: fonts.serifItalic, fontSize: 16 },
  playBtn: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  playIcon: { fontSize: 17, color: colors.espresso },
  err: { fontFamily: fonts.sans, fontSize: 12, color: '#E8A598', marginTop: 12 },
  actions: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 22, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, paddingVertical: 16 },
  action: { alignItems: 'center', gap: 4, minWidth: 64 },
  actionIcon: { fontSize: 22, color: colors.textMuted },
  actionOn: { color: colors.brass },
  actionLabel: { fontFamily: fonts.sansMed, fontSize: 12, color: colors.textMuted },
  next: { alignItems: 'center', paddingVertical: 20 },
  nextText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brassDeep },
});
