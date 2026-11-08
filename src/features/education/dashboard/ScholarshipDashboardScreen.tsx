import { formatDateNullable as formatDate, getStatusColors } from '@/src/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { InAppDocumentViewerModal } from '@/src/components/document-viewer/InAppDocumentViewerModal';
import { useTheme } from '@/src/context/ThemeContext';
import { useScholarshipStore } from '@/src/store';
import {
  CitizenDashboardData,
  fetchCitizenTrackedItems,
  TrackedItem,
} from './api/scholarshipDashboardApi';
import { CitizenGrantOverviewData, fetchCitizenGrantOverview } from '../grant/api/grantApi';
import { CitizenGrantReleaseItem, fetchCitizenGrantReleases } from '../grant/api/grantReleaseApi';
import { CitizenRenewalOverviewData, fetchCitizenRenewalOverview } from '../renewal/api/renewalApi';
import {
  CitizenOfficialDocumentsData,
  downloadOrViewCitizenContract,
  downloadOrViewCitizenInitialCertificate,
  downloadOrViewCitizenRenewalCertificate,
  downloadOrViewCitizenUndertaking,
  fetchCitizenOfficialDocuments,
} from './api/citizenDocumentApi';
import { styles } from './styles/ScholarshipDashboard.styles';
import {
  computeScholarshipStages,
  ProgressStage,
  ScholarshipStageState,
} from './details/detailHelpers';
import {
  ScholarshipProgressModal,
  RecordOfficialDocumentsModal,
  DocumentActionFeedbackModal,
  ModalDocItem,
} from './modals';

const dashHeaderLight = require('@/assets/images/dash-header-light.png');
const dashHeaderDark = require('@/assets/images/dash-header-dark.png');

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


function getStageIcon(
  id: number,
  isRenewal: boolean,
  state: ScholarshipStageState | string
): string {
  const filled = state === 'completed';
  if (id === 1) return filled ? 'paper-plane'         : 'paper-plane-outline';
  if (id === 2) return filled ? 'document-text'       : 'document-text-outline';
  if (id === 3) return filled ? 'people'              : 'people-outline';
  if (id === 4) return filled ? 'checkmark-circle'    : 'checkmark-circle-outline';
  if (id === 5) {
    if (isRenewal) return filled ? 'ribbon'           : 'ribbon-outline';
    return          filled       ? 'cash'             : 'cash-outline';
  }
  return 'ellipse-outline';
}

export function ScholarshipDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const headerAspectRatio = isDarkMode ? 1872 / 497 : 1868 / 483;

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authoritative data states from Zustand store & local hooks
  const { dashboardData: storeDashboardData, fetchDashboard } = useScholarshipStore();
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(storeDashboardData);
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [officialDocsData, setOfficialDocsData] = useState<CitizenOfficialDocumentsData | null>(null);
  const [renewalOverview, setRenewalOverview] = useState<CitizenRenewalOverviewData | null>(null);

  // Sync state when store updates
  useEffect(() => {
    if (storeDashboardData) {
      setDashboardData(storeDashboardData);
    }
  }, [storeDashboardData]);

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

  const loadData = useCallback(async (force = false) => {
    try {
      setError(null);
      const [dashRes, grantOverRes, grantRelRes, trackedRes, officialDocsRes, renewalOverRes] =
        await Promise.all([
          fetchDashboard(force).catch((err) => {
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
          fetchCitizenRenewalOverview().catch((err) => {
            console.warn('[ScholarshipDashboard] renewal overview fetch failed:', err);
            return null;
          }),
        ]);

      const effectiveDashboard = dashRes || storeDashboardData;

      if (!effectiveDashboard && !grantOverRes) {
        setError('Unable to load scholarship information. Please check your connection.');
      } else {
        if (effectiveDashboard) {
          setDashboardData(effectiveDashboard);
        }
        setGrantOverview(grantOverRes);
        setGrantReleases(grantRelRes);
        setTrackedItems(trackedRes);
        setOfficialDocsData(officialDocsRes);
        setRenewalOverview(renewalOverRes);
      }
    } catch (err: any) {
      console.error('[ScholarshipDashboard] loadData error:', err);
      setError(err?.message || 'Unable to load scholarship information.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [fetchDashboard, storeDashboardData]);

  useFocusEffect(
    useCallback(() => {
      loadData(false);
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const currentAcademicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;

  // Active renewal resolution (from dashboard API or renewal overview)
  const activeRenewal = useMemo(() => {
    if (dashboardData?.renewal) {
      return dashboardData.renewal;
    }
    if (renewalOverview?.renewal && renewalOverview.state === 'RENEWAL_EXISTS') {
      const r = renewalOverview.renewal;
      const p = renewalOverview.renewal_period;
      return {
        renewal_id: r.renewal_id,
        renewal_code: r.renewal_code,
        renewal_status: r.renewal_status,
        submitted_at: r.submitted_at,
        academic_year: p?.academic_year || '',
        term: p?.term || '',
        academic_period: p ? `AY ${p.academic_year} • ${p.term}` : '',
      };
    }
    return null;
  }, [dashboardData?.renewal, renewalOverview]);

  const isRenewalActive = useMemo(() => {
    if (!activeRenewal) return false;
    const s = activeRenewal.renewal_status;
    return [
      'For Review',
      'Under Review',
      'For Compliance',
      'For Evaluation',
      'Returned',
      'Recommended for Continuation',
      'Recommended for Non-Continuation',
      'For Certificate',
    ].includes(s);
  }, [activeRenewal]);

  const processTimeline = useMemo(
    () => dashboardData?.process_timeline || [],
    [dashboardData?.process_timeline]
  );

  const currentPeriodString = useMemo(() => {
    if (isRenewalActive && activeRenewal?.academic_period) {
      return activeRenewal.academic_period;
    }
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
  }, [isRenewalActive, activeRenewal, currentAcademicPeriod]);

  // -------------------------------------------------------------
  // FIVE-STAGE STATUS LOGIC (EXACTLY 5 STAGES)
  // -------------------------------------------------------------
  const stages: ProgressStage[] = useMemo(() => {
    // If an active scholarship renewal exists, elevate progress card to Renewal Lifecycle
    if (isRenewalActive && activeRenewal) {
      const renStatus = activeRenewal.renewal_status;
      const isReviewDone = [
        'For Evaluation',
        'Recommended for Continuation',
        'Recommended for Non-Continuation',
        'For Certificate',
        'Completed',
      ].includes(renStatus);
      const isReviewCurrent = [
        'For Review',
        'Under Review',
        'For Compliance',
        'Returned',
      ].includes(renStatus);

      const isEvalDone = [
        'Recommended for Continuation',
        'Recommended for Non-Continuation',
        'For Certificate',
        'Completed',
      ].includes(renStatus);
      const isEvalCurrent = renStatus === 'For Evaluation';

      const isDecisionDone = ['For Certificate', 'Completed'].includes(renStatus);
      const isDecisionCurrent = [
        'Recommended for Continuation',
        'Recommended for Non-Continuation',
      ].includes(renStatus);

      const isCertDone = renStatus === 'Completed';
      const isCertCurrent = renStatus === 'For Certificate';

      const submittedDate = formatDate(activeRenewal.submitted_at);

      return [
        {
          id: 1,
          label: 'Submitted',
          title: 'Renewal Submitted',
          description: 'Renewal application and academic records submitted.',
          date: submittedDate,
          state: 'completed',
        },
        {
          id: 2,
          label: 'Review',
          title: 'Document & Secretariat Review',
          description: 'Secretariat verification of applicant credentials and eligibility.',
          date: isReviewDone || isReviewCurrent ? submittedDate : null,
          state: isReviewDone ? 'completed' : isReviewCurrent ? 'current' : 'upcoming',
          evaluatorName: activeRenewal.coordinator_name || null,
        },
        {
          id: 3,
          label: 'SSC Eval',
          title: 'SSC Evaluation',
          description: 'Scholarship Selection Committee review and continuation evaluation.',
          date: null,
          state: isEvalDone ? 'completed' : isEvalCurrent ? 'current' : 'upcoming',
          evaluatorName: activeRenewal.evaluator_name || null,
        },
        {
          id: 4,
          label: 'Continuation',
          title: 'Continuation Decision',
          description: 'Committee determination on scholarship retention and renewal continuation.',
          date: null,
          state: isDecisionDone ? 'completed' : isDecisionCurrent ? 'current' : 'upcoming',
        },
        {
          id: 5,
          label: 'Certificate',
          title: 'Renewal Certificate',
          description: 'Official municipal scholarship renewal certificate processing and issuance.',
          date: null,
          state: isCertDone ? 'completed' : isCertCurrent ? 'current' : 'upcoming',
        },
      ];
    }

    return computeScholarshipStages(
      scholar,
      application,
      processTimeline,
      grantOverview,
      dashboardData?.latest_update?.timestamp,
      grantReleases,
      dashboardData
    );
  }, [isRenewalActive, activeRenewal, scholar, application, processTimeline, grantReleases, grantOverview, dashboardData]);

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
    if (scholar?.scholar_status === 'Active' || scholar?.scholar_status === 'For Renewal') {
      if (isRenewalActive && activeRenewal) {
        const renStatus = activeRenewal.renewal_status;
        if (renStatus === 'For Review' || renStatus === 'Under Review') {
          return {
            label: 'Under Review',
            description: 'Scholarship renewal application is currently under coordinator review.',
            dotColor: '#7E22CE',
            textColor: isDarkMode ? '#C084FC' : '#7E22CE',
            badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
            badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
          };
        }
        if (renStatus === 'For Evaluation') {
          return {
            label: 'SSC Evaluation',
            description: 'Renewal scheduled for Scholarship Selection Committee continuation evaluation.',
            dotColor: '#7E22CE',
            textColor: isDarkMode ? '#C084FC' : '#7E22CE',
            badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
            badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
          };
        }
        if (renStatus === 'For Compliance' || renStatus === 'Returned') {
          return {
            label: 'For Compliance',
            description: 'Action required: additional requirements or clarification needed for renewal.',
            dotColor: '#D97706',
            textColor: isDarkMode ? '#FBBF24' : '#D97706',
            badgeBg: isDarkMode ? '#451A03' : '#FEF3C7',
            badgeBorder: isDarkMode ? '#B45309' : '#FDE68A',
          };
        }
        if (renStatus === 'Recommended for Continuation') {
          return {
            label: 'Recommended',
            description: 'Scholarship renewal recommended for continuation by the SSC.',
            dotColor: '#16A34A',
            textColor: isDarkMode ? '#4ADE80' : '#16A34A',
            badgeBg: isDarkMode ? '#064E3B' : '#DCFCE7',
            badgeBorder: isDarkMode ? '#059669' : '#86EFAC',
          };
        }
        if (renStatus === 'Recommended for Non-Continuation') {
          return {
            label: 'Non-Continuation',
            description: 'Scholarship renewal evaluated for non-continuation.',
            dotColor: '#DC2626',
            textColor: isDarkMode ? '#F87171' : '#DC2626',
            badgeBg: isDarkMode ? '#3B1D28' : '#FEF2F2',
            badgeBorder: isDarkMode ? '#991B1B' : '#FCA5A5',
          };
        }
        if (renStatus === 'For Certificate') {
          return {
            label: 'For Certificate',
            description: 'Renewal Certificate of Scholarship is being processed.',
            dotColor: '#7E22CE',
            textColor: isDarkMode ? '#C084FC' : '#7E22CE',
            badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
            badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
          };
        }
        return {
          label: renStatus,
          description: 'Scholarship renewal application in progress.',
          dotColor: '#7E22CE',
          textColor: isDarkMode ? '#C084FC' : '#7E22CE',
          badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
          badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
        };
      }

      if (
        stages[4].state === 'current' &&
        stages[4].subLabel &&
        stages[4].subLabel !== 'No Application' &&
        stages[4].subLabel !== 'Pending'
      ) {
        return {
          label: stages[4].subLabel,
          description: stages[4].description || 'Scholarship grant verification in progress.',
          dotColor: '#7E22CE',
          textColor: isDarkMode ? '#C084FC' : '#7E22CE',
          badgeBg: isDarkMode ? '#3B0764' : '#F3E8FF',
          badgeBorder: isDarkMode ? '#7E22CE' : '#E9D5FF',
        };
      }

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
      if (s === 'Approved' || s === 'Post-Approval' || s === 'Completed') {
        return {
          label: s === 'Completed' ? 'Completed' : 'Approved',
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
  }, [isWithdrawn, isDisapproved, isRenewalActive, activeRenewal, scholar, application, stages, isDarkMode]);


  // -------------------------------------------------------------
  // SCHOLARSHIP HISTORY / RECORDS
  // -------------------------------------------------------------
  const historyList: HistoryItem[] = useMemo(() => {
    const list: HistoryItem[] = [];
    const seenCodes = new Set<string>();
    const seenGrantPeriods = new Set<string>();

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
      let recordType: 'Application' | 'Renewal' | 'Grant' = 'Application';
      if (item.type === 'Scholarship Renewal') recordType = 'Renewal';
      else if (item.type === 'Scholarship Grant') recordType = 'Grant';

      const itemPeriod = cleanAcademicPeriod(item.details?.academic_period);

      // Deduplicate grant records by academic period
      if (recordType === 'Grant') {
        if (seenGrantPeriods.has(itemPeriod)) continue;
        seenGrantPeriods.add(itemPeriod);
      }

      if (code && seenCodes.has(code)) continue;
      if (code) seenCodes.add(code);

      const isCurrent: boolean =
        Boolean(currentPeriodString) &&
        Boolean(
          (item.details as any)?.is_current ||
            (currentAcademicPeriod?.academic_year &&
              itemPeriod.includes(currentAcademicPeriod.academic_year)) ||
            (code && scholar?.scholar_code && code === scholar.scholar_code) ||
            (code && application?.application_code && code === application.application_code) ||
            (code && activeRenewal?.renewal_code && code === activeRenewal.renewal_code)
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
      // Never default unsubmitted drafts to 'Under Review'
      if (
        item.status?.trim().toLowerCase() === 'draft' ||
        rawStatus.trim().toLowerCase() === 'draft' ||
        (recordType === 'Grant' &&
          grantOverview?.application &&
          (code === grantOverview.application.grant_application_code || item.id === `GRA-${grantOverview.application.grant_application_id}`) &&
          grantOverview.application.grant_status?.toLowerCase() === 'draft')
      ) {
        recordStatus = 'Draft';
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
      const relIdentifier = rel.release_code || (rel.grant_release_id ? `REL-${rel.grant_release_id}` : null);
      if (rel.release_code && seenCodes.has(rel.release_code)) continue;
      if (relIdentifier && seenCodes.has(relIdentifier)) continue;

      const rawRelPeriod = rel.academic_term
        ? `AY ${rel.academic_year} • ${rel.academic_term}`
        : `AY ${rel.academic_year}`;
      const relPeriod = cleanAcademicPeriod(rawRelPeriod);

      // If a grant item for this period was already added, consolidate and skip
      if (seenGrantPeriods.has(relPeriod)) continue;
      seenGrantPeriods.add(relPeriod);

      if (rel.release_code) seenCodes.add(rel.release_code);
      if (relIdentifier) seenCodes.add(relIdentifier);

      const isCurrent =
        Boolean(currentPeriodString) &&
        rel.academic_year === currentAcademicPeriod?.academic_year &&
        rel.academic_term === currentAcademicPeriod?.term;

      const releasedDate = rel.components?.[0]?.released_at || null;
      const rawTime = releasedDate ? new Date(releasedDate).getTime() : 0;

      list.push({
        id: `release-${rel.release_code || rel.grant_release_id}`,
        academicPeriod: relPeriod,
        isCurrent,
        recordType: 'Grant',
        status: rel.release_status,
        date: formatDate(releasedDate),
        referenceCode: rel.release_code || (rel.grant_release_id ? `REL-${rel.grant_release_id}` : null),
        timestamp: isNaN(rawTime) ? 0 : rawTime,
      });
    }

    // 3. Map active grant application if not already captured
    if (grantOverview?.has_existing_application && grantOverview.application) {
      const gApp = grantOverview.application;
      const gCode = gApp.grant_application_code || `GRA-${gApp.grant_application_id || 'ACTIVE'}`;
      const rawGPeriod = gApp.academic_year && gApp.academic_term
        ? `AY ${gApp.academic_year} • ${gApp.academic_term}`
        : gApp.academic_year
        ? `AY ${gApp.academic_year}`
        : currentPeriodString;
      const gPeriod = cleanAcademicPeriod(rawGPeriod);

      // Consolidate: only add standalone grant application if NO release/grant exists for this cycle
      if (!seenCodes.has(gCode) && !seenGrantPeriods.has(gPeriod)) {
        seenCodes.add(gCode);
        seenGrantPeriods.add(gPeriod);
        list.push({
          id: `grant-app-${gCode}`,
          rawId: gApp.grant_application_id,
          academicPeriod: gPeriod,
          isCurrent: true,
          recordType: 'Grant',
          status: gApp.grant_status || 'Draft',
          date: formatDate(gApp.submitted_at || gApp.created_at),
          referenceCode: gCode,
          timestamp: gApp.submitted_at ? new Date(gApp.submitted_at).getTime() : Date.now(),
        });
      }
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
  }, [trackedItems, grantReleases, scholar, application, activeRenewal, currentPeriodString, currentAcademicPeriod]);

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
                {isRenewalActive ? 'CURRENT SCHOLARSHIP RENEWAL' : 'CURRENT SCHOLARSHIP'}
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

              {((isRenewalActive && activeRenewal?.renewal_code) || scholar?.scholar_code || application?.application_code) ? (
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
                    ID: {isRenewalActive && activeRenewal?.renewal_code ? activeRenewal.renewal_code : (scholar?.scholar_code || application?.application_code)}
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
                    {stages.map((stg, idx) => {
                      const isCompleted = stg.state === 'completed';
                      const isCurrent = stg.state === 'current';
                      const prevCompleted = idx > 0 && stages[idx - 1].state === 'completed';
                      const iconName = getStageIcon(stg.id, isRenewalActive, stg.state);
                      const iconColor = isCompleted || isCurrent ? '#FFFFFF'
                        : isDarkMode ? '#475569' : '#CBD5E1';
                      return (
                        <React.Fragment key={stg.id}>
                          {idx > 0 && (
                            <View
                              style={[
                                styles.stageConnector,
                                prevCompleted && isCompleted && styles.stageConnectorCompleted,
                                prevCompleted && isCurrent && styles.stageConnectorCurrent,
                                isDarkMode && !prevCompleted && { backgroundColor: '#1E293B' },
                              ]}
                            />
                          )}
                          <View
                            style={[
                              styles.compactStepSegment,
                              isCompleted && styles.compactStepSegmentCompleted,
                              isCurrent && [
                                styles.compactStepSegmentCurrent,
                                isDarkMode && { backgroundColor: '#9333EA' },
                              ],
                              isDarkMode && !isCompleted && !isCurrent && { backgroundColor: '#1E293B' },
                            ]}
                          >
                            <Ionicons name={iconName as any} size={14} color={iconColor} />
                          </View>
                        </React.Fragment>
                      );
                    })}
                  </View>
                  <View style={styles.stageMetaContainer}>
                    {/* Row 1: Stage Counter & Status Pill */}
                    <View style={styles.stageHeaderRow}>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.stageCounterText,
                            isDarkMode && { color: '#94A3B8' },
                          ]}
                        >
                          Stage {currentStageIndex + 1} of {stages.length}
                        </Text>
                        <Text
                          style={[
                            styles.stageNameHighlight,
                            isDarkMode && { color: '#C084FC' },
                          ]}
                          numberOfLines={2}
                        >
                          {stages[currentStageIndex]?.title || stages[currentStageIndex]?.label || 'Scholarship Grant'}
                        </Text>
                      </View>
                      {stages[currentStageIndex]?.state === 'completed' ? (
                        <View
                          style={[
                            styles.completedMiniPill,
                            isDarkMode && {
                              backgroundColor: '#064E3B',
                              borderColor: '#065F46',
                            },
                          ]}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color={isDarkMode ? '#4ADE80' : '#15803d'}
                          />
                          <Text
                            style={[
                              styles.completedMiniPillText,
                              isDarkMode && { color: '#4ADE80' },
                            ]}
                          >
                            Completed
                          </Text>
                        </View>
                      ) : (
                        <View
                          style={[
                            styles.inProgressMiniPill,
                            isDarkMode && {
                              backgroundColor: '#3B0764',
                              borderColor: '#6B21A8',
                            },
                          ]}
                        >
                          <Ionicons
                            name="time"
                            size={12}
                            color={isDarkMode ? '#C084FC' : '#7E22CE'}
                          />
                          <Text
                            style={[
                              styles.inProgressMiniPillText,
                              isDarkMode && { color: '#C084FC' },
                            ]}
                          >
                            In Progress
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Row 2: Evaluator Information */}
                    {!!(
                      stages[currentStageIndex]?.evaluatorName ||
                      (currentStageIndex >= 1 && (stages[2]?.evaluatorName || stages[1]?.evaluatorName))
                    ) && (
                      <View style={styles.evaluatorRow}>
                        <Ionicons
                          name="person-circle-outline"
                          size={13}
                          color={isDarkMode ? '#A855F7' : '#64748b'}
                        />
                        <Text
                          style={[
                            styles.evaluatorText,
                            isDarkMode && { color: '#94A3B8' },
                          ]}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          Evaluated by:{' '}
                          <Text
                            style={[
                              styles.evaluatorNameBold,
                              isDarkMode && { color: '#E2E8F0' },
                            ]}
                          >
                            {stages[currentStageIndex]?.evaluatorName ||
                              stages[2]?.evaluatorName ||
                              stages[1]?.evaluatorName}
                          </Text>
                        </Text>
                      </View>
                    )}
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
                              styles.historyStatusBadge,
                              {
                                backgroundColor: colors.badgeBg,
                                borderColor: colors.badgeBorder,
                              },
                            ]}
                          >
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
                          </View>
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
                                // NOTE: Do NOT pass status here — CitizenScholarshipDetailScreen
                                // must derive status from the live API (fetchCitizenDashboard),
                                // not from a stale cached list-item value.
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
      {/* 1. FULL PROGRESS DETAILED TIMELINE MODAL                      */}
      {/* ============================================================== */}
      <ScholarshipProgressModal
        visible={progressModalVisible}
        onClose={() => setProgressModalVisible(false)}
        isDarkMode={isDarkMode}
        stages={stages}
        scholarship={scholarship}
        currentPeriodString={currentPeriodString}
        isWithdrawn={isWithdrawn}
        isDisapproved={isDisapproved}
        withdrawalDate={withdrawalDate}
        withdrawalReason={withdrawalReason}
        application={application}
        disapprovalCategory={disapprovalCategory}
        disapprovalRemarks={disapprovalRemarks}
        disapprovalDate={disapprovalDate}
      />

      {/* ============================================================== */}
      {/* 2. IN-APP DOCUMENT VIEWER MODAL                                */}
      {/* ============================================================== */}
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

      {/* ============================================================== */}
      {/* 3. PER-RECORD OFFICIAL DOCUMENTS MODAL                         */}
      {/* ============================================================== */}
      <RecordOfficialDocumentsModal
        visible={docsModalVisible}
        onClose={() => setDocsModalVisible(false)}
        isDarkMode={isDarkMode}
        selectedRecord={selectedRecordForDocs}
        officialDocs={modalDocsForSelectedRecord}
        actionLoadingKey={actionLoadingKey}
        onDocAction={handleOfficialDocAction}
      />

      {/* ============================================================== */}
      {/* 4. DOCUMENT ACTION FEEDBACK / PREVIEW MODAL                    */}
      {/* ============================================================== */}
      <DocumentActionFeedbackModal
        visible={feedbackModalVisible}
        onClose={() => setFeedbackModalVisible(false)}
        isDarkMode={isDarkMode}
        title={feedbackTitle}
        body={feedbackBody}
        feedbackData={{ title: feedbackTitle, body: feedbackBody }}
      />
    </ScrollView>
  );
}

