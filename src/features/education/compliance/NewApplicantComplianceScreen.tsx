import { formatDate } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { InAppDocumentViewerModal } from '@/src/components/document-viewer/InAppDocumentViewerModal';
import { useTheme } from '@/src/context/ThemeContext';
import { useComplianceForm } from './hooks/useComplianceForm';

export function NewApplicantComplianceScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const {
    isLoading,
    setIsLoading,
    refreshing,
    error,
    complianceData,
    selectedFiles,
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
  } = useComplianceForm();

  const requests = complianceData?.compliance_requests || [];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { paddingBottom: 120 }]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? '#C084FC' : '#7E22CE'}
          colors={['#7E22CE']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace('/education/new-applicant' as any);
          }
        }}
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
        <Text
          style={[
            styles.backText,
            isDarkMode && { color: '#38BDF8' },
          ]}
        >
          Back to New Applicant
        </Text>
      </TouchableOpacity>

      <Text style={[styles.screenTitle, isDarkMode && { color: '#F8FAFC' }]}>
        Application Compliance
      </Text>
      <Text style={[styles.screenSub, isDarkMode && { color: '#CBD5E1' }]}>
        Submit document corrections requested by the Scholarship Secretariat.
      </Text>

      {/* ERROR STATE */}
      {error ? (
        <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1, padding: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Unable to load compliance requests.
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginBottom: 12 }}>
            {error}
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
              loadComplianceData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      ) : requests.length === 0 ? (
        <View
          style={[
            styles.card,
            isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
          ]}
        >
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <IconSymbol
              name="checkmark.circle.fill"
              size={32}
              color={isDarkMode ? '#34D399' : '#16A34A'}
            />
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Compliance Required
          </Text>
          <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
            Your scholarship application has no outstanding document correction requests.
          </Text>
        </View>
      ) : (
        requests.map((item) => {
          const isSubmitted = item.status === 'Submitted';
          const isPending = item.status === 'Pending' || item.status === 'Overdue';
          const pickedFile = selectedFiles[item.compliance_id];
          const isSubmitting = isSubmittingCompId === item.compliance_id;
          const targetDoc = item.target_document;
          const replDoc = item.replacement_document;

          return (
            <View
              key={item.compliance_id}
              style={[styles.card, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            >
              {/* STATUS BADGE */}
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.reqTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    {(item.target_document && item.target_document.document_name) ? item.target_document.document_name : (item.requirement_title && !item.requirement_title.startsWith('Replacement:') && !item.requirement_title.match(/\.(png|jpg|jpeg|pdf|mp4|mov|webm|avi)$/i)) ? item.requirement_title : (isVideoRequirement(item) ? 'Video Replacement Request' : 'Document Replacement Request')}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                    Type: {item.compliance_type === 'Document Replacement' ? 'Replacement Required' : item.compliance_type}
                  </Text>
                  <Text style={[styles.codeText, isDarkMode && { color: '#94A3B8' }]}>
                    Ref Code: {item.compliance_code}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: isSubmitted
                        ? '#DCFCE7'
                        : item.status === 'Overdue'
                        ? '#FEE2E2'
                        : '#FEF3C7',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: isSubmitted
                          ? '#16A34A'
                          : item.status === 'Overdue'
                          ? '#DC2626'
                          : '#D97706',
                      },
                    ]}
                  >
                    {isSubmitted ? 'Awaiting Review' : item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* INSTRUCTIONS BOX */}
              {item.instructions ? (
                <View style={styles.instructionsBox}>
                  <Text style={styles.instructionsHeader}>Coordinator Remarks / Instructions:</Text>
                  <Text style={styles.instructionsText}>{item.instructions}</Text>
                </View>
              ) : null}

              {/* DUE DATE */}
              {item.due_at ? (
                <View style={styles.infoRow}>
                  <IconSymbol name="clock.fill" size={14} color="#D97706" />
                  <Text style={[styles.infoText, isDarkMode && { color: '#CBD5E1' }]}>
                    Deadline: {formatDate(item.due_at, '—')}
                  </Text>
                </View>
              ) : null}

              {/* ORIGINAL SUBMITTED DOCUMENT */}
              {targetDoc ? (
                <View style={[styles.docBox, isDarkMode && { backgroundColor: '#111827', borderColor: '#374151' }]}>
                  <Text style={[styles.docBoxTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    Original Submitted File
                  </Text>
                  <Text style={[styles.docBoxSub, isDarkMode && { color: '#94A3B8' }]}>
                    {targetDoc.original_filename} ({(targetDoc.file_size / 1024).toFixed(0)} KB)
                  </Text>

                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOriginalDocAction(targetDoc.application_document_id, targetDoc.original_filename, 'view')}
                      activeOpacity={0.8}
                    >
                      {actionLoadingDocKey === `orig_${targetDoc.application_document_id}_view` ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol name="doc.text.fill" size={14} color="#FFFFFF" />
                      )}
                      <Text style={styles.docActionText}>View Original</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.docActionBtn, { backgroundColor: '#475569' }]}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOriginalDocAction(targetDoc.application_document_id, targetDoc.original_filename, 'download')}
                      activeOpacity={0.8}
                    >
                      {actionLoadingDocKey === `orig_${targetDoc.application_document_id}_download` ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol name="arrow.down.circle.fill" size={14} color="#FFFFFF" />
                      )}
                      <Text style={styles.docActionText}>Download Original</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* REPLACEMENT DOCUMENT FORM OR SUBMITTED STATE */}
              {isSubmitted ? (
                <View style={styles.submittedBanner}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#16A34A" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.submittedBannerTitle}>Replacement Submitted — Awaiting Review</Text>
                    <Text style={styles.submittedBannerSub}>
                      Your replacement document has been submitted and is currently being validated by the Secretariat.
                    </Text>
                    {replDoc ? (
                      <Text style={styles.submittedFileMeta}>
                        File: {replDoc.replacement_filename} • Submitted: {formatDate(replDoc.submitted_at, '—')}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : isPending ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#F8FAFC' }]}>
                    {isVideoRequirement(item)
                      ? 'Upload Video Replacement'
                      : 'Upload Document Replacement'}
                  </Text>
                  <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginBottom: 8, marginTop: 2 }}>
                    {isVideoRequirement(item)
                      ? 'MP4, MOV, WEBM up to 60MB'
                      : 'PDF, PNG, JPG up to 10MB'}
                  </Text>

                  <TouchableOpacity
                    style={[
                      styles.pickerBtn,
                      pickedFile && styles.pickerBtnActive,
                      isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                      pickedFile && isDarkMode && { backgroundColor: '#0C4A6E', borderColor: '#38BDF8' },
                    ]}
                    onPress={() => handlePickDocument(item)}
                    activeOpacity={0.8}
                  >
                    <IconSymbol
                      name={
                        isVideoRequirement(item)
                          ? 'video.fill'
                          : 'arrow.up.circle.fill'
                      }
                      size={18}
                      color={isDarkMode ? '#38BDF8' : '#0284C7'}
                    />
                    <Text style={[styles.pickerBtnText, isDarkMode && { color: '#38BDF8' }]}>
                      {pickedFile
                        ? 'Change Selected File'
                        : isVideoRequirement(item)
                        ? 'Select Replacement Video (MP4, MOV, WEBM up to 60MB)'
                        : 'Select Replacement File (PDF, PNG, JPG up to 10MB)'}
                    </Text>
                  </TouchableOpacity>

                  {pickedFile ? (
                    <View style={[styles.fileMetaBox, isDarkMode && { backgroundColor: '#064E3B' }]}>
                      <IconSymbol
                        name={isVideoRequirement(item) ? 'video.fill' : 'doc.text.fill'}
                        size={16}
                        color="#16A34A"
                      />
                      <Text style={[styles.fileMetaName, isDarkMode && { color: '#A7F3D0' }]} numberOfLines={1}>
                        {pickedFile.name}
                      </Text>
                      {pickedFile.size ? (
                        <Text style={[styles.fileMetaSize, isDarkMode && { color: '#6EE7B7' }]}>
                          ({(pickedFile.size / 1024).toFixed(0)} KB)
                        </Text>
                      ) : null}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    style={[
                      styles.submitBtn,
                      (!pickedFile || isSubmitting) && styles.submitBtnDisabled,
                    ]}
                    disabled={!pickedFile || isSubmitting}
                    onPress={() => handleSubmitReplacement(item)}
                    activeOpacity={0.8}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                    )}
                    <Text style={styles.submitBtnText}>
                      {isSubmitting ? 'Submitting Replacement...' : 'Submit Replacement'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}
            </View>
          );
        })
      )}
      {/* IN-APP DOCUMENT VIEWER MODAL */}
      <InAppDocumentViewerModal
        visible={viewerModalVisible}
        onClose={() => setViewerModalVisible(false)}
        localUri={viewerLocalUri}
        filename={viewerFilename}
        mimeType={viewerMimeType}
        documentTitle={viewerTitle}
        referenceNumber={viewerRefNumber}
        statusBadge={viewerStatus}
        date={viewerDate}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0284C7',
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  screenSub: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  reqTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  codeText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  instructionsBox: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  instructionsHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
    marginBottom: 4,
  },
  instructionsText: {
    fontSize: 13,
    color: '#78350F',
    lineHeight: 18,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 13,
    color: '#475569',
  },
  docBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
    marginBottom: 8,
  },
  docBoxTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 2,
  },
  docBoxSub: {
    fontSize: 12,
    color: '#64748B',
  },
  docActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0284C7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  docActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  submittedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  submittedBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#166534',
    marginBottom: 2,
  },
  submittedBannerSub: {
    fontSize: 12,
    color: '#15803D',
    lineHeight: 16,
  },
  submittedFileMeta: {
    fontSize: 11,
    fontWeight: '600',
    color: '#166534',
    marginTop: 6,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  pickerBtnActive: {
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0284C7',
  },
  fileMetaBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  fileMetaName: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#166534',
  },
  fileMetaSize: {
    fontSize: 11,
    color: '#15803D',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  submitBtnDisabled: {
    backgroundColor: '#94A3B8',
    opacity: 0.7,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 10,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },
});
