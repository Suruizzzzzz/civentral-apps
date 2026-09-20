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
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenGrantOverviewData,
  fetchCitizenGrantOverview,
  GrantApplicationDetail,
} from './api/grantApi';
import { styles } from './styles/ScholarshipGrant.styles';

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
    >
      <IconSymbol
        name="chevron.left"
        size={16}
        color={isDarkMode ? '#CBD5E1' : '#475569'}
      />
      <Text style={[styles.backText, { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
        Back to Education Hub
      </Text>
    </TouchableOpacity>
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCitizenGrantOverview();
      setOverview(data);

      if (data.has_existing_application && data.application) {
        setApplication(data.application);
      } else {
        setApplication(null);
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
          <Skeleton height={120} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={160} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={160} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  const isEligible = overview?.eligible ?? false;
  const currentPeriod = overview?.current_academic_period;
  const scholar = overview?.scholar;

  // Not Eligible State
  if (!isEligible) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderBackButton()}
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#D97706" />
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Grant Application Not Available</Text>
            </View>
            <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#475569', lineHeight: 20, marginBottom: 16 }}>
              {overview?.reason || 'You are currently not eligible for Grant intake processing.'}
            </Text>
            {scholar && (
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Scholar Code</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar.scholar_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Program</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar.program_name}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  const grantStatusText =
    application?.grant_status ||
    (application as any)?.status ||
    (application as any)?.application_status ||
    'Not Started';

  // Compliance state calculation
  const docs = application?.documents || [];
  const complianceDocs = docs.filter(
    (d) => d.review_status === 'Needs Replacement' || d.review_status === 'Invalid'
  );
  const isComplianceRequired =
    application?.grant_status === 'For Compliance' || complianceDocs.length > 0;
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

        {/* 1. SCHOLARSHIP GRANT HEADER / HERO */}
        <View
          style={[
            styles.moduleHeaderCard,
            isDarkMode && styles.moduleHeaderCardDark,
          ]}
        >
          <View style={styles.moduleHeaderTop}>
            <View
              style={[
                styles.moduleHeaderIconWrap,
                isDarkMode && styles.moduleHeaderIconWrapDark,
              ]}
            >
              <IconSymbol
                name="wallet.pass.fill"
                size={16}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.moduleTitle}>
              SCHOLARSHIP GRANT
            </Text>
          </View>
          <Text style={styles.moduleSubtitle}>
            Complete and track your educational grant application, requirements, compliance, and payment status.
          </Text>
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

        {/* 3. PRIMARY CARD 2: COMPLIANCE (ENTIRE CARD TOUCHABLE) */}
        <TouchableOpacity
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: '#071D37',
              borderColor: '#0F3866',
            },
          ]}
          onPress={handleOpenCompliance}
          activeOpacity={0.85}
        >
          <View style={styles.cardMainRow}>
            <Image
              source={isDarkMode ? complianceDark : complianceLight}
              style={styles.artworkImage}
              resizeMode="contain"
            />

            <View style={styles.cardContent}>
              <View style={styles.badgeRow}>
                {isComplianceRequired ? (
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
                      All Clear
                    </Text>
                  </View>
                )}
              </View>

              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Compliance
              </Text>
              <Text style={[styles.cardSub, isDarkMode && { color: '#CBD5E1' }]}>
                {isComplianceRequired
                  ? `Action required: You have ${complianceCount > 0 ? complianceCount : 1} document correction request${complianceCount > 1 ? 's' : ''} to complete.`
                  : 'Your grant application has no outstanding requirements. Review and submit document corrections if requested for your educational grant.'}
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
                  name={isComplianceRequired ? 'clock.fill' : 'checkmark.circle.fill'}
                  size={13}
                  color={isComplianceRequired ? (isDarkMode ? '#FDE68A' : '#B45309') : (isDarkMode ? '#34D399' : '#16A34A')}
                />
                <Text
                  style={[
                    styles.infoPillText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  {isComplianceRequired
                    ? `${complianceCount > 0 ? complianceCount : 1} Action required`
                    : 'No pending action'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.secondaryActionBtn,
                isDarkMode && { borderColor: '#FB923C' },
              ]}
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
            </View>
          </View>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

export { ScholarshipGrantScreen };