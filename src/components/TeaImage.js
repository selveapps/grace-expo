import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import TeaArt from './TeaArt';
import { getApiBase } from '../api/client';

// Art direction: warm ivory and brass, no faces and no literal Bible-scene
// illustration. Until commissioned stills land, every card gets TeaArt's drawn
// treatment, which is deterministic from the tea id, so the layout is honest and
// a missing file never shows as a broken image.
//
// The scrim is now a LIGHT wash rather than a dark one. Cards used to be ivory
// art buried under `rgba(43,32,21,0.55)`, which is why the whole Tea surface
// photographed as brown. Hooks are set in ink on top instead of ivory.
const LIGHT_VEIL = 'rgba(253,247,234,0.2)';

/**
 * Full-bleed Tea art with a wash so the serif hook stays legible on top.
 * Falls back to the drawn art when no still exists or the image fails to load.
 */
// `focal` decides which part of the still survives the crop. Tea Detail puts
// captions along the bottom, so art anchored 'top' keeps its subject clear of
// the text instead of being centre-cropped into it.
//
// React Native has no objectPosition, so this is done by over-sizing the image
// against the frame and pinning it to the chosen edge; `cover` then crops away
// the opposite end. No measurement or transforms needed.
const FOCAL_OVERSCAN = '118%';
function focalStyle(focal) {
  if (focal === 'top') return { position: 'absolute', left: 0, right: 0, top: 0, height: FOCAL_OVERSCAN };
  if (focal === 'bottom') return { position: 'absolute', left: 0, right: 0, bottom: 0, height: FOCAL_OVERSCAN };
  return StyleSheet.absoluteFillObject;
}

export default function TeaImage({ tea, style, scrim, children }) {
  const [failed, setFailed] = useState(false);
  // Measured so the drawn art can shape its viewBox to this frame. A hero, a
  // grid tile and a full-screen detail are very different shapes, and a single
  // fixed viewBox meant the motif was cropped and over-zoomed in most of them.
  const [ratio, setRatio] = useState(null);
  const onLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      const next = width / height;
      // Ignore sub-pixel churn so we are not re-rendering the art constantly.
      setRatio((prev) => (prev && Math.abs(prev - next) < 0.02 ? prev : next));
    }
  };

  const uri = !failed && tea?.image
    ? (tea.image.startsWith('http') ? tea.image : `${getApiBase()}${tea.image}`)
    : null;
  // Per-image override first, then the caller's, then the light default.
  const veil = tea?.scrim ?? scrim ?? LIGHT_VEIL;

  return (
    <View style={[styles.wrap, style]} onLayout={onLayout}>
      {/* Drawn editorial treatment; a real still layers on top when present. */}
      <TeaArt tea={tea} ratio={ratio ?? 0.8} />
      {uri ? (
        <Image
          source={{ uri }}
          // Keeps the subject clear of the caption block on a vertical recording.
          style={focalStyle(tea?.focal)}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : null}
      {veil ? <View style={[StyleSheet.absoluteFill, { backgroundColor: veil }]} /> : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
