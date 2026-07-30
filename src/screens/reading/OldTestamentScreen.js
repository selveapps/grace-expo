import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import Screen from '../../components/Screen';
import { useProfile } from '../../state/profile';
import Icon from '../../components/Icon';
import BookAccordion from '../../components/BookAccordion';
import { OT_GROUPS } from '../../data/content';
import { colors, fonts, radius } from '../../theme';
import { readingTheme } from '../../readingTheme';

export default function OldTestamentScreen({ navigation }) {
  const { profile } = useProfile();
  const RT = readingTheme(profile);
  return (
    <Screen bg={RT.bg} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}><Text style={[styles.back, { color: RT.sub }]}>‹ Reading</Text></Pressable>
        <Text style={[styles.h1, { color: RT.ink }]}>Old Testament</Text>
        <View style={styles.search}><Icon name="search" size={18} color={colors.textFaint} /><Text style={styles.searchText}>Filter books</Text></View>
      </View>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <BookAccordion groups={OT_GROUPS} onSelectBook={(b) => navigation.navigate('Book', { book: b })} />
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 22, paddingTop: 4, paddingBottom: 8 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 8 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.pill, paddingVertical: 10, paddingHorizontal: 16, marginTop: 12 },
  searchText: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint },
  body: { paddingHorizontal: 22, paddingBottom: 110, paddingTop: 4 },
  group: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass, marginBottom: 8 },
  books: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  book: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.sm, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine },
  bookText: { fontFamily: fonts.sans, fontSize: 14, color: '#4A3D30' },
});
