import React, { useEffect, useRef } from 'react';
import { Text, StyleSheet, Animated, Easing, ScrollView } from 'react-native';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts } from '../../theme';

// Welcome — a fluid continuation from splash. Grace has settled closer & smaller
// (not another huge mascot beat). Text arrives after she settles.
export default function WelcomeScreen({ navigation }) {
  const dove = useRef(new Animated.Value(0)).current;
  const text = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(dove, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.stagger(260, [
        Animated.timing(text, { toValue: 1, duration: 560, useNativeDriver: true }),
        Animated.timing(cta, { toValue: 1, duration: 560, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const rise = (v, from = 16) => ({ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] });

  return (
    <Screen bg={colors.ivory} style={styles.fill} ambient>
      <ScrollView style={styles.fill} contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} bounces={false}>
      <Animated.View style={[styles.center, { opacity: dove }]}>
        <Animated.View style={{ transform: [{ scale: dove.interpolate({ inputRange: [0, 1], outputRange: [1.12, 1] }) }] }}>
          <GraceDove size={150} wings="folded" motion="breathe" />
        </Animated.View>
        <Animated.Text style={[styles.title, rise(text)]}>Welcome. I'm Grace.</Animated.Text>
        <Animated.Text style={[styles.sub, rise(text, 12)]}>I'll keep your place, every day, right where you left it.</Animated.Text>
      </Animated.View>
      <Animated.View style={rise(cta, 22)}>
        <PrimaryButton label="Continue" onPress={() => navigation.navigate('Name')} testID="welcome-continue" />
      </Animated.View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 30, paddingBottom: 30 },
  center: { flexGrow: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 40, color: colors.ink, marginTop: 22, textAlign: 'center', lineHeight: 44 },
  sub: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.textMuted, marginTop: 12, textAlign: 'center', maxWidth: 290, lineHeight: 27 },
});
