import React from 'react';
import { View } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { colors } from '../theme';

// Minimal stroke icon set for tab bar + rows. name -> path(s).
const PATHS = {
  today: (c, w) => (<>
    <Path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" stroke={c} strokeWidth={w} strokeLinecap="round" />
    <Circle cx="12" cy="12" r="4" stroke={c} strokeWidth={w} />
  </>),
  stories: (c, w) => (<>
    <Path d="M5 12a7 7 0 0 1 14 0" stroke={c} strokeWidth={w} strokeLinecap="round" />
    <Rect x="3.5" y="11" width="3" height="6" rx="1.5" stroke={c} strokeWidth={w} />
    <Rect x="17.5" y="11" width="3" height="6" rx="1.5" stroke={c} strokeWidth={w} />
  </>),
  reading: (c, w) => (
    <Path d="M12 6c-1.6-1.2-4-1.6-6.5-1.4A1 1 0 0 0 4.5 5.6v11.2a1 1 0 0 0 1.1 1c2.3-.2 4.7.2 6.4 1.2 1.7-1 4.1-1.4 6.4-1.2a1 1 0 0 0 1.1-1V5.6a1 1 0 0 0-1-1C16.4 4.4 13.6 4.8 12 6zM12 6v13" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  ),
  you: (c, w) => (
    <Path d="M12 4c3 3 3.5 7 1 11-2.5-4-2-8-1-11zM12 15c-3 0-5 2-5 5M12 15c3 0 5 2 5 5" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />
  ),
  search: (c, w) => (<>
    <Circle cx="11" cy="11" r="7" stroke={c} strokeWidth={w} />
    <Path d="M20 20l-3.5-3.5" stroke={c} strokeWidth={w} strokeLinecap="round" />
  </>),
};

export default function Icon({ name, size = 24, color = colors.brass, active = false }) {
  const render = PATHS[name];
  if (!render) return null;
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        {render(color, active ? 2 : 1.7)}
      </Svg>
    </View>
  );
}
