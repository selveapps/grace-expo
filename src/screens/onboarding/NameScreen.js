import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, Animated, Easing, KeyboardAvoidingView,
  ScrollView, Platform, TouchableWithoutFeedback, Keyboard,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { colors, fonts } from '../../theme';

export default function NameScreen({ navigation }) {
  const { profile, setProfile } = useProfile();
  const [name, setName] = useState(profile.name || '');
  const [error, setError] = useState(false);
  const inputRef = useRef(null);
  const tilt = useRef(new Animated.Value(0)).current;

  const listen = (on) => Animated.timing(tilt, { toValue: on ? 1 : 0, duration: 340, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

  const onContinue = () => {
    Keyboard.dismiss();
    const trimmed = name.trim();
    if (!trimmed) {
      setError(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
      inputRef.current?.focus();
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setProfile((p) => ({ ...p, name: trimmed }));
    navigation.navigate('Carry');
  };

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '7deg'] });
  const translateY = tilt.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  return (
    <Screen bg={colors.ivory} edges={['top', 'bottom']} style={styles.fill} ambient>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            <Animated.View style={{ alignItems: 'center', transform: [{ rotate }, { translateY }] }}>
              <GraceDove size={112} crop="head" motion="peek" />
            </Animated.View>
            <Text style={styles.title}>What should I call you?</Text>
            <TextInput
              ref={inputRef}
              value={name}
              onChangeText={(v) => { setName(v); if (error) setError(false); }}
              onFocus={() => listen(true)}
              onBlur={() => listen(false)}
              placeholder="Your name"
              placeholderTextColor={colors.textFaint}
              style={[styles.input, error && { borderBottomColor: colors.danger }]}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              textContentType="givenName"
              returnKeyType="done"
              blurOnSubmit={false}
              onSubmitEditing={onContinue}
            />
            {name.trim().length > 0 ? (
              <Text style={styles.glad}>I'm glad you're here, {name.trim()}.</Text>
            ) : error ? (
              <Text style={styles.hint}>Tell me what to call you first.</Text>
            ) : null}
            <View style={styles.spacer} />
            <PrimaryButton label="Continue" onPress={onContinue} testID="name-continue" />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 30, paddingBottom: 30 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, textAlign: 'center', marginTop: 22, lineHeight: 42 },
  input: {
    fontFamily: fonts.serif,
    fontSize: 30,
    color: colors.ink,
    borderBottomWidth: 2,
    borderBottomColor: colors.brass,
    paddingVertical: 10,
    marginTop: 40,
    textAlign: 'center',
    minHeight: 52,
  },
  glad: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.brass, marginTop: 22, textAlign: 'center' },
  hint: { fontFamily: fonts.sans, fontSize: 15, color: colors.danger, marginTop: 22, textAlign: 'center' },
  spacer: { flexGrow: 1, minHeight: 24 },
});
