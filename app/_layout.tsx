import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { ThemeProvider as AppThemeProvider } from '@/src/context/ThemeContext';
import { SessionTimeoutProvider } from '@/src/context/SessionTimeoutContext';
import { AuthService } from '@/src/services/auth-service';
import { AnimatedSplashScreen } from '@/src/components/common/AnimatedSplashScreen';

// Hold native splash screen at module scope until the app and session are ready
SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  initialRouteName: 'index',
};

function RootLayoutNav() {
  const router = useRouter();

  useEffect(() => {
    AuthService.setUnauthorizedListener(() => {
      router.replace('/(auth)' as any);
    });
    return () => {
      AuthService.setUnauthorizedListener(null);
    };
  }, [router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="education" />
      <Stack.Screen name="health" />
      <Stack.Screen name="business" />
      <Stack.Screen name="housing" />
      <Stack.Screen name="emergency" />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationDone, setSplashAnimationDone] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      try {
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 3500));
        await Promise.race([
          Promise.all([
            AuthService.restoreSession().catch((err) => {
              console.warn('[RootLayout] Error restoring session:', err);
            }),
            Asset.loadAsync(require('@/assets/images/logo.png')).catch(() => {}),
          ]),
          timeoutPromise,
        ]);
      } catch (e) {
        console.warn('[RootLayout] Initialization error:', e);
      } finally {
        if (isMounted) {
          setAppIsReady(true);
        }
      }
    }

    prepare();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!appIsReady) {
    return null;
  }

  return (
    <AppThemeProvider>
      <SessionTimeoutProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <View style={{ flex: 1 }}>
            <RootLayoutNav />
            <StatusBar style="auto" />
            {!splashAnimationDone && (
              <AnimatedSplashScreen
                onAnimationComplete={() => setSplashAnimationDone(true)}
              />
            )}
          </View>
        </ThemeProvider>
      </SessionTimeoutProvider>
    </AppThemeProvider>
  );
}

