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

  // Keep = save AND advance in one tap (no interstitial Continue).
  const keep = () => {
    if (verse) saveVerse({ ref: verse.ref, text: verse.text }); // persists to storage
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // confirmation on the way out
    navigation.navigate('Reflection');
  };

  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC']} style={styles.wrap} ambient>
      <View style={{ alignItems: 'center' }}>
        <GraceDove size={78} motion="halo" />
        <Text style={styles.kicker}>A verse for today, {profile.name || 'friend'}.</Text>
      </View>
      <View style={styles.card}>
        {verse ? (
          <>
            <Text style={styles.verse} adjustsFontSizeToFit numberOfLines={6}>{verse.text}</Text>
            <Text style={styles.ref}>{verse.ref.toUpperCase()}</Text>
          </>
        ) : (
          <View style={{ paddingVertical: 30 }}><ActivityIndicator color={colors.brass} /></View>
        )}
      </View>
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Keep this verse" onPress={keep} />
      <Text style={styles.amen} onPress={() => navigation.navigate('Reflection')}>Amen, continue without keeping</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 26, paddingTop: 20, paddingBottom: 30 },
  kicker: { fontFamily: fonts.serifItalic, fontSize: 21, color: colors.brass, marginTop: 10 },
  card: { width: '100%', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.xl, padding: 34, alignItems: 'center', marginTop: 34, marginBottom: 20, maxHeight: '55%', justifyContent: 'center', ...shadow.card },
  verse: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink, textAlign: 'center', lineHeight: 36 },
  ref: { fontFamily: fonts.sans, fontSize: 13, letterSpacing: 1, color: colors.textFaint, marginTop: 20 },
  amen: { fontFamily: fonts.sans, fontSize: 14, color: colors.textFaint, textAlign: 'center', marginTop: 14 },
});
