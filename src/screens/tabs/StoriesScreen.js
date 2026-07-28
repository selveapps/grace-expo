import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import Waveform from '../../components/Waveform';
import PlayIcon from '../../components/PlayIcon';
import TeaScreen from '../stories/TeaScreen';
import { StoryService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

function fmt(sec) { const m = Math.floor(sec / 60); return `${m} min`; }

const TABS = ['Stories', 'Tea'];

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

  const open = (id) => navigation.navigate('StoryDetail', { id });

  if (tab === 'Tea') {
    return (
      <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
        <View style={styles.segmentWrap}><Segmented value={tab} onChange={setTab} /></View>
        <TeaScreen navigation={navigation} />
      </Screen>
    );
  }

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.segmentWrap}><Segmented value={tab} onChange={setTab} /></View>
        <Text style={styles.h1}>Stories</Text>
        <Text style={styles.sub}>Real people. Real struggle. Real faith.</Text>

        {featured && (
          <Pressable style={styles.feature} onPress={() => open(featured.id)}>
            <Text style={styles.featLabel}>FEATURED</Text>
            <Text style={styles.featTitle}>{featured.title}</Text>
            <Text style={styles.featSub}>{featured.subtitle} · {featured.parts} parts</Text>
            <View style={styles.featRow}>
              <View style={styles.play}><PlayIcon size={18} color={colors.espresso} /></View>
              <Waveform width={200} color={colors.gold} height={30} />
            </View>
          </Pressable>
        )}

        <Text style={styles.section}>COLLECTIONS</Text>
        <View style={styles.chips}>
          {collections.map((c) => (
            <View key={c.id} style={[styles.chip, { backgroundColor: c.tint }]}><Text style={styles.chipText}>{c.name}</Text></View>
          ))}
        </View>

        {cont.length > 0 && (
          <>
            <Text style={styles.section}>CONTINUE LISTENING</Text>
            <View style={{ gap: 12 }}>
              {cont.map((s) => (
                <Pressable key={s.id} style={styles.row} onPress={() => open(s.id)}>
                  <View style={styles.rowThumb}><PlayIcon size={16} color={colors.brass} /></View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle}>{s.title}</Text>
                    <Text style={styles.rowSub}>{s.subtitle} · {Math.round((s.progress.seconds / s.durationSeconds) * 100)}%</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        <Text style={styles.section}>ALL STORIES</Text>
        <View style={{ gap: 12 }}>
          {all.map((s) => (
            <Pressable key={s.id} style={styles.row} onPress={() => open(s.id)}>
              <View style={[styles.rowThumb, { backgroundColor: s.coverTint }]}><PlayIcon size={16} color={colors.gold} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle}>{s.title}</Text>
                <Text style={styles.rowSub}>{s.scriptureRange} · {fmt(s.durationSeconds)}{s.isPremium ? ' · Plus' : ''}</Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 30 },
  segmentWrap: { paddingHorizontal: 22, paddingTop: 4, marginBottom: 14 },
  segment: { flexDirection: 'row', backgroundColor: colors.sand, borderRadius: radius.pill, padding: 4 },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: radius.pill },
  segmentItemOn: { backgroundColor: colors.white, ...shadow.card },
  segmentText: { fontFamily: fonts.sansMed, fontSize: 14, color: colors.textMuted },
  segmentTextOn: { fontFamily: fonts.sansSemi, color: colors.ink },
  h1: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginBottom: 20 },
  feature: { backgroundColor: colors.espressoSoft, borderRadius: radius.xl, padding: 22, ...shadow.lift },
  featLabel: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 2, color: colors.gold },
  featTitle: { fontFamily: fonts.serif, fontSize: 28, color: colors.onDark, marginTop: 6 },
  featSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  featRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16 },
  play: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  section: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginTop: 22, marginBottom: 12 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.sandLine },
  chipText: { fontFamily: fonts.sansMed, fontSize: 14, color: '#4A3D30' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 14 },
  rowThumb: { width: 50, height: 50, borderRadius: 14, backgroundColor: '#F1E6CF', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
});
