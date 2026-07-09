import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

// Animated audio waveform — a row of bars that pulse.
export default function Waveform({ width = 200, color = '#E6CF94', bars = 26, height = 30 }) {
  const vals = useRef([...Array(bars)].map(() => new Animated.Value(0.4))).current;

  useEffect(() => {
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
  }, []);

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
