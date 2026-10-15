import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, fonts, radius } from '../theme';

/**
 * A render error in a release build unmounts the tree and leaves the ivory
 * navigator background with nothing on it — the blank screen App Review hits
 * and cannot tap past. This keeps the failed screen's slot filled with a
 * retry, and because it wraps one tab's scene the tab bar outside it still
 * works.
 */
export default class ScreenErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, nonce: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  retry = () => {
    this.setState((s) => ({ error: null, nonce: s.nonce + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.error} testID="screen-error">
          <Text style={styles.title}>This screen didn't load.</Text>
          <Text style={styles.body}>You can try it again, or use another tab.</Text>
          <Pressable onPress={this.retry} style={styles.btn} testID="screen-error-retry" accessibilityRole="button">
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return <View key={this.state.nonce} style={styles.shell}>{this.props.children}</View>;
  }
}

const styles = StyleSheet.create({
  shell: { flex: 1 },
  error: { flex: 1, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.ink, textAlign: 'center' },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
  btn: { marginTop: 18, backgroundColor: colors.espresso, borderRadius: radius.pill, paddingVertical: 12, paddingHorizontal: 26, minHeight: 44, justifyContent: 'center' },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.onDark },
});
