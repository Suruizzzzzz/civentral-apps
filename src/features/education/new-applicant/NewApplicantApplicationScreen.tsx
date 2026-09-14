import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';
import { ProfileService } from '@/src/services/profile-service';
import {
  DocumentValidationResult,
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
import { COMMON_COURSE_SUGGESTIONS, CourseSuggestion } from './constants/courseSuggestions';
import { getAvailableYearLevels } from './constants/yearLevelOptions';
import { styles } from './styles/NewApplicantApplication.styles';

const videoDeclarationGuideImg = require('@/assets/images/video-inter.png');

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

  const [program, setProgram] = useState<ScholarshipProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Form input fields
  const [institutionName, setInstitutionName] = useState('');
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchoolLookupItem[]>([]);
  const [selectedPartnerSchoolId, setSelectedPartnerSchoolId] = useState<number | null>(null);
  const [isSchoolDropdownOpen, setIsSchoolDropdownOpen] = useState(false);
  const [courseProgram, setCourseProgram] = useState('');
  const [isCourseDropdownOpen, setIsCourseDropdownOpen] = useState(false);
  const [isCourseSuggestionSelected, setIsCourseSuggestionSelected] = useState(false);
  const [yearLevel, setYearLevel] = useState('');
  const [isYearDropdownOpen, setIsYearDropdownOpen] = useState(false);
  const [residentialAddress, setResidentialAddress] = useState('');

  // Dynamic file upload state mapped by document key
  const [files, setFiles] = useState<Record<string, SelectedFileState>>({});
  const [docValidations, setDocValidations] = useState<Record<string, DocumentValidationState>>({});

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFullGuideModal, setShowFullGuideModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<SubmitApplicationResult | null>(null);

  const loadData = useCallback(async () => {
    if (!programId) {
      setFetchError('No scholarship program selected.');
      setIsLoading(false);
      return;
    }

    try {
      setFetchError(null);
      const [data, schools] = await Promise.all([
        getScholarshipProgramDetails(programId),
        getPartnerSchoolsLookup(programId),
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
      }
    } catch (err: any) {
      console.error('[NewApplicantApplicationScreen] fetch error:', err);
      setFetchError('Unable to load scholarship details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [programId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

        if (!isMounted) return;

        // Pre-fill only if residentialAddress is still empty (never overwrite manual input)
        setResidentialAddress((prev) => {
          if (prev && prev.trim().length > 0) {
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
  }, []);

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

    const maxLimitMb = isVideo ? 20 : 10;
    const maxSizeBytes = maxLimitMb * 1024 * 1024;

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

        // 10MB/20MB file size limit validation
        if (asset.size && asset.size > maxSizeBytes) {
          Alert.alert('File Too Large', `The selected ${doc.document_name} file exceeds the maximum limit of ${maxLimitMb}MB.`);
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

  const filteredPartnerSchools =
    institutionName.trim().length >= 2
      ? partnerSchools.filter(
          (s) =>
            s.institution_name.toLowerCase().includes(institutionName.toLowerCase()) ||
            s.institution_code.toLowerCase().includes(institutionName.toLowerCase())
        )
      : [];

  const handleSchoolChangeText = (text: string) => {
    setInstitutionName(text);
    if (selectedPartnerSchoolId !== null) {
      setSelectedPartnerSchoolId(null);
    }
    setIsSchoolDropdownOpen(text.trim().length >= 2);
    setIsYearDropdownOpen(false);
  };

  const handleSelectPartnerSchool = (school: PartnerSchoolLookupItem) => {
    setInstitutionName(school.institution_name);
    setSelectedPartnerSchoolId(school.institution_id);
    setIsSchoolDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  const selectedPartnerSchool = useMemo(() => {
    if (selectedPartnerSchoolId === null) return null;
    return partnerSchools.find((s) => s.institution_id === selectedPartnerSchoolId) || null;
  }, [selectedPartnerSchoolId, partnerSchools]);

  const filteredCourseSuggestions = useMemo(() => {
    const query = courseProgram.trim().toLowerCase();
    if (query.length < 2) return [];

    const queryWords = query.split(/\s+/).filter((w) => w.length > 0);

    const matches = COMMON_COURSE_SUGGESTIONS.filter((course) => {
      const nameLower = course.name.toLowerCase();
      const codeLower = course.code ? course.code.toLowerCase() : '';

      // Direct code match or substring match in abbreviation
      if (codeLower && (codeLower === query || codeLower.includes(query))) {
        return true;
      }

      // Substring match in full name
      if (nameLower.includes(query)) {
        return true;
      }

      // Multi-word search (e.g. "Bachelor of Information" matches "Bachelor of Science in Information Technology")
      if (queryWords.length > 1) {
        const allWordsMatch = queryWords.every(
          (word) => nameLower.includes(word) || codeLower.includes(word)
        );
        if (allWordsMatch) return true;
      }

      return false;
    });

    // Sort matches so exact code or name prefix comes first
    matches.sort((a, b) => {
      const aCode = (a.code || '').toLowerCase();
      const bCode = (b.code || '').toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();

      if (aCode === query && bCode !== query) return -1;
      if (bCode === query && aCode !== query) return 1;
      if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
      if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
      return 0;
    });

    return matches.slice(0, 8);
  }, [courseProgram]);

  const availableYearLevels = useMemo(() => getAvailableYearLevels(program), [program]);

  const handleCourseChangeText = (text: string) => {
    setCourseProgram(text);
    if (isCourseSuggestionSelected) {
      setIsCourseSuggestionSelected(false);
    }
    setIsCourseDropdownOpen(text.trim().length >= 2);
    setIsYearDropdownOpen(false);
  };

  const handleSelectCourse = (course: CourseSuggestion) => {
    const selectedText = course.code ? `${course.name} (${course.code})` : course.name;
    setCourseProgram(selectedText);
    setIsCourseSuggestionSelected(true);
    setIsCourseDropdownOpen(false);
    setIsYearDropdownOpen(false);
  };

  const isFormValid =
    institutionName.trim().length > 0 &&
    yearLevel.trim().length > 0 &&
    residentialAddress.trim().length > 0 &&
    missingDocs.length === 0;

  const handleSubmitPress = () => {
    if (institutionName.trim().length === 0) {
      Alert.alert('Missing Field', 'Please enter your current School or Institution Name.');
      return;
    }

    if (yearLevel.trim().length === 0) {
      Alert.alert('Missing Field', 'Please select or enter your current Grade or Year Level.');
      return;
    }

    if (residentialAddress.trim().length === 0) {
      Alert.alert('Missing Field', 'Please enter your current Residential Address.');
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
      }
      if (courseProgram.trim()) formData.append('course_program', courseProgram.trim());
      if (yearLevel.trim()) formData.append('year_level', yearLevel.trim());
      formData.append('residential_address', residentialAddress.trim());

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

          let expoFile: any;
          if (fileState.uri) {
            expoFile = new ExpoFile(fileState.uri);
          } else if (fileState.asset?.uri) {
            expoFile = new ExpoFile(fileState.asset.uri);
          }

          formData.append(key, expoFile as any);
          console.log(`[Submit] 5. appended ${key} successfully using Expo File`);
        } else {
          console.log(`[Submit] 5. NO FILE selected for key ${key} (${doc.document_name})`);
        }
      });

      console.log('[Submit] 6. before API call submitNewScholarshipApplication');
      const startTime = Date.now();
      const result = await submitNewScholarshipApplication(formData);
      const duration = Date.now() - startTime;
      console.log(`[Submit] 7. after API call resolved in ${duration}ms`, result);

      setSubmitResult(result);
      console.log('[Submit] 8. setSubmitResult executed');
    } catch (err: any) {
      console.error('[Submit] CATCH entered with error:', err);
      setSubmitError(err?.message || 'Failed to submit scholarship application.');
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
                {new Date(submitResult.submitted_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, { width: '100%' }]}
            onPress={() => router.replace('/education/new-applicant/my-application' as any)}
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
      contentContainerStyle={styles.container}
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
            size={18}
            color={isDarkMode ? '#38BDF8' : '#0284C7'}
          />
        </View>
        <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
          Back to Details
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
          {/* HEADER CARD */}
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

          {/* SUBMIT ERROR BANNER */}
          {submitError ? (
            <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 14, marginBottom: 14 }]}>
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                {submitError}
              </Text>
            </View>
          ) : null}

          {/* 1. ACADEMIC INFORMATION */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Academic & School Information
            </Text>
            <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              Provide your current school, academic program, and year level.
            </Text>

            {/* SCHOOL / INSTITUTION */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                School / Institution *
              </Text>
              <TextInput
                style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={institutionName}
                onChangeText={handleSchoolChangeText}
                onFocus={() => {
                  if (institutionName.trim().length >= 2 && selectedPartnerSchoolId === null) {
                    setIsSchoolDropdownOpen(true);
                  }
                }}
                placeholder="Search your school..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                editable={!isSubmitting}
              />

              {selectedPartnerSchool ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                  <IconSymbol name="checkmark.circle.fill" size={13} color="#16A34A" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                    {selectedPartnerSchool.institution_code} · Registered Partner School
                  </Text>
                </View>
              ) : institutionName.trim().length >= 3 && filteredPartnerSchools.length === 0 && selectedPartnerSchoolId === null ? (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  School not listed? You can continue with your school name.
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  Type to search registered partner schools or enter your school name.
                </Text>
              )}

              {isSchoolDropdownOpen && filteredPartnerSchools.length > 0 && selectedPartnerSchoolId === null ? (
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
                      Registered Partner Schools
                    </Text>
                  </View>

                  {filteredPartnerSchools.slice(0, 5).map((school, idx) => (
                    <TouchableOpacity
                      key={school.institution_id}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomWidth: idx < Math.min(filteredPartnerSchools.length, 5) - 1 ? 1 : 0,
                        borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      }}
                      onPress={() => handleSelectPartnerSchool(school)}
                      activeOpacity={0.7}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: '600',
                            color: isDarkMode ? '#F8FAFC' : '#1E293B',
                            flex: 1,
                            paddingRight: 8,
                          }}
                          numberOfLines={2}
                        >
                          {school.institution_name}
                        </Text>
                        <Text style={{ fontSize: 11, fontWeight: '700', color: '#0284C7', marginLeft: 8 }}>
                          {school.institution_code}
                        </Text>
                      </View>
                      <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                        Registered Partner School
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
            </View>

            {/* COURSE / PROGRAM */}
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Course / Program *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                ]}
                value={courseProgram}
                onChangeText={handleCourseChangeText}
                onFocus={() => {
                  if (courseProgram.trim().length >= 2 && !isCourseSuggestionSelected) {
                    setIsCourseDropdownOpen(true);
                  }
                }}
                placeholder="Search course or program..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                editable={!isSubmitting}
              />

              {isCourseSuggestionSelected ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                  <IconSymbol name="checkmark.circle.fill" size={13} color="#16A34A" />
                  <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                    Suggested course selected
                  </Text>
                </View>
              ) : courseProgram.trim().length >= 2 && filteredCourseSuggestions.length === 0 && !isCourseSuggestionSelected ? (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  {"Can't find your course? You can enter it manually."}
                </Text>
              ) : (
                <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                  Type to search common courses, or enter your course manually.
                </Text>
              )}

              {isCourseDropdownOpen && filteredCourseSuggestions.length > 0 && !isCourseSuggestionSelected ? (
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
                      Course Suggestions
                    </Text>
                  </View>

                  {filteredCourseSuggestions.slice(0, 6).map((item, idx) => (
                    <TouchableOpacity
                      key={`${item.name}_${item.code || idx}`}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderBottomWidth: idx < Math.min(filteredCourseSuggestions.length, 6) - 1 ? 1 : 0,
                        borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      }}
                      onPress={() => handleSelectCourse(item)}
                      activeOpacity={0.7}
                    >
                      {item.code ? (
                        <Text
                          style={{
                            fontSize: 11,
                            fontWeight: '700',
                            color: '#0284C7',
                            marginBottom: 2,
                          }}
                        >
                          {item.code}
                        </Text>
                      ) : null}
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: '600',
                          color: isDarkMode ? '#F8FAFC' : '#1E293B',
                          lineHeight: 18,
                        }}
                        numberOfLines={2}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ) : null}
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
                      setIsSchoolDropdownOpen(false);
                      setIsCourseDropdownOpen(false);
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
                    <IconSymbol
                      name={isYearDropdownOpen ? 'chevron.up' : 'chevron.down'}
                      size={15}
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

            {/* RESIDENTIAL ADDRESS */}
            <View style={[styles.inputGroup, { marginBottom: 6 }]}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Residential Address *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  { minHeight: 52, textAlignVertical: 'top', paddingTop: 10 },
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                ]}
                value={residentialAddress}
                onChangeText={setResidentialAddress}
                placeholder="Enter your residential address..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                multiline={true}
                editable={!isSubmitting}
              />
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                Enter complete residential address (e.g. Street, Barangay, City).
              </Text>
            </View>
          </View>

          {/* 2. REQUIRED DOCUMENTS (BACKEND DRIVEN) */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              2. Required Documents Upload
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
                    <Badge variant={selectedFile ? 'success' : 'warning'} label={selectedFile ? 'Attached' : 'Required'} />
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
                    style={[styles.uploadBox, selectedFile && styles.uploadBoxSuccess, isDarkMode && !selectedFile && { backgroundColor: '#1E293B', borderColor: '#0284C7' }]}
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
                          ? `Select ${doc.document_name} (MP4, MOV, WEBM)`
                          : `Select ${doc.document_name} (PDF, PNG, JPG)`}
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

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitButton, (!isFormValid || isSubmitting) && styles.submitButtonDisabled]}
            onPress={handleSubmitPress}
            disabled={!isFormValid || isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.submitButtonText}>Submit Application</Text>
            )}
          </TouchableOpacity>
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
    </ScrollView>
  );
}
