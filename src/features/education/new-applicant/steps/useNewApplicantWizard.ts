import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, BackHandler, ScrollView } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Router } from 'expo-router';
import { validateFileSize } from '@/src/utils/fileValidation';
import {
  compressImageIfNeeded,
  isImageFile,
  validateDocumentClarity,
  ClarityResult,
} from '@/src/utils/imageCompression';
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
} from '../api/ScholarshipProgramApi';
import { fetchCitizenDashboard } from '../../dashboard/api/scholarshipDashboardApi';
import { COMMON_COURSE_SUGGESTIONS, CourseSuggestion } from '../constants/courseSuggestions';
import { getAvailableYearLevels, resolveEducationLevelCategory } from '../constants/yearLevelOptions';
import { isApiValidationError } from '@/src/services/api-client';
import { SelectedFileState, DocumentValidationState } from './Step5DocumentUploads';

export const SUFFIX_OPTIONS = ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];

export const extractPhoneDigits = (raw?: string | null): string => {
  if (!raw) return '';
  const digits = raw.replace(/\D/g, '');
  const clean = digits.startsWith('63') ? digits.slice(2) : digits.startsWith('0') ? digits.slice(1) : digits;
  return clean.slice(0, 10);
};

export const formatPhoneNumber = (val: string): string => {
  if (!val) return '';
  if (val.length <= 3) return val;
  if (val.length <= 6) return `${val.slice(0, 3)} ${val.slice(3)}`;
  return `${val.slice(0, 3)} ${val.slice(3, 6)} ${val.slice(6, 10)}`;
};

export const parseCandidateId = (val: any): number | null => {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return !isNaN(val) && val > 0 ? val : null;
  if (Array.isArray(val)) return parseCandidateId(val[0]);
  if (typeof val === 'string') {
    const parsed = parseInt(val, 10);
    return !isNaN(parsed) && parsed > 0 ? parsed : null;
  }
  if (typeof val === 'object') {
    return parseCandidateId(val.program_id ?? val.id ?? val.programId);
  }
  return null;
};

export function useNewApplicantWizard(params: any, router: Router) {
  const initialParamProgramId = useMemo(() => {
    return (
      parseCandidateId(params.program_id) ||
      parseCandidateId(params.programId) ||
      parseCandidateId(params.id) ||
      parseCandidateId(params.selectedProgramId) ||
      parseCandidateId(params.program)
    );
  }, [params]);

  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(initialParamProgramId);
  const [program, setProgram] = useState<ScholarshipProgram | null>(null);
  const [applicationDraft, setApplicationDraft] = useState<any>(null);

  useEffect(() => {
    if (initialParamProgramId && initialParamProgramId !== selectedProgramId) {
      setSelectedProgramId(initialParamProgramId);
    }
  }, [initialParamProgramId, selectedProgramId]);

  const programId =
    selectedProgramId ||
    program?.program_id ||
    (program as any)?.id ||
    initialParamProgramId ||
    applicationDraft?.program_id ||
    null;

  const scrollViewRef = useRef<ScrollView>(null);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

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

  // Dynamic file upload state mapped by document key
  const [files, setFiles] = useState<Record<string, SelectedFileState>>({});
  const [docValidations, setDocValidations] = useState<Record<string, DocumentValidationState>>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFullGuideModal, setShowFullGuideModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);
  const [submitResult, setSubmitResult] = useState<SubmitApplicationResult | null>(null);
  const hasHydratedRef = useRef<boolean>(false);

  const loadVerificationStatus = useCallback(async (): Promise<{ isVerified: boolean; address?: string }> => {
    try {
      setIsVerificationLoading(true);
      const currentUser = AuthService.getCurrentUser();
      const citizenUserId = currentUser?.citizen_user_id;
      const citizenEmail = currentUser?.email;

      if (!citizenUserId && !citizenEmail) {
        setIsVerificationLoading(false);
        return { isVerified: false };
      }

      const res = await CitizenVerificationService.getVerificationStatus(
        citizenUserId || undefined,
        citizenEmail || undefined
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
    const targetProgramId =
      selectedProgramId ||
      initialParamProgramId ||
      program?.program_id ||
      applicationDraft?.program_id;

    if (!targetProgramId) {
      setFetchError('No scholarship program selected.');
      setIsLoading(false);
      return;
    }

    try {
      setFetchError(null);
      const [data, schools, vResult] = await Promise.all([
        getScholarshipProgramDetails(
          targetProgramId,
          params?.period_id ? { period_id: params.period_id } : undefined
        ),
        getPartnerSchoolsLookup(targetProgramId),
        loadVerificationStatus(),
      ]);
      setPartnerSchools(schools);
      if (!data) {
        setFetchError('Scholarship program not found.');
      } else {
        const sanitized = sanitizeScholarshipProgramContent(data);
        setProgram(sanitized);
        if (sanitized?.program_id) {
          setSelectedProgramId(Number(sanitized.program_id));
        }

        // Re-hydrate draft if available for this citizen & program
        const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
        if (activeUserId && targetProgramId && !hasHydratedRef.current) {
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
            }>('new_applicant', activeUserId, targetProgramId);

            if (draft) {
              setApplicationDraft(draft);
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
  }, [selectedProgramId, initialParamProgramId, loadVerificationStatus, program?.program_id, applicationDraft?.program_id, params?.period_id]);

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

  // Pre-fill Residential Address from Citizen Profile
  useEffect(() => {
    let isMounted = true;

    async function prefillAddressFromProfile() {
      try {
        const currentUser = AuthService.getCurrentUser();
        const activeUserId = currentUser?.citizen_user_id;
        const activeEmail = currentUser?.email;
        const activePhone = currentUser?.phone;
        const cachedUser = currentUser?.user;

        let candidateAddress = typeof cachedUser?.address === 'string' ? cachedUser.address.trim() : '';
        let candidateBarangay = typeof cachedUser?.barangay === 'string' ? cachedUser.barangay.trim() : '';
        let candidateCity = typeof cachedUser?.city === 'string' ? cachedUser.city.trim() : '';

        if (!candidateAddress && !currentUser?.isGuest) {
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
    const activeProgramId =
      selectedProgramId ||
      program?.program_id ||
      (program as any)?.id ||
      initialParamProgramId ||
      applicationDraft?.program_id ||
      programId;

    if (!hasHydratedRef.current || !activeProgramId) return;
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
      FormDraftService.saveDraft('new_applicant', activeUserId, activeProgramId, {
        program_id: activeProgramId,
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
    selectedProgramId,
    program,
    initialParamProgramId,
    applicationDraft?.program_id,
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

        const validation = validateFileSize(asset, maxLimitMb, doc.document_name);
        if (!validation.valid) {
          Alert.alert('File Too Large', validation.errorMessage || `The selected ${doc.document_name} file exceeds the maximum limit of ${maxLimitMb}MB. Please choose a smaller file.`);
          return;
        }

        let processedAsset = asset;
        let clarityResult: ClarityResult | undefined;

        if (!isVideo && isImageFile(asset)) {
          const compressed = await compressImageIfNeeded(asset);
          processedAsset = {
            ...asset,
            uri: compressed.uri,
            name: compressed.name,
            size: compressed.size,
            mimeType: compressed.mimeType,
          };

          clarityResult = await validateDocumentClarity(processedAsset.uri);
          if (clarityResult.isBlurry) {
            Alert.alert(
              'Document May Be Blurry',
              `${clarityResult.recommendation}\n\nClarity Score: ${clarityResult.score}% (${clarityResult.rating}). Clear documents ensure faster automatic verification.`,
              [{ text: 'Proceed Anyway', style: 'default' }]
            );
          }
        }

        setDocValidations((prev) => {
          const next = { ...prev };
          delete next[docKey];
          return next;
        });

        setFiles((prev) => ({
          ...prev,
          [docKey]: {
            name: processedAsset.name,
            size: processedAsset.size,
            uri: processedAsset.uri,
            mimeType: processedAsset.mimeType,
            asset: processedAsset,
          },
        }));

        if (isVideo) {
          return;
        }

        setDocValidations((prev) => ({
          ...prev,
          [docKey]: {
            status: 'validating',
            clarity: clarityResult,
          },
        }));

        const programDocId = doc.program_document_id || doc.document_requirement_id || 0;
        const currentProgramId = programId || program?.program_id || 0;

        if (!programDocId || !currentProgramId) {
          setDocValidations((prev) => ({
            ...prev,
            [docKey]: {
              status: 'validated',
              result: 'INCONCLUSIVE',
              message: 'Automatic verification is unavailable. Your document can still be reviewed manually.',
              clarity: clarityResult,
            },
          }));
          return;
        }

        try {
          const validationResult = await validateCitizenDocument(
            processedAsset,
            programDocId,
            currentProgramId
          );

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
                clarity: clarityResult,
              },
            }));
          } else {
            setDocValidations((prev) => ({
              ...prev,
              [docKey]: {
                status: 'validated',
                result: 'INCONCLUSIVE',
                message: 'Automatic verification is unavailable. Your document can still be reviewed manually.',
                clarity: clarityResult,
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
              clarity: clarityResult,
            },
          }));
        }
      }
    } catch (err) {
      console.error('[NewApplicantApplicationScreen] document picker error:', err);
      Alert.alert('Error', 'Unable to pick document. Please try again.');
    }
  };

  const requiredDocsList: ScholarshipRequiredDocument[] = useMemo(() => {
    if (program?.required_documents && program.required_documents.length > 0) {
      return program.required_documents;
    }
    const isTertiaryAcademic = program?.program_code === 'ACADEMIC-TER-001';

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

    const checkProgramId =
      selectedProgramId ||
      program?.program_id ||
      (program as any)?.id ||
      initialParamProgramId ||
      applicationDraft?.program_id;

    if (!checkProgramId || isNaN(Number(checkProgramId)) || Number(checkProgramId) <= 0) {
      Alert.alert('Missing Program', 'No valid scholarship program was detected. Please select a program to continue.');
      return;
    }

    setSubmitError(null);
    setFieldErrors({});
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    const selectedProgram = program;
    const resolvedProgramId =
      selectedProgramId ||
      selectedProgram?.program_id ||
      (selectedProgram as any)?.id ||
      parseCandidateId(params?.programId) ||
      parseCandidateId(params?.program_id) ||
      parseCandidateId(params?.id) ||
      parseCandidateId(params?.selectedProgramId) ||
      parseCandidateId(params?.program?.program_id) ||
      parseCandidateId(params?.program?.id) ||
      parseCandidateId(params?.program) ||
      applicationDraft?.program_id ||
      programId;

    if (!resolvedProgramId || isNaN(Number(resolvedProgramId)) || Number(resolvedProgramId) <= 0) {
      setShowConfirmModal(false);
      setSubmitError('Invalid or missing scholarship program ID.');
      return;
    }

    try {
      setIsSubmitting(true);
      setShowConfirmModal(false);
      setSubmitError(null);
      setFieldErrors({});

      const formData = new FormData();
      formData.append('program_id', String(resolvedProgramId));
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

      // Append uploaded documents
      requiredDocsList.forEach((doc) => {
        const key = doc.program_document_id
          ? `doc_${doc.program_document_id}`
          : `doc_${doc.document_requirement_id}`;
        const fileState = files[key];

        if (fileState) {
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
        }
      });

      const result = await submitNewScholarshipApplication(formData, resolvedProgramId);

      // Clear draft on successful submission
      const activeUserId = AuthService.getCurrentUser()?.citizen_user_id;
      if (activeUserId && resolvedProgramId) {
        await FormDraftService.clearDraft('new_applicant', activeUserId, Number(resolvedProgramId)).catch(() => {});
      }

      setSubmitResult(result);
    } catch (err: any) {
      console.error('[NewApplicantApplicationScreen] Submission error:', err);
      if (isApiValidationError(err)) {
        setFieldErrors(err.errors || {});
        const topErrors = err.getAllErrors().slice(0, 2).join(', ');
        setSubmitError(`Please check the highlighted fields: ${topErrors}`);
      } else {
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
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    scrollViewRef,
    currentStep,
    setCurrentStep,
    isLoading,
    setIsLoading,
    refreshing,
    fetchError,
    program,
    selectedPartnerSchool,
    email,
    setEmail,
    phoneDigits,
    handlePhoneChange,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    noMiddleName,
    setNoMiddleName,
    lastName,
    setLastName,
    suffix,
    setSuffix,
    showSuffixModal,
    setShowSuffixModal,
    residentialAddress,
    setResidentialAddress,
    institutionName,
    setInstitutionName,
    isManualSchool,
    setIsManualSchool,
    showSchoolModal,
    setShowSchoolModal,
    schoolSearchQuery,
    setSchoolSearchQuery,
    modalFilteredPartnerSchools,
    selectedPartnerSchoolId,
    setSelectedPartnerSchoolId,
    courseProgram,
    setCourseProgram,
    isManualCourse,
    setIsManualCourse,
    showCourseModal,
    setShowCourseModal,
    courseSearchQuery,
    setCourseSearchQuery,
    modalFilteredCourses,
    handleSelectCourse,
    isCourseSuggestionSelected,
    isSeniorHighProgram,
    yearLevel,
    setYearLevel,
    availableYearLevels,
    isYearDropdownOpen,
    setIsYearDropdownOpen,
    requiredDocsList,
    files,
    docValidations,
    handlePickDocument,
    isVerifiedCitizen,
    citizenVerificationData,
    isVerificationLoading,
    isNoticeDismissed,
    setIsNoticeDismissed,
    verifiedFullName,
    isFormValid,
    isSubmitting,
    submitError,
    fieldErrors,
    clearFieldError,
    submitResult,
    showConfirmModal,
    setShowConfirmModal,
    showFullGuideModal,
    setShowFullGuideModal,
    handleTopBackPress,
    handleGoToStep,
    handleNextFromStep1,
    handleBackToStep1,
    handleNextFromStep2,
    handleBackToStep2,
    handleSubmitPress,
    handleConfirmSubmit,
    loadData,
    onRefresh,
  };
}
