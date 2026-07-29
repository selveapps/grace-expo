import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts } from '../theme';

// Brand vector icons. One stroke language across the whole app: 24 grid,
// strokeWidth 1.7, round caps and joins. These replace the text glyphs
// (▶ ❚❚ 🌙 ↺15 ⤴ ⤓ ✦ ♥) that rendered inconsistently per platform.
export const PATHS = {
  play: 'M9.2 7.6c0-.9 1-1.5 1.8-1l6 3.9c.7.5.7 1.5 0 2l-6 3.9c-.8.5-1.8-.1-1.8-1V7.6z', // use filled
  pause: 'M9.5 6.5v11M14.5 6.5v11',
  back15: 'M12 6V3L8 6l4 3V6a6 6 0 1 1-6 6',
  fwd15: 'M12 6V3l4 3-4 3V6a6 6 0 1 0 6 6',
  moon: 'M20 14.5A8 8 0 1 1 11.5 4a6.5 6.5 0 0 0 8.5 10.5z',
  sun: 'M12 4v2M12 18v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7 4.9 19.1M19.1 4.9l-1.4 1.4',
  bookmark: 'M6.5 4h11v16l-5.5-3.6L6.5 20z',
  share: 'M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6',
  download: 'M12 3v12M8 11l4 4 4-4M5 19h14',
  transcript: 'M4 7h16M7 12h10M9 17h6',
  speed: 'M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM12 12l4-4M4.5 18a9 9 0 1 1 15 0',
  sparkle: 'M12 4l1.6 4.4L18 10l-4.4 1.6L12 16l-1.6-4.4L6 10l4.4-1.6z',
  heart: 'M12 20s-7-4.3-7-9a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 4.7-7 9-7 9z',
  timer: 'M12 8v5M9 3h6M12 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16z',
  check: 'M5 12.5l4.5 4.5L19 6.5',
  chevronRight: 'M9.5 5.5l6 6.5-6 6.5',
  chevronDown: 'M5.5 9.5l6.5 6 6.5-6',
  highlight: 'M4 20h16M7.5 16.5l8.8-8.8a2 2 0 0 0 0-2.8l-.7-.7a2 2 0 0 0-2.8 0l-8.8 8.8V16.5z',
  copy: 'M9 9h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zM6 15H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v1',
  pen: 'M4 20l1-4 11-11a1.8 1.8 0 0 1 2.6 0l1.4 1.4a1.8 1.8 0 0 1 0 2.6L9 20z',
};

/**
 * `filled` draws the shape solid (the play triangle). `label` renders a tiny
 * numeral beside the glyph, for the ±15 skip controls.
 */
export default function GIcon({
  name,
  size = 22,
  color = colors.espresso,
  filled = false,
  strokeWidth = 1.7,
  label,
  style,
}) {
  const d = PATHS[name];
  if (!d) return null;
  const svg = (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={d}
        stroke={color}
        strokeWidth={filled ? 0 : strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill={filled ? color : 'none'}
      />
    </Svg>
  );
  if (label == null) return <View style={style}>{svg}</View>;
  return (
    <View style={[styles.labelled, style]}>
      {svg}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  labelled: { alignItems: 'center', justifyContent: 'center' },
  label: { position: 'absolute', fontFamily: fonts.sansSemi, fontSize: 9, marginTop: 1 },
});
