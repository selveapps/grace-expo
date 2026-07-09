import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

// In-character play glyph — a soft rounded triangle. `filled` draws a solid brass/gold
// triangle; otherwise a stroked one. Optional `ring` draws an enclosing circle.
export default function PlayIcon({ size = 18, color = '#B58A3F', filled = true, ring = false, ringColor }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {ring ? <Circle cx="12" cy="12" r="11" fill="none" stroke={ringColor || color} strokeWidth="1.6" /> : null}
      <Path
        d="M9.2 7.6c0-.9 1-1.5 1.8-1l6 3.9c.7.5.7 1.5 0 2l-6 3.9c-.8.5-1.8-.1-1.8-1V7.6z"
        fill={filled ? color : 'none'}
        stroke={color}
        strokeWidth={filled ? 0 : 1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
