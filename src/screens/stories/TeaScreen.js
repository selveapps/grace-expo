import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import GraceDove from '../../components/GraceDove';
import { TeaService } from '../../services';
import { colors, fonts, radius, shadow } from '../../theme';

// Alternating card gradients keyed by mood, so the grid reads as one warm system.
const GRAD = {
  dark: ['#3A2C22', '#2B2015'],
  light: ['#FBF1DA', '#EFE0C0'],
};
const FG = { dark: colors.onDark, light: colors.ink };
const FG_MUTED = { dark: colors.textFaintOnDark, light: colors.textMuted };

function TeaTile({ item, onPress }) {
  const fg = FG[item.mood];
  const muted = FG_MUTED[item.mood];
  return (
    <Pressable style={styles.tileWrap} onPress={onPress}>
      <LinearGradient colors={GRAD[item.mood]} style={styles.tile}>
        <View style={[styles.badge, item.mood === 'light' && styles.badgeLight]}>
          <Text style={[styles.badgeText, { color: item.mood === 'light' ? colors.brassDeep : colors.gold }]}>
            {item.badge}
          </Text>
        </View>
        <Text style={[styles.hook, { color: fg }]} numberOfLines={4}>{item.hook}</Text>
        <View style={styles.tileFoot}>
          <Text style={[styles.ref, { color: muted }]}>{item.ref}</Text>
          <Text style={[styles.likes, { color: muted }]}>♥ {item.likes || 0}</Text>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

export default function TeaScreen({ navigation }) {
  const [teas, setTeas] = useState([]);

  useFocusEffect(useCallback(() => {
    let alive = true;
    TeaService.getAll().then((t) => { if (alive) setTeas(t); });
    return () => { alive = false; };
  }, []));

  const open = (id) => { Haptics.selectionAsync(); navigation.navigate('TeaDetail', { id }); };

  return (
    <FlatList
      data={teas}
      keyExtractor={(t) => t.id}
      numColumns={2}
      columnWrapperStyle={styles.column}
      contentContainerStyle={styles.body}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.h1}>Tea</Text>
            <Text style={styles.sub}>Bible takes worth sharing.</Text>
          </View>
          <GraceDove size={56} crop="head" motion="peek" />
        </View>
      }
      renderItem={({ item }) => <TeaTile item={item} onPress={() => open(item.id)} />}
    />
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 30 },
  header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginTop: 2 },
  column: { gap: 12 },
  tileWrap: { flex: 1, marginBottom: 12 },
  tile: { flex: 1, minHeight: 190, borderRadius: radius.lg, padding: 16, justifyContent: 'space-between', ...shadow.card },
  badge: { alignSelf: 'flex-start', backgroundColor: 'rgba(230,207,148,0.18)', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 },
  badgeLight: { backgroundColor: 'rgba(181,138,63,0.14)' },
  badgeText: { fontFamily: fonts.sansSemi, fontSize: 10, letterSpacing: 0.5 },
  hook: { fontFamily: fonts.serifSemi, fontSize: 19, lineHeight: 24, marginTop: 12 },
  tileFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
  ref: { fontFamily: fonts.sans, fontSize: 11, letterSpacing: 0.5 },
  likes: { fontFamily: fonts.sansMed, fontSize: 12 },
});
