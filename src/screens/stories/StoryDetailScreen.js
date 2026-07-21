import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { StoryService, AudioService } from '../../services';
import { colors, fonts, radius } from '../../theme';

export default function StoryDetailScreen({ route, navigation }) {
  const { id } = route.params || {};
  const [story, setStory] = useState(null);
  const [progress, setProgress] = useState(null);
  const [narrative, setNarrative] = useState(null);
  const [loadingNarrative, setLoadingNarrative] = useState(true);

  const [loadingAudio, setLoadingAudio] = useState(false);

  useEffect(() => {
    let alive = true;
    Promise.all([StoryService.getStory(id), StoryService.getProgress(id)])
      .then(([s, p]) => { if (alive) { setStory(s); setProgress(p); } });
    StoryService.getNarrative(id, 1)
      .then((res) => { if (alive) setNarrative(res.content); })
      .catch(() => { if (alive) setNarrative(null); })
      .finally(() => { if (alive) setLoadingNarrative(false); });
    return () => { alive = false; };
  }, [id]);

  const play = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setLoadingAudio(true);
    try {
      await AudioService.loadStory(id);
      await AudioService.play();
      navigation.navigate('Player', { id });
    } catch {
      navigation.navigate('Player', { id });
    } finally {
      setLoadingAudio(false);
    }
  };

  if (!story) return <Screen bg={colors.ivory}><View style={styles.loading}><ActivityIndicator color={colors.brass} /></View></Screen>;

  const pct = progress && progress.seconds > 0 ? Math.round((progress.seconds / story.durationSeconds) * 100) : 0;

  return (
    <Screen bg={colors.ivory} edges={[]} style={{ paddingHorizontal: 0 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: story.coverTint }]}>
          <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Stories</Text></Pressable>
          <Text style={styles.title}>{story.title}</Text>
          <Text style={styles.subtitle}>{story.subtitle}</Text>
          <View style={styles.meta}>
            <Text style={styles.metaText}>{story.scriptureRange}</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{Math.round(story.durationSeconds / 60)} min</Text>
            <Text style={styles.metaDot}>·</Text>
            <Text style={styles.metaText}>{story.parts} parts</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Pressable style={styles.playBtn} onPress={play} disabled={loadingAudio}>
            {loadingAudio ? (
              <ActivityIndicator color={colors.onDark} />
            ) : (
              <Text style={styles.playText}>{pct > 0 ? `▶  Resume · ${pct}%` : '▶  Play'}</Text>
            )}
          </Pressable>

          <View style={styles.card}>
            <Text style={styles.hookLabel}>THE HOOK</Text>
            <Text style={styles.hook}>“{story.hook}”</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.hookLabel}>NARRATION PREVIEW</Text>
            {loadingNarrative ? (
              <ActivityIndicator color={colors.brass} style={{ marginTop: 8 }} />
            ) : narrative ? (
              <Text style={styles.preview} numberOfLines={6}>{narrative}</Text>
            ) : (
              <Text style={styles.previewMuted}>Grace is preparing this story for you. Tap Play to begin.</Text>
            )}
          </View>

          <View style={[styles.card, { backgroundColor: 'rgba(181,138,63,0.07)', borderColor: '#E6D9BF' }]}>
            <Text style={styles.hookLabel}>RELATED PASSAGE</Text>
            <Text style={styles.related}>{story.scriptureRange}</Text>
            <Text style={styles.relatedSub}>Read alongside this story in the Reading tab.</Text>
          </View>

          <View style={styles.tags}>
            {story.tags.map((t) => <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hero: { paddingTop: 74, paddingHorizontal: 24, paddingBottom: 28 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkMuted },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.onDark, marginTop: 20, lineHeight: 40 },
  subtitle: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.gold, marginTop: 6 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  metaText: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkMuted },
  metaDot: { color: colors.onDarkMuted },
  body: { padding: 22, gap: 14 },
  playBtn: { backgroundColor: colors.espresso, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  playText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.onDark },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 18 },
  hookLabel: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass, marginBottom: 8 },
  hook: { fontFamily: fonts.serifItalic, fontSize: 21, color: colors.ink, lineHeight: 29 },
  preview: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, lineHeight: 22 },
  previewMuted: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, lineHeight: 20 },
  related: { fontFamily: fonts.serifSemi, fontSize: 21, color: colors.ink },
  relatedSub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine },
  tagText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
});
