import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenDashboardData,
  fetchCitizenDashboard,
  withdrawCitizenApplication,
} from '../dashboard/api/scholarshipDashboardApi';
import {
  CitizenGrantOverviewData,
  fetchCitizenGrantOverview,
} from '../grant/api/grantApi';
import {
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from '../grant/api/grantReleaseApi';
import { styles } from './styles/MyApplication.styles';

function getStatusBadgeConfig(
  status: string
): { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } {
  switch (status) {
    case 'Submitted':
      return { label: 'SUBMITTED', variant: 'info' };
    case 'Under Review':
      return { label: 'UNDER REVIEW', variant: 'warning' };
    case 'For Compliance':
      return { label: 'FOR COMPLIANCE', variant: 'warning' };
    case 'Ready for SSC':
      return { label: 'READY FOR SSC', variant: 'info' };
    case 'For Evaluation':
      return { label: 'FOR EVALUATION', variant: 'info' };
    case 'Returned':
      return { label: 'RETURNED', variant: 'warning' };
    case 'Approved':
      return { label: 'APPROVED', variant: 'success' };
    case 'Disapproved':
    case 'Rejected':
      return { label: 'DISAPPROVED', variant: 'danger' };
    case 'Withdrawn':
      return { label: 'WITHDRAWN', variant: 'danger' };
    default:
      return { label: status ? status.toUpperCase() : 'UNKNOWN', variant: 'neutral' };
  }
}

function getGrantBadgeConfig(
  status?: string
): { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } {
  switch (status) {
    case 'Draft':
      return { label: 'DRAFT', variant: 'warning' };
    case 'Submitted':
      return { label: 'SUBMITTED', variant: 'success' };
    case 'For Review':
      return { label: 'FOR REVIEW', variant: 'info' };
    case 'Under Review':
      return { label: 'UNDER REVIEW', variant: 'info' };
    case 'For Compliance':
      return { label: 'FOR COMPLIANCE', variant: 'warning' };
    case 'Approved for Payroll':
      return { label: 'APPROVED FOR PAYROLL', variant: 'success' };
    case 'Withdrawn':
      return { label: 'WITHDRAWN', variant: 'danger' };
    default:
      return { label: status ? status.toUpperCase() : 'ACTIVE', variant: 'neutral' };
  }
}

export function MyApplicationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);

  // Voluntary Withdrawal Modal State
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawReason, setWithdrawReason] = useState('Applying to a different scholarship program');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [dash, grantData, releases] = await Promise.all([
        fetchCitizenDashboard(),
        fetchCitizenGrantOverview().catch(() => null),
        fetchCitizenGrantReleases().catch(() => []),
      ]);
      setDashboardData(dash);
      setGrantOverview(grantData);
      setGrantReleases(releases);
    } catch (err: any) {
      console.error('[MyApplicationScreen] fetch error:', err);
      setError(err?.message || 'Unable to load scholarship application details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const application = dashboardData?.application;
  const scholarship = dashboardData?.scholarship;
  const academicPeriod = dashboardData?.academic_period;
  const processTimeline = dashboardData?.process_timeline || [];

  // Filter application timeline to exclude grant processing keys
  const applicationLifecycleTimeline = processTimeline.filter(
    (item) => !item.key.toLowerCase().includes('grant')
  );

  const isAppApproved = application?.application_status === 'Approved';
  const hasExistingGrantApp = Boolean(grantOverview?.has_existing_application && grantOverview?.application);
  const isGrantEligible = Boolean(grantOverview?.eligible);
  const showGrantContinuation = Boolean(isAppApproved || hasExistingGrantApp || (grantReleases && grantReleases.length > 0));

  const allowedWithdrawStatuses = [
    'Submitted',
    'Under Review',
    'For Compliance',
    'Ready for SSC',
    'Returned',
  ];
  const canWithdraw = Boolean(
    application && allowedWithdrawStatuses.includes(application.application_status)
  );
  const isWithdrawn = application?.application_status === 'Withdrawn';

  const handleConfirmWithdrawal = async () => {
    if (!application?.application_id) return;

    let finalReason = withdrawReason;
    if (withdrawReason === 'Other') {
      const trimmed = otherReasonText.trim();
      if (!trimmed) {
        Alert.alert('Reason Required', 'Please provide specific details for "Other" reason.');
        return;
      }
      finalReason = `Other: ${trimmed}`;
    }

    try {
      setIsWithdrawing(true);
      await withdrawCitizenApplication(application.application_id, finalReason);
      setIsWithdrawModalVisible(false);
      Alert.alert(
        'Application Withdrawn',
        'Your scholarship application has been withdrawn successfully.',
        [{ text: 'OK', onPress: () => loadData() }]
      );
    } catch (err: any) {
      Alert.alert(
        'Unable to Withdraw Application',
        err?.message || 'Application has already progressed beyond the withdrawal boundary and can no longer be withdrawn.'
      );
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC',
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#38BDF8' : '#0284C7'}
          colors={['#0284C7']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.push('/education/new-applicant' as any);
          }
        }}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.backIconCircle,
            isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
          ]}
        >
          <IconSymbol
            name="chevron.left"
            size={18}
            color={isDarkMode ? '#38BDF8' : '#0284C7'}
          />
        </View>
        <Text
          style={[
            styles.backText,
            isDarkMode && {
              color: '#38BDF8',
            },
          ]}
        >
          Back to New Applicant
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {error ? (
        <View
          style={[
            styles.sectionCard,
            { borderColor: '#EF4444', borderWidth: 1, padding: 16 },
            isDarkMode && { backgroundColor: '#1C2541' },
          ]}
        >
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '700', marginBottom: 8 }}>
            Unable to load application.
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginBottom: 14 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#0284C7',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={150} borderRadius={20} />
          <Skeleton height={120} borderRadius={20} />
          <Skeleton height={260} borderRadius={20} />
        </View>
      ) : !application ? (
        /* EMPTY STATE: NO ACTIVE APPLICATION */
        <View
          style={[
            styles.emptyCard,
            isDarkMode && {
              backgroundColor: '#01091D',
              borderColor: '#0D213F',
            },
          ]}
        >
          <View
            style={[
              styles.emptyIconCircle,
              isDarkMode && { backgroundColor: '#072040' },
            ]}
          >
            <IconSymbol
              name="doc.text.fill"
              size={30}
              color={isDarkMode ? '#38BDF8' : '#0284C7'}
            />
          </View>

          <Text
            style={[
              styles.emptyTitle,
              isDarkMode && { color: '#F8FAFC' },
            ]}
          >
            No Active Application
          </Text>

          <Text
            style={[
              styles.emptySub,
              isDarkMode && { color: '#CBD5E1' },
            ]}
          >
            You currently do not have an active scholarship application. Explore our scholarship matching tool to find programs that fit your profile or browse all available opportunities.
          </Text>

          <View style={styles.emptyActionsRow}>
            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                isDarkMode && { backgroundColor: '#38BDF8' },
              ]}
              onPress={() => router.push('/education/new-applicant/matching' as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.primaryActionBtnText,
                  isDarkMode && { color: '#0B132B' },
                ]}
              >
                Use Scholarship Matching
              </Text>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={isDarkMode ? '#0B132B' : '#FFFFFF'}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.secondaryActionBtn,
                isDarkMode && { borderColor: '#38BDF8' },
              ]}
              onPress={() => router.push('/education/new-applicant/browse-scholarships' as any)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.secondaryActionBtnText,
                  isDarkMode && { color: '#38BDF8' },
                ]}
              >
                Browse All Scholarships
              </Text>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={isDarkMode ? '#38BDF8' : '#0284C7'}
              />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <>
          {/* A. APPLICATION IDENTITY & STATUS HEADER CARD */}
          <View
            style={[
              styles.headerCard,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.headerTopRow}>
              <Text
                style={[
                  styles.headerPreTitle,
                  isDarkMode && { color: '#38BDF8' },
                ]}
              >
                {scholarship?.category_name?.toUpperCase() || 'SCHOLARSHIP APPLICATION'}
              </Text>
              {(() => {
                const badgeConfig = getStatusBadgeConfig(application.application_status);
                return <Badge label={badgeConfig.label} variant={badgeConfig.variant} />;
              })()}
            </View>

            <Text
              style={[
                styles.headerTitle,
                isDarkMode && { color: '#F8FAFC' },
              ]}
            >
              {scholarship?.program_name || 'City Government Scholarship Program'}
            </Text>

            <Text
              style={[
                styles.headerSub,
                isDarkMode && { color: '#CBD5E1' },
              ]}
            >
              {scholarship?.category_name || 'City Government Educational Assistance'}
            </Text>

            <View
              style={[
                styles.headerMetaRow,
                isDarkMode && { backgroundColor: '#111827' },
              ]}
            >
              <View style={styles.headerMetaCol}>
                <Text style={styles.headerMetaLabel}>Reference Code</Text>
                <Text
                  style={[
                    styles.headerMetaCode,
                    isDarkMode && { color: '#38BDF8' },
                  ]}
                >
                  {application.application_code || '—'}
                </Text>
              </View>

              <View style={styles.headerMetaCol}>
                <Text style={styles.headerMetaLabel}>Academic Period</Text>
                <Text
                  style={[
                    styles.headerMetaVal,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                >
                  {academicPeriod?.academic_year || 'AY 2026-2027'} • {academicPeriod?.term || 'Whole Year'}
                </Text>
              </View>
            </View>
          </View>

          {/* B. SCHEDULED LIVE INTERVIEW NOTICE CARD (WHEN PRESENT) */}
          {application.interview ? (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF',
                  borderColor: isDarkMode ? '#0284C7' : '#BAE6FD',
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.sectionHeaderRow}>
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: isDarkMode ? '#38BDF8' : '#0284C7', marginBottom: 0 },
                  ]}
                >
                  Scheduled Live Interview Notice
                </Text>
                <Badge
                  label={application.interview.status || 'Pending'}
                  variant="info"
                />
              </View>

              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? '#94A3B8' : '#475569',
                  marginBottom: 12,
                  lineHeight: 18,
                }}
              >
                Your scholarship application requires a live interview. Please be guided by the official schedule below:
              </Text>

              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Date</Text>
                  <Text style={[styles.infoValue, { fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
                    {application.interview.scheduled_date || 'TBA'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Time</Text>
                  <Text style={[styles.infoValue, { fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }]}>
                    {application.interview.scheduled_time || 'TBA'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Method</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                    {application.interview.method || 'Face-to-Face'}
                  </Text>
                </View>

                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Venue / Link</Text>
                  <Text style={[styles.infoValue, { color: isDarkMode ? '#38BDF8' : '#0284C7', fontWeight: '600' }]}>
                    {application.interview.venue_or_link || 'Education & Scholarship Office'}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}

          {/* C. APPLICATION LIFECYCLE PROGRESS */}
          <View
            style={[
              styles.sectionCard,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDarkMode && { color: '#F8FAFC' },
                ]}
              >
                Application Lifecycle
              </Text>
              <View
                style={[
                  styles.trackerBadge,
                  isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                ]}
              >
                <Text
                  style={[
                    styles.trackerBadgeText,
                    isDarkMode && { color: '#38BDF8' },
                  ]}
                >
                  APPLICATION PROGRESS
                </Text>
              </View>
            </View>

            {applicationLifecycleTimeline.length > 0 ? (
              <View style={{ marginTop: 8 }}>
                {applicationLifecycleTimeline.map((item, idx) => {
                  const isLast = idx === applicationLifecycleTimeline.length - 1;
                  const isCompleted = Boolean(item.is_completed);
                  const isCurrent = Boolean(item.is_current);
                  const nextItemCompleted =
                    !isLast && Boolean(applicationLifecycleTimeline[idx + 1]?.is_completed);

                  return (
                    <View key={item.key || idx} style={styles.timelineItemRow}>
                      <View style={styles.timelineLeftColumn}>
                        <View
                          style={[
                            styles.timelineIconCircle,
                            {
                              backgroundColor: isCompleted
                                ? '#DCFCE7'
                                : isCurrent
                                ? '#E0F2FE'
                                : isDarkMode
                                ? '#1E293B'
                                : '#F1F5F9',
                              borderColor: isCompleted
                                ? '#16A34A'
                                : isCurrent
                                ? '#0284C7'
                                : isDarkMode
                                ? '#475569'
                                : '#CBD5E1',
                            },
                          ]}
                        >
                          <IconSymbol
                            name={
                              isCompleted
                                ? 'checkmark.circle.fill'
                                : isCurrent
                                ? 'clock.fill'
                                : 'circle'
                            }
                            size={14}
                            color={
                              isCompleted
                                ? '#16A34A'
                                : isCurrent
                                ? '#0284C7'
                                : isDarkMode
                                ? '#64748B'
                                : '#94A3B8'
                            }
                          />
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineConnectorLine,
                              {
                                backgroundColor:
                                  isCompleted && nextItemCompleted
                                    ? '#16A34A'
                                    : isCompleted
                                    ? '#86EFAC'
                                    : isDarkMode
                                    ? '#334155'
                                    : '#E2E8F0',
                              },
                            ]}
                          />
                        )}
                      </View>

                      <View
                        style={[
                          styles.timelineContentCard,
                          isDarkMode && {
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                          },
                          // Highlight actively in-progress (non-completed) stages cleanly
                          isCurrent && !isCompleted && { borderColor: '#38BDF8', borderWidth: 1.5 },
                        ]}
                      >
                        <View style={styles.timelineContentHeader}>
                          <Text
                            style={[
                              styles.timelineTitle,
                              isDarkMode && { color: '#F8FAFC' },
                            ]}
                          >
                            {item.title}
                          </Text>
                          <View
                            style={[
                              styles.timelineStatusPill,
                              {
                                backgroundColor: isCompleted
                                  ? '#DCFCE7'
                                  : isCurrent
                                  ? '#E0F2FE'
                                  : isDarkMode
                                  ? '#0F172A'
                                  : '#F1F5F9',
                                borderColor: isCompleted
                                  ? '#BBF7D0'
                                  : isCurrent
                                  ? '#BAE6FD'
                                  : isDarkMode
                                  ? '#334155'
                                  : '#E2E8F0',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.timelineStatusPillText,
                                {
                                  color: isCompleted
                                    ? '#15803D'
                                    : isCurrent
                                    ? '#0284C7'
                                    : isDarkMode
                                    ? '#94A3B8'
                                    : '#64748B',
                                },
                              ]}
                            >
                              {isCompleted
                                ? 'Completed'
                                : isCurrent
                                ? 'In Progress'
                                : 'Pending'}
                            </Text>
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.timelineDateText,
                            {
                              color: isCompleted
                                ? '#16A34A'
                                : isCurrent
                                ? '#0284C7'
                                : isDarkMode
                                ? '#94A3B8'
                                : '#64748B',
                            },
                          ]}
                        >
                          {item.date
                            ? new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : isCompleted
                            ? 'Completed'
                            : 'Pending execution'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            ) : (
              <Text
                style={{
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  fontSize: 13,
                  marginTop: 8,
                }}
              >
                No application status history available.
              </Text>
            )}
          </View>

          {/* D. SCHOLARSHIP GRANT CONTINUATION SECTION (SEPARATED VISUALLY) */}
          {showGrantContinuation && (
            <View style={{ marginTop: 8 }}>
              {/* SUBSECTION 1: GRANT APPLICATION CONTINUATION */}
              {hasExistingGrantApp && grantOverview?.application ? (
                /* SCENARIO 1: EXISTING GRANT APPLICATION */
                <View
                  style={[
                    styles.grantCard,
                    isDarkMode && {
                      backgroundColor: '#1E293B',
                      borderColor: '#0D9488',
                    },
                  ]}
                >
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: isDarkMode ? '#2DD4BF' : '#0F766E', marginBottom: 2 },
                        ]}
                      >
                        Scholarship Grant Application
                      </Text>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        Financial assistance & tuition grant workflow
                      </Text>
                    </View>
                    {(() => {
                      const grantBadge = getGrantBadgeConfig(grantOverview.application?.grant_status);
                      return <Badge label={grantBadge.label} variant={grantBadge.variant} />;
                    })()}
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      color: isDarkMode ? '#CBD5E1' : '#334155',
                      lineHeight: 19,
                      marginTop: 4,
                      marginBottom: 12,
                    }}
                  >
                    {grantOverview.application.grant_status === 'Submitted'
                      ? 'Your grant requirements have been submitted and are awaiting administrative verification.'
                      : grantOverview.application.grant_status === 'Under Review'
                      ? 'Your submitted grant requirements are currently being evaluated.'
                      : grantOverview.application.grant_status === 'Approved for Payroll'
                      ? 'Your grant application has completed evaluation and is queued for payroll processing.'
                      : grantOverview.application.grant_status === 'For Compliance'
                      ? 'One or more required grant documents need your correction or replacement.'
                      : 'Your scholarship grant application is active for the current academic period.'}
                  </Text>

                  <View
                    style={[
                      styles.infoGrid,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F0FDFA',
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#134E4A' : '#CCFBF1',
                      },
                    ]}
                  >
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Grant Code</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { color: isDarkMode ? '#2DD4BF' : '#0F766E', fontWeight: '800' },
                        ]}
                      >
                        {grantOverview.application.grant_application_code}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Term</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        AY {grantOverview.application.academic_year} • {grantOverview.application.academic_term}
                      </Text>
                    </View>

                    {grantOverview.application.document_summary && (
                      <View style={styles.infoRow}>
                        <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Requirements</Text>
                        <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                          {grantOverview.application.document_summary.submitted_count} of{' '}
                          {grantOverview.application.document_summary.required_count} submitted
                        </Text>
                      </View>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.grantActionBtn}
                    onPress={() => router.push('/education/grant' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.grantActionBtnText}>View Scholarship Grant</Text>
                    <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : isGrantEligible ? (
                /* SCENARIO 2: APPROVED APPLICATION, READY TO START GRANT */
                <View
                  style={[
                    styles.grantCard,
                    isDarkMode && {
                      backgroundColor: '#1E293B',
                      borderColor: '#0D9488',
                    },
                  ]}
                >
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: isDarkMode ? '#2DD4BF' : '#0F766E', marginBottom: 2 },
                        ]}
                      >
                        Scholarship Grant
                      </Text>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        Next step for approved scholars
                      </Text>
                    </View>
                    <Badge label="ACTION AVAILABLE" variant="success" />
                  </View>

                  <Text
                    style={{
                      fontSize: 13,
                      color: isDarkMode ? '#CBD5E1' : '#334155',
                      lineHeight: 19,
                      marginTop: 4,
                      marginBottom: 12,
                    }}
                  >
                    Your scholarship application has been approved. Complete the required grant documents (Certificate of Registration and Statement of Account) for this academic period to receive your educational assistance.
                  </Text>

                  <View
                    style={[
                      styles.infoGrid,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#F0FDFA',
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#134E4A' : '#CCFBF1',
                      },
                    ]}
                  >
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {grantOverview?.current_academic_period?.academic_year || academicPeriod?.academic_year || 'AY 2026-2027'} (
                        {grantOverview?.current_academic_period?.term || academicPeriod?.term || 'Current Term'})
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Required Action</Text>
                      <Text style={[styles.infoValue, { color: isDarkMode ? '#2DD4BF' : '#0F766E', fontWeight: '700' }]}>
                        Submit Grant Documents
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.grantActionBtn}
                    onPress={() => router.push('/education/grant' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.grantActionBtnText}>Open Scholarship Grant</Text>
                    <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : null}

              {/* SUBSECTION 2: GRANT DISTRIBUTION PROGRESSION (WHEN RELEASES EXIST) */}
              {grantReleases && grantReleases.length > 0 && (
                <View
                  style={[
                    styles.distributionCard,
                    isDarkMode && {
                      backgroundColor: '#1E293B',
                      borderColor: '#EA580C',
                    },
                  ]}
                >
                  <View style={styles.sectionHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.sectionTitle,
                          { color: isDarkMode ? '#FB923C' : '#EA580C', marginBottom: 2 },
                        ]}
                      >
                        Grant Distribution
                      </Text>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        Authorized disbursement schedule
                      </Text>
                    </View>
                    <Badge
                      label={
                        grantReleases[0].release_status === 'Completed' || grantReleases[0].release_status === 'Released'
                          ? 'DISBURSED'
                          : 'PROCESSING'
                      }
                      variant={
                        grantReleases[0].release_status === 'Completed' || grantReleases[0].release_status === 'Released'
                          ? 'success'
                          : 'warning'
                      }
                    />
                  </View>

                  <View
                    style={[
                      styles.infoGrid,
                      {
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFF7ED',
                        padding: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#7C2D12' : '#FFEDD5',
                        marginTop: 6,
                      },
                    ]}
                  >
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Release Reference</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { color: isDarkMode ? '#FB923C' : '#EA580C', fontWeight: '800' },
                        ]}
                      >
                        {grantReleases[0].release_code}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Approved Amount</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          { fontWeight: '800', color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                        ]}
                      >
                        ₱{grantReleases[0].authorized_amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Disbursement Status</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {grantReleases[0].release_status}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.distributionActionBtn}
                    onPress={() => router.push('/education/distribution' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.distributionActionBtnText}>View Distribution Schedule</Text>
                    <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* E. VOLUNTARY WITHDRAWAL SECTION */}
          {canWithdraw && (
            <View
              style={[
                styles.withdrawCard,
                isDarkMode && {
                  backgroundColor: '#1E293B',
                  borderColor: '#F43F5E',
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text style={styles.withdrawTitle}>Voluntary Withdrawal</Text>
                <Badge label="Active Application" variant="warning" />
              </View>
              <Text
                style={[
                  styles.withdrawSub,
                  isDarkMode && { color: '#CBD5E1' },
                ]}
              >
                Need to apply for a different scholarship program? You may voluntarily withdraw this active application before formal committee evaluation.
              </Text>
              <TouchableOpacity
                style={styles.withdrawBtn}
                onPress={() => setIsWithdrawModalVisible(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.withdrawBtnText}>Withdraw Application</Text>
              </TouchableOpacity>
            </View>
          )}

          {isWithdrawn && (
            <View
              style={[
                styles.withdrawnCard,
                isDarkMode && {
                  backgroundColor: '#1E293B',
                  borderColor: '#475569',
                },
              ]}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  Application Withdrawn
                </Text>
                <Badge label="Withdrawn" variant="neutral" />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? '#94A3B8' : '#64748B',
                  lineHeight: 18,
                }}
              >
                This scholarship application has been voluntarily withdrawn. You are eligible to apply for another available scholarship program.
              </Text>
            </View>
          )}

          {/* WITHDRAWAL CONFIRMATION MODAL */}
          <Modal
            visible={isWithdrawModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => {
              if (!isWithdrawing) setIsWithdrawModalVisible(false);
            }}
          >
            <View
              style={{
                flex: 1,
                backgroundColor: 'rgba(0,0,0,0.55)',
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
              }}
            >
              <View
                style={[
                  styles.sectionCard,
                  {
                    width: '100%',
                    maxWidth: 440,
                    borderColor: '#F43F5E',
                    borderWidth: 1,
                  },
                  isDarkMode && { backgroundColor: '#1E293B' },
                ]}
              >
                <Text
                  style={[
                    styles.sectionTitle,
                    { color: '#E11D48', marginBottom: 8 },
                  ]}
                >
                  Withdraw Application?
                </Text>

                <Text
                  style={{
                    fontSize: 13,
                    color: isDarkMode ? '#CBD5E1' : '#475569',
                    lineHeight: 18,
                    marginBottom: 14,
                  }}
                >
                  Are you sure you want to withdraw this application? This action cannot be undone. Once withdrawn, you may apply for any eligible scholarship program.
                </Text>

                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: isDarkMode ? '#F8FAFC' : '#1E293B',
                    marginBottom: 8,
                  }}
                >
                  Reason for Withdrawal:
                </Text>

                {[
                  'Applying to a different scholarship program',
                  'Transferred school or course',
                  'No longer eligible',
                  'Personal reasons',
                  'Other',
                ].map((opt) => {
                  const isSelected = withdrawReason === opt;
                  return (
                    <TouchableOpacity
                      key={opt}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 10,
                        borderRadius: 8,
                        marginBottom: 4,
                        backgroundColor: isSelected
                          ? isDarkMode
                            ? '#334155'
                            : '#FFE4E6'
                          : 'transparent',
                      }}
                      onPress={() => setWithdrawReason(opt)}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          borderWidth: 2,
                          borderColor: isSelected ? '#E11D48' : '#94A3B8',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginRight: 8,
                        }}
                      >
                        {isSelected && (
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: '#E11D48',
                            }}
                          />
                        )}
                      </View>
                      <Text
                        style={{
                          fontSize: 12,
                          color: isSelected
                            ? '#E11D48'
                            : isDarkMode
                            ? '#CBD5E1'
                            : '#334155',
                          fontWeight: isSelected ? '700' : '500',
                        }}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {withdrawReason === 'Other' && (
                  <View style={{ marginTop: 8, marginBottom: 12 }}>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: '600',
                        color: isDarkMode ? '#94A3B8' : '#64748B',
                        marginBottom: 4,
                      }}
                    >
                      Specify reason details:
                    </Text>
                    <TextInput
                      style={{
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        color: isDarkMode ? '#F8FAFC' : '#0F172A',
                        borderRadius: 8,
                        padding: 8,
                        fontSize: 12,
                        minHeight: 60,
                        textAlignVertical: 'top',
                      }}
                      multiline
                      numberOfLines={3}
                      placeholder="Enter details..."
                      placeholderTextColor="#94A3B8"
                      value={otherReasonText}
                      onChangeText={setOtherReasonText}
                    />
                  </View>
                )}

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    gap: 10,
                    marginTop: 14,
                  }}
                >
                  <TouchableOpacity
                    style={{
                      paddingVertical: 9,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                    }}
                    onPress={() => setIsWithdrawModalVisible(false)}
                    disabled={isWithdrawing}
                  >
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: '600',
                        color: isDarkMode ? '#CBD5E1' : '#475569',
                      }}
                    >
                      Keep Application
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{
                      paddingVertical: 9,
                      paddingHorizontal: 16,
                      borderRadius: 8,
                      backgroundColor: '#E11D48',
                      opacity: isWithdrawing ? 0.6 : 1,
                    }}
                    onPress={handleConfirmWithdrawal}
                    disabled={isWithdrawing}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#FFFFFF' }}>
                      {isWithdrawing ? 'Withdrawing...' : 'Confirm Withdrawal'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </ScrollView>
  );
}
