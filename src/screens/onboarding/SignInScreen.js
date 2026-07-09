import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { colors, fonts, radius } from '../../theme';

const AppleMark = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
    <Path d="M17.05 12.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.4zM15 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 0 1.9-.5 2.5-1.2z" />
  </Svg>
);
const GoogleMark = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24">
    <Path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.5-.2-2.2H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2-1.9 3.3-4.7 3.3-8.1z" />
    <Path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.2 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2v2.8A11 11 0 0 0 12 23z" />
    <Path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2a11 11 0 0 0 0 9.8l3.7-2.8z" />
    <Path fill="#EA4335" d="M12 5.4c1.6 0 3 .6 4.2 1.7l3.1-3.1A11 11 0 0 0 2 7.1l3.7 2.8C6.6 7.3 9.1 5.4 12 5.4z" />
  </Svg>
);

export default function SignInScreen({ navigation }) {
  const go = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); navigation.navigate('Preparing'); };
  return (
    <Screen gradient={['#FDFBF6', '#F7F3EC']} style={styles.wrap}>
      <View style={{ alignItems: 'center' }}>
        <GraceDove size={120} wings="folded" motion="breathe" />
        <Text style={styles.title}>Keep your place,{'\n'}always.</Text>
        <Text style={styles.sub}>Sign in so Grace remembers you across devices.</Text>
      </View>
      <View style={{ flex: 1 }} />
      <Pressable onPress={go} style={[styles.btn, { backgroundColor: '#1C1C1E' }]}>
        <AppleMark /><Text style={[styles.btnText, { color: '#fff' }]}>Continue with Apple</Text>
      </Pressable>
      <Pressable onPress={go} style={[styles.btn, styles.btnLight]}>
        <GoogleMark /><Text style={[styles.btnText, { color: colors.ink }]}>Continue with Google</Text>
      </Pressable>
      <Pressable onPress={go} style={{ paddingVertical: 12 }}>
        <Text style={styles.email}>Continue with email</Text>
      </Pressable>
      <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 24 },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink, textAlign: 'center', marginTop: 18, lineHeight: 40 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 17, borderRadius: radius.md, marginBottom: 12 },
  btnLight: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.cardBorder },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 17 },
  email: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.textFaint, textAlign: 'center' },
  legal: { fontFamily: fonts.sans, fontSize: 12, color: '#B3A690', textAlign: 'center', marginTop: 12, lineHeight: 18 },
});
