import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import { resolveCitizenCategory } from './types';

export interface VerificationReviewStepProps {
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  sex: string;
  birthDate: string;
  placeOfBirth: string;
  civilStatus: string;
  employmentStatus: string;
  occupation: string;
  educationalAttainment: string;
  district: string;
  barangay: string;
  streetAddress: string;
  yearsResident: string;
  selectedIdType: string;
  idNumber: string;
  idImageUri: string | null;
  selfieImageUri: string | null;
  photo1x1Uri: string | null;
  signatureUri: string | null;
  appStatus: string | null;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  onEditStep: (step: 1 | 2 | 3) => void;
  isDarkMode: boolean;
}

export function VerificationReviewStep({
  firstName,
  middleName,
  lastName,
  suffix,
  sex,
  birthDate,
  placeOfBirth,
  civilStatus,
  employmentStatus,
  occupation,
  educationalAttainment,
  district,
  barangay,
  streetAddress,
  yearsResident,
  selectedIdType,
  idNumber,
  idImageUri,
  selfieImageUri,
  photo1x1Uri,
  signatureUri,
  appStatus,
  isSubmitting,
  onSubmit,
  onBack,
  onEditStep,
  isDarkMode,
}: VerificationReviewStepProps) {
  const [hasAgreedToPrivacy, setHasAgreedToPrivacy] = useState(true);

  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  const fullName = [firstName.trim(), middleName.trim(), lastName.trim(), suffix.trim()].filter(Boolean).join(' ');
  const category = resolveCitizenCategory(birthDate);

  return (
    <View style={[styles.card, { backgroundColor: dmCard, borderColor: dmBorder }]}>
      <View style={localStyles.headerRow}>
        <Text style={[styles.cardTitle, { color: dmText, marginBottom: 0 }]}>
          Review Verification Dossier
        </Text>
        <View style={[localStyles.categoryPill, { backgroundColor: category.badgeBg }]}>
          <Text style={[localStyles.categoryPillText, { color: category.accentColor }]}>
            {category.title}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 16 }}>
        Review your credentials carefully before submitting to the Civentral Civil Registry.
      </Text>

      {/* SECTION 1: PERSONAL INFORMATION */}
      <View style={[localStyles.dossierSection, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}>
        <View style={localStyles.sectionTitleRow}>
          <Text style={[localStyles.sectionHeading, isDarkMode && { color: '#38BDF8' }]}>
            1. Personal Information
          </Text>
          <TouchableOpacity onPress={() => onEditStep(1)}>
            <Text style={localStyles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Full Legal Name:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{fullName}</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Sex / Civil Status:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{sex} • {civilStatus}</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Date / Place of Birth:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{birthDate} ({placeOfBirth})</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Employment / Role:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{employmentStatus} ({occupation})</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Education:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{educationalAttainment}</Text>
        </View>
      </View>

      {/* SECTION 2: RESIDENCY */}
      <View style={[localStyles.dossierSection, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}>
        <View style={localStyles.sectionTitleRow}>
          <Text style={[localStyles.sectionHeading, isDarkMode && { color: '#38BDF8' }]}>
            2. Civentral Residency
          </Text>
          <TouchableOpacity onPress={() => onEditStep(2)}>
            <Text style={localStyles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>District & Barangay:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{district} • {barangay}</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Street Address:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{streetAddress}</Text>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>Years Resident:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{yearsResident} year(s)</Text>
        </View>
      </View>

      {/* SECTION 3: CREDENTIALS & ASSETS */}
      <View style={[localStyles.dossierSection, isDarkMode && { backgroundColor: '#152238', borderColor: '#334155' }]}>
        <View style={localStyles.sectionTitleRow}>
          <Text style={[localStyles.sectionHeading, isDarkMode && { color: '#38BDF8' }]}>
            3. Documents & Biometrics
          </Text>
          <TouchableOpacity onPress={() => onEditStep(3)}>
            <Text style={localStyles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={localStyles.fieldRow}>
          <Text style={[localStyles.fieldLabel, isDarkMode && { color: '#94A3B8' }]}>ID Type & Number:</Text>
          <Text style={[localStyles.fieldValue, isDarkMode && { color: '#FFFFFF' }]}>{selectedIdType} ({idNumber})</Text>
        </View>

        {/* Thumbnail Preview Strip */}
        <View style={localStyles.thumbnailStrip}>
          {idImageUri ? (
            <View style={localStyles.thumbnailItem}>
              <Image source={{ uri: idImageUri }} style={localStyles.thumbnailImage} />
              <Text style={localStyles.thumbnailLabel}>Front ID</Text>
            </View>
          ) : null}

          {selfieImageUri ? (
            <View style={localStyles.thumbnailItem}>
              <Image source={{ uri: selfieImageUri }} style={localStyles.thumbnailImage} />
              <Text style={localStyles.thumbnailLabel}>Selfie</Text>
            </View>
          ) : null}

          {photo1x1Uri ? (
            <View style={localStyles.thumbnailItem}>
              <Image source={{ uri: photo1x1Uri }} style={localStyles.thumbnailImage} />
              <Text style={localStyles.thumbnailLabel}>1x1 Photo</Text>
            </View>
          ) : null}

          {signatureUri ? (
            <View style={localStyles.thumbnailItem}>
              <Image source={{ uri: signatureUri }} style={localStyles.thumbnailImage} resizeMode="contain" />
              <Text style={localStyles.thumbnailLabel}>Signature</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* TERMS & DATA PRIVACY CONSENT ACKNOWLEDGMENT */}
      <TouchableOpacity
        style={[localStyles.privacyBox, isDarkMode && { backgroundColor: '#0C2D48', borderColor: '#0369A1' }]}
        onPress={() => setHasAgreedToPrivacy((prev) => !prev)}
        activeOpacity={0.8}
      >
        <IconSymbol
          name={hasAgreedToPrivacy ? 'checkmark.square.fill' : 'square'}
          size={22}
          color={hasAgreedToPrivacy ? '#0284C7' : '#94A3B8'}
        />
        <Text style={[localStyles.privacyText, isDarkMode && { color: '#CBD5E1' }]}>
          I hereby certify under penalty of perjury that all information, documents, and biometrics provided are true, complete, and correct. I consent to the processing of my identity credentials under the Philippine Data Privacy Act of 2012 for official Civentral civil verification.
        </Text>
      </TouchableOpacity>

      {/* FINAL SUBMIT BUTTON */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={onBack}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            (!hasAgreedToPrivacy || isSubmitting) && styles.buttonDisabled,
          ]}
          onPress={onSubmit}
          disabled={!hasAgreedToPrivacy || isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {appStatus === 'Returned_For_Correction'
                ? 'Resubmit Corrected Application'
                : appStatus === 'Rejected'
                ? 'Submit New Verification / Appeal'
                : 'Confirm & Submit Verification'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  dossierSection: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    paddingBottom: 4,
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  editLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  fieldLabel: {
    fontSize: 11.5,
    color: '#64748B',
  },
  fieldValue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0F172A',
    textAlign: 'right',
    maxWidth: '55%',
  },
  thumbnailStrip: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  thumbnailItem: {
    alignItems: 'center',
    gap: 4,
  },
  thumbnailImage: {
    width: 50,
    height: 50,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  thumbnailLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  privacyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 12,
    padding: 12,
    marginVertical: 14,
  },
  privacyText: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
    flex: 1,
  },
});
