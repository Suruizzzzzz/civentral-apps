import { formatDate } from '@/utils/dateUtils';
import * as DocumentPicker from 'expo-document-picker';
import { validateFileSize } from '@/src/utils/fileValidation';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';
import { FormDraftService } from '@/src/services/form-draft-service';
import {
  CitizenRenewalOverview,
  fetchCitizenRenewalOverview,
  RequiredDocumentItem,
  submitCitizenRenewal,
  validateCitizenRenewalDocument,
} from './api/renewalApi';
import { styles } from './styles/RenewalApplication.styles';

const scholarshipBg = require('@/assets/images/scholarship-bg.png');

function getRenewalBadgeVariant(status?: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  if (!status) return 'neutral';
  switch (status) {
    case 'Completed':
    case 'Issued':
    case 'Signed':
    case 'For Certificate':
    case 'Recommended for Continuation':
    case 'Active':
      return 'success';
    case 'Submitted':
    case 'Under Review':
    case 'For Evaluation':
    case 'Open for Application':
      return 'info';
    case 'For Compliance':
    case 'Returned':
    case 'Action Required':
      return 'warning';
    case 'Rejected':
    case 'Withdrawn':
    case 'Inactive':
    case 'Window Closed':
    case 'Scholar Inactive':
      return 'danger';
    default:
      return 'neutral';
  }
}

export interface SelectedFileState {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
}

type DocumentValidationStatus = 'idle' | 'checking' | 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE' | 'error';

interface DocumentValidationState {
  status: DocumentValidationStatus;
  result?: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  detectedCode?: string | null;
  expectedCode?: string;
  message?: string;
}

function getDocumentLabel(code?: string | null): string {
  if (!code) return 'Document';
  switch (code.toUpperCase()) {
    case 'COR':
    case 'ENROLLMENT_PROOF':
      return 'Proof of Enrollment (COR)';
    case 'COG':
    case 'ACADEMIC_RECORD':
      return 'Academic Record (COG)';
    case 'SOA':
      return 'Statement of Account (SOA)';
    case 'TOR':
      return 'Transcript of Records (TOR)';
    default:
      return code;
  }
}

function getRequirementDisplayName(doc: { code: string; name?: string }): string {
  if (doc.name && doc.name !== doc.code) return doc.name;
  switch (doc.code.toUpperCase()) {
    case 'ENROLLMENT_PROOF':
    case 'COR':
      return 'Proof of Enrollment';
    case 'ACADEMIC_RECORD':
    case 'COG':
      return 'Academic Record';
    case 'SOA':
      return 'Statement of Account';
    case 'APPEAL_FORM':
      return 'Appeal / Justification Form';
    case 'LOA_DOCUMENT':
      return 'Leave of Absence (LOA) Clearance';
    default:
      return doc.name || doc.code;
  }
}

function getRequirementDescription(doc: { code: string; description?: string }): string {
  if (doc.description) return doc.description;
  switch (doc.code.toUpperCase()) {
    case 'ENROLLMENT_PROOF':
    case 'COR':
      return 'Official Certificate of Registration (COR), Registration Form, or official enrollment document for the upcoming academic period.';
    case 'ACADEMIC_RECORD':
    case 'COG':
      return 'Official Certificate of Grades, Transcript of Records, or Form 137/138 confirming maintaining general weighted average.';
    case 'SOA':
      return 'Assessment slip or breakdown of tuition/school fees (optional for municipal scholars; not mandatory).';
    case 'APPEAL_FORM':
      return 'Formal written appeal letter or academic retention appeal document.';
    case 'LOA_DOCUMENT':
      return 'Approved Leave of Absence clearance or official resumption permit.';
    default:
      return 'Official documentation supporting your scholarship renewal.';
  }
}

function getRequirementLevel(doc: { code: string; requirement_level?: string }): 'Required' | 'Conditional' | 'Optional' {
  if (doc.requirement_level) {
    const level = doc.requirement_level.trim().toLowerCase();
    if (level === 'required') return 'Required';
    if (level === 'conditional') return 'Conditional';
    if (level === 'optional') return 'Optional';
  }
  const code = doc.code.toUpperCase();
  if (code === 'SOA') return 'Optional';
  if (code === 'APPEAL_FORM' || code === 'LOA_DOCUMENT') return 'Conditional';
  return 'Required';
}

export function RenewalApplicationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [overview, setOverview] = useState<CitizenRenewalOverview | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [files, setFiles] = useState<{
    cor: SelectedFileState | null;
    cog: SelectedFileState | null;
    soa: SelectedFileState | null;
  }>({
    cor: null,
    cog: null,
    soa: null,
  });

  const [docValidations, setDocValidations] = useState<{
    cor: DocumentValidationState;
    cog: DocumentValidationState;
    soa: DocumentValidationState;
  }>({
    cor: { status: 'idle' },
    cog: { status: 'idle' },
    soa: { status: 'idle' },
  });

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const hasHydratedRef = useRef<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await fetchCitizenRenewalOverview();
      setOverview(data);

      // Re-hydrate draft if available for this citizen & renewal period
      const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
      const renewalPeriodId = data.renewal_period?.renewal_period_id || 'current';
      if (activeUserId && data.state === 'RENEWAL_AVAILABLE' && !hasHydratedRef.current) {
        try {
          const draft = await FormDraftService.loadDraft<{
            files: {
              cor: SelectedFileState | null;
              cog: SelectedFileState | null;
              soa: SelectedFileState | null;
            };
            docValidations: {
              cor: DocumentValidationState;
              cog: DocumentValidationState;
              soa: DocumentValidationState;
            };
          }>('renewal', activeUserId, renewalPeriodId);

          if (draft && draft.files) {
            const restoredFiles = { cor: null, cog: null, soa: null } as {
              cor: SelectedFileState | null;
              cog: SelectedFileState | null;
              soa: SelectedFileState | null;
            };
            const restoredValidations = {
              cor: { status: 'idle' },
              cog: { status: 'idle' },
              soa: { status: 'idle' },
            } as {
              cor: DocumentValidationState;
              cog: DocumentValidationState;
              soa: DocumentValidationState;
            };

            for (const docType of ['cor', 'cog', 'soa'] as const) {
              const f = draft.files[docType];
              if (f && f.uri) {
                const exists = await FormDraftService.verifyFileExists(f.uri);
                if (exists) {
                  restoredFiles[docType] = f;
                  if (draft.docValidations && draft.docValidations[docType]) {
                    restoredValidations[docType] = draft.docValidations[docType];
                  }
                } else {
                  console.log(`[RenewalApplicationScreen] Draft file for ${docType} (${f.name}) no longer exists in cache.`);
                }
              }
            }
            setFiles(restoredFiles);
            setDocValidations(restoredValidations);
          }
        } catch (draftErr) {
          console.warn('[RenewalApplicationScreen] Draft restoration error:', draftErr);
        } finally {
          hasHydratedRef.current = true;
        }
      } else {
        hasHydratedRef.current = true;
      }
    } catch (err: any) {
      console.error('[RenewalApplicationScreen] loadData error:', err);
      setFetchError(sanitizeErrorMessage(err?.message, 'Unable to load renewal requirements.'));
    } finally {
      setLoading(false);
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

  // Auto-save draft on file selection changes
  useEffect(() => {
    if (!hasHydratedRef.current || !overview || overview.state !== 'RENEWAL_AVAILABLE') {
      return;
    }
    const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
    const renewalPeriodId = overview.renewal_period?.renewal_period_id || 'current';
    if (!activeUserId) return;

    const hasAnyFile = files.cor !== null || files.cog !== null || files.soa !== null;
    if (hasAnyFile) {
      FormDraftService.saveDraft('renewal', activeUserId, renewalPeriodId, {
        files,
        docValidations,
      }).catch((saveErr) => {
        console.warn('[RenewalApplicationScreen] Failed to save draft:', saveErr);
      });
    }
  }, [files, docValidations, overview]);

  const handlePickDocument = async (docType: 'cor' | 'cog' | 'soa') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return;
      }

      const asset = result.assets[0];

      // Validate file size (<= 10MB)
      const sizeValidation = validateFileSize(asset, 10, docType.toUpperCase());
      if (!sizeValidation.valid) {
        Alert.alert('File Too Large', sizeValidation.errorMessage || 'The selected file exceeds the 10MB limit.');
        return;
      }

      const selectedFile: SelectedFileState = {
        name: asset.name,
        size: asset.size,
        uri: asset.uri,
        mimeType: asset.mimeType || undefined,
      };

      setFiles((prev) => ({
        ...prev,
        [docType]: selectedFile,
      }));

      // Trigger OCR Pre-Validation
      runDocumentPreValidation(docType, asset);
    } catch (err: any) {
      console.error('[RenewalApplicationScreen] File pick error:', err);
      Alert.alert('File Selection Failed', sanitizeErrorMessage(err?.message, 'Could not select the specified file.'));
    }
  };

  const runDocumentPreValidation = async (docType: 'cor' | 'cog' | 'soa', asset: DocumentPicker.DocumentPickerAsset) => {
    const expectedCodeMap: Record<string, string> = {
      cor: 'COR',
      cog: 'COG',
      soa: 'SOA',
    };
    const expectedCode = expectedCodeMap[docType];

    setDocValidations((prev) => ({
      ...prev,
      [docType]: {
        status: 'checking',
        expectedCode,
      },
    }));

    try {
      const validationResponse = await validateCitizenRenewalDocument(asset, expectedCode);

      if (validationResponse && validationResponse.result) {
        setDocValidations((prev) => ({
          ...prev,
          [docType]: {
            status: validationResponse.result,
            result: validationResponse.result,
            detectedCode: validationResponse.detected_document_code,
            expectedCode: validationResponse.expected_document_code,
            message: validationResponse.message,
          },
        }));
      } else {
        setDocValidations((prev) => ({
          ...prev,
          [docType]: {
            status: 'INCONCLUSIVE',
            result: 'INCONCLUSIVE',
            expectedCode,
          },
        }));
      }
    } catch (ocrErr: any) {
      console.warn(`[RenewalApplicationScreen] OCR validation non-blocking warning for ${docType}:`, ocrErr);
      setDocValidations((prev) => ({
        ...prev,
        [docType]: {
          status: 'error',
          expectedCode,
          message: ocrErr?.message || 'Automatic document check unavailable.',
        },
      }));
    }
  };

  const isFormComplete = Boolean(files.cor && files.cog);

  const handleSubmitPress = () => {
    if (!isFormComplete) {
      Alert.alert('Missing Documents', 'Please select both your Proof of Enrollment (COR) and Academic Record (COG) before applying.');
      return;
    }

    const hasMismatch = docValidations.cor.status === 'MISMATCH' || docValidations.cog.status === 'MISMATCH';
    if (hasMismatch) {
      Alert.alert(
        'Document Type Advisory',
        'One or more uploaded documents appear to differ from what is expected. You can still submit your renewal, but your application may be delayed or returned if the documents are incorrect.\n\nDo you want to proceed?',
        [
          { text: 'Review Files', style: 'cancel' },
          { text: 'Proceed', onPress: () => setShowConfirmModal(true) },
        ]
      );
      return;
    }

    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setSubmitting(true);
    setSubmitError(null);

    try {
      const formData = new FormData();

      if (files.cor) {
        formData.append('cor', {
          uri: files.cor.uri,
          name: files.cor.name,
          type: files.cor.mimeType || 'application/pdf',
        } as any);
        formData.append('enrollment_proof', {
          uri: files.cor.uri,
          name: files.cor.name,
          type: files.cor.mimeType || 'application/pdf',
        } as any);
      }

      if (files.cog) {
        formData.append('cog', {
          uri: files.cog.uri,
          name: files.cog.name,
          type: files.cog.mimeType || 'application/pdf',
        } as any);
        formData.append('academic_record', {
          uri: files.cog.uri,
          name: files.cog.name,
          type: files.cog.mimeType || 'application/pdf',
        } as any);
      }

      if (files.soa) {
        formData.append('soa', {
          uri: files.soa.uri,
          name: files.soa.name,
          type: files.soa.mimeType || 'application/pdf',
        } as any);
      }

      await submitCitizenRenewal(formData);

      // Clear draft upon successful submission
      const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
      const renewalPeriodId = overview?.renewal_period?.renewal_period_id || 'current';
      if (activeUserId) {
        await FormDraftService.clearDraft('renewal', activeUserId, renewalPeriodId).catch(() => {});
      }

      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('[RenewalApplicationScreen] submit error:', err);
      setSubmitError(sanitizeErrorMessage(err?.message, 'Failed to submit scholarship renewal. Please check your network and try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  const renderOcrFeedback = (docType: 'cor' | 'cog' | 'soa', expectedLabel: string) => {
    const validation = docValidations[docType];
    const selectedFile = files[docType];
    if (!selectedFile || validation.status === 'idle') {
      return null;
    }

    if (validation.status === 'checking') {
      return (
        <View
          style={[
            styles.ocrFeedbackBox,
            styles.ocrCheckingBox,
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
            isDarkMode && { backgroundColor: '#451A03', borderColor: '#B45309' },
          ]}
        >
          <View style={styles.ocrHeaderRow}>
            <IconSymbol name="exclamationmark.triangle.fill" size={14} color={isDarkMode ? '#FBBF24' : '#D97706'} />
            <Text style={[styles.ocrMismatchHeader, isDarkMode && { color: '#FDE68A' }]}>
              ⚠ Document type may not match
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

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

  const canApply = overview?.state === 'RENEWAL_AVAILABLE';

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/renewal' as any);
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
        color={isDarkMode ? '#4ADE80' : '#15803D'}
      />
      <Text style={[styles.backText, isDarkMode && { color: '#4ADE80' }]}>
        Back to Scholarship Renewal
      </Text>
    </TouchableOpacity>
  );

  const getStatusConfig = () => {
    const renewalStatus = overview?.renewal?.renewal_status;
    const citizenActionRequired = overview?.renewal?.citizen_action_required;

    if (overview?.state === 'RENEWAL_EXISTS') {
      switch (renewalStatus) {
        case 'Completed':
          return {
            icon: 'checkmark.circle.fill',
            color: '#16A34A',
            bgLight: '#F0FDF4',
            bgDark: '#052E16',
            borderLight: '#BBF7D0',
            borderDark: '#166534',
            title: 'Renewal Completed',
            description: 'Your scholarship renewal application has been completed. No further submission is required.',
          };
        case 'For Certificate':
        case 'Recommended for Continuation':
          return {
            icon: 'doc.badge.arrow.up.fill',
            color: '#16A34A',
            bgLight: '#F0FDF4',
            bgDark: '#052E16',
            borderLight: '#BBF7D0',
            borderDark: '#166534',
            title: 'Approved — For Certificate',
            description: 'Your renewal has been approved by the coordinator and is awaiting official certificate issuance.',
          };
        case 'For Compliance':
        case 'Returned':
          return {
            icon: 'exclamationmark.triangle.fill',
            color: '#D97706',
            bgLight: '#FFFBEB',
            bgDark: '#451A03',
            borderLight: '#FDE68A',
            borderDark: '#B45309',
            title: 'Action Required',
            description: citizenActionRequired
              ? 'Document corrections or replacements have been requested for your renewal. Please resolve this through Renewal Compliance.'
              : 'Document corrections may be requested for your renewal. Please check Renewal Compliance.',
          };
        case 'Under Review':
        case 'For Evaluation':
          return {
            icon: 'clock.fill',
            color: '#0284C7',
            bgLight: '#F0F9FF',
            bgDark: '#082F49',
            borderLight: '#BAE6FD',
            borderDark: '#0369A1',
            title: 'Under Review',
            description: 'Your renewal application and academic records are undergoing evaluation by the scholarship committee.',
          };
        case 'Submitted':
        default:
          if (citizenActionRequired) {
            return {
              icon: 'exclamationmark.triangle.fill',
              color: '#D97706',
              bgLight: '#FFFBEB',
              bgDark: '#451A03',
              borderLight: '#FDE68A',
              borderDark: '#B45309',
              title: 'Action Required',
              description: 'Document corrections or replacements have been requested for your renewal. Please resolve this through Renewal Compliance.',
            };
          }
          return {
            icon: 'checkmark.seal.fill',
            color: '#0284C7',
            bgLight: '#F0F9FF',
            bgDark: '#082F49',
            borderLight: '#BAE6FD',
            borderDark: '#0369A1',
            title: 'Application Submitted',
            description: 'Your renewal application has been submitted and is currently queued for coordinator verification.',
          };
      }
    }

    if (overview?.state === 'RENEWAL_AVAILABLE') {
      return {
        icon: 'pencil.circle.fill',
        color: '#15803D',
        bgLight: '#F0FDF4',
        bgDark: '#052E16',
        borderLight: '#BBF7D0',
        borderDark: '#166534',
        title: 'Renewal Application Open',
        description: 'The renewal intake window is active. Please upload your required enrollment and academic records to submit for review.',
      };
    }

    if (overview?.state === 'RENEWAL_NOT_OPEN') {
      return {
        icon: 'clock.fill',
        color: '#D97706',
        bgLight: '#FFFBEB',
        bgDark: '#451A03',
        borderLight: '#FDE68A',
        borderDark: '#B45309',
        title: 'Renewal Period Closed',
        description: 'The official scholarship renewal period is not currently open. Please monitor announcements from the Education Department.',
      };
    }

    if (overview?.state === 'SCHOLAR_INACTIVE') {
      return {
        icon: 'xmark.circle.fill',
        color: '#DC2626',
        bgLight: '#FEF2F2',
        bgDark: '#450A0A',
        borderLight: '#FCA5A5',
        borderDark: '#991B1B',
        title: 'Scholar Account Inactive',
        description: 'Your scholar account is currently marked as inactive. Renewal submissions are restricted.',
      };
    }

    return {
      icon: 'info.circle.fill',
      color: '#2563EB',
      bgLight: '#EFF6FF',
      bgDark: '#0F243A',
      borderLight: '#BFDBFE',
      borderDark: '#1E40AF',
      title: 'Municipal Scholars Only',
      description: 'Scholarship renewal is available exclusively for active municipal scholars.',
    };
  };

  const getHeaderBadgeText = () => {
    if (overview?.renewal?.renewal_status) {
      return overview.renewal.renewal_status;
    }
    if (overview?.state === 'RENEWAL_AVAILABLE') {
      return 'Open for Application';
    }
    if (overview?.state === 'RENEWAL_NOT_OPEN') {
      return 'Window Closed';
    }
    if (overview?.state === 'SCHOLAR_INACTIVE') {
      return 'Scholar Inactive';
    }
    return overview?.scholar?.scholar_status || 'Scholarship';
  };

  const currentPeriod = overview?.current_academic_period || overview?.renewal_period;
  const periodText = currentPeriod
    ? `${currentPeriod.academic_year} • ${currentPeriod.term}`
    : 'Current Academic Period';
  const statusConfig = getStatusConfig();

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 140 }]}
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#4ADE80' : '#15803D'}
          colors={['#15803D']}
        />
      }
    >
      {renderBackButton()}

      {/* SKELETON OR CONTENT */}
      {loading ? (
        <View style={{ gap: 14 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={100} borderRadius={16} />
          <Skeleton height={180} borderRadius={16} />
        </View>
      ) : fetchError ? (
        <View style={[styles.card, { alignItems: 'center', padding: 24 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="exclamationmark.triangle.fill" size={36} color="#EF4444" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444', marginTop: 8 }}>
            Unable to Load Form
          </Text>
          <Text style={{ fontSize: 13, color: isDarkMode ? '#94A3B8' : '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
            {fetchError}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#15803D', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 }}
            onPress={loadData}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : submitSuccess ? (
        /* SUCCESS SCREEN STATE */
        <View style={[styles.card, { alignItems: 'center', paddingVertical: 36 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="checkmark.circle.fill" size={56} color="#16A34A" />
          <Text style={[styles.programTitle, { fontSize: 22, marginTop: 16, textAlign: 'center' }, isDarkMode && { color: '#F8FAFC' }]}>
            Renewal Submitted
          </Text>
          <Text style={[styles.sectionDescription, { textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }, isDarkMode && { color: '#94A3B8' }]}>
            Your scholarship renewal application has been submitted successfully and is now queued for coordinator review.
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { marginTop: 24, paddingHorizontal: 28 }]}
            onPress={() => router.replace('/education/renewal' as any)}
          >
            <Text style={styles.submitBtnText}>Return to Scholarship Renewal</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* 1. COMPACT RENEWAL IDENTITY CARD */}
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.headerMainRow}>
              {/* Left Column: Status Badge, Category, Program Title, Academic Period */}
              <View style={styles.headerTextCol}>
                <View style={styles.headerBadgeWrap}>
                  <Badge
                    label={getHeaderBadgeText()}
                    variant={getRenewalBadgeVariant(getHeaderBadgeText())}
                  />
                  {overview?.program?.category_name && (
                    <Badge variant="neutral" label={overview.program.category_name} />
                  )}
                </View>
                <Text
                  style={[styles.headerProgramTitle, isDarkMode && { color: '#F8FAFC' }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {overview?.program?.program_name || 'Academic Scholarship'}
                </Text>
                <Text
                  style={[styles.headerAcademicPeriod, isDarkMode && { color: '#CBD5E1' }]}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {periodText}
                </Text>
              </View>

              {/* Right Column: Scholarship Artwork inside Green-tinted container */}
              <View style={[styles.headerArtworkBox, isDarkMode && styles.headerArtworkBoxDark]}>
                <Image
                  source={scholarshipBg}
                  style={styles.headerArtworkImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            {/* Secondary Metadata: Program Code & Scholar Code */}
            {(overview?.program?.program_code || overview?.scholar?.scholar_code) && (
              <View style={[styles.headerMetaDividerRow, isDarkMode && { borderTopColor: '#334155' }]}>
                {overview?.program?.program_code ? (
                  <Text style={[styles.headerMetaText, isDarkMode && { color: '#94A3B8' }]}>
                    Program: <Text style={{ fontWeight: '600', color: isDarkMode ? '#CBD5E1' : '#334155' }}>{overview.program.program_code}</Text>
                  </Text>
                ) : null}
                {overview?.scholar?.scholar_code ? (
                  <Text style={[styles.headerMetaText, isDarkMode && { color: '#94A3B8' }]}>
                    Scholar: <Text style={{ fontWeight: '600', color: isDarkMode ? '#CBD5E1' : '#334155' }}>{overview.scholar.scholar_code}</Text>
                  </Text>
                ) : null}
              </View>
            )}
          </View>

          {/* 2. STATUS HERO (AUTHORITATIVE, SEMANTIC, STATE-DRIVEN) */}
          <View
            style={[
              styles.card,
              styles.statusHeroCard,
              {
                backgroundColor: isDarkMode ? statusConfig.bgDark : statusConfig.bgLight,
                borderColor: isDarkMode ? statusConfig.borderDark : statusConfig.borderLight,
              },
            ]}
          >
            <View style={styles.statusHeroHeader}>
              <IconSymbol name={statusConfig.icon as any} size={18} color={statusConfig.color} />
              <Text style={[styles.statusHeroTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {statusConfig.title}
              </Text>
            </View>
            <Text style={[styles.statusHeroDesc, isDarkMode && { color: '#CBD5E1' }]}>
              {statusConfig.description}
            </Text>

            {/* Submitted Date Timestamp if existing renewal */}
            {overview?.renewal?.submitted_at && (
              <Text style={[styles.statusHeroMeta, isDarkMode && { color: '#94A3B8' }]}>
                Submitted {formatDate(overview.renewal.submitted_at)}
              </Text>
            )}

            {/* Action Required: CTA to open Renewal Compliance */}
            {(overview?.renewal?.citizen_action_required || overview?.renewal?.renewal_status === 'For Compliance' || overview?.renewal?.renewal_status === 'Returned') && (
              <TouchableOpacity
                style={styles.complianceActionBtn}
                onPress={() => router.push('/education/renewal/compliance' as any)}
                activeOpacity={0.8}
              >
                <Text style={styles.complianceActionBtnText}>Open Renewal Compliance</Text>
                <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            )}
          </View>

          {/* 3. RENEWAL DETAILS (COMPACT KEY/VALUE ROWS) */}
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={[styles.cardSectionLabel, isDarkMode && { color: '#94A3B8' }]}>
                RENEWAL DETAILS
              </Text>
            </View>

            {overview?.renewal?.renewal_code && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Code</Text>
                <Text style={[styles.detailCodeValue, isDarkMode && { color: '#4ADE80' }]}>
                  {overview.renewal.renewal_code}
                </Text>
              </View>
            )}

            {overview?.renewal?.renewal_status && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Status</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {overview.renewal.renewal_status}
                </Text>
              </View>
            )}

            {overview?.renewal?.submitted_at && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted On</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatDate(overview.renewal.submitted_at)}
                </Text>
              </View>
            )}

            {overview?.current_academic_period && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {overview.current_academic_period.academic_year} — {overview.current_academic_period.term}
                </Text>
              </View>
            )}

            {overview?.renewal_period ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Window</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatDate(overview.renewal_period.opening_date)} — {formatDate(overview.renewal_period.closing_date)}
                </Text>
              </View>
            ) : overview?.upcoming_renewal_period ? (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Upcoming Window</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {formatDate(overview.upcoming_renewal_period.opening_date)} — {formatDate(overview.upcoming_renewal_period.closing_date)}
                </Text>
              </View>
            ) : null}

            {overview?.renewal?.certificate && (
              <>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Certificate No.</Text>
                  <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                    {overview.renewal.certificate.certificate_number}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Certificate Status</Text>
                  <Text style={[styles.detailValue, { color: '#16A34A' }, isDarkMode && { color: '#4ADE80' }]}>
                    {overview.renewal.certificate.certificate_status}
                  </Text>
                </View>
              </>
            )}

            {!overview?.renewal && (
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, isDarkMode && { color: '#94A3B8' }]}>Intake Status</Text>
                <Text style={[styles.detailValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {canApply
                    ? 'Open for Application'
                    : overview?.state === 'RENEWAL_NOT_OPEN'
                      ? 'Window Closed'
                      : overview?.state === 'SCHOLAR_INACTIVE'
                        ? 'Scholar Inactive'
                        : 'Not a Scholar'}
                </Text>
              </View>
            )}
          </View>

          {/* 4. ACTIVE SUBMISSION WORKFLOW: RENEWAL_AVAILABLE ONLY */}
          {canApply && (
            <>
              {/* Dynamic Required Renewal Documents */}
              <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Required Renewal Documents
                </Text>
                <Text style={[styles.sectionDescription, isDarkMode && { color: '#94A3B8' }]}>
                  The following canonical documents are evaluated during the scholarship renewal review process:
                </Text>

                {(() => {
                  const apiDocs: (RequiredDocumentItem & { requirement_level?: string })[] =
                    overview?.required_documents && overview.required_documents.length > 0
                      ? [...overview.required_documents]
                      : [
                          {
                            code: 'ENROLLMENT_PROOF',
                            name: 'Proof of Enrollment',
                            description:
                              'Official Certificate of Registration (COR), Registration Form, or official enrollment document for the upcoming academic period.',
                            requirement_level: 'Required',
                          },
                          {
                            code: 'ACADEMIC_RECORD',
                            name: 'Academic Record',
                            description:
                              'Official Certificate of Grades, Transcript of Records, or Form 137/138 confirming maintaining general weighted average.',
                            requirement_level: 'Required',
                          },
                        ];

                  // Ensure Statement of Account (SOA) is present and visibly marked Optional
                  const hasSoa = apiDocs.some((d) => d.code.toUpperCase() === 'SOA');
                  const displayRequirements = hasSoa
                    ? apiDocs
                    : [
                        ...apiDocs,
                        {
                          code: 'SOA',
                          name: 'Statement of Account',
                          description:
                            'Assessment slip or breakdown of tuition/school fees (optional for municipal scholars; not mandatory).',
                          requirement_level: 'Optional',
                        },
                      ];

                  return displayRequirements.map((doc, idx) => {
                    const level = getRequirementLevel(doc);
                    const name = getRequirementDisplayName(doc);
                    const desc = getRequirementDescription(doc);

                    const isRequired = level === 'Required';
                    const isConditional = level === 'Conditional';

                    const iconName = isRequired
                      ? 'checkmark.circle.fill'
                      : isConditional
                        ? 'exclamationmark.circle.fill'
                        : 'info.circle.fill';

                    const iconColor = isRequired
                      ? (isDarkMode ? '#4ADE80' : '#15803D')
                      : isConditional
                        ? (isDarkMode ? '#FDE68A' : '#D97706')
                        : (isDarkMode ? '#94A3B8' : '#64748B');

                    const circleBg = isRequired
                      ? (isDarkMode ? '#064E3B' : '#DCFCE7')
                      : isConditional
                        ? (isDarkMode ? '#451A03' : '#FEF3C7')
                        : (isDarkMode ? '#0F172A' : '#F1F5F9');

                    const badgeBg = isRequired
                      ? (isDarkMode ? '#064E3B' : '#DCFCE7')
                      : isConditional
                        ? (isDarkMode ? '#451A03' : '#FEF3C7')
                        : (isDarkMode ? '#1E293B' : '#F1F5F9');

                    const badgeBorder = isRequired
                      ? (isDarkMode ? '#059669' : '#BBF7D0')
                      : isConditional
                        ? (isDarkMode ? '#78350F' : '#FDE68A')
                        : (isDarkMode ? '#475569' : '#CBD5E1');

                    const badgeTextColor = isRequired
                      ? (isDarkMode ? '#A7F3D0' : '#15803D')
                      : isConditional
                        ? (isDarkMode ? '#FDE68A' : '#B45309')
                        : (isDarkMode ? '#94A3B8' : '#64748B');

                    return (
                      <View
                        key={`${doc.code}-${idx}`}
                        style={[styles.requirementItem, isDarkMode && { borderColor: '#334155' }]}
                      >
                        <View style={[styles.requirementIconCircle, { backgroundColor: circleBg }]}>
                          <IconSymbol name={iconName} size={16} color={iconColor} />
                        </View>
                        <View style={styles.requirementContent}>
                          <View style={styles.requirementHeaderRow}>
                            <Text style={[styles.requirementName, isDarkMode && { color: '#F8FAFC' }]}>
                              {name}
                            </Text>
                            <View
                              style={[
                                styles.requirementBadge,
                                { backgroundColor: badgeBg, borderColor: badgeBorder },
                              ]}
                            >
                              <Text style={[styles.requirementBadgeText, { color: badgeTextColor }]}>
                                {level}
                              </Text>
                            </View>
                          </View>
                          <Text style={[styles.requirementDesc, isDarkMode && { color: '#94A3B8' }]}>
                            {desc}
                          </Text>
                        </View>
                      </View>
                    );
                  });
                })()}
              </View>

              {/* SUBMIT ERROR BANNER */}
              {submitError && (
                <View style={[styles.noticeBox, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5' }]}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#DC2626" />
                  <Text style={[styles.noticeText, { color: '#991B1B' }]}>
                    {submitError}
                  </Text>
                </View>
              )}

              {/* Upload Documents Section */}
              <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Upload Documents
                </Text>
                <Text style={[styles.sectionDescription, isDarkMode && { color: '#94A3B8' }]}>
                  Attach your official PDF, JPG, or PNG files (up to 10MB each). Files will be automatically checked for document validity.
                </Text>

                {/* 1. PROOF OF ENROLLMENT (COR) */}
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#0B132B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docHeaderLeft}>
                      <View style={[styles.docIconWrapper, isDarkMode && { backgroundColor: '#064E3B' }]}>
                        <IconSymbol name="doc.text.fill" size={16} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                      </View>
                      <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        Proof of Enrollment
                      </Text>
                    </View>
                    <View style={[styles.docCodeBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                      <Text style={[styles.docCodeText, isDarkMode && { color: '#A7F3D0' }]}>REQUIRED</Text>
                    </View>
                  </View>
                  <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
                    Certificate of Registration (COR) or enrollment proof for the upcoming academic period.
                  </Text>

                  <View style={[
                    styles.fileStatusBox,
                    files.cor ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.cor && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.cor && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.cor ? files.cor.name : 'Not selected'}
                      </Text>
                      {files.cor?.size ? (
                        <Text style={[styles.fileSize, isDarkMode && { color: '#A7F3D0' }]}>
                          {formatFileSize(files.cor.size)}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[
                        files.cor ? styles.replaceBtn : styles.pickBtn,
                        isDarkMode && files.cor && { backgroundColor: '#064E3B', borderColor: '#059669' },
                      ]}
                      onPress={() => handlePickDocument('cor')}
                      activeOpacity={0.8}
                    >
                      <IconSymbol
                        name={files.cor ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'}
                        size={14}
                        color={files.cor ? (isDarkMode ? '#4ADE80' : '#15803D') : '#FFFFFF'}
                      />
                      <Text style={[files.cor ? styles.replaceBtnText : styles.pickBtnText, isDarkMode && files.cor && { color: '#4ADE80' }]}>
                        {files.cor ? 'Replace' : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {renderOcrFeedback('cor', 'Proof of Enrollment (COR)')}
                </View>

                {/* 2. ACADEMIC RECORD (COG) */}
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#0B132B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docHeaderLeft}>
                      <View style={[styles.docIconWrapper, isDarkMode && { backgroundColor: '#064E3B' }]}>
                        <IconSymbol name="chart.bar.fill" size={16} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                      </View>
                      <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        Academic Record
                      </Text>
                    </View>
                    <View style={[styles.docCodeBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                      <Text style={[styles.docCodeText, isDarkMode && { color: '#A7F3D0' }]}>REQUIRED</Text>
                    </View>
                  </View>
                  <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
                    Certificate of Grades (COG) or official transcript of records from the preceding term.
                  </Text>

                  <View style={[
                    styles.fileStatusBox,
                    files.cog ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.cog && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.cog && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.cog ? files.cog.name : 'Not selected'}
                      </Text>
                      {files.cog?.size ? (
                        <Text style={[styles.fileSize, isDarkMode && { color: '#A7F3D0' }]}>
                          {formatFileSize(files.cog.size)}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[
                        files.cog ? styles.replaceBtn : styles.pickBtn,
                        isDarkMode && files.cog && { backgroundColor: '#064E3B', borderColor: '#059669' },
                      ]}
                      onPress={() => handlePickDocument('cog')}
                      activeOpacity={0.8}
                    >
                      <IconSymbol
                        name={files.cog ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'}
                        size={14}
                        color={files.cog ? (isDarkMode ? '#4ADE80' : '#15803D') : '#FFFFFF'}
                      />
                      <Text style={[files.cog ? styles.replaceBtnText : styles.pickBtnText, isDarkMode && files.cog && { color: '#4ADE80' }]}>
                        {files.cog ? 'Replace' : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {renderOcrFeedback('cog', 'Academic Record (COG)')}
                </View>

                {/* 3. STATEMENT OF ACCOUNT (OPTIONAL) */}
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#0B132B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docHeaderLeft}>
                      <View style={[styles.docIconWrapper, isDarkMode && { backgroundColor: '#1E293B' }]}>
                        <IconSymbol name="receipt.fill" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                      </View>
                      <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                        Statement of Account
                      </Text>
                    </View>
                    <View style={[styles.docCodeBadge, { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' }]}>
                      <Text style={[styles.docCodeText, { color: isDarkMode ? '#94A3B8' : '#64748B' }]}>OPTIONAL</Text>
                    </View>
                  </View>
                  <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
                    Official statement of tuition fees or assessment slip (optional; not required for renewal approval).
                  </Text>

                  <View style={[
                    styles.fileStatusBox,
                    files.soa ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.soa && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.soa && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.soa ? files.soa.name : 'Not selected (Optional)'}
                      </Text>
                      {files.soa?.size ? (
                        <Text style={[styles.fileSize, isDarkMode && { color: '#A7F3D0' }]}>
                          {formatFileSize(files.soa.size)}
                        </Text>
                      ) : null}
                    </View>

                    <TouchableOpacity
                      style={[
                        files.soa ? styles.replaceBtn : styles.pickBtn,
                        isDarkMode && files.soa && { backgroundColor: '#064E3B', borderColor: '#059669' },
                      ]}
                      onPress={() => handlePickDocument('soa')}
                      activeOpacity={0.8}
                    >
                      <IconSymbol
                        name={files.soa ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'}
                        size={14}
                        color={files.soa ? (isDarkMode ? '#4ADE80' : '#15803D') : '#FFFFFF'}
                      />
                      <Text style={[files.soa ? styles.replaceBtnText : styles.pickBtnText, isDarkMode && files.soa && { color: '#4ADE80' }]}>
                        {files.soa ? 'Replace' : 'Select'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {renderOcrFeedback('soa', 'Statement of Account (SOA)')}
                </View>
              </View>

              {/* Submission Summary */}
              <View style={[styles.reviewCard, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                <Text style={[styles.reviewTitle, isDarkMode && { color: '#4ADE80' }]}>
                  Submission Summary
                </Text>

                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#A7F3D0' }]}>Proof of Enrollment (COR)</Text>
                  <View style={styles.reviewBadge}>
                    <IconSymbol name={files.cor ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={14} color={files.cor ? '#16A34A' : '#DC2626'} />
                    <Text style={[styles.reviewStatusText, { color: files.cor ? (isDarkMode ? '#4ADE80' : '#16A34A') : '#DC2626' }]}>
                      {files.cor ? 'Selected' : 'Missing'}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#A7F3D0' }]}>Academic Record (COG)</Text>
                  <View style={styles.reviewBadge}>
                    <IconSymbol name={files.cog ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={14} color={files.cog ? '#16A34A' : '#DC2626'} />
                    <Text style={[styles.reviewStatusText, { color: files.cog ? (isDarkMode ? '#4ADE80' : '#16A34A') : '#DC2626' }]}>
                      {files.cog ? 'Selected' : 'Missing'}
                    </Text>
                  </View>
                </View>

                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#A7F3D0' }]}>Statement of Account (SOA)</Text>
                  <View style={styles.reviewBadge}>
                    <IconSymbol name={files.soa ? 'checkmark.circle.fill' : 'info.circle.fill'} size={14} color={files.soa ? '#16A34A' : '#94A3B8'} />
                    <Text style={[styles.reviewStatusText, { color: files.soa ? (isDarkMode ? '#4ADE80' : '#16A34A') : (isDarkMode ? '#94A3B8' : '#64748B') }]}>
                      {files.soa ? 'Selected' : 'Not Provided (Optional)'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Apply for Renewal Button */}
              <TouchableOpacity
                style={[
                  styles.submitBtn,
                  (!isFormComplete || submitting) && styles.submitBtnDisabled,
                ]}
                onPress={handleSubmitPress}
                disabled={!isFormComplete || submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />
                    <Text style={styles.submitBtnText}>Submitting Application...</Text>
                  </>
                ) : (
                  <>
                    <Text style={styles.submitBtnText}>Apply for Renewal</Text>
                    <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>

              {!isFormComplete && (
                <Text style={{ fontSize: 12, color: '#64748B', textAlign: 'center', marginTop: 8 }}>
                  Please select both Proof of Enrollment and Academic Record to enable submission.
                </Text>
              )}
            </>
          )}
        </>
      )}

      {/* CONFIRMATION MODAL */}
      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Apply for Renewal?
            </Text>
            <Text style={[styles.modalMessage, isDarkMode && { color: '#CBD5E1' }]}>
              Please confirm that the uploaded Proof of Enrollment and Academic Record are accurate. After submission, your application will be reviewed by the scholarship coordinator.
            </Text>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, isDarkMode && { borderColor: '#475569' }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.modalCancelText, isDarkMode && { color: '#94A3B8' }]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalConfirmBtn}
                onPress={handleConfirmSubmit}
              >
                <Text style={styles.modalConfirmText}>
                  Confirm & Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
