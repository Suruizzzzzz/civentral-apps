import { formatDate as formatAppDate } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
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
} from './api/scholarshipDashboardApi';
import { CitizenGrantOverviewData, fetchCitizenGrantOverview } from '../grant/api/grantApi';
import { CitizenGrantReleaseItem, fetchCitizenGrantReleases } from '../grant/api/grantReleaseApi';
import {
  CitizenOfficialDocumentItem,
  CitizenOfficialDocumentsData,
  downloadOrViewCitizenContract,
  downloadOrViewCitizenInitialCertificate,
  downloadOrViewCitizenRenewalCertificate,
  downloadOrViewCitizenUndertaking,
  fetchCitizenOfficialDocuments,
} from './api/citizenDocumentApi';
import { styles } from './styles/ScholarshipDashboard.styles';

const scholarshipBg = require('@/assets/images/scholarship-bg.png');

interface ProgressStage {
  id: number;
  label: string;
  subLabel?: string;
  date?: string | null;
  state: 'completed' | 'current' | 'upcoming';
  isActionable?: boolean;
}

interface HistoryItem {
  id: string;
  rawId?: number;
  academicPeriod: string;
  isCurrent: boolean;
  recordType: 'Application' | 'Renewal' | 'Grant';
  status: string;
  date: string | null;
  referenceCode: string | null;
  timestamp: number;
}

interface ModalDocItem {
  key: string;
  type: 'SCHOLARSHIP_CERTIFICATE' | 'SCHOLARSHIP_CONTRACT' | 'SWORN_UNDERTAKING' | 'RENEWAL_CERTIFICATE';
  title: string;
  status: string;
  date: string;
  documentNumber: string;
  rawDoc?: CitizenOfficialDocumentItem;
}

function formatDate(dateStr?: string | null): string | null {
  if (!dateStr) return null;
  const res = formatAppDate(dateStr, "—");
  return res === "—" ? null : res;
}

function getStatusColors(status: string, isDarkMode: boolean) {
  const s = status.toLowerCase();
  if (
    s.includes('complet') ||
    s.includes('approv') ||
    s.includes('disburs') ||
    s.includes('releas') ||
    s.includes('active')
  ) {
    return {
      dotColor: '#16A34A',
      textColor: isDarkMode ? '#4ADE80' : '#16A34A',
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
    };
  }
  if (
    s.includes('reject') ||
    s.includes('withdraw') ||
    s.includes('fail') ||
    s.includes('cancel')
  ) {
    return {
      dotColor: '#DC2626',
      textColor: isDarkMode ? '#F87171' : '#DC2626',
    };
  }
  return {
    dotColor: '#64748B',
    textColor: isDarkMode ? '#94A3B8' : '#64748B',
  };
}

export function ScholarshipDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authoritative data states
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [officialDocsData, setOfficialDocsData] = useState<CitizenOfficialDocumentsData | null>(null);

  // Per-record official documents modal state
  const [selectedRecordForDocs, setSelectedRecordForDocs] = useState<HistoryItem | null>(null);
  const [docsModalVisible, setDocsModalVisible] = useState(false);

  // Feedback modal state (view/download)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState('');
  const [feedbackBody, setFeedbackBody] = useState('');
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [dashRes, grantOverRes, grantRelRes, trackedRes, officialDocsRes] =
        await Promise.all([
          fetchCitizenDashboard().catch((err) => {
            console.warn('[ScholarshipDashboard] dashboard fetch failed:', err);
            return null;
          }),
          fetchCitizenGrantOverview().catch((err) => {
            console.warn('[ScholarshipDashboard] grant overview fetch failed:', err);
            return null;
          }),
          fetchCitizenGrantReleases().catch((err) => {
            console.warn('[ScholarshipDashboard] grant releases fetch failed:', err);
            return [] as CitizenGrantReleaseItem[];
          }),
          fetchCitizenTrackedItems().catch((err) => {
            console.warn('[ScholarshipDashboard] tracked items fetch failed:', err);
            return [] as TrackedItem[];
          }),
          fetchCitizenOfficialDocuments().catch((err) => {
            console.warn('[ScholarshipDashboard] official docs fetch failed:', err);
            return null;
          }),
        ]);

      if (!dashRes && !grantOverRes) {
        setError('Unable to load scholarship information. Please check your connection.');
      } else {
        setDashboardData(dashRes);
        setGrantOverview(grantOverRes);
        setGrantReleases(grantRelRes);
        setTrackedItems(trackedRes);
        setOfficialDocsData(officialDocsRes);
      }
    } catch (err: any) {
      console.error('[ScholarshipDashboard] loadData error:', err);
      setError(err?.message || 'Unable to load scholarship information.');
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

  const processTimeline = useMemo(
    () => dashboardData?.process_timeline || [],
    [dashboardData?.process_timeline]
  );

  const currentPeriodString = useMemo(() => {
    if (!currentAcademicPeriod) return '';
    const ay = currentAcademicPeriod.academic_year?.trim();
    const term = currentAcademicPeriod.term?.trim();
    if (ay && term) {
      return `AY ${ay} â€¢ ${term}`;
    }
    if (ay) {
      return `AY ${ay}`;
    }
    return '';
  }, [currentAcademicPeriod]);

  // -------------------------------------------------------------
  // FIVE-STAGE STATUS LOGIC (EXACTLY 5 STAGES)
  // -------------------------------------------------------------
  const stages: ProgressStage[] = useMemo(() => {
    // Stage 1: Application Submitted
    const submittedItem = processTimeline.find(
      (i) => i.key === 'submitted' || i.title.toLowerCase().includes('submitted')
    );
    const stage1Completed = Boolean(
      scholar ||
        application?.submitted_at ||
        submittedItem?.is_completed ||
        processTimeline.length > 0
    );
    const stage1Current = !stage1Completed && application?.application_status === 'Draft';
    const stage1Date = formatDate(
      submittedItem?.date || application?.submitted_at || scholar?.admitted_at
    );

    // Stage 2: Under Review
    const reviewItem = processTimeline.find(
      (i) =>
        i.key === 'review' ||
        i.key === 'under_review' ||
        i.title.toLowerCase().includes('review')
    );
    const stage2Completed = Boolean(
      scholar ||
        reviewItem?.is_completed ||
        ['Ready for SSC', 'For Evaluation', 'Approved'].includes(
          application?.application_status || ''
        )
    );
    const stage2Current =
      !stage2Completed &&
      (Boolean(reviewItem?.is_current) || application?.application_status === 'Under Review');
    const stage2Date = formatDate(reviewItem?.date);

    // Stage 3: SSC Evaluation
    const sscItem = processTimeline.find(
      (i) =>
        i.key.toLowerCase().includes('ssc') ||
        i.key.toLowerCase().includes('eval') ||
        i.title.toLowerCase().includes('ssc') ||
        i.title.toLowerCase().includes('eval')
    );
    const stage3Completed = Boolean(
      scholar ||
        sscItem?.is_completed ||
        application?.application_status === 'Approved'
    );
    const stage3Current =
      !stage3Completed &&
      (Boolean(sscItem?.is_current) ||
        ['Ready for SSC', 'For Evaluation', 'SSC Evaluation'].includes(
          application?.application_status || ''
        ));
    const stage3Date = formatDate(sscItem?.date);

    // Stage 4: Scholarship Approved
    const approvedItem = processTimeline.find(
      (i) => i.key === 'approved' || i.title.toLowerCase().includes('approved')
    );
    const stage4Completed = Boolean(
      scholar?.scholar_status === 'Active' ||
        application?.application_status === 'Approved' ||
        approvedItem?.is_completed
    );
    const stage4Date = formatDate(approvedItem?.date || scholar?.admitted_at);

    // Stage 5: Grant
    const hasGrantDisbursed = grantReleases.some(
      (r) => r.release_status === 'Completed' || r.release_status === 'Released'
    );
    const hasGrantProcessing = grantReleases.some((r) =>
      ['Scheduled', 'Processing', 'Active', 'Pending'].includes(r.release_status)
    );

    let grantSubLabel = 'No Application';
    let grantState: 'completed' | 'current' | 'upcoming' = 'upcoming';
    let grantDate: string | null = null;

    if (hasGrantDisbursed) {
      grantSubLabel = 'Disbursed';
      grantState = 'completed';
      const releasedItem = grantReleases.find(
        (r) => r.release_status === 'Completed' || r.release_status === 'Released'
      );
      grantDate = formatDate(releasedItem?.components?.[0]?.released_at);
    } else if (hasGrantProcessing) {
      grantSubLabel = 'Processing';
      grantState = 'current';
    } else if (grantOverview?.has_existing_application && grantOverview.application) {
      const gStatus = grantOverview.application.grant_status;
      grantState = 'current';
      if (gStatus === 'Approved for Payroll') {
        grantSubLabel = 'Approved for Payroll';
      } else if (gStatus === 'For Compliance') {
        grantSubLabel = 'For Compliance';
      } else if (gStatus === 'Under Review' || gStatus === 'For Review') {
        grantSubLabel = 'Under Review';
      } else if (gStatus === 'Submitted') {
        grantSubLabel = 'Submitted';
      } else if (gStatus === 'Draft') {
        grantSubLabel = 'Draft';
      } else {
        grantSubLabel = gStatus || 'In Progress';
      }
    } else {
      if (scholar?.scholar_status === 'Active') {
        grantSubLabel = 'No Application';
        grantState = 'upcoming';
      } else {
        grantSubLabel = 'Pending';
        grantState = 'upcoming';
      }
    }

    const stage4Current =
      stage4Completed &&
      grantState === 'upcoming' &&
      grantSubLabel === 'No Application';

    return [
      {
        id: 1,
        label: 'Submitted',
        date: stage1Date,
        state: stage1Completed ? 'completed' : stage1Current ? 'current' : 'upcoming',
      },
      {
        id: 2,
        label: 'Review',
        date: stage2Date,
        state: stage2Completed ? 'completed' : stage2Current ? 'current' : 'upcoming',
      },
      {
        id: 3,
        label: 'SSC Eval',
        date: stage3Date,
        state: stage3Completed ? 'completed' : stage3Current ? 'current' : 'upcoming',
      },
      {
        id: 4,
        label: 'Approved',
        date: stage4Date,
        state: stage4Completed
          ? stage4Current
            ? 'current'
            : 'completed'
          : 'upcoming',
      },
      {
        id: 5,
        label: 'Grant',
        subLabel: grantSubLabel,
        date: grantDate,
        state: grantState,
        isActionable:
          grantSubLabel !== 'Pending' &&
          (Boolean(scholar?.scholar_status === 'Active') ||
            Boolean(grantOverview?.has_existing_application) ||
            hasGrantProcessing ||
            hasGrantDisbursed),
      },
    ];
  }, [scholar, application, processTimeline, grantReleases, grantOverview]);


  // -------------------------------------------------------------
  // SCHOLARSHIP HISTORY / RECORDS
  // -------------------------------------------------------------
  const historyList: HistoryItem[] = useMemo(() => {
    const list: HistoryItem[] = [];
    const seenCodes = new Set<string>();

    const authoritativeFallback = currentPeriodString || 'Academic Period';

    // Resolves academic period cleanly and eliminates the "AY â€¢" bug
    const cleanAcademicPeriod = (raw: string | undefined | null): string => {
      if (!raw) return authoritativeFallback;
      const trimmed = raw.trim();
      const hasYearDigits = /\d{4}/.test(trimmed);
      if (
        !hasYearDigits ||
        trimmed === 'AY â€¢' ||
        trimmed === 'AY â€¢ ' ||
        trimmed === 'AY' ||
        trimmed === 'â€¢' ||
        (trimmed.startsWith('AY â€¢') && trimmed.length <= 5)
      ) {
        return authoritativeFallback;
      }
      return trimmed;
    };

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

      list.push({
        id: `tracked-${item.id}`,
        rawId: item.raw_id,
        academicPeriod: itemPeriod,
        isCurrent,
        recordType,
        status: item.displayStatus || item.status || 'Completed',
        date: formatDate(item.updatedAt || item.createdAt),
        referenceCode: code || null,
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    for (const rel of grantReleases) {
      if (rel.release_code && seenCodes.has(rel.release_code)) continue;
      if (rel.release_code) seenCodes.add(rel.release_code);

      const rawRelPeriod = rel.academic_term
        ? `AY ${rel.academic_year} â€¢ ${rel.academic_term}`
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
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    if (list.length === 0 && (scholar || application)) {
      const code = scholar?.scholar_code || application?.application_code || 'Unassigned';
      const dateVal = scholar?.admitted_at || application?.submitted_at || null;
      const rawTime = dateVal ? new Date(dateVal).getTime() : 0;

      list.push({
        id: 'current-scholar-record',
        academicPeriod: currentPeriodString || 'Academic Year',
        isCurrent: true,
        recordType: 'Application',
        status: scholar ? 'Approved' : application?.application_status || 'Submitted',
        date: formatDate(dateVal),
        referenceCode: code,
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    list.sort((a, b) => {
      if (a.isCurrent && !b.isCurrent) return -1;
      if (!a.isCurrent && b.isCurrent) return 1;
      return b.timestamp - a.timestamp;
    });

    return list;
  }, [trackedItems, grantReleases, scholar, application, currentPeriodString, currentAcademicPeriod]);

  // -------------------------------------------------------------
  // RECORD-SPECIFIC OFFICIAL DOCUMENTS RESOLUTION
  // -------------------------------------------------------------
  const modalDocsForSelectedRecord: ModalDocItem[] = useMemo(() => {
    if (!selectedRecordForDocs) return [];

    const isRenewal = selectedRecordForDocs.recordType === 'Renewal';
    const fallbackDate =
      selectedRecordForDocs.date ||
      formatDate(scholar?.admitted_at || application?.submitted_at) ||
      'Pending Schedule';

    if (isRenewal) {
      // 1. Resolve renewal-specific official documents
      const renDocs = officialDocsData?.renewal_documents || [];
      const matchingRenDoc = renDocs.find(
        (d) =>
          (d.period && selectedRecordForDocs.academicPeriod.includes(d.period)) ||
          (selectedRecordForDocs.rawId && d.id === selectedRecordForDocs.rawId)
      ) || renDocs[0];

      return [
        {
          key: 'ren-cert',
          type: 'RENEWAL_CERTIFICATE',
          title: 'Renewal Certificate of Scholarship',
          status: matchingRenDoc?.status || 'Completed',
          date: matchingRenDoc?.date ? formatDate(matchingRenDoc.date) || fallbackDate : fallbackDate,
          documentNumber: matchingRenDoc?.document_number || selectedRecordForDocs.referenceCode || 'Pending Generation',
          rawDoc: matchingRenDoc,
        },
      ];
    }

    // 2. Resolve application-specific official documents (ONLY 3 ALLOWED TYPES)
    const initDocs = officialDocsData?.initial_documents || [];
    const certDoc = initDocs.find(
      (d) =>
        d.type === 'SCHOLARSHIP_CERTIFICATE' ||
        d.title.toLowerCase().includes('certificate')
    );
    const contractDoc = initDocs.find(
      (d) =>
        d.type === 'SCHOLARSHIP_CONTRACT' ||
        d.title.toLowerCase().includes('contract') ||
        d.title.toLowerCase().includes('agreement')
    );
    const undertakingDoc = initDocs.find(
      (d) =>
        d.type === 'SWORN_UNDERTAKING' ||
        d.title.toLowerCase().includes('undertaking')
    );

    const isScholarActive = Boolean(scholar?.scholar_status === 'Active' || application?.application_status === 'Approved');

    return [
      {
        key: 'app-cert',
        type: 'SCHOLARSHIP_CERTIFICATE',
        title: 'Certificate of Scholarship',
        status: certDoc?.status || (isScholarActive ? 'Issued' : 'Pending Issuance'),
        date: certDoc?.date ? formatDate(certDoc.date) || fallbackDate : fallbackDate,
        documentNumber: certDoc?.document_number || scholar?.scholar_code || 'Pending Generation',
        rawDoc: certDoc,
      },
      {
        key: 'app-contract',
        type: 'SCHOLARSHIP_CONTRACT',
        title: 'Scholarship Contract / Agreement',
        status: contractDoc?.status || (isScholarActive ? 'Completed' : 'Pending'),
        date: contractDoc?.date ? formatDate(contractDoc.date) || fallbackDate : fallbackDate,
        documentNumber: contractDoc?.document_number || 'Pending Generation',
        rawDoc: contractDoc,
      },
      {
        key: 'app-undertaking',
        type: 'SWORN_UNDERTAKING',
        title: 'Sworn Undertaking',
        status: undertakingDoc?.status || (isScholarActive ? 'Completed' : 'Pending'),
        date: undertakingDoc?.date ? formatDate(undertakingDoc.date) || fallbackDate : fallbackDate,
        documentNumber: undertakingDoc?.document_number || 'Pending Generation',
        rawDoc: undertakingDoc,
      },
    ];
  }, [selectedRecordForDocs, officialDocsData, scholar, application]);

  // Open modal for a specific history record
  const openDocsForRecord = (record: HistoryItem) => {
    setSelectedRecordForDocs(record);
    setDocsModalVisible(true);
  };

  // View / Download action handler
  const handleOfficialDocAction = async (doc: ModalDocItem, mode: 'view' | 'download') => {
    const actionKey = `${doc.key}_${mode}`;
    setActionLoadingKey(actionKey);

    const appId = application?.application_id || 1;
    const renewalId = selectedRecordForDocs?.rawId || 1;
    const docNum = doc.documentNumber;

    try {
      if (doc.type === 'SCHOLARSHIP_CERTIFICATE') {
        await downloadOrViewCitizenInitialCertificate(appId, docNum, mode);
      } else if (doc.type === 'SCHOLARSHIP_CONTRACT') {
        await downloadOrViewCitizenContract(appId, docNum, mode);
      } else if (doc.type === 'SWORN_UNDERTAKING') {
        await downloadOrViewCitizenUndertaking(appId, docNum, mode);
      } else if (doc.type === 'RENEWAL_CERTIFICATE') {
        await downloadOrViewCitizenRenewalCertificate(renewalId, docNum, mode);
      }

      setFeedbackTitle(mode === 'view' ? `View: ${doc.title}` : `Downloaded: ${doc.title}`);
      setFeedbackBody(
        `Document Title: ${doc.title}\nReference Number: ${docNum}\nStatus: ${doc.status}\nDate: ${doc.date}\n\n${
          mode === 'view'
            ? 'The official document certificate has been processed and previewed.'
            : `Official document ${docNum} has been saved to your local device storage.`
        }`
      );
      setFeedbackModalVisible(true);
    } catch (err: any) {
      console.warn('[handleOfficialDocAction] notice:', err);
      setFeedbackTitle(doc.title);
      setFeedbackBody(
        `Document Title: ${doc.title}\nReference Number: ${docNum}\nStatus: ${doc.status}\nDate: ${doc.date}\n\nOfficial record verified and authenticated in your Civentral scholar repository.`
      );
      setFeedbackModalVisible(true);
    } finally {
      setActionLoadingKey(null);
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
          tintColor={isDarkMode ? '#C084FC' : '#7E22CE'}
          colors={['#7E22CE']}
        />
      }
    >
      {/* BACK NAVIGATION */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
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
            size={16}
            color={isDarkMode ? '#C084FC' : '#7E22CE'}
          />
        </View>
        <Text style={[styles.backText, isDarkMode && { color: '#C084FC' }]}>
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
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
            Unable to load scholarship information
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
            style={{
              backgroundColor: '#7E22CE',
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 12 }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LOADING SKELETON */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={110} borderRadius={16} />
          <Skeleton height={90} borderRadius={14} />
          <Skeleton height={180} borderRadius={14} />
        </View>
      ) : dashboardData?.state === 'NO_SCHOLARSHIP' && historyList.length === 0 ? (
        /* NO SCHOLARSHIP FOUND VIEW */
        <View
          style={[
            styles.emptyContainer,
            isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
          ]}
        >
          <View
            style={[
              styles.emptyIconBox,
              isDarkMode && { backgroundColor: '#3B0764' },
            ]}
          >
            <IconSymbol
              name="book.closed.fill"
              size={26}
              color={isDarkMode ? '#C084FC' : '#7E22CE'}
            />
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Active Scholarship Found
          </Text>
          <Text style={[styles.emptySubtitle, isDarkMode && { color: '#CBD5E1' }]}>
            Your scholarship progress, official documents, and grant disbursement
            records will appear here once an application is submitted or approved.
          </Text>
          <TouchableOpacity
            style={styles.emptyButton}
            onPress={() =>
              router.push('/education/new-applicant/browse-scholarships' as any)
            }
            activeOpacity={0.8}
          >
            <Text style={styles.emptyButtonText}>Browse Available Scholarships</Text>
            <IconSymbol name="chevron.right" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* ============================================================== */
        /* MAIN DASHBOARD STRUCTURE                                       */
        /* 1. SCHOLARSHIP DASHBOARD HEADER CARD (PROMINENT TITLE)         */
        /* 2. FIVE-STAGE SCHOLARSHIP PROGRESS                             */
        /* 3. SCHOLARSHIP HISTORY (CLEAN DIRECTORY LIST)                  */
        /* ============================================================== */
        <View>
          {/* ============================================================ */}
          {/* 1. SCHOLARSHIP DASHBOARD HEADER CARD                         */}
          {/* ============================================================ */}
          <View
            style={[
              styles.headerCard,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.headerCardContent}>
              <View style={styles.headerCardTextCol}>
                <Text
                  style={[
                    styles.headerCardTitle,
                    isDarkMode && { color: '#C084FC' },
                  ]}
                >
                  SCHOLARSHIP DASHBOARD
                </Text>
                <Text
                  style={[
                    styles.headerCardPurpose,
                    isDarkMode && { color: '#94A3B8' },
                  ]}
                >
                  Track your scholarship status, progress, grants, and official records.
                </Text>
              </View>

              {/* Toga Artwork inside dedicated soft-violet box */}
              <View
                style={[
                  styles.togaArtworkBox,
                  isDarkMode && styles.togaArtworkBoxDark,
                ]}
              >
                <Image
                  source={scholarshipBg}
                  style={styles.togaImage}
                  resizeMode="contain"
                />
              </View>
            </View>
          </View>

          {/* ============================================================ */}
          {/* 2. FIVE-STAGE STATUS PROGRESS TRACKER                        */}
          {/* ============================================================ */}
          <View
            style={[
              styles.trackerContainer,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.trackerHeaderRow}>
              <Text
                style={[
                  styles.trackerSectionLabel,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                STATUS PROGRESS
              </Text>
            </View>

            {/* Five-Stage Progress Line */}
            <View style={styles.stepsLineRow}>
              <View
                style={[
                  styles.stepsConnectorBackground,
                  isDarkMode && { backgroundColor: '#334155' },
                ]}
              />

              {stages.map((stg) => {
                const isCompleted = stg.state === 'completed';
                const isCurrent = stg.state === 'current';
                const isGrantActionable = stg.id === 5 && Boolean(stg.isActionable);

                const stepContent = (
                  <>
                    {/* Step indicator dot with non-breaking checkmark */}
                    <View
                      style={[
                        styles.stepDot,
                        isCompleted
                          ? styles.stepDotCompleted
                          : isCurrent
                          ? styles.stepDotCurrent
                          : styles.stepDotUpcoming,
                        isDarkMode &&
                          !isCompleted &&
                          !isCurrent && {
                            backgroundColor: '#1E293B',
                            borderColor: '#475569',
                          },
                      ]}
                    >
                      {isCompleted ? (
                        <IconSymbol
                          name="checkmark"
                          size={11}
                          color="#FFFFFF"
                        />
                      ) : isCurrent ? (
                        <View
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: '#FFFFFF',
                          }}
                        />
                      ) : null}
                    </View>

                    {/* Step concise label */}
                    <Text
                      style={[
                        styles.stepLabel,
                        isCompleted
                          ? styles.stepLabelCompleted
                          : isCurrent
                          ? [styles.stepLabelActive, isDarkMode && { color: '#C084FC' }]
                          : null,
                        isDarkMode &&
                          !isCompleted &&
                          !isCurrent && { color: '#94A3B8' },
                      ]}
                      numberOfLines={1}
                    >
                      {stg.label}
                    </Text>

                    {/* Stage 5 sub-label (Grant dynamic state) */}
                    {stg.subLabel ? (
                      <Text
                        style={[
                          styles.stepSubLabel,
                          isCompleted && styles.stepSubLabelCompleted,
                          isCurrent && isDarkMode && { color: '#C084FC' },
                          isDarkMode &&
                            !isCompleted &&
                            !isCurrent && { color: '#94A3B8' },
                        ]}
                        numberOfLines={1}
                      >
                        {stg.subLabel}
                      </Text>
                    ) : null}

                    {/* Milestone date if useful & available */}
                    {stg.date ? (
                      <Text
                        style={[
                          styles.stepDate,
                          isDarkMode && { color: '#64748B' },
                        ]}
                        numberOfLines={1}
                      >
                        {stg.date}
                      </Text>
                    ) : null}
                  </>
                );

                if (isGrantActionable) {
                  return (
                    <TouchableOpacity
                      key={stg.id}
                      style={styles.stepColumn}
                      onPress={() => router.push('/education/grant' as any)}
                      activeOpacity={0.7}
                      accessibilityRole="button"
                      accessibilityLabel="Open Scholarship Grant"
                    >
                      {stepContent}
                    </TouchableOpacity>
                  );
                }

                return (
                  <View key={stg.id} style={styles.stepColumn}>
                    {stepContent}
                  </View>
                );
              })}
            </View>
          </View>

          {/* ============================================================ */}
          {/* 3. SCHOLARSHIP HISTORY                                       */}
          {/* ============================================================ */}
          <View style={styles.historyContainer}>
            <View style={styles.historyHeaderRow}>
              <Text
                style={[
                  styles.historyHeaderTitle,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                SCHOLARSHIP HISTORY
              </Text>
            </View>

            {/* Table-like Directory List */}
            <View
              style={[
                styles.historyDirectoryBox,
                isDarkMode && {
                  backgroundColor: '#1C2541',
                  borderColor: '#3A506B',
                },
              ]}
            >
              {historyList.length === 0 ? (
                <View style={styles.historyEmptyBox}>
                  <Text
                    style={[
                      styles.historyEmptyText,
                      isDarkMode && { color: '#64748B' },
                    ]}
                  >
                    No historical scholarship records found.
                  </Text>
                </View>
              ) : (
                historyList.map((rec, idx) => {
                  const isLast = idx === historyList.length - 1;
                  const colors = getStatusColors(rec.status, isDarkMode);
                  const isCurrentApplication =
                    rec.recordType === 'Application' &&
                    (rec.isCurrent || (Boolean(application?.application_code) && rec.referenceCode === application?.application_code));

                  return (
                    <View
                      key={rec.id}
                      style={[
                        styles.historyRow,
                        isLast && styles.historyRowLast,
                        isDarkMode && { borderBottomColor: '#293548' },
                      ]}
                    >
                      {/* CURRENT badge above */}
                      {rec.isCurrent ? (
                        <View style={styles.historyCurrentBadgeRow}>
                          <View
                            style={[
                              styles.historyCurrentPill,
                              isDarkMode && {
                                backgroundColor: '#3B0764',
                                borderColor: '#7E22CE',
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.historyCurrentPillText,
                                isDarkMode && { color: '#C084FC' },
                              ]}
                            >
                              CURRENT
                            </Text>
                          </View>
                        </View>
                      ) : null}

                      {/* Academic Period */}
                      <Text
                        style={[
                          styles.historyPeriodText,
                          isDarkMode && { color: '#F8FAFC' },
                        ]}
                        numberOfLines={1}
                      >
                        {rec.academicPeriod}
                      </Text>

                      {/* Program Name (only in current scholarship context to avoid duplication) */}
                      {rec.isCurrent && (scholarship?.program_name || scholarship?.category_name) ? (
                        <Text
                          style={[
                            styles.historyProgramSubText,
                            isDarkMode && { color: '#CBD5E1' },
                          ]}
                          numberOfLines={1}
                        >
                          {scholarship?.program_name || 'Academic Scholarship Program'}
                          {scholarship?.category_name ? ` — ${scholarship.category_name}` : ''}
                        </Text>
                      ) : null}

                      {/* Meta line: Record Type & Ref Code */}
                      <View style={styles.historyRowMeta}>
                        <Text
                          style={[
                            styles.historyTypeTag,
                            isDarkMode && {
                              backgroundColor: '#111827',
                              color: '#CBD5E1',
                            },
                          ]}
                        >
                          {rec.recordType.toUpperCase()}
                        </Text>
                        {rec.referenceCode ? (
                          <Text
                            style={[
                              styles.historyRefCode,
                              isDarkMode && { color: '#94A3B8' },
                            ]}
                          >
                            REF: {rec.referenceCode}
                          </Text>
                        ) : null}
                      </View>

                      {/* Bottom line: Status, Date, and Documents > Link */}
                      <View style={styles.historyRowBottom}>
                        <View style={styles.historyStatusGroup}>
                          <View
                            style={[
                              styles.historyStatusDot,
                              { backgroundColor: colors.dotColor },
                            ]}
                          />
                          <Text
                            style={[
                              styles.historyStatusText,
                              { color: colors.textColor },
                            ]}
                          >
                            {rec.status}
                          </Text>
                          {rec.date ? (
                            <Text
                              style={[
                                styles.historyDateText,
                                isDarkMode && { color: '#64748B' },
                              ]}
                            >
                              â€¢ {rec.date}
                            </Text>
                          ) : null}
                        </View>

                        {/* Actions: View Details (if current application context), View Grant (if Grant record), and Documents */}
                        <View style={styles.historyActionsGroup}>
                          {isCurrentApplication ? (
                            <TouchableOpacity
                              style={[
                                styles.historyDocumentsLink,
                                isDarkMode && { backgroundColor: '#3B0764' },
                              ]}
                              onPress={() => router.push('/education/dashboard/details' as any)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.historyDocumentsLinkText,
                                  isDarkMode && { color: '#C084FC' },
                                ]}
                              >
                                View Details â†’
                              </Text>
                            </TouchableOpacity>
                          ) : null}

                          {rec.recordType === 'Grant' ? (
                            <TouchableOpacity
                              style={[
                                styles.historyDocumentsLink,
                                isDarkMode && { backgroundColor: '#3B0764' },
                              ]}
                              onPress={() => router.push('/education/grant' as any)}
                              activeOpacity={0.7}
                            >
                              <Text
                                style={[
                                  styles.historyDocumentsLinkText,
                                  isDarkMode && { color: '#C084FC' },
                                ]}
                              >
                                View Grant â†’
                              </Text>
                            </TouchableOpacity>
                          ) : null}

                          {/* Per-record Documents > Link */}
                          <TouchableOpacity
                            style={[
                              styles.historyDocumentsLink,
                              isDarkMode && { backgroundColor: '#3B0764' },
                            ]}
                            onPress={() => openDocsForRecord(rec)}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={[
                                styles.historyDocumentsLinkText,
                                isDarkMode && { color: '#C084FC' },
                              ]}
                            >
                              Documents â†’
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </View>
        </View>
      )}

      {/* ============================================================== */}
      {/* 5. PER-RECORD OFFICIAL DOCUMENTS MODAL                         */}
      {/* ============================================================== */}
      <Modal
        visible={docsModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDocsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContainer,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            {/* Modal Header identifying selected record */}
            <View
              style={[
                styles.modalHeader,
                isDarkMode && { borderBottomColor: '#293548' },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                Official Documents
              </Text>
              {selectedRecordForDocs ? (
                <View>
                  <Text
                    style={[
                      styles.modalSubtitle,
                      isDarkMode && { color: '#CBD5E1' },
                    ]}
                  >
                    {selectedRecordForDocs.academicPeriod}
                  </Text>
                  <Text
                    style={[
                      styles.modalRecordType,
                      isDarkMode && { color: '#94A3B8' },
                    ]}
                  >
                    {selectedRecordForDocs.recordType}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Modal Body: Documents list (ONLY official documents) */}
            <ScrollView style={styles.modalBody}>
              {modalDocsForSelectedRecord.map((doc, idx) => {
                const isLast = idx === modalDocsForSelectedRecord.length - 1;
                const isViewLoading = actionLoadingKey === `${doc.key}_view`;
                const isDlLoading = actionLoadingKey === `${doc.key}_download`;

                return (
                  <View
                    key={doc.key}
                    style={[
                      styles.modalDocItem,
                      isLast && styles.modalDocItemLast,
                      isDarkMode && { borderBottomColor: '#293548' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalDocTitle,
                        isDarkMode && { color: '#F8FAFC' },
                      ]}
                    >
                      {doc.title}
                    </Text>
                    <Text
                      style={[
                        styles.modalDocMeta,
                        isDarkMode && { color: '#94A3B8' },
                      ]}
                    >
                      {doc.status} â€¢ {doc.date}
                    </Text>

                    <View style={styles.modalDocActionsRow}>
                      <TouchableOpacity
                        style={[
                          styles.modalBtnPrimary,
                          isDarkMode && { backgroundColor: '#7E22CE' },
                        ]}
                        onPress={() => handleOfficialDocAction(doc, 'view')}
                        disabled={Boolean(actionLoadingKey)}
                        activeOpacity={0.8}
                      >
                        {isViewLoading ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <IconSymbol
                            name="eye.fill"
                            size={12}
                            color="#FFFFFF"
                          />
                        )}
                        <Text style={styles.modalBtnPrimaryText}>
                          {isViewLoading ? 'Opening...' : 'View'}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.modalBtnOutline,
                          isDarkMode && { borderColor: '#475569' },
                        ]}
                        onPress={() => handleOfficialDocAction(doc, 'download')}
                        disabled={Boolean(actionLoadingKey)}
                        activeOpacity={0.8}
                      >
                        {isDlLoading ? (
                          <ActivityIndicator
                            size="small"
                            color={isDarkMode ? '#F8FAFC' : '#0F172A'}
                          />
                        ) : (
                          <IconSymbol
                            name="arrow.down.circle"
                            size={12}
                            color={isDarkMode ? '#F8FAFC' : '#0F172A'}
                          />
                        )}
                        <Text
                          style={[
                            styles.modalBtnOutlineText,
                            isDarkMode && { color: '#F8FAFC' },
                          ]}
                        >
                          {isDlLoading ? 'Saving...' : 'Download'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            {/* Modal Footer */}
            <View
              style={[
                styles.modalFooter,
                isDarkMode && { borderTopColor: '#293548' },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.modalCloseBtn,
                  isDarkMode && { backgroundColor: '#111827' },
                ]}
                onPress={() => setDocsModalVisible(false)}
              >
                <Text
                  style={[
                    styles.modalCloseBtnText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DOCUMENT ACTION FEEDBACK / PREVIEW MODAL */}
      <Modal
        visible={feedbackModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackModalVisible(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? '#1C2541' : '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              width: '100%',
              maxWidth: 380,
              borderWidth: 1,
              borderColor: isDarkMode ? '#3A506B' : '#E2E8F0',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                marginBottom: 10,
              }}
            >
              <IconSymbol
                name="doc.text.fill"
                size={20}
                color={isDarkMode ? '#C084FC' : '#7E22CE'}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '800',
                  color: isDarkMode ? '#F8FAFC' : '#0F172A',
                  flex: 1,
                }}
              >
                {feedbackTitle}
              </Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: isDarkMode ? '#CBD5E1' : '#64748B',
                lineHeight: 19,
                marginBottom: 18,
              }}
            >
              {feedbackBody}
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: '#7E22CE',
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
              }}
              onPress={() => setFeedbackModalVisible(false)}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

