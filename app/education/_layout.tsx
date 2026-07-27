import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { HeaderBar } from '@/src/components/common/HeaderBar';
import { StandaloneTabBar } from '@/src/components/navigation/StandaloneTabBar';

/**
 * Education department layout.
 * Wraps all screens under app/education/ with the sticky HeaderBar
 * and floating StandaloneTabBar — matching the (tabs) shell experience.
 */
export default function EducationLayout() {
  const router = useRouter();

  return (
    <View style={styles.shell}>
      <HeaderBar
        subtitle="Education & Scholarship Portal"
        onNotificationPress={() => router.push('/(tabs)/notifications' as any)}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="dashboard" />
          <Stack.Screen name="new-applicant" />
          <Stack.Screen name="renewal" />
          <Stack.Screen name="distribution" />
        </Stack>
      </View>
      <StandaloneTabBar />
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});
