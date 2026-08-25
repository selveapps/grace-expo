import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert, Linking } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { AuthService, StorageService, SubscriptionService } from '../../services';
import { useProfile } from '../../state/profile';
import { LEGAL } from '../../legal';
import { colors, fonts, radius } from '../../theme';

const GROUPS = [
  // Restore sits here as well as on the paywall: 3.1.2 only requires it on the
  // purchase screen, but Settings is where people actually go looking for it.
  { group: 'Account', rows: ['Name & email', 'Sign-in method', 'Subscription', 'Restore purchases'] },
  { group: 'Experience', rows: ['Notifications', 'Reading preferences', 'Audio preferences', 'Appearance'] },
  { group: 'Privacy & help', rows: ['Privacy policy', 'Terms of service', 'Privacy & data', 'Help & support'] },
];

export default function SettingsScreen({ navigation }) {
  const { resetProfile } = useProfile();
  const [deleting, setDeleting] = useState(false);
  const [restoring, setRestoring] = useState(false);

  // Clearing the profile no longer moves anyone on its own. The root navigator
  // used to be keyed on `profile.onboarded`, and that remount was supposed to
  // drop a signed-out user back into onboarding; it never actually did, because
  // React Navigation restores a remounted stack whose route names are unchanged.
  // Sending her back is now explicit.
  const toOnboarding = () => {
    navigation.getParent('root')?.reset({ index: 0, routes: [{ name: 'Splash' }] });
  };

  const open = (url) => Linking.openURL(url).catch(() => {
    Alert.alert("Couldn't open that link", 'Please check your connection and try again.');
  });

  // Says plainly what happened either way. A restore that finds nothing is not
  // an error, so it gets a calm result rather than a failure alert.
  const restorePurchases = async () => {
    if (restoring) return;
    setRestoring(true);
    const res = await SubscriptionService.restore().catch(() => null);
    setRestoring(false);
    if (res && (res.status === 'trialing' || res.status === 'active')) {
      Alert.alert('Restored', 'Your subscription is active again.');
    } else if (res) {
      Alert.alert('Nothing to restore', 'No previous subscription was found on this Apple Account.');
    } else {
      Alert.alert("Couldn't check just now", 'Please try again in a moment.');
    }
  };

  const tap = (row) => {
    Haptics.selectionAsync();
    if (row === 'Subscription') navigation.navigate('ManageSubscription');
    else if (row === 'Restore purchases') restorePurchases();
    else if (row === 'Notifications') navigation.navigate('Reminders');
    else if (row === 'Reading preferences' || row === 'Audio preferences' || row === 'Appearance') navigation.navigate('Preferences');
    else if (row === 'Help & support') navigation.navigate('Support');
    else if (row === 'Privacy policy') open(LEGAL.privacyUrl);
    else if (row === 'Terms of service') open(LEGAL.termsUrl);
  };

  const signOut = () => {
    Alert.alert('Sign out?', "I'll keep your place for when you return.", [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await StorageService.clearUserData();
          resetProfile && resetProfile();
          toOnboarding();
        },
      },
    ]);
  };

  // Guideline 5.1.1(v): account deletion has to live in the app, and local data
  // is only cleared once the server confirms the rows are actually gone.
  const deleteAccount = () => {
    Alert.alert(
      'Delete your account?',
      'This removes your saved verses, reflections and progress from our servers for good. If you have a subscription, cancel it separately in the App Store.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (deleting) return;
            setDeleting(true);
            const res = await AuthService.deleteAccount();
            setDeleting(false);
            if (res.ok) {
              resetProfile && resetProfile();
              toOnboarding();
            } else {
              Alert.alert("I couldn't delete your account just now", 'Please try again in a moment.');
            }
          },
        },
      ],
    );
  };

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }} ambient>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
        <Text style={styles.h1}>Settings</Text>
        {GROUPS.map((g) => (
          <View key={g.group} style={{ marginBottom: 20 }}>
            <Text style={styles.group}>{g.group.toUpperCase()}</Text>
            <View style={styles.card}>
              {g.rows.map((r, i) => (
                <Pressable key={r} onPress={() => tap(r)} style={[styles.row, i < g.rows.length - 1 && styles.rowDivide]}>
                  <Text style={styles.rowText}>{r}</Text>
                  <Text style={styles.chev}>{restoring && r === 'Restore purchases' ? '…' : '›'}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.group}>ABOUT</Text>
          <View style={[styles.card, styles.about]}>
            <Text style={styles.aboutText}>{LEGAL.scriptureAttribution}</Text>
          </View>
        </View>

        <Pressable onPress={signOut} style={styles.footerHit}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
        <Pressable onPress={deleteAccount} style={styles.footerHit} disabled={deleting}>
          <Text style={styles.deleteText}>{deleting ? 'Deleting…' : 'Delete account'}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textMuted },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6, marginBottom: 20 },
  group: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textMuted, marginBottom: 8, paddingLeft: 4 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48, paddingVertical: 16, paddingHorizontal: 18 },
  rowDivide: { borderBottomWidth: 1, borderBottomColor: '#F1ECE2' },
  rowText: { fontFamily: fonts.sans, fontSize: 16, color: colors.ink },
  chev: { color: '#C9BCA6', fontSize: 16 },
  about: { paddingVertical: 16, paddingHorizontal: 18 },
  aboutText: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.textMuted },
  footerHit: { minHeight: 44, justifyContent: 'center', marginBottom: 8 },
  signOut: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.textMuted, textAlign: 'center' },
  deleteText: { fontFamily: fonts.sansSemi, fontSize: 16, color: colors.danger, textAlign: 'center' },
});
