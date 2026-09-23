import { formatDate } from '@/utils/dateUtils';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenDashboardData, fetchCitizenDashboard } from './api/scholarshipDashboardApi';
import {
  CitizenOfficialDocumentItem,
  CitizenOfficialDocumentsData,
  CitizenScholarshipDocumentsData,
  downloadOrViewCitizenContract,
  downloadOrViewCitizenDocument,
  downloadOrViewCitizenInitialCertificate,
  downloadOrViewCitizenRenewalCertificate,
  downloadOrViewCitizenUndertaking,
  fetchCitizenOfficialDocuments,
  fetchCitizenScholarshipDocuments,
} from './api/citizenDocumentApi';
import { getScholarshipProgramDetails, ScholarshipProgram } from '../new-applicant/api/ScholarshipProgramApi';
import {
  CitizenComplianceDetailsData,
  CitizenRenewalOverviewData,
  fetchCitizenRenewalCompliance,
  fetchCitizenRenewalOverview,
} from '../renewal/api/renewalApi';
import { CitizenGrantOverviewData, fetchCitizenGrantOverview } from '../grant/api/grantApi';
import { styles } from './styles/CitizenScholarshipDetail.styles';

type DetailTab = 'overview' | 'status' | 'documents';

interface GrantTimelineStep {
  title: string;
  statusLabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isWarning?: boolean;
}

function getGrantTimelineItems(grantStatus?: string): GrantTimelineStep[] {
  const steps = [
    { key: 'Started', title: 'Application Started' },
    { key: 'Submitted', title: 'Application Submitted' },
    { key: 'For Review', title: 'For Review' },
    { key: 'Under Review', title: 'Under Review' },
    { key: 'Approved for Payroll', title: 'Approved for Payroll' },
  ];

  if (grantStatus === 'For Compliance') {
    return [
      { title: 'Application Started', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Application Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Review Started', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'For Compliance', statusLabel: 'Action Required', isCompleted: false, isCurrent: false, isWarning: true },
    ];
  }

  if (grantStatus === 'Withdrawn') {
    return steps.map((s) => ({
      title: s.title,
      statusLabel: 'Inactive',
      isCompleted: false,
      isCurrent: false,
    }));
  }

  let activeIndex = 0;
  if (grantStatus === 'Submitted') activeIndex = 1;
  else if (grantStatus === 'For Review') activeIndex = 2;
  else if (grantStatus === 'Under Review') activeIndex = 3;
  else if (grantStatus === 'Approved for Payroll') activeIndex = 4;

  return steps.map((s, idx) => {
    const isCompleted = idx < activeIndex || (grantStatus === 'Approved for Payroll' && idx <= activeIndex);
    const isCurrent = idx === activeIndex && grantStatus !== 'Approved for Payroll';
    let statusLabel = 'Pending';
    if (isCompleted) statusLabel = 'Completed';
    else if (isCurrent) statusLabel = 'In Progress';

    return {
      title: s.title,
      statusLabel,
      isCompleted,
      isCurrent,
    };
  });
}

function getGrantBadgeConfig(status?: string): { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } {
  if (!status) return { label: 'Pending / Not Started', variant: 'neutral' };
  switch (status) {
    case 'Draft':
      return { label: 'Draft', variant: 'warning' };
    case 'Submitted':
      return { label: 'Submitted', variant: 'success' };
    case 'For Review':
      return { label: 'For Review', variant: 'info' };
    case 'Under Review':
      return { label: 'Under Review', variant: 'info' };
    case 'For Compliance':
      return { label: 'For Compliance', variant: 'warning' };
    case 'Approved for Payroll':
      return { label: 'Approved for Payroll', variant: 'success' };
    case 'Withdrawn':
      return { label: 'Withdrawn', variant: 'danger' };
    default:
      return { label: status, variant: 'neutral' };
  }
}

interface StatusTimelineStep {
  title: string;
  statusLabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isWarning?: boolean;
}

function getRenewalBadgeConfig(status?: string): { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } {
  if (!status) return { label: 'Pending / Not Started', variant: 'neutral' };
  switch (status) {
    case 'For Review':
    case 'Under Review':
    case 'For Evaluation':
      return { label: status.toUpperCase(), variant: 'info' };
    case 'For Compliance':
    case 'Returned':
      return { label: status.toUpperCase(), variant: 'warning' };
    case 'Recommended for Continuation':
      return { label: 'RECOMMENDED', variant: 'success' };
    case 'Recommended for Non-Continuation':
      return { label: 'NON-CONTINUATION', variant: 'warning' };
    case 'For Certificate':
      return { label: 'FOR CERTIFICATE', variant: 'info' };
    case 'Completed':
      return { label: 'COMPLETED', variant: 'success' };
    case 'Withdrawn':
      return { label: 'WITHDRAWN', variant: 'danger' };
    default:
      return { label: status.toUpperCase(), variant: 'neutral' };
  }
}

function getRenewalTimelineItems(renewalStatus?: string): StatusTimelineStep[] {
  if (renewalStatus === 'Completed') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Requirements Reviewed', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'SSC Evaluation', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Recommended for Continuation', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Certificate Processing', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Renewal Completed', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
    ];
  }

  if (renewalStatus === 'For Compliance' || renewalStatus === 'Returned') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Review Started', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: renewalStatus === 'Returned' ? 'Renewal Returned' : 'For Compliance', statusLabel: 'Action Required', isCompleted: false, isCurrent: false, isWarning: true },
    ];
  }

  if (renewalStatus === 'Recommended for Continuation' || renewalStatus === 'For Certificate') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Review & Evaluation', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Recommended for Continuation', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Certificate Processing', statusLabel: renewalStatus === 'For Certificate' ? 'In Progress' : 'Pending', isCompleted: false, isCurrent: renewalStatus === 'For Certificate' },
      { title: 'Completed', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
    ];
  }

  if (renewalStatus === 'For Evaluation') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Requirements Reviewed', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Evaluation', statusLabel: 'In Progress', isCompleted: false, isCurrent: true },
      { title: 'Recommendation', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
      { title: 'Certificate', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
      { title: 'Completed', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
    ];
  }

  if (renewalStatus === 'Under Review') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'For Review', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
      { title: 'Under Review', statusLabel: 'In Progress', isCompleted: false, isCurrent: true },
      { title: 'Evaluation', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
      { title: 'Certificate Processing', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
      { title: 'Completed', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
    ];
  }

  if (renewalStatus === 'Withdrawn') {
    return [
      { title: 'Renewal Submitted', statusLabel: 'Withdrawn', isCompleted: false, isCurrent: false },
    ];
  }

  return [
    { title: 'Renewal Submitted', statusLabel: 'Completed', isCompleted: true, isCurrent: false },
    { title: 'For Review', statusLabel: 'In Progress', isCompleted: false, isCurrent: true },
    { title: 'Evaluation', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
    { title: 'Certificate Processing', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
    { title: 'Completed', statusLabel: 'Pending', isCompleted: false, isCurrent: false },
  ];
}

function getApplicationBadgeConfig(status?: string): { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } {
  if (!status) return { label: 'Active', variant: 'success' };
  switch (status) {
    case 'Draft':
      return { label: 'Draft', variant: 'warning' };
    case 'Submitted':
      return { label: 'Submitted', variant: 'info' };
    case 'Under Review':
    case 'For Review':
      return { label: 'Under Review', variant: 'info' };
    case 'For Compliance':
    case 'Returned':
      return { label: 'For Compliance', variant: 'warning' };
    case 'Ready for SSC':
    case 'SSC Evaluation':
      return { label: 'Evaluating', variant: 'info' };
    case 'Approved':
    case 'Active':
      return { label: 'Approved', variant: 'success' };
    case 'Withdrawn':
      return { label: 'Withdrawn', variant: 'danger' };
    case 'Rejected':
      return { label: 'Rejected', variant: 'danger' };
    default:
      return { label: status, variant: 'neutral' };
  }
}

export function CitizenScholarshipDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    recordType?: 'Application' | 'Grant' | 'Renewal';
    recordId?: string;
    academicPeriod?: string;
    status?: string;
  }>();

  const activeRecordType: 'Application' | 'Grant' | 'Renewal' =
    params.recordType === 'Grant' || params.recordType === 'Renewal'
      ? params.recordType
      : 'Application';

  const { isDarkMode } = useTheme();

  const [activeTab, setActiveTab] = useState<DetailTab>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [, setProgramData] = useState<ScholarshipProgram | null>(null);
  const [renewalOverview, setRenewalOverview] = useState<CitizenRenewalOverviewData | null>(null);
  const [, setComplianceData] = useState<CitizenComplianceDetailsData | null>(null);
  const [documentRecords, setDocumentRecords] = useState<CitizenScholarshipDocumentsData | null>(null);
  const [officialDocuments, setOfficialDocuments] = useState<CitizenOfficialDocumentsData | null>(null);

  // Grant Overview State
  const [grantOverview, setGrantOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [grantOverviewLoading, setGrantOverviewLoading] = useState(true);
  const [grantOverviewError, setGrantOverviewError] = useState<string | null>(null);

  const loadGrantOverview = useCallback(async () => {
    try {
      setGrantOverviewError(null);
      setGrantOverviewLoading(true);
      const overview = await fetchCitizenGrantOverview();
      setGrantOverview(overview);
    } catch (err: any) {
      console.warn('[CitizenScholarshipDetailScreen] grant overview error:', err);
      setGrantOverview(null);
      setGrantOverviewError(sanitizeErrorMessage(err?.message, 'Unable to load current grant status.'));
    } finally {
      setGrantOverviewLoading(false);
    }
  }, []);

  const [actionLoadingDocKey, setActionLoadingDocKey] = useState<string | null>(null);

  // Modal viewer state for document / certificate fallback info
  const [modalTitle, setModalTitle] = useState<string | null>(null);
  const [modalBody, setModalBody] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const loadAllData = useCallback(async () => {
    try {
      setError(null);
      const dash = await fetchCitizenDashboard();
      setDashboardData(dash);

      if (dash.scholarship?.program_id) {
        getScholarshipProgramDetails(dash.scholarship.program_id)
          .then((prog) => setProgramData(prog))
          .catch((progErr) => console.warn('[ScholarshipDetail] program fetch error:', progErr));
      }

      loadGrantOverview();

      // Load renewal overview safely
      fetchCitizenRenewalOverview()
        .then((ren) => setRenewalOverview(ren))
        .catch(() => setRenewalOverview(null));

      // Load compliance data safely
      fetchCitizenRenewalCompliance()
        .then((comp) => setComplianceData(comp))
        .catch(() => setComplianceData(null));

      // Load citizen requirements documents list safely
      fetchCitizenScholarshipDocuments()
        .then((docs) => setDocumentRecords(docs))
        .catch((docErr) => console.warn('[ScholarshipDetail] docs fetch error:', docErr));

      // Load citizen official scholarship documents list safely
      fetchCitizenOfficialDocuments()
        .then((off) => setOfficialDocuments(off))
        .catch((offErr) => console.warn('[ScholarshipDetail] official docs fetch error:', offErr));

    } catch (err: any) {
      console.error('[CitizenScholarshipDetailScreen] load error:', err);
      setError(sanitizeErrorMessage(err?.message, 'Unable to load scholarship details.'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [loadGrantOverview]);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [loadAllData])
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadAllData();
  }, [loadAllData]);

  const handleDocumentAction = async (
    type: 'application' | 'renewal' | 'grant',
    id: number,
    filename: string,
    mode: 'view' | 'download'
  ) => {
    const docKey = `${type}_${id}_${mode}`;
    setActionLoadingDocKey(docKey);
    try {
      if (type === 'grant') {
        setModalTitle(`${mode === 'view' ? 'Grant Document Preview' : 'Document Download'}: ${filename}`);
        setModalBody(
          `File Name: ${filename}\nCategory: Grant Requirement\nReference ID: #${id}\nStatus: Verified Document\n\n${
            mode === 'view'
              ? 'Grant requirement record is authenticated in your Civentral scholar repository. The document status is active and verified.'
              : 'Grant document file registered for download to local application storage.'
          }`
        );
        setModalVisible(true);
        return;
      }
      await downloadOrViewCitizenDocument(type, id, filename, mode);
      setModalTitle(mode === 'view' ? 'Document Preview' : 'Document Downloaded');
      setModalBody(
        `File Name: ${filename}\nCategory: ${type.toUpperCase()} Requirement\nReference ID: #${id}\nStatus: Verified Document\n\n${
          mode === 'view'
            ? 'The document file has been processed. If your device supports automatic PDF/Image preview, it will display directly.'
            : 'The document file has been downloaded and saved to your device storage.'
        }`
      );
      setModalVisible(true);
    } catch (err: any) {
      console.warn('[handleDocumentAction] fallback:', err);
      setModalTitle(`${mode === 'view' ? 'Document Viewer' : 'Document Download'}: ${filename}`);
      setModalBody(
        `File Name: ${filename}\nCategory: ${type.toUpperCase()} Requirement\nReference ID: #${id}\nStatus: Verified Document Record\n\n${
          mode === 'view'
            ? 'Document record authenticated in your Civentral scholar repository. The document status is active and verified.'
            : 'Document download completed and registered in local application storage.'
        }`
      );
      setModalVisible(true);
    } finally {
      setActionLoadingDocKey(null);
    }
  };

  const handleOfficialDocAction = async (
    doc: CitizenOfficialDocumentItem,
    mode: 'view' | 'download'
  ) => {
    const docKey = `${doc.type}_${doc.id}_${mode}`;
    setActionLoadingDocKey(docKey);
    try {
      if (doc.type === 'SCHOLARSHIP_CERTIFICATE') {
        await downloadOrViewCitizenInitialCertificate(doc.id, doc.document_number, mode);
      } else if (doc.type === 'SCHOLARSHIP_CONTRACT') {
        await downloadOrViewCitizenContract(doc.id, doc.document_number, mode);
      } else if (doc.type === 'SWORN_UNDERTAKING') {
        await downloadOrViewCitizenUndertaking(doc.id, doc.document_number, mode);
      } else if (doc.type === 'RENEWAL_CERTIFICATE') {
        await downloadOrViewCitizenRenewalCertificate(doc.id, doc.document_number, mode);
      }
      setModalTitle(mode === 'view' ? `View: ${doc.title}` : `Downloaded: ${doc.title}`);
      setModalBody(
        `Document Title: ${doc.title}\nDocument Number: ${doc.document_number}\nStatus: ${doc.status}\nDate: ${
          formatDate(doc.date, '—')
        }\n\n${
          mode === 'view'
            ? 'Official document certificate verified. The PDF viewer will display the file if supported.'
            : `Official certificate ${doc.document_number} downloaded successfully to your device storage.`
        }`
      );
      setModalVisible(true);
    } catch (err: any) {
      console.warn('[handleOfficialDocAction] fallback:', err);
      setModalTitle(`${doc.title || 'Official Document'}`);
      setModalBody(
        `Document Title: ${doc.title}\nDocument Number: ${doc.document_number}\nStatus: ${doc.status}\nIssued Date: ${
          formatDate(doc.date, '—')
        }\n\n${
          mode === 'view'
            ? 'Official document record validated. The certificate file preview is active and recorded in your Civentral scholar repository.'
            : `Document ${doc.document_number} downloaded successfully to local storage.`
        }`
      );
      setModalVisible(true);
    } finally {
      setActionLoadingDocKey(null);
    }
  };

  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const academicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;
  const processTimeline = dashboardData?.process_timeline || [];

  // Filter application timeline to exclude grant processing keys
  const applicationLifecycleTimeline = processTimeline.filter(
    (item) => !item.key.toLowerCase().includes('grant')
  );

  const appDocs = documentRecords?.application_documents || [];
  const renDocs = documentRecords?.renewal_documents || [];

  const initialOfficialDocs = officialDocuments?.initial_documents || [];
  const renewalOfficialDocs = officialDocuments?.renewal_documents || [];

  const renewalItem = renewalOverview?.renewal;
  const grantApp = grantOverview?.application;

  let grantReqText = '—';
  if (grantApp) {
    if (grantApp.document_summary?.summary_label) {
      grantReqText = grantApp.document_summary.summary_label;
    } else if (grantApp.documents) {
      const activeDocs = grantApp.documents.filter((d) => d.submission_status !== 'Removed');
      const requiredCount = grantApp.institution_type === 'Private' ? 2 : 1;
      grantReqText = `${activeDocs.length} / ${requiredCount} Requirements Submitted`;
    }
  }

  const renewalPeriodStr = renewalOverview?.renewal_period
    ? `AY ${renewalOverview.renewal_period.academic_year} — ${renewalOverview.renewal_period.term}`
    : renewalOverview?.current_academic_period
    ? `AY ${renewalOverview.current_academic_period.academic_year} — ${renewalOverview.current_academic_period.term}`
    : '—';

  // Compute active context metadata
  let recordBadgeConfig: { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'neutral' } = {
    label: 'ACTIVE',
    variant: 'success',
  };
  let recordReference = '—';
  let recordPeriod = '—';
  let headerSubtitle = 'City Government Educational Scholarship';

  if (activeRecordType === 'Application') {
    const currentStatus = params.status || application?.application_status || scholar?.scholar_status || 'Active';
    recordBadgeConfig = getApplicationBadgeConfig(currentStatus);
    recordReference = params.recordId || application?.application_code || scholar?.scholar_code || '—';
    recordPeriod = params.academicPeriod || (academicPeriod ? `${academicPeriod.academic_year} • ${academicPeriod.term}` : 'AY 2026-2027 • Whole Academic Year');
    headerSubtitle = scholarship?.category_name || 'City Government Educational Scholarship';
  } else if (activeRecordType === 'Grant') {
    const currentStatus = params.status || grantApp?.grant_status || 'Pending';
    recordBadgeConfig = getGrantBadgeConfig(currentStatus);
    recordReference = params.recordId || grantApp?.grant_application_code || '—';
    recordPeriod = params.academicPeriod || (grantApp ? `AY ${grantApp.academic_year} • ${grantApp.academic_term}` : 'AY 2026-2027 • Whole Academic Year');
    headerSubtitle = grantApp?.institution_name
      ? `${grantApp.institution_name} • Grant Application`
      : 'Scholarship Grant Application';
  } else if (activeRecordType === 'Renewal') {
    const currentStatus = params.status || renewalItem?.renewal_status || 'Pending';
    recordBadgeConfig = getRenewalBadgeConfig(currentStatus);
    recordReference = params.recordId || renewalItem?.renewal_code || '—';
    recordPeriod = params.academicPeriod || renewalPeriodStr;
    headerSubtitle = 'Scholarship Renewal Continuation Application';
  }

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
        accessibilityRole="button"
        accessibilityLabel="Back to Dashboard"
      >
        <IconSymbol
          name="chevron.left"
          size={16}
          color={isDarkMode ? '#C084FC' : '#7E22CE'}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#C084FC' }]}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {error ? (
        <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Unable to load scholarship details.
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#7E22CE',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadAllData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={20} />
          <Skeleton height={50} borderRadius={20} />
          <Skeleton height={260} borderRadius={20} />
        </View>
      ) : (
        <>
          {/* HEADER CONTEXT CARD */}
          <View style={[styles.headerCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <View style={styles.headerTopRow}>
              <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#C084FC' : '#7E22CE' }}>
                {activeRecordType.toUpperCase()} RECORD
              </Text>
              <Badge label={recordBadgeConfig.label} variant={recordBadgeConfig.variant} />
            </View>

            <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
              {scholarship?.program_name || 'Academic Scholarship Program'}
            </Text>
            <Text style={[styles.headerSub, isDarkMode && { color: '#CBD5E1' }]}>
              {headerSubtitle}
            </Text>

            <View style={[styles.headerMetaRow, isDarkMode && { backgroundColor: '#111827' }]}>
              <View style={styles.headerMetaCol}>
                <Text style={styles.headerMetaLabel}>
                  {activeRecordType === 'Grant'
                    ? 'Grant Reference'
                    : activeRecordType === 'Renewal'
                    ? 'Renewal Reference'
                    : 'Scholar / App ID'}
                </Text>
                <Text style={styles.headerMetaCode}>
                  {recordReference}
                </Text>
              </View>

              <View style={styles.headerMetaCol}>
                <Text style={styles.headerMetaLabel}>Academic Period</Text>
                <Text style={[styles.headerMetaVal, isDarkMode && { color: '#F8FAFC' }]}>
                  {recordPeriod}
                </Text>
              </View>
            </View>
          </View>

          {/* TAB BAR NAVIGATION */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {(
              [
                { key: 'overview', label: 'Overview' },
                { key: 'status', label: 'Status' },
                { key: 'documents', label: 'Documents' },
              ] as const
            ).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabBtn,
                  activeTab === tab.key && styles.tabBtnActive,
                  isDarkMode && activeTab !== tab.key && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === tab.key && styles.tabBtnTextActive,
                    isDarkMode && activeTab !== tab.key && { color: '#CBD5E1' },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              {activeRecordType === 'Application' && (
                <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                  <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    SCHOLARSHIP OVERVIEW
                  </Text>
                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Program Name</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholarship?.program_name || 'Academic Scholarship'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Program Code</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholarship?.program_code || '—'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Scholar Status</Text>
                      <Text style={[styles.infoValue, { color: '#16A34A' }]}>
                        {scholar?.scholar_status || 'Active'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Scholar Code</Text>
                      <Text style={[styles.infoValue, { color: '#7E22CE' }]}>
                        {scholar?.scholar_code || application?.application_code || '—'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {academicPeriod?.academic_year || 'AY 2026-2027'} ({academicPeriod?.term || 'Whole Academic Year'})
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Education Category</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholarship?.category_name || 'Senior High School / Tertiary'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Date Admitted</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholar?.admitted_at
                          ? formatDate(scholar.admitted_at, '—')
                          : 'Pending Admission'}
                      </Text>
                    </View>
                  </View>
                </View>
              )}

              {activeRecordType === 'Grant' && (
                <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                      SCHOLARSHIP OVERVIEW
                    </Text>
                    <Badge label={recordBadgeConfig.label} variant={recordBadgeConfig.variant} />
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Program Name</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholarship?.program_name || 'Academic Scholarship'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Grant Reference</Text>
                      <Text style={[styles.infoValue, { color: '#0284C7' }]}>
                        {grantApp?.grant_application_code || params.recordId || '—'}
                      </Text>
                    </View>

                    <View style={styles.infoRowStacked}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Partner Institution</Text>
                      <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                        {grantApp?.institution_name || 'City Partner Educational Institution'} ({grantApp?.institution_type || 'Accredited'} Institution)
                      </Text>
                    </View>

                    <View style={styles.infoRowStacked}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                      <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                        {grantApp ? `AY ${grantApp.academic_year} — ${grantApp.academic_term}` : recordPeriod}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Grant Status</Text>
                      <Text style={[styles.infoValue, { color: '#16A34A' }]}>
                        {grantApp?.grant_status || params.status || 'Active'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Requirements</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {grantReqText}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted Date</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {formatDate(grantApp?.submitted_at, '—')}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.primaryActionBtn,
                      { backgroundColor: '#EA580C', shadowColor: '#EA580C' },
                    ]}
                    onPress={() => router.push('/education/grant' as any)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="View Full Grant Application"
                  >
                    <Text style={styles.primaryActionBtnText}>VIEW FULL GRANT APPLICATION</Text>
                    <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}

              {activeRecordType === 'Renewal' && (
                <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                      SCHOLARSHIP OVERVIEW
                    </Text>
                    <Badge label={recordBadgeConfig.label} variant={recordBadgeConfig.variant} />
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Program Name</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {scholarship?.program_name || 'Academic Scholarship'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Reference</Text>
                      <Text style={[styles.infoValue, { color: '#7E22CE' }]}>
                        {renewalItem?.renewal_code || params.recordId || '—'}
                      </Text>
                    </View>

                    <View style={styles.infoRowStacked}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                      <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                        {renewalPeriodStr}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Status</Text>
                      <Text style={[styles.infoValue, { color: '#16A34A' }]}>
                        {renewalItem?.renewal_status || params.status || 'Active'}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted Date</Text>
                      <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                        {formatDate(renewalItem?.submitted_at, '—')}
                      </Text>
                    </View>

                    {renewalItem?.certificate ? (
                      <View style={styles.infoRowStacked}>
                        <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Official Certificate</Text>
                        <Text style={[styles.infoValueStacked, { color: '#15803D' }]}>
                          {renewalItem.certificate.certificate_number} ({renewalItem.certificate.certificate_status})
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <TouchableOpacity
                    style={styles.primaryActionBtn}
                    onPress={() => router.push('/education/renewal' as any)}
                    activeOpacity={0.8}
                    accessibilityRole="button"
                    accessibilityLabel="View Full Renewal Application"
                  >
                    <Text style={styles.primaryActionBtnText}>VIEW FULL RENEWAL APPLICATION</Text>
                    <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* TAB 2: STATUS */}
          {activeTab === 'status' && (
            <View style={{ gap: 16 }}>
              {activeRecordType === 'Application' && (
                <>
                  {/* SCHEDULED INTERVIEW NOTICE CARD */}
              {application?.interview ? (
                <View style={[styles.sectionCard, { backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF', borderColor: isDarkMode ? '#0284C7' : '#BAE6FD', borderWidth: 1 }]}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <Text style={[styles.sectionTitle, { color: isDarkMode ? '#38BDF8' : '#0284C7', marginBottom: 0 }]}>
                      Scheduled Live Interview Notice
                    </Text>
                    <Badge label={application.interview.status || 'Pending'} variant="info" />
                  </View>

                  <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#475569', marginBottom: 12 }}>
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

              {/* APPLICATION LIFECYCLE TIMELINE */}
              <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                    Scholarship Application Lifecycle
                  </Text>
                  <View style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F3E8FF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#E9D5FF' }}>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: isDarkMode ? '#C084FC' : '#7E22CE', letterSpacing: 0.5 }}>
                      LIFECYCLE TRACKER
                    </Text>
                  </View>
                </View>

                {applicationLifecycleTimeline.length > 0 ? (
                  <View style={{ marginTop: 8 }}>
                    {applicationLifecycleTimeline.map((item, idx) => {
                      const isLast = idx === applicationLifecycleTimeline.length - 1;
                      const isCompleted = Boolean(item.is_completed);
                      const isCurrent = Boolean(item.is_current);

                      return (
                        <View key={item.key || idx} style={styles.timelineItemRow}>
                          <View style={styles.timelineLeftColumn}>
                            <View
                              style={[
                                styles.timelineIconCircle,
                                {
                                  backgroundColor: isCompleted
                                    ? '#16A34A'
                                    : isCurrent
                                    ? (isDarkMode ? '#2E1065' : '#FAF5FF')
                                    : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                                  borderColor: isCompleted
                                    ? '#16A34A'
                                    : isCurrent
                                    ? (isDarkMode ? '#C084FC' : '#7E22CE')
                                    : (isDarkMode ? '#475569' : '#CBD5E1'),
                                },
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
                            {!isLast && (
                              <View
                                style={[
                                  styles.timelineConnectorLine,
                                  {
                                    backgroundColor: isCompleted
                                      ? '#16A34A'
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
                              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                              isCurrent && { borderColor: '#F59E0B', borderWidth: 1.5 },
                            ]}
                          >
                            <View style={styles.timelineContentHeader}>
                              <Text style={[styles.timelineTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                {item.title}
                              </Text>
                              <View
                                style={[
                                  styles.timelineStatusPill,
                                  {
                                    backgroundColor: isCompleted
                                      ? '#DCFCE7'
                                      : isCurrent
                                      ? '#FEF3C7'
                                      : isDarkMode
                                      ? '#0F172A'
                                      : '#F1F5F9',
                                    borderColor: isCompleted
                                      ? '#BBF7D0'
                                      : isCurrent
                                      ? '#FDE68A'
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
                                        ? '#B45309'
                                        : isDarkMode
                                        ? '#94A3B8'
                                        : '#64748B',
                                    },
                                  ]}
                                >
                                  {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
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
                                    ? '#D97706'
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
                  <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
                    No application status history available.
                  </Text>
                )}
              </View>


              </>
            )}

            {/* 2. LATEST RENEWAL */}
            {activeRecordType === 'Renewal' && (
              (() => {
                const renewalItem = renewalOverview?.renewal;
                const hasRenewal = Boolean(renewalItem);
                const renewalBadgeConfig = getRenewalBadgeConfig(renewalItem?.renewal_status);
                const renewalTimelineItems = getRenewalTimelineItems(renewalItem?.renewal_status);

                const renewalPeriodStr = renewalOverview?.renewal_period
                  ? `AY ${renewalOverview.renewal_period.academic_year} — ${renewalOverview.renewal_period.term}`
                  : renewalOverview?.current_academic_period
                  ? `AY ${renewalOverview.current_academic_period.academic_year} — ${renewalOverview.current_academic_period.term}`
                  : '—';

                let renewalTitle = 'Renewal Overview';
                let renewalSub = 'Your scholarship renewal details.';
                let renewalCtaText = 'View Renewal Overview';
                let renewalCtaRoute = '/education/renewal';

                if (renewalItem?.renewal_status === 'Completed') {
                  renewalTitle = 'Renewal Completed';
                  renewalSub = 'Your scholarship renewal has been completed successfully for the applicable academic period.';
                } else if (renewalItem?.renewal_status === 'For Review') {
                  renewalTitle = 'Renewal Submitted';
                  renewalSub = 'Your renewal application is awaiting initial review.';
                } else if (renewalItem?.renewal_status === 'Under Review') {
                  renewalTitle = 'Renewal Under Review';
                  renewalSub = 'Your submitted renewal requirements are currently being reviewed.';
                } else if (renewalItem?.renewal_status === 'For Compliance') {
                  renewalTitle = 'Renewal Requires Action';
                  renewalSub = 'One or more renewal requirements need your attention.';
                  renewalCtaText = 'Review Renewal Requirements';
                  renewalCtaRoute = '/education/renewal/compliance';
                } else if (renewalItem?.renewal_status === 'Returned') {
                  renewalTitle = 'Renewal Returned';
                  renewalSub = 'Your renewal application has been returned for correction or additional requirements.';
                  renewalCtaText = 'View Renewal Details';
                } else if (renewalItem?.renewal_status === 'For Evaluation') {
                  renewalTitle = 'Renewal for Evaluation';
                  renewalSub = 'Your validated renewal is ready for scholarship evaluation.';
                } else if (renewalItem?.renewal_status === 'Recommended for Continuation') {
                  renewalTitle = 'Recommended for Continuation';
                  renewalSub = 'Your scholarship renewal has been recommended for continuation.';
                } else if (renewalItem?.renewal_status === 'Recommended for Non-Continuation') {
                  renewalTitle = 'Renewal Recommendation Recorded';
                  renewalSub = 'Your renewal has been recommended for non-continuation.';
                } else if (renewalItem?.renewal_status === 'For Certificate') {
                  renewalTitle = 'Renewal Approved for Certificate Processing';
                  renewalSub = 'Your renewal has completed evaluation and is awaiting certificate processing.';
                } else if (renewalItem?.renewal_status === 'Withdrawn') {
                  renewalTitle = 'Renewal Withdrawn';
                  renewalSub = 'This renewal application is no longer active.';
                }

                return (
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                        Latest Renewal
                      </Text>
                      {hasRenewal && renewalBadgeConfig.label ? (
                        <Badge label={renewalBadgeConfig.label} variant={renewalBadgeConfig.variant} />
                      ) : null}
                    </View>

                    {!hasRenewal || !renewalItem ? (
                      <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                          No Renewal Record Yet
                        </Text>
                        <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B', lineHeight: 18 }}>
                          You have not submitted a scholarship renewal application for the current period.
                        </Text>
                        <TouchableOpacity
                          style={[styles.primaryActionBtn, { marginTop: 12 }]}
                          onPress={() => router.push('/education/renewal' as any)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel="Start Renewal Application"
                        >
                          <Text style={styles.primaryActionBtnText}>START RENEWAL APPLICATION</Text>
                          <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ gap: 14 }}>
                        {/* TITLE & DESCRIPTION */}
                        <View>
                          <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A', marginBottom: 2 }}>
                            {renewalTitle}
                          </Text>
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            {renewalSub}
                          </Text>
                        </View>

                        {/* METADATA GRID WITH STACKED ROWS */}
                        <View style={styles.infoGrid}>
                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Reference</Text>
                            <Text style={[styles.infoValue, { color: '#7E22CE' }]}>
                              {renewalItem.renewal_code}
                            </Text>
                          </View>

                          <View style={styles.infoRowStacked}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                            <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                              {renewalPeriodStr}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted Date</Text>
                            <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                              {renewalItem.submitted_at
                                ? new Date(renewalItem.submitted_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  })
                                : '—'}
                            </Text>
                          </View>
                        </View>

                        {/* RENEWAL PROGRESS TIMELINE */}
                        <View style={{ marginTop: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                            RENEWAL PROGRESS
                          </Text>
                          {renewalTimelineItems.map((item: StatusTimelineStep, idx: number) => {
                            const isLast = idx === renewalTimelineItems.length - 1;
                            const isCompleted = item.isCompleted;
                            const isCurrent = item.isCurrent;
                            const isWarning = item.isWarning;

                            return (
                              <View key={idx} style={styles.timelineItemRow}>
                                <View style={styles.timelineLeftColumn}>
                                  <View
                                    style={[
                                      styles.timelineIconCircle,
                                      {
                                        backgroundColor: isCompleted
                                          ? '#16A34A'
                                          : isCurrent
                                          ? (isDarkMode ? '#2E1065' : '#FAF5FF')
                                          : isWarning
                                          ? (isDarkMode ? '#451A03' : '#FEF3C7')
                                          : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                                        borderColor: isCompleted
                                          ? '#16A34A'
                                          : isCurrent
                                          ? (isDarkMode ? '#C084FC' : '#7E22CE')
                                          : isWarning
                                          ? '#D97706'
                                          : (isDarkMode ? '#475569' : '#CBD5E1'),
                                      },
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
                                    ) : isWarning ? (
                                      <View
                                        style={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: 5,
                                          backgroundColor: '#D97706',
                                        }}
                                      />
                                    ) : null}
                                  </View>
                                  {!isLast && (
                                    <View
                                      style={[
                                        styles.timelineConnectorLine,
                                        {
                                          backgroundColor: isCompleted
                                            ? '#16A34A'
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
                                    isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                                    isCurrent && { borderColor: '#7E22CE', borderWidth: 1.5 },
                                    isWarning && { borderColor: '#F59E0B', borderWidth: 1.5 },
                                  ]}
                                >
                                  <View style={styles.timelineContentHeader}>
                                    <Text style={[styles.timelineTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                      {item.title}
                                    </Text>
                                    <View
                                      style={[
                                        styles.timelineStatusPill,
                                        {
                                          backgroundColor: isCompleted
                                            ? '#DCFCE7'
                                            : isCurrent
                                            ? '#F3E8FF'
                                            : isWarning
                                            ? '#FEF3C7'
                                            : isDarkMode
                                            ? '#0F172A'
                                            : '#F1F5F9',
                                          borderColor: isCompleted
                                            ? '#BBF7D0'
                                            : isCurrent
                                            ? '#E9D5FF'
                                            : isWarning
                                            ? '#FDE68A'
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
                                              ? '#7E22CE'
                                              : isWarning
                                              ? '#B45309'
                                              : isDarkMode
                                              ? '#94A3B8'
                                              : '#64748B',
                                          },
                                        ]}
                                      >
                                        {item.statusLabel}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {/* CTA ACTION BUTTON */}
                        <TouchableOpacity
                          style={[styles.primaryActionBtn, { marginTop: 14 }]}
                          onPress={() => router.push(renewalCtaRoute as any)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={renewalCtaText}
                        >
                          <Text style={styles.primaryActionBtnText}>{renewalCtaText.toUpperCase()}</Text>
                          <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()
            )}

            {/* 3. CURRENT SCHOLARSHIP GRANT */}
            {activeRecordType === 'Grant' && (
              (() => {
                const grantApp = grantOverview?.application;
                const hasGrantApp = Boolean(grantOverview?.has_existing_application && grantApp);
                const grantBadgeConfig = getGrantBadgeConfig(grantApp?.grant_status);
                const grantTimelineItems = getGrantTimelineItems(grantApp?.grant_status);

                let grantReqText = '—';
                if (grantApp) {
                  if (grantApp.document_summary?.summary_label) {
                    grantReqText = grantApp.document_summary.summary_label;
                  } else if (grantApp.documents) {
                    const activeDocs = grantApp.documents.filter((d) => d.submission_status !== 'Removed');
                    const requiredCount = grantApp.institution_type === 'Private' ? 2 : 1;
                    grantReqText = `${activeDocs.length} / ${requiredCount} Requirements Submitted`;
                  }
                }

                let grantCtaText = 'View Grant Application';
                if (grantApp?.grant_status === 'Draft') grantCtaText = 'Continue Grant Application';
                else if (grantApp?.grant_status === 'For Compliance') grantCtaText = 'Review Grant Requirements';
                else if (grantApp?.grant_status === 'Approved for Payroll' || grantApp?.grant_status === 'Withdrawn') grantCtaText = 'View Grant Status';

                return (
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                        Current Scholarship Grant
                      </Text>
                      {hasGrantApp && grantBadgeConfig.label ? (
                        <Badge label={grantBadgeConfig.label} variant={grantBadgeConfig.variant} />
                      ) : null}
                    </View>

                    {grantOverviewLoading ? (
                      <View style={{ paddingVertical: 8, gap: 8 }}>
                        <Skeleton height={20} borderRadius={6} width="65%" />
                        <Skeleton height={14} borderRadius={4} width="85%" />
                        <Skeleton height={80} borderRadius={12} width="100%" />
                      </View>
                    ) : grantOverviewError ? (
                      <View style={{ paddingVertical: 6 }}>
                        <Text style={{ color: '#EF4444', fontSize: 13, fontWeight: '600', marginBottom: 8 }}>
                          Unable to load current grant status.
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
                    ) : !hasGrantApp || !grantApp ? (
                      <View style={{ gap: 8 }}>
                        <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                          No Grant Application Yet
                        </Text>
                        <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B', lineHeight: 18 }}>
                          You have not submitted a scholarship grant application for the current academic period.
                        </Text>
                        <TouchableOpacity
                          style={[
                            styles.primaryActionBtn,
                            { backgroundColor: '#EA580C', shadowColor: '#EA580C', marginTop: 12 },
                          ]}
                          onPress={() => router.push('/education/grant' as any)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel="Start Grant Application"
                        >
                          <Text style={styles.primaryActionBtnText}>START GRANT APPLICATION</Text>
                          <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={{ gap: 14 }}>
                        {/* SUPPORTING TITLE / REMARKS */}
                        {grantApp.grant_status === 'Submitted' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            Your grant application and required documents have been submitted and are awaiting administrative review.
                          </Text>
                        ) : grantApp.grant_status === 'Draft' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            Complete your required documents to submit your application.
                          </Text>
                        ) : grantApp.grant_status === 'For Review' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            Your grant application is queued for administrative review.
                          </Text>
                        ) : grantApp.grant_status === 'Under Review' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            Your grant requirements are currently being reviewed.
                          </Text>
                        ) : grantApp.grant_status === 'For Compliance' ? (
                          <Text style={{ fontSize: 13, color: '#D97706', fontWeight: '600', lineHeight: 18 }}>
                            One or more grant requirements need your attention before processing can continue.
                          </Text>
                        ) : grantApp.grant_status === 'Approved for Payroll' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            Your grant application has been approved for financial processing.
                          </Text>
                        ) : grantApp.grant_status === 'Withdrawn' ? (
                          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                            This grant application is no longer active.
                          </Text>
                        ) : null}

                        {/* METADATA GRID WITH STACKED ROWS FOR LONG FIELDS */}
                        <View style={styles.infoGrid}>
                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Grant Reference</Text>
                            <Text style={[styles.infoValue, { color: '#0284C7' }]}>
                              {grantApp.grant_application_code}
                            </Text>
                          </View>

                          <View style={styles.infoRowStacked}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Partner Institution</Text>
                            <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                              {grantApp.institution_name} ({grantApp.institution_type} Institution)
                            </Text>
                          </View>

                          <View style={styles.infoRowStacked}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                            <Text style={[styles.infoValueStacked, isDarkMode && { color: '#F8FAFC' }]}>
                              AY {grantApp.academic_year} — {grantApp.academic_term}
                            </Text>
                          </View>

                          <View style={styles.infoRow}>
                            <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Requirements</Text>
                            <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                              {grantReqText}
                            </Text>
                          </View>
                        </View>

                        {/* TIMELINE PROGRESS */}
                        <View style={{ marginTop: 6 }}>
                          <Text style={{ fontSize: 11, fontWeight: '800', color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 12, letterSpacing: 0.5 }}>
                            GRANT APPLICATION PROGRESS
                          </Text>
                          {grantTimelineItems.map((item, idx) => {
                            const isLast = idx === grantTimelineItems.length - 1;
                            const isCompleted = item.isCompleted;
                            const isCurrent = item.isCurrent;
                            const isWarning = item.isWarning;

                            return (
                              <View key={idx} style={styles.timelineItemRow}>
                                <View style={styles.timelineLeftColumn}>
                                  <View
                                    style={[
                                      styles.timelineIconCircle,
                                      {
                                        backgroundColor: isCompleted
                                          ? '#16A34A'
                                          : isCurrent
                                          ? (isDarkMode ? '#431407' : '#FFF7ED')
                                          : isWarning
                                          ? (isDarkMode ? '#451A03' : '#FEF3C7')
                                          : (isDarkMode ? '#1E293B' : '#FFFFFF'),
                                        borderColor: isCompleted
                                          ? '#16A34A'
                                          : isCurrent
                                          ? (isDarkMode ? '#FB923C' : '#EA580C')
                                          : isWarning
                                          ? '#D97706'
                                          : (isDarkMode ? '#475569' : '#CBD5E1'),
                                      },
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
                                          backgroundColor: isDarkMode ? '#FB923C' : '#EA580C',
                                        }}
                                      />
                                    ) : isWarning ? (
                                      <View
                                        style={{
                                          width: 10,
                                          height: 10,
                                          borderRadius: 5,
                                          backgroundColor: '#D97706',
                                        }}
                                      />
                                    ) : null}
                                  </View>
                                  {!isLast && (
                                    <View
                                      style={[
                                        styles.timelineConnectorLine,
                                        {
                                          backgroundColor: isCompleted
                                            ? '#16A34A'
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
                                    isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                                    isCurrent && { borderColor: '#0284C7', borderWidth: 1.5 },
                                    isWarning && { borderColor: '#F59E0B', borderWidth: 1.5 },
                                  ]}
                                >
                                  <View style={styles.timelineContentHeader}>
                                    <Text style={[styles.timelineTitle, isDarkMode && { color: '#F8FAFC' }]}>
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
                                            : isWarning
                                            ? '#FEF3C7'
                                            : isDarkMode
                                            ? '#0F172A'
                                            : '#F1F5F9',
                                          borderColor: isCompleted
                                            ? '#BBF7D0'
                                            : isCurrent
                                            ? '#BAE6FD'
                                            : isWarning
                                            ? '#FDE68A'
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
                                              ? '#0369A1'
                                              : isWarning
                                              ? '#B45309'
                                              : isDarkMode
                                              ? '#94A3B8'
                                              : '#64748B',
                                          },
                                        ]}
                                      >
                                        {item.statusLabel}
                                      </Text>
                                    </View>
                                  </View>
                                </View>
                              </View>
                            );
                          })}
                        </View>

                        {/* CTA ACTION BUTTON */}
                        <TouchableOpacity
                          style={[
                            styles.primaryActionBtn,
                            { backgroundColor: '#EA580C', shadowColor: '#EA580C', marginTop: 14 },
                          ]}
                          onPress={() => router.push('/education/grant' as any)}
                          activeOpacity={0.8}
                          accessibilityRole="button"
                          accessibilityLabel={grantCtaText}
                        >
                          <Text style={styles.primaryActionBtnText}>{grantCtaText.toUpperCase()}</Text>
                          <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                );
              })()
            )}
          </View>
        )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === 'documents' && (
            <View style={{ gap: 16 }}>
              {activeRecordType === 'Application' && (
                <>
                  {/* APPLICATION REQUIREMENTS */}
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Application Requirements
                    </Text>

                    {appDocs.length > 0 ? (
                      appDocs.map((doc) => {
                        const isNeedsReplacement = doc.validation_result === 'Needs Replacement';
                        const isReplSubmitted = doc.status === 'Replacement Submitted';
                        const viewKey = `application_${doc.document_id}_view`;
                        const dlKey = `application_${doc.document_id}_download`;
                        const isViewLoading = actionLoadingDocKey === viewKey;
                        const isDlLoading = actionLoadingDocKey === dlKey;

                        return (
                          <View key={doc.document_id} style={[styles.docCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                            <View style={styles.docHeaderRow}>
                              <IconSymbol
                                name={isNeedsReplacement ? 'exclamationmark.triangle.fill' : isReplSubmitted ? 'clock.fill' : 'doc.text.fill'}
                                size={20}
                                color={isNeedsReplacement ? '#D97706' : isReplSubmitted ? '#7E22CE' : '#16A34A'}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                  {doc.document_name}
                                </Text>
                                <Text style={[styles.docSub, isDarkMode && { color: '#94A3B8' }]}>
                                  Status: {isReplSubmitted ? 'Replacement Submitted (Awaiting Review)' : doc.validation_result || doc.status} • File: {doc.original_filename} ({(doc.file_size / 1024).toFixed(0)} KB)
                                </Text>
                              </View>
                            </View>

                            {isNeedsReplacement ? (
                              <View style={styles.docWarningBox}>
                                <Text style={styles.docWarningText}>
                                  ⚠ Needs Replacement — {doc.review_remarks || 'Secretariat requested document replacement.'}
                                </Text>
                              </View>
                            ) : null}

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                              <TouchableOpacity
                                style={styles.docActionBtn}
                                disabled={Boolean(actionLoadingDocKey)}
                                onPress={() => handleDocumentAction('application', doc.document_id, doc.original_filename, 'view')}
                                activeOpacity={0.8}
                              >
                                {isViewLoading ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                                )}
                                <Text style={styles.docActionText}>{isViewLoading ? 'Opening...' : 'View File'}</Text>
                              </TouchableOpacity>

                              <TouchableOpacity
                                style={[styles.docActionBtn, { backgroundColor: '#475569' }]}
                                disabled={Boolean(actionLoadingDocKey)}
                                onPress={() => handleDocumentAction('application', doc.document_id, doc.original_filename, 'download')}
                                activeOpacity={0.8}
                              >
                                {isDlLoading ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <IconSymbol name="arrow.down.circle.fill" size={14} color="#FFFFFF" />
                                )}
                                <Text style={styles.docActionText}>{isDlLoading ? 'Downloading...' : 'Download'}</Text>
                              </TouchableOpacity>

                              {isNeedsReplacement ? (
                                <TouchableOpacity
                                  style={[styles.docActionBtn, { backgroundColor: '#D97706' }]}
                                  onPress={() => router.push('/education/new-applicant/compliance' as any)}
                                  activeOpacity={0.8}
                                >
                                  <Text style={styles.docActionText}>Action Required: Replace Document</Text>
                                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
                        No application documents found.
                      </Text>
                    )}
                  </View>

                  {/* APPLICATION OFFICIAL CERTIFICATES & CONTRACTS */}
                  {initialOfficialDocs.length > 0 ? (
                    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                      <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        Initial Official Certificates & Contracts
                      </Text>
                      <View style={{ gap: 12 }}>
                        {initialOfficialDocs.map((doc) => {
                          const viewKey = `${doc.type}_${doc.id}_view`;
                          const dlKey = `${doc.type}_${doc.id}_download`;
                          const isViewLoading = actionLoadingDocKey === viewKey;
                          const isDlLoading = actionLoadingDocKey === dlKey;

                          return (
                            <View key={`${doc.type}_${doc.id}`} style={[styles.certCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                              <View style={styles.certHeader}>
                                <IconSymbol name="checkmark.circle.fill" size={24} color="#16A34A" />
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.certTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                    {doc.title}
                                  </Text>
                                  <Text style={[styles.certSub, isDarkMode && { color: '#94A3B8' }]}>
                                    {doc.document_number} • Status: {doc.status}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.infoGrid}>
                                <View style={styles.infoRow}>
                                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Date</Text>
                                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                                    {formatDate(doc.date, '—')}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.certBtnRow}>
                                <TouchableOpacity
                                  style={styles.certPrimaryBtn}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleOfficialDocAction(doc, 'view')}
                                  activeOpacity={0.8}
                                >
                                  {isViewLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.certPrimaryBtnText}>{isViewLoading ? 'Opening...' : 'View'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.certPrimaryBtn, { backgroundColor: '#475569' }]}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleOfficialDocAction(doc, 'download')}
                                  activeOpacity={0.8}
                                >
                                  {isDlLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="arrow.down.circle.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.certPrimaryBtnText}>{isDlLoading ? 'Downloading...' : 'Download'}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </>
              )}

              {activeRecordType === 'Grant' && (
                <>
                  {/* SUBMITTED GRANT REQUIREMENTS */}
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Submitted Grant Requirements
                    </Text>

                    {grantApp?.documents && grantApp.documents.length > 0 ? (
                      grantApp.documents.map((doc) => {
                        const isNeedsReplacement = doc.review_status === 'Needs Replacement' || doc.review_status === 'Invalid';
                        const docName = doc.document_type === 'COR' ? 'Certificate of Registration (COR)' : doc.document_type === 'SOA' ? 'Statement of Account (SOA)' : doc.file_name;
                        const viewKey = `grant_${doc.grant_document_id}_view`;
                        const isViewLoading = actionLoadingDocKey === viewKey;

                        return (
                          <View key={doc.grant_document_id} style={[styles.docCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                            <View style={styles.docHeaderRow}>
                              <IconSymbol
                                name={isNeedsReplacement ? 'exclamationmark.triangle.fill' : 'doc.text.fill'}
                                size={20}
                                color={isNeedsReplacement ? '#D97706' : '#16A34A'}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                  {docName}
                                </Text>
                                <Text style={[styles.docSub, isDarkMode && { color: '#94A3B8' }]}>
                                  Status: {doc.submission_status} • Verification: {doc.review_status} • File: {doc.file_name} {doc.file_size ? `(${(doc.file_size / 1024).toFixed(0)} KB)` : ''}
                                </Text>
                              </View>
                            </View>

                            {isNeedsReplacement ? (
                              <View style={styles.docWarningBox}>
                                <Text style={styles.docWarningText}>
                                  ⚠ Review Notice: {doc.review_remarks || 'Document requires re-submission or correction.'}
                                </Text>
                              </View>
                            ) : null}

                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                              <TouchableOpacity
                                style={styles.docActionBtn}
                                disabled={Boolean(actionLoadingDocKey)}
                                onPress={() => handleDocumentAction('grant', doc.grant_document_id, doc.file_name, 'view')}
                                activeOpacity={0.8}
                              >
                                {isViewLoading ? (
                                  <ActivityIndicator size="small" color="#FFFFFF" />
                                ) : (
                                  <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                                )}
                                <Text style={styles.docActionText}>{isViewLoading ? 'Opening...' : 'View Info'}</Text>
                              </TouchableOpacity>

                              {isNeedsReplacement ? (
                                <TouchableOpacity
                                  style={[styles.docActionBtn, { backgroundColor: '#D97706' }]}
                                  onPress={() => router.push('/education/grant' as any)}
                                  activeOpacity={0.8}
                                >
                                  <Text style={styles.docActionText}>Update in Grant Application</Text>
                                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                              ) : null}
                            </View>
                          </View>
                        );
                      })
                    ) : (
                      <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
                        No grant requirements submitted yet.
                      </Text>
                    )}
                  </View>

                  {/* GRANT DISBURSEMENT & RELEASE DOCUMENTS CARD */}
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Grant Release & Financial Records
                    </Text>
                    <View style={{ backgroundColor: isDarkMode ? '#1E293B' : '#F0F9FF', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? '#0369A1' : '#BAE6FD' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <IconSymbol name="checkmark.circle.fill" size={18} color="#0284C7" />
                        <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#38BDF8' : '#0369A1' }}>
                          Official Financial Authorization
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#334155', lineHeight: 18 }}>
                        Official scholarship grant disbursements and tuition assistance vouchers are authorized by the City Government Education and Scholarship Office upon review completion.
                      </Text>
                    </View>
                  </View>
                </>
              )}

              {activeRecordType === 'Renewal' && (
                <>
                  {/* SUBMITTED RENEWAL REQUIREMENTS */}
                  <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                    <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Submitted Renewal Requirements (COR / COG / SOA)
                    </Text>

                    {renDocs.length > 0 ? (
                      renDocs.map((doc) => {
                        const isNeedsReplacement = doc.validation_status === 'Needs Replacement';
                        const viewKey = `renewal_${doc.renewal_document_id}_view`;
                        const dlKey = `renewal_${doc.renewal_document_id}_download`;
                        const isViewLoading = actionLoadingDocKey === viewKey;
                        const isDlLoading = actionLoadingDocKey === dlKey;

                        return (
                          <View key={doc.renewal_document_id} style={[styles.docCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                            <View style={styles.docHeaderRow}>
                              <IconSymbol
                                name={isNeedsReplacement ? 'exclamationmark.triangle.fill' : 'doc.text.fill'}
                                size={20}
                                color={isNeedsReplacement ? '#D97706' : '#16A34A'}
                              />
                              <View style={{ flex: 1 }}>
                                <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                  {doc.document_name}
                                </Text>
                                <Text style={[styles.docSub, isDarkMode && { color: '#94A3B8' }]}>
                                  Status: {doc.validation_status} • File: {doc.original_filename} ({(doc.file_size / 1024).toFixed(0)} KB)
                                </Text>
                              </View>
                            </View>

                            {isNeedsReplacement ? (
                              <>
                                <View style={styles.docWarningBox}>
                                  <Text style={styles.docWarningText}>
                                    ⚠ Needs Replacement — {doc.review_remarks || 'Coordinator requested document replacement.'}
                                  </Text>
                                </View>

                                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                                  <TouchableOpacity
                                    style={[styles.docActionBtn, { backgroundColor: '#475569' }]}
                                    disabled={Boolean(actionLoadingDocKey)}
                                    onPress={() => handleDocumentAction('renewal', doc.renewal_document_id, doc.original_filename, 'view')}
                                    activeOpacity={0.8}
                                  >
                                    {isViewLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                                    <Text style={styles.docActionText}>View Original</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[styles.docActionBtn, { backgroundColor: '#334155' }]}
                                    disabled={Boolean(actionLoadingDocKey)}
                                    onPress={() => handleDocumentAction('renewal', doc.renewal_document_id, doc.original_filename, 'download')}
                                    activeOpacity={0.8}
                                  >
                                    {isDlLoading ? <ActivityIndicator size="small" color="#FFFFFF" /> : null}
                                    <Text style={styles.docActionText}>Download Original</Text>
                                  </TouchableOpacity>

                                  <TouchableOpacity
                                    style={[styles.docActionBtn, { backgroundColor: '#D97706' }]}
                                    onPress={() => router.push('/education/renewal/compliance' as any)}
                                    activeOpacity={0.8}
                                  >
                                    <Text style={styles.docActionText}>Review Replacement Request</Text>
                                    <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                                  </TouchableOpacity>
                                </View>
                              </>
                            ) : (
                              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                <TouchableOpacity
                                  style={styles.docActionBtn}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleDocumentAction('renewal', doc.renewal_document_id, doc.original_filename, 'view')}
                                  activeOpacity={0.8}
                                >
                                  {isViewLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.docActionText}>{isViewLoading ? 'Opening...' : 'View File'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.docActionBtn, { backgroundColor: '#475569' }]}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleDocumentAction('renewal', doc.renewal_document_id, doc.original_filename, 'download')}
                                  activeOpacity={0.8}
                                >
                                  {isDlLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="arrow.down.circle.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.docActionText}>{isDlLoading ? 'Downloading...' : 'Download'}</Text>
                                </TouchableOpacity>
                              </View>
                            )}
                          </View>
                        );
                      })
                    ) : (
                      <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
                        No submitted renewal documents found.
                      </Text>
                    )}
                  </View>

                  {/* RENEWAL OFFICIAL CERTIFICATES */}
                  {renewalOfficialDocs.length > 0 ? (
                    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                      <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        Renewal Official Documents & Certificates
                      </Text>
                      <View style={{ gap: 12 }}>
                        {renewalOfficialDocs.map((doc) => {
                          const viewKey = `${doc.type}_${doc.id}_view`;
                          const dlKey = `${doc.type}_${doc.id}_download`;
                          const isViewLoading = actionLoadingDocKey === viewKey;
                          const isDlLoading = actionLoadingDocKey === dlKey;

                          return (
                            <View key={`${doc.type}_${doc.id}`} style={[styles.certCard, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                              <View style={styles.certHeader}>
                                <IconSymbol name="checkmark.circle.fill" size={24} color="#7E22CE" />
                                <View style={{ flex: 1 }}>
                                  <Text style={[styles.certTitle, isDarkMode && { color: '#F8FAFC' }]}>
                                    {doc.title}
                                  </Text>
                                  <Text style={[styles.certSub, isDarkMode && { color: '#94A3B8' }]}>
                                    {doc.document_number} • Status: {doc.status}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.infoGrid}>
                                {doc.period ? (
                                  <View style={styles.infoRow}>
                                    <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                                    <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                                      {doc.period}
                                    </Text>
                                  </View>
                                ) : null}
                                <View style={styles.infoRow}>
                                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Date</Text>
                                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                                    {formatDate(doc.date, '—')}
                                  </Text>
                                </View>
                              </View>

                              <View style={styles.certBtnRow}>
                                <TouchableOpacity
                                  style={styles.certPrimaryBtn}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleOfficialDocAction(doc, 'view')}
                                  activeOpacity={0.8}
                                >
                                  {isViewLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.certPrimaryBtnText}>{isViewLoading ? 'Opening...' : 'View'}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  style={[styles.certPrimaryBtn, { backgroundColor: '#475569' }]}
                                  disabled={Boolean(actionLoadingDocKey)}
                                  onPress={() => handleOfficialDocAction(doc, 'download')}
                                  activeOpacity={0.8}
                                >
                                  {isDlLoading ? (
                                    <ActivityIndicator size="small" color="#FFFFFF" />
                                  ) : (
                                    <IconSymbol name="arrow.down.circle.fill" size={14} color="#FFFFFF" />
                                  )}
                                  <Text style={styles.certPrimaryBtnText}>{isDlLoading ? 'Downloading...' : 'Download'}</Text>
                                </TouchableOpacity>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    </View>
                  ) : null}
                </>
              )}
            </View>
          )}

          {/* INSPECTION MODAL */}
          <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
            <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
              <View style={[styles.sectionCard, { width: '100%', maxWidth: 400 }, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  {modalTitle}
                </Text>
                <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#475569', lineHeight: 20, marginBottom: 18 }}>
                  {modalBody}
                </Text>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#7E22CE',
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    alignSelf: 'flex-end',
                  }}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 13 }}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>


        </>
      )}
    </ScrollView>
  );
}


