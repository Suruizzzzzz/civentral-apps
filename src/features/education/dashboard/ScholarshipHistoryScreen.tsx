import { formatDate as formatAppDate } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenDashboardData,
  fetchCitizenDashboard,
  fetchCitizenTrackedItems,
  TrackedItem,
  withdrawCitizenApplication,
} from './api/scholarshipDashboardApi';
import { CitizenGrantOverviewData, fetchCitizenGrantOverview } from '../grant/api/grantApi';
import { CitizenGrantReleaseItem, fetchCitizenGrantReleases } from '../grant/api/grantReleaseApi';
import { styles } from './styles/ScholarshipHistory.styles';

export interface HistoryRecord {
  id: string;
  rawId?: number;
  academicPeriod: string;
  isCurrent: boolean;
  recordType: 'Application' | 'Renewal' | 'Grant';
  status: string;
  date: string | null;
  referenceCode: string | null;
  programTitle: string;
  categorySubtitle: string;
  timestamp: number;
}



function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const res = formatAppDate(dateStr, '—');
  return res === '—' ? null : res;
}

function getStatusColors(status: string, isDarkMode: boolean) {
  const s = status.toLowerCase();
  if (
    s.includes('disapprov') ||
    s.includes('reject') ||
    s.includes('withdraw') ||
    s.includes('fail') ||
    s.includes('cancel')
  ) {
    return {
      dotColor: '#DC2626',
      textColor: isDarkMode ? '#F87171' : '#DC2626',
      pillBg: isDarkMode ? '#3B1D28' : '#FEF2F2',
      pillBorder: isDarkMode ? '#991B1B' : '#FCA5A5',
    };
  }
  if (
    s.includes('complet') ||
    (s.includes('approv') && !s.includes('disapprov')) ||
    s.includes('disburs') ||
    s.includes('releas') ||
    s.includes('active')
  ) {
    return {
      dotColor: '#16A34A',
      textColor: isDarkMode ? '#4ADE80' : '#16A34A',
      pillBg: isDarkMode ? '#064E3B' : '#DCFCE7',
      pillBorder: isDarkMode ? '#059669' : '#86EFAC',
    };
  }
  if (
    s.includes('review') ||
    s.includes('eval') ||
    s.includes('ssc') ||
    s.includes('process') ||
    s.includes('schedul') ||
    s.includes('payroll')
  ) {
    return {
      dotColor: '#7E22CE',
      textColor: isDarkMode ? '#C084FC' : '#7E22CE',
      pillBg: isDarkMode ? '#3B0764' : '#F3E8FF',
      pillBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
    };
  }
  if (
    s.includes('complian') ||
    s.includes('action') ||
    s.includes('return') ||
    s.includes('draft') ||
    s.includes('pend')
  ) {
    return {
      dotColor: '#D97706',
      textColor: isDarkMode ? '#FBBF24' : '#D97706',
      pillBg: isDarkMode ? '#451A03' : '#FEF3C7',
      pillBorder: isDarkMode ? '#B45309' : '#FDE68A',
    };
  }
  return {
    dotColor: '#64748B',
    textColor: isDarkMode ? '#94A3B8' : '#64748B',
    pillBg: isDarkMode ? '#1E293B' : '#F1F5F9',
    pillBorder: isDarkMode ? '#334155' : '#E2E8F0',
  };
}

export function ScholarshipHistoryScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state: 'all' | 'application' | 'renewal' | 'grant'
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'Application' | 'Renewal' | 'Grant'>('all');

  // Authoritative data states
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);

  // Withdrawal modal state
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false);
  const [withdrawTargetId, setWithdrawTargetId] = useState<number | null>(null);
  const [withdrawReason, setWithdrawReason] = useState('Applying to a different scholarship program');
  const [otherReasonText, setOtherReasonText] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);

  const allowedWithdrawStatuses = [
    'Submitted',
    'Under Review',
    'For Compliance',
    'Ready for SSC',
    'Returned',
  ];

  const handleConfirmWithdrawal = async () => {
    if (!withdrawTargetId) return;

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
      await withdrawCitizenApplication(withdrawTargetId, finalReason);
      setIsWithdrawModalVisible(false);
      setWithdrawReason('Applying to a different scholarship program');
      setOtherReasonText('');
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

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, grantOverRes, grantRelRes, trackedRes] =
        await Promise.all([
          fetchCitizenDashboard().catch((err) => {
            console.warn('[ScholarshipHistory] dashboard fetch failed:', err);
            return null;
          }),
          fetchCitizenGrantOverview().catch((err) => {
            console.warn('[ScholarshipHistory] grant overview fetch failed:', err);
            return null;
          }),
          fetchCitizenGrantReleases().catch((err) => {
            console.warn('[ScholarshipHistory] grant releases fetch failed:', err);
            return [] as CitizenGrantReleaseItem[];
          }),
          fetchCitizenTrackedItems().catch((err) => {
            console.warn('[ScholarshipHistory] tracked items fetch failed:', err);
            return [] as TrackedItem[];
          }),
        ]);

      if (!dashRes && !grantOverRes) {
        setError('Unable to load scholarship history. Please check your connection.');
      } else {
        setDashboardData(dashRes);
        setGrantOverview(grantOverRes);
        setGrantReleases(grantRelRes);
        setTrackedItems(trackedRes);
      }
    } catch (err: any) {
      console.error('[ScholarshipHistory] loadData error:', err);
      setError(err?.message || 'Unable to load scholarship history.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const currentAcademicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;

  const currentPeriodString = useMemo(() => {
    if (!currentAcademicPeriod) return '';
    const ay = currentAcademicPeriod.academic_year?.trim();
    const term = currentAcademicPeriod.term?.trim();
    if (ay && term) {
      return `AY ${ay} • ${term}`;
    }
    if (ay) {
      return `AY ${ay}`;
    }
    return '';
  }, [currentAcademicPeriod]);

  // -------------------------------------------------------------
  // SCHOLARSHIP FULL HISTORY DIRECTORY MAPPING
  // -------------------------------------------------------------
  const allHistoryRecords: HistoryRecord[] = useMemo(() => {
    const list: HistoryRecord[] = [];
    const seenCodes = new Set<string>();

    const authoritativeFallback = currentPeriodString || 'Academic Period';

    const cleanAcademicPeriod = (raw: string | undefined | null): string => {
      if (!raw) return authoritativeFallback;
      const trimmed = raw.trim();
      const hasYearDigits = /\d{4}/.test(trimmed);
      if (
        !hasYearDigits ||
        trimmed === 'AY •' ||
        trimmed === 'AY • ' ||
        trimmed === 'AY' ||
        trimmed === '•' ||
        (trimmed.startsWith('AY •') && trimmed.length <= 5)
      ) {
        return authoritativeFallback;
      }
      return trimmed;
    };

    // 1. Map tracked items
    for (const item of trackedItems) {
      const code =
        item.code ||
        item.details?.application_code ||
        item.details?.renewal_code ||
        item.id;
      if (code && seenCodes.has(code)) continue;
      if (code) seenCodes.add(code);

      let recordType: 'Application' | 'Renewal' | 'Grant' = 'Application';
      if (item.type === 'Scholarship Renewal') recordType = 'Renewal';
      else if (item.type === 'Scholarship Grant') recordType = 'Grant';

      const itemPeriod = cleanAcademicPeriod(item.details?.academic_period);
      const isCurrent: boolean =
        Boolean(currentPeriodString) &&
        Boolean(
          (item.details as any)?.is_current ||
            (currentAcademicPeriod?.academic_year &&
              itemPeriod.includes(currentAcademicPeriod.academic_year)) ||
            (code && scholar?.scholar_code && code === scholar.scholar_code) ||
            (code && application?.application_code && code === application.application_code)
        );

      const rawTime = new Date(item.updatedAt || item.createdAt).getTime();

      let programTitle = scholarship?.program_name || 'Academic Scholarship Program';
      let categorySubtitle = scholarship?.category_name || 'Educational Assistance';
      if (recordType === 'Grant') {
        programTitle = 'Scholarship Financial Assistance & Grant';
        categorySubtitle = 'Grant Disbursement Release';
      } else if (recordType === 'Renewal') {
        programTitle = scholarship?.program_name || 'Scholarship Renewal Application';
        categorySubtitle = 'Continuation & Eligibility Renewal';
      }

      let rawStatus = item.displayStatus || item.status || 'Completed';
      let recordStatus = rawStatus;
      // Canonicalize "Rejected" to "Disapproved" for scholarships
      if (rawStatus.trim().toLowerCase() === 'rejected' || rawStatus.trim().toLowerCase() === 'disapproved') {
        recordStatus = 'Disapproved';
      }
      // If this tracked item matches the current application and that application is Disapproved:
      if (
        recordType === 'Application' &&
        (isCurrent || (code && application?.application_code && code === application.application_code)) &&
        (application?.application_status === 'Disapproved' || application?.application_status?.toLowerCase() === 'rejected')
      ) {
        recordStatus = 'Disapproved';
      }

      list.push({
        id: `tracked-${item.id}`,
        rawId: item.raw_id,
        academicPeriod: itemPeriod,
        isCurrent,
        recordType,
        status: recordStatus,
        date: formatDate(item.updatedAt || item.createdAt),
        referenceCode: code || null,
        programTitle,
        categorySubtitle,
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    // 2. Map grant releases
    for (const rel of grantReleases) {
      if (rel.release_code && seenCodes.has(rel.release_code)) continue;
      if (rel.release_code) seenCodes.add(rel.release_code);

      const rawRelPeriod = rel.academic_term
        ? `AY ${rel.academic_year} • ${rel.academic_term}`
        : `AY ${rel.academic_year}`;
      const relPeriod = cleanAcademicPeriod(rawRelPeriod);

      const isCurrent =
        Boolean(currentPeriodString) &&
        rel.academic_year === currentAcademicPeriod?.academic_year &&
        rel.academic_term === currentAcademicPeriod?.term;

      const releasedDate = rel.components?.[0]?.released_at || null;
      const rawTime = releasedDate ? new Date(releasedDate).getTime() : 0;

      list.push({
        id: `release-${rel.release_code}`,
        academicPeriod: relPeriod,
        isCurrent,
        recordType: 'Grant',
        status: rel.release_status,
        date: formatDate(releasedDate),
        referenceCode: rel.release_code,
        programTitle: 'Scholarship Grant Release',
        categorySubtitle: rel.academic_term
          ? `${rel.academic_term} Disbursement`
          : 'Disbursement & Allowance Processing',
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    // 3. Map active grant application if not already captured
    if (grantOverview?.has_existing_application && grantOverview.application) {
      const gApp = grantOverview.application;
      const gCode = gApp.grant_application_code || `GRA-${gApp.grant_application_id || 'ACTIVE'}`;
      if (!seenCodes.has(gCode)) {
        seenCodes.add(gCode);
        const rawGPeriod = gApp.academic_year && gApp.academic_term
          ? `AY ${gApp.academic_year} • ${gApp.academic_term}`
          : gApp.academic_year
          ? `AY ${gApp.academic_year}`
          : currentPeriodString;
        const gPeriod = cleanAcademicPeriod(rawGPeriod);
        list.push({
          id: `grant-app-${gCode}`,
          academicPeriod: gPeriod,
          isCurrent: true,
          recordType: 'Grant',
          status: gApp.grant_status || 'Under Review',
          date: formatDate(gApp.submitted_at || gApp.created_at),
          referenceCode: gCode,
          programTitle: 'Scholarship Financial Assistance & Grant',
          categorySubtitle: 'Grant Application for Municipal Payroll',
          timestamp: gApp.submitted_at ? new Date(gApp.submitted_at).getTime() : Date.now(),
        });
      }
    }

    // 4. Fallback scholar admission record
    if (list.length === 0 && (scholar || application)) {
      const code = scholar?.scholar_code || application?.application_code || 'Unassigned';
      const dateVal = scholar?.admitted_at || application?.submitted_at || null;
      const rawTime = dateVal ? new Date(dateVal).getTime() : 0;

      list.push({
        id: 'current-scholar-record',
        academicPeriod: currentPeriodString || 'Academic Year',
        isCurrent: true,
        recordType: 'Application',
        status: scholar
          ? 'Approved'
          : application?.application_status?.toLowerCase() === 'rejected'
          ? 'Disapproved'
          : application?.application_status || 'Submitted',
        date: formatDate(dateVal),
        referenceCode: code,
        programTitle: scholarship?.program_name || 'Academic Scholarship Program',
        categorySubtitle: scholarship?.category_name || 'Educational Assistance',
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    list.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.timestamp - a.timestamp;
    });

    return list;
  }, [trackedItems, grantReleases, grantOverview, scholar, application, currentPeriodString, currentAcademicPeriod, scholarship]);

  // Filtered records
  const filteredRecords = useMemo(() => {
    if (selectedFilter === 'all') return allHistoryRecords;
    return allHistoryRecords.filter((r) => r.recordType === selectedFilter);
  }, [allHistoryRecords, selectedFilter]);



  return (
    <View
      style={[
        styles.safeArea,
        isDarkMode && { backgroundColor: '#0B132B' },
      ]}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={isDarkMode ? '#C084FC' : '#7E22CE'}
            colors={['#7E22CE']}
          />
        }
      >
        {/* Header Section */}
        <View style={styles.headerWrapper}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Back to Dashboard"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <IconSymbol
              name="chevron.left"
              size={16}
              color={isDarkMode ? '#C084FC' : '#7E22CE'}
            />
            <Text
              style={[
                styles.backBtnText,
                isDarkMode && { color: '#C084FC' },
              ]}
            >
              Back to Dashboard
            </Text>
          </TouchableOpacity>

          <View style={styles.headerTitleRow}>
            <Text
              style={[
                styles.headerTitle,
                isDarkMode && { color: '#F8FAFC' },
              ]}
            >
              SCHOLARSHIP HISTORY
            </Text>
          </View>
          <Text
            style={[
              styles.headerSubtitle,
              isDarkMode && { color: '#94A3B8' },
            ]}
          >
            Complete directory of all scholarship applications, renewals, and grant release records.
          </Text>
        </View>

        {/* Error Notice */}
        {error ? (
          <View
            style={{
              borderColor: '#EF4444',
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              backgroundColor: isDarkMode ? '#1C2541' : '#FEF2F2',
            }}
          >
            <Text
              style={{
                color: '#EF4444',
                fontSize: 14,
                fontWeight: '700',
                marginBottom: 4,
              }}
            >
              Unable to load scholarship history
            </Text>
            <Text
              style={{
                color: isDarkMode ? '#94A3B8' : '#64748B',
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={loadData}
              style={{
                alignSelf: 'flex-start',
                backgroundColor: '#7E22CE',
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 6,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                Retry
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Loading State */}
        {isLoading && !refreshing ? (
          <View style={{ gap: 14, marginTop: 10 }}>
            <Skeleton height={140} borderRadius={14} />
            <Skeleton height={140} borderRadius={14} />
            <Skeleton height={140} borderRadius={14} />
          </View>
        ) : (
          <>
            {/* Filter / Count Summary Bar */}
            <View style={styles.filterSummaryRow}>
              <View
                style={[
                  styles.recordCountPill,
                  isDarkMode && {
                    backgroundColor: '#3B0764',
                    borderColor: '#7E22CE',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.recordCountText,
                    isDarkMode && { color: '#C084FC' },
                  ]}
                >
                  {filteredRecords.length} {filteredRecords.length === 1 ? 'Record' : 'Records'}
                </Text>
              </View>

              {/* Filter Tabs */}
              <View style={styles.filterTabsContainer}>
                {(['all', 'Application', 'Grant', 'Renewal'] as const).map((tab) => {
                  const isActive = selectedFilter === tab;
                  const label = tab === 'all' ? 'All' : `${tab}s`;
                  return (
                    <TouchableOpacity
                      key={tab}
                      style={[
                        styles.filterTab,
                        isActive && styles.filterTabActive,
                        isDarkMode &&
                          !isActive && {
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                          },
                        isDarkMode &&
                          isActive && {
                            backgroundColor: '#7E22CE',
                            borderColor: '#7E22CE',
                          },
                      ]}
                      onPress={() => setSelectedFilter(tab)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel={`Filter by ${label}`}
                    >
                      <Text
                        style={[
                          styles.filterTabText,
                          isActive && styles.filterTabTextActive,
                          isDarkMode && !isActive && { color: '#94A3B8' },
                        ]}
                      >
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Records List */}
            {filteredRecords.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View
                  style={[
                    styles.emptyIconCircle,
                    isDarkMode && { backgroundColor: '#1E293B' },
                  ]}
                >
                  <IconSymbol
                    name="folder"
                    size={28}
                    color={isDarkMode ? '#C084FC' : '#7E22CE'}
                  />
                </View>
                <Text
                  style={[
                    styles.emptyTitle,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                >
                  No Records Found
                </Text>
                <Text
                  style={[
                    styles.emptyDesc,
                    isDarkMode && { color: '#94A3B8' },
                  ]}
                >
                  {selectedFilter === 'all'
                    ? 'No scholarship application or grant records are linked to your citizen account.'
                    : `No ${selectedFilter.toLowerCase()} records found in your directory.`}
                </Text>
              </View>
            ) : (
              <View style={styles.cardsList}>
                {filteredRecords.map((rec) => {
                  const colors = getStatusColors(rec.status, isDarkMode);

                  return (
                    <View
                      key={rec.id}
                      style={[
                        styles.historyCard,
                        rec.isCurrent && styles.historyCardCurrent,
                        isDarkMode && {
                          backgroundColor: '#1C2541',
                          borderColor: rec.isCurrent ? '#C084FC' : '#3A506B',
                        },
                      ]}
                    >
                      {/* Top Row: Academic Period & Tags */}
                      <View style={styles.cardTopRow}>
                        <View style={styles.cardPeriodBadge}>
                          <IconSymbol
                            name="calendar"
                            size={13}
                            color={isDarkMode ? '#C084FC' : '#7E22CE'}
                          />
                          <Text
                            style={[
                              styles.cardPeriodText,
                              isDarkMode && { color: '#C084FC' },
                            ]}
                          >
                            {rec.academicPeriod}
                          </Text>
                        </View>

                        <View style={styles.cardTagsRow}>
                          {rec.isCurrent ? (
                            <View
                              style={[
                                styles.currentPeriodTag,
                                isDarkMode && {
                                  backgroundColor: '#3B0764',
                                  borderColor: '#7E22CE',
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.currentPeriodTagText,
                                  isDarkMode && { color: '#C084FC' },
                                ]}
                              >
                                CURRENT PERIOD
                              </Text>
                            </View>
                          ) : null}

                          <View
                            style={[
                              styles.recordTypeTag,
                              rec.recordType === 'Application' &&
                                styles.recordTypeTagApplication,
                              rec.recordType === 'Grant' && styles.recordTypeTagGrant,
                              rec.recordType === 'Renewal' &&
                                styles.recordTypeTagRenewal,
                              isDarkMode &&
                                rec.recordType === 'Application' && {
                                  backgroundColor: '#3B0764',
                                  borderColor: '#7E22CE',
                                },
                              isDarkMode &&
                                rec.recordType === 'Grant' && {
                                  backgroundColor: '#0C4A6E',
                                  borderColor: '#0284C7',
                                },
                              isDarkMode &&
                                rec.recordType === 'Renewal' && {
                                  backgroundColor: '#064E3B',
                                  borderColor: '#059669',
                                },
                            ]}
                          >
                            <Text
                              style={[
                                rec.recordType === 'Application' &&
                                  styles.recordTypeTagApplicationText,
                                rec.recordType === 'Grant' &&
                                  styles.recordTypeTagGrantText,
                                rec.recordType === 'Renewal' &&
                                  styles.recordTypeTagRenewalText,
                                isDarkMode &&
                                  rec.recordType === 'Application' && {
                                    color: '#C084FC',
                                  },
                                isDarkMode &&
                                  rec.recordType === 'Grant' && {
                                    color: '#38BDF8',
                                  },
                                isDarkMode &&
                                  rec.recordType === 'Renewal' && {
                                    color: '#4ADE80',
                                  },
                              ]}
                            >
                              {rec.recordType.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Program Title & Subtitle */}
                      <Text
                        style={[
                          styles.cardTitle,
                          isDarkMode && { color: '#F8FAFC' },
                        ]}
                      >
                        {rec.programTitle}
                      </Text>
                      <Text
                        style={[
                          styles.cardSubtitle,
                          isDarkMode && { color: '#94A3B8' },
                        ]}
                      >
                        {rec.categorySubtitle}
                      </Text>

                      {/* Card Meta Box */}
                      <View
                        style={[
                          styles.cardMetaBox,
                          isDarkMode && {
                            backgroundColor: '#111827',
                            borderColor: '#1E293B',
                          },
                        ]}
                      >
                        {rec.referenceCode ? (
                          <View style={styles.cardMetaRow}>
                            <Text
                              style={[
                                styles.cardMetaLabel,
                                isDarkMode && { color: '#94A3B8' },
                              ]}
                            >
                              Reference:
                            </Text>
                            <Text
                              style={[
                                styles.cardMetaValue,
                                isDarkMode && { color: '#E2E8F0' },
                              ]}
                            >
                              {rec.referenceCode}
                            </Text>
                          </View>
                        ) : null}

                        {rec.date ? (
                          <View style={styles.cardMetaRow}>
                            <Text
                              style={[
                                styles.cardMetaLabel,
                                isDarkMode && { color: '#94A3B8' },
                              ]}
                            >
                              Recorded Date:
                            </Text>
                            <Text
                              style={[
                                styles.cardMetaValue,
                                isDarkMode && { color: '#E2E8F0' },
                              ]}
                            >
                              {rec.date}
                            </Text>
                          </View>
                        ) : null}

                        <View style={styles.cardMetaRow}>
                          <Text
                            style={[
                              styles.cardMetaLabel,
                              isDarkMode && { color: '#94A3B8' },
                            ]}
                          >
                            Status:
                          </Text>
                          <View style={styles.cardStatusRow}>
                            <View
                              style={[
                                styles.cardStatusDot,
                                { backgroundColor: colors.dotColor },
                              ]}
                            />
                            <Text
                              style={[
                                styles.cardStatusText,
                                { color: colors.textColor },
                              ]}
                            >
                              {rec.status.toUpperCase()}
                            </Text>
                          </View>
                        </View>
                      </View>

                      {/* Card Actions Row */}
                      <View
                        style={[
                          styles.cardActionsRow,
                          isDarkMode && { borderTopColor: '#293548' },
                        ]}
                      >
                        {/* Withdraw Action — only for Application type with allowed status and valid rawId */}
                        {rec.recordType === 'Application' &&
                          rec.rawId != null &&
                          allowedWithdrawStatuses.includes(rec.status) && (
                            <TouchableOpacity
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                paddingVertical: 8,
                                paddingHorizontal: 14,
                                borderRadius: 8,
                                backgroundColor: isDarkMode ? '#3B1D28' : '#FEF2F2',
                                borderWidth: 1,
                                borderColor: isDarkMode ? '#991B1B' : '#FCA5A5',
                                gap: 6,
                              }}
                              onPress={() => {
                                setWithdrawTargetId(rec.rawId!);
                                setWithdrawReason('Applying to a different scholarship program');
                                setOtherReasonText('');
                                setIsWithdrawModalVisible(true);
                              }}
                              activeOpacity={0.7}
                              accessibilityRole="button"
                              accessibilityLabel={`Withdraw application ${rec.referenceCode || rec.academicPeriod}`}
                            >
                              <IconSymbol
                                name="xmark.circle"
                                size={14}
                                color={isDarkMode ? '#F87171' : '#DC2626'}
                              />
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '700',
                                  color: isDarkMode ? '#F87171' : '#DC2626',
                                }}
                              >
                                Withdraw
                              </Text>
                            </TouchableOpacity>
                          )}

                        {/* View Details Primary Action */}
                        <TouchableOpacity
                          style={[
                            styles.cardDetailsBtn,
                            isDarkMode && { backgroundColor: '#7E22CE' },
                          ]}
                          onPress={() =>
                            router.push({
                              pathname: '/education/dashboard/details',
                              params: {
                                recordType: rec.recordType,
                                recordId: rec.referenceCode || rec.id,
                                academicPeriod: rec.academicPeriod,
                                status: rec.status,
                              },
                            } as any)
                          }
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={`View details for ${rec.academicPeriod} ${rec.recordType}`}
                        >
                          <Text style={styles.cardDetailsBtnText}>
                            View Details
                          </Text>
                          <IconSymbol
                            name="chevron.right"
                            size={12}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>

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
            style={{
              width: '100%',
              maxWidth: 440,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: '#F43F5E',
              padding: 20,
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
            }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: '800',
                color: '#E11D48',
                marginBottom: 8,
              }}
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
    </View>
  );
}
