import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { colors, fonts } from '../../theme';

const ITEMS = ['Your verse', 'Your rhythm', 'Your stories', 'Your place'];
const STEP = 750; // ms between items completing

// Preparing — a calm, sacred "building your path" beat. Items check in ONE BY ONE,
// each with its own tick + haptic, then Grace settles and we move on.
function Item({ label, done, active }) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, { toValue: done ? 1 : active ? 0.5 : 0, duration: 340, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();
  }, [done, active]);
  return (
    <View style={styles.item}>
      <Animated.View style={[styles.check, { backgroundColor: done ? colors.brass : '#D6CAB6', transform: [{ scale: a.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.9, 1, 1] }) }] }]}>
        <Text style={{ color: '#fff', fontSize: 11 }}>{done ? '✓' : ''}</Text>
      </Animated.View>
      <Text style={[styles.itemText, { color: done ? colors.ink : active ? colors.textMuted : colors.textFaint }]}>{label}</Text>
    </View>
  );
}

export default function PreparingScreen({ navigation }) {
  const [step, setStep] = useState(0); // number of completed items

  useEffect(() => {
    const timers = [];
    ITEMS.forEach((_, i) => {
      timers.push(setTimeout(() => {
        setStep(i + 1);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // tiny tick per item
      }, STEP * (i + 1)));
    });
    timers.push(setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // warm settle
      navigation.navigate('Paywall');
    }, STEP * ITEMS.length + 900));
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <Screen gradient={['#FDF6E4', '#EFE6D4']} style={styles.wrap}>
      <View style={styles.ring}>
        <GraceDove size={176} motion="loading" />
      </View>
      <Text style={styles.title}>Preparing your quiet place…</Text>
      <View style={{ gap: 12, marginTop: 26 }}>
        {ITEMS.map((it, i) => (
          <Item key={it} label={it} done={i < step} active={i === step} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 30, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: fonts.serif, fontSize: 32, color: colors.ink, marginTop: 26, textAlign: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start' },
  check: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  itemText: { fontFamily: fonts.sans, fontSize: 16 },
});
