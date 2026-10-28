import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';

export interface VerificationSuccessStepProps {
  firstName: string;
  lastName: string;
  sex: string;
  placeOfBirth: string;
  employmentStatus: string;
  occupation: string;
  educationalAttainment: string;
  district: string;
  barangay: string;
  selectedIdType: string;
  onReturnToDashboard: () => void;
  isDarkMode: boolean;
}

export function VerificationSuccessStep({
  firstName,
  lastName,
  sex,
  placeOfBirth,
  employmentStatus,
  occupation,
  educationalAttainment,
  district,
  barangay,
  selectedIdType,
  onReturnToDashboard,
  isDarkMode,
}: VerificationSuccessStepProps) {
  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  return (
    <View
      style={[
        styles.card,
        styles.successContainer,
        { backgroundColor: dmCard, borderColor: dmBorder },
      ]}
    >
      <View style={styles.successIconBadge}>
        <IconSymbol name="checkmark.seal.fill" size={44} color="#10B981" />
      </View>

      <Text style={[styles.successTitle, { color: dmText }]}>
        Verification Submitted!
      </Text>
      <Text style={[styles.successMessage, isDarkMode && { color: '#CBD5E1' }]}>
        Your citizen credentials for <Text style={{ fontWeight: '700' }}>{firstName} {lastName}</Text> have been securely submitted to the Civentral City Civil & Barangay Registry.
      </Text>

      <View
        style={[
          styles.infoBox,
          isDarkMode && { backgroundColor: '#152238', borderColor: '#0369A1' },
        ]}
      >
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Sex:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{sex}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Place of Birth:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{placeOfBirth}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Employment:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{employmentStatus}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Occupation:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{occupation}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Education:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{educationalAttainment}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>District:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{district}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Barangay:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{barangay}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Document Type:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>{selectedIdType}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={[styles.infoLabel, isDarkMode && { color: '#7DD3FC' }]}>Estimated Review:</Text>
          <Text style={[styles.infoValue, isDarkMode && { color: '#FFFFFF' }]}>15 - 30 minutes</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { width: '100%' }]}
        onPress={onReturnToDashboard}
        activeOpacity={0.85}
      >
        <Text style={styles.primaryButtonText}>Return to Dashboard</Text>
      </TouchableOpacity>
    </View>
  );
}
