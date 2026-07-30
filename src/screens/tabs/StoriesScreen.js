import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import Waveform from '../../components/Waveform';
import GIcon from '../../components/GIcon';
import StoryArt, { StoryCover } from '../../components/StoryArt';
import TeaScreen from '../stories/TeaScreen';
import { StoryService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

function fmt(sec) { return `${Math.max(1, Math.round((sec || 0) / 60))} min`; }

const TABS = ['Stories', 'Tea'];

// How many stories get the full-width treatment before the rest move into a
// horizontal rail. The feedback asked for roughly three up front and the
// remainder scrollable, which is also what makes the catalogue feel deep rather
// than like a short list that has run out.
const PROMINENT = 3;

function Segmented({ value, onChange }) {
  return (
    <View style={styles.segment}>
      {TABS.map((t) => {
        const on = value === t;
        return (
          <Pressable
            key={t}
            style={[styles.segmentItem, on && styles.segmentItemOn]}
            onPress={() => { if (!on) { Haptics.selectionAsync(); onChange(t); } }}
          >
            <Text style={[styles.segmentText, on && styles.segmentTextOn]}>{t}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function StoriesScreen({ navigation }) {
  const [tab, setTab] = useState('Stories');
  const fade = useRef(new Animated.Value(1)).current;
  const [featured, setFeatured] = useState(null);
  const [collections, setCollections] = useState([]);
  const [cont, setCont] = useState([]);
  const [all, setAll] = useState([]);

  // Reload on focus so continue-listening reflects real progress.
  useFocusEffect(useCallback(() => {
    let alive = true;
    Promise.all([StoryService.getFeatured(), StoryService.getCollections(), StoryService.getContinue(), StoryService.getStories()])
      .then(([f, c, k, a]) => { if (!alive) return; setFeatured(f); setCollections(c); setCont(k); setAll(a); });
    return () => { alive = false; };
  }, []));

  const openCollection = (c) => {
    Haptics.selectionAsync();
    navigation.navigate('Collection', { name: c.name, tint: c.tint });
  };
  const open = (id) => navigation.navigate('StoryDetail', { id });

  // Cross-fade the body so the surfaces feel continuous rather than swapped.
  const switchTab = (next) => {
    if (next === tab) return;
    Animated.timing(fade, { toValue: 0, duration: 110, useNativeDriver: true }).start(() => {
      setTab(next);
      Animated.timing(fade, { toValue: 1, duration: 190, useNativeDriver: true }).start();
    });
  };

  // Stories and Tea share one shell. Previously each branch returned its own
  // <Screen> with its own copy of the segmented control, so switching unmounted
  // the whole surface and remounted the other: a hard swap that read as two
  // disconnected products. Now the frame and the control keep their identity and
  // only the body cross-fades.
  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
      <View style={styles.segmentWrap}><Segmented value={tab} onChange={switchTab} /></View>
      <Animated.View style={{ flex: 1, opacity: fade }}>
        {tab === 'Tea' ? <TeaScreen navigation={navigation} /> : (
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>Stories</Text>
        <Text style={styles.sub}>Real people. Real struggle. Real faith.</Text>

        {featured && (
          <Pressable
            style={({ pressed }) => [styles.feature, pressed && styles.pressed]}
            onPress={() => open(featured.id)}
            accessibilityRole="button"
            accessibilityLabel={`Featured: ${featured.title}`}
          >
            {/* Real cover art behind the panel instead of a flat brown fill. */}
            <StoryArt story={featured} ratio={1.55} />
            <View style={styles.featScrim} />
            <View style={styles.featBody}>
              <Text style={styles.featLabel}>FEATURED</Text>
              <Text style={styles.featTitle}>{featured.title}</Text>
              <Text style={styles.featSub}>
                {featured.subtitle} · {featured.parts} {featured.parts === 1 ? 'part' : 'parts'} · {fmt(featured.durationSeconds)}
              </Text>
              <View style={styles.featRow}>
                <View style={styles.play}><GIcon name="play" size={18} color={colors.espresso} filled /></View>
                <Waveform width={190} color={colors.gold} height={30} />
              </View>
            </View>
          </Pressable>
        )}

        <Text style={styles.section}>COLLECTIONS</Text>
        <View style={styles.chips}>
          {collections.map((c) => (
            <Pressable
              key={c.id}
              onPress={() => openCollection(c)}
              style={({ pressed }) => [styles.chip, { backgroundColor: c.tint }, pressed && styles.chipPressed]}
              accessibilityRole="button"
              accessibilityLabel={`Open the ${c.name} collection`}
            >
              <Text style={styles.chipText}>{c.name}</Text>
            </Pressable>
          ))}
        </View>

        {cont.length > 0 && (
          <>
            <Text style={styles.section}>CONTINUE LISTENING</Text>
            <View style={{ gap: 12 }}>
              {cont.map((s) => {
                const pct = s.durationSeconds
                  ? Math.min(99, Math.max(1, Math.round((s.progress.seconds / s.durationSeconds) * 100)))
                  : 0;
                return (
                  <Pressable
                    key={s.id}
                    style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                    onPress={() => open(s.id)}
                    accessibilityRole="button"
                    accessibilityLabel={`Continue ${s.title}, ${pct} percent`}
                  >
                    <StoryCover story={s} size={50} radius={14} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.rowTitle} numberOfLines={1}>{s.title}</Text>
                      <Text style={styles.rowSub} numberOfLines={1}>{s.subtitle} · {pct}%</Text>
                      <View style={styles.bar}><View style={[styles.barFill, { width: `${pct}%` }]} /></View>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}

        <Text style={styles.section}>ALL STORIES</Text>
        {/* Three up front with real weight, then the rest in a rail, so the
            catalogue reads as deeper than the list it fits in. */}
        <View style={{ gap: 12 }}>
          {all.slice(0, PROMINENT).map((s) => (
            <Pressable
              key={s.id}
              style={({ pressed }) => [styles.bigRow, pressed && styles.pressed]}
              onPress={() => open(s.id)}
              accessibilityRole="button"
              accessibilityLabel={`${s.title}, ${fmt(s.durationSeconds)}`}
            >
              <StoryCover story={s} size={84} radius={radius.sm}>
                <View style={styles.coverPlay}>
                  <GIcon name="play" size={14} color={colors.espresso} filled />
                </View>
              </StoryCover>
              <View style={{ flex: 1 }}>
                <Text style={styles.bigTitle} numberOfLines={1}>{s.title}</Text>
                <Text style={styles.bigSub} numberOfLines={1}>{s.subtitle}</Text>
                <Text style={styles.bigMeta} numberOfLines={1}>
                  {s.scriptureRange} · {fmt(s.durationSeconds)}
                  {s.parts > 1 ? ` · ${s.parts} parts` : ''}
                </Text>
              </View>
              <GIcon name="chevronRight" size={16} color={colors.textFaint} />
            </Pressable>
          ))}
        </View>

        {all.length > PROMINENT && (
          <>
            <View style={styles.railHead}>
              <Text style={[styles.section, styles.railLabel]}>MORE STORIES</Text>
              <Text style={styles.railCount}>{all.length - PROMINENT} more</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.rail}
              // The rail is inset-bleed: it runs to the screen edge so the last
              // card is visibly cut off, which is what signals "keep scrolling".
              style={styles.railOuter}
            >
              {all.slice(PROMINENT).map((s) => (
                <Pressable
                  key={s.id}
                  style={({ pressed }) => [styles.railCard, pressed && styles.pressed]}
                  onPress={() => open(s.id)}
                  accessibilityRole="button"
                  accessibilityLabel={`${s.title}, ${fmt(s.durationSeconds)}`}
                >
                  <StoryArt story={s} ratio={0.78} />
                  <View style={styles.railScrim} />
                  <View style={styles.railBody}>
                    <Text style={styles.railTitle} numberOfLines={2}>{s.title}</Text>
                    <Text style={styles.railMeta} numberOfLines={1}>{fmt(s.durationSeconds)}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
        )}
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // the tab bar floats over the content, so leave room for it
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 110 },
  segmentWrap: { paddingHorizontal: 22, paddingTop: 4, marginBottom: 14 },
  segment: { flexDirection: 'row', backgroundColor: colors.sand, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill },
  segmentItemOn: { backgroundColor: colors.white, ...shadow.card },
  segmentText: { fontFamily: fonts.sansMed, fontSize: 14, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.sansSemi, color: colors.ink },
  h1: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginBottom: 20 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.995 }] },

  feature: { borderRadius: radius.xl, overflow: 'hidden', minHeight: 220, justifyContent: 'flex-end', ...shadow.lift },
  // Art needs a veil under the type, weighted to the bottom where the text sits.
  featScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(35,26,17,0.42)' },
  featBody: { padding: 22 },
  featLabel: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 2, color: colors.gold },
  featTitle: { fontFamily: fonts.serif, fontSize: 30, color: colors.onDark, marginTop: 6 },
  featSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.onDarkMuted, marginTop: 2 },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  play: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },

  section: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginTop: 22, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine },
  chipPressed: { opacity: 0.7 },
  chipText: { fontFamily: fonts.sansMed, fontSize: 14, color: '#4A3D30' },

  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 14, minHeight: 44 },
  rowTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  bar: { height: 3, borderRadius: 3, backgroundColor: colors.sand, marginTop: 8, overflow: 'hidden' },
  barFill: { height: 3, borderRadius: 3, backgroundColor: colors.brass },

  // The three headline rows: bigger cover, three lines of metadata, so a story
  // arrives with some weight instead of as a 50pt swatch and a title.
  bigRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine,
    borderRadius: radius.lg, padding: 14, minHeight: 44, ...shadow.card,
  },
  coverPlay: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(230,207,148,0.94)', alignItems: 'center', justifyContent: 'center' },
  bigTitle: { fontFamily: fonts.serifSemi, fontSize: 22, color: colors.ink },
  bigSub: { fontFamily: fonts.serifItalic, fontSize: 15, color: colors.brass, marginTop: 1 },
  bigMeta: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginTop: 4 },

  railHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  railLabel: { marginBottom: 12 },
  railCount: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  // Negative margin pulls the rail out to the screen edge so the last card is
  // clipped; a flush edge reads as "that's all there is".
  railOuter: { marginHorizontal: -22 },
  rail: { paddingHorizontal: 22, gap: 12, paddingBottom: 4 },
  railCard: { width: 152, height: 196, borderRadius: radius.lg, overflow: 'hidden', justifyContent: 'flex-end', ...shadow.card },
  railScrim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(35,26,17,0.38)' },
  railBody: { padding: 14 },
  railTitle: { fontFamily: fonts.serifSemi, fontSize: 19, lineHeight: 23, color: colors.onDark },
  railMeta: { fontFamily: fonts.sans, fontSize: 11, color: colors.onDarkMuted, marginTop: 5 },
});
