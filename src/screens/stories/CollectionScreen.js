import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import GIcon from '../../components/GIcon';
import { StoryCover } from '../../components/StoryArt';
import { StoryService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

// Destination for the Collection chips on Stories, which were previously plain
// Views with no handler. StoryService.getStories(name) already filters by tag,
// so this is a real listing rather than a placeholder.
export default function CollectionScreen({ route, navigation }) {
  const { name, tint } = route.params || {};
  const [stories, setStories] = useState(null);

  useEffect(() => {
    let alive = true;
    StoryService.getStories(name)
      .then((s) => { if (alive) setStories(s); })
      .catch(() => { if (alive) setStories([]); });
    return () => { alive = false; };
  }, [name]);

  const open = (id) => { Haptics.selectionAsync(); navigation.navigate('StoryDetail', { id }); };

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backHit}>
          <Text style={styles.back}>‹ Stories</Text>
        </Pressable>

        <View style={[styles.hero, { backgroundColor: tint || colors.sand }]}>
          <Text style={styles.heroTitle}>{name}</Text>
          <Text style={styles.heroSub}>
            {stories == null ? ' ' : `${stories.length} ${stories.length === 1 ? 'story' : 'stories'}`}
          </Text>
        </View>

        {stories == null ? (
          <View style={styles.center}><ActivityIndicator color={colors.brass} /></View>
        ) : stories.length === 0 ? (
          <View style={styles.center}>
            <GraceDove size={90} crop="head" motion="peek" />
            <Text style={styles.emptyTitle}>Nothing here yet.</Text>
            <Text style={styles.emptyText}>New stories land in this collection as they are written.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {stories.map((s) => (
              <Pressable
                key={s.id}
                style={styles.row}
                onPress={() => open(s.id)}
                accessibilityRole="button"
                accessibilityLabel={`${s.title}, ${Math.round((s.durationSeconds || 0) / 60)} minutes`}
              >
                <StoryCover story={s} size={56} radius={radius.sm}>
                  <View style={styles.thumbPlay}>
                    <GIcon name="play" size={12} color={colors.espresso} filled />
                  </View>
                </StoryCover>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{s.title}</Text>
                  <Text style={styles.rowSub} numberOfLines={1}>{s.subtitle}</Text>
                  <Text style={styles.rowMeta}>
                    {s.scriptureRange} · {Math.round((s.durationSeconds || 0) / 60)} min
                    {s.parts > 1 ? ` · ${s.parts} parts` : ''}
                  </Text>
                </View>
                <GIcon name="chevronRight" size={16} color={colors.textFaint} />
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 6, paddingBottom: 110 },
  backHit: { minHeight: 44, justifyContent: 'center' },
  back: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted },
  hero: { borderRadius: radius.xl, padding: 24, marginBottom: 20, ...shadow.card },
  heroTitle: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink },
  heroSub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, marginTop: 4 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 60, gap: 10, paddingHorizontal: 24 },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 24, color: colors.ink, textAlign: 'center' },
  emptyText: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, padding: 14, minHeight: 44 },
  thumbPlay: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(230,207,148,0.94)', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textMuted, marginTop: 1 },
  rowMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginTop: 3 },
});
