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

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<GrantApplicationDetail | null>(null);

  // Navigation Back Action
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/dashboard' as any);
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
        color={isDarkMode ? '#38BDF8' : '#0284C7'}
      />
      <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
        Back to Scholarship Dashboard
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
      }
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] Load overview error:', err);
      Alert.alert('Error', err.message || 'Failed to load grant application context.');
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
      Alert.alert('Error', err.message || 'Failed to create grant application draft.');
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

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', `The selected ${docType} file exceeds the maximum limit of 10MB.`);
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
            asset.mimeType || 'application/pdf',
          );
          setApplication(updatedApp);
          Alert.alert('Upload Successful', `${docType} document uploaded successfully.`);
        } catch (uploadErr: any) {
          console.error('[ScholarshipGrantScreen] Document upload error:', uploadErr);
          setDocValidations((prev) => ({
            ...prev,
            [docType]: { status: 'idle' },
          }));
          Alert.alert('Upload Error', uploadErr.message || `Failed to upload ${docType} document.`);
          return;
        } finally {
          setUploadingDoc(null);
        }

        // 2. Independent advisory OCR document-type validation
        try {
          const ocrResult = await validateCitizenGrantDocument(asset, docType);
          if (ocrResult) {
            setDocValidations((prev) => ({
              ...prev,
              [docType]: {
                status: ocrResult.result,
                result: ocrResult.result,
                detectedCode: ocrResult.detected_document_code,
                expectedCode: ocrResult.expected_document_code,
                message: ocrResult.message,
              },
            }));
          } else {
            setDocValidations((prev) => ({
              ...prev,
              [docType]: {
                status: 'error',
                message: 'Automatic document check is unavailable. You can still continue and the document can be reviewed manually.',
              },
            }));
          }
        } catch (ocrErr) {
          console.warn(`[ScholarshipGrantScreen] OCR validation error for ${docType}:`, ocrErr);
          setDocValidations((prev) => ({
            ...prev,
            [docType]: {
              status: 'error',
              message: 'Automatic document check is unavailable. You can still continue and the document can be reviewed manually.',
            },
          }));
        }
      }
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] Document picker error:', err);
      Alert.alert('Error', 'Unable to pick document. Please try again.');
    } finally {
      setUploadingDoc(null);
    }
  };

  // Final Submit Application
  const handleSubmitApplication = async () => {
    if (!application) return;

    const instType = application.institution_type || 'Public';
    const docs = application.documents || [];
    const hasCor = docs.some((d) => d.document_type === 'COR' && d.submission_status !== 'Removed');
    const hasSoa = docs.some((d) => d.document_type === 'SOA' && d.submission_status !== 'Removed');

    if (!hasCor) {
      Alert.alert('Document Required', 'Certificate of Registration (COR) is required before submitting your grant application.');
      return;
    }

    if (instType === 'Private' && !hasSoa) {
      Alert.alert('Document Required', 'Statement of Account (SOA) is required for scholars enrolled in a private institution.');
      return;
    }

    Alert.alert(
      'Confirm Final Submission',
      'Are you sure you want to submit your grant application? After submission, document changes will require Secretariat review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Application',
          onPress: async () => {
            try {
              setSubmitting(true);
              const submittedApp = await submitGrantApplication(application.grant_application_id);
              setApplication(submittedApp);
              setSubmittedResult(submittedApp);
              setSuccessModalVisible(true);
            } catch (err: any) {
              Alert.alert('Submission Error', err.message || 'Failed to submit grant application.');
            } },
        },
      ],
    );
  };


  const getDocumentLabel = (code?: string | null) => {
    switch (code) {
      case 'COR':
        return 'Certificate of Registration (COR)';
      case 'SOA':
        return 'Statement of Account (SOA)';
      case 'COG':
        return 'Certificate of Grades (COG)';
      case 'TOR':
        return 'Transcript of Records (TOR)';
      default:
        return code || 'Unknown';
    }
  };

  const renderOcrFeedback = (docType: 'COR' | 'SOA', expectedLabel: string) => {
    const validation = docValidations[docType];
    if (validation.status === 'idle') {
      return null;
    }

    if (validation.status === 'checking') {
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrCheckingBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' },
          ]}
        >
          <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#0284C7'} />
          <Text style={[styles.ocrCheckingText, isDarkMode && { color: '#38BDF8' }]}>
            Checking document type...
          </Text>
        </View>
      );
    }

    if (validation.status === 'MATCH') {
      const detectedText = getDocumentLabel(validation.detectedCode || validation.expectedCode);
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrMatchBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#052E16', borderColor: '#15803D' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={isDarkMode ? '#4ADE80' : '#16A34A'} />
            <Text style={[styles.ocrMatchHeader, isDarkMode && { color: '#86EFAC' }]}>
              ✓ Document type appears correct
            </Text>
          </View>
          <Text style={[styles.ocrMatchDetail, isDarkMode && { color: '#BBF7D0' }]}>
            Detected: {detectedText}
          </Text>
        </View>
      );
    }

    if (validation.status === 'MISMATCH') {
      const detectedText = getDocumentLabel(validation.detectedCode);
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrMismatchBox,
            { marginTop: 10 },
            isDarkMode && { backgroundColor: '#451A03', borderColor: '#B45309' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={isDarkMode ? '#FBBF24' : '#D97706'} />
            <Text style={[styles.ocrMismatchHeader, isDarkMode && { color: '#FDE68A' }]}>
              ⚠️ Document type may not match
            </Text>
          </View>
          <Text style={[styles.ocrMismatchDetail, isDarkMode && { color: '#FEF08A' }]}>
            Detected: {detectedText}
          </Text>
          <Text style={[styles.ocrMismatchDetail, isDarkMode && { color: '#FEF08A' }]}>
            Expected: {expectedLabel}
          </Text>
        </View>
      );
    }

    if (validation.status === 'INCONCLUSIVE') {
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
              Automatic document check was inconclusive.
            </Text>
          </View>
          <Text style={[styles.ocrInconclusiveDetail, isDarkMode && { color: '#94A3B8' }]}>
            Your document can still be reviewed manually.
          </Text>
        </View>
      );
    }

    if (validation.status === 'error') {
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

  // Phase 4D Stipend & Tuition Component Statuses
  const stipendStatusLabel = application?.stipend_status || overview?.stipend_status || 'Available for Processing';
  const tuitionStatusLabel = application?.tuition_status || overview?.tuition_status || (isRegistered ? 'Ready for Processing' : 'On Hold — Institution Verification Required');

  const isTuitionOnHold = tuitionStatusLabel.toLowerCase().includes('hold') || !isRegistered;
  const holdExplanation = application?.hold_explanation || overview?.hold_explanation || 'Institution verification is required before tuition payment can proceed, while stipend processing may continue independently where applicable.';

  // Phase 4D Authoritative Backend Financial Figures (No frontend recalculation)
  const assessedTuition = application?.assessed_eligible_tuition ?? overview?.assessed_eligible_tuition;
  const programTuitionMax = application?.program_tuition_maximum ?? overview?.program_tuition_maximum;
  const actualEntitlement = application?.actual_tuition_grant_entitlement ?? overview?.actual_tuition_grant_entitlement;
  const hasTuitionFigures = assessedTuition !== undefined || programTuitionMax !== undefined || actualEntitlement !== undefined;

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderBackButton()}

        {/* HEADER / SCHOLARSHIP CONTEXT */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Scholarship Grant Intake</Text>
          <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Current Academic Period: {currentPeriod ? `${currentPeriod.academic_year} — ${currentPeriod.term}` : 'Loading...'}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scholar Name</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.scholar_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scholar Code</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.scholar_code}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Program</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.program_name}</Text>
            </View>
            {application && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grant Reference</Text>
                <Text style={[styles.infoValue, { color: '#0284C7' }]}>{application.grant_application_code}</Text>
              </View>
            )}
            {application && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Application Status</Text>
                <View style={styles.badgeContainer}>
                  <Badge
                    label={grantStatusText}
                    variant={getStatusBadgeVariant(grantStatusText)}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* STEP 1: ENROLLED INSTITUTION (READ-ONLY) */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 6 }]}>
            1. Enrolled Educational Institution
          </Text>

          <View style={{ marginBottom: 8, alignSelf: 'flex-start', maxWidth: '100%' }}>
            <Badge label={instBadgeLabel} variant={instBadgeVariant} />
          </View>

          <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }, { marginBottom: 12 }]}>
            Recorded educational institution for the active scholarship period.
          </Text>

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

          {!application && (
            <TouchableOpacity
              style={[styles.primaryBtn, submitting && styles.primaryBtnDisabled]}
              onPress={handleCreateApplication}
              disabled={submitting}
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

        {/* PHASE 4D: COMPONENT STATUSES & HOLD EXPLANATION */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Grant Processing & Component Breakdown
          </Text>
          <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Status of individual grant components for current period.
          </Text>

          <View style={{ gap: 10, marginTop: 4 }}>
            {/* Stipend Component Status */}
            <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.docHeader}>
                <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Educational Stipend
                </Text>
                <View style={{ maxWidth: '100%', alignSelf: 'flex-start' }}>
                  <Badge label={stipendStatusLabel} variant="success" />
                </View>
              </View>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                Stipend processing runs independently and is unaffected by institution verification.
              </Text>
            </View>

            {/* Tuition Component Status */}
            <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.docHeader}>
                <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Tuition Grant
                </Text>
                <View style={{ maxWidth: '100%', alignSelf: 'flex-start' }}>
                  <Badge
                    label={tuitionStatusLabel}
                    variant={isTuitionOnHold ? 'warning' : 'info'}
                  />
                </View>
              </View>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                {isTuitionOnHold
                  ? 'Tuition payment requires registered partner institution verification by Secretariat.'
                  : 'Partner institution verified. Tuition grant processing ready.'}
              </Text>
            </View>

            {/* Hold Explanation Card */}
            {isTuitionOnHold && (
              <View style={{ backgroundColor: isDarkMode ? '#1E293B' : '#FEF3C7', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#F59E0B', marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#D97706" />
                  <Text style={{ fontSize: 13, fontWeight: '700', color: '#B45309' }}>
                    Tuition Processing Hold Notice
                  </Text>
                </View>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#78350F', lineHeight: 18 }}>
                  {holdExplanation}
                </Text>
              </View>
            )}

            {/* Authoritative Backend Financial Figures */}
            {hasTuitionFigures && (
              <View style={{ marginTop: 8, backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: isDarkMode ? '#334155' : '#E2E8F0' }}>
                <Text style={{ fontSize: 12, fontWeight: '800', color: isDarkMode ? '#38BDF8' : '#0284C7', marginBottom: 8, letterSpacing: 0.5 }}>
                  AUTHORITATIVE TUITION FINANCIAL FIGURES
                </Text>
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Assessed Eligible Tuition</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      {formatCurrency(assessedTuition)}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B' }}>Program Tuition Maximum</Text>
                    <Text style={{ fontSize: 14, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      {formatCurrency(programTuitionMax)}
                    </Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: isDarkMode ? '#334155' : '#CBD5E1', marginVertical: 2 }} />
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>Actual Tuition Grant Entitlement</Text>
                    <Text style={{ fontSize: 15, fontWeight: '800', color: '#16A34A' }}>
                      {formatCurrency(actualEntitlement)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* STEP 2: DOCUMENT REQUIREMENTS & UPLOAD */}
        {application && (
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>2. Grant Requirements</Text>
            <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              {activeInstType === 'Private'
                ? 'Scholars in Private Institutions must submit both COR and SOA.'
                : 'Scholars in Public Institutions must submit COR.'}
            </Text>

            {/* COR Document Card */}
            <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.docHeader}>
                <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Certificate of Registration (COR)
                </Text>
                <Text
                  style={[
                    styles.docReqBadge,
                    corDoc
                      ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                      : { backgroundColor: '#FEF3C7', color: '#B45309' },
                  ]}
                >
                  {corDoc ? '✓ Uploaded' : 'Required'}
                </Text>
              </View>

              {corDoc ? (
                <View>
                  <Text style={styles.docFileName}>{corDoc.file_name}</Text>
                  <Text style={styles.docMeta}>
                    Status: {corDoc.review_status || 'Pending'} • Submitted: {new Date(corDoc.submitted_at).toLocaleDateString()}
                  </Text>
                  {!isSubmitted && (
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => handlePickAndUploadDocument('COR')}
                      disabled={uploadingDoc === 'COR'}
                    >
                      {uploadingDoc === 'COR' ? (
                        <ActivityIndicator size="small" color="#0284C7" />
                      ) : (
                        <>
                          <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                          <Text style={styles.replaceBtnText}>Replace COR Document</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                !isSubmitted && (
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
                        <Text style={styles.uploadBtnText}>Upload COR (PDF/Image)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )
              )}
              {renderOcrFeedback('COR', 'Certificate of Registration (COR)')}
            </View>

            {/* SOA Document Card (Private only) */}
            {activeInstType === 'Private' && (
              <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <View style={styles.docHeader}>
                  <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    Statement of Account (SOA)
                  </Text>
                  <Text
                    style={[
                      styles.docReqBadge,
                      soaDoc
                        ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                        : { backgroundColor: '#FEF3C7', color: '#B45309' },
                    ]}
                  >
                    {soaDoc ? '✓ Uploaded' : 'Required for Private'}
                  </Text>
                </View>

                {soaDoc ? (
                  <View>
                    <Text style={styles.docFileName}>{soaDoc.file_name}</Text>
                    <Text style={styles.docMeta}>
                      Status: {soaDoc.review_status || 'Pending'} • Submitted: {new Date(soaDoc.submitted_at).toLocaleDateString()}
                    </Text>
                    {!isSubmitted && (
                      <TouchableOpacity
                        style={styles.replaceBtn}
                        onPress={() => handlePickAndUploadDocument('SOA')}
                        disabled={uploadingDoc === 'SOA'}
                      >
                        {uploadingDoc === 'SOA' ? (
                          <ActivityIndicator size="small" color="#0284C7" />
                        ) : (
                          <>
                            <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                            <Text style={styles.replaceBtnText}>Replace SOA Document</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  !isSubmitted && (
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
                          <Text style={styles.uploadBtnText}>Upload SOA (PDF/Image)</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )
                )}
                {renderOcrFeedback('SOA', 'Statement of Account (SOA)')}
              </View>
            )}

            {/* FINAL SUBMIT BUTTON */}
            {!isSubmitted && (
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
            )}
          </View>
        )}
      </ScrollView>

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
              Grant Application Submitted
            </Text>

            <Text style={[styles.successModalSub, isDarkMode && { color: '#94A3B8' }]}>
              Your scholarship grant application has been submitted successfully.
            </Text>

            <View style={[styles.summaryCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Grant Reference</Text>
                <Text style={[styles.summaryValueRef, isDarkMode && { color: '#38BDF8' }]}>
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
              style={styles.doneBtn}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}