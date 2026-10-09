import * as DocumentPicker from 'expo-document-picker';
import { validateFileSize } from '@/src/utils/fileValidation';
import { formatDate, formatDateTime } from '@/src/utils/dateUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Image, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';
import { CitizenVerificationService, CitizenVerificationStatusType } from '@/src/services/citizenVerificationService';
import { FormDraftService } from '@/src/services/form-draft-service';
import { ProfileService } from '@/src/services/profile-service';
import {
  getPartnerSchoolsLookup,
  getScholarshipProgramDetails,
  PartnerSchoolLookupItem,
  sanitizeScholarshipProgramContent,
  ScholarshipProgram,
  ScholarshipRequiredDocument,
  submitNewScholarshipApplication,
  SubmitApplicationResult,
  validateCitizenDocument,
} from './api/ScholarshipProgramApi';
import { fetchCitizenDashboard } from '../dashboard/api/scholarshipDashboardApi';
import { COMMON_COURSE_SUGGESTIONS, CourseSuggestion } from './constants/courseSuggestions';
import { getAvailableYearLevels, resolveEducationLevelCategory } from './constants/yearLevelOptions';
import { styles } from './styles/NewApplicantApplication.styles';

const videoDeclarationGuideImg = require('@/assets/images/video-inter.png');

const SUFFIX_OPTIONS = ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

const extractPhoneDigits = (raw?: string | null): string => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  const clean = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  return clean.slice(0, 10);
};

const formatPhoneNumber = (val: string): string => {
  if (!val) return '';
  if (val.length <= 3) return val;
  if (val.length <= 6) return `${val.slice(0, 3)} ${val.slice(3)}`;
  return `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6, 10)}`;
};

interface SelectedFileState {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
  asset?: DocumentPicker.DocumentPickerAsset;
}

export interface DocumentValidationState {
  status: 'idle' | 'validating' | 'validated';
  result?: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  message?: string;
  expectedCode?: string;
  detectedCode?: string | null;
  confidence?: number;
}

export function NewApplicantApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ program_id?: string }>();
  const programId = params.program_id ? parseInt(params.program_id, 10) : null;
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  const [program, setProgram] = useState<ScholarshipProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Step 1: Personal & Identity Information fields
  const [email, setEmail] = useState('');
  const [phoneDigits, setPhoneDigits] = useState('');
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showSuffixModal, setShowSuffixModal] = useState(false);
  const [residentialAddress, setResidentialAddress] = useState('');

  // Step 2: Academic information fields
  const [institutionName, setInstitutionName] = useState('');
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchoolLookupItem[]>([]);
  const [selectedPartnerSchoolId, setSelectedPartnerSchoolId] = useState<number | null>(null);
  const [isManualSchool, setIsManualSchool] = useState<boolean>(false);
  const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState<string>('');
  const [courseProgram, setCourseProgram] = useState('');
  const [isManualCourse, setIsManualCourse] = useState<boolean>(false);
  const [showCourseModal, setShowCourseModal] = useState<boolean>(false);
  const [courseSearchQuery, setCourseSearchQuery] = useState<string>('');
  const [isCourseSuggestionSelected, setIsCourseSuggestionSelected] = useState(false);
  const [yearLevel, setYearLevel] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);

  // Citizen verification status & Fast-Track autofill
  const [verificationStatus, setVerificationStatus] = useState<CitizenVerificationStatusType | null>(null);
  const [citizenVerificationData, setCitizenVerificationData] = useState<any>(null);
  const [isVerificationLoading, setIsVerificationLoading] = useState<boolean>(true);
  const [isNoticeDismissed, setIsNoticeDismissed] = useState<boolean>(false);

  const isVerifiedCitizen = verificationStatus === 'Approved';

  const handlePhoneChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    const clean = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
    setPhoneDigits(clean.slice(0, 10));
  };

  const verifiedFullName = useMemo(() => {
    if (!citizenVerificationData) {
      return AuthService.getCurrentUser()?.user?.full_name || 'Verified Citizen';
    }
    const parts = [
      citizenVerificationData.first_name,
      citizenVerificationData.middle_name,
      citizenVerificationData.last_name,
      citizenVerificationData.suffix,
    ].filter(Boolean);
    if (parts.length > 0) {
      return parts.join(' ');
    }
    return AuthService.getCurrentUser()?.user?.full_name || 'Verified Citizen';
  }, [citizenVerificationData]);

  const isResidencyProofDoc = useCallback((doc: ScholarshipRequiredDocument): boolean => {
    const code = (doc.document_code || '').toUpperCase();
    const name = (doc.document_name || '').toUpperCase();
    const desc = (doc.description || '').toUpperCase();
    return (
      code.includes('RESIDENCY') ||
      code.includes('BARANGAY') ||
      name.includes('RESIDENCY') ||
      name.includes('BARANGAY') ||
      name.includes('PROOF OF RESIDENCE') ||
      desc.includes('PROOF OF RESIDENCY') ||
      desc.includes('CERTIFICATE OF RESIDENCY')
    );
  }, []);

  // Dynamic file upload state mapped by document key
  const [files, setFiles] = useState<Record<string, SelectedFileState>>({});
  const [docValidations, setDocValidations] = useState<Record<string, DocumentValidationState>>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFullGuideModal, setShowFullGuideModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitApplicationResult | null>(null);
  const hasHydratedRef = useRef<boolean>(false);

  const loadVerificationStatus = useCallback(async (): Promise<{ isVerified: boolean; address?: string }> => {
    try {
      setIsVerificationLoading(true);
      const currentUser = AuthService.getCurrentUser();
      const citizenUserId = currentUser?.citizen_user_id;
      const email = currentUser?.email;

      if (!citizenUserId && !email) {
        setIsVerificationLoading(false);
        return { isVerified: false };
      }

      const res = await CitizenVerificationService.getVerificationStatus(
        citizenUserId || undefined,
        email || undefined
      );
      if (res && res.status === 'success') {
        const vStatus = res.verification_status || (res.is_verified ? 'Approved' : 'Not_Submitted');
        setVerificationStatus(vStatus);
        setCitizenVerificationData(res.data || res);

        if (vStatus === 'Approved') {
          const vData = res.data || res;
          if (vData.first_name) setFirstName(vData.first_name);
          if (vData.middle_name) {
            setMiddleName(vData.middle_name);
            setNoMiddleName(false);
          } else {
            setMiddleName('');
            setNoMiddleName(true);
          }
          if (vData.last_name) setLastName(vData.last_name);
          if (vData.suffix) setSuffix(vData.suffix);
          if (vData.email) setEmail(vData.email);
          const vPhone = vData.contact_number || vData.phone_number || vData.phone;
          if (vPhone) setPhoneDigits(extractPhoneDigits(vPhone));

          const addressParts = [
            vData.street_address,
            vData.barangay
              ? vData.barangay.toLowerCase().startsWith('barangay')
                ? vData.barangay
                : `Barangay ${vData.barangay}`
              : '',
            vData.district ? `District ${vData.district}` : '',
            vData.city || process.env.EXPO_PUBLIC_CITY_NAME || 'Taguig City',
          ].filter(Boolean);
          const fullAddress = addressParts.length > 0 ? addressParts.join(', ') : (vData.street_address || vData.barangay || '');
          if (fullAddress) {
            setResidentialAddress(fullAddress);
            return { isVerified: true, address: fullAddress };
          }
          return { isVerified: true };
        }
      }
      return { isVerified: false };
    } catch (err) {
      console.warn('[NewApplicantApplicationScreen] Verification status lookup error:', err);
      return { isVerified: false };
    } finally {
      setIsVerificationLoading(false);
    }
  }, []);

  const loadData = useCallback(async () => {
    if (!programId) {
      setFetchError('No scholarship program selected.');
      setIsLoading(false);
      return;
    }

    try {
      setFetchError(null);
      const [data, schools, vResult] = await Promise.all([
        getScholarshipProgramDetails(programId),
        getPartnerSchoolsLookup(programId),
        loadVerificationStatus(),
      ]);
      setPartnerSchools(schools);
      if (!data) {
        setFetchError('Scholarship program not found.');
      } else {
        setProgram(sanitizeScholarshipProgramContent(data));
        console.log('[NewApplicantApplicationScreen] Program loaded:', {
          program_id: data.program_id,
          program_name: data.program_name,
          program_code: data.program_code,
          required_documents_count: data.required_documents?.length,
          required_documents: data.required_documents?.map((d: any) => ({
            program_document_id: d.program_document_id,
            document_requirement_id: d.document_requirement_id,
            document_code: d.document_code,
            document_name: d.document_name,
            requirement_level: d.requirement_level,
          })),
        });

        // Re-hydrate draft if available for this citizen & program
        const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
        if (activeUserId && programId && !hasHydratedRef.current) {
          try {
            const draft = await FormDraftService.loadDraft<{
              currentStep?: 1 | 2 | 3;
              email?: string;
              phoneDigits?: string;
              firstName?: string;
              middleName?: string;
              noMiddleName?: boolean;
              lastName?: string;
              suffix?: string;
              institutionName: string;
              selectedPartnerSchoolId: number | null;
              courseProgram: string;
              isCourseSuggestionSelected: boolean;
              yearLevel: string;
              residentialAddress: string;
              files: Record<string, SelectedFileState>;
              docValidations: Record<string, DocumentValidationState>;
            }>('new_applicant', activeUserId, programId);

            if (draft) {
              if (draft.currentStep && [1, 2, 3].includes(draft.currentStep)) {
                setCurrentStep(draft.currentStep as 1 | 2 | 3);
              }
              if (draft.email && !vResult?.isVerified) setEmail(draft.email);
              if (draft.phoneDigits && !vResult?.isVerified) setPhoneDigits(draft.phoneDigits);
              if (draft.firstName && !vResult?.isVerified) setFirstName(draft.firstName);
              if (draft.middleName !== undefined && !vResult?.isVerified) setMiddleName(draft.middleName);
              if (draft.noMiddleName !== undefined && !vResult?.isVerified) setNoMiddleName(draft.noMiddleName);
              if (draft.lastName && !vResult?.isVerified) setLastName(draft.lastName);
              if (draft.suffix !== undefined && !vResult?.isVerified) setSuffix(draft.suffix);
              if (draft.institutionName) {
                setInstitutionName(draft.institutionName);
                if (draft.selectedPartnerSchoolId !== undefined && draft.selectedPartnerSchoolId !== null) {
                  setSelectedPartnerSchoolId(draft.selectedPartnerSchoolId);
                  setIsManualSchool(false);
                } else {
                  setIsManualSchool(true);
                }
              }
              if (draft.courseProgram) {
                setCourseProgram(draft.courseProgram);
                if (draft.isCourseSuggestionSelected !== undefined) {
                  setIsCourseSuggestionSelected(draft.isCourseSuggestionSelected);
                  setIsManualCourse(!draft.isCourseSuggestionSelected);
                }
              }
              if (draft.yearLevel) setYearLevel(draft.yearLevel);
              // Do not overwrite verified municipal address if citizen is approved
              if (draft.residentialAddress && !vResult?.isVerified) {
                setResidentialAddress(draft.residentialAddress);
              }

              if (draft.files && typeof draft.files === 'object') {
                const restoredFiles: Record<string, SelectedFileState> = {};
                const restoredValidations: Record<string, DocumentValidationState> = {};

                for (const [key, fileState] of Object.entries(draft.files)) {
                  if (fileState?.uri) {
                    const exists = await FormDraftService.verifyFileExists(fileState.uri);
                    if (exists) {
                      restoredFiles[key] = fileState;
                      if (draft.docValidations && draft.docValidations[key]) {
                        restoredValidations[key] = draft.docValidations[key];
                      }
                    } else {
                      console.log(`[NewApplicantApplicationScreen] Draft file for ${key} (${fileState.name}) no longer exists in cache.`);
                    }
                  }
                }
                setFiles(restoredFiles);
                setDocValidations(restoredValidations);
              }
            }
          } catch (draftErr) {
            console.warn('[NewApplicantApplicationScreen] Draft restoration error:', draftErr);
          } finally {
            hasHydratedRef.current = true;
          }
        } else {
          hasHydratedRef.current = true;
        }
      }
    } catch (err: any) {
      console.error('[NewApplicantApplicationScreen] fetch error:', err);
      setFetchError('Unable to load scholarship details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [programId, loadVerificationStatus]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pre-fill initial applicant details from current session if unverified
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      if (currentUser.email) {
        setEmail((prev) => prev || currentUser.email || '');
      }
      if (currentUser.phone) {
        setPhoneDigits((prev) => prev || extractPhoneDigits(currentUser.phone));
      }
      const cachedUser = currentUser.user;
      if (cachedUser) {
        if (cachedUser.first_name) {
          setFirstName((prev) => prev || cachedUser.first_name || '');
        }
        if (cachedUser.middle_name) {
          setMiddleName((prev) => prev || cachedUser.middle_name || '');
          setNoMiddleName(false);
        }
        if (cachedUser.last_name) {
          setLastName((prev) => prev || cachedUser.last_name || '');
        }
        if (cachedUser.suffix) {
          setSuffix((prev) => prev || cachedUser.suffix || '');
        }
        if (!cachedUser.first_name && cachedUser.full_name) {
          const parts = cachedUser.full_name.trim().split(/\s+/);
          if (parts.length === 1) {
            setFirstName((prev) => prev || parts[0]);
          } else if (parts.length >= 2) {
            setFirstName((prev) => prev || parts[0]);
            setLastName((prev) => prev || parts.slice(1).join(' '));
          }
        }
      }
    }
  }, []);

  // Proactive Active Application Guard on Screen Entry
  useEffect(() => {
    let isCancelled = false;

    async function checkActiveApplication() {
      try {
        const dash = await fetchCitizenDashboard();
        if (isCancelled || !dash) return;

        const isScholarActive =
          dash.state === 'ACTIVE_SCHOLAR' ||
          dash.state === 'ACTIVE_GRANT' ||
          dash.state === 'SCHOLAR_WITHOUT_GRANT' ||
          (dash.scholar && (dash.scholar.scholar_status === 'Active' || dash.scholar.scholar_status === 'Enrolled'));

        if (isScholarActive) {
          Alert.alert(
            'Already an Active Scholar',
            'Citizens with an active scholarship are not eligible for new applications.',
            [
              {
                text: 'Go to Dashboard',
                onPress: () => router.replace('/education/dashboard' as any),
              },
            ]
          );
          return;
        }

        const existingApp = dash.application;
        const isAppInProgressState = dash.state === 'APPLICATION_IN_PROGRESS';

        if (existingApp || isAppInProgressState) {
          const appStatus = existingApp?.application_status || 'In Progress';
          const isTerminalStatus = [
            'Rejected',
            'Disapproved',
            'Withdrawn',
            'Cancelled',
          ].includes(appStatus);

          if (!isTerminalStatus) {
            const appliedProgramName = dash.scholarship?.program_name;
            const msg = appliedProgramName
              ? `You have an active application (${dash.application?.application_code || appStatus}) under "${appliedProgramName}". Citizens may only have one active application.`
              : `You already have an active application with status "${appStatus}". Citizens may only have one active application.`;

            Alert.alert('Active Application Exists', msg, [
              {
                text: 'Go to Dashboard',
                onPress: () => router.replace('/education/dashboard' as any),
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('[NewApplicantApplicationScreen] Active application check failed:', err);
      }
    }

    checkActiveApplication();

    return () => {
      isCancelled = true;
    };
  }, [router]);

  // Pre-fill Residential Address from Citizen Profile (convenience default)
  useEffect(() => {
    let isMounted = true;

    async function prefillAddressFromProfile() {
      try {
        const currentUser = AuthService.getCurrentUser();
        const activeUserId = currentUser?.citizen_user_id;
        const activeEmail = currentUser?.email;
        const activePhone = currentUser?.phone;
        const cachedUser = currentUser?.user;

        // Check if user object in session memory already has address or barangay
        let candidateAddress = typeof cachedUser?.address === 'string' ? cachedUser.address.trim() : '';
        let candidateBarangay = typeof cachedUser?.barangay === 'string' ? cachedUser.barangay.trim() : '';
        let candidateCity = typeof cachedUser?.city === 'string' ? cachedUser.city.trim() : '';

        // If address is not present in cached user and not in guest mode, fetch profile
        if (!candidateAddress && !currentUser.isGuest) {
          const profileRes = await ProfileService.getProfile(
            activeEmail || undefined,
            activeUserId || undefined,
            activePhone || undefined
          );
          if (profileRes.status === 'success' && profileRes.data) {
            if (typeof profileRes.data.address === 'string') {
              candidateAddress = profileRes.data.address.trim();
            }
            if (!candidateBarangay && typeof profileRes.data.barangay === 'string') {
              candidateBarangay = profileRes.data.barangay.trim();
            }
            if (!candidateCity && typeof profileRes.data.city === 'string') {
              candidateCity = profileRes.data.city.trim();
            }
          }
        }

        if (!isMounted || isVerifiedCitizen) return;

        // Pre-fill only if residentialAddress is still empty (never overwrite manual input or verified address)
        setResidentialAddress((prev) => {
          if (isVerifiedCitizen || (prev && prev.trim().length > 0)) {
            return prev;
          }

          if (candidateAddress) {
            return candidateAddress;
          }

          if (candidateBarangay) {
            const cityPart = candidateCity ? `, ${candidateCity}` : '';
            return `Barangay ${candidateBarangay}${cityPart}`;
          }

          return prev;
        });
      } catch (err) {
        console.warn('[NewApplicantApplicationScreen] Could not pre-fill address:', err);
      }
    }

    prefillAddressFromProfile();

    return () => {
      isMounted = false;
    };
  }, [isVerifiedCitizen]);

  // Auto-save form draft to local storage (debounced by 500ms)
  useEffect(() => {
    if (!hasHydratedRef.current || !programId) return;
    const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
    if (!activeUserId) return;

    const hasData =
      email.trim().length > 0 ||
      phoneDigits.trim().length > 0 ||
      firstName.trim().length > 0 ||
      lastName.trim().length > 0 ||
      institutionName.trim().length > 0 ||
      courseProgram.trim().length > 0 ||
      yearLevel.trim().length > 0 ||
      residentialAddress.trim().length > 0 ||
      selectedPartnerSchoolId !== null ||
      Object.keys(files).length > 0;

    if (!hasData) return;

    const timer = setTimeout(() => {
      FormDraftService.saveDraft('new_applicant', activeUserId, programId, {
        currentStep,
        email,
        phoneDigits,
        firstName,
        middleName,
        noMiddleName,
        lastName,
        suffix,
        institutionName,
        selectedPartnerSchoolId,
        courseProgram,
        isCourseSuggestionSelected,
        yearLevel,
        residentialAddress,
        files,
        docValidations,
      }).catch((err) => {
        console.warn('[NewApplicantApplicationScreen] Draft save error:', err);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    currentStep,
    email,
    phoneDigits,
    firstName,
    middleName,
    noMiddleName,
    lastName,
    suffix,
    institutionName,
    selectedPartnerSchoolId,
    courseProgram,
    isCourseSuggestionSelected,
    yearLevel,
    residentialAddress,
    files,
    docValidations,
    programId,
  ]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handlePickDocument = async (doc: ScholarshipRequiredDocument) => {
    const code = (doc.document_code || '').toUpperCase();
    const name = (doc.document_name || '').toUpperCase();
    const isVideo = code.includes('VIDEO') || name.includes('VIDEO');

    const docKey = doc.program_document_id
      ? `doc_${doc.program_document_id}`
      : `doc_${doc.document_requirement_id}`;

    // Prevent duplicate validation requests for the same document while it is already validating
    if (docValidations[docKey]?.status === 'validating') {
      return;
    }

    const allowedTypes = isVideo
      ? ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/*']
      : ['application/pdf', 'image/jpeg', 'image/png'];

    const maxLimitMb = isVideo ? 60 : 10;

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: allowedTypes,
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        // Safe debugging metadata log (no secrets or contents)
        console.log('[NewApplicantApplicationScreen] Document picked:', {
          program_document_id: doc.program_document_id,
          document_requirement_id: doc.document_requirement_id,
          document_code: doc.document_code,
          filename: asset.name,
          size: asset.size,
          mime: asset.mimeType,
          uriScheme: asset.uri ? asset.uri.split(':')[0] : null,
        });

        // 10MB/60MB file size limit validation using shared utility (LOW-03)
        const validation = validateFileSize(asset, maxLimitMb, doc.document_name);
        if (!validation.valid) {
          Alert.alert('File Too Large', validation.errorMessage || `The selected ${doc.document_name} file exceeds the maximum limit of ${maxLimitMb}MB. Please choose a smaller file.`);
          return;
        }

        // Replacing a document must clear its previous validation state before running validation again
        setDocValidations((prev) => {
          const next = { ...prev };
          delete next[docKey];
          return next;
        });

        // 1. Save/set the selected file using the existing state logic.
        setFiles((prev) => ({
          ...prev,
          [docKey]: {
            name: asset.name,
            size: asset.size,
            uri: asset.uri,
            mimeType: asset.mimeType,
            asset,
          },
        }));

        // IF document is VIDEO:
        // - Do NOT call OCR.
        // - Do NOT show OCR validation.
        // - Preserve existing video upload behavior.
        if (isVideo) {
          return;
        }

        // IF document is PDF/JPEG/PNG:
        // 2. Set status: 'validating'
        setDocValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: 'validating',
          },
        }));

        // 3. Call validateCitizenDocument
        const programDocId = doc.program_document_id || doc.document_requirement_id || 0;
        const currentProgramId = programId || program?.program_id || 0;

        if (!programDocId || !currentProgramId) {
          console.warn('[NewApplicantApplicationScreen] Skipping OCR validation: Missing programDocId or currentProgramId', {
            programDocId,
            currentProgramId,
          });
          setDocValidations((prev) => ({
            ...prev,
            [docKey]: {
              status: 'validated',
              result: 'INCONCLUSIVE',
              message: 'Automatic verification is unavailable. Your document can still be reviewed manually.',
            },
          }));
          return;
        }

        try {
          const validationResult = await validateCitizenDocument(
            asset,
            programDocId,
            currentProgramId
          );

          // 4. Store the returned validation result for that specific document.
          if (validationResult) {
            setDocValidations((prev) => ({
              ...prev,
              [docKey]: {
                status: 'validated',
                result: validationResult.result,
                message: validationResult.message,
                expectedCode: validationResult.expected_document_code,
                detectedCode: validationResult.detected_document_code,
                confidence: validationResult.confidence,
              },
            }));
          } else {
            // Network or server failure
            setDocValidations((prev) => ({
              ...prev,
              [docKey]: {
                status: 'validated',
                result: 'INCONCLUSIVE',
                message: 'Automatic verification is unavailable. Your document can still be reviewed manually.',
              },
            }));
          }
        } catch (validationErr) {
          console.error('[NewApplicantApplicationScreen] OCR validation error:', validationErr);
          setDocValidations((prev) => ({
            ...prev,
            [docKey]: {
              status: 'validated',
              result: 'INCONCLUSIVE',
              message: 'Automatic verification is unavailable. Your document can still be reviewed manually.',
            },
          }));
        }
      }
    } catch (err) {
      console.error('[NewApplicantApplicationScreen] document picker error:', err);
      Alert.alert('Error', 'Unable to pick document. Please try again.');
    }
  };

  // Determine required documents list from program configuration
  const requiredDocsList: ScholarshipRequiredDocument[] = React.useMemo(() => {
    if (program?.required_documents && program.required_documents.length > 0) {
      return program.required_documents;
    }
    const isTertiaryAcademic = program?.program_code === 'ACADEMIC-TER-001';

    // Default standard document list if none configured specifically for program
    return [
      {
        document_requirement_id: 1,
        document_code: 'ACADEMIC_RECORD',
        document_name: 'Academic Record / Transcript',
        description: isTertiaryAcademic
          ? "Official Transcript of Records (TOR), Certificate of Grades, or equivalent academic record used to verify the applicant's tertiary academic performance."
          : 'Official Grades, Form 137, Form 138, or Transcript of Records.',
        requirement_level: 'Required',
        instructions: isTertiaryAcademic
          ? 'Upload your latest official Transcript of Records (TOR) or Certificate of Grades.'
          : 'Upload your latest official academic record.',
      },
      {
        document_requirement_id: 2,
        document_code: 'ENROLLMENT_PROOF',
        document_name: 'Proof of Enrollment / Acceptance',
        description: isTertiaryAcademic
          ? 'Document confirming that the applicant is currently enrolled, registered, or accepted in a college or university.'
          : 'Certificate of Registration, Enrollment Assessment, or Admission Letter.',
        requirement_level: 'Required',
        instructions: isTertiaryAcademic
          ? 'Upload document confirming current college or university enrollment or acceptance.'
          : 'Upload proof of current enrollment or admission.',
      },
    ];
  }, [program]);

  // Validate form completion
  const missingDocs = requiredDocsList.filter((doc) => {
    const key = doc.program_document_id
      ? `doc_${doc.program_document_id}`
      : `doc_${doc.document_requirement_id}`;
    return !files[key];
  });

  const selectedPartnerSchool = useMemo(() => {
    if (selectedPartnerSchoolId === null) return null;
    return partnerSchools.find((s) => s.institution_id === selectedPartnerSchoolId) || null;
  }, [selectedPartnerSchoolId, partnerSchools]);

  const educationCategory = useMemo(() => resolveEducationLevelCategory(program), [program]);
  const isSeniorHighProgram = useMemo(() => {
    if (educationCategory === 'SENIOR_HIGH') return true;
    const progCode = (program?.program_code || '').toUpperCase();
    const progName = (program?.program_name || '').toUpperCase();
    return progCode.includes('SHS') || progName.includes('SENIOR HIGH');
  }, [educationCategory, program]);

  const modalFilteredPartnerSchools = useMemo(() => {
    const q = schoolSearchQuery.trim().toLowerCase();
    if (!q) return partnerSchools;
    return partnerSchools.filter(
      (s) =>
        s.institution_name.toLowerCase().includes(q) ||
        s.institution_code.toLowerCase().includes(q)
    );
  }, [schoolSearchQuery, partnerSchools]);

  const availableProgramCourses = useMemo(() => {
    if (isSeniorHighProgram) {
      return COMMON_COURSE_SUGGESTIONS.filter((c) => c.category === 'Senior High School');
    }
    return COMMON_COURSE_SUGGESTIONS.filter((c) => c.category !== 'Senior High School');
  }, [isSeniorHighProgram]);

  const modalFilteredCourses = useMemo(() => {
    const q = courseSearchQuery.trim().toLowerCase();
    if (!q) return availableProgramCourses;
    return availableProgramCourses.filter((course) => {
      const nameMatch = course.name.toLowerCase().includes(q);
      const codeMatch = course.code ? course.code.toLowerCase().includes(q) : false;
      return nameMatch || codeMatch;
    });
  }, [courseSearchQuery, availableProgramCourses]);

  const availableYearLevels = useMemo(() => getAvailableYearLevels(program), [program]);

  const handleSelectCourse = (course: CourseSuggestion) => {
    const selectedText = course.code ? `${course.name} (${course.code})` : course.name;
    setCourseProgram(selectedText);
    setIsCourseSuggestionSelected(true);
    setIsManualCourse(false);
    setShowCourseModal(false);
  };

  const isStep1Valid =
    firstName.trim().length >= 2 &&
    lastName.trim().length >= 2 &&
    residentialAddress.trim().length > 0 &&
    (noMiddleName || middleName.trim().length !== 1);
  const isStep2Valid = institutionName.trim().length > 0 && yearLevel.trim().length > 0;
  const isStep3Valid = missingDocs.length === 0;

  const isFormValid = isStep1Valid && isStep2Valid && isStep3Valid;

  // Hardware Back Button (Android)
  useEffect(() => {
    const onBackPress = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => ((prev - 1) as 1 | 2));
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return true;
      }
      return false;
    };

    const backSubscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backSubscription.remove();
  }, [currentStep]);

  const handleTopBackPress = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => ((prev - 1) as 1 | 2));
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      router.back();
    }
  };

  const handleGoToStep = (targetStep: 1 | 2 | 3) => {
    if (targetStep === 1) {
      setCurrentStep(1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (targetStep === 2) {
      if (!isStep1Valid) {
        if (firstName.trim().length < 2) {
          Alert.alert('First Name Required', 'Please enter your First Name before proceeding.');
          return;
        }
        if (lastName.trim().length < 2) {
          Alert.alert('Last Name Required', 'Please enter your Last Name before proceeding.');
          return;
        }
        if (!noMiddleName && middleName.trim().length === 1) {
          Alert.alert('Invalid Middle Name', 'Middle Name must be at least 2 characters long, or select "I have no middle name".');
          return;
        }
        Alert.alert('Missing Address', 'Please provide your current Residential Address before proceeding.');
        return;
      }
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } else if (targetStep === 3) {
      if (!isStep1Valid) {
        if (firstName.trim().length < 2) {
          Alert.alert('First Name Required', 'Please enter your First Name before proceeding.');
        } else if (lastName.trim().length < 2) {
          Alert.alert('Last Name Required', 'Please enter your Last Name before proceeding.');
        } else if (!noMiddleName && middleName.trim().length === 1) {
          Alert.alert('Invalid Middle Name', 'Middle Name must be at least 2 characters long, or select "I have no middle name".');
        } else {
          Alert.alert('Missing Address', 'Please provide your current Residential Address before proceeding.');
        }
        setCurrentStep(1);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      if (!isStep2Valid) {
        Alert.alert('Missing Academic Info', 'Please enter your school and year level before proceeding to documents.');
        setCurrentStep(2);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        return;
      }
      setCurrentStep(3);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleNextFromStep1 = () => {
    if (firstName.trim().length < 2) {
      Alert.alert('First Name Required', 'Please enter your First Name (at least 2 characters).');
      return;
    }
    if (lastName.trim().length < 2) {
      Alert.alert('Last Name Required', 'Please enter your Last Name (at least 2 characters).');
      return;
    }
    if (!noMiddleName && middleName.trim().length === 1) {
      Alert.alert('Invalid Middle Name', 'Middle Name must be at least 2 characters long, or select "I have no middle name".');
      return;
    }
    if (residentialAddress.trim().length === 0) {
      Alert.alert('Missing Address', 'Please enter your current Residential Address before proceeding.');
      return;
    }
    setCurrentStep(2);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleNextFromStep2 = () => {
    if (institutionName.trim().length === 0) {
      Alert.alert('Missing Field', 'Please enter your current School or Institution Name.');
      return;
    }
    if (yearLevel.trim().length === 0) {
      Alert.alert('Missing Field', 'Please select or enter your current Grade or Year Level.');
      return;
    }
    setCurrentStep(3);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSubmitPress = () => {
    if (!isStep1Valid) {
      if (firstName.trim().length < 2) {
        Alert.alert('Incomplete Profile', 'Please enter your First Name in Step 1 before submitting.');
      } else if (lastName.trim().length < 2) {
        Alert.alert('Incomplete Profile', 'Please enter your Last Name in Step 1 before submitting.');
      } else {
        Alert.alert('Missing Address', 'Please enter your Residential Address in Step 1 before submitting.');
      }
      setCurrentStep(1);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (!isStep2Valid) {
      Alert.alert('Missing Field', 'Please enter your school and year level.');
      setCurrentStep(2);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      return;
    }

    if (missingDocs.length > 0) {
      Alert.alert(
        'Incomplete Documents',
        `Please upload all required documents (${missingDocs.map((d) => d.document_name).join(', ')}) before submitting.`
      );
      return;
    }

    setSubmitError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!programId) return;

    try {
      console.log('[Submit] 1. confirm pressed');
      console.log('[Submit] 2. before setIsSubmitting(true)');
      setIsSubmitting(true);
      console.log('[Submit] 3. after setIsSubmitting(true)');
      setShowConfirmModal(false);
      setSubmitError(null);

      console.log('[Submit] 4. constructing FormData for programId:', programId);
      const formData = new FormData();
      formData.append('program_id', String(programId));
      formData.append('institution_name', institutionName.trim());
      if (selectedPartnerSchoolId !== null) {
        formData.append('institution_id', String(selectedPartnerSchoolId));
        formData.append('partner_school_id', String(selectedPartnerSchoolId));
      }
      if (courseProgram.trim()) formData.append('course_program', courseProgram.trim());
      if (yearLevel.trim()) formData.append('year_level', yearLevel.trim());
      formData.append('residential_address', residentialAddress.trim());

      // Fast-Track Verified Citizen Snapshot
      if (isVerifiedCitizen) {
        formData.append('is_citizen_verified', '1');
        if (citizenVerificationData?.citizen_id_number) {
          formData.append('citizen_id_number', String(citizenVerificationData.citizen_id_number).trim());
        }
        formData.append('verified_address_snapshot', residentialAddress.trim());
      } else {
        formData.append('is_citizen_verified', '0');
      }

      // Exact applicant personal name and contact payload
      const fullComputedName = [firstName.trim(), middleName.trim(), lastName.trim(), suffix.trim()].filter(Boolean).join(' ');
      formData.append('first_name', firstName.trim());
      if (middleName.trim()) formData.append('middle_name', middleName.trim());
      formData.append('last_name', lastName.trim());
      if (suffix.trim()) formData.append('suffix', suffix.trim());
      formData.append('full_name', fullComputedName);
      if (email.trim()) formData.append('email', email.trim());
      const normalizedPhone = phoneDigits.trim() ? `+63${phoneDigits.trim()}` : '';
      if (normalizedPhone) formData.append('mobile_number', normalizedPhone);

      // Append uploaded documents with Expo File objects expected by expo/fetch
      requiredDocsList.forEach((doc) => {
        const key = doc.program_document_id
          ? `doc_${doc.program_document_id}`
          : `doc_${doc.document_requirement_id}`;
        const fileState = files[key];

        if (fileState) {
          console.log(`[Submit] 5. appending ${key} (${doc.document_name})`, {
            program_document_id: doc.program_document_id,
            document_requirement_id: doc.document_requirement_id,
            document_code: doc.document_code,
            filename: fileState.name,
            size: fileState.size,
            mime: fileState.mimeType,
            uriScheme: fileState.uri ? fileState.uri.split(':')[0] : null,
          });

          const fileUri = fileState.uri || fileState.asset?.uri;
          const mimeType = fileState.mimeType || fileState.asset?.mimeType || 'application/pdf';
          const isPng = mimeType.toLowerCase().includes('png');
          const isPdf = mimeType.toLowerCase().includes('pdf');
          const fallbackExt = isPdf ? 'pdf' : (isPng ? 'png' : 'jpg');
          const rawName = fileState.name || fileState.asset?.name;
          const safeName = rawName && rawName.includes('.')
            ? rawName
            : `doc_${Date.now()}.${fallbackExt}`;

          formData.append(key, {
            uri: fileUri,
            name: safeName,
            type: mimeType,
          } as any);
          console.log(`[Submit] 5. appended ${key} successfully using canonical multipart object`);
        } else {
          console.log(`[Submit] 5. NO FILE selected for key ${key} (${doc.document_name})`);
        }
      });

      console.log('[Submit] 6. before API call submitNewScholarshipApplication');
      const startTime = Date.now();
      const result = await submitNewScholarshipApplication(formData);
      const duration = Date.now() - startTime;
      console.log(`[Submit] 7. after API call resolved in ${duration}ms`, result);

      // Clear draft on successful submission
      const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
      if (activeUserId && programId) {
        await FormDraftService.clearDraft('new_applicant', activeUserId, programId).catch(() => {});
      }

      setSubmitResult(result);
      console.log('[Submit] 8. setSubmitResult executed');
    } catch (err: any) {
      console.error('[Submit] CATCH entered with error:', err);
      const errMsg = err?.message || 'Failed to submit scholarship application.';
      if (
        errMsg.includes('ACTIVE_APPLICATION_EXISTS') ||
        errMsg.includes('already have an active application') ||
        errMsg.includes('Citizens may only have one active application')
      ) {
        Alert.alert(
          'Active Application Exists',
          'You already have an active scholarship application. Citizens may only have one active application at a time.',
          [
            {
              text: 'Go to Dashboard',
              onPress: () => router.replace('/education/dashboard' as any),
            },
          ]
        );
      } else {
        setSubmitError(errMsg);
      }
    } finally {
      console.log('[Submit] FINALLY entered');
      setIsSubmitting(false);
      console.log('[Submit] after setIsSubmitting(false)');
    }
  };


  if (submitResult) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC' }}
      >
        <View style={[styles.successCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#065F46' }]}>
          <View style={[styles.successIconRing, isDarkMode && { backgroundColor: '#064E3B' }]}>
            <IconSymbol name="checkmark.circle.fill" size={38} color="#16A34A" />
          </View>

          <Text style={[styles.successTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Application Submitted!
          </Text>
          <Text style={[styles.successSub, isDarkMode && { color: '#CBD5E1' }]}>
            Your scholarship application has been successfully received and submitted for review.
          </Text>

          <View style={[styles.metaBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Application Code</Text>
              <Text style={[styles.metaValue, { color: '#0284C7' }]}>{submitResult.application_code}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Program</Text>
              <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>{submitResult.program_name}</Text>
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Status</Text>
              <Badge variant="info" label={submitResult.application_status} />
            </View>

            <View style={styles.metaRow}>
              <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Submitted At</Text>
              <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>
                {formatDateTime(submitResult.submitted_at)}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { width: '100%' }]}
            onPress={() => {
              if (router.canDismiss?.()) {
                router.dismissAll();
              }
              router.replace('/education/dashboard' as any);
            }}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Track My Application</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(140, insets.bottom + 100) },
      ]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#38BDF8' : '#0284C7'}
          colors={['#0284C7']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={handleTopBackPress}
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
            size={18}
            color={isDarkMode ? '#38BDF8' : '#0284C7'}
          />
        </View>
        <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
          {currentStep === 1
            ? 'Back to Details'
            : currentStep === 2
              ? 'Back to Personal'
              : 'Back to Academic'}
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {fetchError ? (
        <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            {fetchError}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#0284C7',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={220} borderRadius={16} />
          <Skeleton height={240} borderRadius={16} />
        </View>
      ) : program ? (
        <>
          {/* HEADER CARD (Step 1 only - full presentation) */}
          {currentStep === 1 ? (
            <View style={[styles.headerCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.badgeRow}>
                <Badge variant="info" label={program.category_name || 'General'} />
                {program.application_period ? (
                  <Badge variant="neutral" label={`AY ${program.application_period.academic_year}`} />
                ) : null}
              </View>

              <Text style={[styles.programTitle, isDarkMode && { color: '#F8FAFC' }]}>
                New Application: {program.program_name}
              </Text>
              <Text style={[styles.programCode, isDarkMode && { color: '#94A3B8' }]}>
                Code: {program.program_code}
              </Text>
            </View>
          ) : null}

          {/* SUBMIT ERROR BANNER */}
          {submitError ? (
            <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 14, marginBottom: 14 }]}>
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                {submitError}
              </Text>
            </View>
          ) : null}

          {/* PROGRESSIVE STEPPER HEADER */}
          <View style={[styles.stepperCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.stepperRow}>
              {/* Step 1 Node */}
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => handleGoToStep(1)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.stepNode,
                    currentStep === 1
                      ? styles.stepNodeActive
                      : currentStep > 1
                        ? styles.stepNodeCompleted
                        : styles.stepNodeUpcoming,
                    isDarkMode && currentStep > 1 && { backgroundColor: '#15803D', borderColor: '#15803D' },
                    isDarkMode && currentStep < 1 && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  ]}
                >
                  {currentStep > 1 ? (
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNodeText,
                        currentStep === 1 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                      ]}
                    >
                      1
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === 1
                      ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                      : currentStep > 1
                        ? [styles.stepLabelCompleted, isDarkMode && { color: '#4ADE80' }]
                        : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
                  ]}
                >
                  Personal
                </Text>
              </TouchableOpacity>

              {/* Connector 1 -> 2 */}
              <View
                style={[
                  styles.stepConnector,
                  currentStep > 1 && styles.stepConnectorCompleted,
                  isDarkMode && currentStep <= 1 && { backgroundColor: '#334155' },
                ]}
              />

              {/* Step 2 Node */}
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => handleGoToStep(2)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.stepNode,
                    currentStep === 2
                      ? styles.stepNodeActive
                      : currentStep > 2
                        ? styles.stepNodeCompleted
                        : styles.stepNodeUpcoming,
                    isDarkMode && currentStep > 2 && { backgroundColor: '#15803D', borderColor: '#15803D' },
                    isDarkMode && currentStep < 2 && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  ]}
                >
                  {currentStep > 2 ? (
                    <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNodeText,
                        currentStep === 2 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                      ]}
                    >
                      2
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === 2
                      ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                      : currentStep > 2
                        ? [styles.stepLabelCompleted, isDarkMode && { color: '#4ADE80' }]
                        : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
                  ]}
                >
                  Academic
                </Text>
              </TouchableOpacity>

              {/* Connector 2 -> 3 */}
              <View
                style={[
                  styles.stepConnector,
                  currentStep > 2 && styles.stepConnectorCompleted,
                  isDarkMode && currentStep <= 2 && { backgroundColor: '#334155' },
                ]}
              />

              {/* Step 3 Node */}
              <TouchableOpacity
                style={styles.stepItem}
                onPress={() => handleGoToStep(3)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.stepNode,
                    currentStep === 3 ? styles.stepNodeActive : styles.stepNodeUpcoming,
                    isDarkMode && currentStep < 3 && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  ]}
                >
                  <Text
                    style={[
                      styles.stepNodeText,
                      currentStep === 3 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                    ]}
                  >
                    3
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    currentStep === 3
                      ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                      : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
                  ]}
                >
                  Documents
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* COMPACT PROGRAM SUBHEADER (Steps 2 and 3) */}
          {currentStep > 1 ? (
            <View style={[styles.programSubheader, isDarkMode && { backgroundColor: '#0B2942', borderColor: '#0369A1' }]}>
              <IconSymbol name="book.closed.fill" size={15} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
              <Text style={[styles.programSubheaderText, isDarkMode && { color: '#E0F2FE' }]} numberOfLines={1}>
                Applying for: <Text style={{ fontWeight: '700' }}>{program.program_name}</Text>
                {program.application_period ? ` (AY ${program.application_period.academic_year})` : ''}
              </Text>
            </View>
          ) : null}

          {/* ================================================================ */}
          {/* STEP 1: PERSONAL & IDENTITY INFORMATION                          */}
          {/* ================================================================ */}
          {currentStep === 1 ? (
            <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                  Personal & Identity Information
                </Text>
                <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
                  <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
                    Step 1 of 3
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Review your identity profile and confirm your registered municipal residency.
              </Text>

              {isVerifiedCitizen ? (
                <>
                  {/* VERIFIED CITIZEN FAST-TRACK CARD */}
                  <View style={[styles.fastTrackCard, isDarkMode && { backgroundColor: '#064E3B20', borderColor: '#059669' }]}>
                    <View style={styles.fastTrackHeader}>
                      <View style={[styles.fastTrackBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                        <IconSymbol name="checkmark.seal.fill" size={14} color={isDarkMode ? '#34D399' : '#15803D'} />
                        <Text style={[styles.fastTrackBadgeText, isDarkMode && { color: '#A7F3D0' }]}>
                          Verified Citizen Profile (Fast-Track)
                        </Text>
                      </View>
                      {citizenVerificationData?.citizen_id_number ? (
                        <View style={[styles.fastTrackIdBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                          <Text style={[styles.fastTrackIdLabel, isDarkMode && { color: '#A7F3D0' }]}>ID:</Text>
                          <Text style={[styles.fastTrackIdNumber, isDarkMode && { color: '#6EE7B7' }]}>
                            {citizenVerificationData.citizen_id_number}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <Text style={[styles.fastTrackNote, isDarkMode && { color: '#34D399' }, { marginTop: 0 }]}>
                      Personal identification and municipal residency are pre-verified via your Citizen ID and locked for application integrity.
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  {/* UNVERIFIED NOTICE */}
                  {!isVerificationLoading && !isNoticeDismissed ? (
                    <View style={[styles.unverifiedTipBanner, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#0284C7' }]}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                        <IconSymbol name="info.circle.fill" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.unverifiedTipText, isDarkMode && { color: '#E0F2FE' }]}>
                            Tip: Verify your Citizen ID to auto-fill details and speed up scholarship processing.
                          </Text>
                          <TouchableOpacity
                            onPress={() => router.push('/(auth)/verify-citizen' as any)}
                            activeOpacity={0.7}
                          >
                            <Text style={[styles.unverifiedTipLink, isDarkMode && { color: '#38BDF8' }]}>
                              Verify as Citizen Now →
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                      <TouchableOpacity
                        onPress={() => setIsNoticeDismissed(true)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        style={{ padding: 4 }}
                      >
                        <IconSymbol name="xmark" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </>
              )}

              {/* INDIVIDUAL FORM INPUT FIELDS */}
              {/* 1. EMAIL ADDRESS */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                  Email Address
                </Text>
                {isVerifiedCitizen ? (
                  <View
                    style={[
                      styles.lockedInputContainer,
                      isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.lockedTextInput,
                        isDarkMode && { color: '#F8FAFC' },
                      ]}
                      value={email}
                      editable={false}
                    />
                    <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.textInput,
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                    ]}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter email address"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isSubmitting}
                  />
                )}
              </View>

              {/* 2. MOBILE PHONE NUMBER */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                  Mobile Phone Number
                </Text>
                <View
                  style={[
                    styles.phoneInputContainer,
                    isVerifiedCitizen && [
                      styles.lockedInputContainer,
                      isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                    ],
                    isDarkMode && !isVerifiedCitizen && { backgroundColor: '#0F172A', borderColor: '#334155' },
                  ]}
                >
                  <View
                    style={[
                      styles.phonePrefixBox,
                      isDarkMode && { backgroundColor: '#1E293B', borderRightColor: '#334155' },
                    ]}
                  >
                    <Text style={{ fontSize: 16 }}>🇵🇭</Text>
                    <Text style={[styles.phonePrefixText, isDarkMode && { color: '#CBD5E1' }]}>+63</Text>
                  </View>
                  <TextInput
                    style={[
                      styles.phoneTextInput,
                      isDarkMode && { color: '#F8FAFC' },
                      isVerifiedCitizen && styles.lockedTextInput,
                      isVerifiedCitizen && isDarkMode && { color: '#F8FAFC' },
                    ]}
                    placeholder="9XX XXX XXXX"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    value={formatPhoneNumber(phoneDigits)}
                    onChangeText={handlePhoneChange}
                    keyboardType="phone-pad"
                    maxLength={12}
                    autoCapitalize="none"
                    editable={!isVerifiedCitizen && !isSubmitting}
                  />
                  {isVerifiedCitizen ? (
                    <View style={{ paddingRight: 12 }}>
                      <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                    </View>
                  ) : null}
                </View>
              </View>

              {/* 3. NAME FIELDS: FIRST NAME (flex: 2) + SUFFIX (flex: 1) */}
              <View style={styles.inputGroup}>
                <View style={styles.rowFields}>
                  <View style={styles.firstNameContainer}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                      First Name *
                    </Text>
                    {isVerifiedCitizen ? (
                      <View
                        style={[
                          styles.lockedInputContainer,
                          isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.lockedTextInput,
                            isDarkMode && { color: '#F8FAFC' },
                          ]}
                          value={firstName}
                          editable={false}
                        />
                        <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                      </View>
                    ) : (
                      <TextInput
                        style={[
                          styles.textInput,
                          isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                        ]}
                        placeholder="First Name *"
                        placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        maxLength={50}
                        editable={!isSubmitting}
                      />
                    )}
                  </View>
                  <View style={styles.suffixContainer}>
                    <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                      Suffix
                    </Text>
                    {isVerifiedCitizen ? (
                      <View
                        style={[
                          styles.lockedInputContainer,
                          isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                        ]}
                      >
                        <TextInput
                          style={[
                            styles.lockedTextInput,
                            isDarkMode && { color: '#F8FAFC' },
                          ]}
                          value={suffix || 'None'}
                          editable={false}
                        />
                        <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.suffixSelectBtn,
                          isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                        ]}
                        onPress={() => !isSubmitting && setShowSuffixModal(true)}
                        disabled={isSubmitting}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.suffixSelectText,
                            isDarkMode && { color: '#F8FAFC' },
                            !suffix && { color: isDarkMode ? '#64748B' : '#94A3B8' },
                          ]}
                        >
                          {suffix || 'Suffix'}
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={13}
                          color={isDarkMode ? '#94A3B8' : '#64748B'}
                          style={{ transform: [{ rotate: '90deg' }] }}
                        />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>

              {/* 4. MIDDLE NAME + CHECKBOX */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                  Middle Name
                </Text>
                {isVerifiedCitizen ? (
                  <View
                    style={[
                      styles.lockedInputContainer,
                      isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.lockedTextInput,
                        isDarkMode && { color: '#F8FAFC' },
                      ]}
                      value={middleName || 'No Middle Name'}
                      editable={false}
                    />
                    <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                  </View>
                ) : (
                  <>
                    <TextInput
                      style={[
                        styles.textInput,
                        noMiddleName && [styles.verifiedLockedField, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }],
                        isDarkMode && !noMiddleName && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                        noMiddleName && { color: isDarkMode ? '#64748B' : '#94A3B8' },
                      ]}
                      placeholder="Middle Name"
                      placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                      value={noMiddleName ? '' : middleName}
                      onChangeText={setMiddleName}
                      editable={!noMiddleName && !isSubmitting}
                      autoCapitalize="words"
                      maxLength={50}
                    />
                    <TouchableOpacity
                      style={styles.checkboxRow}
                      onPress={() => {
                        if (isSubmitting) return;
                        setNoMiddleName((prev) => !prev);
                        if (!noMiddleName) setMiddleName('');
                      }}
                      activeOpacity={0.8}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          noMiddleName && styles.checkboxChecked,
                          isDarkMode && { backgroundColor: noMiddleName ? '#0284C7' : '#0F172A', borderColor: '#334155' },
                        ]}
                      >
                        {noMiddleName ? <IconSymbol name="checkmark" size={12} color="#FFFFFF" /> : null}
                      </View>
                      <Text style={[styles.checkboxLabel, isDarkMode && { color: '#94A3B8' }]}>
                        I have no middle name
                      </Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {/* 5. LAST NAME */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                  Last Name *
                </Text>
                {isVerifiedCitizen ? (
                  <View
                    style={[
                      styles.lockedInputContainer,
                      isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.lockedTextInput,
                        isDarkMode && { color: '#F8FAFC' },
                      ]}
                      value={lastName}
                      editable={false}
                    />
                    <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.textInput,
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                    ]}
                    placeholder="Last Name *"
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                    maxLength={50}
                    editable={!isSubmitting}
                  />
                )}
              </View>

              {/* DEMOGRAPHICS GRID (Verified Citizens only) */}
              {isVerifiedCitizen ? (
                <View style={[styles.demographicsRow, { marginBottom: 16 }]}>
                  <View style={styles.demographicItem}>
                    <Text style={[styles.demographicLabel, isDarkMode && { color: '#94A3B8' }]}>
                      Sex / Gender
                    </Text>
                    <View style={[styles.demographicBox, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.demographicValue, isDarkMode && { color: '#F8FAFC' }]}>
                          {citizenVerificationData?.gender || citizenVerificationData?.sex || 'N/A'}
                        </Text>
                        <Ionicons name="lock-closed-outline" size={15} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                      </View>
                    </View>
                  </View>

                  <View style={styles.demographicItem}>
                    <Text style={[styles.demographicLabel, isDarkMode && { color: '#94A3B8' }]}>
                      Date of Birth
                    </Text>
                    <View style={[styles.demographicBox, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }]}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.demographicValue, isDarkMode && { color: '#F8FAFC' }]}>
                          {(() => {
                            const dob = citizenVerificationData?.birthdate || citizenVerificationData?.birth_date;
                            const formatted = formatDate(dob);
                            return formatted === '—' ? 'N/A' : formatted;
                          })()}
                        </Text>
                        <Ionicons name="lock-closed-outline" size={15} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                      </View>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* 6. RESIDENTIAL ADDRESS */}
              <View style={[styles.inputGroup, { marginBottom: 6 }]}>
                <Text style={[styles.inputLabel, { marginBottom: 6 }, isDarkMode && { color: '#F8FAFC' }]}>
                  Residential Address *
                </Text>
                {isVerifiedCitizen ? (
                  <View
                    style={[
                      styles.lockedAddressContainer,
                      isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                    ]}
                  >
                    <TextInput
                      style={[
                        styles.lockedTextInput,
                        { minHeight: 44, textAlignVertical: 'top' },
                        isDarkMode && { color: '#F8FAFC' },
                      ]}
                      value={residentialAddress}
                      editable={false}
                      multiline={true}
                    />
                    <View style={{ paddingTop: 2 }}>
                      <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                    </View>
                  </View>
                ) : (
                  <TextInput
                    style={[
                      styles.textInput,
                      { minHeight: 52, textAlignVertical: 'top', paddingTop: 10 },
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                    ]}
                    value={residentialAddress}
                    onChangeText={setResidentialAddress}
                    placeholder="Enter complete residential address (Street, Barangay, City)..."
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    autoCapitalize="words"
                    multiline={true}
                    editable={!isSubmitting}
                  />
                )}
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  {isVerifiedCitizen
                    ? 'Locked to your registered municipal citizen address.'
                    : 'Enter complete residential address (e.g. Street, Barangay, City).'}
                </Text>
              </View>

              {/* STEP 1 NAVIGATION BUTTON */}
              <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
                <TouchableOpacity
                  style={styles.wizardNextBtnFull}
                  onPress={handleNextFromStep1}
                  activeOpacity={0.8}
                >
                  <Text style={styles.wizardNextBtnText}>Next: Academic Info →</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* ================================================================ */}
          {/* STEP 2: ACADEMIC & SCHOOL INFORMATION                            */}
          {/* ================================================================ */}
          {currentStep === 2 ? (
            <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                  Academic & School Information
                </Text>
                <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
                  <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
                    Step 2 of 3
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Provide your current school, academic program, and year level.
              </Text>

            {/* SCHOOL / INSTITUTION */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { marginBottom: 0 }, isDarkMode && { color: '#F8FAFC' }]}>
                  School / Institution *
                </Text>
                {isManualSchool ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIsManualSchool(false);
                      setSchoolSearchQuery('');
                      setShowSchoolModal(true);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                      Select Partner School
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setIsManualSchool(true);
                      setSelectedPartnerSchoolId(null);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                      Enter manually
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isManualSchool ? (
                <>
                  <TextInput
                    style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                    value={institutionName}
                    onChangeText={setInstitutionName}
                    placeholder="Enter full school / institution name..."
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                    <Ionicons name="information-circle-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                      Standard / Non-partner School
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 44,
                      },
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    ]}
                    onPress={() => {
                      setSchoolSearchQuery('');
                      setShowSchoolModal(true);
                    }}
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: institutionName ? '600' : '400',
                        color: institutionName
                          ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                          : (isDarkMode ? '#64748B' : '#94A3B8'),
                        flex: 1,
                        paddingRight: 8,
                      }}
                      numberOfLines={1}
                    >
                      {institutionName || 'Select registered partner school...'}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>

                  {selectedPartnerSchool ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                        {selectedPartnerSchool.institution_code} · Registered Partner School
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                      Choose your school from registered partner institutions.
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* COURSE / PROGRAM */}
            <View style={styles.inputGroup}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <Text style={[styles.inputLabel, { marginBottom: 0 }, isDarkMode && { color: '#F8FAFC' }]}>
                  {isSeniorHighProgram ? 'Strand / Track *' : 'Course / Program *'}
                </Text>
                {isManualCourse ? (
                  <TouchableOpacity
                    onPress={() => {
                      setIsManualCourse(false);
                      setCourseSearchQuery('');
                      setShowCourseModal(true);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                      Select from list
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setIsManualCourse(true);
                    }}
                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                  >
                    <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                      Enter custom course
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {isManualCourse ? (
                <>
                  <TextInput
                    style={[
                      styles.textInput,
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                    ]}
                    value={courseProgram}
                    onChangeText={setCourseProgram}
                    placeholder={
                      isSeniorHighProgram
                        ? 'Enter Senior High strand / track...'
                        : 'Enter course or academic program...'
                    }
                    placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                    autoCapitalize="words"
                    editable={!isSubmitting}
                  />
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                    <Ionicons name="information-circle-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                      Custom Course / Non-standard Track
                    </Text>
                  </View>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 44,
                      },
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    ]}
                    onPress={() => {
                      setCourseSearchQuery('');
                      setShowCourseModal(true);
                    }}
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: courseProgram ? '600' : '400',
                        color: courseProgram
                          ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                          : (isDarkMode ? '#64748B' : '#94A3B8'),
                        flex: 1,
                        paddingRight: 8,
                      }}
                      numberOfLines={1}
                    >
                      {courseProgram || (isSeniorHighProgram ? 'Select Senior High strand...' : 'Select course / program...')}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                  </TouchableOpacity>

                  {isCourseSuggestionSelected ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                      <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                      <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                        {isSeniorHighProgram ? 'Accredited SHS Strand' : 'Recognized Academic Program'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                      {isSeniorHighProgram
                        ? 'Choose from available SHS strands or enter custom track.'
                        : 'Choose your undergraduate program from the list.'}
                    </Text>
                  )}
                </>
              )}
            </View>

            {/* GRADE / YEAR LEVEL */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Grade / Year Level *
              </Text>
              {availableYearLevels.length > 0 ? (
                <>
                  <TouchableOpacity
                    style={[
                      styles.textInput,
                      {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        minHeight: 44,
                      },
                      isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    ]}
                    onPress={() => {
                      setIsYearDropdownOpen((prev) => !prev);
                    }}
                    activeOpacity={0.7}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: yearLevel ? '600' : '400',
                        color: yearLevel
                          ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                          : (isDarkMode ? '#64748B' : '#94A3B8'),
                      }}
                    >
                      {yearLevel || 'Select year level'}
                    </Text>
                    <Ionicons
                      name={isYearDropdownOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={isDarkMode ? '#94A3B8' : '#64748B'}
                    />
                  </TouchableOpacity>

                  {isYearDropdownOpen ? (
                    <View
                      style={{
                        marginTop: 6,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                        backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                        overflow: 'hidden',
                      }}
                    >
                      <View
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                          borderBottomWidth: 1,
                          borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            fontWeight: '700',
                            color: isDarkMode ? '#94A3B8' : '#64748B',
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                          }}
                        >
                          Select Year Level
                        </Text>
                      </View>

                      {availableYearLevels.map((lvl, idx) => {
                        const isSelected = yearLevel === lvl;
                        return (
                          <TouchableOpacity
                            key={lvl}
                            style={{
                              paddingHorizontal: 14,
                              paddingVertical: 11,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              backgroundColor: isSelected
                                ? (isDarkMode ? '#1E293B' : '#F0F9FF')
                                : (isDarkMode ? '#0F172A' : '#FFFFFF'),
                              borderBottomWidth: idx < availableYearLevels.length - 1 ? 1 : 0,
                              borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                            }}
                            onPress={() => {
                              setYearLevel(lvl);
                              setIsYearDropdownOpen(false);
                            }}
                            activeOpacity={0.7}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: isSelected ? '700' : '500',
                                color: isSelected
                                  ? (isDarkMode ? '#38BDF8' : '#0284C7')
                                  : (isDarkMode ? '#F8FAFC' : '#1E293B'),
                              }}
                            >
                              {lvl}
                            </Text>
                            {isSelected ? (
                              <IconSymbol
                                name="checkmark"
                                size={15}
                                color={isDarkMode ? '#38BDF8' : '#0284C7'}
                              />
                            ) : null}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : null}
                </>
              ) : (
                <TextInput
                  style={[
                    styles.textInput,
                    isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                  ]}
                  value={yearLevel}
                  onChangeText={setYearLevel}
                  placeholder="e.g. 1st Year / Grade 11"
                  placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                  editable={!isSubmitting}
                />
              )}
            </View>

            {/* STEP 2 NAVIGATION BUTTONS */}
            <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
              <TouchableOpacity
                style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
                onPress={handleBackToStep1}
                activeOpacity={0.8}
              >
                <IconSymbol name="chevron.left" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
                <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.wizardNextBtn}
                onPress={handleNextFromStep2}
                activeOpacity={0.8}
              >
                <Text style={styles.wizardNextBtnText}>Next: Documents →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ================================================================ */}
        {/* STEP 3: REQUIRED DOCUMENTS & FINAL SUBMISSION                    */}
        {/* ================================================================ */}
        {currentStep === 3 ? (
          <>
            {/* REVIEW DOSSIER COMPACT SUMMARY */}
            <View style={[styles.reviewSummaryCard, isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' }]}>
              <View style={[styles.reviewSummaryHeader, isDarkMode && { borderBottomColor: '#0369A1' }]}>
                <Text style={[styles.reviewSummaryTitle, isDarkMode && { color: '#38BDF8' }]}>
                  Application Summary Review
                </Text>
                <TouchableOpacity onPress={() => handleGoToStep(1)} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                  <Text style={{ fontSize: 12, fontWeight: '700', color: isDarkMode ? '#38BDF8' : '#0284C7' }}>
                    Edit Details
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Applicant:</Text>
                <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {[firstName.trim(), middleName.trim(), lastName.trim(), suffix.trim()].filter(Boolean).join(' ') || verifiedFullName}
                </Text>
              </View>

              {email ? (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Email:</Text>
                  <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{email}</Text>
                </View>
              ) : null}

              {phoneDigits ? (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Mobile:</Text>
                  <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{`+63 ${formatPhoneNumber(phoneDigits)}`}</Text>
                </View>
              ) : null}

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Citizen Status:</Text>
                <Text style={[styles.reviewValue, isDarkMode && { color: '#4ADE80' }, !isVerifiedCitizen && { color: isDarkMode ? '#CBD5E1' : '#475569' }]}>
                  {isVerifiedCitizen
                    ? `Verified Citizen (${citizenVerificationData?.citizen_id_number || 'Approved'})`
                    : 'Standard / Unverified Applicant'}
                </Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Address:</Text>
                <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>
                  {residentialAddress || 'None provided'}
                </Text>
              </View>

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>School:</Text>
                <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {institutionName} {selectedPartnerSchool ? '(Partner School)' : ''}
                </Text>
              </View>

              {courseProgram ? (
                <View style={styles.reviewRow}>
                  <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Course / Track:</Text>
                  <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{courseProgram}</Text>
                </View>
              ) : null}

              <View style={styles.reviewRow}>
                <Text style={[styles.reviewLabel, isDarkMode && { color: '#94A3B8' }]}>Year Level:</Text>
                <Text style={[styles.reviewValue, isDarkMode && { color: '#F8FAFC' }]}>{yearLevel}</Text>
              </View>

              <Text style={[styles.reviewNote, isDarkMode && { color: '#38BDF8' }]}>
                {'Please review your details above before submitting. Tap "Edit Details" if anything needs adjusting.'}
              </Text>
            </View>

            {/* 3. REQUIRED DOCUMENTS (BACKEND DRIVEN) */}
            <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.stepHeaderRow}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
                  Required Documents Upload
                </Text>
                <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
                  <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
                    Step 3 of 3
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 12 }}>
                Maximum allowed file size: 5 MB per document (PDF, PNG, JPG accepted).
              </Text>

            {requiredDocsList.map((doc) => {
              const key = doc.program_document_id
                ? `doc_${doc.program_document_id}`
                : `doc_${doc.document_requirement_id}`;
              const selectedFile = files[key];
              const isVideoDoc =
                doc.document_code?.toUpperCase().includes('VIDEO') ||
                doc.document_name?.toUpperCase().includes('VIDEO');

              return (
                <View key={key} style={[styles.docItemCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                  <View style={styles.docHeaderRow}>
                    <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {doc.document_name}
                    </Text>
                    <Badge
                      variant={selectedFile ? 'success' : 'warning'}
                      label={selectedFile ? 'Attached' : 'Required'}
                    />
                  </View>

                  {doc.description ? (
                    <Text style={[styles.docInstructions, isDarkMode && { color: '#94A3B8' }]}>
                      {doc.description}
                    </Text>
                  ) : doc.instructions ? (
                    <Text style={[styles.docInstructions, isDarkMode && { color: '#94A3B8' }]}>
                      {doc.instructions}
                    </Text>
                  ) : null}


                  {isVideoDoc ? (
                    <View style={[styles.videoGuideCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#0369A1' }]}>
                      <View style={styles.videoGuideHeader}>
                        <IconSymbol name="info.circle.fill" size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                        <Text style={[styles.videoGuideTitle, isDarkMode && { color: '#38BDF8' }]}>
                          Video Declaration Guide
                        </Text>
                      </View>

                      <Text style={[styles.videoGuideSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                        Use the guide below as your script when recording your video declaration.
                      </Text>

                      <View style={[styles.videoGuideImageWrapper, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                        <Image
                          source={videoDeclarationGuideImg}
                          style={styles.videoGuideImage}
                          resizeMode="contain"
                        />
                      </View>

                      <TouchableOpacity
                        style={styles.viewFullGuideBtn}
                        onPress={() => setShowFullGuideModal(true)}
                        activeOpacity={0.8}
                      >
                        <IconSymbol name="eye.fill" size={14} color="#FFFFFF" />
                        <Text style={styles.viewFullGuideBtnText}>View Full Guide</Text>
                      </TouchableOpacity>

                      <Text style={[styles.videoGuideFooter, isDarkMode && { color: '#CBD5E1' }]}>
                        Record your video clearly, show your valid ID when instructed, and upload the completed recording below.
                      </Text>
                    </View>
                  ) : null}
                  <TouchableOpacity
                    style={[
                      styles.uploadBox,
                      selectedFile && styles.uploadBoxSuccess,
                      isDarkMode && !selectedFile && { backgroundColor: '#1E293B', borderColor: '#0284C7' },
                    ]}
                    onPress={() => handlePickDocument(doc)}
                    activeOpacity={0.75}
                  >
                    <IconSymbol
                      name={
                        selectedFile
                          ? 'checkmark.circle.fill'
                            : isVideoDoc
                              ? 'video.fill'
                              : 'doc.badge.plus'
                      }
                      size={18}
                      color={selectedFile ? '#16A34A' : '#0284C7'}
                    />
                    <Text style={[styles.uploadText, selectedFile && styles.fileNameText]}>
                      {selectedFile
                        ? selectedFile.name
                          : (doc.document_code?.toUpperCase().includes('VIDEO') || doc.document_name?.toUpperCase().includes('VIDEO'))
                            ? `Select ${doc.document_name} (MP4, MOV, WEBM up to 60MB)`
                            : `Select ${doc.document_name} (PDF, PNG, JPG up to 5MB)`}
                    </Text>
                  </TouchableOpacity>

                  {/* OCR Document Validation Feedback (non-video documents only) */}
                  {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validating' ? (
                    <View
                      style={[
                        styles.ocrFeedbackBox,
                        styles.ocrValidatingBox,
                        isDarkMode && { backgroundColor: '#0F243A', borderColor: '#0369A1' },
                      ]}
                    >
                      <ActivityIndicator size="small" color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                      <Text style={[styles.ocrValidatingText, isDarkMode && { color: '#38BDF8' }]}>
                        Checking document with OCR pre-validation...
                      </Text>
                    </View>
                  ) : null}

                  {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'MATCH' ? (
                    <View
                      style={[
                        styles.ocrFeedbackBox,
                        styles.ocrMatchBox,
                        isDarkMode && { backgroundColor: '#052E16', borderColor: '#15803D' },
                      ]}
                    >
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={16}
                        color={isDarkMode ? '#4ADE80' : '#16A34A'}
                      />
                      <Text style={[styles.ocrMatchText, isDarkMode && { color: '#86EFAC' }]}>
                        {docValidations[key]?.message || `Document appears to be a ${doc.document_name}.`}
                      </Text>
                    </View>
                  ) : null}

                  {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'MISMATCH' ? (
                    <View
                      style={[
                        styles.ocrFeedbackBox,
                        styles.ocrMismatchBox,
                        isDarkMode && { backgroundColor: '#451A03', borderColor: '#B45309' },
                      ]}
                    >
                      <View style={styles.ocrMismatchContentRow}>
                        <IconSymbol
                          name="exclamationmark.triangle.fill"
                          size={16}
                          color={isDarkMode ? '#FBBF24' : '#D97706'}
                        />
                        <Text style={[styles.ocrMismatchText, isDarkMode && { color: '#FDE68A' }]}>
                          {docValidations[key]?.message && docValidations[key]?.message?.includes('Please upload')
                            ? docValidations[key]?.message
                            : `${docValidations[key]?.message || 'This file does not appear to match the required document.'} Please upload the required ${doc.document_name}.`}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.ocrChangeFileBtn,
                          isDarkMode && { backgroundColor: '#78350F', borderColor: '#B45309' },
                        ]}
                        onPress={() => handlePickDocument(doc)}
                        activeOpacity={0.8}
                      >
                        <IconSymbol
                          name="pencil"
                          size={12}
                          color={isDarkMode ? '#FDE68A' : '#92400E'}
                        />
                        <Text style={[styles.ocrChangeFileBtnText, isDarkMode && { color: '#FDE68A' }]}>
                          Change File
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {!isVideoDoc && selectedFile && docValidations[key]?.status === 'validated' && docValidations[key]?.result === 'INCONCLUSIVE' ? (
                    <View
                      style={[
                        styles.ocrFeedbackBox,
                        styles.ocrInconclusiveBox,
                        isDarkMode && { backgroundColor: '#1E293B', borderColor: '#475569' },
                      ]}
                    >
                      <IconSymbol
                        name="info.circle.fill"
                        size={16}
                        color={isDarkMode ? '#94A3B8' : '#64748B'}
                      />
                      <Text style={[styles.ocrInconclusiveText, isDarkMode && { color: '#CBD5E1' }]}>
                        {docValidations[key]?.message?.includes('unavailable') || docValidations[key]?.message?.includes('network')
                          ? 'Automatic verification is unavailable. Your document can still be reviewed manually.'
                          : 'Automatic identification was inconclusive. Your document can still be reviewed manually.'}
                      </Text>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>

          {/* STEP 3 NAVIGATION BUTTONS */}
          <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
            <TouchableOpacity
              style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
              onPress={handleBackToStep2}
              activeOpacity={0.8}
            >
              <IconSymbol name="chevron.left" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
              <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.wizardNextBtn,
                (!isFormValid || isSubmitting) && styles.wizardNextBtnDisabled,
              ]}
              onPress={handleSubmitPress}
              disabled={!isFormValid || isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.wizardNextBtnText}>Submit Application</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </>
  ) : null}

      {/* CONFIRMATION MODAL */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => !isSubmitting && setShowConfirmModal(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <View style={[styles.sectionCard, { width: '100%', padding: 20 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: 8 }, isDarkMode && { color: '#F8FAFC' }]}>
              Confirm Application Submission
            </Text>
            {isVerifiedCitizen ? (
              <View
                style={{
                  backgroundColor: isDarkMode ? '#052E16' : '#DCFCE7',
                  borderColor: isDarkMode ? '#15803D' : '#86EFAC',
                  borderWidth: 1,
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <IconSymbol name="checkmark.seal.fill" size={20} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#86EFAC' : '#15803D' }}>
                    Fast-Track Verified Citizen
                  </Text>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#BBF7D0' : '#166534', marginTop: 2 }}>
                    Citizen ID: {citizenVerificationData?.citizen_id_number || 'Approved'} •• Verified Profile
                  </Text>
                </View>
              </View>
            ) : null}
            <Text style={[styles.docInstructions, { fontSize: 13, marginBottom: 16 }, isDarkMode && { color: '#CBD5E1' }]}>
              {`Are you sure you want to submit your application for "${program?.program_name}"? Please verify that all uploaded documents are accurate and complete.`}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, backgroundColor: isDarkMode ? '#334155' : '#E2E8F0', opacity: isSubmitting ? 0.5 : 1 }}
                onPress={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                <Text style={{ fontWeight: '600', color: isDarkMode ? '#F8FAFC' : '#475569' }}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{ paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, backgroundColor: '#0284C7', opacity: isSubmitting ? 0.7 : 1, minWidth: 140, alignItems: 'center', justifyContent: 'center' }}
                onPress={handleConfirmSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Confirm & Submit</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULL VIDEO GUIDE MODAL */}
      <Modal
        visible={showFullGuideModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFullGuideModal(false)}
      >
        <View style={styles.fullImageModalOverlay}>
          <View style={[styles.fullImageModalCard, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <View style={styles.fullImageModalHeader}>
              <Text style={[styles.fullImageModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Video Declaration Guide
              </Text>
              <TouchableOpacity
                style={[styles.fullImageModalCloseBtn, isDarkMode && { backgroundColor: '#334155' }]}
                onPress={() => setShowFullGuideModal(false)}
                activeOpacity={0.7}
              >
                <IconSymbol name="xmark.circle.fill" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
                <Text style={[styles.fullImageModalCloseText, isDarkMode && { color: '#F8FAFC' }]}>Close</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.fullImageModalScroll} showsVerticalScrollIndicator={true}>
              <Image
                source={videoDeclarationGuideImg}
                style={styles.fullImageModalImage}
                resizeMode="contain"
              />
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* PARTNER SCHOOL SELECTION MODAL */}
      <Modal
        visible={showSchoolModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSchoolModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowSchoolModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.schoolModalContainer, isDarkMode && { backgroundColor: '#0F172A' }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.schoolModalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.schoolModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Select Partner School
                </Text>
                <Text style={[styles.schoolModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                  Choose from accredited partner institutions
                </Text>
              </View>
              <TouchableOpacity
                style={styles.schoolModalCloseBtn}
                onPress={() => setShowSchoolModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.schoolSearchContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Ionicons name="search" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <TextInput
                style={[styles.schoolSearchInput, isDarkMode && { color: '#F8FAFC' }]}
                value={schoolSearchQuery}
                onChangeText={setSchoolSearchQuery}
                placeholder="Search school name or code..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {schoolSearchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setSchoolSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* "School not listed? Enter manually" banner */}
            <TouchableOpacity
              style={[styles.manualSchoolBanner, isDarkMode && { backgroundColor: '#082F49', borderColor: '#0369A1' }]}
              onPress={() => {
                setIsManualSchool(true);
                setSelectedPartnerSchoolId(null);
                setShowSchoolModal(false);
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.manualSchoolIconCircle}>
                  <Ionicons name="pencil" size={14} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manualSchoolTitle, isDarkMode && { color: '#38BDF8' }]}>
                    School not listed? Enter manually
                  </Text>
                  <Text style={[styles.manualSchoolSubtitle, isDarkMode && { color: '#7DD3FC' }]}>
                    Apply with any standard or non-partner school
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
            </TouchableOpacity>

            {/* Partner Schools List */}
            <ScrollView
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {modalFilteredPartnerSchools.length === 0 ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Ionicons name="school-outline" size={40} color={isDarkMode ? '#475569' : '#CBD5E1'} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8 }}>
                    No partner schools found
                  </Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2, textAlign: 'center' }}>
                    Tap the option above to enter your school manually.
                  </Text>
                </View>
              ) : (
                modalFilteredPartnerSchools.map((school) => {
                  const isSelected = selectedPartnerSchoolId === school.institution_id;
                  return (
                    <TouchableOpacity
                      key={school.institution_id}
                      style={[
                        styles.schoolListItem,
                        isSelected && [styles.schoolListItemActive, isDarkMode && { backgroundColor: '#1E293B' }],
                        isDarkMode && { borderBottomColor: '#1E293B' },
                      ]}
                      onPress={() => {
                        setInstitutionName(school.institution_name);
                        setSelectedPartnerSchoolId(school.institution_id);
                        setIsManualSchool(false);
                        setShowSchoolModal(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={[
                            styles.schoolItemName,
                            isSelected && { color: '#0284C7' },
                            isDarkMode && { color: isSelected ? '#38BDF8' : '#F8FAFC' },
                          ]}
                          numberOfLines={2}
                        >
                          {school.institution_name}
                        </Text>
                        <Text style={{ fontSize: 11, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                          Registered Partner School
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <View style={[styles.schoolCodeBadge, isDarkMode && { backgroundColor: '#1E293B' }]}>
                          <Text style={[styles.schoolCodeText, isDarkMode && { color: '#38BDF8' }]}>
                            {school.institution_code}
                          </Text>
                        </View>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* COURSE / STRAND SELECTION MODAL */}
      <Modal
        visible={showCourseModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCourseModal(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowCourseModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.schoolModalContainer, isDarkMode && { backgroundColor: '#0F172A' }]}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <View style={styles.schoolModalHeader}>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.schoolModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  {isSeniorHighProgram ? 'Select Senior High Strand' : 'Select Academic Program'}
                </Text>
                <Text style={[styles.schoolModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                  {isSeniorHighProgram
                    ? 'Accredited DepEd Senior High School Strands'
                    : 'Recognized College Degree Programs'}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.schoolModalCloseBtn}
                onPress={() => setShowCourseModal(false)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={22} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={[styles.schoolSearchContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Ionicons name="search" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <TextInput
                style={[styles.schoolSearchInput, isDarkMode && { color: '#F8FAFC' }]}
                value={courseSearchQuery}
                onChangeText={setCourseSearchQuery}
                placeholder={isSeniorHighProgram ? 'Search strand name or code (e.g. STEM, ICT)...' : 'Search course name or code...'}
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
              {courseSearchQuery.length > 0 ? (
                <TouchableOpacity onPress={() => setCourseSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
                </TouchableOpacity>
              ) : null}
            </View>

            {/* "Other / Enter custom course" banner */}
            <TouchableOpacity
              style={[styles.manualSchoolBanner, isDarkMode && { backgroundColor: '#082F49', borderColor: '#0369A1' }]}
              onPress={() => {
                setIsManualCourse(true);
                setShowCourseModal(false);
              }}
              activeOpacity={0.7}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                <View style={styles.manualSchoolIconCircle}>
                  <Ionicons name="pencil" size={14} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.manualSchoolTitle, isDarkMode && { color: '#38BDF8' }]}>
                    Other / Enter custom course
                  </Text>
                  <Text style={[styles.manualSchoolSubtitle, isDarkMode && { color: '#7DD3FC' }]}>
                    {"Can't find your specific strand or program? Enter manually"}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
            </TouchableOpacity>

            {/* Course List */}
            <ScrollView
              style={{ maxHeight: 340 }}
              showsVerticalScrollIndicator={true}
              keyboardShouldPersistTaps="handled"
            >
              {modalFilteredCourses.length === 0 ? (
                <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                  <Ionicons name="book-outline" size={40} color={isDarkMode ? '#475569' : '#CBD5E1'} />
                  <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8 }}>
                    No matching courses found
                  </Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2, textAlign: 'center' }}>
                    Tap the option above to enter your course manually.
                  </Text>
                </View>
              ) : (
                modalFilteredCourses.map((course, idx) => {
                  const selectedText = course.code ? `${course.name} (${course.code})` : course.name;
                  const isSelected = courseProgram === selectedText || courseProgram === course.name;
                  return (
                    <TouchableOpacity
                      key={`${course.name}_${course.code || idx}`}
                      style={[
                        styles.schoolListItem,
                        isSelected && [styles.schoolListItemActive, isDarkMode && { backgroundColor: '#1E293B' }],
                        isDarkMode && { borderBottomColor: '#1E293B' },
                      ]}
                      onPress={() => handleSelectCourse(course)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={[
                            styles.schoolItemName,
                            isSelected && { color: '#0284C7' },
                            isDarkMode && { color: isSelected ? '#38BDF8' : '#F8FAFC' },
                          ]}
                          numberOfLines={2}
                        >
                          {course.name}
                        </Text>
                        <Text style={{ fontSize: 11, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                          {course.category || (isSeniorHighProgram ? 'Senior High School' : 'Degree Program')}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {course.code ? (
                          <View style={[styles.schoolCodeBadge, isDarkMode && { backgroundColor: '#1E293B' }]}>
                            <Text style={[styles.schoolCodeText, isDarkMode && { color: '#38BDF8' }]}>
                              {course.code}
                            </Text>
                          </View>
                        ) : null}
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* SUFFIX SELECTION MODAL */}
      <Modal
        visible={showSuffixModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuffixModal(false)}
      >
        <TouchableOpacity
          style={styles.suffixModalOverlay}
          activeOpacity={1}
          onPress={() => setShowSuffixModal(false)}
        >
          <View
            style={[styles.suffixModalCard, isDarkMode && { backgroundColor: '#1E293B' }]}
            onStartShouldSetResponder={() => true}
          >
            <Text style={[styles.suffixModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Select Name Suffix
            </Text>
            {SUFFIX_OPTIONS.map((opt) => {
              const isSelected = suffix === opt || (!suffix && opt === 'None');
              return (
                <TouchableOpacity
                  key={opt}
                  style={[styles.suffixModalItem, isDarkMode && { borderBottomColor: '#334155' }]}
                  onPress={() => {
                    setSuffix(opt === 'None' ? '' : opt);
                    setShowSuffixModal(false);
                  }}
                >
                  <Text
                    style={[
                      styles.suffixModalItemText,
                      isDarkMode && { color: '#CBD5E1' },
                      isSelected && styles.suffixModalItemTextActive,
                      isSelected && isDarkMode && { color: '#38BDF8' },
                    ]}
                  >
                    {opt}
                  </Text>
                  {isSelected ? (
                    <IconSymbol name="checkmark" size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}
