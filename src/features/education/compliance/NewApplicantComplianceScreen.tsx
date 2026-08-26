import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  downloadOrViewCitizenDocument,
} from '../dashboard/api/citizenDocumentApi';
import {
  ApplicationComplianceData,
  ApplicationComplianceItem,
  fetchApplicationCompliance,
  submitApplicationComplianceReplacement,
} from './api/newApplicantComplianceApi';

export function NewApplicantComplianceScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [complianceData, setComplianceData] = useState<ApplicationComplianceData | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, { uri: string; name: string; size?: number; mimeType?: string }>>({});
  const [isSubmittingCompId, setIsSubmittingCompId] = useState<number | null>(null);
  const [actionLoadingDocKey, setActionLoadingDocKey] = useState<string | null>(null);

  const loadComplianceData = async () => {
    try {
      setError(null);
      const data = await fetchApplicationCompliance();
      setComplianceData(data);
    } catch (err: any) {
      console.error('[NewApplicantComplianceScreen] fetch error:', err);
      setError(err?.message || 'Unable to load application compliance requests.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadComplianceData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadComplianceData();
  }, []);

  const handlePickDocument = async (compId: number) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFiles((prev) => ({
          ...prev,
          [compId]: {
            uri: file.uri,
            name: file.name,
            size: file.size,
            mimeType: file.mimeType || 'application/octet-stream',
          },
        }));
      }
    } catch (err: any) {
      console.error('[NewApplicantComplianceScreen] document picker error:', err);
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
      await downloadOrViewCitizenDocument('application', docId, filename, mode);
    } catch (err: any) {
      console.error('[handleOriginalDocAction] error:', err);
      Alert.alert('Unable to Process Document', err?.message || 'Please check your connection and try again.');
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
      const updatedData = await submitApplicationComplianceReplacement(item.compliance_id, {
        uri: picked.uri,
        name: picked.name,
        type: picked.mimeType || 'application/octet-stream',
      });

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
      console.error('[handleSubmitReplacement] error:', err);
      Alert.alert('Submission Failed', err?.message || 'Unable to submit replacement document. Please try again.');
    } finally {
      setIsSubmittingCompId(null);
    }
  };

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
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? '#C084FC' : '#7E22CE'}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#C084FC' }]}>
          Back to Dashboard
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
              backgroundColor: '#7E22CE',
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
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <IconSymbol name="checkmark.circle.fill" size={36} color="#16A34A" />
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Active Compliance Requests
          </Text>
          <Text style={[styles.emptySub, isDarkMode && { color: '#94A3B8' }]}>
            Your scholarship application has no pending document replacement requests.
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
                    {(item.target_document && item.target_document.document_name) ? item.target_document.document_name : (item.requirement_title && !item.requirement_title.startsWith('Replacement:') && !item.requirement_title.match(/\.(png|jpg|jpeg|pdf)$/i)) ? item.requirement_title : 'Document Replacement Request'}
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
                    Deadline: {new Date(item.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                    <Text style={styles.submittedBannerTitle}>Replacement Submitted Ã¢â‚¬â€ Awaiting Review</Text>
                    <Text style={styles.submittedBannerSub}>
                      Your replacement document has been submitted and is currently being validated by the Secretariat.
                    </Text>
                    {replDoc ? (
                      <Text style={styles.submittedFileMeta}>
                        File: {replDoc.replacement_filename} Ã¢â‚¬Â¢ Submitted: {new Date(replDoc.submitted_at).toLocaleDateString()}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ) : isPending ? (
                <View style={{ marginTop: 14 }}>
                  <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#F8FAFC' }]}>
                    Upload Document Replacement
                  </Text>

                  <TouchableOpacity
                    style={[styles.pickerBtn, pickedFile && styles.pickerBtnActive]}
                    onPress={() => handlePickDocument(item.compliance_id)}
                    activeOpacity={0.8}
                  >
                    <IconSymbol name="arrow.up.circle.fill" size={18} color="#7E22CE" />
                    <Text style={styles.pickerBtnText}>
                      {pickedFile ? 'Change Selected File' : 'Select Replacement File (PDF / Image)'}
                    </Text>
                  </TouchableOpacity>

                  {pickedFile ? (
                    <View style={styles.fileMetaBox}>
                      <IconSymbol name="doc.text.fill" size={16} color="#16A34A" />
                      <Text style={styles.fileMetaName} numberOfLines={1}>
                        {pickedFile.name}
                      </Text>
                      {pickedFile.size ? (
                        <Text style={styles.fileMetaSize}>
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
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7E22CE',
    marginLeft: 4,
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
    backgroundColor: '#7E22CE',
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
    borderColor: '#7E22CE',
    backgroundColor: '#F3E8FF',
  },
  pickerBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#7E22CE',
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
    backgroundColor: '#7E22CE',
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
