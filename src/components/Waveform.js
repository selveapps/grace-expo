import React, { useEffect, useMemo } from 'react';
import { View, Animated, Easing } from 'react-native';

const BAR_W = 3;
const BAR_GAP = 3;

// Animated audio waveform — a row of bars that pulse.
// `animate` ties the motion to real playback state, so a paused player shows a
// still waveform instead of pretending to play.
//
// `fill` sizes the bar count to the container instead of taking it on trust. The
// player passed 30 bars into a full-width column, which drew ~177pt of waveform
// inside a ~340pt row and left it hanging off to the left. Bars are centered
// either way, so a short waveform sits under the middle of the scrubber rather
// than against its left edge.
export default function Waveform({ width = 200, color = '#E6CF94', bars = 26, height = 30, animate = true, fill = false }) {
  const count = fill
    ? Math.max(8, Math.floor((width + BAR_GAP) / (BAR_W + BAR_GAP)))
    : bars;
  // Rebuilt when the count changes: the player measures its column on layout,
  // so `width` (and therefore `count`) moves from the fallback to the real value
  // one frame in.
  const vals = useMemo(
    () => [...Array(count)].map(() => new Animated.Value(0.4)),
    [count],
  );

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
  }, [animate, vals]);

  const heights = [10, 18, 26, 14, 30, 20, 12, 24, 32, 16, 22, 28, 14, 20];
  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: BAR_GAP, overflow: 'hidden' }}>
      {vals.map((v, i) => (
        <Animated.View
          key={i}
          style={{
            width: BAR_W,
            borderRadius: BAR_W,
            backgroundColor: color,
            height: (heights[i % heights.length] / 32) * height,
            transform: [{ scaleY: v }],
          }}
        />
      ))}
    </View>
  );
}
