import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, G, Path } from 'react-native-svg';
import { motifElements } from './TeaMotif';

// Story cover art.
//
// Covers were a flat `coverTint` rectangle with a play glyph on it, which is why
// the catalogue read as a list of placeholders: five stories, four of them the
// same two browns. Each story now gets real artwork built from the same motif
// library Tea uses (see TeaMotif), so the object on the cover is the object in
// the passage.
//
// Stories keep the deep espresso treatment rather than Tea's ivory: that
// contrast is what makes the two surfaces feel like different products inside
// one app, and it is already how the featured card and the player read.

// Deep grounds with a gold line weight, seeded per story so a title always looks
// like itself.
const GROUNDS = [
  { a: '#6B5747', b: '#4A382C', c: '#2E2318', ink: '#E6CF94', accent: '#C9A55E' },
  { a: '#5A4632', b: '#3E2F23', c: '#271D13', ink: '#E8D3A0', accent: '#C09A52' },
  { a: '#63513F', b: '#443428', c: '#2B2015', ink: '#E3CB92', accent: '#BE9750' },
  { a: '#584737', b: '#3A2C22', c: '#241A11', ink: '#EAD6A6', accent: '#C5A057' },
];

/**
 * Story id -> motif. Same rule as Tea: draw what the passage is about. Anything
 * unmapped falls back to `lamp`, which never looks wrong.
 */
export const STORY_MOTIF = {
  'ruth-stays': 'wheat',
  'esther-uninvited': 'sceptre',
  'davids-rooftop': 'crown',
  'hannah-prayer': 'columns',
  'mary-annunciation': 'lily',
};

// Motifs are authored on a 100 x 74 box; the fill factor leaves a margin so the
// object never touches the cover edge.
const MOTIF_W = 100;
const MOTIF_H = 74;
const MOTIF_FILL = 0.78;
// Titles sit along the bottom of a cover, so the object is seated high. Square
// thumbnails have no caption, hence the near-centre bias there.
const MOTIF_BIAS_Y = 0.42;

function hash(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function storyMotif(story) {
  return STORY_MOTIF[story?.id] ?? 'lamp';
}

export function storyGround(story) {
  return GROUNDS[hash(story?.id) % GROUNDS.length];
}

/**
 * Full-bleed story art. `ratio` shapes the viewBox so the same component works
 * for a square thumbnail and for a wide featured panel without the motif being
 * stretched or cropped badly.
 */
export default function StoryArt({ story, motif, ratio = 1, style, motifOpacity = 0.72 }) {
  const art = useMemo(() => {
    const h = hash(story?.id);
    return {
      g: storyGround(story),
      key: motif ?? storyMotif(story),
      orbX: 28 + ((h >>> 9) % 44),
      orbY: 22 + ((h >>> 12) % 16),
      rot: ((h >>> 3) % 12) - 6,
    };
  }, [story?.id, motif]);

  const { g, key, orbX, orbY, rot } = art;

  // Motifs are drawn on a 100x74 box. Fit that box to the frame and centre it,
  // so a wide panel gets more ground rather than a cropped, over-zoomed object.
  const vbW = 100;
  const vbH = Math.max(40, Math.round(100 / Math.max(0.2, ratio)));
  const scale = Math.min(vbW / MOTIF_W, vbH / MOTIF_H) * MOTIF_FILL;
  const mx = (vbW - MOTIF_W * scale) / 2;
  const bias = ratio > 0.95 && ratio < 1.05 ? 0.5 : MOTIF_BIAS_Y; // squares centre
  const my = Math.max(2, vbH * bias - (MOTIF_H * scale) / 2);
  // Unique per instance, not per motif: two stories can share a motif while
  // having different grounds, and a shared id would give them the same one.
  const gid = `sa${hash(story?.id ?? 'x').toString(36)}${Math.round(ratio * 100)}`;

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`${gid}-ground`} x1="0" y1="0" x2="0.3" y2="1">
            <Stop offset="0%" stopColor={g.a} />
            <Stop offset="55%" stopColor={g.b} />
            <Stop offset="100%" stopColor={g.c} />
          </LinearGradient>
          <RadialGradient id={`${gid}-orb`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFF3D6" stopOpacity="0.4" />
            <Stop offset="70%" stopColor="#FFEFCC" stopOpacity="0.1" />
            <Stop offset="100%" stopColor="#FFEFCC" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={vbW} height={vbH} fill={`url(#${gid}-ground)`} />
        <Circle cx={orbX} cy={orbY} r={vbH * 0.34} fill={`url(#${gid}-orb)`} />

        <G translate={`${mx}, ${my}`} opacity={motifOpacity}>
          <G scale={scale}>
            <G rotation={rot} origin={`${MOTIF_W / 2}, ${MOTIF_H / 2}`}>
              {motifElements(key, g.ink, g.accent)}
            </G>
          </G>
        </G>

        {/* One low horizon to seat the object. */}
        <Path
          d={`M -10 ${vbH * 0.82} Q 50 ${vbH * 0.78} 110 ${vbH * 0.82}`}
          stroke={g.accent}
          strokeWidth="0.5"
          fill="none"
          opacity="0.28"
        />

        <G opacity="0.12">
          {Array.from({ length: 22 }, (_, i) => {
            const h2 = hash(`${story?.id}s${i}`);
            return (
              <Circle
                key={i}
                cx={h2 % 100}
                cy={(h2 >>> 7) % vbH}
                r={0.3 + ((h2 >>> 14) % 3) * 0.22}
                fill={i % 3 === 0 ? '#FFF8E6' : g.c}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}

/**
 * Fixed-size square cover, for list thumbnails. Replaces the flat coverTint
 * square that every row used to show.
 */
export function StoryCover({ story, size = 52, radius = 14, style, children }) {
  return (
    <View style={[{ width: size, height: size, borderRadius: radius, overflow: 'hidden' }, styles.cover, style]}>
      <StoryArt story={story} ratio={1} motifOpacity={0.8} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  cover: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#3A2C22' },
});
