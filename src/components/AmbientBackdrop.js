import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { useProfile } from '../state/profile';

// Soft, brand-appropriate falling motes (warm brass/ivory, not literal snow) behind
// non-reading screens. Absolutely positioned + non-interactive. Honors reducedMotion.
const { width: W, height: H } = Dimensions.get('window');
const COUNT = 10;

const MOTES = Array.from({ length: COUNT }, (_, i) => ({
  key: i,
  x: Math.random() * W,
  size: 3 + Math.random() * 3,
  duration: 9000 + Math.random() * 7000,
  delay: Math.random() * 6000,
  sway: 12 + Math.random() * 20,
  opacity: 0.12 + Math.random() * 0.18,
  color: i % 3 === 0 ? '#ffffff' : '#e6cf94',
}));

function Mote({ mote }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, {
        toValue: 1,
        duration: mote.duration,
        delay: mote.delay,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [-20, H + 20] });
  const translateX = t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, mote.sway, 0] });
  const opacity = t.interpolate({ inputRange: [0, 0.15, 0.85, 1], outputRange: [0, mote.opacity, mote.opacity, 0] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: mote.x,
        top: 0,
        width: mote.size,
        height: mote.size,
        borderRadius: mote.size,
        backgroundColor: mote.color,
        opacity,
        transform: [{ translateY }, { translateX }],
      }}
    />
  );
}

export default function AmbientBackdrop() {
  const { profile } = useProfile();
  if (profile?.reducedMotion) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {MOTES.map((m) => <Mote key={m.key} mote={m} />)}
    </View>
  );
}
