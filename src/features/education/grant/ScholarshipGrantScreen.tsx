import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenGrantOverviewData,
  fetchCitizenGrantOverview,
  GrantApplicationDetail,
} from './api/grantApi';
import {
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from './api/grantReleaseApi';
import { styles } from './styles/ScholarshipGrant.styles';

const grantHeaderLight = require('@/assets/images/grant-header-light.png');
const grantHeaderDark = require('@/assets/images/grant-header-dark.png');
const grantWhite = require('@/assets/images/grant-white.png');
const grantDark = require('@/assets/images/grant-dark.png');
const complianceLight = require('@/assets/images/compliance-light.png');
const complianceDark = require('@/assets/images/compliance-dark.png');

function getStatusBadgeVariant(status?: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  if (!status || status === '--') return 'neutral';
  switch (status) {
    case 'Draft':
      return 'warning';
    case 'Submitted':
    case 'Approved for Payroll':
    case 'Approved':
    case 'Paid':
    case 'Released':
      return 'success';
    case 'For Review':
    case 'Under Review':
    case 'Processing':
    case 'Ready for Processing':
      return 'info';
    case 'For Compliance':
    case 'On Hold — Institution Verification Required':
    case 'Institution Verification Required':
      return 'warning';
    case 'Withdrawn':
    case 'Invalid':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default function ScholarshipGrantScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [overview, setOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [application, setApplication] = useState<GrantApplicationDetail | null>(null);
  const [releases, setReleases] = useState<CitizenGrantReleaseItem[]>([]);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education' as any);
    }
  };

  const renderBackButton = () => (
    <TouchableOpacity
      style={styles.backBtn}
      onPress={handleGoBack}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Back to Education Hub"
    >
      <IconSymbol
        name="chevron.left"
        size={16}
        color={isDarkMode ? '#FB923C' : '#EA580C'}
      />
      <Text style={[styles.backText, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
        Back to Education Hub
      </Text>
    </TouchableOpacity>
  );

  const headerAspectRatio = isDarkMode ? 1852 / 560 : 1844 / 582;

  const renderHeaderSkeleton = () => (
    <View
      style={[
        styles.headerContainer,
        isDarkMode && styles.headerContainerDark,
        { aspectRatio: headerAspectRatio },
      ]}
    >
      <Skeleton
        width="100%"
        borderRadius={16}
        style={{
          height: '100%',
        }}
      />
    </View>
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [overviewRes, releasesRes] = await Promise.allSettled([
        fetchCitizenGrantOverview(),
        fetchCitizenGrantReleases(),
      ]);

      if (overviewRes.status === 'fulfilled') {
        const data = overviewRes.value;
        setOverview(data);
        if (data.has_existing_application && data.application) {
          setApplication(data.application);
        } else {
          setApplication(null);
        }
      } else {
        console.error('[ScholarshipGrantScreen] Overview fetch rejected:', overviewRes.reason);
      }

      if (releasesRes.status === 'fulfilled') {
        setReleases(releasesRes.value || []);
      } else {
        console.error('[ScholarshipGrantScreen] Releases fetch rejected:', releasesRes.reason);
      }
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] Load overview error:', err);
      Alert.alert('Error', sanitizeErrorMessage(err?.message, 'Failed to load grant application context.'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderBackButton()}
          {renderHeaderSkeleton()}
          <View style={{ height: 16 }} />
          <Skeleton height={160} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={160} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  const currentPeriod = overview?.current_academic_period;

  const grantStatusText =
    application?.grant_status ||
    (application as any)?.status ||
    (application as any)?.application_status ||
    'Not Started';

  // Compliance state calculation
  const docs = application?.documents || [];
  const isComplianceStatus = application?.grant_status === 'For Compliance';
  const complianceDocs = isComplianceStatus
    ? docs.filter(
        (d) => d.review_status === 'Needs Replacement' || d.review_status === 'Invalid'
      )
    : [];
  const hasActionableCompliance = Boolean(
    application &&
    isComplianceStatus &&
    complianceDocs.length > 0
  );
  const complianceCount = complianceDocs.length;

  // Contextual description for Grant Application card
  const getApplicationCardDescription = () => {
    if (!application) {
      return 'You have not submitted an educational grant application for the current academic period. Begin your application to confirm school enrollment and submit verification documents.';
    }
    switch (application.grant_status) {
      case 'Draft':
        return 'Application draft initiated. Complete your required enrollment documents and submit for Secretariat review.';
      case 'Submitted':
      case 'Under Review':
      case 'For Review':
        return 'Your grant application and documents have been submitted and are currently undergoing evaluation by the Secretariat.';
      case 'For Compliance':
        return 'Document corrections or replacements have been requested for your grant application. Please resolve this through Grant Compliance.';
      case 'Approved for Payroll':
      case 'Approved':
        return 'Your grant application has been approved and queued for payroll authorization.';
      case 'Paid':
      case 'Released':
      case 'Disbursed':
        return 'Educational grant entitlement has been disbursed/released for this academic period.';
      default:
        return `Grant application is currently in ${application.grant_status} status.`;
    }
  };

  const f2fItem = releases
    .flatMap((r) => r.components.map((c) => ({ release: r, component: c })))
    .find((x) => x.component.release_method === 'Face-to-Face');

  const hasF2FVoucher = Boolean(f2fItem);
  const f2fSchedule = f2fItem?.component.f2f_schedule;
  const isVoucherClaimed = f2fSchedule?.claim_status === 'Released' || f2fItem?.component.component_status === 'Released';

  const handleOpenVoucher = () => {
    try {
      router.push('/education/grant/voucher' as any);
    } catch {
      router.navigate('/education/grant/voucher' as any);
    }
  };

  const handleOpenApplication = () => {
    try {
      router.push('/education/grant/application' as any);
    } catch {
      router.navigate('/education/grant/application' as any);
    }
  };

  const handleOpenCompliance = () => {
    try {
      router.push('/education/grant/compliance' as any);
    } catch {
      router.navigate('/education/grant/compliance' as any);
    }
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderBackButton()}

        {/* 1. SCHOLARSHIP GRANT HEADER IMAGE */}
        <View
          style={[
            styles.headerContainer,
            isDarkMode && styles.headerContainerDark,
            { aspectRatio: headerAspectRatio },
          ]}
          accessible={true}
          accessibilityRole="header"
        >
          <Image
            source={isDarkMode ? grantHeaderDark : grantHeaderLight}
            style={styles.headerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Scholarship Grant Header"
          />
        </View>

        {/* 2. PRIMARY CARD 1: GRANT APPLICATION (ENTIRE CARD TOUCHABLE) */}
        <TouchableOpacity
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: '#031731',
              borderColor: '#0E2D56',
            },
          ]}
          onPress={handleOpenApplication}
          activeOpacity={0.85}
        >
          <View style={styles.cardMainRow}>
            <Image
              source={isDarkMode ? grantDark : grantWhite}
              style={styles.grantArtworkImage}
              resizeMode="contain"
            />

            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                <Badge
                  label={grantStatusText}
                  variant={getStatusBadgeVariant(grantStatusText)}
                />
              </View>

              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Grant Application
              </Text>
              <Text style={[styles.cardSub, isDarkMode && { color: '#CBD5E1' }]}>
                {getApplicationCardDescription()}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.cardBottomRow,
              isDarkMode && { borderTopColor: '#0D274A' },
            ]}
          >
            <View style={styles.pillGroup}>
              <View
                style={[
                  styles.infoPill,
                  isDarkMode && { backgroundColor: '#072040' },
                ]}
              >
                <IconSymbol
                  name="clock.fill"
                  size={13}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text
                  style={[
                    styles.infoPillText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  {currentPeriod
                    ? `${currentPeriod.academic_year} • ${currentPeriod.term}`
                    : 'Current Period'}
                </Text>
              </View>

              {application && (
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: '#072040' },
                  ]}
                >
                  <IconSymbol
                    name="doc.text.fill"
                    size={13}
                    color={isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: '#CBD5E1' },
                    ]}
                  >
                    {application.institution_type === 'Private' ? 'COR + SOA Required' : 'COR Required'}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.primaryActionBtn,
                isDarkMode && { backgroundColor: '#EA580C' },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>View Grant Application</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* 3. PRIMARY CARD 2: COMPLIANCE */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: '#071D37',
              borderColor: '#0F3866',
            },
          ]}
        >
          <View style={styles.cardMainRow}>
            <Image
              source={isDarkMode ? complianceDark : complianceLight}
              style={styles.artworkImage}
              resizeMode="contain"
            />

            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                {hasActionableCompliance ? (
                  <View
                    style={[
                      styles.warningBadge,
                      isDarkMode && { backgroundColor: '#78350F' },
                    ]}
                  >
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={11}
                      color={isDarkMode ? '#FDE68A' : '#B45309'}
                    />
                    <Text
                      style={[
                        styles.warningBadgeText,
                        isDarkMode && { color: '#FDE68A' },
                      ]}
                    >
                      {complianceCount > 0 ? `${complianceCount} Action Required` : 'Action Required'}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.neutralBadge,
                      isDarkMode && { backgroundColor: '#064E3B' },
                    ]}
                  >
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={11}
                      color={isDarkMode ? '#34D399' : '#16A34A'}
                    />
                    <Text
                      style={[
                        styles.neutralBadgeText,
                        isDarkMode && { color: '#34D399' },
                      ]}
                    >
                      No Action Needed
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Compliance
              </Text>
              <Text style={[styles.cardSub, isDarkMode && { color: '#CBD5E1' }]}>
                {hasActionableCompliance
                  ? `Action required: You have ${complianceCount > 0 ? complianceCount : 1} document correction request${complianceCount > 1 ? 's' : ''} to complete.`
                  : 'Your grant application has no outstanding compliance requirements.'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.cardBottomRow,
              isDarkMode && { borderTopColor: '#0E2C52' },
            ]}
          >
            <View style={styles.pillGroup}>
              <View
                style={[
                  styles.infoPill,
                  isDarkMode && { backgroundColor: '#0B2749' },
                ]}
              >
                <IconSymbol
                  name="doc.text.fill"
                  size={13}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
                <Text
                  style={[
                    styles.infoPillText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  Document corrections
                </Text>
              </View>

              <View
                style={[
                  styles.infoPill,
                  isDarkMode && { backgroundColor: '#0B2749' },
                ]}
              >
                <IconSymbol
                  name={hasActionableCompliance ? 'clock.fill' : 'checkmark.circle.fill'}
                  size={13}
                  color={hasActionableCompliance ? (isDarkMode ? '#FDE68A' : '#B45309') : (isDarkMode ? '#34D399' : '#16A34A')}
                />
                <Text
                  style={[
                    styles.infoPillText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  {hasActionableCompliance
                    ? `${complianceCount > 0 ? complianceCount : 1} Action required`
                    : 'No pending action'}
                </Text>
              </View>
            </View>

            {hasActionableCompliance && (
              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  isDarkMode && { borderColor: '#FB923C' },
                ]}
                onPress={handleOpenCompliance}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.secondaryActionBtnText,
                    isDarkMode && { color: '#FB923C' },
                  ]}
                >
                  View Compliance
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? '#FB923C' : '#EA580C'}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* 4. PRIMARY CARD 3: DISBURSEMENT CLAIM VOUCHER */}
        <TouchableOpacity
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: '#041E34',
              borderColor: '#0C3B5E',
            },
          ]}
          onPress={handleOpenVoucher}
          activeOpacity={0.85}
        >
          <View style={styles.cardMainRow}>
            <View
              style={{
                width: 58,
                height: 58,
                borderRadius: 14,
                backgroundColor: isDarkMode ? '#0F3057' : '#EFF6FF',
                justifyContent: 'center',
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDarkMode ? '#1E4976' : '#DBEAFE',
              }}
            >
              <Ionicons
                name="qr-code-outline"
                size={30}
                color={isDarkMode ? '#38BDF8' : '#0284C7'}
              />
            </View>

            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                {isVoucherClaimed ? (
                  <Badge label="CLAIMED / DISBURSED" variant="neutral" />
                ) : f2fSchedule?.claim_status === 'Ready for Claim' ? (
                  <Badge label="READY FOR CLAIM" variant="success" />
                ) : hasF2FVoucher ? (
                  <Badge label="SCHEDULED" variant="warning" />
                ) : (
                  <Badge label="AVAILABLE UPON APPROVAL" variant="neutral" />
                )}
              </View>

              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Disbursement Claim Voucher
              </Text>
              <Text style={[styles.cardSub, isDarkMode && { color: '#CBD5E1' }]}>
                {hasF2FVoucher
                  ? isVoucherClaimed
                    ? 'Your scholarship grant has been disbursed. View your official digital voucher and disbursement receipt record.'
                    : 'Your in-person grant claiming voucher is ready. Present the dynamic QR code and your student ID at the disbursement window.'
                  : 'Digital QR voucher will generate automatically once grant payroll release is authorized by the Secretariat.'}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.cardBottomRow,
              isDarkMode && { borderTopColor: '#0E2C52' },
            ]}
          >
            <View style={styles.pillGroup}>
              {f2fItem?.component?.amount ? (
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: '#072040' },
                  ]}
                >
                  <IconSymbol
                    name="banknote.fill"
                    size={13}
                    color={isDarkMode ? '#34D399' : '#059669'}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      { color: isDarkMode ? '#34D399' : '#059669', fontWeight: '800' },
                    ]}
                  >
                    ₱{f2fItem.component.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Text>
                </View>
              ) : null}

              {f2fSchedule?.claim_reference ? (
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: '#072040' },
                  ]}
                >
                  <Ionicons
                    name="barcode-outline"
                    size={13}
                    color={isDarkMode ? '#94A3B8' : '#64748B'}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: '#CBD5E1' },
                      { fontFamily: 'Courier', fontWeight: '700' },
                    ]}
                  >
                    {f2fSchedule.claim_reference}
                  </Text>
                </View>
              ) : null}
            </View>

            <View
              style={[
                styles.primaryActionBtn,
                isDarkMode && { backgroundColor: '#EA580C' },
              ]}
            >
              <Text style={styles.primaryActionBtnText}>View QR Voucher</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export { ScholarshipGrantScreen };