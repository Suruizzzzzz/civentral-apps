import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { getScholarshipProgramDetails, ScholarshipProgram, ScholarshipRequiredDocument, submitNewScholarshipApplication, SubmitApplicationResult } from './api/ScholarshipProgramApi';
import { styles } from './styles/NewApplicantApplication.styles';

const videoDeclarationGuideImg = require('@/assets/images/video-inter.png');

interface SelectedFileState {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
  asset?: DocumentPicker.DocumentPickerAsset;
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
  const [courseProgram, setCourseProgram] = useState('');
  const [yearLevel, setYearLevel] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');

  // Dynamic file upload state mapped by document key
  const [files, setFiles] = useState<Record<string, SelectedFileState>>({});

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
      const data = await getScholarshipProgramDetails(programId);
      if (!data) {
        setFetchError('Scholarship program not found.');
      } else {
        setProgram(data);
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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handlePickDocument = async (doc: ScholarshipRequiredDocument) => {
    const code = (doc.document_code || '').toUpperCase();
    const name = (doc.document_name || '').toUpperCase();
    const isVideo = code.includes('VIDEO') || name.includes('VIDEO');

    const allowedTypes = isVideo
      ? ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/*']
      : ['application/pdf', 'image/jpeg', 'image/png'];

    const maxLimitMb = isVideo ? 20 : 10;
    const maxSizeBytes = maxLimitMb * 1024 * 1024;

    const docKey = doc.program_document_id
      ? `doc_${doc.program_document_id}`
      : `doc_${doc.document_requirement_id}`;

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
    // Default standard document list if none configured specifically for program
    return [
      {
        document_requirement_id: 1,
        document_code: 'ACADEMIC_RECORD',
        document_name: 'Academic Record / Transcript',
        description: 'Official Grades, Form 137, Form 138, or Transcript of Records.',
        requirement_level: 'Required',
        instructions: 'Upload your latest official academic record.',
      },
      {
        document_requirement_id: 2,
        document_code: 'ENROLLMENT_PROOF',
        document_name: 'Proof of Enrollment / Acceptance',
        description: 'Certificate of Registration, Enrollment Assessment, or Admission Letter.',
        requirement_level: 'Required',
        instructions: 'Upload proof of current enrollment or admission.',
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

  const isFormValid = institutionName.trim().length > 0 && missingDocs.length === 0;

  const handleSubmitPress = () => {
    if (institutionName.trim().length === 0) {
      Alert.alert('Missing Field', 'Please enter your current School or Institution Name.');
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
      if (courseProgram.trim()) formData.append('course_program', courseProgram.trim());
      if (yearLevel.trim()) formData.append('year_level', yearLevel.trim());
      if (residentialAddress.trim()) formData.append('residential_address', residentialAddress.trim());

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
            onPress={() => router.replace('/education' as any)}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>Return to Education Portal</Text>
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
              1. Academic & School Information
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                School / Institution Name *
              </Text>
              <TextInput
                style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={institutionName}
                onChangeText={setInstitutionName}
                placeholder="e.g. Caloocan City National High School"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Course / Program / Track
              </Text>
              <TextInput
                style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={courseProgram}
                onChangeText={setCourseProgram}
                placeholder="e.g. STEM / BS Information Technology"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Grade / Year Level
              </Text>
              <TextInput
                style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={yearLevel}
                onChangeText={setYearLevel}
                placeholder="e.g. Grade 11 / 1st Year"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Residential Address
              </Text>
              <TextInput
                style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
                value={residentialAddress}
                onChangeText={setResidentialAddress}
                placeholder="e.g. Barangay 12, Caloocan City"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              />
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

                  {doc.instructions || doc.description ? (
                    <Text style={[styles.docInstructions, isDarkMode && { color: '#94A3B8' }]}>
                      {doc.instructions || doc.description}
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
              Are you sure you want to submit your application for "{program?.program_name}"? Please verify that all uploaded documents are accurate and complete.
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
