import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Slot, useRouter } from 'expo-router';
import { HeaderBar } from '@/src/components/common/HeaderBar';
import { StandaloneTabBar } from '@/src/components/navigation/StandaloneTabBar';

/**
 * DepartmentShell — reusable layout wrapper for department route groups
 * (education/, health/, business/, housing/, emergency/).
 *
 * Renders:
 *  - HeaderBar (sticky top)
 *  - <Slot /> (current department screen content)
 *  - StandaloneTabBar (floating pill bottom nav)
 *
 * Usage: use as the default export of each department's _layout.tsx.
 */
export function DepartmentShell() {
  const router = useRouter();

  return (
    <View style={styles.shell}>
      <HeaderBar
        subtitle="Caloocan Government Services"
        onNotificationPress={() => router.push('/(tabs)/notifications' as any)}
      />
      <View style={styles.content}>
        <Slot />
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
