import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { colors } from '../theme';

/**
 * Root-level catch. Without it, a render error anywhere above the tab
 * boundaries (onboarding, navigator, providers) unmounts the whole tree in a
 * release build and leaves a blank page. Uses system fonts on purpose: the
 * failure may be the custom fonts themselves.
 */
export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, nonce: 0 };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch() {
    SplashScreen.hideAsync().catch(() => {});
  }

  retry = () => {
    this.setState((s) => ({ error: null, nonce: s.nonce + 1 }));
  };

  render() {
    if (this.state.error) {
      return (
        <View style={styles.error} testID="app-error">
          <Text style={styles.title}>Grace needs a moment.</Text>
          <Text style={styles.body}>Something didn't load. Tap below to try again.</Text>
          <Pressable onPress={this.retry} style={styles.btn} testID="app-error-retry" accessibilityRole="button">
            <Text style={styles.btnText}>Try again</Text>
          </Pressable>
        </View>
      );
    }
    return <React.Fragment key={this.state.nonce}>{this.props.children}</React.Fragment>;
  }
}

const styles = StyleSheet.create({
  error: { flex: 1, backgroundColor: colors.ivory, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  title: { fontSize: 26, fontWeight: '600', color: colors.ink, textAlign: 'center' },
  body: { fontSize: 15, lineHeight: 22, color: colors.textMuted, textAlign: 'center', marginTop: 10 },
  btn: { marginTop: 18, backgroundColor: colors.espresso, borderRadius: 999, paddingVertical: 12, paddingHorizontal: 26, minHeight: 44, justifyContent: 'center' },
  btnText: { fontSize: 15, fontWeight: '600', color: colors.onDark },
});
