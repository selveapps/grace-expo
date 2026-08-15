import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, RadialGradient, Stop, Rect, Path, Circle, G } from 'react-native-svg';
import { motifFor, motifElements } from './TeaMotif';

// Tea card art, drawn rather than licensed.
//
// This used to run dark: every card sat on an espresso-to-black gradient with a
// heavy scrim, and heat-3 cards were darker still. On a recording the whole
// surface read as one brown smear, which is what the "make this page mostly
// light" feedback is about. The ground is now warm ivory in every case, and the
// subject of the passage is drawn on it in brass line work (see TeaMotif).
//
// Art direction otherwise unchanged, and it still matters:
//   - warm ivory and brass, low saturation
//   - no faces, no depiction of people, no literal scene illustration
//   - deterministic from the tea id, so a card always looks like itself
//   - vector: no binary assets, no network, no licensing, sharp at any size

// Light grounds. `ink` is the brass used for the line art on top of each.
const PALETTES = [
  { a: '#FDF7EA', b: '#F2E6CD', c: '#E3D2AF', ink: '#9A7433', accent: '#C39B4E' }, // linen
  { a: '#FCF4E6', b: '#F0E2C6', c: '#DFCCA6', ink: '#946B2B', accent: '#BE9648' }, // parchment
  { a: '#FBF5EA', b: '#EFE4CD', c: '#DED0B0', ink: '#8F6A2C', accent: '#BB9346' }, // wheat
  { a: '#FEF8EC', b: '#F4E9D2', c: '#E5D6B6', ink: '#976E2E', accent: '#C29A4C' }, // dawn
];
// Heat 3 still reads hotter, but by warmth rather than by going dark, so the
// grid stays light end to end.
const EMBER = { a: '#FBEFDA', b: '#F2DEBB', c: '#E4C795', ink: '#8A5A22', accent: '#C0803A' };

function hash(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

/** The ground colours for a tea, exported so callers can tint chrome to match. */
export function teaPalette(tea) {
  if (tea?.heat === 3) return EMBER;
  return PALETTES[hash(tea?.id) % PALETTES.length];
}

// Motifs are authored on a 100 x 74 box. `MOTIF_FILL` leaves a margin so the
// object never touches the card edge.
const MOTIF_W = 100;
const MOTIF_H = 74;
const MOTIF_FILL = 0.82;
// Hooks and captions are laid along the BOTTOM of every Tea surface, so the
// object is seated high rather than dead centre. Centred, it sat directly behind
// the serif and both fought each other.
const MOTIF_BIAS_Y = 0.36;

/**
 * `ratio` is the frame's width/height. The viewBox is shaped to match it, so
 * preserveAspectRatio="slice" has almost nothing to crop. Without this a wide
 * hero scaled a tall viewBox up by ~2.5x and the motif filled the card as a
 * couple of unreadable arcs.
 */
export default function TeaArt({ tea, style, ratio = 0.56 }) {
  const art = useMemo(() => {
    const h = hash(tea?.id);
    return {
      p: teaPalette(tea),
      motif: motifFor(tea),
      orbX: 26 + ((h >>> 9) % 48),
      orbY: 16 + ((h >>> 12) % 18),
      rot: ((h >>> 3) % 14) - 7,
      flip: (h >>> 15) % 2 === 0 ? 1 : -1,
    };
  }, [tea?.id, tea?.heat]);

  const { p, motif, orbX, orbY, rot, flip } = art;

  const vbW = 100;
  const vbH = Math.max(40, Math.round(100 / Math.max(0.2, ratio)));
  // Fit the motif inside the frame whatever its shape, then centre it.
  const scale = Math.min(vbW / MOTIF_W, vbH / MOTIF_H) * MOTIF_FILL;
  const mx = (vbW - MOTIF_W * scale) / 2;
  const my = Math.max(2, vbH * MOTIF_BIAS_Y - (MOTIF_H * scale) / 2);
  const arcY = Math.round(vbH * 0.84);

  // Gradient ids must be unique per instance. They were the literal strings
  // "ground" and "orb", so in the two-column archive every card after the first
  // resolved url(#ground) to the FIRST card's gradient and the whole grid came
  // out one colour.
  const uid = `ta${hash(tea?.id ?? 'x').toString(36)}`;

  return (
    <View style={[StyleSheet.absoluteFill, style]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${vbW} ${vbH}`} preserveAspectRatio="xMidYMid slice">
        <Defs>
          <LinearGradient id={`${uid}-ground`} x1="0" y1="0" x2="0.25" y2="1">
            <Stop offset="0%" stopColor={p.a} />
            <Stop offset="58%" stopColor={p.b} />
            <Stop offset="100%" stopColor={p.c} />
          </LinearGradient>
          <RadialGradient id={`${uid}-orb`} cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="#FFFDF4" stopOpacity="0.95" />
            <Stop offset="65%" stopColor="#FFF6E2" stopOpacity="0.35" />
            <Stop offset="100%" stopColor="#FFF6E2" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width={vbW} height={vbH} fill={`url(#${uid}-ground)`} />

        {/* One warm light source, as before: it is what makes the set cohere. */}
        <Circle cx={orbX} cy={orbY} r={Math.max(34, vbH * 0.3)} fill={`url(#${uid}-orb)`} />

        {/* The subject of the passage, fitted and centred in the frame. */}
        <G translate={`${mx}, ${my}`} opacity="0.6">
          <G scale={scale}>
            <G rotation={rot} origin={`${MOTIF_W / 2}, ${MOTIF_H / 2}`}>
              {motifElements(motif, p.ink, p.accent)}
            </G>
          </G>
        </G>

        {/* A single low horizon, to seat the object rather than float it. */}
        <Path
          d={`M -10 ${arcY} Q 50 ${arcY - 14 * flip} 110 ${arcY}`}
          stroke={p.accent}
          strokeWidth="0.6"
          fill="none"
          opacity="0.3"
        />

        {/* Grain: keeps large flat areas from banding on an OLED recording. */}
        <G opacity="0.1">
          {Array.from({ length: 30 }, (_, i) => {
            const g = hash(`${tea?.id}${i}`);
            return (
              <Circle
                key={i}
                cx={(g % 100)}
                cy={((g >>> 7) % vbH)}
                r={0.3 + ((g >>> 14) % 3) * 0.24}
                fill={i % 3 === 0 ? '#FFFFFF' : p.ink}
              />
            );
          })}
        </G>
      </Svg>
    </View>
  );
}
