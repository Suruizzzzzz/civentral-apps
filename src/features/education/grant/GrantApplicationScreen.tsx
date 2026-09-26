import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { validateFileSize } from '@/src/utils/fileValidation';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import { formatDate } from '@/src/utils/dateUtils';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenGrantOverviewData,
  createGrantApplication,
  fetchCitizenGrantOverview,
  GrantApplicationDetail,
  submitGrantApplication,
  uploadGrantDocument,
  validateCitizenGrantDocument,
} from './api/grantApi';
import {
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from './api/grantReleaseApi';
import { styles } from './styles/ScholarshipGrant.styles';

const scholarshipBg = require('@/assets/images/scholarship-bg.png');

function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null) return '—';
  return `₱${amount.toLocaleString('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

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

function getF2FClaimBadgeVariant(claimStatus?: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (claimStatus) {
    case 'Ready for Claim':
    case 'Released':
      return 'success';
    case 'Scheduled':
      return 'info';
    default:
      return 'neutral';
  }
}

function getInstitutionalBadgeVariant(instStatus?: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  switch (instStatus) {
    case 'Released to Partner Institution':
    case 'Released':
    case 'Paid':
    case 'Verified / Linked':
      return 'success';
    case 'Partner School Notified':
    case 'Ready for Processing':
      return 'info';
    case 'Institutional Payment Processing':
    case 'On Hold — Institution Verification Required':
    case 'Institution Verification Required':
      return 'warning';
    default:
      return 'neutral';
  }
}

interface DocumentOcrValidation {
  status: 'idle' | 'checking' | 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE' | 'error';
  result?: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  detectedCode?: string | null;
  expectedCode?: string;
  message?: string;
}

export function GrantApplicationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<'COR' | 'SOA' | null>(null);
  const [docValidations, setDocValidations] = useState<Record<'COR' | 'SOA', DocumentOcrValidation>>({
    COR: { status: 'idle' },
    SOA: { status: 'idle' },
  });

  const [overview, setOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [application, setApplication] = useState<GrantApplicationDetail | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);

  // Modal States
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<GrantApplicationDetail | null>(null);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/grant' as any);
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
        color={isDarkMode ? '#FB923C' : '#EA580C'}
      />
      <Text style={[styles.backText, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
        Back to Scholarship Grant
      </Text>
    </TouchableOpacity>
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [data, releases] = await Promise.all([
        fetchCitizenGrantOverview(),
        fetchCitizenGrantReleases().catch(() => []),
      ]);
      setOverview(data);
      setGrantReleases(releases);

      if (data.has_existing_application && data.application) {
        setApplication(data.application);
      } else {
        setApplication(null);
      }
    } catch (err: any) {
      console.error('[GrantApplicationScreen] Load overview error:', err);
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

  // Start / Create Draft Application
  const handleCreateApplication = async () => {
    try {
      setSubmitting(true);
      const app = await createGrantApplication();
      setApplication(app);
      Alert.alert('Application Started', 'Your grant application draft has been initiated. Please upload the required document(s).');
    } catch (err: any) {
      Alert.alert('Error', sanitizeErrorMessage(err?.message, 'Failed to create grant application draft.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Upload Document (COR or SOA) with pre-submission replacement and OCR validation
  const handlePickAndUploadDocument = async (docType: 'COR' | 'SOA') => {
    if (!application) {
      Alert.alert('Error', 'Please start the grant application draft first.');
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        // 10MB file size limit validation
        const validation = validateFileSize(asset, 10, docType);
        if (!validation.valid) {
          Alert.alert('File Too Large', validation.errorMessage || `The selected ${docType} file exceeds the maximum limit of 10MB.`);
          return;
        }

        // Reset OCR state to 'checking' immediately
        setDocValidations((prev) => ({
          ...prev,
          [docType]: {
            status: 'checking',
            expectedCode: docType,
          },
        }));

        setUploadingDoc(docType);

        // 1. Authoritative document upload to server
        try {
          const updatedApp = await uploadGrantDocument(
            application.grant_application_id,
            docType,
            asset.uri,
            asset.name,
            asset.mimeType || 'application/octet-stream'
          );
          setApplication(updatedApp);
        } catch (uploadErr: any) {
          setDocValidations((prev) => ({
            ...prev,
            [docType]: { status: 'error', message: uploadErr.message || 'Upload failed' },
          }));
          throw uploadErr;
        }

        // 2. OCR validation pipeline
        try {
          const validationResult = await validateCitizenGrantDocument(asset, docType);
          if (validationResult) {
            setDocValidations((prev) => ({
              ...prev,
              [docType]: {
                status: validationResult.result,
                result: validationResult.result,
                detectedCode: validationResult.detected_document_code,
                expectedCode: validationResult.expected_document_code,
                message: validationResult.message,
              },
            }));
          } else {
            setDocValidations((prev) => ({
              ...prev,
              [docType]: {
                status: 'INCONCLUSIVE',
                result: 'INCONCLUSIVE',
                message: 'Automatic document check is unavailable. Manual review will apply.',
              },
            }));
          }
        } catch (ocrErr: any) {
          setDocValidations((prev) => ({
            ...prev,
            [docType]: {
              status: 'INCONCLUSIVE',
              result: 'INCONCLUSIVE',
              message: ocrErr.message || 'Automatic document check is unavailable. Manual review will apply.',
            },
          }));
        }
      }
    } catch (err: any) {
      console.error('[GrantApplicationScreen] Pick/Upload error:', err);
      Alert.alert('Upload Failed', sanitizeErrorMessage(err?.message, `Failed to upload ${docType}. Please try again.`));
    } finally {
      setUploadingDoc(null);
    }
  };

  // Submit Application triggers confirmation modal
  const handleSubmitApplication = () => {
    if (!application) return;

    // Check pre-submission OCR mismatch guard: Warn citizen if mismatch is detected
    const hasMismatch = Object.values(docValidations).some((v) => v.status === 'MISMATCH');
    if (hasMismatch) {
      Alert.alert(
        'Document Check Warning',
        'One or more documents do not match the expected requirement. You may still proceed with submission, but Secretariat review may request replacement.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Submit Anyway',
            style: 'default',
            onPress: () => setConfirmModalVisible(true),
          },
        ]
      );
      return;
    }

    setConfirmModalVisible(true);
  };

  const handleConfirmSubmit = async () => {
    setConfirmModalVisible(false);
    await performSubmission();
  };

  const performSubmission = async () => {
    if (!application) return;
    try {
      setSubmitting(true);
      const res = await submitGrantApplication(application.grant_application_id);
      setSubmittedResult(res);
      setApplication(res);
      setSuccessModalVisible(true);
    } catch (err: any) {
      console.error('[GrantApplicationScreen] Submit error:', err);
      Alert.alert('Submission Failed', sanitizeErrorMessage(err?.message, 'Failed to submit grant application.'));
    } finally {
      setSubmitting(false);
    }
  };

  // Render OCR feedback pill
  const renderOcrFeedback = (docType: 'COR' | 'SOA', label: string) => {
    const val = docValidations[docType];
    if (!val || val.status === 'idle') return null;

    if (val.status === 'checking') {
      return (
        <View style={[styles.ocrFeedbackBox, styles.ocrCheckingBox, { marginTop: 10 }]}>
          <ActivityIndicator size="small" color="#EA580C" />
          <Text style={[styles.ocrCheckingText, isDarkMode && { color: '#FB923C' }]}>
            Verifying document type automatically...
          </Text>
        </View>
      );
    }

    if (val.status === 'MATCH') {
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrMatchBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
            <Text style={[styles.ocrMatchHeader, isDarkMode && { color: '#86EFAC' }]}>
              Document verified as {label}.
            </Text>
          </View>
        </View>
      );
    }

    if (val.status === 'MISMATCH') {
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrMismatchBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#450A0A', borderColor: '#DC2626' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color="#DC2626" />
            <Text style={[styles.ocrMismatchHeader, isDarkMode && { color: '#FCA5A5' }]}>
              Possible Document Mismatch
            </Text>
          </View>
          <Text style={[styles.ocrMismatchDetail, isDarkMode && { color: '#FECACA' }]}>
            {val.message || `Uploaded document does not appear to match ${label}. You can still submit, but manual review is required.`}
          </Text>
        </View>
      );
    }

    if (val.status === 'INCONCLUSIVE') {
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrInconclusiveBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="info.circle.fill" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <Text style={[styles.ocrInconclusiveHeader, isDarkMode && { color: '#CBD5E1' }]}>
              Automatic document check is unavailable.
            </Text>
          </View>
          <Text style={[styles.ocrInconclusiveDetail, isDarkMode && { color: '#94A3B8' }]}>
            You can still continue and the document can be reviewed manually.
          </Text>
        </View>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}>
          {renderBackButton()}
          <Skeleton height={140} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={100} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={180} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  const currentPeriod = overview?.current_academic_period;
  const scholar = overview?.scholar;
  const canStartGrantApplication = Boolean(overview?.eligible);

  // STATE GUARD: Is this an editable draft vs existing non-draft application?
  const isDraft = !application || application.grant_status === 'Draft';
  const grantStatusText =
    application?.grant_status ||
    (application as any)?.status ||
    (application as any)?.application_status ||
    'Not Started';

  const activeInstType = application?.institution_type || 'Public';
  const docs = application?.documents || [];
  const corDoc = docs.find((d) => d.document_type === 'COR' && d.submission_status !== 'Removed');
  const soaDoc = docs.find((d) => d.document_type === 'SOA' && d.submission_status !== 'Removed');

  const institutionId = application?.institution_id ?? overview?.application?.institution_id ?? overview?.institution?.partner_school_id ?? null;
  const isRegistered = institutionId !== null && institutionId !== undefined;

  const institutionDisplayName = isRegistered
    ? (application?.institution_name || overview?.institution?.institution_name || 'Registered Partner Institution')
    : (application?.institution_name_snapshot || application?.institution_name || overview?.application?.institution_name_snapshot || 'Unregistered Institution');

  const instBadgeLabel = isRegistered ? 'Verified' : 'Verification Required';
  const instBadgeVariant: 'success' | 'warning' = isRegistered ? 'success' : 'warning';

  const tuitionStatusLabel = application?.tuition_status || overview?.tuition_status || (isRegistered ? 'Ready for Processing' : 'On Hold — Institution Verification Required');
  const isTuitionOnHold = Boolean(application) && (tuitionStatusLabel.toLowerCase().includes('hold') || !isRegistered);
  const holdExplanation = application?.hold_explanation || overview?.hold_explanation || 'Institution verification is required before tuition payment can proceed, while stipend processing may continue independently where applicable.';

  const complianceDocs = docs.filter(
    (d) => d.review_status === 'Needs Replacement' || d.review_status === 'Invalid'
  );
  const isComplianceRequired = Boolean(
    application &&
    (application.grant_status === 'For Compliance' || complianceDocs.length > 0)
  );

  // Authoritative Backend Financial Figures
  const assessedTuition = application?.assessed_eligible_tuition ?? overview?.assessed_eligible_tuition;
  const programTuitionMax = application?.program_tuition_maximum ?? overview?.program_tuition_maximum;
  const actualEntitlement = application?.actual_tuition_grant_entitlement ?? overview?.actual_tuition_grant_entitlement;
  const hasTuitionFigures = assessedTuition !== undefined || programTuitionMax !== undefined || actualEntitlement !== undefined;

  // Aggregate releases financial totals
  const totalAuthorized = grantReleases.reduce((acc, r) => acc + (r.authorized_amount || 0), 0);
  const totalReleased = grantReleases.reduce((acc, r) => acc + (r.total_released_amount || 0), 0);
  const totalRemaining = grantReleases.reduce((acc, r) => acc + (r.remaining_amount || 0), 0);

  const showGrantReleaseSection =
    Boolean(application) &&
    (grantReleases.length > 0 ||
      hasTuitionFigures ||
      application?.grant_status === 'Approved for Payroll' ||
      application?.grant_status === 'Approved' ||
      application?.grant_status === 'Processing' ||
      application?.grant_status === 'Disbursed' ||
      application?.grant_status === 'Released' ||
      application?.grant_status === 'Paid');

  // Progressive Disclosure check for Claiming Guidelines
  const isReadyForClaim = grantReleases.some((r) =>
    (r.components || []).some(
      (c) =>
        c.release_method === 'Face-to-Face' &&
        (c.f2f_schedule?.claim_status === 'Ready for Claim' ||
          c.f2f_schedule?.claim_status === 'Scheduled' ||
          Boolean(c.f2f_schedule?.claim_reference))
    )
  );

  // Status Presentation Configuration
  const getStatusConfig = () => {
    switch (grantStatusText) {
      case 'Approved for Payroll':
        return {
          icon: 'checkmark.seal.fill',
          title: 'Approved for Payroll',
          color: '#16A34A',
          bgLight: '#F0FDF4',
          bgDark: '#052E16',
          borderLight: '#BBF7D0',
          borderDark: '#166534',
          desc: 'Your grant application has been approved by the Scholarship Secretariat and is queued for payroll authorization.',
        };
      case 'Approved':
        return {
          icon: 'checkmark.circle.fill',
          title: 'Grant Application Approved',
          color: '#16A34A',
          bgLight: '#F0FDF4',
          bgDark: '#052E16',
          borderLight: '#BBF7D0',
          borderDark: '#166534',
          desc: 'Your grant application has been approved by the City Scholarship Secretariat.',
        };
      case 'Submitted':
      case 'Under Review':
      case 'For Review':
        return {
          icon: 'clock.fill',
          title: 'Under Secretariat Review',
          color: '#0284C7',
          bgLight: '#F0F9FF',
          bgDark: '#082F49',
          borderLight: '#BAE6FD',
          borderDark: '#0369A1',
          desc: 'Your grant application and documents have been received and are undergoing verification.',
        };
      case 'For Compliance':
        return {
          icon: 'exclamationmark.triangle.fill',
          title: 'Document Correction Required',
          color: '#D97706',
          bgLight: '#FFFBEB',
          bgDark: '#451A03',
          borderLight: '#FDE68A',
          borderDark: '#B45309',
          desc: 'The Secretariat has flagged requirement(s) that require replacement. Please review remarks and submit corrections in Grant Compliance.',
        };
      case 'Processing':
      case 'Ready for Processing':
        return {
          icon: 'arrow.triangle.2.circlepath',
          title: 'Processing Grant Release',
          color: '#0284C7',
          bgLight: '#F0F9FF',
          bgDark: '#082F49',
          borderLight: '#BAE6FD',
          borderDark: '#0369A1',
          desc: 'Your approved grant entitlement is currently being processed for financial release.',
        };
      case 'Disbursed':
      case 'Released':
      case 'Paid':
        return {
          icon: 'banknote.fill',
          title: 'Grant Entitlement Released',
          color: '#16A34A',
          bgLight: '#F0FDF4',
          bgDark: '#052E16',
          borderLight: '#BBF7D0',
          borderDark: '#166534',
          desc: 'Your educational grant entitlement has been released for this academic period.',
        };
      case 'Draft':
        return {
          icon: 'pencil.circle.fill',
          title: 'Application Draft Initiated',
          color: '#EA580C',
          bgLight: '#FFF7ED',
          bgDark: '#431407',
          borderLight: '#FED7AA',
          borderDark: '#9A3412',
          desc: 'Please upload the required enrollment documents and submit your application for review.',
        };
      case 'Not Started':
      case '--':
        return {
          icon: 'info.circle.fill',
          title: 'Not Started',
          color: '#0284C7',
          bgLight: '#F0F9FF',
          bgDark: '#082F49',
          borderLight: '#BAE6FD',
          borderDark: '#0369A1',
          desc: 'You have not submitted an educational grant application for the current academic period. Begin your application to confirm school enrollment and submit verification documents.',
        };
      default:
        return {
          icon: 'info.circle.fill',
          title: `Status: ${grantStatusText}`,
          color: '#64748B',
          bgLight: '#F8FAFC',
          bgDark: '#1E293B',
          borderLight: '#E2E8F0',
          borderDark: '#334155',
          desc: `Your grant application is currently marked as ${grantStatusText}.`,
        };
    }
  };

  const statusConfig = getStatusConfig();

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 140 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderBackButton()}

        {/* ============================================================== */}
        {/* 1. GRANT IDENTITY & CONTEXT HEADER                             */}
        {/* ============================================================== */}
        <View
          style={[
            styles.card,
            { padding: 18, marginBottom: 14 },
            isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
          ]}
        >
          <View style={styles.headerMainRow}>
            {/* Left Column: Status Badge, Program Title, Academic Period */}
            <View style={styles.headerTextCol}>
              <View style={styles.headerBadgeWrap}>
                <Badge label={grantStatusText} variant={getStatusBadgeVariant(grantStatusText)} />
              </View>
              <Text
                style={[
                  styles.headerProgramTitle,
                  isDarkMode && { color: '#F8FAFC' },
                ]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {scholar?.program_name || 'Academic Scholarship'}
              </Text>
              <Text
                style={[
                  styles.headerAcademicPeriod,
                  isDarkMode && { color: '#CBD5E1' },
                ]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {currentPeriod ? `${currentPeriod.academic_year} • ${currentPeriod.term}` : 'Current Academic Period'}
              </Text>
            </View>

            {/* Right Column: Toga Artwork inside Orange-tinted Container */}
            <View
              style={[
                styles.headerTogaBox,
                isDarkMode && styles.headerTogaBoxDark,
              ]}
            >
              <Image
                source={scholarshipBg}
                style={styles.headerTogaImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {application?.grant_application_code && (
            <View
              style={[
                styles.headerMetaDividerRow,
                isDarkMode && { borderTopColor: '#334155' },
              ]}
            >
              <Text style={[styles.headerMetaLabel, isDarkMode && { color: '#94A3B8' }]}>
                Grant Reference
              </Text>
              <Text style={[styles.headerMetaCode, isDarkMode && { color: '#FB923C' }]}>
                {application.grant_application_code}
              </Text>
            </View>
          )}

          {scholar && (
            <View style={styles.headerScholarRow}>
              <Text
                style={[styles.headerScholarText, isDarkMode && { color: '#94A3B8' }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Scholar:{' '}
                <Text style={{ fontWeight: '600', color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                  {scholar.scholar_name}
                </Text>
              </Text>
              <Text style={[styles.headerScholarCode, isDarkMode && { color: '#94A3B8' }]}>
                Code: {scholar.scholar_code}
              </Text>
            </View>
          )}
        </View>

        {/* ============================================================== */}
        {/* 2. APPLICATION STATUS HERO (CLEAR, NON-REPETITIVE)             */}
        {/* ============================================================== */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? statusConfig.bgDark : statusConfig.bgLight,
              borderColor: isDarkMode ? statusConfig.borderDark : statusConfig.borderLight,
              borderWidth: 1,
              padding: 16,
              marginBottom: 14,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <IconSymbol name={statusConfig.icon as any} size={18} color={statusConfig.color} />
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
              {statusConfig.title}
            </Text>
          </View>
          <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#334155', lineHeight: 19 }}>
            {statusConfig.desc}
          </Text>

          {application?.submitted_at && (
            <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8 }}>
              Submitted {formatDate(application.submitted_at)}
            </Text>
          )}

          {isComplianceRequired && (
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: '#EA580C', marginTop: 12, paddingVertical: 11 }]}
              onPress={() => router.push('/education/grant/compliance' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Open Grant Compliance</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>

        {/* ============================================================== */}
        {/* 3. EDUCATIONAL INSTITUTION CARD (COMPACT & PROFESSIONAL)        */}
        {/* ============================================================== */}
        {(Boolean(application) || Boolean(overview?.institution)) && (
          <View
            style={[
              styles.card,
              { padding: 16, marginBottom: 14 },
              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            ]}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
              Educational Institution
            </Text>
            <Text style={{ fontSize: 15, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A', marginBottom: 6 }}>
              {institutionDisplayName}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Badge label={instBadgeLabel} variant={instBadgeVariant} />
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                {activeInstType === 'Private' ? 'Private Institution' : 'Public Institution'}
              </Text>
            </View>

            {isTuitionOnHold && (
              <View style={{ marginTop: 10, backgroundColor: isDarkMode ? '#451A03' : '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDarkMode ? '#B45309' : '#FDE68A' }}>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#FDE68A' : '#B45309', fontWeight: '600', lineHeight: 16 }}>
                  {holdExplanation}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* 4. DOCUMENTS (COMPACT LIST OR ACTIVE DRAFT FORM)               */}
        {/* ============================================================== */}
        {!isDraft && application ? (
          /* READ-ONLY SUBMITTED DOCUMENTS TABLE */
          <View
            style={[
              styles.card,
              { padding: 16, marginBottom: 14 },
              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            ]}
          >
            <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 }}>
              Submitted Documents
            </Text>

            {docs.length === 0 ? (
              <Text style={{ fontSize: 13, color: '#64748B' }}>No documents on file.</Text>
            ) : (
              <View style={{ gap: 10 }}>
                {docs.map((doc) => (
                  <View
                    key={doc.grant_document_id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: 12,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#334155' : '#F1F5F9',
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1, marginRight: 8 }}>
                      <IconSymbol name="doc.text.fill" size={20} color={isDarkMode ? '#FB923C' : '#EA580C'} />
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                          {doc.document_type === 'COR' ? 'Certificate of Registration (COR)' : 'Statement of Account (SOA)'}
                        </Text>
                        <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }} numberOfLines={1}>
                          {doc.file_name}
                        </Text>
                      </View>
                    </View>
                    <Badge
                      label={doc.review_status}
                      variant={
                        doc.review_status === 'Valid'
                          ? 'success'
                          : doc.review_status === 'Needs Replacement' || doc.review_status === 'Invalid'
                          ? 'warning'
                          : 'info'
                      }
                    />
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : (
          /* ACTIVE DRAFT / SUBMISSION WORKFLOW */
          !application ? (
            <View
              style={[
                styles.emptyStartCard,
                { marginBottom: 14 },
                isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
              ]}
            >
              <View
                style={[
                  styles.emptyStartIconCircle,
                  { backgroundColor: isDarkMode ? '#431407' : '#FFF7ED' },
                ]}
              >
                <IconSymbol
                  name="wallet.pass.fill"
                  size={36}
                  color={isDarkMode ? '#FB923C' : '#EA580C'}
                />
              </View>
              <Text
                style={[
                  styles.emptyStartTitle,
                  isDarkMode && { color: '#F8FAFC' },
                ]}
              >
                No Grant Application Yet
              </Text>
              <Text
                style={[
                  styles.emptyStartSub,
                  isDarkMode && { color: '#CBD5E1' },
                ]}
              >
                You have not submitted an educational grant application for the current academic period. Begin your application to confirm your enrolled school and submit verification documents.
              </Text>
              {canStartGrantApplication && (
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
                    { width: '100%', maxWidth: 280, marginTop: 4, backgroundColor: '#EA580C' },
                    submitting && styles.primaryBtnDisabled,
                  ]}
                  onPress={handleCreateApplication}
                  disabled={submitting}
                  activeOpacity={0.8}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <IconSymbol name="doc.badge.plus" size={18} color="#FFFFFF" />
                      <Text style={styles.primaryBtnText}>Start Grant Application</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.card,
                { padding: 16, marginBottom: 14 },
                isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
              ]}
            >
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>
                Required Documents
              </Text>
              <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                {activeInstType === 'Private'
                  ? 'Private Institution: Submit both COR and SOA.'
                  : 'Public Institution: Submit COR.'}
              </Text>

              {/* COR Document */}
              <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <View style={styles.docHeader}>
                  <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    Certificate of Registration (COR)
                  </Text>
                  <Text
                    style={[
                      styles.docReqBadge,
                      corDoc ? { backgroundColor: '#DCFCE7', color: '#15803D' } : { backgroundColor: '#FEF3C7', color: '#B45309' },
                    ]}
                  >
                    {corDoc ? '✓ Uploaded' : 'Required'}
                  </Text>
                </View>
                {corDoc ? (
                  <View>
                    <Text style={styles.docFileName}>{corDoc.file_name}</Text>
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => handlePickAndUploadDocument('COR')}
                      disabled={uploadingDoc === 'COR'}
                    >
                      {uploadingDoc === 'COR' ? (
                        <ActivityIndicator size="small" color="#EA580C" />
                      ) : (
                        <>
                          <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                          <Text style={styles.replaceBtnText}>Replace COR</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.uploadBtn, { backgroundColor: '#EA580C' }]}
                    onPress={() => handlePickAndUploadDocument('COR')}
                    disabled={uploadingDoc === 'COR'}
                  >
                    {uploadingDoc === 'COR' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol name="doc.fill" size={14} color="#FFFFFF" />
                        <Text style={styles.uploadBtnText}>Upload COR (PDF, PNG, JPG up to 10MB)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
                {renderOcrFeedback('COR', 'Certificate of Registration (COR)')}
              </View>

              {/* SOA Document (Private) */}
              {activeInstType === 'Private' && (
                <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Statement of Account (SOA)
                    </Text>
                    <Text
                      style={[
                        styles.docReqBadge,
                        soaDoc ? { backgroundColor: '#DCFCE7', color: '#15803D' } : { backgroundColor: '#FEF3C7', color: '#B45309' },
                      ]}
                    >
                      {soaDoc ? '✓ Uploaded' : 'Required for Private'}
                    </Text>
                  </View>
                  {soaDoc ? (
                    <View>
                      <Text style={styles.docFileName}>{soaDoc.file_name}</Text>
                      <TouchableOpacity
                        style={styles.replaceBtn}
                        onPress={() => handlePickAndUploadDocument('SOA')}
                        disabled={uploadingDoc === 'SOA'}
                      >
                        {uploadingDoc === 'SOA' ? (
                          <ActivityIndicator size="small" color="#EA580C" />
                        ) : (
                          <>
                            <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                            <Text style={styles.replaceBtnText}>Replace SOA</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.uploadBtn, { backgroundColor: '#EA580C' }]}
                      onPress={() => handlePickAndUploadDocument('SOA')}
                      disabled={uploadingDoc === 'SOA'}
                    >
                      {uploadingDoc === 'SOA' ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <IconSymbol name="doc.fill" size={14} color="#FFFFFF" />
                          <Text style={styles.uploadBtnText}>Upload SOA (PDF, PNG, JPG up to 10MB)</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                  {renderOcrFeedback('SOA', 'Statement of Account (SOA)')}
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  { backgroundColor: '#EA580C', marginTop: 14 },
                  (!corDoc || (activeInstType === 'Private' && !soaDoc) || submitting) && styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmitApplication}
                disabled={!corDoc || (activeInstType === 'Private' && !soaDoc) || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Submit Grant Application</Text>
                    <IconSymbol name="paperplane.fill" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          )
        )}

        {/* ============================================================== */}
        {/* 5. COMBINED GRANT RELEASE (PAYMENT + DISTRIBUTION)              */}
        {/* ============================================================== */}
        {showGrantReleaseSection && (
          <View
            style={[
              styles.card,
              { padding: 16, marginBottom: 14 },
              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#94A3B8' : '#64748B', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Grant Release
              </Text>
              <Badge
                label={
                  application?.grant_status === 'Disbursed' || application?.grant_status === 'Released' || application?.grant_status === 'Paid'
                    ? 'Disbursed'
                    : 'Processing'
                }
                variant={
                  application?.grant_status === 'Disbursed' || application?.grant_status === 'Released' || application?.grant_status === 'Paid'
                    ? 'success'
                    : 'info'
                }
              />
            </View>

            {/* Financial Totals Row */}
            <View
              style={[
                styles.financialCard,
                { marginBottom: 14 },
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
            >
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>Authorized</Text>
                <Text style={[styles.financialVal, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatCurrency(totalAuthorized || actualEntitlement || 0)}
                </Text>
              </View>
              <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>Released</Text>
                <Text style={[styles.financialVal, { color: '#16A34A' }]}>
                  {formatCurrency(totalReleased)}
                </Text>
              </View>
              <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
              <View style={styles.financialCol}>
                <Text style={styles.financialLabel}>Remaining</Text>
                <Text style={[styles.financialVal, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                  {formatCurrency(totalRemaining || (totalAuthorized - totalReleased))}
                </Text>
              </View>
            </View>

            {/* Scheduled Releases List */}
            {grantReleases.length > 0 && (
              <View style={{ gap: 10 }}>
                {grantReleases.map((rel) => (
                  <View
                    key={rel.release_code || rel.academic_year}
                    style={{
                      padding: 12,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDarkMode ? '#334155' : '#F1F5F9',
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                        AY {rel.academic_year} • {rel.academic_term}
                      </Text>
                      <Badge
                        label={rel.release_status}
                        variant={
                          rel.release_status === 'Completed' || rel.release_status === 'Released'
                            ? 'success'
                            : rel.release_status === 'In Progress' || rel.release_status === 'Partially Released'
                            ? 'info'
                            : 'neutral'
                        }
                      />
                    </View>
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 8 }}>
                      Release Code: {rel.release_code}
                    </Text>

                    {/* Components Breakdown */}
                    {(rel.components || []).map((comp) => {
                      const isF2F = comp.release_method === 'Face-to-Face';
                      const f2f = comp.f2f_schedule;
                      const inst = comp.institutional_payment;

                      return (
                        <View
                          key={comp.component_id}
                          style={{
                            padding: 10,
                            backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                            borderRadius: 8,
                            marginTop: 6,
                            borderWidth: 1,
                            borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                          }}
                        >
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                              <Badge
                                label={comp.component_type}
                                variant={comp.component_type === 'Stipend' ? 'success' : 'info'}
                              />
                              <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#64748B' }}>
                                {comp.release_method}
                              </Text>
                            </View>
                            <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#FB923C' : '#EA580C' }}>
                              {formatCurrency(comp.amount)}
                            </Text>
                          </View>

                          {/* F2F Schedule info */}
                          {isF2F && f2f && (
                            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#F1F5F9', gap: 3 }}>
                              {f2f.venue_name ? (
                                <Text style={{ fontSize: 11.5, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                                  <Text style={{ fontWeight: '700' }}>Venue: </Text>{f2f.venue_name}
                                </Text>
                              ) : null}
                              {f2f.release_date ? (
                                <Text style={{ fontSize: 11.5, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                                  <Text style={{ fontWeight: '700' }}>Schedule: </Text>{f2f.release_date} {f2f.start_time ? `(${f2f.start_time} - ${f2f.end_time || ''})` : ''}
                                </Text>
                              ) : null}
                              {f2f.claim_reference ? (
                                <Text style={{ fontSize: 12, color: '#EA580C', fontWeight: '700', marginTop: 2 }}>
                                  Claim Ref: {f2f.claim_reference}
                                </Text>
                              ) : null}
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Claim Status</Text>
                                <Badge
                                  label={f2f.claim_status || 'Scheduled'}
                                  variant={getF2FClaimBadgeVariant(f2f.claim_status)}
                                />
                              </View>
                            </View>
                          )}

                          {/* Institutional Payment Info */}
                          {!isF2F && inst && (
                            <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#F1F5F9', gap: 3 }}>
                              <Text style={{ fontSize: 11.5, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                                <Text style={{ fontWeight: '700' }}>Partner School: </Text>{inst.partner_school_name}
                              </Text>
                              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Payment Status</Text>
                                <Badge
                                  label={inst.institutional_status || 'Processing'}
                                  variant={getInstitutionalBadgeVariant(inst.institutional_status)}
                                />
                              </View>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}

        {/* ============================================================== */}
        {/* 6. CLAIMING GUIDELINES (PROGRESSIVE DISCLOSURE)                */}
        {/* ============================================================== */}
        {isReadyForClaim ? (
          <View
            style={[
              styles.card,
              { padding: 16, marginBottom: 14 },
              isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <View style={[styles.reqIconCircle, isDarkMode && { backgroundColor: '#064E3B' }]}>
                <IconSymbol name="info.circle.fill" size={16} color="#16A34A" />
              </View>
              <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                Claiming Guidelines
              </Text>
            </View>

            <View style={{ gap: 8 }}>
              <View style={[styles.reqItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                <Text style={[styles.reqText, isDarkMode && { color: '#CBD5E1' }]}>
                  Present your valid Student ID and one (1) Government-issued ID.
                </Text>
              </View>
              <View style={[styles.reqItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                <Text style={[styles.reqText, isDarkMode && { color: '#CBD5E1' }]}>
                  Bring your Claim Reference code or printout of this schedule.
                </Text>
              </View>
              <View style={[styles.reqItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                <Text style={[styles.reqText, isDarkMode && { color: '#CBD5E1' }]}>
                  Only the registered scholar may claim unless authorized with an SPA.
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              padding: 12,
              backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
              borderRadius: 10,
              borderWidth: 1,
              borderColor: isDarkMode ? '#334155' : '#E2E8F0',
              marginBottom: 14,
            }}
          >
            <IconSymbol name="info.circle" size={15} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <Text style={{ fontSize: 11.5, color: isDarkMode ? '#94A3B8' : '#64748B', flex: 1, lineHeight: 16 }}>
              Claiming guidelines and payout venue details will appear here once your grant is released for claiming.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* SUBMIT CONFIRMATION MODAL */}
      <Modal
        visible={confirmModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => !submitting && setConfirmModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.confirmModalCard, isDarkMode && styles.confirmModalCardDark]}
            accessibilityRole="alert"
          >
            <View style={[styles.confirmIconContainer, isDarkMode && styles.confirmIconContainerDark]}>
              <IconSymbol
                name="doc.text.fill"
                size={26}
                color={isDarkMode ? '#FB923C' : '#EA580C'}
              />
            </View>

            <Text
              style={[styles.confirmModalTitle, isDarkMode && { color: '#F8FAFC' }]}
              accessibilityRole="header"
            >
              Submit Grant Application
            </Text>
            <Text style={[styles.confirmModalSub, isDarkMode && { color: '#94A3B8' }]}>
              {"You're ready to submit your scholarship grant application for review. Once submitted, it will be reviewed according to the scholarship process."}
            </Text>

            <View style={[styles.summaryCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={[styles.summaryRow, isDarkMode && { borderBottomColor: '#1E293B' }]}>
                <Text style={[styles.summaryLabel, isDarkMode && { color: '#94A3B8' }]}>GRANT REFERENCE</Text>
                <Text style={[styles.summaryValueRef, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                  {application?.grant_application_code || '--'}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={[styles.summaryLabel, isDarkMode && { color: '#94A3B8' }]}>INSTITUTION</Text>
                <Text
                  style={[
                    styles.summaryValueInst,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                >
                  {institutionDisplayName}
                </Text>
              </View>
            </View>

            <View style={styles.confirmBtnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, isDarkMode && styles.cancelBtnDark]}
                onPress={() => setConfirmModalVisible(false)}
                disabled={submitting}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Cancel grant submission"
              >
                <Text style={[styles.cancelBtnText, isDarkMode && { color: '#CBD5E1' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.confirmSubmitBtn, { backgroundColor: '#EA580C' }, submitting && styles.primaryBtnDisabled]}
                onPress={handleConfirmSubmit}
                disabled={submitting}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Confirm and submit grant application"
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.confirmSubmitBtnText}>Submit Application</Text>
                    <IconSymbol name="paperplane.fill" size={14} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SUCCESS SUBMISSION MODAL */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.successIconContainer}>
              <IconSymbol name="checkmark.circle.fill" size={48} color="#16A34A" />
            </View>

            <Text style={[styles.successModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Application Submitted Successfully
            </Text>

            <Text style={[styles.successModalSub, isDarkMode && { color: '#94A3B8' }]}>
              Your scholarship grant application has been submitted for evaluation by the City Scholarship Secretariat.
            </Text>

            <View style={[styles.summaryCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Grant Reference</Text>
                <Text style={[styles.summaryValueRef, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                  {submittedResult?.grant_application_code || application?.grant_application_code || '--'}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Badge
                  label={submittedResult?.grant_status || application?.grant_status || 'Submitted'}
                  variant="success"
                />
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { width: '100%', marginTop: 0, backgroundColor: '#EA580C' }]}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default GrantApplicationScreen;
