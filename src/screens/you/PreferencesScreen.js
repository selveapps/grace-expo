import React from 'react';
import { View, Text, StyleSheet, Pressable, Switch, ScrollView } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

const THEMES = [
  { key: 'light', label: 'Light', bg: '#FFFDF9' },
  { key: 'sepia', label: 'Sepia', bg: '#F3E9D6' },
  { key: 'night', label: 'Night', bg: '#2B2015' },
];
const FONTS = [
  { key: 0.9, label: 'S' },
  { key: 1, label: 'M' },
  { key: 1.15, label: 'L' },
  { key: 1.3, label: 'XL' },
];
const SPEEDS = [0.75, 1, 1.25, 1.5];

function Segmented({ options, value, onChange, render }) {
  return (
    <View style={styles.seg}>
      {options.map((o) => {
        const key = o.key ?? o;
        const on = value === key;
        return (
          <Pressable key={String(key)} onPress={() => { Haptics.selectionAsync(); onChange(key); }} style={[styles.segItem, on && styles.segOn]}>
            {render ? render(o, on) : <Text style={[styles.segText, on && styles.segTextOn]}>{o.label ?? o}</Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

export default function PreferencesScreen({ navigation }) {
  const { profile, setProfile } = useProfile();
  const set = (patch) => setProfile((p) => ({ ...p, ...patch }));

  const sampleSize = 20 * (profile.fontScale || 1);
  const sampleBg = THEMES.find((t) => t.key === profile.readingTheme)?.bg || '#F3E9D6';
  const sampleInk = profile.readingTheme === 'night' ? '#F3E9D6' : colors.ink;

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ Settings</Text></Pressable>
        <Text style={styles.h1}>Preferences</Text>

        {/* Live reader preview */}
        <View style={[styles.preview, { backgroundColor: sampleBg }]}>
          <Text style={[styles.previewVerse, { fontSize: sampleSize, lineHeight: sampleSize * 1.5, color: sampleInk }]}>
            <Text style={{ fontFamily: fonts.sansBold, fontSize: sampleSize * 0.55, color: colors.brass }}>1 </Text>
            The Lord is my shepherd; I shall not want.
          </Text>
        </View>

        <Text style={styles.group}>READING THEME</Text>
        <Segmented options={THEMES} value={profile.readingTheme} onChange={(k) => set({ readingTheme: k })}
          render={(o, on) => (
            <View style={{ alignItems: 'center', gap: 6 }}>
              <View style={[styles.swatch, { backgroundColor: o.bg }, on && { borderColor: colors.brass }]} />
              <Text style={[styles.segText, on && styles.segTextOn]}>{o.label}</Text>
            </View>
          )}
        />

        <Text style={styles.group}>FONT SIZE</Text>
        <Segmented options={FONTS} value={profile.fontScale} onChange={(k) => set({ fontScale: k })} />

        <Text style={styles.group}>AUDIO SPEED</Text>
        <Segmented options={SPEEDS.map((s) => ({ key: s, label: `${s}×` }))} value={profile.audioSpeed} onChange={(k) => set({ audioSpeed: k })} />

        <Text style={styles.group}>MOTION</Text>
        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.toggleTitle}>Reduced motion</Text>
            <Text style={styles.toggleSub}>Grace stills; transitions become simple fades.</Text>
          </View>
          <Switch value={!!profile.reducedMotion} onValueChange={(v) => { Haptics.selectionAsync(); set({ reducedMotion: v }); }} trackColor={{ true: colors.brass, false: colors.sand }} thumbColor={colors.white} />
        </View>

        <Text style={styles.note}>These apply across the app and are saved to this device.</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6, marginBottom: 18 },
  preview: { borderRadius: radius.lg, borderWidth: 1, borderColor: colors.sandLine, padding: 22, marginBottom: 22 },
  previewVerse: { fontFamily: fonts.serif },
  group: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 10 },
  seg: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sand },
  segOn: { backgroundColor: 'rgba(230,207,148,0.2)', borderColor: colors.brass },
  segText: { fontFamily: fonts.sansMed, fontSize: 15, color: colors.textMuted },
  segTextOn: { fontFamily: fonts.sansSemi, color: colors.brassDeep },
  swatch: { width: 34, height: 24, borderRadius: 7, borderWidth: 2, borderColor: 'transparent' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 16, gap: 12 },
  toggleTitle: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  toggleSub: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 2 },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 18, marginBottom: 30, lineHeight: 19 },
});
