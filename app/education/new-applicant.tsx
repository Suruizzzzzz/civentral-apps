import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '@/src/features/education/styles/subroute.styles';

/**
 * New Applicant Screen — app/education/new-applicant.tsx
 * Content reserved for Education Department development.
 */
export default function NewApplicantRoute() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.8}>
        <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIcon} />
        <Text style={styles.backText}>Back to Education Hub</Text>
      </TouchableOpacity>
      <View style={styles.content}>
        <Text style={styles.title}>New Applicant</Text>
        <Text style={styles.sub}>Content reserved for Education Department development.</Text>
      </View>
    </ScrollView>
  );
}
