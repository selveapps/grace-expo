import React, { useState, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import Screen from '../../components/Screen';
import GraceDove from '../../components/GraceDove';
import PrimaryButton from '../../components/PrimaryButton';
import { useProfile } from '../../state/profile';
import { colors, fonts } from '../../theme';

// Name — Grace's face + halo sits at the top and tilts to listen while you type.
export default function NameScreen({ navigation }) {
  const { profile, setProfile } = useProfile();
  const [name, setName] = useState(profile.name || '');
  const [error, setError] = useState(false);
  const tilt = useRef(new Animated.Value(0)).current; // 0 rest, 1 listening

  const listen = (on) => Animated.timing(tilt, { toValue: on ? 1 : 0, duration: 340, easing: Easing.out(Easing.ease), useNativeDriver: true }).start();

  const onContinue = () => {
    if (!name.trim()) {
      setError(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); // gentle, not harsh
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // warm confirmation
    setProfile((p) => ({ ...p, name: name.trim() }));
    navigation.navigate('Carry');
  };

  const rotate = tilt.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '7deg'] });
  const translateY = tilt.interpolate({ inputRange: [0, 1], outputRange: [0, 6] });

  return (
    <Screen bg={colors.ivory} style={styles.wrap}>
      <Animated.View style={{ alignItems: 'center', transform: [{ rotate }, { translateY }] }}>
        <GraceDove size={112} crop="head" motion="peek" />
      </Animated.View>
      <Text style={styles.title}>What should I call you?</Text>
      <TextInput
        value={name}
        onChangeText={(v) => { setName(v); if (error) setError(false); }}
        onFocus={() => listen(true)}
        onBlur={() => listen(false)}
        placeholder="Your name"
        placeholderTextColor={colors.textFaint}
        style={[styles.input, error && { borderBottomColor: colors.danger }]}
        autoFocus
        returnKeyType="done"
        onSubmitEditing={onContinue}
      />
      {name.trim().length > 0 ? (
        <Text style={styles.glad}>I'm glad you're here, {name.trim()}.</Text>
      ) : error ? (
        <Text style={styles.hint}>Tell me what to call you first.</Text>
      ) : null}
      <View style={{ flex: 1 }} />
      <PrimaryButton label="Continue" onPress={onContinue} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 30, paddingBottom: 30 },
  title: { fontFamily: fonts.serif, fontSize: 38, color: colors.ink, textAlign: 'center', marginTop: 22, lineHeight: 42 },
  input: { fontFamily: fonts.serif, fontSize: 30, color: colors.ink, borderBottomWidth: 2, borderBottomColor: colors.brass, paddingVertical: 10, marginTop: 40, textAlign: 'center' },
  glad: { fontFamily: fonts.serifItalic, fontSize: 20, color: colors.brass, marginTop: 22, textAlign: 'center' },
  hint: { fontFamily: fonts.sans, fontSize: 15, color: colors.danger, marginTop: 22, textAlign: 'center' },
});
