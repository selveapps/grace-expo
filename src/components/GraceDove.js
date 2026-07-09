import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import Svg, {
  Defs, RadialGradient, LinearGradient, Stop, G, Circle, Ellipse, Path, Line,
} from 'react-native-svg';

/**
 * GraceDove — the animated mascot.
 *
 * props:
 *   size      number   rendered width in px (height auto ~0.977 ratio)
 *   wings     'open' | 'folded'
 *   motion    'none' | 'breathe' | 'float' | 'celebrate' | 'halo' | 'loading' | 'peek'
 *
 * The outer float/breathe/celebrate motions run on the native driver via an
 * Animated.View wrapper (smooth, cheap). Per-part motions (blink, halo glint,
 * wing flap) are documented in the handoff README — add them with
 * react-native-svg AnimatedProps or moti/reanimated if you want the full set.
 */
const AG = Animated.createAnimatedComponent(G);

export default function GraceDove({ size = 200, wings = 'open', motion = 'float', crop = 'none' }) {
  const t = useRef(new Animated.Value(0)).current;      // 0..1 loop
  const halo = useRef(new Animated.Value(0)).current;    // halo glint rotation 0..1

  useEffect(() => {
    let anim;
    if (motion === 'float' || motion === 'breathe' || motion === 'peek' || motion === 'celebrate' || motion === 'dim' || motion === 'bless') {
      const dur = motion === 'celebrate' ? 1900 : motion === 'breathe' ? 3400 : 4000;
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(t, { toValue: 1, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(t, { toValue: 0, duration: dur / 2, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      );
      anim.start();
    }
    let haloAnim;
    if (motion === 'halo' || motion === 'loading') {
      haloAnim = Animated.loop(
        Animated.timing(halo, { toValue: 1, duration: motion === 'loading' ? 1500 : 2200, easing: Easing.linear, useNativeDriver: true })
      );
      haloAnim.start();
    }
    return () => { anim && anim.stop(); haloAnim && haloAnim.stop(); };
  }, [motion]);

  // Outer transform per motion
  let transform = [];
  if (motion === 'float') {
    transform = [{ translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -12] }) }];
  } else if (motion === 'breathe') {
    transform = [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] }) }];
  } else if (motion === 'peek') {
    transform = [
      { translateY: t.interpolate({ inputRange: [0, 1], outputRange: [0, -8] }) },
      { rotate: t.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '4deg'] }) },
    ];
  } else if (motion === 'celebrate' || motion === 'bless') {
    transform = [
      { translateY: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, -18, 0] }) },
      { scale: t.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.06, 1] }) },
    ];
  } else if (motion === 'dim') {
    transform = [{ scale: t.interpolate({ inputRange: [0, 1], outputRange: [1, 1.03] }) }];
  }

  const haloBaseOpacity = motion === 'dim' ? 0.45 : 1;

  const haloOpacity = motion === 'halo' || motion === 'loading' || motion === 'bless' ? 1 : 0;
  const haloRotate = halo.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const haloRotate2 = halo.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '540deg'] });
  const isLoading = motion === 'loading';

  const cropHead = crop === 'head';
  const viewBox = cropHead ? '128 96 184 166' : '0 0 440 430';
  const height = cropHead ? Math.round(size * 0.902) : Math.round(size * 0.977);

  return (
    <Animated.View style={{ width: size, height, transform }}>
      <Svg width={size} height={height} viewBox={viewBox}>
        <Defs>
          <RadialGradient id="body" cx="42%" cy="30%" r="78%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="66%" stopColor="#f6f2ea" />
            <Stop offset="100%" stopColor="#e7ddcd" />
          </RadialGradient>
          <RadialGradient id="head" cx="40%" cy="28%" r="76%">
            <Stop offset="0%" stopColor="#ffffff" />
            <Stop offset="70%" stopColor="#f6f2ea" />
            <Stop offset="100%" stopColor="#e7ddcd" />
          </RadialGradient>
          <LinearGradient id="wing" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor="#fffdf9" />
            <Stop offset="100%" stopColor="#efe7d8" />
          </LinearGradient>
          <LinearGradient id="halo" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0%" stopColor="#e6cf94" />
            <Stop offset="45%" stopColor="#b58a3f" />
            <Stop offset="100%" stopColor="#e6cf94" />
          </LinearGradient>
        </Defs>

        {/* Halo */}
        <Ellipse cx="220" cy="118" rx="80" ry="16" fill="none" stroke="url(#halo)" strokeWidth="9" opacity={haloBaseOpacity} />
        {/* Halo glint (revolves on halo/loading) */}
        <AG opacity={haloOpacity} origin="220, 118" style={{ transform: [{ rotate: haloRotate }] }}>
          <Ellipse cx="220" cy="118" rx="80" ry="16" fill="none" stroke="#fff6df" strokeWidth={isLoading ? 6 : 5} strokeLinecap="round" strokeDasharray={isLoading ? '40, 500' : '26, 500'} />
        </AG>
        {/* Second shimmer sweep — only while loading, for a richer revolve */}
        {isLoading ? (
          <AG opacity={0.8} origin="220, 118" style={{ transform: [{ rotate: haloRotate2 }] }}>
            <Ellipse cx="220" cy="118" rx="80" ry="16" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="16, 500" />
          </AG>
        ) : null}

        {/* Wings */}
        {!cropHead && wings === 'open' ? (
          <>
            <G>
              <Path d="M 172 245 C 118 218 52 214 28 236 C 6 256 8 316 36 344 C 66 372 132 366 176 336 Z" fill="url(#wing)" />
              <Line x1="54" y1="290" x2="140" y2="256" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              <Line x1="58" y1="308" x2="140" y2="274" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              <Line x1="64" y1="326" x2="138" y2="296" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            </G>
            <G>
              <Path d="M 268 245 C 322 218 388 214 412 236 C 434 256 432 316 404 344 C 374 372 308 366 264 336 Z" fill="url(#wing)" />
              <Line x1="386" y1="290" x2="300" y2="256" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              <Line x1="382" y1="308" x2="300" y2="274" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
              <Line x1="376" y1="326" x2="302" y2="296" stroke="#cbbfa8" strokeWidth="4" strokeLinecap="round" opacity="0.7" />
            </G>
          </>
        ) : null}

        {/* Tail */}
        {!cropHead ? (
        <G>
          {[-38, -28.5, -19, -9.5, 0, 9.5, 19, 28.5, 38].map((a, i) => (
            <Ellipse key={i} cx="220" cy="386" rx="7" ry="24" fill="url(#wing)" origin="220, 360" rotation={a} />
          ))}
        </G>
        ) : null}

        {/* Body */}
        {!cropHead ? (
        <Ellipse cx="220" cy="292" rx="64" ry="68" fill="url(#body)" />
        ) : null}

        {/* Folded wings (over body) */}
        {!cropHead && wings === 'folded' ? (
          <>
            <Path d="M 206 250 C 178 258 160 300 176 344 C 182 360 200 360 206 347 C 200 314 200 280 214 256 Z" fill="url(#wing)" />
            <Path d="M 234 250 C 262 258 280 300 264 344 C 258 360 240 360 234 347 C 240 314 240 280 226 256 Z" fill="url(#wing)" />
          </>
        ) : null}

        {/* Head + face */}
        <Circle cx="220" cy="185" r="64" fill="url(#head)" />
        <Ellipse cx="194" cy="188" rx="10.5" ry="13.5" fill="#20211f" />
        <Circle cx="191" cy="183" r="3.5" fill="#fff" />
        <Ellipse cx="246" cy="188" rx="10.5" ry="13.5" fill="#20211f" />
        <Circle cx="243" cy="183" r="3.5" fill="#fff" />
        <Path d="M 220 205 C 210 205 206 214 212 221 C 216 225 224 225 228 221 C 234 214 230 205 220 205 Z" fill="#d99b4c" />
      </Svg>
    </Animated.View>
  );
}
