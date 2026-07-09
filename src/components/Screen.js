import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

// Screen wrapper. Pass `gradient` for a two-stop bg, or `bg` for a solid color.
// `dark` flips the status-bar area handling. `edges` controls safe-area edges.
export default function Screen({ children, bg = colors.ivory, gradient, style, edges = ['top', 'bottom'] }) {
  if (gradient) {
    return (
      <LinearGradient colors={gradient} style={styles.fill}>
        <SafeAreaView style={[styles.fill, style]} edges={edges}>{children}</SafeAreaView>
      </LinearGradient>
    );
  }
  return (
    <View style={[styles.fill, { backgroundColor: bg }]}>
      <SafeAreaView style={[styles.fill, style]} edges={edges}>{children}</SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({ fill: { flex: 1 } });
