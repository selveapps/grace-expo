import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { colors, fonts } from '../../theme';

const UNLOCKED = ['All stories', 'Full Bible', 'Evening rest'];

export default function ConfirmationScreen({ navigation }) {
  const { profile, setProfile } = useProfile();
  const enter = () => {
    setProfile((p) => ({ ...p, onboarded: true, subscribed: true }));
    navigation.reset({ index: 0, routes: [{ name: 'App' }] });
  };
  return (
    <Screen gradient={['#FDF6E4', '#F7F3EC', '#F1EBE0']} style={styles.wrap}>
      <View style={styles.center}>
        <GraceDove size={210} motion="celebrate" />
        <Text style={styles.title}>Your place is ready,{'\n'}{profile.name || 'friend'}.</Text>
        <Text style={styles.sub}>Three days, on us — then continue if it feels right.</Text>
        <View style={styles.row}>
          {UNLOCKED.map((u) => (
            <View key={u} style={styles.item}>
              <View style={styles.check}><Text style={{ color: colors.white, fontSize: 12 }}>✓</Text></View>
              <Text style={styles.itemText}>{u}</Text>
            </View>
          ))}
        </View>
      </View>
      <PrimaryButton label="Enter Grace" onPress={enter} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 30, paddingBottom: 30, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 42, color: colors.ink, textAlign: 'center', marginTop: 16, lineHeight: 46 },
  sub: { fontFamily: fonts.sans, fontSize: 16, color: colors.textMuted, textAlign: 'center', marginTop: 12, marginHorizontal: 24 },
  row: { flexDirection: 'row', gap: 22, marginTop: 30 },
  item: { alignItems: 'center', gap: 6 },
  check: { width: 20, height: 20, borderRadius: 10, backgroundColor: colors.brass, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: fonts.sans, fontSize: 13, color: colors.textFaint },
});
