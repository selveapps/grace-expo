import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Switch } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { NotificationService } from '../../services';
import { colors, fonts, radius } from '../../theme';

const TYPES = [
  { key: 'morning', label: 'Morning' },
  { key: 'evening', label: 'Evening' },
  { key: 'both', label: 'Both' },
];

export default function RemindersScreen({ navigation }) {
  const [pref, setPref] = useState({ type: 'morning', morningTime: '07:00', eveningTime: '21:00', enabled: false, preview: null });
  const [perm, setPerm] = useState('undetermined');
  const [loadingPreview, setLoadingPreview] = useState(false);

  useEffect(() => {
    NotificationService.getPreference().then((p) => {
      setPref(p);
      if (p.enabled && p.type !== 'off') refreshPreview({ ...p, type: p.type });
    });
    NotificationService.getPermissionStatus().then(setPerm);
  }, []);

  const refreshPreview = async (next) => {
    setLoadingPreview(true);
    const copy = await NotificationService.previewMessage(next);
    setPref((p) => ({ ...p, preview: copy.preview }));
    setLoadingPreview(false);
  };

  const choose = async (type) => {
    Haptics.selectionAsync();
    const next = { ...pref, type };
    setPref(next);
    if (perm !== 'granted' && NotificationService.available()) setPerm(await NotificationService.requestPermission());
    const res = await NotificationService.scheduleReminder(next);
    setPref((p) => ({ ...p, preview: res.preview || p.preview }));
  };

  const togglePause = async (on) => {
    Haptics.selectionAsync();
    const next = { ...pref, enabled: on };
    setPref(next);
    on ? NotificationService.scheduleReminder({ ...next, type: pref.type }) : NotificationService.cancelReminders();
  };

  const time = pref.type === 'evening' ? pref.eveningTime : pref.morningTime;
  const [h, m] = time.split(':');

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }} ambient>
      <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
      <Text style={styles.h1}>Reminders</Text>
      <Text style={styles.sub}>I'll meet you when it's time. No guilt if you're late.</Text>

      <View style={styles.seg}>
        {TYPES.map((t) => (
          <Pressable key={t.key} onPress={() => choose(t.key)} style={[styles.segItem, pref.type === t.key && styles.segOn]}>
            <Text style={[styles.segText, pref.type === t.key && styles.segTextOn]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.timeCard}>
        <Text style={styles.timeLabel}>MEET AT</Text>
        <Text style={styles.time}>{h}:{m}</Text>
        <Text style={styles.timeSub}>{Number(h) < 12 ? 'AM' : 'PM'} · every day</Text>
      </View>

      {(pref.preview || loadingPreview) && (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>TOMORROW'S MESSAGE</Text>
          {loadingPreview ? (
            <Text style={styles.previewText}>Grace is writing your reminder…</Text>
          ) : (
            <Text style={styles.previewText}>“{pref.preview}”</Text>
          )}
        </View>
      )}

      <View style={styles.pauseRow}>
        <Text style={styles.pauseText}>Reminders on</Text>
        <Switch value={pref.enabled} onValueChange={togglePause} trackColor={{ true: colors.brass, false: colors.sand }} thumbColor={colors.white} />
      </View>

      {perm === 'denied' && (
        <Text style={styles.denied}>Notifications are off in system settings. You can still keep your rhythm here; turn them on in Settings anytime.</Text>
      )}
      {!NotificationService.available() && (
        <Text style={styles.note}>Live notifications need a dev build — your rhythm is saved and will schedule there.</Text>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginTop: 4, marginBottom: 24 },
  seg: { flexDirection: 'row', gap: 10, marginBottom: 22 },
  segItem: { flex: 1, alignItems: 'center', paddingVertical: 16, borderRadius: radius.md, backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.sand },
  segOn: { backgroundColor: 'rgba(230,207,148,0.2)', borderColor: colors.brass },
  segText: { fontFamily: fonts.sansMed, fontSize: 15, color: colors.textMuted },
  segTextOn: { fontFamily: fonts.sansSemi, color: colors.brassDeep },
  timeCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.lg, padding: 24, alignItems: 'center' },
  timeLabel: { fontFamily: fonts.sans, fontSize: 13, letterSpacing: 1, color: colors.textFaint },
  time: { fontFamily: fonts.serif, fontSize: 56, color: colors.ink, marginVertical: 4 },
  timeSub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint },
  previewCard: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, padding: 18, marginTop: 16 },
  previewLabel: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.brass, marginBottom: 8 },
  previewText: { fontFamily: fonts.serifItalic, fontSize: 17, color: colors.ink, lineHeight: 24 },
  pauseRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 18, marginTop: 16 },
  pauseText: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  denied: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger, marginTop: 16, lineHeight: 19 },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 16, lineHeight: 19 },
});
