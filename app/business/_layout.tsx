import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { HeaderBar } from '@/src/components/common/HeaderBar';
import { StandaloneTabBar } from '@/src/components/navigation/StandaloneTabBar';

export default function BusinessLayout() {
  const router = useRouter();
  return (
    <View style={styles.shell}>
      <HeaderBar subtitle="Business Permits & Licensing" onNotificationPress={() => router.push('/(tabs)/notifications' as any)} />
      <View style={styles.content}><Stack screenOptions={{ headerShown: false }} /></View>
      <StandaloneTabBar />
    </View>
  );
}
const styles = StyleSheet.create({ shell: { flex: 1, backgroundColor: '#F8FAFC' }, content: { flex: 1 } });
