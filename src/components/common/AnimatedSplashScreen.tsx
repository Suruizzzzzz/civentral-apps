import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from '@/src/hooks/use-color-scheme';

interface AnimatedSplashScreenProps {
  onAnimationComplete: () => void;
}

/**
 * AnimatedSplashScreen provides a smooth transition from the native splash screen
 * to the active app screen, eliminating white box artifacts, double text, and abrupt cuts.
 */
export function AnimatedSplashScreen({ onAnimationComplete }: AnimatedSplashScreenProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let isCancelled = false;

    async function startExitAnimation() {
      // Dismiss the native splash screen now that our React overlay is mounted
      try {
        await SplashScreen.hideAsync();
      } catch {
        // Safe fallback in case splash is already hidden or unsupported on current platform
      }

      if (isCancelled) return;

      const useNativeDriver = Platform.OS !== 'web';

      // Smooth exit transition: scale up slightly (1 -> 1.08) while fading opacity (1 -> 0) over ~350ms
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1.08,
          duration: 350,
          easing: Easing.out(Easing.cubic),
          useNativeDriver,
        }),
      ]).start(() => {
        if (!isCancelled) {
          onAnimationComplete();
        }
      });
    }

    startExitAnimation();

    return () => {
      isCancelled = true;
    };
  }, [fadeAnim, scaleAnim, onAnimationComplete]);

  const backgroundColor = isDark ? '#0F172A' : '#FFFFFF';
  const taglineColor = isDark ? '#94A3B8' : '#64748B';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="none"
    >
      <Animated.View
        style={[
          styles.content,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.tagline, { color: taglineColor }]}>
          Civic Services, Modernized.
        </Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 150,
  },
  tagline: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
