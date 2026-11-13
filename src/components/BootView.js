import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

/**
 * Shown in place of `null` while the app boots (fonts, local profile). It
 * matches the native splash colour so the hand-off is seamless, and carries a
 * spinner so a slow boot never reads as a blank, frozen page.
 */
export default function BootView() {
  return (
    <View style={styles.fill} testID="boot-view">
      <ActivityIndicator color={colors.brass} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.white, alignItems: 'center', justifyContent: 'center' },
});
