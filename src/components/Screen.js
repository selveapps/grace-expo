import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import AmbientBackdrop from './AmbientBackdrop';
import { colors } from '../theme';

// Screen wrapper. Pass `gradient` for a two-stop bg, or `bg` for a solid color.
// `edges` controls safe-area edges. `ambient` mounts drifting motes behind
// non-reading screens (excluded on the reader so scripture stays legible).
export default function Screen({ children, bg = colors.ivory, gradient, style, edges = ['top', 'bottom'], ambient = false }) {
  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={styles.fill}>
        {ambient && <AmbientBackdrop />}
        <SafeAreaView style={[styles.fill, style]} edges={edges}>{children}</SafeAreaView>
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      {ambient && <AmbientBackdrop />}
      <SafeAreaView style={[styles.fill, style]} edges={edges}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
