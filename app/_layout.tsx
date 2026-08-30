import { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/src/hooks/use-color-scheme';
import { ThemeProvider as AppThemeProvider } from '@/src/context/ThemeContext';
import { SessionTimeoutProvider } from '@/src/context/SessionTimeoutContext';
import { AuthService } from '@/src/services/auth-service';

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

  return (
    <AppThemeProvider>
      <SessionTimeoutProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
          <StatusBar style="auto" />
        </ThemeProvider>
      </SessionTimeoutProvider>
    </AppThemeProvider>
  );
}
