import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol, IconSymbolName } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenDashboardData, fetchCitizenDashboard } from './api/scholarshipDashboardApi';
import { CitizenComplianceDetailsData, fetchCitizenRenewalCompliance } from '@/src/features/education/renewal/api/renewalApi';
import { ApplicationComplianceData, fetchApplicationCompliance } from '../compliance/api/newApplicantComplianceApi';
import { CitizenGrantOverviewData, fetchCitizenGrantOverview } from '../grant/api/grantApi';
import { CitizenGrantReleaseItem, fetchCitizenGrantReleases } from '../grant/api/grantReleaseApi';
import { styles } from './styles/ScholarshipDashboard.styles';

const scholarshipBg = require("@/assets/images/scholarship-bg.png");

interface GrantCardConfig {
  badgeText: string | null;
  badgeVariant: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  title: string;
  supportingText: string;
  reference: string | null;
  reqText: string | null;
  iconName: IconSymbolName;
  iconColor: string;
  ctaText: string;
  onCtaPress: () => void;
}

function getGrantCardConfig(
  overview: CitizenGrantOverviewData | null,
  router: any,
  isDarkMode: boolean
): GrantCardConfig {
  const application = overview?.application;
  const hasApp = Boolean(overview?.has_existing_application && application);
  const status = application?.grant_status;

  const navigateToGrant = () => router.push('/education/grant' as any);

  let reqText: string | null = null;
  if (application) {
    if (application.document_summary?.summary_label) {
      reqText = application.document_summary.summary_label;
    } else if (application.documents) {
      const activeDocs = application.documents.filter((d) => d.submission_status !== 'Removed');
      const requiredCount = application.institution_type === 'Private' ? 2 : 1;
      reqText = `${activeDocs.length} / ${requiredCount} Requirements Submitted`;
    }
  }

  if (!hasApp || !application) {
    return {
      badgeText: null,
      badgeVariant: 'neutral',
      title: 'No Grant Application Yet',
      supportingText: 'Submit your grant requirements for the current academic period.',
      reference: null,
      reqText: null,
      iconName: 'doc.text.fill',
      iconColor: isDarkMode ? '#38BDF8' : '#0284C7',
      ctaText: 'Start Grant Application',
      onCtaPress: navigateToGrant,
    };
  }

  switch (status) {
    case 'Draft':
      return {
        badgeText: 'Draft',
        badgeVariant: 'warning',
        title: 'Grant Application In Progress',
        supportingText: 'Complete your required documents to submit your application.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'pencil',
        iconColor: '#D97706',
        ctaText: 'Continue Application',
        onCtaPress: navigateToGrant,
      };

    case 'Submitted':
      return {
        badgeText: 'Submitted',
        badgeVariant: 'success',
        title: 'Grant Application Submitted',
        supportingText: 'Your grant requirements have been submitted and are awaiting review.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'checkmark.seal.fill',
        iconColor: '#16A34A',
        ctaText: 'View Grant Application',
        onCtaPress: navigateToGrant,
      };

    case 'For Review':
      return {
        badgeText: 'For Review',
        badgeVariant: 'info',
        title: 'Grant Application for Review',
        supportingText: 'Your submitted requirements are queued for administrative review.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'clock.fill',
        iconColor: '#0284C7',
        ctaText: 'View Application',
        onCtaPress: navigateToGrant,
      };

    case 'Under Review':
      return {
        badgeText: 'Under Review',
        badgeVariant: 'info',
        title: 'Grant Application Under Review',
        supportingText: 'Your grant requirements are currently being evaluated.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'clock.fill',
        iconColor: '#4F46E5',
        ctaText: 'View Application',
        onCtaPress: navigateToGrant,
      };

    case 'For Compliance':
      return {
        badgeText: 'For Compliance',
        badgeVariant: 'warning',
        title: 'Additional Action Required',
        supportingText: 'One or more grant requirements need your attention.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'exclamationmark.triangle.fill',
        iconColor: '#D97706',
        ctaText: 'Review Requirements',
        onCtaPress: navigateToGrant,
      };

    case 'Approved for Payroll':
      return {
        badgeText: 'Approved for Payroll',
        badgeVariant: 'success',
        title: 'Grant Approved for Processing',
        supportingText: 'Your grant application has been approved and is queued for financial processing.',
        reference: application.grant_application_code,
        reqText,
        iconName: 'checkmark.circle.fill',
        iconColor: '#16A34A',
        ctaText: 'View Grant Status',
        onCtaPress: navigateToGrant,
      };

    case 'Withdrawn':
      return {
        badgeText: 'Withdrawn',
        badgeVariant: 'danger',
        title: 'Grant Application Withdrawn',
        supportingText: 'This grant application is no longer active.',
        reference: application.grant_application_code,
        reqText: null,
        iconName: 'xmark.circle.fill',
        iconColor: '#64748B',
        ctaText: 'View Grant Status',
        onCtaPress: navigateToGrant,
      };

    default:
      return {
        badgeText: status || 'Active',
        badgeVariant: 'neutral',
        title: 'Grant Application Status',
        supportingText: `Application reference: ${application.grant_application_code}`,
        reference: application.grant_application_code,
        reqText,
        iconName: 'doc.text.fill',
        iconColor: '#0284C7',
        ctaText: 'View Grant Application',
        onCtaPress: navigateToGrant,
      };
  }
}

export function ScholarshipDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [renewalCompliance, setRenewalCompliance] = useState<CitizenComplianceDetailsData | null>(null);
  const [appCompliance, setAppCompliance] = useState<ApplicationComplianceData | null>(null);

  // Grant Overview State
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantOverviewLoading, setGrantOverviewLoading] = useState(true);
  const [grantOverviewError, setGrantOverviewError] = useState<string | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);

  const loadGrantOverview = useCallback(async () => {
    try {
      setGrantOverviewError(null);
      setGrantOverviewLoading(true);
      const overview = await fetchCitizenGrantOverview();
      setGrantOverview(overview);
    } catch (err: any) {
      console.warn('[ScholarshipDashboardScreen] fetch grant overview error:', err);
      setGrantOverview(null);
      setGrantOverviewError(err?.message || 'Unable to load grant status.');
    } finally {
      setGrantOverviewLoading(false);
    }
  }, []);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await fetchCitizenDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('[ScholarshipDashboardScreen] load error:', err);
      setError(err?.message || 'Unable to load scholarship information.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }

    loadGrantOverview();

    fetchCitizenGrantReleases()
      .then((rels) => setGrantReleases(rels))
      .catch(() => setGrantReleases([]));

    // Safely fetch compliance status without blocking dashboard loading
    fetchCitizenRenewalCompliance()
      .then((comp) => setRenewalCompliance(comp))
      .catch(() => setRenewalCompliance(null));

    fetchApplicationCompliance()
      .then((comp) => setAppCompliance(comp))
      .catch(() => setAppCompliance(null));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  const state = dashboardData?.state;
  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const academicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;
  const latestUpdate = dashboardData?.latest_update;

  // Renewal Compliance Filter
  const renewalUnresolved = renewalCompliance?.unresolved_compliance_requests || [];
  const renewalReplacementDocs = renewalCompliance?.documents_needing_replacement || [];
  const hasRenewalAction = Boolean(
    renewalCompliance && (renewalUnresolved.length > 0 || renewalReplacementDocs.length > 0)
  );

  // New Applicant Compliance Filters
  const appAllRequests = appCompliance?.compliance_requests || [];
  const appActionableRequests = appAllRequests.filter(
    (item) => item.status === 'Pending' || item.status === 'Overdue'
  );
  const appAwaitingReview = appAllRequests.filter(
    (item) => item.status === 'Submitted'
  );
  const appResolved = appAllRequests.filter(
    (item) => item.status === 'Complied'
  );

  const hasAppAction = appActionableRequests.length > 0;
  const hasComplianceHistory = appAllRequests.length > 0;
  const hasRenewalComplianceHistory = hasRenewalAction;
  const totalActionCount = (hasAppAction ? appActionableRequests.length : 0) + (hasRenewalAction ? 1 : 0);

  const cardConfig = getGrantCardConfig(grantOverview, router, isDarkMode);

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
          tintColor={isDarkMode ? '#C084FC' : '#7E22CE'}
          colors={['#7E22CE']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? '#C084FC' : '#7E22CE'}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#C084FC' }]}>
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* PAGE HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
          Scholarship Dashboard
        </Text>
      </View>

      {/* ERROR STATE */}
      {error ? (
        <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1, padding: 16, marginBottom: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Unable to load scholarship information.
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#7E22CE',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadDashboard();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LOADING STATE */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={200} borderRadius={20} />
          <Skeleton height={160} borderRadius={20} />
          <Skeleton height={100} borderRadius={20} />
        </View>
      ) : state === 'NO_SCHOLARSHIP' ? (
        /* NO SCHOLARSHIP STATE (ORIGINAL EMPTY CARD) */
        <View style={[styles.emptyCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: '#3B0764' }]}>
            <IconSymbol name="book.closed.fill" size={32} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
          </View>
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyBadgeText}>CITIZEN PORTAL</Text>
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Active Scholarship Found
          </Text>
          <Text style={[styles.emptySub, isDarkMode && { color: '#CBD5E1' }]}>
            Your scholarship details and payout status will appear here once you become an approved scholar or submit a scholarship application.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={() => router.push('/education/new-applicant/browse-scholarships' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyPrimaryBtnText}>Browse Available Scholarships</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* POPULATED DASHBOARD CONTENT WITH APPROVED HERO CARD & REVISED LAYOUT */
        <View style={styles.cardsGrid}>
          {/* TOP HERO SCHOLARSHIP CARD */}
          <View
            style={[
              styles.heroCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={styles.heroTopSection}>
              <View style={styles.heroLeftContent}>
                <View style={styles.heroHeaderRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      isDarkMode && { backgroundColor: "#3B0764" },
                    ]}
                  >
                    <IconSymbol
                      name="book.closed.fill"
                      size={20}
                      color={isDarkMode ? "#C084FC" : "#7E22CE"}
                    />
                  </View>

                  <View
                    style={[
                      styles.activeBadge,
                      isDarkMode && { backgroundColor: "#064E3B" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeBadgeText,
                        isDarkMode && { color: "#34D399" },
                      ]}
                    >
                      {scholar ? (scholar.scholar_status?.toUpperCase() || 'ACTIVE SCHOLAR') : 'APPLICATION IN PROGRESS'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {scholarship?.program_name || 'Scholarship Program'}
                </Text>
                <Text
                  style={[
                    styles.heroSubtitle,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {scholarship?.category_name || 'City Government Educational Program'}
                </Text>
              </View>

              {/* Minimalist Artwork Container */}
              <View
                style={[
                  styles.heroArtworkBox,
                  isDarkMode && { backgroundColor: "#2D1557" },
                ]}
              >
                <Image
                  source={scholarshipBg}
                  style={styles.heroArtwork}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View
              style={[
                styles.heroDivider,
                isDarkMode && { backgroundColor: "#293548" },
              ]}
            />

            {/* DETAILS ROW: ACADEMIC YEAR, TERM, SCHOLAR ID */}
            <View
              style={[
                styles.heroBottomRow,
                isDarkMode && { backgroundColor: "#1C2541" },
              ]}
            >
              <View style={styles.heroCol}>
                <Text style={styles.heroColLabel}>Academic Year</Text>
                <Text
                  style={[
                    styles.heroColValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                  numberOfLines={1}
                >
                  {academicPeriod?.academic_year || 'AY 2026-2027'}
                </Text>
              </View>

              <View
                style={[
                  styles.heroColDivider,
                  isDarkMode && { backgroundColor: "#293548" },
                ]}
              />

              <View style={styles.heroCol}>
                <Text style={styles.heroColLabel}>Term</Text>
                <Text
                  style={[
                    styles.heroColValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                  numberOfLines={1}
                >
                  {academicPeriod?.term || 'Whole Academic Year'}
                </Text>
              </View>

              <View
                style={[
                  styles.heroColDivider,
                  isDarkMode && { backgroundColor: "#293548" },
                ]}
              />

              <View style={styles.heroColScholarId}>
                <Text style={styles.heroColLabel}>{scholar ? 'Scholar ID' : 'App Code'}</Text>
                <Text
                  style={[
                    styles.scholarIdText,
                    isDarkMode && { color: "#C084FC" },
                  ]}
                  numberOfLines={1}
                >
                  {scholar?.scholar_code || application?.application_code || '—'}
                </Text>
              </View>
            </View>

            {/* VIEW DETAILS ACTION */}
            <View style={styles.heroViewDetailsRow}>
              <TouchableOpacity
                style={styles.heroViewDetailsBtn}
                onPress={() => {
                  router.push('/education/dashboard/details' as any);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.heroViewDetailsText, isDarkMode && { color: '#C084FC' }]}>
                  View Details
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? '#C084FC' : '#7E22CE'}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* CURRENT GRANT CARD */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>CURRENT GRANT</Text>
              {cardConfig.badgeText ? (
                <Badge label={cardConfig.badgeText} variant={cardConfig.badgeVariant} />
              ) : null}
            </View>

            {grantOverviewLoading ? (
              <View style={{ paddingVertical: 8, gap: 8 }}>
                <Skeleton height={20} borderRadius={6} width="65%" />
                <Skeleton height={14} borderRadius={4} width="85%" />
                <Skeleton height={40} borderRadius={10} width="100%" />
              </View>
            ) : grantOverviewError ? (
              <View style={{ paddingVertical: 6 }}>
                <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                  Unable to load grant status.
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    alignSelf: 'flex-start',
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                  }}
                  onPress={loadGrantOverview}
                >
                  <Text style={{ color: isDarkMode ? '#F8FAFC' : '#334155', fontSize: 12, fontWeight: '700' }}>
                    Retry
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 12 }}>
                {/* MAIN CONTENT ROW */}
                <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                  <View
                    style={[
                      styles.grantIconCircle,
                      isDarkMode && { backgroundColor: "#3B0764" },
                    ]}
                  >
                    <IconSymbol
                      name={cardConfig.iconName}
                      size={22}
                      color={cardConfig.iconColor}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={[styles.updateTitle, isDarkMode && { color: '#F8FAFC' }, { fontSize: 15, marginBottom: 2 }]}>
                      {cardConfig.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                      {cardConfig.supportingText}
                    </Text>

                    {/* METADATA GRID (GRANT REFERENCE & REQUIREMENTS) */}
                    {(cardConfig.reference || cardConfig.reqText) && (
                      <View
                        style={{
                          backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                          borderRadius: 10,
                          padding: 10,
                          marginTop: 10,
                          borderWidth: 1,
                          borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                          gap: 6,
                        }}
                      >
                        {cardConfig.reference && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>Grant Reference</Text>
                            <Text style={{ fontSize: 12, color: '#0284C7', fontWeight: '700' }}>
                              {cardConfig.reference}
                            </Text>
                          </View>
                        )}
                        {cardConfig.reqText && (
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '500' }}>Requirements</Text>
                            <Text style={{ fontSize: 12, color: isDarkMode ? '#F8FAFC' : '#0F172A', fontWeight: '600' }}>
                              {cardConfig.reqText}
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </View>

                {/* PRIMARY CTA BUTTON */}
                <TouchableOpacity
                  style={{
                    marginTop: 4,
                    backgroundColor: '#0F766E',
                    borderRadius: 10,
                    paddingVertical: 11,
                    paddingHorizontal: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                  onPress={cardConfig.onCtaPress}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                    {cardConfig.ctaText}
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* GRANT RELEASE DISTRIBUTION SCHEDULE SUMMARY CARD */}
          {grantReleases.length > 0 && (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: '#1C2541',
                  borderColor: '#3A506B',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.sectionLabel, { marginBottom: 0 }]}>DISTRIBUTION SCHEDULE</Text>
                <Badge
                  label={
                    grantReleases[0].release_status === 'Completed' || grantReleases[0].release_status === 'Released'
                      ? 'RELEASED'
                      : 'ACTIVE RELEASE'
                  }
                  variant={
                    grantReleases[0].release_status === 'Completed' || grantReleases[0].release_status === 'Released'
                      ? 'success'
                      : 'warning'
                  }
                />
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 4 }}>
                <View style={[styles.grantIconCircle, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
                  <IconSymbol name="location.fill" size={20} color={isDarkMode ? '#FBBF24' : '#B45309'} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={[styles.updateTitle, isDarkMode && { color: '#F8FAFC' }, { fontSize: 15 }]}>
                    {grantReleases[0].program_name}
                  </Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#64748B', marginTop: 2 }}>
                    AY {grantReleases[0].academic_year} • {grantReleases[0].academic_term}
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: '800', color: isDarkMode ? '#38BDF8' : '#0284C7', marginTop: 4 }}>
                    Approved Grant Amount: ₱{grantReleases[0].authorized_amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  marginTop: 10,
                  backgroundColor: '#EA580C',
                  borderRadius: 10,
                  paddingVertical: 10,
                  paddingHorizontal: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
                onPress={() => router.push('/education/distribution' as any)}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }}>
                  View Distribution Schedule
                </Text>
                <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* PERSISTENT COMPLIANCE REQUESTS HISTORY CARD */}
          {(hasComplianceHistory || hasRenewalComplianceHistory) && (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: '#1C2541',
                  borderColor: '#3A506B',
                },
              ]}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <Text style={styles.sectionLabel}>COMPLIANCE REQUESTS</Text>
                <TouchableOpacity
                  onPress={() => router.push('/education/new-applicant/compliance' as any)}
                  activeOpacity={0.7}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                >
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#C084FC' : '#7E22CE' }}>
                    View Requests
                  </Text>
                  <IconSymbol name="chevron.right" size={12} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
                </TouchableOpacity>
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={[styles.grantIconCircle, { backgroundColor: isDarkMode ? '#312E81' : '#F1F5F9' }]}>
                  <IconSymbol name="doc.text.fill" size={20} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
                </View>

                <View style={{ flex: 1 }}>
                  {hasAppAction ? (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      ⚠ {appActionableRequests.length} Action Required
                    </Text>
                  ) : appAwaitingReview.length > 0 ? (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#0284C7' }}>
                      ◷ {appAwaitingReview.length} Awaiting Review
                    </Text>
                  ) : appResolved.length > 0 ? (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: '#16A34A' }}>
                      ✓ {appResolved.length} Resolved
                    </Text>
                  ) : (
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      Compliance History
                    </Text>
                  )}

                  <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                    {appResolved.length > 0
                      ? 'Your submitted corrections were reviewed and accepted.'
                      : appAwaitingReview.length > 0
                      ? 'Replacement document submitted — awaiting Secretariat validation.'
                      : 'Document replacement requests issued by the Secretariat.'}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* UNIFIED ACTION REQUIRED COMPLIANCE CARD(S) */}
          {(hasAppAction || hasRenewalAction) && (
            <View style={{ gap: 12 }}>
              {totalActionCount > 1 && (
                <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A', marginLeft: 4 }}>
                  ACTION REQUIRED ({totalActionCount} REQUESTS)
                </Text>
              )}

              {/* NEW APPLICANT COMPLIANCE BANNER */}
              {hasAppAction &&
                appActionableRequests.map((req) => (
                  <View
                    key={req.compliance_id}
                    style={[styles.actionRequiredCard, isDarkMode && { backgroundColor: '#312E81', borderColor: '#6366F1' }]}
                  >
                    <View style={styles.actionRequiredHeaderRow}>
                      <View style={[styles.actionRequiredIconCircle, isDarkMode && { backgroundColor: '#3730A3' }]}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={20} color={isDarkMode ? '#A5B4FC' : '#D97706'} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.actionRequiredTitle, isDarkMode && { color: '#EEF2FF' }]}>
                          ACTION REQUIRED — APPLICATION
                        </Text>
                        <Text style={[styles.actionRequiredSub, isDarkMode && { color: '#C7D2FE' }]}>
                          {req.requirement_title} (Replacement Required)
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.actionRequiredBtn}
                      onPress={() => router.push('/education/new-applicant/compliance' as any)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.actionRequiredBtnText}>Review Request</Text>
                      <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
                  </View>
                ))}

              {/* RENEWAL COMPLIANCE BANNER */}
              {hasRenewalAction && (
                <View style={[styles.actionRequiredCard, isDarkMode && { backgroundColor: '#312E81', borderColor: '#6366F1' }]}>
                  <View style={styles.actionRequiredHeaderRow}>
                    <View style={[styles.actionRequiredIconCircle, isDarkMode && { backgroundColor: '#3730A3' }]}>
                      <IconSymbol name="exclamationmark.triangle.fill" size={20} color={isDarkMode ? '#A5B4FC' : '#D97706'} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.actionRequiredTitle, isDarkMode && { color: '#EEF2FF' }]}>
                        ACTION REQUIRED — RENEWAL
                      </Text>
                      <Text style={[styles.actionRequiredSub, isDarkMode && { color: '#C7D2FE' }]}>
                        {renewalCompliance?.ssc_return_context?.return_instructions ||
                          renewalCompliance?.ssc_return_context?.return_reason ||
                          renewalUnresolved[0]?.instructions ||
                          (renewalReplacementDocs[0]
                            ? `Document replacement required for ${renewalReplacementDocs[0].document_type}`
                            : 'A compliance request requires your attention.')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.actionRequiredBtn}
                    onPress={() => router.push('/education/renewal/compliance' as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.actionRequiredBtnText}>Review Request</Text>
                    <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* LATEST UPDATE CARD */}
          {latestUpdate && latestUpdate.title ? (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text style={styles.sectionLabel}>LATEST UPDATE</Text>
              <Text
                style={[
                  styles.updateTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {latestUpdate.title}
              </Text>
              {latestUpdate.timestamp ? (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#64748B', marginTop: 4 }}>
                  {new Date(latestUpdate.timestamp).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </ScrollView>
  );
}
