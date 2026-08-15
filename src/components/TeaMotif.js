import React from 'react';
import Svg, { G, Path, Circle, Rect, Line, Ellipse } from 'react-native-svg';

// Passage-relevant line art for Tea cards.
//
// The previous art direction was deliberately abstract: an orb plus two brass
// arcs, seeded from the tea id. On a recording that read as a brown blur with no
// connection to the story being told, which is what the "throw in relevant
// pictorial background" feedback is about.
//
// These motifs keep the original brief's constraints, which still matter:
//   - warm brass line work, low saturation, no faces
//   - no literal Bible-scene illustration, no depiction of people
//   - vector only: no binaries, no licensing, no network, sharp at any size
// What changes is that the object on the card is now the object in the passage.
// A woman is never drawn; the thing she is remembered for is.
//
// Drawn on a 0..100 x 0..70 box. TeaArt places it in its own viewBox.

const M = {
  // A crown, for the queens: Vashti's refusal, Esther's court.
  crown: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M26 46 L22 22 L36 34 L50 16 L64 34 L78 22 L74 46 Z" fill={a} fillOpacity="0.18" />
      <Line x1="24" y1="52" x2="76" y2="52" />
      <Circle cx="50" cy="16" r="2.4" fill={c} strokeWidth="0" />
      <Circle cx="22" cy="22" r="2" fill={c} strokeWidth="0" />
      <Circle cx="78" cy="22" r="2" fill={c} strokeWidth="0" />
    </G>
  ),

  // The golden sceptre held out to Esther: the difference between life and death.
  sceptre: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <Line x1="30" y1="58" x2="68" y2="20" />
      <Circle cx="71" cy="17" r="6" fill={a} fillOpacity="0.22" />
      <Circle cx="71" cy="17" r="2" fill={c} strokeWidth="0" />
      <Line x1="26" y1="62" x2="34" y2="54" strokeWidth="2.2" />
    </G>
  ),

  // Barley at harvest, where Ruth gleaned.
  wheat: (c, a) => (
    <G stroke={c} strokeWidth="1.2" fill="none" strokeLinecap="round">
      {[36, 50, 64].map((x, i) => (
        <G key={x}>
          <Line x1={x} y1="62" x2={x} y2={26 + i % 2 * 5} />
          {[0, 1, 2, 3].map((k) => (
            <G key={k}>
              <Path d={`M${x} ${32 + k * 8 + (i % 2) * 3} q -7 -3 -8 -9`} />
              <Path d={`M${x} ${32 + k * 8 + (i % 2) * 3} q 7 -3 8 -9`} />
            </G>
          ))}
        </G>
      ))}
      <Path d="M28 62 q22 6 44 0" stroke={a} strokeOpacity="0.5" />
    </G>
  ),

  // The palm Deborah judged Israel under.
  palm: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round">
      <Path d="M50 62 q-3 -20 1 -34" />
      {[-1, 1].map((s) => (
        <G key={s}>
          <Path d={`M51 26 q ${18 * s} -10 ${30 * s} 2`} />
          <Path d={`M51 27 q ${20 * s} -2 ${28 * s} 12`} />
          <Path d={`M51 25 q ${10 * s} -14 ${14 * s} -18`} />
        </G>
      ))}
      <Ellipse cx="50" cy="63" rx="16" ry="2.6" fill={a} fillOpacity="0.22" strokeWidth="0" />
    </G>
  ),

  // An alabaster jar: the widow's oil, the perfume poured out at his feet.
  jar: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M42 18 h16 v6 q10 8 10 22 q0 16 -18 16 q-18 0 -18 -16 q0 -14 10 -22 z" fill={a} fillOpacity="0.18" />
      <Line x1="40" y1="24" x2="60" y2="24" />
      <Path d="M44 44 q6 4 12 0" stroke={a} strokeOpacity="0.6" />
    </G>
  ),

  // Loaves: Abigail's provisions, the crumbs the Canaanite mother asked for.
  bread: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round">
      <Path d="M26 50 q6 -16 24 -16 q18 0 24 16 q-24 8 -48 0 z" fill={a} fillOpacity="0.18" />
      <Path d="M38 38 l4 8M50 35 l0 9M62 38 l-4 8" strokeOpacity="0.7" />
      <Line x1="22" y1="56" x2="78" y2="56" stroke={a} strokeOpacity="0.5" />
      <Circle cx="30" cy="62" r="1.4" fill={c} strokeWidth="0" />
      <Circle cx="38" cy="63" r="1" fill={c} strokeWidth="0" />
    </G>
  ),

  // A lily, for the annunciation.
  lily: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round">
      <Path d="M50 62 q-2 -18 0 -26" />
      <Path d="M50 36 q-14 -6 -12 -20 q10 2 12 20" fill={a} fillOpacity="0.16" />
      <Path d="M50 36 q14 -6 12 -20 q-10 2 -12 20" fill={a} fillOpacity="0.16" />
      <Path d="M50 34 q-4 -18 0 -24 q4 6 0 24" fill={a} fillOpacity="0.2" />
      <Path d="M50 50 q-9 -2 -13 4M50 54 q9 -2 13 4" strokeOpacity="0.7" />
    </G>
  ),

  // An oil lamp: the room prepared for a prophet, a house kept at night.
  lamp: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M30 50 q0 -12 20 -12 q20 0 20 12 q0 6 -20 6 q-20 0 -20 -6 z" fill={a} fillOpacity="0.18" />
      <Path d="M70 46 q10 2 12 6" />
      <Path d="M82 52 q3 -6 0 -11" stroke={a} strokeWidth="1.8" />
      <Line x1="34" y1="60" x2="66" y2="60" />
      <Circle cx="50" cy="30" r="2" fill={a} fillOpacity="0.5" strokeWidth="0" />
    </G>
  ),

  // A well: Samaria at the sixth hour, Hagar's spring in the wilderness.
  well: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="32" y="42" width="36" height="20" rx="2" fill={a} fillOpacity="0.16" />
      <Ellipse cx="50" cy="42" rx="18" ry="5" />
      <Line x1="38" y1="42" x2="38" y2="18" />
      <Line x1="62" y1="42" x2="62" y2="18" />
      <Path d="M34 18 h32" />
      <Line x1="50" y1="18" x2="50" y2="30" strokeWidth="0.9" />
      <Path d="M45 30 h10 v6 h-10 z" fill={a} fillOpacity="0.3" />
    </G>
  ),

  // The stone rolled back, and an opening left empty.
  tomb: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M30 62 v-18 q0 -18 20 -18 q20 0 20 18 v18" fill={a} fillOpacity="0.1" />
      <Path d="M40 62 v-14 q0 -10 10 -10 q10 0 10 10 v14" fill={c} fillOpacity="0.22" />
      <Circle cx="80" cy="52" r="11" fill={a} fillOpacity="0.2" />
      <Line x1="22" y1="63" x2="88" y2="63" stroke={a} strokeOpacity="0.5" />
    </G>
  ),

  // The scarlet cord in the window on the wall.
  cord: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="24" y="14" width="52" height="30" rx="2" fill={a} fillOpacity="0.12" />
      <Line x1="50" y1="14" x2="50" y2="44" strokeWidth="0.9" />
      <Line x1="24" y1="29" x2="76" y2="29" strokeWidth="0.9" />
      <Path d="M62 40 q6 10 -2 22" stroke={a} strokeWidth="2.4" />
      <Line x1="18" y1="48" x2="82" y2="48" strokeOpacity="0.6" />
    </G>
  ),

  // A tent: Jael's doorway, Sarah listening at the flap.
  tent: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M20 60 L50 18 L80 60 Z" fill={a} fillOpacity="0.16" />
      <Path d="M50 18 L50 60" strokeOpacity="0.5" />
      <Path d="M44 60 q6 -18 12 0" fill={c} fillOpacity="0.2" />
      <Line x1="14" y1="61" x2="86" y2="61" />
      <Line x1="84" y1="52" x2="90" y2="61" strokeWidth="1" />
    </G>
  ),

  // A veil set aside at the roadside.
  veil: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round">
      <Path d="M28 20 q22 -8 44 0 q4 24 -6 42 q-16 6 -32 0 q-10 -18 -6 -42 z" fill={a} fillOpacity="0.16" />
      <Path d="M36 26 q14 -4 28 0" strokeOpacity="0.6" />
      <Path d="M34 40 q16 6 32 0" strokeOpacity="0.5" />
      <Path d="M32 52 q18 7 36 0" strokeOpacity="0.4" />
    </G>
  ),

  // A timbrel, picked up on the far shore.
  timbrel: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round">
      <Circle cx="50" cy="38" r="20" fill={a} fillOpacity="0.16" />
      <Circle cx="50" cy="38" r="14" strokeOpacity="0.5" />
      {[0, 60, 120, 180, 240, 300].map((d) => {
        const r = (d * Math.PI) / 180;
        return (
          <Circle
            key={d}
            cx={50 + Math.cos(r) * 20}
            cy={38 + Math.sin(r) * 20}
            r="2.6"
            fill={c}
            fillOpacity="0.5"
            strokeWidth="0"
          />
        );
      })}
    </G>
  ),

  // Folded cloth: a hem reached for, purple sold, coats sewn for widows.
  cloth: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M24 26 h52 v10 q-26 8 -52 0 z" fill={a} fillOpacity="0.2" />
      <Path d="M24 38 q26 8 52 0 v10 q-26 8 -52 0 z" fill={a} fillOpacity="0.14" />
      <Path d="M24 50 q26 8 52 0 v8 q-26 8 -52 0 z" fill={a} fillOpacity="0.1" />
      <Line x1="30" y1="20" x2="30" y2="26" strokeOpacity="0.5" />
      <Line x1="70" y1="20" x2="70" y2="26" strokeOpacity="0.5" />
    </G>
  ),

  // Temple columns, where Anna waited night and day.
  columns: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Path d="M18 22 h64" />
      <Path d="M22 22 L50 8 L78 22" fill={a} fillOpacity="0.14" />
      {[30, 50, 70].map((x) => (
        <G key={x}>
          <Line x1={x} y1="26" x2={x} y2="58" strokeWidth="2" />
          <Line x1={x - 5} y1="26" x2={x + 5} y2="26" />
          <Line x1={x - 5} y1="58" x2={x + 5} y2="58" />
        </G>
      ))}
      <Line x1="16" y1="62" x2="84" y2="62" />
    </G>
  ),

  // A scroll: the law found in the temple, the letter carried to Rome.
  scroll: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Rect x="26" y="22" width="48" height="34" rx="2" fill={a} fillOpacity="0.18" />
      <Circle cx="26" cy="22" r="5" />
      <Circle cx="74" cy="22" r="5" />
      <Circle cx="26" cy="56" r="5" />
      <Circle cx="74" cy="56" r="5" />
      <Line x1="36" y1="33" x2="64" y2="33" strokeWidth="0.9" strokeOpacity="0.6" />
      <Line x1="36" y1="39" x2="64" y2="39" strokeWidth="0.9" strokeOpacity="0.6" />
      <Line x1="36" y1="45" x2="56" y2="45" strokeWidth="0.9" strokeOpacity="0.6" />
    </G>
  ),

  // Two mites, and the purses that funded a ministry.
  coins: (c, a) => (
    <G stroke={c} strokeWidth="1.4" fill="none">
      <Circle cx="40" cy="34" r="12" fill={a} fillOpacity="0.2" />
      <Circle cx="40" cy="34" r="6" strokeOpacity="0.5" />
      <Circle cx="62" cy="46" r="12" fill={a} fillOpacity="0.2" />
      <Circle cx="62" cy="46" r="6" strokeOpacity="0.5" />
      <Line x1="24" y1="62" x2="76" y2="62" stroke={a} strokeOpacity="0.5" strokeLinecap="round" />
    </G>
  ),

  // Boundary stones: the inheritance five sisters argued for and won.
  stones: (c, a) => (
    <G stroke={c} strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round">
      {[24, 37, 50, 63, 76].map((x, i) => (
        <Path
          key={x}
          d={`M${x - 5} 56 q0 -${12 + (i % 2) * 5} 5 -${12 + (i % 2) * 5} q5 0 5 ${12 + (i % 2) * 5} z`}
          fill={a}
          fillOpacity={0.14 + (i % 2) * 0.06}
        />
      ))}
      <Line x1="16" y1="56" x2="84" y2="56" />
      <Path d="M16 62 q34 5 68 0" stroke={a} strokeOpacity="0.45" />
    </G>
  ),
};

/**
 * Tea id -> motif. Chosen from what the passage is actually about, so a card
 * about the widow's oil shows a jar and a card about a lost scroll shows a
 * scroll. Anything unmapped falls back to `lamp`, which is generic enough to
 * never look wrong.
 */
export const TEA_MOTIF = {
  'vashti-no': 'crown',
  'ruth-field': 'wheat',
  'deborah-palm': 'palm',
  'abigail-intercept': 'bread',
  'mary-yes': 'lily',
  'martha-mary': 'lamp',
  'well-woman': 'well',
  'esther-uninvited': 'sceptre',
  'hannah-prayer': 'columns',
  'magdalene-first': 'tomb',
  'rahab-rope': 'cord',
  'jael-tent': 'tent',
  'tamar-veil': 'veil',
  'miriam-song': 'timbrel',
  shunammite: 'lamp',
  'widow-oil': 'jar',
  'bleeding-woman': 'cloth',
  'canaanite-mother': 'bread',
  'anna-temple': 'columns',
  'lydia-house': 'cloth',
  'priscilla-teach': 'scroll',
  'sarah-laugh': 'tent',
  'hagar-seen': 'well',
  zelophehad: 'stones',
  'huldah-scroll': 'scroll',
  'widow-mite': 'coins',
  'joanna-fund': 'coins',
  'dorcas-needle': 'cloth',
  'phoebe-letter': 'scroll',
  'mary-perfume': 'jar',
};

export function motifFor(tea) {
  return TEA_MOTIF[tea?.id] ?? 'lamp';
}

/**
 * Standalone motif, for surfaces that want the object without the full card art.
 * `size` is the square edge in points.
 */
export default function TeaMotif({ tea, name, size = 64, color = '#8F6A2C', accent = '#B58A3F', opacity = 1, style }) {
  const key = name ?? motifFor(tea);
  const draw = M[key] ?? M.lamp;
  return (
    <Svg width={size} height={size} viewBox="0 0 100 74" style={style} opacity={opacity}>
      {draw(color, accent)}
    </Svg>
  );
}

/** The raw element set, for embedding inside another <Svg> (see TeaArt). */
export function motifElements(key, color, accent) {
  const draw = M[key] ?? M.lamp;
  return draw(color, accent);
}
