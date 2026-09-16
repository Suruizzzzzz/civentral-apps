import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenGrantOverviewData,
  fetchCitizenGrantOverview,
  GrantApplicationDetail,
  uploadGrantDocument,
} from './api/grantApi';
import { styles } from './styles/ScholarshipGrant.styles';

export default function GrantComplianceScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<'COR' | 'SOA' | null>(null);

  const [overview, setOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [application, setApplication] = useState<GrantApplicationDetail | null>(null);

  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/grant' as any);
    }
  };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCitizenGrantOverview();
      setOverview(data);
      if (data.application) {
        setApplication(data.application);
      }
    } catch (err: any) {
      console.error('[GrantComplianceScreen] load error:', err);
      Alert.alert('Error', err.message || 'Failed to load grant compliance status.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handlePickAndUploadDocument = async (docType: 'COR' | 'SOA') => {
    if (!application) {
      Alert.alert('Error', 'No grant application found.');
      return;
    }

    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/jpeg', 'image/png'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const asset = res.assets[0];

        if (asset.size && asset.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', `The selected ${docType} file exceeds the maximum limit of 10MB.`);
          return;
        }

        setUploadingDoc(docType);

        const updatedApp = await uploadGrantDocument(
          application.grant_application_id,
          docType,
          asset.uri,
          asset.name,
          asset.mimeType || 'application/octet-stream'
        );

        setApplication(updatedApp);
        Alert.alert('Replacement Submitted', `Your replacement ${docType} document has been uploaded for Secretariat review.`);
      }
    } catch (err: any) {
      console.error('[GrantComplianceScreen] Pick/Upload error:', err);
      Alert.alert('Upload Failed', err.message || `Failed to upload replacement ${docType}.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.7}>
            <IconSymbol name="chevron.left" size={16} color={isDarkMode ? '#FB923C' : '#EA580C'} />
            <Text style={[styles.backText, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
              Back to Scholarship Grant
            </Text>
          </TouchableOpacity>
          <Skeleton height={140} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={200} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  const docs = application?.documents || [];
  const complianceDocs = docs.filter(
    (d) => d.review_status === 'Needs Replacement' || d.review_status === 'Invalid'
  );
  const isComplianceRequired =
    application?.grant_status === 'For Compliance' || complianceDocs.length > 0;
  const complianceCount = complianceDocs.length;

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Back Button */}
        <TouchableOpacity style={styles.backBtn} onPress={handleGoBack} activeOpacity={0.7}>
          <IconSymbol name="chevron.left" size={16} color={isDarkMode ? '#FB923C' : '#EA580C'} />
          <Text style={[styles.backText, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
            Back to Scholarship Grant
          </Text>
        </TouchableOpacity>

        {/* Header Summary */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
            <View>
              <Text style={[styles.cardTitle, { color: isDarkMode ? '#FB923C' : '#EA580C' }]}>
                Grant Compliance
              </Text>
              <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }, { marginBottom: 4 }]}>
                {application?.grant_application_code
                  ? `Grant Ref: ${application.grant_application_code}`
                  : 'Document Correction & Compliance'}
              </Text>
            </View>
            <Badge
              label={isComplianceRequired ? `${complianceCount > 0 ? complianceCount + ' ' : ''}Action Required` : 'No Requests'}
              variant={isComplianceRequired ? 'warning' : 'success'}
            />
          </View>

          {overview?.scholar && (
            <Text style={{ fontSize: 12, color: isDarkMode ? '#CBD5E1' : '#64748B' }}>
              Scholar: {overview.scholar.scholar_name} ({overview.scholar.scholar_code})
            </Text>
          )}
        </View>

        {/* Contextual Status */}
        {!isComplianceRequired ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 10, marginTop: 4 }}>
            <IconSymbol name="checkmark.circle.fill" size={16} color="#16A34A" />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#86EFAC' : '#166534' }}>
                No active compliance requests.
              </Text>
              <Text style={{ fontSize: 11.5, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                All submitted documents are in order or undergoing standard review.
              </Text>
            </View>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <View
              style={[
                styles.complianceActionBox,
                isDarkMode && styles.complianceActionBoxDark,
              ]}
            >
              <View style={styles.complianceActionHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#EA580C" />
                  <Text style={[styles.complianceActionTitle, isDarkMode && { color: '#FB923C' }]}>
                    Document Correction Required
                  </Text>
                </View>
                <Badge label="Action Required" variant="warning" />
              </View>
              <Text style={[styles.complianceActionSub, isDarkMode && { color: '#FED7AA' }]}>
                The Scholarship Secretariat has flagged requirement(s) that need correction. Please review the notes below and submit replacement document(s).
              </Text>
            </View>

            {/* List Flagged Items */}
            {complianceDocs.map((doc) => {
              const docLabel =
                doc.document_type === 'COR'
                  ? 'Certificate of Registration (COR)'
                  : 'Statement of Account (SOA)';

              return (
                <View
                  key={doc.grant_document_id}
                  style={[
                    styles.card,
                    isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {docLabel}
                    </Text>
                    <Badge label={doc.review_status} variant="warning" />
                  </View>

                  <Text style={styles.docFileName}>{doc.file_name}</Text>
                  <Text style={styles.docMeta}>
                    Submitted: {new Date(doc.submitted_at).toLocaleDateString()}
                  </Text>

                  {doc.review_remarks && (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? '#451A03' : '#FEF2F2',
                        padding: 10,
                        borderRadius: 8,
                        marginTop: 10,
                        borderWidth: 1,
                        borderColor: isDarkMode ? '#B45309' : '#FCA5A5',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '700', color: isDarkMode ? '#FDE68A' : '#DC2626', marginBottom: 2 }}>
                        Secretariat Remarks:
                      </Text>
                      <Text style={{ fontSize: 12, color: isDarkMode ? '#FEF08A' : '#B91C1C', lineHeight: 17 }}>
                        {doc.review_remarks}
                      </Text>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[
                      styles.primaryBtn,
                      { marginTop: 12 },
                      uploadingDoc === doc.document_type && styles.primaryBtnDisabled,
                    ]}
                    onPress={() => handlePickAndUploadDocument(doc.document_type)}
                    disabled={uploadingDoc === doc.document_type}
                    activeOpacity={0.8}
                  >
                    {uploadingDoc === doc.document_type ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol name="arrow.triangle.2.circlepath" size={16} color="#FFFFFF" />
                        <Text style={styles.primaryBtnText}>
                          Upload Replacement {doc.document_type}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
