import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { formatDateTime } from '@/src/utils/dateUtils';
import { SubmitApplicationResult } from '../api/ScholarshipProgramApi';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface ApplicationSuccessViewProps {
  submitResult: SubmitApplicationResult;
  isDarkMode: boolean;
  onTrackApplication: () => void;
}

export function ApplicationSuccessView({
  submitResult,
  isDarkMode,
  onTrackApplication,
}: ApplicationSuccessViewProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC' }}
    >
      <View style={[styles.successCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#065F46' }]}>
        <View style={[styles.successIconRing, isDarkMode && { backgroundColor: '#064E3B' }]}>
          <IconSymbol name="checkmark.circle.fill" size={38} color="#16A34A" />
        </View>

        <Text style={[styles.successTitle, isDarkMode && { color: '#F8FAFC' }]}>
          Application Submitted!
        </Text>
        <Text style={[styles.successSub, isDarkMode && { color: '#CBD5E1' }]}>
          Your scholarship application has been successfully received and submitted for review.
        </Text>

        <View style={[styles.metaBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Application Code</Text>
            <Text style={[styles.metaValue, { color: '#0284C7' }]}>{submitResult.application_code}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Program</Text>
            <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>{submitResult.program_name}</Text>
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Status</Text>
            <Badge variant="info" label={submitResult.application_status} />
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted At</Text>
            <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>
              {formatDateTime(submitResult.submitted_at)}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { width: '100%' }]}
          onPress={onTrackApplication}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>Track My Application</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
