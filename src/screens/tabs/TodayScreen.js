import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import VerseCard from '../../components/VerseCard';
import GIcon from '../../components/GIcon';
import GraceDove from '../../components/GraceDove';
import { useProfile } from '../../state/profile';
import { StoryService, TodayService } from '../../services';
import { colors, fonts, radius } from '../../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

const mins = (sec) => `${Math.max(1, Math.round((sec || 0) / 60))} min`;

export default function TodayScreen({ navigation }) {
  const { profile } = useProfile();
  const name = profile.name || 'friend';
  const word = (profile.reflectionWord) || (profile.carrying && profile.carrying[0]) || 'Trust';

  const [today, setToday] = useState(null);
  const [cont, setCont] = useState(null);
  // Fetched independently of the aggregate payload so the listen card has
  // something real to point at even while /today is slow or unavailable.
  const [featured, setFeatured] = useState(null);

  // Prefer the verse the user kept in onboarding; otherwise today's live verse.
  const kept = profile.savedVerses && profile.savedVerses[0];

  // Refetch on focus so Continue reflects progress made in the player. The
  // payload is cached in TodayService (and primed from Confirmation), so this is
  // cheap and usually resolves in the same frame.
  useFocusEffect(useCallback(() => {
    let alive = true;
    TodayService.getToday(profile).then((t) => { if (alive) setToday(t); }).catch(() => {});
    StoryService.getContinue().then((c) => { if (alive) setCont(c?.[0] ?? null); }).catch(() => {});
    StoryService.getFeatured().then((f) => { if (alive) setFeatured(f); }).catch(() => {});
    return () => { alive = false; };
  }, [profile.name]));

  const daily = kept || today?.dailyVerse || null;
  // What the primary card actually plays. Previously this card was a static
  // View with hardcoded copy ("6 min · Psalm 23") and no handler at all.
  // The day's pick, falling back to featured so the card is never empty.
  const listen = today?.recommendedStory || featured || null;
  const reading = today?.recommendedReading || null;

  const openStory = (id) => {
    if (!id) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    // autoplay: these are play affordances, so they should start playing rather
    // than land on a paused player she has to tap again.
    navigation.navigate('Stories', { screen: 'Player', params: { id, autoplay: true } });
  };

  const openReading = () => {
    if (!reading?.book) return;
    Haptics.selectionAsync();
    navigation.navigate('Reading', {
      screen: 'Chapter',
      params: { book: reading.book, chapter: reading.chapter || 1 },
    });
  };

  const contPct = cont && cont.durationSeconds
    ? Math.min(99, Math.max(1, Math.round((cont.progress.seconds / cont.durationSeconds) * 100)))
    : null;

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 0 }} ambient>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.headRow}>
          <View>
            <Text style={styles.greeting}>{greeting()},{'\n'}{name}.</Text>
            <Text style={styles.kept}>I kept our place.</Text>
          </View>
          <GraceDove size={72} crop="head" motion="peek" />
        </View>

        <VerseCard
          size="compact"
          kicker={kept ? 'Your verse' : "Today's verse"}
          verse={daily ? daily.text : '…'}
          reference={daily ? String(daily.ref).toUpperCase() : ''}
          style={styles.verseSpacing}
        />

        {/* Today's listen — a real story with a real duration, opening the player. */}
        <Pressable
          onPress={() => openStory(listen?.id)}
          disabled={!listen}
          style={({ pressed }) => [styles.listen, pressed && styles.pressed, !listen && styles.waiting]}
          accessibilityRole="button"
          accessibilityLabel={listen ? `Listen to ${listen.title}, ${mins(listen.durationSeconds)}` : 'Preparing today’s listen'}
          testID="today-listen"
        >
          <View style={styles.listenPlay}><GIcon name="play" size={17} color={colors.espresso} filled /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.listenKicker}>TODAY'S LISTEN</Text>
            <Text style={styles.listenTitle} numberOfLines={1}>{listen ? listen.title : 'Preparing…'}</Text>
            <Text style={styles.listenSub} numberOfLines={1}>
              {listen ? `${mins(listen.durationSeconds)} · ${listen.scriptureRange}` : 'One moment'}
            </Text>
          </View>
        </Pressable>

        {/* Only when something is genuinely in progress, and not when the listen
            card above is already pointing at that same story. */}
        {cont && contPct != null && cont.id !== listen?.id && (
          <Pressable
            onPress={() => openStory(cont.id)}
            style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Continue ${cont.title}, ${contPct} percent`}
            testID="today-continue"
          >
            <View style={styles.rowThumb}><GIcon name="play" size={14} color={colors.brass} filled /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>Continue · {cont.title}</Text>
              <Text style={styles.rowSub} numberOfLines={1}>{cont.subtitle}</Text>
            </View>
            <Text style={styles.pct}>{contPct}%</Text>
          </Pressable>
        )}

        {reading?.book && (
          <Pressable
            onPress={openReading}
            style={({ pressed }) => [styles.rowCard, pressed && styles.pressed]}
            accessibilityRole="button"
            accessibilityLabel={`Read ${reading.book} ${reading.chapter || 1}`}
            testID="today-reading"
          >
            <View style={styles.rowThumb}><GIcon name="bookmark" size={16} color={colors.brass} /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle} numberOfLines={1}>Read · {reading.book} {reading.chapter || 1}</Text>
              <Text style={styles.rowSub}>Pick up where you left off</Text>
            </View>
            <GIcon name="chevronRight" size={16} color={colors.textFaint} />
          </Pressable>
        )}

        <View style={styles.carry}>
          <Text style={styles.carryLabel}>Carrying today</Text>
          <Text style={styles.carryWord}>{word}</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  // the tab bar floats over the content, so leave room for it
  body: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 110 },
  headRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, lineHeight: 38 },
  kept: { fontFamily: fonts.serifItalic, fontSize: 18, color: colors.brass, marginTop: 4 },
  verseSpacing: { marginTop: 22 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.995 }] },
  waiting: { opacity: 0.7 },
  listen: { marginTop: 16, backgroundColor: colors.espressoSoft, borderRadius: radius.lg, padding: 20, flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: 44 },
  listenPlay: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center' },
  listenKicker: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1.4, color: colors.gold, marginBottom: 3 },
  listenTitle: { fontFamily: fonts.sansBold, fontSize: 17, color: colors.onDark },
  listenSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaintOnDark },
  rowCard: { marginTop: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 },
  rowThumb: { width: 42, height: 42, borderRadius: 12, backgroundColor: '#F1E6CF', alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.ink },
  rowSub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint },
  pct: { fontFamily: fonts.sansSemi, fontSize: 12, color: colors.brass },
  carry: { marginTop: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(181,138,63,0.08)', borderWidth: 1, borderColor: '#E6D9BF', borderRadius: radius.md, padding: 16 },
  carryLabel: { flex: 1, fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  carryWord: { fontFamily: fonts.serifSemi, fontSize: 24, color: colors.brass },
});
