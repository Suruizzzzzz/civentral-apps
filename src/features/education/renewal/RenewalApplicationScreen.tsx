import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenRenewalOverview, fetchCitizenRenewalOverview, submitCitizenRenewal } from './api/renewalApi';
import { styles } from './styles/RenewalApplication.styles';

export interface SelectedFileState {
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
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

  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    try {
      setFetchError(null);
      const data = await fetchCitizenRenewalOverview();
      setOverview(data);

      if (data.state === 'RENEWAL_EXISTS') {
        Alert.alert(
          'Renewal Already Submitted',
          'You have already submitted a renewal application for this period.',
          [{ text: 'OK', onPress: () => router.replace('/education/renewal' as any) }]
        );
      } else if (data.state !== 'RENEWAL_AVAILABLE') {
        Alert.alert(
          'Renewal Unavailable',
          'The scholarship renewal application is not currently open for your account.',
          [{ text: 'OK', onPress: () => router.replace('/education/renewal' as any) }]
        );
      }
    } catch (err: any) {
      console.error('[RenewalApplicationScreen] fetch error:', err);
      setFetchError(err?.message || 'Unable to load renewal details.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handlePickDocument = async (docType: 'cor' | 'cog' | 'soa') => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        // 10MB file size limit validation (UX level)
        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', `The selected ${docType.toUpperCase()} file exceeds the maximum limit of 10MB.`);
          return;
        }

        setFiles((prev) => ({
          ...prev,
          [docType]: {
            name: asset.name,
            size: asset.size,
            uri: asset.uri,
            mimeType: asset.mimeType,
          },
        }));
      }
    } catch (err) {
      console.error('[RenewalApplicationScreen] document picker error:', err);
      Alert.alert('Error', 'Unable to pick document. Please try again.');
    }
  };

  const isFormComplete = Boolean(files.cor && files.cog && files.soa);

  const handleSubmitPress = () => {
    if (!isFormComplete) {
      Alert.alert('Incomplete Documents', 'Please select all three required documents (COR, COG, and SOA) before submitting.');
      return;
    }
    setSubmitError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    if (!files.cor || !files.cog || !files.soa) return;

    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      setSubmitError(null);

      const formData = new FormData();
      formData.append('cor', {
        uri: files.cor.uri,
        name: files.cor.name || 'cor.pdf',
        type: files.cor.mimeType || 'application/pdf',
      } as any);

      formData.append('cog', {
        uri: files.cog.uri,
        name: files.cog.name || 'cog.pdf',
        type: files.cog.mimeType || 'application/pdf',
      } as any);

      formData.append('soa', {
        uri: files.soa.uri,
        name: files.soa.name || 'soa.pdf',
        type: files.soa.mimeType || 'application/pdf',
      } as any);

      await submitCitizenRenewal(formData);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('[RenewalApplicationScreen] submit error:', err);
      setSubmitError(err?.message || 'Failed to submit scholarship renewal. Please check your network and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    const kb = bytes / 1024;
    return `${kb.toFixed(0)} KB`;
  };

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
          tintColor={isDarkMode ? '#C084FC' : '#9333EA'}
          colors={['#9333EA']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? '#C084FC' : '#9333EA'}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#C084FC' }]}>
          Back to Overview
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
          Scholarship Renewal
        </Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
          Submit your renewal requirements for the next academic period.
        </Text>
      </View>

      {/* SKELETON OR CONTENT */}
      {loading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={260} borderRadius={16} />
        </View>
      ) : fetchError ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <IconSymbol name="exclamationmark.triangle.fill" size={36} color="#EF4444" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444', marginTop: 8 }}>
            Unable to Load Form
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
            {fetchError}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#9333EA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 }}
            onPress={loadData}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : submitSuccess ? (
        /* SUCCESS SCREEN STATE */
        <View style={[styles.contextCard, { alignItems: 'center', paddingVertical: 32 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="checkmark.circle.fill" size={56} color="#16A34A" />
          <Text style={[styles.title, { fontSize: 20, marginTop: 16, textAlign: 'center' }, isDarkMode && { color: '#F8FAFC' }]}>
            Renewal Submitted
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }, isDarkMode && { color: '#94A3B8' }]}>
            Your scholarship renewal has been submitted for review.
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { marginTop: 24, paddingHorizontal: 32 }]}
            onPress={() => router.replace('/education/renewal' as any)}
          >
            <Text style={styles.submitBtnText}>Return to Renewal Overview</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* CONTEXT CARD: SCHOLAR & PERIOD DETAILS */}
          {overview?.scholar && overview?.program && (
            <View style={[styles.contextCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.badgeRow}>
                <Badge variant="info" label={overview.program.category_name || 'Scholarship'} />
                <Badge variant="success" label={overview.scholar.scholar_status} />
              </View>

              <Text style={[styles.programName, isDarkMode && { color: '#F8FAFC' }]}>
                {overview.program.program_name}
              </Text>
              <Text style={[styles.scholarCode, isDarkMode && { color: '#94A3B8' }]}>
                Scholar Code: {overview.scholar.scholar_code}
              </Text>

              <View style={[styles.divider, isDarkMode && { backgroundColor: '#334155' }]} />

              <View style={styles.metaGrid}>
                {overview.current_academic_period && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Current Academic Period:</Text>
                    <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>
                      {overview.current_academic_period.academic_year} — {overview.current_academic_period.term}
                    </Text>
                  </View>
                )}

                {overview.renewal_period && (
                  <View style={styles.metaRow}>
                    <Text style={[styles.metaLabel, isDarkMode && { color: '#94A3B8' }]}>Renewal Window:</Text>
                    <Text style={[styles.metaValue, isDarkMode && { color: '#F8FAFC' }]}>
                      {new Date(overview.renewal_period.opening_date).toLocaleDateString()} – {new Date(overview.renewal_period.closing_date).toLocaleDateString()}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* SUBMIT ERROR BANNER */}
          {submitError && (
            <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#DC2626" />
              <Text style={{ flex: 1, fontSize: 13, color: '#991B1B', lineHeight: 18 }}>
                {submitError}
              </Text>
            </View>
          )}

          {/* DOCUMENT UPLOAD CARDS SECTION */}
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Upload Required Documents
          </Text>

          {/* 1. COR CARD */}
          <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.docHeader}>
              <View style={styles.docCodeBadge}>
                <Text style={styles.docCodeText}>COR</Text>
              </View>
              <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Certificate of Registration
              </Text>
            </View>
            <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
              Official proof of enrollment for the upcoming academic period (PDF, JPG, PNG up to 10MB).
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
                style={styles.pickBtn}
                onPress={() => handlePickDocument('cor')}
                activeOpacity={0.8}
              >
                <IconSymbol name={files.cor ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'} size={14} color="#FFFFFF" />
                <Text style={styles.pickBtnText}>
                  {files.cor ? 'Replace' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. COG CARD */}
          <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.docHeader}>
              <View style={styles.docCodeBadge}>
                <Text style={styles.docCodeText}>COG</Text>
              </View>
              <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Certificate of Grades
              </Text>
            </View>
            <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
              Official copy of grades or transcript from the preceding term (PDF, JPG, PNG up to 10MB).
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
                style={styles.pickBtn}
                onPress={() => handlePickDocument('cog')}
                activeOpacity={0.8}
              >
                <IconSymbol name={files.cog ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'} size={14} color="#FFFFFF" />
                <Text style={styles.pickBtnText}>
                  {files.cog ? 'Replace' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 3. SOA CARD */}
          <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.docHeader}>
              <View style={styles.docCodeBadge}>
                <Text style={styles.docCodeText}>SOA</Text>
              </View>
              <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Statement of Account
              </Text>
            </View>
            <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>
              Official statement of tuition fees or assessment slip (PDF, JPG, PNG up to 10MB).
            </Text>

            <View style={[
              styles.fileStatusBox,
              files.soa ? styles.fileStatusSelected : styles.fileStatusUnselected,
              isDarkMode && !files.soa && { backgroundColor: '#0F172A', borderColor: '#334155' },
              isDarkMode && files.soa && { backgroundColor: '#064E3B', borderColor: '#059669' },
            ]}>
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                  {files.soa ? files.soa.name : 'Not selected'}
                </Text>
                {files.soa?.size ? (
                  <Text style={[styles.fileSize, isDarkMode && { color: '#A7F3D0' }]}>
                    {formatFileSize(files.soa.size)}
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                style={styles.pickBtn}
                onPress={() => handlePickDocument('soa')}
                activeOpacity={0.8}
              >
                <IconSymbol name={files.soa ? 'arrow.triangle.2.circlepath' : 'doc.badge.plus'} size={14} color="#FFFFFF" />
                <Text style={styles.pickBtnText}>
                  {files.soa ? 'Replace' : 'Select'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* REVIEW SUMMARY SECTION */}
          <View style={[styles.reviewCard, isDarkMode && { backgroundColor: '#1E1B4B', borderColor: '#3730A3' }]}>
            <Text style={[styles.reviewTitle, isDarkMode && { color: '#C084FC' }]}>
              Submission Summary
            </Text>

            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, isDarkMode && { color: '#E0E7FF' }]}>Certificate of Registration (COR)</Text>
              <View style={styles.reviewBadge}>
                <IconSymbol name={files.cor ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={14} color={files.cor ? '#16A34A' : '#DC2626'} />
                <Text style={[styles.reviewStatusText, { color: files.cor ? '#16A34A' : '#DC2626' }]}>
                  {files.cor ? 'Selected' : 'Missing'}
                </Text>
              </View>
            </View>

            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, isDarkMode && { color: '#E0E7FF' }]}>Certificate of Grades (COG)</Text>
              <View style={styles.reviewBadge}>
                <IconSymbol name={files.cog ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={14} color={files.cog ? '#16A34A' : '#DC2626'} />
                <Text style={[styles.reviewStatusText, { color: files.cog ? '#16A34A' : '#DC2626' }]}>
                  {files.cog ? 'Selected' : 'Missing'}
                </Text>
              </View>
            </View>

            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, isDarkMode && { color: '#E0E7FF' }]}>Statement of Account (SOA)</Text>
              <View style={styles.reviewBadge}>
                <IconSymbol name={files.soa ? 'checkmark.circle.fill' : 'xmark.circle.fill'} size={14} color={files.soa ? '#16A34A' : '#DC2626'} />
                <Text style={[styles.reviewStatusText, { color: files.soa ? '#16A34A' : '#DC2626' }]}>
                  {files.soa ? 'Selected' : 'Missing'}
                </Text>
              </View>
            </View>
          </View>

          {/* SUBMIT BUTTON */}
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
                <Text style={styles.submitBtnText}>Submitting Renewal...</Text>
              </>
            ) : (
              <Text style={styles.submitBtnText}>Submit Renewal</Text>
            )}
          </TouchableOpacity>
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
              Submit Renewal?
            </Text>
            <Text style={[styles.modalMessage, isDarkMode && { color: '#CBD5E1' }]}>
              Please confirm that the selected documents are correct. You may be asked to replace documents later if they cannot be validated.
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
                  Submit Renewal
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
