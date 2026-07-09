import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, fonts, radius } from '../theme';

// Collapsible accordion of Bible book groups. One group open at a time.
export default function BookAccordion({ groups, onSelectBook }) {
  const [open, setOpen] = useState(0);
  const toggle = (i) => {
    Haptics.selectionAsync();
    setOpen((cur) => (cur === i ? -1 : i));
  };
  return (
    <View>
      {groups.map((g, i) => {
        const isOpen = i === open;
        return (
          <View key={g.group} style={styles.card}>
            <Pressable onPress={() => toggle(i)} style={styles.headerRow}>
              <Text style={styles.group}>{g.group}</Text>
              <Text style={styles.count}>{g.books.length} {g.books.length === 1 ? 'book' : 'books'}</Text>
              <Text style={[styles.chev, isOpen && styles.chevOpen]}>{isOpen ? '⌄' : '›'}</Text>
            </Pressable>
            {isOpen && (
              <View style={styles.books}>
                {g.books.map((b) => (
                  <Pressable key={b} style={styles.book} onPress={() => onSelectBook(b)}>
                    <Text style={styles.bookText}>{b}</Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, overflow: 'hidden' },
  headerRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 16 },
  group: { flex: 1, fontFamily: fonts.sansSemi, fontSize: 15, color: '#4A3D30' },
  count: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginRight: 12 },
  chev: { fontFamily: fonts.sans, fontSize: 18, color: colors.brass },
  chevOpen: { fontSize: 20 },
  books: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, paddingBottom: 16 },
  book: { paddingVertical: 9, paddingHorizontal: 14, borderRadius: radius.sm, backgroundColor: colors.ivory, borderWidth: 1, borderColor: colors.sandLine },
  bookText: { fontFamily: fonts.sans, fontSize: 14, color: '#4A3D30' },
});
