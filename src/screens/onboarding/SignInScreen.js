import React, { useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, ActivityIndicator, TextInput,
  KeyboardAvoidingView, Platform, ScrollView, Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Svg, { Path } from 'react-native-svg';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import { AuthService } from '../../services';
import { colors, fonts, radius } from '../../theme';

const AppleMark = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="#fff">
    <Path d="M17.05 12.5c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.7-1.3-.1-2.5.8-3.1.8-.6 0-1.6-.7-2.7-.7-1.4 0-2.7.8-3.4 2-1.5 2.5-.4 6.3 1 8.3.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.7 2.7-.7 1.2 0 1.6.7 2.7.6 1.1 0 1.8-1 2.5-2 .8-1.2 1.1-2.3 1.1-2.4-.1 0-2.1-.8-2.1-3.4zM15 6.3c.6-.7 1-1.7.9-2.7-.9 0-1.9.6-2.5 1.3-.5.6-1 1.6-.9 2.6 1 0 1.9-.5 2.5-1.2z" />
  </Svg>
);

// A request that cannot hang the screen. /auth/guest or /me stalling used to
// leave the button spinning with no way out.
const TIMEOUT_MS = 20000;
const withTimeout = (p) => Promise.race([
  p,
  new Promise((resolve) => setTimeout(() => resolve({ ok: false, error: 'timeout' }), TIMEOUT_MS)),
]);

const MESSAGES = {
  apple_unavailable: 'Sign in with Apple needs the App Store build. Use your email below for now.',
  invalid_email: 'That email does not look right. Check it and try again.',
  timeout: "That took too long. Check your connection and try again.",
  default: "That didn't go through. Please try again.",
};

/**
 * The onboarding gate.
 *
 * Two deliberate properties:
 *
 * 1. It is a real gate. This screen used to call advance() BEFORE awaiting the
 *    provider and swallow the result, so a declined sheet, a failed link or an
 *    offline server all completed onboarding exactly like a success. It also
 *    carried a "Skip for now" CTA straight past it. Nothing advances now unless
 *    the provider reports ok.
 *
 * 2. It does not overclaim. There is no "Continue with Google" button, because
 *    the code behind it never talked to Google: it linked a hardcoded gmail
 *    address to the guest account. Apple is genuine. Email is described as
 *    remembering an address, which is all it does.
 */
export default function SignInScreen({ navigation }) {
  const [busy, setBusy] = useState(null); // 'apple' | 'email' | null
  const [error, setError] = useState(null);
  const [emailOpen, setEmailOpen] = useState(false);
  const [email, setEmail] = useState('');
  const lastAttempt = useRef(null); // replayed by Try again

  const run = async (provider, fn) => {
    if (busy) return;
    lastAttempt.current = { provider, fn };
    setBusy(provider);
    setError(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let res;
    try {
      res = await withTimeout(Promise.resolve(fn()));
    } catch {
      res = { ok: false };
    }
    // Always cleared, on every path: no spinner can outlive the attempt.
    setBusy(null);

    if (res?.ok) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate('Preparing');
      return;
    }
    // Backing out of the provider sheet is a choice, not a failure: no message.
    if (res?.cancelled) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    setError(MESSAGES[res?.error] || MESSAGES.default);
    // Apple is not going to become available by retrying, so send her to email.
    if (res?.error === 'apple_unavailable') setEmailOpen(true);
  };

  const retry = () => {
    const a = lastAttempt.current;
    if (!a || busy) return;
    run(a.provider, a.fn);
  };

  const submitEmail = () => {
    Keyboard.dismiss();
    run('email', () => AuthService.signInWithEmail(email));
  };

  return (
    <Screen gradient={['#FDFBF6', '#F7F3EC']} style={styles.wrap} ambient>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" bounces={false}>
          {/* The only way off this screen other than signing in: back to the
              onboarding step she came from, never forward into the app. */}
          {navigation.canGoBack() ? (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); navigation.goBack(); }}
              hitSlop={12}
              style={styles.backHit}
              accessibilityRole="button"
              accessibilityLabel="Back"
              testID="signin-back"
            >
              <Text style={styles.back}>‹ Back</Text>
            </Pressable>
          ) : <View style={styles.backHit} />}

          <View style={{ alignItems: 'center' }}>
            <GraceDove size={110} wings="folded" motion="breathe" />
            <Text style={styles.title}>Keep your place,{'\n'}always.</Text>
            <Text style={styles.sub}>
              Sign in with Apple so Grace remembers you across every device you pick up.
            </Text>
          </View>

          <View style={styles.spacer} />

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.error}>{error}</Text>
              {lastAttempt.current ? (
                <Pressable onPress={retry} hitSlop={8} style={styles.retry} testID="signin-retry">
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null}

          <Pressable
            testID="signin-apple"
            onPress={() => run('apple', () => AuthService.signInWithApple())}
            disabled={!!busy}
            style={[styles.btn, { backgroundColor: '#1C1C1E' }, busy && busy !== 'apple' && styles.btnDim]}
          >
            {busy === 'apple' ? <ActivityIndicator color="#fff" /> : (
              <>
                <AppleMark />
                <Text style={[styles.btnText, { color: '#fff' }]}>Continue with Apple</Text>
              </>
            )}
          </Pressable>

          {!emailOpen ? (
            <Pressable
              onPress={() => { Haptics.selectionAsync(); setEmailOpen(true); }}
              disabled={!!busy}
              style={styles.emailToggle}
              testID="signin-email-open"
            >
              <Text style={styles.email}>Use my email instead</Text>
            </Pressable>
          ) : (
            <View style={styles.emailBlock}>
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); if (error) setError(null); }}
                placeholder="you@example.com"
                placeholderTextColor={colors.textFaint}
                style={styles.input}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={submitEmail}
                editable={!busy}
                testID="signin-email-input"
              />
              <Pressable
                testID="signin-email-submit"
                onPress={submitEmail}
                disabled={!!busy}
                style={[styles.btn, styles.btnLight, busy && busy !== 'email' && styles.btnDim]}
              >
                {busy === 'email'
                  ? <ActivityIndicator color={colors.ink} />
                  : <Text style={[styles.btnText, { color: colors.ink }]}>Continue</Text>}
              </Pressable>
              {/* Says exactly what this does. It is not a verified sign-in. */}
              <Text style={styles.emailNote}>
                We'll remember you by this address. No password, and we won't email you to verify it.
              </Text>
            </View>
          )}

          <Text style={styles.legal}>By continuing you agree to our Terms & Privacy Policy.</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 14, paddingBottom: 20 },
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 8 },
  title: { fontFamily: fonts.serif, fontSize: 36, color: colors.ink, textAlign: 'center', marginTop: 16, lineHeight: 40 },
  sub: { fontFamily: fonts.sans, fontSize: 15, color: colors.textMuted, textAlign: 'center', marginTop: 10, paddingHorizontal: 12, lineHeight: 22 },
  spacer: { flexGrow: 1, minHeight: 20 },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 17, borderRadius: radius.md, marginBottom: 12, minHeight: 44 },
  btnLight: { backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.cardBorder },
  btnDim: { opacity: 0.55 },
  btnText: { fontFamily: fonts.sansSemi, fontSize: 17 },
  emailToggle: { paddingVertical: 12, minHeight: 44, justifyContent: 'center' },
  email: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.textFaint, textAlign: 'center' },
  emailBlock: { marginBottom: 4 },
  input: {
    fontFamily: fonts.sans, fontSize: 16, color: colors.ink,
    backgroundColor: colors.white, borderWidth: 1.5, borderColor: colors.cardBorder,
    borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 15, marginBottom: 12, minHeight: 44,
  },
  emailNote: { fontFamily: fonts.sans, fontSize: 12, lineHeight: 17, color: colors.textFaint, textAlign: 'center', paddingHorizontal: 6 },
  backHit: { minHeight: 40, justifyContent: 'center', alignSelf: 'flex-start' },
  back: { fontFamily: fonts.sansMed, fontSize: 15, color: colors.textMuted },
  errorBox: { marginBottom: 12, alignItems: 'center' },
  error: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 20, color: colors.danger, textAlign: 'center' },
  retry: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 18, marginTop: 4 },
  retryText: { fontFamily: fonts.sansSemi, fontSize: 15, color: colors.brassDeep },
  legal: { fontFamily: fonts.sans, fontSize: 12, color: '#B3A690', textAlign: 'center', marginTop: 10, lineHeight: 18 },
});
