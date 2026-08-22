import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenComplianceDetailsData, fetchCitizenRenewalCompliance, submitCitizenComplianceResponse } from './api/renewalApi';
import { SelectedFileState } from './RenewalApplicationScreen';
import { styles } from './styles/RenewalCompliance.styles';

export function RenewalComplianceScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [details, setDetails] = useState<CitizenComplianceDetailsData | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [clarificationText, setClarificationText] = useState<string>('');
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
      const data = await fetchCitizenRenewalCompliance();
      setDetails(data);
    } catch (err: any) {
      console.error('[RenewalComplianceScreen] fetch error:', err);
      setFetchError(err?.message || 'No active compliance action required for your scholarship renewal.');
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

  const handlePickDocument = async (docType: 'cor' | 'cog' | 'soa') => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

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
      console.error('[RenewalComplianceScreen] document picker error:', err);
      Alert.alert('Error', 'Unable to pick replacement document.');
    }
  };

  // Determine what inputs are required
  const requestedDocTypes: Record<string, boolean> = {};
  if (details) {
    for (const req of details.unresolved_compliance_requests) {
      if (req.request_type === 'Document Replacement' && req.affected_document) {
        requestedDocTypes[req.affected_document.document_type] = true;
      }
    }
    for (const d of details.documents_needing_replacement) {
      requestedDocTypes[d.document_type] = true;
    }
  }

  const isCorRequested = Boolean(requestedDocTypes['COR']);
  const isCogRequested = Boolean(requestedDocTypes['COG']);
  const isSoaRequested = Boolean(requestedDocTypes['SOA']);

  const isClarificationRequired = Boolean(
    details?.ssc_return_context ||
    details?.unresolved_compliance_requests.some((r) =>
      ['Academic Clarification', 'Information Clarification', 'Other'].includes(r.request_type)
    )
  );

  const isFormValid = Boolean(
    (!isCorRequested || files.cor) &&
    (!isCogRequested || files.cog) &&
    (!isSoaRequested || files.soa) &&
    (!isClarificationRequired || clarificationText.trim().length > 0)
  );

  const handleSubmitPress = () => {
    if (!isFormValid) {
      Alert.alert('Incomplete Response', 'Please complete all requested replacement documents and response text before submitting.');
      return;
    }
    setSubmitError(null);
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      setSubmitError(null);

      const formData = new FormData();

      if (clarificationText.trim() !== '') {
        formData.append('clarification_response', clarificationText.trim());
      }

      if (files.cor) {
        formData.append('cor', {
          uri: files.cor.uri,
          name: files.cor.name || 'cor.pdf',
          type: files.cor.mimeType || 'application/pdf',
        } as any);
      }

      if (files.cog) {
        formData.append('cog', {
          uri: files.cog.uri,
          name: files.cog.name || 'cog.pdf',
          type: files.cog.mimeType || 'application/pdf',
        } as any);
      }

      if (files.soa) {
        formData.append('soa', {
          uri: files.soa.uri,
          name: files.soa.name || 'soa.pdf',
          type: files.soa.mimeType || 'application/pdf',
        } as any);
      }

      await submitCitizenComplianceResponse(formData);
      setSubmitSuccess(true);
    } catch (err: any) {
      console.error('[RenewalComplianceScreen] submit error:', err);
      setSubmitError(err?.message || 'Failed to submit compliance response. Please try again.');
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
          Renewal Required Action
        </Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#94A3B8' }]}>
          Provide the requested compliance information or replacement documents.
        </Text>
      </View>

      {/* SKELETON / ERROR / SUCCESS / MAIN CONTENT */}
      {loading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={220} borderRadius={16} />
        </View>
      ) : fetchError ? (
        <View style={{ alignItems: 'center', padding: 24 }}>
          <IconSymbol name="exclamationmark.triangle.fill" size={40} color="#EF4444" />
          <Text style={{ fontSize: 16, fontWeight: '700', color: '#EF4444', marginTop: 12 }}>
            No Compliance Action Required
          </Text>
          <Text style={{ fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, marginBottom: 16 }}>
            {fetchError}
          </Text>
          <TouchableOpacity
            style={{ backgroundColor: '#9333EA', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10 }}
            onPress={() => router.replace('/education/renewal' as any)}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Return to Overview</Text>
          </TouchableOpacity>
        </View>
      ) : submitSuccess ? (
        /* SUCCESS SCREEN STATE */
        <View style={[styles.instructionCard, { alignItems: 'center', paddingVertical: 32 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="checkmark.circle.fill" size={56} color="#16A34A" />
          <Text style={[styles.title, { fontSize: 20, marginTop: 16, textAlign: 'center' }, isDarkMode && { color: '#F8FAFC' }]}>
            Response Submitted
          </Text>
          <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 6, paddingHorizontal: 16 }, isDarkMode && { color: '#94A3B8' }]}>
            Your renewal response has been submitted successfully.
          </Text>
          <TouchableOpacity
            style={[styles.submitBtn, { marginTop: 24, paddingHorizontal: 32 }]}
            onPress={() => router.replace('/education/renewal' as any)}
          >
            <Text style={styles.submitBtnText}>Return to Renewal Overview</Text>
          </TouchableOpacity>
        </View>
      ) : details ? (
        <>
          {/* CURRENT RENEWAL STATUS CARD */}
          <View style={[styles.statusCard, isDarkMode && { backgroundColor: '#1E1B4B', borderColor: '#3730A3' }]}>
            <View style={styles.statusHeader}>
              <IconSymbol name="exclamationmark.circle.fill" size={24} color={details.renewal_status === 'Returned' ? '#DC2626' : '#D97706'} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statusTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Status: {details.renewal_status}
                </Text>
                <Text style={[styles.statusCode, isDarkMode && { color: '#C084FC' }]}>
                  Renewal Code: {details.renewal_code}
                </Text>
              </View>
            </View>
          </View>

          {/* SUBMIT ERROR BANNER */}
          {submitError && (
            <View style={{ backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#DC2626" />
              <Text style={{ flex: 1, fontSize: 13, color: '#991B1B', lineHeight: 18 }}>
                {submitError}
              </Text>
            </View>
          )}

          {/* WHAT NEEDS YOUR ATTENTION SECTION */}
          <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
            What Needs Your Attention
          </Text>

          {/* UNRESOLVED COMPLIANCE REQUESTS */}
          {details.unresolved_compliance_requests.map((req) => (
            <View key={req.renewal_compliance_id} style={[styles.instructionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.reqTypeBadge}>
                <Text style={styles.reqTypeText}>{req.request_type}</Text>
              </View>
              <Text style={[styles.instructionText, isDarkMode && { color: '#F8FAFC' }]}>
                {req.instructions}
              </Text>
            </View>
          ))}

          {/* SSC RETURN CONTEXT */}
          {details.ssc_return_context && (
            <View style={[styles.instructionCard, { borderColor: '#FCA5A5', backgroundColor: '#FEF2F2' }, isDarkMode && { backgroundColor: '#451A1A', borderColor: '#991B1B' }]}>
              <View style={[styles.reqTypeBadge, { backgroundColor: '#FEE2E2' }]}>
                <Text style={[styles.reqTypeText, { color: '#DC2626' }]}>Committee Return Instructions</Text>
              </View>
              {details.ssc_return_context.return_reason ? (
                <Text style={{ fontSize: 13, fontWeight: '700', color: '#991B1B', marginBottom: 4 }}>
                  Reason: {details.ssc_return_context.return_reason}
                </Text>
              ) : null}
              <Text style={[styles.instructionText, { color: '#7F1D1D' }, isDarkMode && { color: '#FCA5A5' }]}>
                {details.ssc_return_context.return_instructions || 'Please review your renewal documents and provide updated clarification.'}
              </Text>
            </View>
          )}

          {/* REPLACEMENT DOCUMENTS SECTION */}
          {(isCorRequested || isCogRequested || isSoaRequested) && (
            <>
              <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Requested Document Replacements
              </Text>

              {/* COR REPLACEMENT CARD */}
              {isCorRequested && (
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docBadge}>
                      <Text style={styles.docBadgeText}>COR</Text>
                    </View>
                    <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Certificate of Registration (Replacement Required)
                    </Text>
                  </View>

                  <View style={[styles.currentFileBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                    <Text style={styles.currentFileLabel}>Status: Needs Replacement</Text>
                  </View>

                  <View style={[
                    styles.fileStatusBox,
                    files.cor ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.cor && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.cor && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.cor ? files.cor.name : 'Choose replacement COR file'}
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
                        {files.cor ? 'Replace' : 'Choose File'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* COG REPLACEMENT CARD */}
              {isCogRequested && (
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docBadge}>
                      <Text style={styles.docBadgeText}>COG</Text>
                    </View>
                    <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Certificate of Grades (Replacement Required)
                    </Text>
                  </View>

                  <View style={[styles.currentFileBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                    <Text style={styles.currentFileLabel}>Status: Needs Replacement</Text>
                  </View>

                  <View style={[
                    styles.fileStatusBox,
                    files.cog ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.cog && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.cog && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.cog ? files.cog.name : 'Choose replacement COG file'}
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
                        {files.cog ? 'Replace' : 'Choose File'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* SOA REPLACEMENT CARD */}
              {isSoaRequested && (
                <View style={[styles.docCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.docHeader}>
                    <View style={styles.docBadge}>
                      <Text style={styles.docBadgeText}>SOA</Text>
                    </View>
                    <Text style={[styles.docTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      Statement of Account (Replacement Required)
                    </Text>
                  </View>

                  <View style={[styles.currentFileBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                    <Text style={styles.currentFileLabel}>Status: Needs Replacement</Text>
                  </View>

                  <View style={[
                    styles.fileStatusBox,
                    files.soa ? styles.fileStatusSelected : styles.fileStatusUnselected,
                    isDarkMode && !files.soa && { backgroundColor: '#0F172A', borderColor: '#334155' },
                    isDarkMode && files.soa && { backgroundColor: '#064E3B', borderColor: '#059669' },
                  ]}>
                    <View style={styles.fileInfo}>
                      <Text style={[styles.fileName, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={1}>
                        {files.soa ? files.soa.name : 'Choose replacement SOA file'}
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
                        {files.soa ? 'Replace' : 'Choose File'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </>
          )}

          {/* CLARIFICATION TEXT INPUT SECTION */}
          {isClarificationRequired && (
            <View style={[styles.textAreaCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
                Your Response / Clarification
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                ]}
                placeholder="Enter details or clarification for the renewal review team..."
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                multiline
                numberOfLines={4}
                maxLength={2000}
                value={clarificationText}
                onChangeText={setClarificationText}
              />
            </View>
          )}

          {/* SUBMISSION SUMMARY CARD */}
          <View style={[styles.reviewCard, isDarkMode && { backgroundColor: '#1E1B4B', borderColor: '#3730A3' }]}>
            <Text style={[styles.reviewTitle, isDarkMode && { color: '#C084FC' }]}>
              Submission Summary
            </Text>

            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, isDarkMode && { color: '#E0E7FF' }]}>Replacement Documents</Text>
              <Text style={[styles.reviewStatusText, { color: isFormValid ? '#16A34A' : '#DC2626' }]}>
                {isCorRequested || isCogRequested || isSoaRequested
                  ? `${[files.cor ? 'COR' : null, files.cog ? 'COG' : null, files.soa ? 'SOA' : null].filter(Boolean).join(', ') || 'None selected'}`
                  : 'Not Required'}
              </Text>
            </View>

            <View style={styles.reviewRow}>
              <Text style={[styles.reviewLabel, isDarkMode && { color: '#E0E7FF' }]}>Clarification Text</Text>
              <Text style={[styles.reviewStatusText, { color: !isClarificationRequired || clarificationText.trim() ? '#16A34A' : '#DC2626' }]}>
                {isClarificationRequired
                  ? clarificationText.trim()
                    ? 'Provided'
                    : 'Required'
                  : 'Not Required'}
              </Text>
            </View>
          </View>

          {/* SUBMIT RESPONSE BUTTON */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!isFormValid || submitting) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmitPress}
            disabled={!isFormValid || submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <>
                <ActivityIndicator color="#FFFFFF" size="small" />
                <Text style={styles.submitBtnText}>Submitting Response...</Text>
              </>
            ) : (
              <Text style={styles.submitBtnText}>Submit Response</Text>
            )}
          </TouchableOpacity>
        </>
      ) : null}

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
              Submit Response?
            </Text>
            <Text style={[styles.modalMessage, isDarkMode && { color: '#CBD5E1' }]}>
              Your response will be sent for renewal review.
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
                  Submit Response
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
