import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

/**
 * Grant Renewal Screen — app/education/renewal.tsx
 * Content reserved for Education Department development.
 */
export default function RenewalRoute() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIcon} />
        <Text style={styles.backText}>Back to Education Hub</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>Grant Renewal</Text>
        <Text style={styles.sub}>Content reserved for Education Department development.</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#CBD5E1', gap: 6, marginBottom: 16,
  },
  backIcon: { transform: [{ rotate: '180deg' }] },
  backText: { fontSize: 12, fontWeight: '800', color: '#176B87' },
  content: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 30, minHeight: 300,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E2E8F0',
  },
  title: { fontSize: 18, fontWeight: '800', color: '#0F172A', marginBottom: 6 },
  sub: { fontSize: 13, color: '#64748B', textAlign: 'center' },
});
