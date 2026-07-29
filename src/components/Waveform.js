import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

// Animated audio waveform — a row of bars that pulse.
// `animate` ties the motion to real playback state, so a paused player shows a
// still waveform instead of pretending to play.
export default function Waveform({ width = 200, color = '#E6CF94', bars = 26, height = 30, animate = true }) {
  const vals = useRef([...Array(bars)].map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
    if (!animate) {
      vals.forEach((v) => { v.stopAnimation(); v.setValue(0.4); });
      return undefined;
    }
    const anims = vals.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 55),
          Animated.timing(v, { toValue: 1, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(v, { toValue: 0.4, duration: 500, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [animate]);

  const heights = [10, 18, 26, 14, 30, 20, 12, 24, 32, 16, 22, 28, 14, 20];
  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'center', gap: 3, overflow: 'hidden' }}>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: 3,
            borderRadius: 3,
            backgroundColor: color,
            height: (heights[i % heights.length] / 32) * height,
            transform: [{ scaleY: v }],
          }}
        />
      ))}
    </View>
  );
}
