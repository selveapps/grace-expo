import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getApiBase } from '../api/client';

// Art direction: warm ivory/brass still lifes and textures, no faces and no
// literal Bible-scene illustration. Until the 30 stills land, every card gets a
// deterministic texture gradient derived from its id, so the layout is honest
// and a missing file never shows as a broken image.
const PALETTES = [
  ['#EFE0C0', '#D9C49A'],  // linen
  ['#E3D6BE', '#C4A97A'],  // parchment
  ['#DCCDB2', '#B58A3F'],  // brass vessel
  ['#E7DDCD', '#C9B48C'],  // harvest wheat
  ['#D9CBB6', '#A9855A'],  // olive wood
  ['#EBDCC2', '#CBA96C'],  // dawn window
];
const ESPRESSO = [
  ['#4A382C', '#241a11'],
  ['#3A2C22', '#1f1710'],
];

function hash(id = '') {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return h;
}

export function teaGradient(tea) {
  // heat 3 reads visibly wilder: the card goes espresso instead of warm ivory.
  const pool = tea?.heat === 3 ? ESPRESSO : PALETTES;
  return pool[hash(tea?.id) % pool.length];
}

/**
 * Full-bleed Tea art with a scrim so the serif hook stays legible on top.
 * Falls back to the gradient when the image is absent or fails to load.
 */
export default function TeaImage({ tea, style, scrim = 'rgba(43,32,21,0.55)', children }) {
  const [failed, setFailed] = useState(false);
  const uri = !failed && tea?.image
    ? (tea.image.startsWith('http') ? tea.image : `${getApiBase()}${tea.image}`)
    : null;

  return (
    <View style={[styles.wrap, style]}>
      <LinearGradient colors={teaGradient(tea)} style={StyleSheet.absoluteFill} />
      {uri ? (
        <Image
          source={{ uri }}
          style={StyleSheet.absoluteFill}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: scrim }]} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
});
