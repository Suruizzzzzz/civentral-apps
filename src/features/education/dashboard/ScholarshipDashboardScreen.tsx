import { formatDate as formatAppDate } from '@/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { InAppDocumentViewerModal } from '@/src/components/document-viewer/InAppDocumentViewerModal';
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

const dashHeaderLight = require('@/assets/images/dash-header-light.png');
const dashHeaderDark = require('@/assets/images/dash-header-dark.png');

interface ProgressStage {
  id: number;
  label: string;
  title: string;
  description: string;
  subLabel?: string;
  date?: string | null;
  state: 'completed' | 'current' | 'upcoming';
  isActionable?: boolean;
  evaluatorName?: string | null;
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
    s.includes('disapprov') ||
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
  return {
    dotColor: '#64748B',
    textColor: isDarkMode ? '#94A3B8' : '#64748B',
  };
}

export function ScholarshipDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const headerAspectRatio = isDarkMode ? 1872 / 497 : 1868 / 483;

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
  const [selectedRecordForDocs] = useState<HistoryItem | null>(null);
  const [docsModalVisible, setDocsModalVisible] = useState(false);

  // Full progress modal state
  const [progressModalVisible, setProgressModalVisible] = useState(false);

  // Feedback modal state (view/download)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  // In-App Document Viewer state
  const [viewerModalVisible, setViewerModalVisible] = useState(false);
  const [viewerLocalUri, setViewerLocalUri] = useState<string | null>(null);
  const [viewerFilename, setViewerFilename] = useState('');
  const [viewerMimeType, setViewerMimeType] = useState('application/pdf');
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerRefNumber, setViewerRefNumber] = useState('');
  const [viewerStatus, setViewerStatus] = useState('');
  const [viewerDate, setViewerDate] = useState('');
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
      return `AY ${ay} • ${term}`;
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
    const reviewEvaluatorName =
      (reviewItem as any)?.evaluator_name ||
      (reviewItem as any)?.coordinator_name ||
      (application as any)?.coordinator_name ||
      (application as any)?.evaluator_name ||
      null;

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
    const sscEvaluatorName =
      (sscItem as any)?.evaluator_name ||
      (sscItem as any)?.coordinator_name ||
      (application as any)?.evaluator_name ||
      (application as any)?.coordinator_name ||
      application?.decided_by?.full_name ||
      (dashboardData as any)?.evaluator_name ||
      null;

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
    let grantDesc = 'Educational financial assistance and stipend release processing.';

    if (hasGrantDisbursed) {
      grantSubLabel = 'Disbursed';
      grantState = 'completed';
      grantDesc = 'Scholarship grant successfully disbursed to scholar account.';
      const releasedItem = grantReleases.find(
        (r) => r.release_status === 'Completed' || r.release_status === 'Released'
      );
      grantDate = formatDate(releasedItem?.components?.[0]?.released_at);
    } else if (hasGrantProcessing) {
      grantSubLabel = 'Processing';
      grantState = 'current';
      grantDesc = 'Grant disbursement release is currently being scheduled and processed.';
    } else if (grantOverview?.has_existing_application && grantOverview.application) {
      const gStatus = grantOverview.application.grant_status;
      grantState = 'current';
      if (gStatus === 'Approved for Payroll') {
        grantSubLabel = 'Approved for Payroll';
        grantDesc = 'Grant application validated and approved for municipal payroll processing.';
      } else if (gStatus === 'For Compliance') {
        grantSubLabel = 'For Compliance';
        grantDesc = 'Additional documentation required for grant compliance verification.';
      } else if (gStatus === 'Under Review' || gStatus === 'For Review') {
        grantSubLabel = 'Under Review';
        grantDesc = 'Grant verification in progress by scholarship administrator.';
      } else if (gStatus === 'Submitted') {
        grantSubLabel = 'Submitted';
        grantDesc = 'Grant application submitted and awaiting initial review.';
      } else if (gStatus === 'Draft') {
        grantSubLabel = 'Draft';
        grantDesc = 'Grant application drafted and awaiting final submission.';
      } else {
        grantSubLabel = gStatus || 'In Progress';
        grantDesc = `Grant status: ${gStatus}.`;
      }
    } else {
      if (scholar?.scholar_status === 'Active') {
        grantSubLabel = 'No Application';
        grantState = 'upcoming';
        grantDesc = 'Grant application not yet submitted for this period.';
      } else {
        grantSubLabel = 'Pending';
        grantState = 'upcoming';
        grantDesc = 'Grant processing unlocks upon official scholarship admission.';
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
        title: 'Application Submitted',
        description: 'Initial scholarship application and credentials submitted.',
        date: stage1Date,
        state: stage1Completed ? 'completed' : stage1Current ? 'current' : 'upcoming',
      },
      {
        id: 2,
        label: 'Review',
        title: 'Document & Secretariat Review',
        description: 'Secretariat verification of applicant credentials and eligibility.',
        date: stage2Date,
        state: stage2Completed ? 'completed' : stage2Current ? 'current' : 'upcoming',
        evaluatorName: reviewEvaluatorName,
      },
      {
        id: 3,
        label: 'SSC Eval',
        title: 'SSC Evaluation',
        description: 'Scholarship Selection Committee review and continuation evaluation.',
        date: stage3Date,
        state: stage3Completed ? 'completed' : stage3Current ? 'current' : 'upcoming',
        evaluatorName: sscEvaluatorName,
      },
      {
        id: 4,
        label: 'Approved',
        title: 'Scholarship Approved',
        description: 'Official municipal scholarship approval and scholar admission.',
        date: stage4Date,
        state: stage4Completed
          ? stage4Current
            ? 'current'
            : 'completed'
          : 'upcoming',
        evaluatorName: sscEvaluatorName || reviewEvaluatorName,
      },
      {
        id: 5,
        label: 'Grant',
        title: 'Scholarship Grant',
        description: grantDesc,
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

  // Withdrawal detection
  const isWithdrawn = Boolean(application?.application_status === 'Withdrawn');
  const withdrawalDate = formatDate(application?.submitted_at) || 'Recorded';
  const withdrawalReason = 'Citizen voluntarily withdrew application before committee evaluation.';

  // Disapproval detection
  const isDisapproved = Boolean(application?.application_status === 'Disapproved');
  const disapprovalDate = formatDate(application?.decided_at || dashboardData?.latest_update?.timestamp || application?.submitted_at) || 'Recorded';
  const disapprovalCategory = application?.disapproval_category || 'Criteria Not Met';
  const disapprovalRemarks = application?.decision_remarks || 'This application is no longer under active review.';

  // Current active stage index for compact stepper
  const currentStageIndex = useMemo(() => {
    const idx = stages.findIndex((s) => s.state === 'current');
    if (idx !== -1) return idx;
    if (stages.every((s) => s.state === 'completed')) return stages.length - 1;
    const completedCount = stages.filter((s) => s.state === 'completed').length;
    return Math.max(0, completedCount - 1);
  }, [stages]);

  // Current status summary info for cards
  const currentStatusInfo = useMemo(() => {
    if (isWithdrawn) {
      return {
        label: 'Withdrawn',
        description: 'Application voluntarily withdrawn before committee evaluation.',
        dotColor: '#DC2626',
        textColor: isDarkMode ? '#F87171' : '#DC2626',
        badgeBg: isDarkMode ? '#3B1D28' : '#FEF2F2',
        badgeBorder: isDarkMode ? '#991B1B' : '#FCA5A5',
      };
    }
    if (isDisapproved) {
      return {
        label: 'Disapproved',
        description: 'Application disapproved. This application is no longer under active review.',
        dotColor: '#DC2626',
        textColor: isDarkMode ? '#F87171' : '#DC2626',
        badgeBg: isDarkMode ? '#3B1D28' : '#FEF2F2',
        badgeBorder: isDarkMode ? '#991B1B' : '#FCA5A5',
      };
    }
    if (scholar?.scholar_status === 'Active') {
      if (stages[4].state === 'completed') {
        return {
          label: 'Grant Disbursed',
          description: 'Scholarship grant released for the current academic period.',
          dotColor: '#16A34A',
          textColor: isDarkMode ? '#4ADE80' : '#16A34A',
          badgeBg: isDarkMode ? '#064E3B' : '#DCFCE7',
          badgeBorder: isDarkMode ? '#059669' : '#86EFAC',
        };
      }
      if (stages[4].subLabel && stages[4].subLabel !== 'No Application' && stages[4].subLabel !== 'Pending') {
        return {
          label: stages[4].subLabel,
          description: 'Scholarship grant application in progress.',
          dotColor: '#7E22CE',
          textColor: isDarkMode ? '#C084FC' : '#7E22CE',
          badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
          badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
        };
      }
      return {
        label: 'Active Scholar',
        description: 'Scholar in good standing under Academic Scholarship Program.',
        dotColor: '#16A34A',
        textColor: isDarkMode ? '#4ADE80' : '#16A34A',
        badgeBg: isDarkMode ? '#064E3B' : '#DCFCE7',
        badgeBorder: isDarkMode ? '#059669' : '#86EFAC',
      };
    }
    if (application) {
      const s = application.application_status;
      if (s === 'Approved') {
        return {
          label: 'Approved',
          description: 'Application approved for municipal scholarship admission.',
          dotColor: '#16A34A',
          textColor: isDarkMode ? '#4ADE80' : '#16A34A',
          badgeBg: isDarkMode ? '#064E3B' : '#DCFCE7',
          badgeBorder: isDarkMode ? '#059669' : '#86EFAC',
        };
      }
      if (s === 'Ready for SSC' || s === 'For Evaluation') {
        return {
          label: 'For SSC Evaluation',
          description: 'Scheduled for Scholarship Selection Committee evaluation.',
          dotColor: '#7E22CE',
          textColor: isDarkMode ? '#C084FC' : '#7E22CE',
          badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
          badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
        };
      }
      if (s === 'For Compliance' || s === 'Returned') {
        return {
          label: s,
          description: 'Action required: document compliance or corrections needed.',
          dotColor: '#D97706',
          textColor: isDarkMode ? '#FBBF24' : '#D97706',
          badgeBg: isDarkMode ? '#451A03' : '#FEF3C7',
          badgeBorder: isDarkMode ? '#B45309' : '#FDE68A',
        };
      }
      if (s === 'Under Review') {
        return {
          label: 'Under Review',
          description: 'Secretariat verification of submitted documents in progress.',
          dotColor: '#7E22CE',
          textColor: isDarkMode ? '#C084FC' : '#7E22CE',
          badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
          badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
        };
      }
      if (s === 'Disapproved') {
        return {
          label: 'Disapproved',
          description: 'Application disapproved. This application is no longer under active review.',
          dotColor: '#DC2626',
          textColor: isDarkMode ? '#F87171' : '#DC2626',
          badgeBg: isDarkMode ? '#3B1D28' : '#FEF2F2',
          badgeBorder: isDarkMode ? '#991B1B' : '#FCA5A5',
        };
      }
      if (s === 'Draft') {
        return {
          label: 'Draft',
          description: 'Application started and awaiting final submission.',
          dotColor: '#D97706',
          textColor: isDarkMode ? '#FBBF24' : '#D97706',
          badgeBg: isDarkMode ? '#451A03' : '#FEF3C7',
          badgeBorder: isDarkMode ? '#B45309' : '#FDE68A',
        };
      }
      return {
        label: s || 'Submitted',
        description: 'Application submitted and awaiting coordinator review.',
        dotColor: '#7E22CE',
        textColor: isDarkMode ? '#C084FC' : '#7E22CE',
        badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
        badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
      };
    }
    return {
      label: 'No Active Record',
      description: 'No active application or scholarship record found.',
      dotColor: '#64748B',
      textColor: isDarkMode ? '#94A3B8' : '#64748B',
      badgeBg: isDarkMode ? '#1E293B' : '#F1F5F9',
      badgeBorder: isDarkMode ? '#334155' : '#E2E8F0',
    };
  }, [isWithdrawn, isDisapproved, scholar, application, stages, isDarkMode]);


  // -------------------------------------------------------------
  // SCHOLARSHIP HISTORY / RECORDS
  // -------------------------------------------------------------
  const historyList: HistoryItem[] = useMemo(() => {
    const list: HistoryItem[] = [];
    const seenCodes = new Set<string>();

    const authoritativeFallback = currentPeriodString || 'Academic Period';

    // Resolves academic period cleanly and eliminates the "AY •" bug
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

      let rawStatus = item.displayStatus || item.status || 'Completed';
      let recordStatus = rawStatus;
      if (rawStatus.trim().toLowerCase() === 'rejected' || rawStatus.trim().toLowerCase() === 'disapproved') {
        recordStatus = 'Disapproved';
      }
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
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

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
        status: scholar
          ? 'Approved'
          : application?.application_status?.toLowerCase() === 'rejected'
          ? 'Disapproved'
          : application?.application_status || 'Submitted',
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

  // View / Download action handler
  const handleOfficialDocAction = async (doc: ModalDocItem, mode: 'view' | 'download') => {
    const actionKey = `${doc.key}_${mode}`;
    setActionLoadingKey(actionKey);

    const appId = application?.application_id || 1;
    const renewalId = selectedRecordForDocs?.rawId || 1;
    const docNum = doc.documentNumber;

    try {
      let result;
      if (doc.type === 'SCHOLARSHIP_CERTIFICATE') {
        result = await downloadOrViewCitizenInitialCertificate(appId, docNum, mode);
      } else if (doc.type === 'SCHOLARSHIP_CONTRACT') {
        result = await downloadOrViewCitizenContract(appId, docNum, mode);
      } else if (doc.type === 'SWORN_UNDERTAKING') {
        result = await downloadOrViewCitizenUndertaking(appId, docNum, mode);
      } else if (doc.type === 'RENEWAL_CERTIFICATE') {
        result = await downloadOrViewCitizenRenewalCertificate(renewalId, docNum, mode);
      }

      if (mode === 'view' && result?.localUri) {
        setViewerLocalUri(result.localUri);
        setViewerFilename(result.filename);
        setViewerMimeType(result.mimeType || 'application/pdf');
        setViewerTitle(doc.title);
        setViewerRefNumber(docNum);
        setViewerStatus(doc.status);
        setViewerDate(doc.date);
        setViewerModalVisible(true);
        return;
      }

      setFeedbackTitle(`Downloaded: ${doc.title}`);
      setFeedbackBody(
        `Document Title: ${doc.title}\nReference Number: ${docNum}\nStatus: ${doc.status}\nDate: ${doc.date}\n\nOfficial document ${docNum} has been saved to your local device storage.`
      );
      setFeedbackModalVisible(true);
    } catch (err: any) {
      console.error('[handleOfficialDocAction] error:', err);
      Alert.alert(
        'Unable to Process Document',
        err?.message || 'Could not fetch official document. Please check your network connection.'
      );
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
          <View
            style={[
              styles.headerContainer,
              isDarkMode && styles.headerContainerDark,
              { aspectRatio: headerAspectRatio, marginBottom: 0 },
            ]}
          >
            <Skeleton
              width="100%"
              borderRadius={16}
              style={{
                height: "100%",
              }}
            />
          </View>
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
          {/* 1. SCHOLARSHIP DASHBOARD HEADER IMAGE                         */}
          {/* ============================================================ */}
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
              source={isDarkMode ? dashHeaderDark : dashHeaderLight}
              style={styles.headerImage}
              resizeMode="cover"
              accessible={true}
              accessibilityLabel="Scholarship Dashboard Header"
            />
          </View>

          {/* ============================================================ */}
          {/* 1. CURRENT SCHOLARSHIP                                       */}
          {/* ============================================================ */}
          <View
            style={[
              styles.currentScholarshipCard,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.currentCardHeaderRow}>
              <Text
                style={[
                  styles.currentCardSectionLabel,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                CURRENT SCHOLARSHIP
              </Text>
              <View
                style={[
                  styles.currentStatusBadge,
                  {
                    backgroundColor: currentStatusInfo.badgeBg,
                    borderColor: currentStatusInfo.badgeBorder,
                  },
                ]}
              >
                <View
                  style={[
                    styles.currentStatusBadgeDot,
                    { backgroundColor: currentStatusInfo.dotColor },
                  ]}
                />
                <Text
                  style={[
                    styles.currentStatusBadgeText,
                    { color: currentStatusInfo.textColor },
                  ]}
                >
                  {currentStatusInfo.label}
                </Text>
              </View>
            </View>

            {/* Program Name */}
            <Text
              style={[
                styles.currentProgramTitle,
                isDarkMode && { color: '#F8FAFC' },
              ]}
              numberOfLines={2}
            >
              {scholarship?.program_name || 'Academic Scholarship Program'}
            </Text>

            {/* Education Level / Category Subtitle */}
            <Text
              style={[
                styles.currentProgramCategory,
                isDarkMode && { color: '#CBD5E1' },
              ]}
              numberOfLines={1}
            >
              {scholarship?.category_name || 'City Government Educational Assistance Program'}
            </Text>

            {/* Chips row: Academic Period, Program Code, Scholar/App Code */}
            <View style={styles.currentMetaRow}>
              {currentPeriodString ? (
                <View
                  style={[
                    styles.currentMetaChip,
                    isDarkMode && {
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                    },
                  ]}
                >
                  <IconSymbol
                    name="calendar"
                    size={12}
                    color={isDarkMode ? '#C084FC' : '#7E22CE'}
                  />
                  <Text
                    style={[
                      styles.currentMetaChipText,
                      isDarkMode && { color: '#E2E8F0' },
                    ]}
                  >
                    {currentPeriodString}
                  </Text>
                </View>
              ) : null}

              {scholarship?.program_code ? (
                <View
                  style={[
                    styles.currentMetaChip,
                    styles.currentMetaChipViolet,
                    isDarkMode && {
                      backgroundColor: '#3B0764',
                      borderColor: '#7E22CE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currentMetaChipText,
                      styles.currentMetaChipVioletText,
                      isDarkMode && { color: '#C084FC' },
                    ]}
                  >
                    {scholarship.program_code}
                  </Text>
                </View>
              ) : null}

              {(scholar?.scholar_code || application?.application_code) ? (
                <View
                  style={[
                    styles.currentMetaChip,
                    isDarkMode && {
                      backgroundColor: '#111827',
                      borderColor: '#374151',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.currentMetaChipText,
                      isDarkMode && { color: '#94A3B8' },
                    ]}
                  >
                    ID: {scholar?.scholar_code || application?.application_code}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* ============================================================ */}
          {/* 2. SCHOLARSHIP PROGRESS (COMPACT SUMMARY)                    */}
          {/* ============================================================ */}
          <View
            style={[
              styles.progressCard,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.progressCardHeaderRow}>
              <Text
                style={[
                  styles.progressCardSectionLabel,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                SCHOLARSHIP PROGRESS
              </Text>
            </View>

            {/* Current Status Section */}
            <View style={styles.progressStatusSection}>
              <Text
                style={[
                  styles.progressStatusLabel,
                  isDarkMode && { color: '#94A3B8' },
                ]}
              >
                Current Status
              </Text>
              <View style={styles.progressStatusValueRow}>
                <View
                  style={[
                    styles.currentStatusBadgeDot,
                    { backgroundColor: currentStatusInfo.dotColor },
                  ]}
                />
                <Text
                  style={[
                    styles.progressStatusValue,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                >
                  {currentStatusInfo.label}
                </Text>
              </View>
              <Text
                style={[
                  styles.progressStatusDesc,
                  isDarkMode && { color: '#CBD5E1' },
                ]}
              >
                {currentStatusInfo.description}
              </Text>
            </View>

            {/* Short Progress Indicator */}
            <View style={styles.compactIndicatorContainer}>
              {isWithdrawn ? (
                <View
                  style={[
                    styles.compactTerminatedBar,
                    isDarkMode && {
                      backgroundColor: '#3B1D28',
                      borderColor: '#991B1B',
                    },
                  ]}
                >
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={14}
                    color="#DC2626"
                  />
                  <Text
                    style={[
                      styles.compactTerminatedText,
                      isDarkMode && { color: '#F87171' },
                    ]}
                  >
                    Application Terminated — Voluntarily Withdrawn
                  </Text>
                </View>
              ) : isDisapproved ? (
                <View
                  style={[
                    styles.compactTerminatedBar,
                    isDarkMode && {
                      backgroundColor: '#3B1D28',
                      borderColor: '#991B1B',
                    },
                  ]}
                >
                  <IconSymbol
                    name="xmark.circle.fill"
                    size={14}
                    color="#DC2626"
                  />
                  <Text
                    style={[
                      styles.compactTerminatedText,
                      isDarkMode && { color: '#F87171' },
                    ]}
                  >
                    Application Disapproved — No Longer Active
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.compactStepperRow}>
                    {stages.map((stg) => {
                      const isCompleted = stg.state === 'completed';
                      const isCurrent = stg.state === 'current';
                      return (
                        <View
                          key={stg.id}
                          style={[
                            styles.compactStepSegment,
                            isCompleted && styles.compactStepSegmentCompleted,
                            isCurrent && [
                              styles.compactStepSegmentCurrent,
                              isDarkMode && { backgroundColor: '#C084FC' },
                            ],
                            isDarkMode &&
                              !isCompleted &&
                              !isCurrent && { backgroundColor: '#334155' },
                          ]}
                        />
                      );
                    })}
                  </View>
                  <View style={styles.compactStepLabelsRow}>
                    <Text
                      style={[
                        styles.compactStepStageName,
                        isDarkMode && { color: '#C084FC' },
                      ]}
                      numberOfLines={1}
                    >
                      {stages[currentStageIndex]?.title || stages[currentStageIndex]?.label}
                    </Text>
                    <Text
                      style={[
                        styles.compactStepCountText,
                        isDarkMode && { color: '#94A3B8' },
                      ]}
                    >
                      Stage {currentStageIndex + 1} of {stages.length}
                      {stages[currentStageIndex]?.state === 'completed'
                        ? ' • Completed'
                        : ' • In Progress'}
                      {stages[currentStageIndex]?.evaluatorName
                        ? ` • Evaluated by: ${stages[currentStageIndex]?.evaluatorName}`
                        : currentStageIndex >= 1 && (stages[2]?.evaluatorName || stages[1]?.evaluatorName)
                        ? ` • Evaluated by: ${stages[2]?.evaluatorName || stages[1]?.evaluatorName}`
                        : ''}
                    </Text>
                  </View>
                </>
              )}
            </View>

            {/* View Full Progress Action Button */}
            <TouchableOpacity
              style={[
                styles.viewProgressBtn,
                isDarkMode && { backgroundColor: '#6B21A8' },
              ]}
              onPress={() => setProgressModalVisible(true)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View full scholarship progress timeline"
            >
              <Text style={styles.viewProgressBtnText}>
                VIEW FULL PROGRESS
              </Text>
              <IconSymbol name="chevron.right" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* ============================================================ */}
          {/* 3. SCHOLARSHIP HISTORY (CONCISE PREVIEW)                     */}
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
              {historyList.length > 0 ? (
                <View
                  style={[
                    styles.historyCountBadge,
                    isDarkMode && {
                      backgroundColor: '#3B0764',
                      borderColor: '#7E22CE',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.historyCountBadgeText,
                      isDarkMode && { color: '#C084FC' },
                    ]}
                  >
                    {historyList.length} {historyList.length === 1 ? 'Record' : 'Records'}
                  </Text>
                </View>
              ) : null}
            </View>

            {/* Concise Preview Box (shows at most 2 recent records) */}
            <View
              style={[
                styles.historyPreviewBox,
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
                historyList.slice(0, 2).map((rec, idx) => {
                  const isLast = idx === Math.min(historyList.length, 2) - 1;
                  const colors = getStatusColors(rec.status, isDarkMode);

                  return (
                    <View
                      key={rec.id}
                      style={[
                        styles.historyPreviewRow,
                        isLast && styles.historyPreviewRowLast,
                        isDarkMode && { borderBottomColor: '#293548' },
                      ]}
                    >
                      {/* Academic Period */}
                      <Text
                        style={[
                          styles.historyPreviewPeriodText,
                          isDarkMode && { color: '#C084FC' },
                        ]}
                      >
                        {rec.academicPeriod}
                      </Text>

                      {/* Program Name */}
                      <Text
                        style={[
                          styles.historyPreviewProgramText,
                          isDarkMode && { color: '#F8FAFC' },
                        ]}
                        numberOfLines={1}
                      >
                        {rec.isCurrent && (scholarship?.program_name || scholarship?.category_name)
                          ? `${scholarship?.program_name || 'Academic Scholarship'}${
                              scholarship?.category_name ? ` — ${scholarship.category_name}` : ''
                            }`
                          : `${rec.recordType} Record`}
                      </Text>

                      {/* Bottom row: Status badge, Reference Code, and Documents link */}
                      <View style={styles.historyPreviewBottomRow}>
                        <View style={styles.historyPreviewStatusGroup}>
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
                            {rec.status.toUpperCase()}
                          </Text>
                          {rec.referenceCode ? (
                            <Text
                              style={[
                                styles.historyPreviewRefCode,
                                isDarkMode && { color: '#64748B' },
                              ]}
                            >
                              • {rec.referenceCode}
                            </Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.historyDocumentsLink,
                            isDarkMode && { backgroundColor: '#3B0764' },
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
                          activeOpacity={0.7}
                          accessibilityRole="button"
                          accessibilityLabel={`View details for ${rec.academicPeriod}`}
                        >
                          <Text
                            style={[
                              styles.historyDocumentsLinkText,
                              isDarkMode && { color: '#C084FC' },
                            ]}
                          >
                            Details →
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>

            {/* LARGE PRIMARY ACTION: VIEW FULL SCHOLARSHIP HISTORY */}
            <TouchableOpacity
              style={[
                styles.viewFullHistoryBtn,
                isDarkMode && {
                  backgroundColor: '#3B0764',
                  borderColor: '#7E22CE',
                  borderWidth: 1,
                },
              ]}
              onPress={() => router.push('/education/dashboard/history' as any)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View full scholarship history"
            >
              <View style={styles.viewFullHistoryBtnContent}>
                <IconSymbol
                  name="history"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.viewFullHistoryBtnText}>
                  VIEW FULL SCHOLARSHIP HISTORY
                </Text>
              </View>
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ============================================================== */}
      {/* FULL PROGRESS DETAILED TIMELINE MODAL                          */}
      {/* ============================================================== */}
      <Modal
        visible={progressModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProgressModalVisible(false)}
      >
        <View style={styles.progressModalOverlay}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setProgressModalVisible(false)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss modal backdrop"
          />
          <View
            style={[
              styles.progressModalSheet,
              { paddingBottom: Math.max(insets.bottom, 24) },
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            {/* Header */}
            <View
              style={[
                styles.progressModalHeader,
                isDarkMode && { borderBottomColor: '#293548' },
              ]}
            >
              <View style={styles.progressModalHeaderTextCol}>
                <Text
                  style={[
                    styles.progressModalTitle,
                    isDarkMode && { color: '#C084FC' },
                  ]}
                >
                  Scholarship Progress
                </Text>
                <Text
                  style={[
                    styles.progressModalSubtitle,
                    isDarkMode && { color: '#94A3B8' },
                  ]}
                  numberOfLines={1}
                >
                  {scholarship?.program_name || 'Academic Scholarship'}
                  {scholarship?.category_name ? ` — ${scholarship.category_name}` : ' — Senior High School'}
                </Text>
                <Text
                  style={[
                    styles.progressModalSubtitle,
                    { fontSize: 11, marginTop: 1 },
                    isDarkMode && { color: '#64748B' },
                  ]}
                  numberOfLines={1}
                >
                  {currentPeriodString || '2026–2027 • Whole Academic Year'}
                </Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.progressModalCloseBtn,
                  isDarkMode && { backgroundColor: '#334155' },
                ]}
                onPress={() => setProgressModalVisible(false)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Close"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <IconSymbol
                  name="xmark"
                  size={20}
                  color={isDarkMode ? '#F8FAFC' : '#0F172A'}
                />
              </TouchableOpacity>
            </View>

            {/* Body */}
            <ScrollView
              style={styles.progressModalBody}
              contentContainerStyle={{ paddingBottom: 24 }}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.verticalTimelineContainer}>
                {isWithdrawn ? (
                  /* ==================================================== */
                  /* WITHDRAWAL TIMELINE TERMINATION                     */
                  /* ==================================================== */
                  <>
                    {/* Render completed stages before withdrawal (e.g. Stage 1) */}
                    <View style={styles.verticalTimelineRow}>
                      <View style={styles.verticalTimelineLeftCol}>
                        <View
                          style={[
                            styles.verticalTimelineDot,
                            styles.verticalTimelineDotCompleted,
                          ]}
                        >
                          <IconSymbol
                            name="checkmark"
                            size={13}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={[styles.verticalTimelineConnector, styles.verticalTimelineConnectorCompleted]} />
                      </View>
                      <View
                        style={[
                          styles.verticalTimelineContentCard,
                          isDarkMode && {
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                          },
                        ]}
                      >
                        <View style={styles.verticalTimelineHeaderRow}>
                          <Text
                            style={[
                              styles.verticalTimelineTitle,
                              isDarkMode && { color: '#F8FAFC' },
                            ]}
                          >
                            Application Submitted
                          </Text>
                          <View
                            style={[
                              styles.verticalTimelineStatusPill,
                              { backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.verticalTimelineStatusPillText,
                                { color: isDarkMode ? '#4ADE80' : '#15803D' },
                              ]}
                            >
                              COMPLETED
                            </Text>
                          </View>
                        </View>
                        {stages[0].date ? (
                          <Text
                            style={[
                              styles.verticalTimelineDate,
                              isDarkMode && { color: '#4ADE80' },
                            ]}
                          >
                            {stages[0].date}
                          </Text>
                        ) : null}
                        <Text
                          style={[
                            styles.verticalTimelineDesc,
                            isDarkMode && { color: '#94A3B8' },
                          ]}
                        >
                          Initial scholarship application and credentials submitted.
                        </Text>
                      </View>
                    </View>

                    {/* Terminal Divider */}
                    <View
                      style={[
                        styles.terminalDivider,
                        isDarkMode && { backgroundColor: '#334155' },
                      ]}
                    />

                    {/* TERMINAL WITHDRAWN CARD */}
                    <View
                      style={[
                        styles.withdrawnTerminalCard,
                        isDarkMode && {
                          backgroundColor: '#3B1D28',
                          borderColor: '#991B1B',
                        },
                      ]}
                    >
                      <View style={styles.withdrawnTerminalHeaderRow}>
                        <Text
                          style={[
                            styles.withdrawnTerminalTitle,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          APPLICATION WITHDRAWN
                        </Text>
                        <View
                          style={[
                            styles.withdrawnBadge,
                            isDarkMode && {
                              backgroundColor: '#4C1D24',
                              borderColor: '#F87171',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.withdrawnBadgeText,
                              isDarkMode && { color: '#F87171' },
                            ]}
                          >
                            TERMINATED
                          </Text>
                        </View>
                      </View>

                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Withdrawn on:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {withdrawalDate}
                        </Text>
                      </View>

                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Reason:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {withdrawalReason}
                        </Text>
                      </View>

                      {application?.application_code ? (
                        <View style={styles.withdrawnMetaRow}>
                          <Text
                            style={[
                              styles.withdrawnMetaLabel,
                              isDarkMode && { color: '#FCA5A5' },
                            ]}
                          >
                            Reference:
                          </Text>
                          <Text
                            style={[
                              styles.withdrawnMetaVal,
                              isDarkMode && { color: '#F87171' },
                            ]}
                          >
                            {application.application_code}
                          </Text>
                        </View>
                      ) : null}

                      <Text
                        style={[
                          styles.withdrawnNotice,
                          isDarkMode && { color: '#CBD5E1' },
                        ]}
                      >
                        This scholarship application has been permanently terminated. You are eligible to apply for another available scholarship program.
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.withdrawnBrowseBtn,
                          isDarkMode && { backgroundColor: '#7E22CE' },
                        ]}
                        onPress={() => {
                          setProgressModalVisible(false);
                          router.push('/education/new-applicant/browse-scholarships' as any);
                        }}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Browse available scholarships"
                      >
                        <Text style={styles.withdrawnBrowseBtnText}>
                          Browse Available Scholarships
                        </Text>
                        <IconSymbol name="chevron.right" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : isDisapproved ? (
                  /* ==================================================== */
                  /* DISAPPROVAL TIMELINE TERMINATION                    */
                  /* ==================================================== */
                  <>
                    {/* Render completed stages before disapproval */}
                    <View style={styles.verticalTimelineRow}>
                      <View style={styles.verticalTimelineLeftCol}>
                        <View
                          style={[
                            styles.verticalTimelineDot,
                            styles.verticalTimelineDotCompleted,
                          ]}
                        >
                          <IconSymbol
                            name="checkmark"
                            size={13}
                            color="#FFFFFF"
                          />
                        </View>
                        <View style={[styles.verticalTimelineConnector, styles.verticalTimelineConnectorCompleted]} />
                      </View>
                      <View
                        style={[
                          styles.verticalTimelineContentCard,
                          isDarkMode && {
                            backgroundColor: '#1E293B',
                            borderColor: '#334155',
                          },
                        ]}
                      >
                        <View style={styles.verticalTimelineHeaderRow}>
                          <Text
                            style={[
                              styles.verticalTimelineTitle,
                              isDarkMode && { color: '#F8FAFC' },
                            ]}
                          >
                            Application Submitted
                          </Text>
                          <View
                            style={[
                              styles.verticalTimelineStatusPill,
                              { backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.verticalTimelineStatusPillText,
                                { color: isDarkMode ? '#4ADE80' : '#15803D' },
                              ]}
                            >
                              COMPLETED
                            </Text>
                          </View>
                        </View>
                        {stages[0].date ? (
                          <Text
                            style={[
                              styles.verticalTimelineDate,
                              isDarkMode && { color: '#4ADE80' },
                            ]}
                          >
                            {stages[0].date}
                          </Text>
                        ) : null}
                        <Text
                          style={[
                            styles.verticalTimelineDesc,
                            isDarkMode && { color: '#94A3B8' },
                          ]}
                        >
                          Initial scholarship application and credentials submitted.
                        </Text>
                      </View>
                    </View>

                    {/* Terminal Divider */}
                    <View
                      style={[
                        styles.terminalDivider,
                        isDarkMode && { backgroundColor: '#334155' },
                      ]}
                    />

                    {/* TERMINAL DISAPPROVED CARD */}
                    <View
                      style={[
                        styles.withdrawnTerminalCard,
                        isDarkMode && {
                          backgroundColor: '#3B1D28',
                          borderColor: '#991B1B',
                        },
                      ]}
                    >
                      <View style={styles.withdrawnTerminalHeaderRow}>
                        <Text
                          style={[
                            styles.withdrawnTerminalTitle,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          APPLICATION DISAPPROVED
                        </Text>
                        <View
                          style={[
                            styles.withdrawnBadge,
                            isDarkMode && {
                              backgroundColor: '#4C1D24',
                              borderColor: '#F87171',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.withdrawnBadgeText,
                              isDarkMode && { color: '#F87171' },
                            ]}
                          >
                            TERMINATED
                          </Text>
                        </View>
                      </View>

                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Status:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          DISAPPROVED
                        </Text>
                      </View>

                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Reason:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {disapprovalCategory}
                        </Text>
                      </View>

                      {disapprovalRemarks ? (
                        <View style={styles.withdrawnMetaRow}>
                          <Text
                            style={[
                              styles.withdrawnMetaLabel,
                              isDarkMode && { color: '#FCA5A5' },
                            ]}
                          >
                            Remarks:
                          </Text>
                          <Text
                            style={[
                              styles.withdrawnMetaVal,
                              isDarkMode && { color: '#F87171' },
                            ]}
                          >
                            {disapprovalRemarks}
                          </Text>
                        </View>
                      ) : null}

                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Decision Date:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {disapprovalDate}
                        </Text>
                      </View>

                      {application?.application_code ? (
                        <View style={styles.withdrawnMetaRow}>
                          <Text
                            style={[
                              styles.withdrawnMetaLabel,
                              isDarkMode && { color: '#FCA5A5' },
                            ]}
                          >
                            Reference:
                          </Text>
                          <Text
                            style={[
                              styles.withdrawnMetaVal,
                              isDarkMode && { color: '#F87171' },
                            ]}
                          >
                            {application.application_code}
                          </Text>
                        </View>
                      ) : null}

                      <Text
                        style={[
                          styles.withdrawnNotice,
                          isDarkMode && { color: '#CBD5E1' },
                        ]}
                      >
                        This application is no longer under active review. The application remains available in your application history.
                      </Text>

                      <TouchableOpacity
                        style={[
                          styles.withdrawnBrowseBtn,
                          isDarkMode && { backgroundColor: '#7E22CE' },
                        ]}
                        onPress={() => {
                          setProgressModalVisible(false);
                          router.push('/education/new-applicant/browse-scholarships' as any);
                        }}
                        activeOpacity={0.8}
                        accessibilityRole="button"
                        accessibilityLabel="Browse available scholarships"
                      >
                        <Text style={styles.withdrawnBrowseBtnText}>
                          Browse Available Scholarships
                        </Text>
                        <IconSymbol name="chevron.right" size={13} color="#FFFFFF" />
                      </TouchableOpacity>
                    </View>
                  </>
                ) : (
                  /* ==================================================== */
                  /* NORMAL 5-STAGE PROGRESS TIMELINE                    */
                  /* ==================================================== */
                  stages.map((stg, idx) => {
                    const isLast = idx === stages.length - 1;
                    const isCompleted = stg.state === 'completed';
                    const isCurrent = stg.state === 'current';
                    const isUpcoming = stg.state === 'upcoming';

                    return (
                      <View key={stg.id} style={styles.verticalTimelineRow}>
                        {/* Left column: Dot and vertical connector */}
                        <View style={styles.verticalTimelineLeftCol}>
                            <View
                              style={[
                                styles.verticalTimelineDot,
                                isCompleted && styles.verticalTimelineDotCompleted,
                                isCurrent && [
                                  styles.verticalTimelineDotCurrent,
                                  isDarkMode && { backgroundColor: '#2E1065', borderColor: '#C084FC' },
                                ],
                                isUpcoming && [
                                  styles.verticalTimelineDotUpcoming,
                                  isDarkMode && {
                                    backgroundColor: '#1E293B',
                                    borderColor: '#475569',
                                  },
                                ],
                              ]}
                            >
                              {isCompleted ? (
                                <IconSymbol
                                  name="checkmark"
                                  size={13}
                                  color="#FFFFFF"
                                />
                              ) : isCurrent ? (
                                <View
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: 5,
                                    backgroundColor: isDarkMode ? '#C084FC' : '#7E22CE',
                                  }}
                                />
                              ) : null}
                            </View>

                          {!isLast ? (
                            <View
                              style={[
                                styles.verticalTimelineConnector,
                                isCompleted && styles.verticalTimelineConnectorCompleted,
                                isDarkMode && !isCompleted && { backgroundColor: '#334155' },
                              ]}
                            />
                          ) : null}
                        </View>

                        {/* Content card */}
                        <View
                          style={[
                            styles.verticalTimelineContentCard,
                            isCurrent && styles.verticalTimelineContentCardActive,
                            isDarkMode && {
                              backgroundColor: '#1E293B',
                              borderColor: isCurrent ? '#7E22CE' : '#334155',
                            },
                          ]}
                        >
                          <View style={styles.verticalTimelineHeaderRow}>
                            <Text
                              style={[
                                styles.verticalTimelineTitle,
                                isDarkMode && { color: '#F8FAFC' },
                              ]}
                            >
                              {stg.title}
                            </Text>

                            <View
                              style={[
                                styles.verticalTimelineStatusPill,
                                isCompleted
                                  ? { backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7' }
                                  : isCurrent
                                  ? { backgroundColor: isDarkMode ? '#3B0764' : '#F3E8FF' }
                                  : { backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.verticalTimelineStatusPillText,
                                  isCompleted
                                    ? { color: isDarkMode ? '#4ADE80' : '#15803D' }
                                    : isCurrent
                                    ? { color: isDarkMode ? '#C084FC' : '#7E22CE' }
                                    : { color: isDarkMode ? '#64748B' : '#94A3B8' },
                                ]}
                              >
                                {isCompleted ? 'COMPLETED' : isCurrent ? 'IN PROGRESS' : 'UPCOMING'}
                              </Text>
                            </View>
                          </View>

                          {stg.date ? (
                            <Text
                              style={[
                                styles.verticalTimelineDate,
                                isDarkMode && { color: '#4ADE80' },
                              ]}
                            >
                              {stg.date}
                            </Text>
                          ) : null}

                          {stg.evaluatorName ? (
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 4 }}>
                              <IconSymbol name="person.crop.circle" size={13} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: '600',
                                  color: isDarkMode ? '#C084FC' : '#7E22CE',
                                }}
                              >
                                Evaluated by: {stg.evaluatorName}
                              </Text>
                            </View>
                          ) : null}

                          <Text
                            style={[
                              styles.verticalTimelineDesc,
                              isDarkMode && { color: '#CBD5E1' },
                            ]}
                          >
                            {stg.description}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
              {/* IN-APP DOCUMENT VIEWER MODAL */}
      <InAppDocumentViewerModal
        visible={viewerModalVisible}
        onClose={() => setViewerModalVisible(false)}
        localUri={viewerLocalUri}
        filename={viewerFilename}
        mimeType={viewerMimeType}
        documentTitle={viewerTitle}
        referenceNumber={viewerRefNumber}
        statusBadge={viewerStatus}
        date={viewerDate}
      />
    </ScrollView>
          </View>
        </View>
      </Modal>

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
                      {doc.status} • {doc.date}
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

