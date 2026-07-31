import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated, Easing } from 'react-native';
import * as Haptics from 'expo-haptics';
import GIcon from './GIcon';
import { TeaAudioService } from '../services/TeaAudioService';
import { colors, fonts, radius, shadow } from '../theme';

/**
 * The bar that appears once a Tea is playing and you have left Tea Detail.
 *
 * Without it, audio that now survives navigation would have no off switch
 * anywhere except by going back into the screen it started on. It sits directly
 * above the floating tab bar, so it never covers the tabs themselves.
 */
export default function TeaMiniPlayer() {
  const [st, setSt] = useState(() => TeaAudioService.getState());
  const rise = useRef(new Animated.Value(0)).current;

  useEffect(() => TeaAudioService.subscribe(setSt), []);

  // Show whenever something is loaded and Tea Detail is not already on screen.
  const active = !!st.tea && st.status !== 'idle' && !st.detailVisible;

  useEffect(() => {
    Animated.timing(rise, {
      toValue: active ? 1 : 0,
      duration: active ? 220 : 160,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [active]);

  // Keep it mounted through the exit animation, then stop taking up space.
  const [mounted, setMounted] = useState(active);
  useEffect(() => {
    if (active) { setMounted(true); return undefined; }
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [active]);

  if (!mounted || !st.tea) return null;

  const playing = st.status === 'playing';
  const loading = st.status === 'loading';
  const pct = st.duration ? Math.min(1, st.position / st.duration) : 0;

  const toggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);
    TeaAudioService.toggle();
  };
  const close = () => {
    Haptics.selectionAsync();
    TeaAudioService.stop();
  };

  return (
    <Animated.View
      style={[
        styles.wrap,
        {
          opacity: rise,
          transform: [{ translateY: rise.interpolate({ inputRange: [0, 1], outputRange: [24, 0] }) }],
        },
      ]}
      pointerEvents={active ? 'auto' : 'none'}
      accessibilityLabel={`Tea playing: ${st.tea.cardTitle || st.tea.ref}`}
    >
      <View style={styles.bar}>
        <Pressable
          onPress={toggle}
          hitSlop={10}
          style={styles.play}
          accessibilityRole="button"
          accessibilityLabel={playing ? 'Pause tea' : 'Play tea'}
          testID="mini-player-toggle"
        >
          <GIcon
            name={playing ? 'pause' : 'play'}
            size={17}
            color={colors.espresso}
            filled={!playing}
            strokeWidth={2.2}
          />
        </Pressable>

        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {st.tea.cardTitle || 'Tea'}
          </Text>
          <Text style={styles.sub} numberOfLines={1}>
            {loading ? 'Loading…' : `${st.tea.ref} · Grace is reading`}
          </Text>
        </View>

        <Pressable
          onPress={close}
          hitSlop={10}
          style={styles.close}
          accessibilityRole="button"
          accessibilityLabel="Stop tea"
          testID="mini-player-close"
        >
          <Text style={styles.closeMark}>✕</Text>
        </Pressable>
      </View>

      {/* Hairline progress, so the bar reads as playback and not a banner. */}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%` }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Sits just above the 86pt floating tab bar.
  wrap: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 92,
    borderRadius: radius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    overflow: 'hidden',
    ...shadow.lift,
  },
  bar: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 12, paddingVertical: 10 },
  play: {
    width: 38, height: 38, borderRadius: 19, backgroundColor: colors.gold,
    alignItems: 'center', justifyContent: 'center',
  },
  meta: { flex: 1 },
  title: { fontFamily: fonts.serifSemi, fontSize: 17, color: colors.ink },
  sub: { fontFamily: fonts.sans, fontSize: 12, color: colors.textFaint, marginTop: 1 },
  close: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  closeMark: { fontFamily: fonts.sansMed, fontSize: 16, color: colors.textFaint },
  track: { height: 2, backgroundColor: colors.sand },
  fill: { height: 2, backgroundColor: colors.brass },
});
