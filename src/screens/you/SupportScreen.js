import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { SupportService, SUPPORT_CATEGORIES } from '../../services';
import { colors, fonts, radius } from '../../theme';

export default function SupportScreen({ navigation }) {
  const [category, setCategory] = useState('Billing');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | failed

  const send = async () => {
    if (!message.trim()) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); return; }
    setStatus('sending');
    const res = await SupportService.submitTicket({ category, message, email: 'you@email.com' });
    if (res.ok) { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); setStatus('sent'); }
    else { setStatus('failed'); }
  };

  if (status === 'sent') {
    return (
      <Screen bg={colors.ivory} edges={['top']} style={styles.center}>
        <GraceDove size={150} wings="folded" motion="peek" />
        <Text style={styles.sentTitle}>Message received.</Text>
        <Text style={styles.sentSub}>I've passed it along. We reply within a day, to you@email.com.</Text>
        <Pressable style={styles.primary} onPress={() => navigation.goBack()}><Text style={styles.primaryText}>Back to You</Text></Pressable>
      </Screen>
    );
  }

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
        <Text style={styles.h1}>Tell me what's wrong.</Text>
        <Text style={styles.sub}>I'll pass this along. We reply within a day.</Text>

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.chips}>
          {SUPPORT_CATEGORIES.map((c) => (
            <Pressable key={c} onPress={() => { Haptics.selectionAsync(); setCategory(c); }} style={[styles.chip, category === c && styles.chipOn]}>
              <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{c}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Describe what happened…"
          placeholderTextColor={colors.textFaint}
          multiline
          style={styles.input}
        />
        {status === 'failed' && <Text style={styles.failed}>That didn't send. Your message is still here — try again.</Text>}
        <Text style={styles.note}>Replies go to you@email.com</Text>

        <Pressable style={[styles.primary, { marginTop: 20 }]} onPress={send} disabled={status === 'sending'}>
          {status === 'sending' ? <ActivityIndicator color={colors.onDark} /> : <Text style={styles.primaryText}>Send</Text>}
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 34 },
  sentTitle: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginTop: 14 },
  sentSub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 22 },
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginTop: 6 },
  sub: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, marginTop: 4, marginBottom: 22 },
  label: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 10 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 },
  chip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sand },
  chipOn: { backgroundColor: 'rgba(230,207,148,0.2)', borderColor: colors.brass },
  chipText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
  chipTextOn: { fontFamily: fonts.sansSemi, color: colors.brassDeep },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: radius.md, padding: 18, minHeight: 130, fontFamily: fonts.sans, fontSize: 15, color: colors.ink, textAlignVertical: 'top' },
  failed: { fontFamily: fonts.sans, fontSize: 13, color: colors.danger, marginTop: 12 },
  note: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint, marginTop: 14 },
  primary: { backgroundColor: colors.espresso, borderRadius: radius.pill, paddingVertical: 16, alignItems: 'center' },
  primaryText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.onDark },
});
