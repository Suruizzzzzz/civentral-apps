import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
    case 'Paid':
    case 'Released':
      return 'success';
    case 'For Review':
    case 'Under Review':
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

export default function ScholarshipGrantScreen() {
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

  // Navigation Back Action
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
      const [data, releases] = await Promise.all([
        fetchCitizenGrantOverview(),
        fetchCitizenGrantReleases().catch(() => []),
      ]);
      setOverview(data);
      setGrantReleases(releases);

      if (data.has_existing_application && data.application) {
        setApplication(data.application);
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

  // Screen focus auto-refresh (Phase 4D Post-link refresh support)
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

  // Upload Document (COR or SOA) with support for pre-submission replacement and OCR validation
  const handlePickAndUploadDocument = async (docType: 'COR' | 'SOA') => {
    if (!application) {
      Alert.alert('Error', 'Please start the grant application draft first.');
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        // 10MB file size limit validation using shared utility (LOW-03)
        const validation = validateFileSize(asset, 10, docType);
        if (!validation.valid) {
          Alert.alert('File Too Large', validation.errorMessage || `The selected ${docType} file exceeds the maximum limit of 10MB.`);
          return;
        }

        // Reset OCR state to 'checking' immediately on selection/replacement
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
          const validation = await validateCitizenGrantDocument(asset, docType);
          if (validation) {
            setDocValidations((prev) => ({
              ...prev,
              [docType]: {
                status: validation.result,
                result: validation.result,
                detectedCode: validation.detected_document_code,
                expectedCode: validation.expected_document_code,
                message: validation.message,
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
          // OCR error fails gracefully to inconclusive — manual review still permitted
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
      console.error('[ScholarshipGrantScreen] Pick/Upload error:', err);
      Alert.alert('Upload Failed', sanitizeErrorMessage(err?.message, `Failed to upload ${docType}. Please try again.`));
    } finally {
      setUploadingDoc(null);
    }
  };

  // Submit Application triggers confirmation modal
  const handleSubmitApplication = () => {
    if (!application) return;

    // Check pre-submission OCR mismatch guard: Warn citizen if doc type mismatch is detected
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
      console.error('[ScholarshipGrantScreen] Submit error:', err);
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
          <ActivityIndicator size="small" color="#0284C7" />
          <Text style={[styles.ocrCheckingText, isDarkMode && { color: '#38BDF8' }]}>
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderBackButton()}
          <Skeleton height={120} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={200} borderRadius={16} />
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

  const isSubmitted = application?.grant_status === 'Submitted' || (application?.grant_status && application.grant_status !== 'Draft');
  const activeInstType = application?.institution_type || 'Public';
  const docs = application?.documents || [];
  const corDoc = docs.find((d) => d.document_type === 'COR' && d.submission_status !== 'Removed');
  const soaDoc = docs.find((d) => d.document_type === 'SOA' && d.submission_status !== 'Removed');

  const grantStatusText =
    application?.grant_status ||
    (application as any)?.status ||
    (application as any)?.application_status ||
    '--';

  // Phase 4D Institution Resolution & Status Logic
  const institutionId = application?.institution_id ?? overview?.application?.institution_id ?? overview?.institution?.partner_school_id ?? null;
  const isRegistered = institutionId !== null && institutionId !== undefined;

  const institutionDisplayName = isRegistered
    ? (application?.institution_name || overview?.institution?.institution_name || 'Registered Partner Institution')
    : (application?.institution_name_snapshot || application?.institution_name || overview?.application?.institution_name_snapshot || 'Unregistered Institution');

  const institutionCodeDisplay = isRegistered
    ? `${application?.institution_type || overview?.institution?.institution_type || 'Partner'} Institution (${application?.school_code || overview?.institution?.school_code || 'LINKED'})`
    : 'School Verification Pending Secretariat Review';

  const instBadgeLabel = isRegistered ? 'Verified / Linked' : 'Institution Verification Required';
  const instBadgeVariant: 'success' | 'warning' = isRegistered ? 'success' : 'warning';

  // Phase 4D Tuition Component Status
  const tuitionStatusLabel = application?.tuition_status || overview?.tuition_status || (isRegistered ? 'Ready for Processing' : 'On Hold — Institution Verification Required');

  const isTuitionOnHold = tuitionStatusLabel.toLowerCase().includes('hold') || !isRegistered;
  const holdExplanation = application?.hold_explanation || overview?.hold_explanation || 'Institution verification is required before tuition payment can proceed, while stipend processing may continue independently where applicable.';

  // Phase 4D Authoritative Backend Financial Figures (No frontend recalculation)
  const assessedTuition = application?.assessed_eligible_tuition ?? overview?.assessed_eligible_tuition;
  const programTuitionMax = application?.program_tuition_maximum ?? overview?.program_tuition_maximum;
  const actualEntitlement = application?.actual_tuition_grant_entitlement ?? overview?.actual_tuition_grant_entitlement;
  const hasTuitionFigures = assessedTuition !== undefined || programTuitionMax !== undefined || actualEntitlement !== undefined;

  const complianceDocs = docs.filter(
    (d) => d.review_status === 'Needs Replacement' || d.review_status === 'Invalid'
  );
  const isComplianceRequired =
    application?.grant_status === 'For Compliance' || complianceDocs.length > 0;
  const complianceCount = complianceDocs.length;

  const showPaymentSection =
    Boolean(application) &&
    (application?.grant_status === 'Approved for Payroll' ||
      application?.grant_status === 'Approved' ||
      application?.grant_status === 'Processing' ||
      application?.grant_status === 'Disbursed' ||
      application?.grant_status === 'Released' ||
      application?.grant_status === 'Paid' ||
      hasTuitionFigures);

  const showDistributionSection = grantReleases.length > 0;

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderBackButton()}

        {/* PROPER SCHOLARSHIP GRANT MODULE HEADER */}
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

        {/* CURRENT GRANT COMPACT DIRECTORY */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, isDarkMode && styles.sectionHeadingDark]}>
            CURRENT GRANT
          </Text>
          {application && (
            <Badge
              label={grantStatusText}
              variant={getStatusBadgeVariant(grantStatusText)}
            />
          )}
        </View>

        <View style={[styles.recordCard, isDarkMode && styles.recordCardDark]}>
          <View style={[styles.recordRow, isDarkMode && styles.recordRowDark]}>
            <Text style={styles.recordLabel}>Academic Period</Text>
            <Text style={[styles.recordValue, isDarkMode && { color: '#F8FAFC' }]}>
              {currentPeriod ? `${currentPeriod.academic_year} • ${currentPeriod.term}` : '—'}
            </Text>
          </View>
          <View style={[styles.recordRow, isDarkMode && styles.recordRowDark]}>
            <Text style={styles.recordLabel}>Scholar</Text>
            <Text style={[styles.recordValue, isDarkMode && { color: '#F8FAFC' }]}>
              {scholar?.scholar_name || '—'}
            </Text>
          </View>
          <View style={[styles.recordRow, isDarkMode && styles.recordRowDark]}>
            <Text style={styles.recordLabel}>Scholar Code</Text>
            <Text style={[styles.recordValue, isDarkMode && { color: '#F8FAFC' }]}>
              {scholar?.scholar_code || '—'}
            </Text>
          </View>
          <View style={[styles.recordRow, isDarkMode && styles.recordRowDark]}>
            <Text style={styles.recordLabel}>Program</Text>
            <Text style={[styles.recordValue, isDarkMode && { color: '#F8FAFC' }]}>
              {scholar?.program_name || '—'}
            </Text>
          </View>
          {application && (
            <View style={[styles.recordRow, isDarkMode && styles.recordRowDark]}>
              <Text style={styles.recordLabel}>Grant Reference</Text>
              <Text style={[styles.recordValue, { color: isDarkMode ? '#FB923C' : '#EA580C', fontWeight: '700' }]}>
                {application.grant_application_code}
              </Text>
            </View>
          )}
          <View style={[styles.recordRow, isDarkMode && styles.recordRowDark, { borderBottomWidth: 0 }]}>
            <Text style={styles.recordLabel}>Grant Status</Text>
            <Text style={[styles.recordValue, isDarkMode && { color: '#F8FAFC' }, { textTransform: 'uppercase' }]}>
              {grantStatusText}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionDivider, isDarkMode && styles.sectionDividerDark]} />

        {/* ============================================================== */}
        {/* SECTION 1: GRANT APPLICATION                                   */}
        {/* ============================================================== */}
        <View style={styles.sectionHeadingRow}>
          <Text style={[styles.sectionHeading, isDarkMode && styles.sectionHeadingDark]}>
            GRANT APPLICATION
          </Text>
          {application && (
            <Badge
              label={grantStatusText}
              variant={getStatusBadgeVariant(grantStatusText)}
            />
          )}
        </View>

        {!application ? (
          <View
            style={[
              styles.emptyStartCard,
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
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                { width: '100%', maxWidth: 280, marginTop: 4 },
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
          </View>
        ) : (
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            {/* Enrolled Educational Institution */}
            <View style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A', flex: 1, marginRight: 8 }}>
                  Enrolled Educational Institution
                </Text>
              </View>
              <Badge label={instBadgeLabel} variant={instBadgeVariant} />
            </View>

            <View style={[styles.selectorBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.selectorText, isDarkMode && { color: '#F8FAFC' }]}>
                  {institutionDisplayName}
                </Text>
                <Text style={styles.selectorSub}>
                  {institutionCodeDisplay}
                </Text>
              </View>
            </View>

            {isTuitionOnHold && (
              <View style={{ marginTop: 10, backgroundColor: isDarkMode ? '#451A03' : '#FFFBEB', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: isDarkMode ? '#B45309' : '#FDE68A' }}>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#FDE68A' : '#B45309', fontWeight: '600', lineHeight: 16 }}>
                  {holdExplanation}
                </Text>
              </View>
            )}

            {/* Application Under Review Notice */}
            {(application.grant_status === 'Submitted' || application.grant_status === 'Under Review' || application.grant_status === 'For Review') && (
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#F1F5F9' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <IconSymbol name="paperplane.fill" size={14} color={isDarkMode ? '#CBD5E1' : '#475569'} />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                    Application Under Review
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#64748B', lineHeight: 18 }}>
                  Your grant application and submitted documents have been received and are currently undergoing evaluation by the City Scholarship Secretariat.
                </Text>
                {application.submitted_at && (
                  <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
                    Submitted on {new Date(application.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                )}
              </View>
            )}

            {/* If Draft / Unsubmitted: Document Requirements & Upload Action */}
            {!isSubmitted && (
              <View style={{ marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#F1F5F9' }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A', marginBottom: 4 }}>
                  Grant Requirements
                </Text>
                <Text style={{ fontSize: 12, color: '#64748B', marginBottom: 12 }}>
                  {activeInstType === 'Private'
                    ? 'Scholars in Private Institutions must submit both COR and SOA.'
                    : 'Scholars in Public Institutions must submit COR.'}
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
                      style={styles.uploadBtn}
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
                        style={styles.uploadBtn}
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

                {/* Final Submit Button */}
                <TouchableOpacity
                  style={[
                    styles.primaryBtn,
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
            )}
          </View>
        )}

        <View style={[styles.sectionDivider, isDarkMode && styles.sectionDividerDark]} />

        {/* ============================================================== */}
        {/* SECTION 2: GRANT COMPLIANCE                                    */}
        {/* ============================================================== */}
        <View style={[styles.complianceCard, isDarkMode && styles.complianceCardDark]}>
          <View style={styles.sectionHeadingRow}>
            <Text style={[styles.sectionHeading, isDarkMode && styles.sectionHeadingDark]}>
              GRANT COMPLIANCE
            </Text>
            {isComplianceRequired && (
              <Badge
                label={`${complianceCount > 0 ? complianceCount + ' ' : ''}Action Required`}
                variant="warning"
              />
            )}
          </View>

          {isComplianceRequired ? (
            /* STATE C: Submitted + active compliance requests */
            <View
              style={[
                styles.complianceActionBox,
                isDarkMode && styles.complianceActionBoxDark,
              ]}
            >
              <View style={styles.complianceActionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#EA580C" />
                  <Text style={[styles.complianceActionTitle, isDarkMode && { color: '#FB923C' }]}>
                    {complianceCount > 0 ? `${complianceCount} Action Required` : 'Action Required'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.complianceActionSub, isDarkMode && { color: '#FED7AA' }]}>
                Document corrections have been requested.
              </Text>

              {/* Flagged items list */}
              {complianceDocs.map((doc) => (
                <View
                  key={doc.grant_document_id}
                  style={{
                    backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                    padding: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDarkMode ? '#7C2D12' : '#FED7AA',
                    marginTop: 2,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      {doc.document_type === 'COR' ? 'Certificate of Registration (COR)' : 'Statement of Account (SOA)'}
                    </Text>
                    <Badge label={doc.review_status} variant="warning" />
                  </View>
                  {doc.review_remarks ? (
                    <Text style={{ fontSize: 11, color: isDarkMode ? '#FCA5A5' : '#DC2626', marginTop: 4, fontWeight: '600' }}>
                      Secretariat Note: {doc.review_remarks}
                    </Text>
                  ) : null}
                  <TouchableOpacity
                    style={[styles.replaceBtn, { alignSelf: 'flex-start', marginTop: 8 }]}
                    onPress={() => handlePickAndUploadDocument(doc.document_type)}
                    disabled={uploadingDoc === doc.document_type}
                  >
                    {uploadingDoc === doc.document_type ? (
                      <ActivityIndicator size="small" color="#EA580C" />
                    ) : (
                      <>
                        <IconSymbol name="arrow.triangle.2.circlepath" size={12} color="#334155" />
                        <Text style={styles.replaceBtnText}>Replace {doc.document_type} (PDF, PNG, JPG up to 10MB)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              ))}

              <TouchableOpacity
                style={[
                  styles.complianceCtaRow,
                  isDarkMode && styles.complianceCtaRowDark,
                ]}
                onPress={() => router.push('/education/grant/compliance' as any)}
                activeOpacity={0.75}
              >
                <Text style={[styles.complianceCtaText, isDarkMode && { color: '#FB923C' }]}>
                  Open Compliance
                </Text>
                <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#FB923C' : '#EA580C'} />
              </TouchableOpacity>
            </View>
          ) : !isSubmitted ? (
            /* STATE A: Draft / not submitted — informational */
            <View style={{ paddingVertical: 4 }}>
              <Text style={[styles.complianceInfoText, isDarkMode && { color: '#CBD5E1' }]}>
                No compliance requests yet.
              </Text>
              <Text style={[styles.complianceInfoSub, isDarkMode && { color: '#64748B' }]}>
                Compliance requests will appear here if document corrections are requested after your grant application is submitted.
              </Text>
            </View>
          ) : (
            /* STATE B: Submitted + no active compliance requests */
            <View style={styles.compliancePositiveRow}>
              <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
              <Text style={[styles.compliancePositiveText, isDarkMode && { color: '#86EFAC' }]}>
                No active compliance requests.
              </Text>
            </View>
          )}
        </View>

        {showPaymentSection && (
          <View style={[styles.sectionDivider, isDarkMode && styles.sectionDividerDark]} />
        )}

        {/* ============================================================== */}
        {/* SECTION 3: PAYMENT / RELEASE                                   */}
        {/* ============================================================== */}
        {showPaymentSection && (
          <>
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, isDarkMode && styles.sectionHeadingDark]}>
                PAYMENT / RELEASE
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

            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                  Grant Entitlement & Processing
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                  {application?.grant_status || 'Under Review'}
                </Text>
              </View>

              {hasTuitionFigures && (
                <View
                  style={[
                    styles.financialCard,
                    { marginBottom: 0 },
                    isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  ]}
                >
                  <View style={styles.financialCol}>
                    <Text style={styles.financialLabel}>Assessed Tuition</Text>
                    <Text style={[styles.financialVal, isDarkMode && { color: '#F8FAFC' }]}>
                      {assessedTuition !== undefined ? formatCurrency(assessedTuition) : '--'}
                    </Text>
                  </View>
                  <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
                  <View style={styles.financialCol}>
                    <Text style={styles.financialLabel}>Grant Cap</Text>
                    <Text style={[styles.financialVal, { color: '#16A34A' }]}>
                      {programTuitionMax !== undefined ? formatCurrency(programTuitionMax) : '--'}
                    </Text>
                  </View>
                  <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
                  <View style={styles.financialCol}>
                    <Text style={styles.financialLabel}>Actual Entitlement</Text>
                    <Text style={[styles.financialVal, { color: isDarkMode ? '#38BDF8' : '#EA580C' }]}>
                      {actualEntitlement !== undefined ? formatCurrency(actualEntitlement) : '--'}
                    </Text>
                  </View>
                </View>
              )}
            </View>
          </>
        )}

        {showDistributionSection && (
          <View style={[styles.sectionDivider, isDarkMode && styles.sectionDividerDark]} />
        )}

        {/* ============================================================== */}
        {/* SECTION 4: DISTRIBUTION                                        */}
        {/* ============================================================== */}
        {showDistributionSection && (
          <>
            <View style={styles.sectionHeadingRow}>
              <Text style={[styles.sectionHeading, isDarkMode && styles.sectionHeadingDark]}>
                DISTRIBUTION
              </Text>
              <Badge label="Scheduled Releases" variant="info" />
            </View>

            {/* Releases list */}
            <View style={{ gap: 14 }}>
              {grantReleases.map((rel) => (
                <View
                  key={rel.release_code || rel.academic_year}
                  style={[
                    styles.card,
                    { padding: 14, marginBottom: 0 },
                    isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <View>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                        AY {rel.academic_year} • {rel.academic_term}
                      </Text>
                      <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                        Release Code: {rel.release_code}
                      </Text>
                    </View>
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

                  {/* Financial summary */}
                  <View
                    style={[
                      styles.financialCard,
                      { marginBottom: 12 },
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    ]}
                  >
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>Authorized</Text>
                      <Text style={[styles.financialVal, isDarkMode && { color: '#F8FAFC' }]}>
                        {formatCurrency(rel.authorized_amount)}
                      </Text>
                    </View>
                    <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>Released</Text>
                      <Text style={[styles.financialVal, { color: '#16A34A' }]}>
                        {formatCurrency(rel.total_released_amount)}
                      </Text>
                    </View>
                    <View style={[styles.financialDivider, isDarkMode && { backgroundColor: '#334155' }]} />
                    <View style={styles.financialCol}>
                      <Text style={styles.financialLabel}>Remaining</Text>
                      <Text style={[styles.financialVal, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                        {formatCurrency(rel.remaining_amount)}
                      </Text>
                    </View>
                  </View>

                  {/* Components */}
                  <View style={{ gap: 10 }}>
                    {rel.components.map((comp) => {
                      const isF2F = comp.release_method === 'Face-to-Face';
                      const f2f = comp.f2f_schedule;
                      const inst = comp.institutional_payment;

                      return (
                        <View
                          key={comp.component_id}
                          style={[
                            styles.componentBox,
                            isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                          ]}
                        >
                          <View style={styles.componentTopRow}>
                            <View style={styles.componentBadges}>
                              <Badge
                                label={comp.component_type}
                                variant={comp.component_type === 'Stipend' ? 'success' : 'info'}
                              />
                              <Text style={[styles.componentMethod, isDarkMode && { color: '#94A3B8' }]}>
                                {comp.release_method}
                              </Text>
                            </View>
                            <Text style={[styles.componentAmount, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                              {formatCurrency(comp.amount)}
                            </Text>
                          </View>

                          {/* F2F Schedule info */}
                          {isF2F && f2f && (
                            <View style={{ gap: 4, marginTop: 4, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#E2E8F0', paddingTop: 8 }}>
                              {f2f.venue_name ? (
                                <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                                  <Text style={{ fontWeight: '700' }}>Venue: </Text>{f2f.venue_name}
                                </Text>
                              ) : null}
                              {f2f.release_date ? (
                                <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
                                  <Text style={{ fontWeight: '700' }}>Schedule: </Text>{f2f.release_date} {f2f.start_time ? `(${f2f.start_time} - ${f2f.end_time || ''})` : ''}
                                </Text>
                              ) : null}
                              {f2f.claim_reference ? (
                                <Text style={{ fontSize: 12, color: '#EA580C', fontWeight: '700' }}>
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

                          {/* Institutional info */}
                          {!isF2F && inst && (
                            <View style={{ gap: 4, marginTop: 4, borderTopWidth: 1, borderTopColor: isDarkMode ? '#334155' : '#E2E8F0', paddingTop: 8 }}>
                              <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#334155' }}>
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
                </View>
              ))}
            </View>

            {/* Claiming Guidelines Card */}
            <View
              style={[
                styles.reqCard,
                { marginTop: 14, marginBottom: 0 },
                isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
              ]}
            >
              <View style={styles.reqHeaderRow}>
                <View style={[styles.reqIconCircle, isDarkMode && { backgroundColor: '#064E3B' }]}>
                  <IconSymbol name="info.circle.fill" size={18} color="#16A34A" />
                </View>
                <Text style={[styles.reqTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Claiming Guidelines
                </Text>
              </View>
              <View style={styles.reqList}>
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
          </>
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
                style={[styles.confirmSubmitBtn, submitting && styles.primaryBtnDisabled]}
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
              style={[styles.primaryBtn, { width: '100%', marginTop: 0 }]}
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