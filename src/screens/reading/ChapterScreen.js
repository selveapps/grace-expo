import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, ActivityIndicator, Modal, Share } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GIcon from '../../components/GIcon';
import { getChapter } from '../../api/bible';
import { ReadingService } from '../../services/ReadingService';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

const FONT_LABEL = { 0.9: 'S', 1: 'M', 1.15: 'L', 1.3: 'XL' };

let Clipboard = null;
try { Clipboard = require('expo-clipboard'); } catch { Clipboard = null; }

// Verse action sheet — Save / Highlight / Copy / Share / Reflect / Listen.
function ActionSheet({ verse, refStr, saved, highlighted, onClose, onAction }) {
  const ACTIONS = [
    { key: 'save', label: saved ? 'Saved' : 'Save', icon: 'bookmark', filled: saved },
    { key: 'highlight', label: highlighted ? 'Unhighlight' : 'Highlight', icon: 'highlight' },
    { key: 'copy', label: 'Copy', icon: 'copy' },
    { key: 'share', label: 'Share', icon: 'share' },
    { key: 'reflect', label: 'Reflect', icon: 'pen' },
    { key: 'listen', label: 'Listen from here', icon: 'play', filled: true },
  ];
  return (
    <Modal visible={!!verse} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose} />
      <View style={styles.sheet}>
        <View style={styles.grab} />
        <Text style={styles.sheetRef}>{refStr}</Text>
        {verse ? <Text style={styles.sheetVerse} numberOfLines={3}>“{verse.t}”</Text> : null}
        <View style={styles.grid}>
          {ACTIONS.map((a) => (
            <Pressable key={a.key} style={styles.action} onPress={() => onAction(a.key)} accessibilityRole="button" accessibilityLabel={a.label}>
              <View style={[styles.actionIcon, (a.key === 'save' && saved) || (a.key === 'highlight' && highlighted) ? styles.actionIconOn : null]}>
                <GIcon name={a.icon} size={20} color={colors.brassDeep} filled={a.filled} />
              </View>
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </Modal>
  );
}

export default function ChapterScreen({ route, navigation }) {
  const book = route.params?.book || 'Psalms';
  const chapter = route.params?.chapter || 23;
  // Set when we arrive from a theme list or a search hit, which point at one
  // verse rather than the chapter. Without this the reader opens at verse 1 and
  // she has to hunt for the line she just tapped.
  const focusVerse = route.params?.verse ?? null;
  const { saveVerse, removeVerse, isSaved, addReflection, profile, setProfile } = useProfile();

  // Reader theme + font size from preferences
  const theme = profile.readingTheme || 'sepia';
  const THEME = theme === 'light'
    ? { bg: '#FFFDF9', line: colors.sandLine, ink: colors.ink, sub: colors.textFaint, bar: '#8A7C68' }
    : theme === 'night'
    ? { bg: '#241B12', line: '#3A2C1F', ink: '#F0E7D6', sub: '#9A8C76', bar: '#B9AC9A' }
    : { bg: colors.sepia, line: colors.sepiaLine, ink: colors.ink, sub: colors.textFaint, bar: '#8A7C68' };
  const fontScale = profile.fontScale || 1;
  const fs = 21 * fontScale;

  const cycleTheme = () => {
    Haptics.selectionAsync();
    const order = ['light', 'sepia', 'night'];
    setProfile((p) => ({ ...p, readingTheme: order[(order.indexOf(theme) + 1) % order.length] }));
  };
  const cycleFont = () => {
    Haptics.selectionAsync();
    const order = [0.9, 1, 1.15, 1.3];
    const i = order.indexOf(fontScale);
    setProfile((p) => ({ ...p, fontScale: order[(i < 0 ? 1 : i + 1) % order.length] }));
  };
  const listenFromTop = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    if (verses?.length) openSheet(verses[0]);
  };

  const [verses, setVerses] = useState(null);
  const [online, setOnline] = useState(true);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(null); // verse under the action sheet
  const [highlights, setHighlights] = useState({}); // ref -> true (session)

  const scrollRef = useRef(null);
  const focusY = useRef(null);

  // Scroll to the verse we were sent to, once the chapter has laid out. onLayout
  // for that row has run by the time `verses` is on screen, so the offset is
  // real rather than estimated from a row height.
  useEffect(() => {
    if (!focusVerse || !verses?.length) return;
    const t = setTimeout(() => {
      if (focusY.current == null) return;
      scrollRef.current?.scrollTo({ y: Math.max(0, focusY.current - 80), animated: true });
    }, 250);
    return () => clearTimeout(t);
  }, [focusVerse, verses]);

  const load = React.useCallback(() => {
    setVerses(null); setFailed(false);
    getChapter(book, chapter).then((data) => {
      if (data.verses) { setVerses(data.verses); setOnline(data.online); }
      else { setFailed(true); }
    });
  }, [book, chapter]);

  useEffect(() => {
    let alive = true;
    setVerses(null); setFailed(false);
    getChapter(book, chapter).then((data) => {
      if (!alive) return;
      if (data.verses) {
        setVerses(data.verses);
        setOnline(data.online);
        ReadingService.updateReadingProgress(book, chapter, 1).catch(() => {});
      } else { setFailed(true); }
    });
    return () => { alive = false; };
  }, [book, chapter]);

  const refOf = (v) => `${book} ${chapter}:${v.n}`;

  const openSheet = (v) => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setActive(v); };

  const handle = async (key) => {
    const v = active;
    if (!v) return;
    const refStr = refOf(v);
    if (key === 'save') {
      isSaved(refStr) ? removeVerse(refStr) : saveVerse({ ref: refStr, text: v.t });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else if (key === 'highlight') {
      setHighlights((h) => ({ ...h, [refStr]: !h[refStr] }));
      Haptics.selectionAsync();
    } else if (key === 'copy') {
      if (Clipboard) await Clipboard.setStringAsync(`"${v.t}" · ${refStr}`);
      Haptics.selectionAsync();
    } else if (key === 'share') {
      setActive(null);
      try { await Share.share({ message: `"${v.t}" · ${refStr}\n\nvia Grace` }); } catch {}
      return;
    } else if (key === 'reflect') {
      addReflection({ word: 'Reflection', note: `On ${refStr}: “${v.t}”`, ref: refStr });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (key === 'listen') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    }
    setActive(null);
  };

  return (
    <Screen bg={THEME.bg} edges={['top']} style={{ paddingHorizontal: 0 }}>
      <View style={[styles.bar, { borderBottomColor: THEME.line }]}>
        <Pressable onPress={() => navigation.goBack()}><Text style={[styles.barIcon, { color: THEME.bar }]}>‹</Text></Pressable>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.barTitle, { color: THEME.ink }]}>{book} {chapter}</Text>
          <Text style={[styles.barSub, { color: THEME.sub }]}>KJV{online ? '' : ' · offline'}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Pressable
            onPress={cycleFont}
            hitSlop={10}
            style={styles.barBtn}
            accessibilityRole="button"
            accessibilityLabel={`Text size ${FONT_LABEL[fontScale] ?? 'medium'}. Tap to change.`}
          >
            <Text style={[styles.barIcon, { color: THEME.bar }]}>Aa</Text>
            <Text style={[styles.barBtnTag, { color: THEME.sub }]}>{FONT_LABEL[fontScale] ?? 'M'}</Text>
          </Pressable>
          <Pressable
            onPress={cycleTheme}
            hitSlop={10}
            style={styles.barBtn}
            accessibilityRole="button"
            accessibilityLabel={`Reading theme ${theme}. Tap to change.`}
          >
            <GIcon name={theme === 'night' ? 'sun' : 'moon'} size={20} color={THEME.bar} />
          </Pressable>
          <Pressable onPress={listenFromTop} hitSlop={10} style={styles.barBtn} accessibilityRole="button" accessibilityLabel="Listen to this chapter">
            <GIcon name="play" size={20} color={colors.brass} filled />
          </Pressable>
        </View>
      </View>

      {verses ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.body}
          showsVerticalScrollIndicator={false}
        >
          {verses.map((v) => {
            const refStr = refOf(v);
            const hl = highlights[refStr];
            const focused = focusVerse === v.n;
            return (
              <Pressable
                key={v.n}
                onLongPress={() => openSheet(v)}
                delayLongPress={220}
                // Measure where this verse sits so we can scroll to it once the
                // chapter has laid out.
                onLayout={focused ? (e) => { focusY.current = e.nativeEvent.layout.y; } : undefined}
              >
                <Text style={[styles.verse, { fontSize: fs, lineHeight: fs * 1.62, color: THEME.ink }, hl && styles.verseHl, focused && styles.verseFocus]}>
                  <Text style={styles.vnum}>{v.n} </Text>{v.t}
                  {isSaved(refStr) ? <Text style={styles.mark}>  ·</Text> : null}
                </Text>
              </Pressable>
            );
          })}
          <View style={styles.bloom}><GIcon name="sparkle" size={18} color={colors.brass} filled /></View>
          <Text style={styles.hint}>Press & hold a verse for options.</Text>
        </ScrollView>
      ) : failed ? (
        <View style={styles.loading}>
          <Text style={[styles.failTitle, { color: THEME.ink }]}>I couldn't load this chapter.</Text>
          <Text style={[styles.failSub, { color: THEME.sub }]}>Check your connection. Your saved verses are still here.</Text>
          <Pressable onPress={load} style={styles.retry}><Text style={styles.retryText}>Try again</Text></Pressable>
        </View>
      ) : (
        <View style={styles.loading}><ActivityIndicator color={colors.brass} /></View>
      )}

      <View style={[styles.nav, { borderTopColor: THEME.line }]}>
        <Pressable disabled={chapter <= 1} onPress={() => { Haptics.selectionAsync(); navigation.replace('Chapter', { book, chapter: chapter - 1 }); }}>
          <Text style={[styles.navText, chapter <= 1 && { opacity: 0.3 }]}>‹ {book} {chapter - 1}</Text>
        </Pressable>
        <Pressable onPress={() => { Haptics.selectionAsync(); navigation.replace('Chapter', { book, chapter: chapter + 1 }); }}>
          <Text style={styles.navText}>{book} {chapter + 1} ›</Text>
        </Pressable>
      </View>

      <ActionSheet
        verse={active}
        refStr={active ? refOf(active) : ''}
        saved={active ? isSaved(refOf(active)) : false}
        highlighted={active ? !!highlights[refOf(active)] : false}
        onClose={() => setActive(null)}
        onAction={handle}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.sepiaLine },
  barIcon: { fontFamily: fonts.sansMed, fontSize: 18, color: '#8A7C68' },
  barTitle: { fontFamily: fonts.serifSemi, fontSize: 20, color: colors.ink },
  barSub: { fontFamily: fonts.sans, fontSize: 11, color: colors.textFaint },
  body: { paddingHorizontal: 26, paddingTop: 22, paddingBottom: 20 },
  verse: { fontFamily: fonts.serif, fontSize: 21, lineHeight: 34, color: colors.ink, marginBottom: 14 },
  verseHl: { backgroundColor: 'rgba(230,207,148,0.4)', borderRadius: 6 },
  // Lighter than a user highlight: this marks "here is the verse you tapped",
  // not "you saved this".
  verseFocus: { backgroundColor: 'rgba(230,207,148,0.22)', borderRadius: 6 },
  vnum: { fontFamily: fonts.sansBold, fontSize: 11, color: colors.brass },
  mark: { color: colors.brass },
  bloom: { alignItems: 'center', marginVertical: 12 },
  barBtn: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 3 },
  barBtnTag: { fontFamily: fonts.sansSemi, fontSize: 10, marginTop: 4 },
  hint: { textAlign: 'center', fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginBottom: 8 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  failTitle: { fontFamily: fonts.serif, fontSize: 26, textAlign: 'center' },
  failSub: { fontFamily: fonts.sans, fontSize: 14, textAlign: 'center', marginTop: 10, lineHeight: 20 },
  retry: { marginTop: 18, backgroundColor: colors.espresso, borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 26 },
  retryText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onDark },
  nav: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 14, borderTopWidth: 1, borderTopColor: colors.sepiaLine },
  navText: { fontFamily: fonts.sans, fontSize: 14, color: '#8A7C68' },
  // action sheet
  scrim: { flex: 1, backgroundColor: 'rgba(43,32,21,0.35)' },
  sheet: { backgroundColor: colors.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 22, paddingTop: 12, paddingBottom: 36 },
  grab: { width: 42, height: 5, borderRadius: 5, backgroundColor: colors.cardBorder, alignSelf: 'center', marginBottom: 16 },
  sheetRef: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint },
  sheetVerse: { fontFamily: fonts.serif, fontSize: 20, color: colors.ink, lineHeight: 28, marginTop: 6, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  action: { width: '33.33%', alignItems: 'center', paddingVertical: 14, gap: 8 },
  actionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center' },
  actionIconOn: { backgroundColor: 'rgba(230,207,148,0.35)' },
  actionGlyph: { fontSize: 18, color: colors.brass },
  actionLabel: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
});
