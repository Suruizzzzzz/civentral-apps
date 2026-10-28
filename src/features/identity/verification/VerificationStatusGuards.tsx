import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Router } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { OfficialCitizenCard } from '../components/OfficialCitizenCard';
import { styles } from '../styles/VerifyCitizenScreen.styles';

export interface VerificationStatusGuardsProps {
  isGuest: boolean;
  isLoadingStatus: boolean;
  appStatus: string | null;
  appData: any | null;
  onRefreshStatus: () => void;
  router: Router;
  isDarkMode: boolean;
}

export function VerificationStatusGuards({
  isGuest,
  isLoadingStatus,
  appStatus,
  appData,
  onRefreshStatus,
  router,
  isDarkMode,
}: VerificationStatusGuardsProps) {
  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  if (isGuest) {
    return (
      <View style={[styles.card, styles.guardCard, { backgroundColor: dmCard, borderColor: dmBorder }]}>
        <View
          style={[
            styles.guardIconBox,
            {
              backgroundColor: isDarkMode ? '#0F2942' : '#EFF6FF',
              borderWidth: 2,
              borderColor: isDarkMode ? '#1E3A8A' : '#BFDBFE',
            },
          ]}
        >
          <IconSymbol
            name="lock.shield.fill"
            size={32}
            color={isDarkMode ? '#38BDF8' : '#165B7E'}
          />
        </View>
        <Text style={[styles.guardTitle, { color: dmText }]}>Account Required</Text>
        <Text
          style={[
            styles.guardSubtitle,
            { color: isDarkMode ? '#CBD5E1' : '#64748B', marginBottom: 24, paddingHorizontal: 8 },
          ]}
        >
          You must be signed in to an active Civentral account to submit citizen verification and receive an official Digital ID.
        </Text>

        <View style={{ width: '100%', gap: 10 }}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: '#165B7E', flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' }]}
            onPress={() => router.push('/(auth)/login' as any)}
            activeOpacity={0.85}
          >
            <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.primaryButton,
              {
                backgroundColor: isDarkMode ? '#0F2942' : '#EFF6FF',
                borderWidth: 1.5,
                borderColor: isDarkMode ? '#1E40AF' : '#BFDBFE',
                flexDirection: 'row',
                gap: 8,
                alignItems: 'center',
                justifyContent: 'center',
              },
            ]}
            onPress={() => router.push('/(auth)/register' as any)}
            activeOpacity={0.85}
          >
            <IconSymbol
              name="person.2.fill"
              size={16}
              color={isDarkMode ? '#38BDF8' : '#165B7E'}
            />
            <Text
              style={[
                styles.primaryButtonText,
                { color: isDarkMode ? '#38BDF8' : '#165B7E' },
              ]}
            >
              Create Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{ paddingVertical: 12, alignItems: 'center' }}
            onPress={() => router.replace('/(tabs)' as any)}
            activeOpacity={0.7}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: '600',
                color: isDarkMode ? '#94A3B8' : '#64748B',
                textDecorationLine: 'underline',
              }}
            >
              Return to Home
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (isLoadingStatus) {
    return (
      <View style={[styles.card, styles.guardCard, { backgroundColor: dmCard, borderColor: dmBorder }]}>
        <ActivityIndicator size="large" color="#0284C7" style={{ marginBottom: 16 }} />
        <Text style={[styles.guardTitle, { color: dmText, fontSize: 17 }]}>Checking Verification Status...</Text>
        <Text style={[styles.guardSubtitle, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>
          Connecting to Civentral Civil & Barangay Registry database
        </Text>
      </View>
    );
  }

  if ((appStatus === 'Pending' || appStatus === 'Under_Review') && appData) {
    return (
      <View style={[styles.card, styles.guardCard, { backgroundColor: dmCard, borderColor: isDarkMode ? '#F59E0B' : '#FDE68A' }]}>
        <View style={[styles.guardIconBox, { backgroundColor: isDarkMode ? '#78350F' : '#FEF3C7' }]}>
          <IconSymbol name="clock.fill" size={32} color="#D97706" />
        </View>
        <Text style={[styles.guardTitle, { color: dmText }]}>Application Under Review</Text>
        <Text style={[styles.guardSubtitle, { color: isDarkMode ? '#CBD5E1' : '#64748B' }]}>
          Your citizen verification application has been submitted and is currently queued for evaluation by the City Civil & Barangay Registry.
        </Text>

        <View style={[styles.guardDetailsBox, { backgroundColor: isDarkMode ? '#152238' : '#F8FAFC', borderColor: dmBorder }]}>
          <View style={[styles.guardRow, { borderBottomColor: dmBorder }]}>
            <Text style={[styles.guardRowLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Applicant Name</Text>
            <Text style={[styles.guardRowValue, { color: dmText }]}>{appData?.first_name} {appData?.last_name}</Text>
          </View>
          <View style={[styles.guardRow, { borderBottomColor: dmBorder }]}>
            <Text style={[styles.guardRowLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Application Status</Text>
            <View style={{ backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
              <Text style={{ color: '#B45309', fontWeight: '800', fontSize: 11 }}>IN REVIEW</Text>
            </View>
          </View>
          <View style={[styles.guardRow, { borderBottomColor: dmBorder }]}>
            <Text style={[styles.guardRowLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Document Type</Text>
            <Text style={[styles.guardRowValue, { color: dmText }]}>{appData?.valid_id_type || 'Government ID'}</Text>
          </View>
          <View style={[styles.guardRow, { borderBottomColor: 'transparent' }]}>
            <Text style={[styles.guardRowLabel, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>Barangay</Text>
            <Text style={[styles.guardRowValue, { color: dmText }]}>{appData?.barangay || 'Civentral City'}</Text>
          </View>
        </View>

        <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', textAlign: 'center', marginBottom: 20, lineHeight: 18 }}>
          New submissions are locked while your current application is under review. You will receive an update once an administrator verifies your application.
        </Text>

        <TouchableOpacity
          style={[styles.primaryButton, { width: '100%', marginBottom: 12 }]}
          onPress={onRefreshStatus}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Refresh Application Status</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { width: '100%' }, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (appStatus === 'Approved' && appData) {
    return (
      <View style={{ width: '100%', gap: 16 }}>
        <OfficialCitizenCard
          first_name={appData?.first_name}
          middle_name={appData?.middle_name}
          last_name={appData?.last_name}
          suffix={appData?.suffix}
          birth_date={appData?.birth_date}
          civil_status={appData?.civil_status}
          sex={appData?.sex}
          street_address={appData?.street_address}
          barangay={appData?.barangay}
          district={appData?.district}
          citizen_id_number={appData?.citizen_id_number}
          photo_1x1_url={appData?.photo_1x1_url}
          signature_photo_url={appData?.signature_photo_url}
          qr_token={appData?.qr_code_token}
          reviewed_at={appData?.reviewed_at}
          submitted_at={appData?.submitted_at}
          valid_until={appData?.valid_until}
          is_pwd={!!(appData?.is_pwd || appData?.pwd)}
          is_non_resident={!!(appData?.is_non_resident || appData?.non_resident)}
          blood_type={appData?.blood_type}
          emergency_contact={appData?.emergency_contact}
          showPrintActions={true}
        />

        {/* CITY CIVIC SUPPORT DIRECTORY & EMERGENCY HOTLINES */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: dmCard,
              borderColor: dmBorder,
              borderWidth: 1,
              borderRadius: 16,
              padding: 16,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                backgroundColor: isDarkMode ? '#7F1D1D' : '#FEE2E2',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconSymbol name="phone.fill" size={18} color="#DC2626" />
            </View>
            <View>
              <Text style={{ fontSize: 14, fontWeight: '800', color: dmText }}>
                Civentral Civic & Emergency Directory
              </Text>
              <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                24/7 Priority Emergency & Resident Hotlines
              </Text>
            </View>
          </View>

          {/* Hotlines Directory List */}
          <View style={{ gap: 8 }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: 1,
                borderBottomColor: dmBorder,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dmText }}>CDRRMO Rescue (Disaster)</Text>
                <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Civentral Disaster Command</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#DC2626' }}>(02) 888-ALERTO</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: 1,
                borderBottomColor: dmBorder,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dmText }}>PNP Police Headquarters</Text>
                <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Civentral Police Station</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#0284C7' }}>(02) 8287-2270</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: 1,
                borderBottomColor: dmBorder,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dmText }}>BFP Fire Central Station</Text>
                <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Bureau of Fire Protection</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#EA580C' }}>(02) 8361-9878</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
                borderBottomWidth: 1,
                borderBottomColor: dmBorder,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dmText }}>City Civil Registry Office</Text>
                <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Citizen Verification Division</Text>
              </View>
              <Text style={{ fontSize: 12, fontWeight: '800', color: '#059669' }}>(02) 8366-3101</Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 7,
              }}
            >
              <View>
                <Text style={{ fontSize: 12, fontWeight: '700', color: dmText }}>National Emergency Hotline</Text>
                <Text style={{ fontSize: 10, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Direct Nationwide Dispatch</Text>
              </View>
              <View style={{ backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 }}>
                <Text style={{ fontSize: 12, fontWeight: '900', color: '#FFFFFF' }}>911</Text>
              </View>
            </View>
          </View>

          {/* Civic Links & Verification Notice */}
          <View style={{ marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: dmBorder, gap: 4 }}>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
              • Official Portal: <Text style={{ color: '#0284C7', fontWeight: '700' }}>civentral.gov.ph</Text>
            </Text>
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
              • Civentral Cloud: <Text style={{ color: '#0284C7', fontWeight: '700' }}>civentral.tech</Text>
            </Text>
            <Text style={{ fontSize: 9.5, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 4, fontStyle: 'italic', lineHeight: 14 }}>
              Notice: This digital resident card is issued pursuant to City Ordinance No. 0824 as an authentic, scannable proof of residency in the City of Civentral.
            </Text>
          </View>
        </View>

        {/* Action Buttons: Refresh & Return */}
        <TouchableOpacity
          style={[styles.primaryButton, { width: '100%' }]}
          onPress={onRefreshStatus}
          activeOpacity={0.85}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <IconSymbol name="arrow.clockwise" size={18} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Refresh Card Data</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryButton, { width: '100%' }, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
}

export function VerificationReworkBanners({
  appStatus,
  appData,
}: {
  appStatus: string | null;
  appData: any | null;
}) {
  if (appStatus === 'Returned_For_Correction') {
    return (
      <View style={styles.reworkBanner}>
        <View style={styles.reworkBannerHeader}>
          <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#EA580C" />
          <Text style={styles.reworkBannerTitle}>Correction Required by Civil Registry</Text>
        </View>
        <View style={styles.reworkRemarksBox}>
          <Text style={styles.reworkRemarksLabel}>Official Reviewer Remarks:</Text>
          <Text style={styles.reworkRemarksText}>
            {appData?.admin_action_notes || appData?.rejection_reason || 'Please correct the indicated details or re-upload clearer photos.'}
          </Text>
        </View>
        <Text style={styles.reworkInstructionsText}>
          Your previously submitted details have been pre-filled. Please make the necessary corrections, upload any required assets, and tap &quot;Resubmit Corrected Application&quot;.
        </Text>
      </View>
    );
  }

  if (appStatus === 'Rejected') {
    return (
      <View style={[styles.reworkBanner, { borderColor: '#DC2626', backgroundColor: '#FEF2F2', marginBottom: 16 }]}>
        <View style={styles.reworkBannerHeader}>
          <IconSymbol name="xmark.octagon.fill" size={24} color="#DC2626" />
          <Text style={[styles.reworkBannerTitle, { color: '#DC2626' }]}>Previous Application Was Rejected</Text>
        </View>
        <View style={[styles.reworkRemarksBox, { backgroundColor: '#FEE2E2' }]}>
          <Text style={[styles.reworkRemarksLabel, { color: '#991B1B' }]}>Rejection Reason:</Text>
          <Text style={[styles.reworkRemarksText, { color: '#7F1D1D' }]}>
            {appData?.rejection_reason || 'Application did not meet registry verification criteria.'}
          </Text>
        </View>
        <Text style={[styles.reworkInstructionsText, { color: '#991B1B' }]}>
          You may review your details below, attach the required clear valid identification, and submit a fresh application.
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#FECACA' }}>
          <IconSymbol name="phone.fill" size={14} color="#DC2626" />
          <Text style={{ fontSize: 11, fontWeight: '700', color: '#991B1B' }}>
            Civic Inquiries & Appeals Hotline: (02) 8366-3101 | support@civentral.gov.ph
          </Text>
        </View>
      </View>
    );
  }

  return null;
}
