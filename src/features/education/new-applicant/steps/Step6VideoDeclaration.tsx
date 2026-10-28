import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Ionicons } from '@expo/vector-icons';
import { PartnerSchoolLookupItem } from '../api/ScholarshipProgramApi';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface Step6VideoDeclarationProps {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  verifiedFullName: string;
  email: string;
  phoneDigits: string;
  formatPhoneNumber: (digits: string) => string;
  isVerifiedCitizen: boolean;
  citizenVerificationData: any;
  residentialAddress: string;
  institutionName: string;
  selectedPartnerSchool: PartnerSchoolLookupItem | null | undefined;
  courseProgram: string;
  yearLevel: string;
  isDeclarationChecked?: boolean;
  setIsDeclarationChecked?: (val: boolean) => void;
  isFormValid: boolean;
  isSubmitting: boolean;
  isDarkMode: boolean;
  insets: { bottom: number; top: number; left: number; right: number };
  onEditDetails: () => void;
  onBack: () => void;
  onSubmitPress: () => void;
}

export function Step6VideoDeclaration({
  firstName,
  middleName,
  lastName,
  suffix,
  verifiedFullName,
  email,
  phoneDigits,
  formatPhoneNumber,
  isVerifiedCitizen,
  citizenVerificationData,
  residentialAddress,
  institutionName,
  selectedPartnerSchool,
  courseProgram,
  yearLevel,
  isDeclarationChecked,
  setIsDeclarationChecked,
  isFormValid,
  isSubmitting,
  isDarkMode,
  insets,
  onEditDetails,
  onBack,
  onSubmitPress,
}: Step6VideoDeclarationProps) {
  const applicantName =
    [firstName.trim(), middleName.trim(), lastName.trim(), suffix.trim()].filter(Boolean).join(' ') ||
    verifiedFullName;

  return (
    <>
      {/* REVIEW DOSSIER COMPACT SUMMARY */}
      <View style={[styles.reviewSummaryCard, isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' }]}>
        <View style={[styles.reviewSummaryHeader, isDarkMode && { borderBottomColor: '#0369A1' }]}>
          <Text style={[styles.reviewSummaryTitle, isDarkMode && { color: '#38BDF8' }]}>
            Application Summary Review
          </Text>
          <TouchableOpacity onPress={onEditDetails} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
            <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#38BDF8' : '#0284C7' }}>
              Edit Details
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Applicant:</Text>
          <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>
            {applicantName}
          </Text>
        </View>

        {email ? (
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Email:</Text>
            <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{email}</Text>
          </View>
        ) : null}

        {phoneDigits ? (
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Mobile:</Text>
            <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{`+63 ${formatPhoneNumber(phoneDigits)}`}</Text>
          </View>
        ) : null}

        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Citizen Status:</Text>
          <Text
            style={[
              styles.reviewValue,
              isDarkMode && { color: '#4ADE80' },
              !isVerifiedCitizen && { color: isDarkMode ? '#CBD5E1' : '#475569' },
            ]}
          >
            {isVerifiedCitizen
              ? `Verified Citizen (${citizenVerificationData?.citizen_id_number || 'Approved'})`
              : 'Standard / Unverified Applicant'}
          </Text>
        </View>

        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Address:</Text>
          <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
            {residentialAddress || 'None provided'}
          </Text>
        </View>

        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>School:</Text>
          <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>
            {institutionName} {selectedPartnerSchool ? '(Partner School)' : ''}
          </Text>
        </View>

        {courseProgram ? (
          <View style={styles.reviewRow}>
            <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Course / Track:</Text>
            <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{courseProgram}</Text>
          </View>
        ) : null}

        <View style={styles.reviewRow}>
          <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Year Level:</Text>
          <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{yearLevel}</Text>
        </View>

        {/* APPLICANT DECLARATION CONFIRMATION */}
        {setIsDeclarationChecked ? (
          <TouchableOpacity
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: 10,
              marginTop: 14,
              paddingTop: 12,
              borderTopWidth: 1,
              borderTopColor: isDarkMode ? '#1E293B' : '#E2E8F0',
            }}
            onPress={() => setIsDeclarationChecked(!isDeclarationChecked)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isDeclarationChecked ? 'checkbox' : 'square-outline'}
              size={20}
              color={isDeclarationChecked ? (isDarkMode ? '#38BDF8' : '#0284C7') : (isDarkMode ? '#64748B' : '#94A3B8')}
            />
            <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#334155', flex: 1, lineHeight: 18 }}>
              I declare that all information submitted in this application and accompanying documents are true, correct, and complete to the best of my knowledge.
            </Text>
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.reviewNote, isDarkMode && { color: '#38BDF8' }]}>
          {'Please review your details above before submitting. Tap "Edit Details" if anything needs adjusting.'}
        </Text>
      </View>

      {/* NAVIGATION BUTTONS */}
      <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        <TouchableOpacity
          style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <IconSymbol name="chevron.left" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
          <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.wizardNextBtn,
            (!isFormValid || isSubmitting) && styles.wizardNextBtnDisabled,
          ]}
          onPress={onSubmitPress}
          disabled={!isFormValid || isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.wizardNextBtnText}>Submit Application</Text>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
}
