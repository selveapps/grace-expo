import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import GraceDove from '../../components/GraceDove';
import TeaImage from '../../components/TeaImage';
import GIcon from '../../components/GIcon';
import { TeaService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

// heat drives the badge treatment: 1 warm, 2 spicy, 3 wild (deeper brass pill).
const HEAT_PILL = {
  1: 'rgba(230,207,148,0.20)',
  2: 'rgba(230,207,148,0.28)',
  3: 'rgba(143,106,44,0.72)',
};

function Badge({ tea, label, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: HEAT_PILL[tea.heat] || HEAT_PILL[1] }, style]}>
      <Text style={styles.badgeText}>{label ?? (tea.heat === 3 ? 'Wild' : tea.badge)}</Text>
    </View>
  );
}

function TodaysTea({ tea, onPress }) {
  if (!tea) return null;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Today's tea: ${tea.hook}`}>
      <TeaImage tea={tea} style={styles.hero} scrim="rgba(43,32,21,0.58)">
        <View style={styles.heroBody}>
          <Badge tea={tea} label="Today's tea" />
          <Text style={styles.heroHook} numberOfLines={3}>{tea.hook}</Text>
          <View style={styles.heroFoot}>
            <Text style={styles.heroRef}>{tea.ref}</Text>
            <View style={styles.heroPlay}>
              <GIcon name="play" size={14} color={colors.espresso} filled />
              <Text style={styles.heroPlayText}>1 min</Text>
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
          <Text style={styles.hook} numberOfLines={4}>{item.hook}</Text>
          <View style={styles.tileFoot}>
            <Text style={styles.ref}>{item.ref}</Text>
            <View style={styles.likeRow}>
              <GIcon name="heart" size={13} color={colors.textFaintOnDark} />
              <Text style={styles.likes}>{item.likes || 0}</Text>
            </View>
          </View>
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

  const open = (id) => { Haptics.selectionAsync(); navigation.navigate('TeaDetail', { id }); };

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
          <TodaysTea tea={today} onPress={() => today && open(today.id)} />
          <Text style={styles.archiveLabel}>THE ARCHIVE</Text>
        </View>
      }
      renderItem={({ item }) => <TeaTile item={item} onPress={() => open(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 110 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 24, color: colors.textMuted, marginTop: 2 },
  hero: { borderRadius: radius.xl, minHeight: 260, justifyContent: 'flex-end', ...shadow.card },
  heroBody: { padding: 22 },
  heroHook: { fontFamily: fonts.serifSemi, fontSize: 28, lineHeight: 34, color: colors.onDark, marginTop: 14 },
  heroFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  heroRef: { fontFamily: fonts.sans, fontSize: 13, letterSpacing: 0.5, color: colors.textFaintOnDark },
  heroPlay: { flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 8 },
  heroPlayText: { fontFamily: fonts.sansSemi, fontSize: 13, color: colors.espresso },
  archiveLabel: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1.5, color: colors.textMuted, marginTop: 26, marginBottom: 12 },
  column: { gap: 12 },
  tileWrap: { flex: 1, marginBottom: 12 },
  tile: { flex: 1, minHeight: 200, borderRadius: radius.lg, justifyContent: 'flex-end', ...shadow.card },
  tileBody: { padding: 16 },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 0.5, color: colors.gold },
  hook: { fontFamily: fonts.serifSemi, fontSize: 19, lineHeight: 24, color: colors.onDark, marginTop: 12 },
  tileFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  ref: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 0.5, color: colors.textFaintOnDark },
  likeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  likes: { fontFamily: fonts.sansMed, fontSize: 12, color: colors.textFaintOnDark },
});
