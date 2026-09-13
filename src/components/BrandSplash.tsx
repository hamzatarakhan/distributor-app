import { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Rect, Stop } from 'react-native-svg';
import Animated, {
  Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/src/theme/ThemeProvider';
import { Text } from './Text';

const AnimatedImage = Animated.createAnimatedComponent(Image);

// A JS-rendered stand-in for the native splash — the real one (app.json > expo-splash-screen)
// can't be previewed in Expo Go at all (Expo Go always shows its own app-icon screen there,
// regardless of config); this plays as a normal screen instead, so it's visible everywhere,
// Expo Go included, using the same icon assets so the handoff from the real native splash
// (in a standalone build) into this looks continuous rather than like two different screens.
export function BrandSplash({ appName }: { appName?: string }) {
  const { colors, scheme } = useTheme();
  const isDark = scheme === 'dark';

  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.7);
  const glowScale = useSharedValue(0.9);
  const glowOpacity = useSharedValue(0.3);
  const ringRotate = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const textY = useSharedValue(8);
  const barWidth = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) });
    scale.value = withSequence(
      withSpring(1, { damping: 9, stiffness: 140 }),
      withDelay(200, withRepeat(withSequence(
        withTiming(1.04, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ), -1, true)),
    );
    glowScale.value = withRepeat(withSequence(
      withTiming(1.15, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.9, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    glowOpacity.value = withRepeat(withSequence(
      withTiming(0.55, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      withTiming(0.25, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
    ), -1, true);
    ringRotate.value = withRepeat(withTiming(360, { duration: 7000, easing: Easing.linear }), -1, false);
    textOpacity.value = withDelay(350, withTiming(1, { duration: 450 }));
    textY.value = withDelay(350, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));
    barWidth.value = withDelay(500, withTiming(64, { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [opacity, scale, glowScale, glowOpacity, ringRotate, textOpacity, textY, barWidth]);

  const iconStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${ringRotate.value}deg` }],
  }));
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textY.value }],
  }));
  const barStyle = useAnimatedStyle(() => ({ width: barWidth.value }));

  const source = isDark
    ? require('@/assets/images/splash-icon-dark.png')
    : require('@/assets/images/splash-icon.png');

  const glowColor = isDark ? colors.primary : colors.primary;
  const edgeColor = colors.background;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Svg style={StyleSheet.absoluteFill} width="100%" height="100%">
        <Defs>
          <RadialGradient id="bg" cx="50%" cy="42%" r="75%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity={isDark ? 0.22 : 0.14} />
            <Stop offset="55%" stopColor={edgeColor} stopOpacity={0} />
            <Stop offset="100%" stopColor={edgeColor} stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill="url(#bg)" />
      </Svg>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <View style={{ width: 220, height: 220, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[{ position: 'absolute', width: 200, height: 200 }, glowStyle]}>
            <Svg width="100%" height="100%">
              <Defs>
                <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor={colors.primary} stopOpacity={0.9} />
                  <Stop offset="60%" stopColor={colors.primary} stopOpacity={0.35} />
                  <Stop offset="100%" stopColor={colors.primary} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx="50%" cy="50%" r="50%" fill="url(#glow)" />
            </Svg>
          </Animated.View>
          <Animated.View
            style={[
              {
                position: 'absolute', width: 196, height: 196, borderRadius: 98,
                borderWidth: 2, borderColor: colors.primary,
                borderTopColor: 'transparent', borderLeftColor: 'transparent',
              },
              ringStyle,
            ]}
          />
          <AnimatedImage source={source} style={[{ width: 140, height: 140, resizeMode: 'contain' }, iconStyle]} />
        </View>

        {appName ? (
          <Animated.View style={[{ alignItems: 'center', gap: 10 }, textStyle]}>
            <Text variant="h2" tone="muted" style={{ letterSpacing: 1 }}>{appName}</Text>
            <Animated.View style={[{ height: 3, borderRadius: 2, backgroundColor: colors.primary }, barStyle]} />
          </Animated.View>
        ) : null}
      </View>
    </View>
  );
}

// Keeps the brand screen on-screen for at least `ms`, even if auth resolves faster (the mock
// resolves near-instantly) — otherwise the entrance animation would barely be visible.
export function useMinDelay(ms: number) {
  const [elapsed, setElapsed] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setElapsed(true), ms);
    return () => clearTimeout(t);
  }, [ms]);
  return elapsed;
}
