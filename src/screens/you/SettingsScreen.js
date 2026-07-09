import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import { StorageService } from '../../services';
import { useProfile } from '../../state/profile';
import { colors, fonts, radius } from '../../theme';

const GROUPS = [
  { group: 'Account', rows: ['Name & email', 'Sign-in method', 'Subscription'] },
  { group: 'Experience', rows: ['Notifications', 'Reading preferences', 'Audio preferences', 'Appearance'] },
  { group: 'Privacy & help', rows: ['Privacy & data', 'Help & support'] },
];

export default function SettingsScreen({ navigation }) {
  const { resetProfile } = useProfile();

  const tap = (row) => {
    Haptics.selectionAsync();
    if (row === 'Subscription') navigation.navigate('ManageSubscription');
    else if (row === 'Notifications') navigation.navigate('Reminders');
    else if (row === 'Reading preferences' || row === 'Audio preferences' || row === 'Appearance') navigation.navigate('Preferences');
    else if (row === 'Help & support') navigation.navigate('Support');
  };

  const signOut = () => {
    Alert.alert('Sign out?', "I'll keep your place for when you return.", [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await StorageService.clearUserData(); resetProfile && resetProfile(); } },
    ]);
  };

  return (
    <Screen bg={colors.ivory} edges={['top']} style={{ paddingHorizontal: 22, paddingTop: 6 }}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()}><Text style={styles.back}>‹ You</Text></Pressable>
        <Text style={styles.h1}>Settings</Text>
        {GROUPS.map((g) => (
          <View key={g.group} style={{ marginBottom: 20 }}>
            <Text style={styles.group}>{g.group.toUpperCase()}</Text>
            <View style={styles.card}>
              {g.rows.map((r, i) => (
                <Pressable key={r} onPress={() => tap(r)} style={[styles.row, i < g.rows.length - 1 && styles.rowDivide]}>
                  <Text style={styles.rowText}>{r}</Text><Text style={styles.chev}>›</Text>
                </Pressable>
              ))}
            </View>
          </View>
        ))}
        <Pressable onPress={signOut} style={{ paddingVertical: 8, marginBottom: 20 }}>
          <Text style={styles.signOut}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
  h1: { fontFamily: fonts.serif, fontSize: 34, color: colors.ink, marginTop: 6, marginBottom: 20 },
  group: { fontFamily: fonts.sansSemi, fontSize: 12, letterSpacing: 1, color: colors.textFaint, marginBottom: 8, paddingLeft: 4 },
  card: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.sandLine, borderRadius: radius.md, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, paddingHorizontal: 18 },
  rowDivide: { borderBottomWidth: 1, borderBottomColor: '#F1ECE2' },
  rowText: { fontFamily: fonts.sans, fontSize: 15, color: colors.ink },
  chev: { color: '#C9BCA6', fontSize: 16 },
  signOut: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.textMuted, textAlign: 'center' },
});
