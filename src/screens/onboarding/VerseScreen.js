import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { verseForCarrying } from '../../api/bible';
import { colors, fonts, radius, shadow } from '../../theme';

export default function VerseScreen({ navigation }) {
  const { profile, saveVerse } = useProfile();
  const [verse, setVerse] = useState(null); // { ref, text }
  const [saved, setSaved] = useState(false);

  // Fetch a real verse chosen for what the user is carrying.
  useEffect(() => {
    let alive = true;
    verseForCarrying(profile.carrying).then((v) => {
      if (!alive) return;
      setVerse(v);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); // soft bloom on reveal
    });
    return () => { alive = false; };
  }, []);

  const keep = () => {
    if (verse) saveVerse({ ref: verse.ref, text: verse.text }); // persists to storage
    setSaved(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // confirmation
  };

  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC']} style={styles.wrap}>
      <View style={{ alignItems: 'center' }}>
        <GraceDove size={78} motion="halo" />
        <Text style={styles.kicker}>A verse for today, {profile.name || 'friend'}.</Text>
      </View>
      <View style={styles.card}>
        {saved && <View style={styles.savedTag}><Text style={styles.savedText}>KEPT</Text></View>}
        {verse ? (
          <>
            <Text style={styles.verse}>{verse.text}</Text>
            <Text style={styles.ref}>{verse.ref.toUpperCase()}</Text>
          </>
        ) : (
          <View style={{ paddingVertical: 30 }}><ActivityIndicator color={colors.brass} /></View>
        )}
      </View>
      <View style={{ flex: 1 }} />
      {saved ? (
        <PrimaryButton label="Continue" onPress={() => navigation.navigate('Reflection')} />
      ) : (
        <>
          <PrimaryButton label="Keep this verse" onPress={keep} />
          <Text style={styles.amen} onPress={() => navigation.navigate('Reflection')}>Amen — continue without keeping</Text>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 30, alignItems: 'center' },
  kicker: { fontFamily: fonts.serifItalic, fontSize: 21, color: colors.brass, marginTop: 10 },
  card: { width: '100%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.xl, padding: 34, alignItems: 'center', marginTop: 34, minHeight: 180, justifyContent: 'center', ...shadow.card },
  savedTag: { position: 'absolute', top: -10, right: 18, backgroundColor: '#FDF6E4', borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  savedText: { fontFamily: fonts.sansSemi, fontSize: 11, letterSpacing: 1, color: colors.brass },
  verse: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink, textAlign: 'center', lineHeight: 38 },
  ref: { fontFamily: fonts.sans, fontSize: 13, letterSpacing: 1, color: colors.textFaint, marginTop: 20 },
  amen: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, textAlign: 'center', marginTop: 14 },
});
