import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import {
  validateFileSize,
  DEFAULT_MAX_DOC_SIZE_MB,
  MAX_VIDEO_SIZE_MB,
} from '@/src/utils/fileValidation';
import {
  compressImageIfNeeded,
  isImageFile,
  validateDocumentClarity,
} from '@/src/utils/imageCompression';
import { sanitizeErrorMessage } from '@/src/utils/errorUtils';
import { AuthService } from '@/src/services/auth-service';
import { FormDraftService } from '@/src/services/form-draft-service';
import {
  downloadOrViewCitizenDocument,
  getMimeType,
} from '../../dashboard/api/citizenDocumentApi';
import {
  ApplicationComplianceData,
  ApplicationComplianceItem,
  fetchApplicationCompliance,
  submitApplicationComplianceReplacement,
} from '../api/newApplicantComplianceApi';

export interface SelectedComplianceFile {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
}

/**
 * Detect whether a compliance item targets a video requirement (e.g. Athletic/Arts audition or video declaration).
 */
export const isVideoRequirement = (item: ApplicationComplianceItem): boolean => {
  const targetDoc = item.target_document;
  const docCode = targetDoc?.document_code?.toUpperCase() || '';
  const docName = targetDoc?.document_name?.toUpperCase() || '';
  const reqTitle = item.requirement_title?.toUpperCase() || '';

  return (
    docCode.includes('VIDEO') ||
    docName.includes('VIDEO') ||
    reqTitle.includes('VIDEO')
  );
};

export function useComplianceForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [complianceData, setComplianceData] = useState<ApplicationComplianceData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, SelectedComplianceFile>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});
  const [isSubmittingCompId, setIsSubmittingCompId] = useState<number | null>(null);
  const [actionLoadingDocKey, setActionLoadingDocKey] = useState<string | null>(null);

  // In-App Document Viewer state
  const [viewerModalVisible, setViewerModalVisible] = useState(false);
  const [viewerLocalUri, setViewerLocalUri] = useState<string | null>(null);
  const [viewerFilename, setViewerFilename] = useState('');
  const [viewerMimeType, setViewerMimeType] = useState('application/pdf');
  const [viewerTitle, setViewerTitle] = useState('');
  const [viewerRefNumber, setViewerRefNumber] = useState('');
  const [viewerStatus, setViewerStatus] = useState('');
  const [viewerDate, setViewerDate] = useState('');
  const hasHydratedRef = useRef<boolean>(false);

  const loadComplianceData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchApplicationCompliance();
      setComplianceData(data);

      // Re-hydrate draft if available for this citizen & application_id
      const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
      const appId = data.application_id || 'current';
      if (activeUserId && !hasHydratedRef.current) {
        try {
          const draft = await FormDraftService.loadDraft<{
            selectedFiles: Record<number, SelectedComplianceFile>;
            notes?: Record<number, string>;
          }>('new_applicant_compliance', activeUserId, appId);

          if (draft && draft.selectedFiles && typeof draft.selectedFiles === 'object') {
            const restored: Record<number, SelectedComplianceFile> = {};
            for (const [compIdStr, file] of Object.entries(draft.selectedFiles)) {
              const compId = Number(compIdStr);
              if (file?.uri) {
                const exists = await FormDraftService.verifyFileExists(file.uri);
                if (exists) {
                  restored[compId] = file;
                } else {
                  console.log(
                    `[useComplianceForm] Draft file for compId ${compId} (${file.name}) no longer exists in cache.`
                  );
                }
              }
            }
            setSelectedFiles(restored);
            if (draft.notes) {
              setNotes(draft.notes);
            }
          }
        } catch (draftErr) {
          console.warn('[useComplianceForm] Draft restoration error:', draftErr);
        } finally {
          hasHydratedRef.current = true;
        }
      } else {
        hasHydratedRef.current = true;
      }
    } catch (err: any) {
      console.warn('[useComplianceForm] fetch error:', err);
      setError(sanitizeErrorMessage(err?.message, 'Unable to load application compliance requests.'));
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadComplianceData();
    }, [loadComplianceData])
  );

  // Auto-save compliance replacement draft to local storage (debounced by 500ms)
  useEffect(() => {
    if (!hasHydratedRef.current || !complianceData?.application_id) return;
    const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
    const appId = complianceData.application_id;
    if (!activeUserId || !appId) return;

    const hasFiles = Object.keys(selectedFiles).length > 0;
    if (!hasFiles) {
      FormDraftService.clearDraft('new_applicant_compliance', activeUserId, appId).catch(() => {});
      return;
    }

    const timer = setTimeout(() => {
      FormDraftService.saveDraft('new_applicant_compliance', activeUserId, appId, {
        selectedFiles,
        notes,
      }).catch((err) => {
        console.warn('[useComplianceForm] Draft save error:', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedFiles, notes, complianceData?.application_id]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadComplianceData();
  }, [loadComplianceData]);

  const handlePickDocument = async (item: ApplicationComplianceItem) => {
    const isVideo = isVideoRequirement(item);
    const allowedTypes = isVideo
      ? ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/*']
      : ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    const maxLimitMb = isVideo ? MAX_VIDEO_SIZE_MB : DEFAULT_MAX_DOC_SIZE_MB;
    const docLabel = isVideo ? 'video replacement' : 'replacement';

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];

        // Guard for non-image files (PDFs) that exceed 10 MB limit
        if (!isVideo && !isImageFile(file)) {
          if (typeof file.size === 'number' && file.size > maxLimitMb * 1024 * 1024) {
            Alert.alert(
              'File Too Large',
              'Selected file exceeds the maximum 10MB limit. Please choose a smaller document.'
            );
            return;
          }
        }

        // Auto-compress image if exceeding 1.5MB (or undefined size)
        let processedFile = file;
        if (!isVideo && isImageFile(file)) {
          processedFile = await compressImageIfNeeded(file);

          // Assess document clarity via edge-contrast & entropy gradient variance
          const clarityResult = await validateDocumentClarity(processedFile.uri);
          if (clarityResult.isBlurry) {
            Alert.alert(
              'Document May Be Blurry',
              `${clarityResult.recommendation}\n\nClarity Score: ${clarityResult.score}% (${clarityResult.rating}). Clear documents ensure faster automatic verification.`,
              [{ text: 'Proceed Anyway', style: 'default' }]
            );
          }
        }

        // 10MB (docs) / 20MB (video) file size limit validation using shared utility
        const validation = validateFileSize(processedFile, maxLimitMb, docLabel);
        if (!validation.valid) {
          Alert.alert(
            'File Too Large',
            validation.errorMessage ||
              `The selected ${docLabel} file exceeds the maximum limit of ${maxLimitMb}MB. Please choose a smaller file.`
          );
          return;
        }

        setSelectedFiles((prev) => ({
          ...prev,
          [item.compliance_id]: {
            uri: processedFile.uri,
            name: processedFile.name,
            size: processedFile.size,
            mimeType: processedFile.mimeType || (isVideo ? 'video/mp4' : 'application/octet-stream'),
          },
        }));
      }
    } catch (err: any) {
      console.warn('[useComplianceForm] document picker error:', err);
      Alert.alert('File Selection Failed', 'Unable to select file. Please try again.');
    }
  };

  const handleOriginalDocAction = async (
    docId: number,
    filename: string,
    mode: 'view' | 'download'
  ) => {
    const docKey = `orig_${docId}_${mode}`;
    setActionLoadingDocKey(docKey);
    try {
      const result = await downloadOrViewCitizenDocument('application', docId, filename, mode);
      if (mode === 'view' && result?.localUri) {
        setViewerLocalUri(result.localUri);
        setViewerFilename(result.filename);
        setViewerMimeType(result.mimeType || getMimeType(result.filename));
        setViewerTitle(filename || 'Original Submitted Document');
        setViewerRefNumber(`#${docId}`);
        setViewerStatus('Original Submission');
        setViewerDate('');
        setViewerModalVisible(true);
        return;
      }
    } catch (err: any) {
      console.warn('[handleOriginalDocAction] error:', err);
      Alert.alert(
        'Unable to Process Document',
        sanitizeErrorMessage(err?.message, 'Please check your connection and try again.')
      );
    } finally {
      setActionLoadingDocKey(null);
    }
  };

  const handleSubmitReplacement = async (item: ApplicationComplianceItem) => {
    const picked = selectedFiles[item.compliance_id];
    if (!picked) {
      Alert.alert('File Required', 'Please select a replacement file before submitting.');
      return;
    }

    setIsSubmittingCompId(item.compliance_id);
    try {
      const targetDocId = item.target_document?.application_document_id || null;
      const fileToUpload =
        !isVideoRequirement(item) && isImageFile(picked)
          ? await compressImageIfNeeded(picked)
          : picked;

      const updatedData = await submitApplicationComplianceReplacement(
        item.compliance_id,
        {
          uri: fileToUpload.uri,
          name: fileToUpload.name,
          type: fileToUpload.mimeType || (isVideoRequirement(item) ? 'video/mp4' : 'application/pdf'),
        },
        targetDocId
      );

      setSelectedFiles((prev) => {
        const copy = { ...prev };
        delete copy[item.compliance_id];
        return copy;
      });

      setComplianceData(updatedData);
      Alert.alert(
        'Replacement Submitted',
        'Your replacement document has been submitted and is awaiting review.'
      );
    } catch (err: any) {
      console.warn('[handleSubmitReplacement] error:', err);
      const isRateLimited =
        err?.status === 429 ||
        err?.statusCode === 429 ||
        /429|too many requests|rate limit/i.test(err?.message || '');

      if (isRateLimited) {
        Alert.alert(
          'Submission Rate Limit',
          "You've made multiple submission attempts. Please wait 60 seconds before trying again."
        );
      } else {
        Alert.alert(
          'Submission Failed',
          sanitizeErrorMessage(err?.message, 'Unable to submit replacement document. Please try again.')
        );
      }
    } finally {
      setIsSubmittingCompId(null);
    }
  };

  const handleNoteChange = (complianceId: number, noteText: string) => {
    setNotes((prev) => ({
      ...prev,
      [complianceId]: noteText,
    }));
  };

  return {
    isLoading,
    setIsLoading,
    refreshing,
    error,
    complianceData,
    selectedFiles,
    setSelectedFiles,
    notes,
    handleNoteChange,
    isSubmittingCompId,
    actionLoadingDocKey,
    viewerModalVisible,
    setViewerModalVisible,
    viewerLocalUri,
    viewerFilename,
    viewerMimeType,
    viewerTitle,
    viewerRefNumber,
    viewerStatus,
    viewerDate,
    loadComplianceData,
    onRefresh,
    handlePickDocument,
    handleOriginalDocAction,
    handleSubmitReplacement,
    isVideoRequirement,
  };
}
