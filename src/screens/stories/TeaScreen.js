import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl, Share } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import GraceDove from '../../components/GraceDove';
import TeaImage from '../../components/TeaImage';
import GIcon from '../../components/GIcon';
import { TeaService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

// Cards are art first. Only heat 3 earns a badge, so the grid stays calm and
// the eye lands on the hook rather than a row of competing pills.
function Badge({ tea, label, style }) {
  const text = label ?? (tea.heat === 3 ? 'Wild' : null);
  if (!text) return null;
  return (
    <View style={[styles.badge, tea.heat === 3 && styles.badgeWild, style]}>
      <Text style={[styles.badgeText, tea.heat === 3 && styles.badgeTextWild]}>{text}</Text>
    </View>
  );
}

// The hero is the share unit: a screenshot of it should stand on its own, which
// is why the hook is large serif, the reference is legible, and Grace is named.
function TodaysTea({ tea, onPress, onShare }) {
  if (!tea) return null;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Today's tea: ${tea.hook}`}>
      <TeaImage tea={tea} style={styles.hero}>
        <View style={styles.heroBody}>
          <Badge tea={tea} label="Today's tea" />
          {/* The title is the element that carries through to Tea Detail, so it
              is the largest thing on the card and the hook sits under it. */}
          <Text style={styles.heroTitle} numberOfLines={2}>{tea.cardTitle}</Text>
          <Text style={styles.heroHook} numberOfLines={2}>{tea.hook}</Text>
          <View style={styles.heroFoot}>
            <Text style={styles.heroRef}>{tea.ref}</Text>
            <View style={styles.heroActions}>
              <Pressable
                onPress={onShare}
                hitSlop={10}
                style={styles.heroShare}
                accessibilityRole="button"
                accessibilityLabel="Share today's tea"
              >
                <GIcon name="share" size={15} color={colors.brassDeep} />
              </Pressable>
              <View style={styles.heroPlay}>
                <GIcon name="play" size={14} color={colors.espresso} filled />
                <Text style={styles.heroPlayText}>1 min</Text>
              </View>
            </View>
          </View>
        </View>
      </TeaImage>
    </Pressable>
  );
}

function TeaTile({ item, onPress }) {
  return (
    <Pressable style={styles.tileWrap} onPress={onPress} accessibilityRole="button" accessibilityLabel={item.hook}>
      <TeaImage tea={item} style={styles.tile}>
        <View style={styles.tileBody}>
          <Badge tea={item} />
          <Text style={styles.tileTitle} numberOfLines={2}>{item.cardTitle}</Text>
          <Text style={styles.hook} numberOfLines={2}>{item.hook}</Text>
          <Text style={styles.ref}>{item.ref}</Text>
        </View>
      </TeaImage>
    </Pressable>
  );
}

export default function TeaScreen({ navigation }) {
  const [teas, setTeas] = useState([]);
  const [today, setToday] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(useCallback(() => {
    let alive = true;
    TeaService.getAll().then((t) => { if (alive) setTeas(t); });
    TeaService.getToday().then((t) => { if (alive) setToday(t); });
    return () => { alive = false; };
  }, []));

  const onRefresh = async () => {
    setRefreshing(true);
    const { today: t, all } = await TeaService.refresh();
    setToday(t);
    setTeas(all);
    setRefreshing(false);
  };

  // The title travels with the tap. Tea Detail can then paint it on its very
  // first frame instead of showing a spinner and popping a headline in once the
  // fetch lands, which is what made the card title look like it vanished.
  const open = (tea) => {
    if (!tea) return;
    Haptics.selectionAsync();
    navigation.navigate('TeaDetail', { id: tea.id, cardTitle: tea.cardTitle, ref: tea.ref });
  };

  // Sharing from the list, not only from the detail screen: the archive is where
  // she is browsing, so that is where the impulse to send one to a friend lands.
  const shareTea = async (tea) => {
    if (!tea) return;
    Haptics.selectionAsync();
    try {
      await Share.share({ message: `${tea.hook}\n\n${tea.ref} · Tea from Grace` });
    } catch { /* dismissed */ }
  };

  // The hero already carries today's tea, so the archive below skips it.
  const archive = teas.filter((t) => t.id !== today?.id);

  return (
    <FlatList
      data={archive}
      keyExtractor={(t) => t.id}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.brass} />}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.h1}>Tea</Text>
              <Text style={styles.sub}>A daily sermon, one minute at a time.</Text>
            </View>
            <GraceDove size={56} crop="head" motion="peek" />
          </View>
          <TodaysTea
            tea={today}
            onPress={() => open(today)}
            onShare={() => shareTea(today)}
          />
          <Text style={styles.archiveLabel}>THE ARCHIVE</Text>
        </View>
      }
      renderItem={({ item }) => <TeaTile item={item} onPress={() => open(item)} />}
    />
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, marginTop: 2 },
  // Cards run light now, so everything on them is set in ink and brass rather
  // than ivory. A hairline keeps a pale card from dissolving into a pale page.
  hero: { borderRadius: radius.xl, minHeight: 280, justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.cardBorder, ...shadow.card },
  heroBody: { padding: 22 },
  heroTitle: { fontFamily: fonts.serifSemi, fontSize: 32, lineHeight: 37, color: colors.ink, marginTop: 14 },
  heroHook: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.textMuted, marginTop: 8 },
  heroFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 18 },
  heroRef: { fontFamily: fonts.sansMed, fontSize: 13, letterSpacing: 0.5, color: colors.brassDeep },
  heroActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  heroShare: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,253,249,0.7)', borderWidth: 1, borderColor: colors.cardBorder },
  heroPlay: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 9 },
  heroPlayText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.espresso },
  archiveLabel: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1.5, color: colors.textMuted, marginTop: 26, marginBottom: 12 },
  column: { gap: 12 },
  tileWrap: { flex: 1, marginBottom: 12 },
  tile: { flex: 1, minHeight: 214, borderRadius: radius.lg, justifyContent: 'flex-end', borderWidth: 1, borderColor: colors.cardBorder, ...shadow.card },
  tileBody: { padding: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(255,253,249,0.78)', borderWidth: 1, borderColor: colors.cardBorder, marginBottom: 8 },
  badgeWild: { backgroundColor: colors.brassDeep, borderColor: colors.brassDeep },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 1, color: colors.brassDeep, textTransform: 'uppercase' },
  badgeTextWild: { color: colors.gold },
  tileTitle: { fontFamily: fonts.serifSemi, fontSize: 21, lineHeight: 25, color: colors.ink },
  hook: { fontFamily: fonts.sans, fontSize: 12.5, lineHeight: 17, color: colors.textMuted, marginTop: 6 },
  ref: { fontFamily: fonts.sansMed, fontSize: 11, letterSpacing: 0.6, color: colors.brassDeep, marginTop: 8 },
});
