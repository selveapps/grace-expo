import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { colors, fonts } from '../../theme';

// Splash / Alight — Grace flies in on an arc, banks level, the halo blooms, then
// she settles into a living bob. Warm dawn field with drifting light.
function Dust({ x, size, delay, drift }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(a, { toValue: 1, duration: drift, delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = a.interpolate({ inputRange: [0, 1], outputRange: [40, -70] });
  const opacity = a.interpolate({ inputRange: [0, 0.15, 0.8, 1], outputRange: [0, 0.75, 0.5, 0] });
  return (
    <Animated.View style={{ position: 'absolute', left: x, bottom: 110, width: size, height: size, borderRadius: size, backgroundColor: colors.gold, opacity, transform: [{ translateY }] }} />
  );
}

export default function SplashScreen({ navigation }) {
  const intro = useRef(new Animated.Value(0)).current;   // flight in
  const halo = useRef(new Animated.Value(0)).current;    // halo bloom
  const bob = useRef(new Animated.Value(0)).current;     // living idle bob
  const title = useRef(new Animated.Value(0)).current;
  const sub = useRef(new Animated.Value(0)).current;
  const cta = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        // Grace flies in — a touch of overshoot so she "lands"
        Animated.timing(intro, { toValue: 1, duration: 1300, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }),
        Animated.timing(halo, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      ]),
      Animated.stagger(300, [
        Animated.timing(title, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(sub, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(cta, { toValue: 1, duration: 600, useNativeDriver: true }),
      ]),
    ]).start(() => {
      // settle into a gentle, living bob once she's landed
      Animated.loop(
        Animated.sequence([
          Animated.timing(bob, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(bob, { toValue: 0, duration: 2600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();
    });
    const t = setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft), 1250); // arrival pulse on landing
    return () => clearTimeout(t);
  }, []);

  const rise = (v, from = 16) => ({ opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }] });

  return (
    <Screen gradient={['#FFFDF9', '#FDF6E4', '#F4E8CE']} style={styles.wrap} ambient>
      <Dust x={50} size={5} delay={0} drift={6200} />
      <Dust x={120} size={4} delay={1500} drift={7400} />
      <Dust x={210} size={7} delay={800} drift={6800} />
      <Dust x={280} size={4} delay={2400} drift={8000} />
      <Dust x={330} size={5} delay={3200} drift={7000} />
      <Dust x={170} size={4} delay={4200} drift={7600} />

      <View style={styles.center}>
        {/* halo bloom behind Grace */}
        <Animated.View style={{
          position: 'absolute', width: 360, height: 360, borderRadius: 360, backgroundColor: colors.gold,
          opacity: halo.interpolate({ inputRange: [0, 1], outputRange: [0, 0.2] }),
          transform: [{ scale: halo.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) }],
        }} />
        {/* flight-in wrapper */}
        <Animated.View style={{
          opacity: intro.interpolate({ inputRange: [0, 0.25, 1], outputRange: [0, 1, 1] }),
          transform: [
            { translateX: intro.interpolate({ inputRange: [0, 1], outputRange: [140, 0] }) },
            { translateY: intro.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) },
            { rotate: intro.interpolate({ inputRange: [0, 0.7, 1], outputRange: ['16deg', '-4deg', '0deg'] }) },
            { scale: intro.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
          ],
        }}>
          {/* living idle bob (after landing) */}
          <Animated.View style={{ transform: [{ translateY: bob.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }] }}>
            <GraceDove size={240} motion="halo" />
          </Animated.View>
        </Animated.View>
        <Animated.Text style={[styles.title, rise(title)]}>Grace is here.</Animated.Text>
        <Animated.Text style={[styles.sub, rise(sub)]}>A quiet place for your soul to breathe.</Animated.Text>
      </View>
      <Animated.View style={rise(cta, 24)}>
        <PrimaryButton label="Begin" variant="dark" onPress={() => navigation.navigate('Welcome')} />
      </Animated.View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 30, paddingBottom: 30, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 46, color: colors.ink, marginTop: 20 },
  sub: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.textFaint, marginTop: 8, textAlign: 'center', maxWidth: 260 },
});
