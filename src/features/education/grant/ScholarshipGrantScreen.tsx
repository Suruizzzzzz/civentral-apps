import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import {
  CitizenGrantOverviewData,
  createGrantApplication,
  fetchCitizenGrantOverview,
  fetchPartnerSchoolsLookup,
  GrantApplicationDetail,
  PartnerSchoolInfo,
  submitGrantApplication,
  uploadGrantDocument,
} from './api/grantApi';
import { styles } from './styles/ScholarshipGrant.styles';

function getStatusBadgeVariant(status?: string): 'info' | 'success' | 'warning' | 'danger' | 'neutral' {
  if (!status || status === '--') return 'neutral';
  switch (status) {
    case 'Draft':
      return 'warning';
    case 'Submitted':
    case 'Approved for Payroll':
      return 'success';
    case 'For Review':
    case 'Under Review':
      return 'info';
    case 'For Compliance':
      return 'warning';
    case 'Withdrawn':
      return 'danger';
    default:
      return 'neutral';
  }
}

export default function ScholarshipGrantScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<'COR' | 'SOA' | null>(null);

  const [overview, setOverview] = useState<CitizenGrantOverviewData | null>(null);
  const [application, setApplication] = useState<GrantApplicationDetail | null>(null);

  // Success Modal State
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [submittedResult, setSubmittedResult] = useState<GrantApplicationDetail | null>(null);

  // Partner School Selector State
  const [schoolModalVisible, setSchoolModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [partnerSchools, setPartnerSchools] = useState<PartnerSchoolInfo[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState<PartnerSchoolInfo | null>(null);

  // Navigation Back Action
  const handleGoBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/education/dashboard' as any);
    }
  };

  const renderBackButton = () => (
    <TouchableOpacity
      style={styles.backBtn}
      onPress={handleGoBack}
      activeOpacity={0.7}
    >
      <IconSymbol
        name="chevron.left"
        size={16}
        color={isDarkMode ? '#38BDF8' : '#0284C7'}
      />
      <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
        Back to Scholarship Dashboard
      </Text>
    </TouchableOpacity>
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCitizenGrantOverview();
      setOverview(data);

      if (data.has_existing_application && data.application) {
        setApplication(data.application);
      } else if (data.institution_resolved && data.institution) {
        setSelectedSchool(data.institution);
      }
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] Load overview error:', err);
      Alert.alert('Error', err.message || 'Failed to load grant application context.');
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

  // Open Partner School Lookup Modal
  const handleOpenSchoolModal = async () => {
    setSchoolModalVisible(true);
    try {
      setLoadingSchools(true);
      const programId = overview?.scholar?.program_id;
      const schools = await fetchPartnerSchoolsLookup(programId, searchQuery);
      setPartnerSchools(schools);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to search partner schools.');
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSearchSchools = async (text: string) => {
    setSearchQuery(text);
    try {
      setLoadingSchools(true);
      const programId = overview?.scholar?.program_id;
      const schools = await fetchPartnerSchoolsLookup(programId, text);
      setPartnerSchools(schools);
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] School search error:', err);
    } finally {
      setLoadingSchools(false);
    }
  };

  const handleSelectSchool = (school: PartnerSchoolInfo) => {
    setSelectedSchool(school);
    setSchoolModalVisible(false);
  };

  // Start / Create Draft Application
  const handleCreateApplication = async () => {
    if (!selectedSchool && !overview?.institution_resolved) {
      Alert.alert('Selection Required', 'Please select your active partner institution before proceeding.');
      return;
    }

    try {
      setSubmitting(true);
      const instId = selectedSchool?.partner_school_id;
      const app = await createGrantApplication(instId);
      setApplication(app);
      Alert.alert('Application Started', 'Your grant application draft has been initiated. Please upload the required document(s).');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to create grant application draft.');
    } finally {
      setSubmitting(false);
    }
  };

  // Upload Document (COR or SOA) with support for pre-submission replacement
  const handlePickAndUploadDocument = async (docType: 'COR' | 'SOA') => {
    if (!application) {
      Alert.alert('Error', 'Please start the grant application draft first.');
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
          asset.mimeType || 'application/pdf',
        );
        setApplication(updatedApp);
        Alert.alert('Upload Successful', `${docType} document uploaded successfully.`);
      }
    } catch (err: any) {
      console.error('[ScholarshipGrantScreen] Document upload error:', err);
      Alert.alert('Upload Error', err.message || `Failed to upload ${docType} document.`);
    } finally {
      setUploadingDoc(null);
    }
  };

  // Final Submit Application
  const handleSubmitApplication = async () => {
    if (!application) return;

    const instType = application.institution_type || selectedSchool?.institution_type || 'Public';
    const docs = application.documents || [];
    const hasCor = docs.some((d) => d.document_type === 'COR' && d.submission_status !== 'Removed');
    const hasSoa = docs.some((d) => d.document_type === 'SOA' && d.submission_status !== 'Removed');

    if (!hasCor) {
      Alert.alert('Document Required', 'Certificate of Registration (COR) is required before submitting your grant application.');
      return;
    }

    if (instType === 'Private' && !hasSoa) {
      Alert.alert('Document Required', 'Statement of Account (SOA) is required for scholars enrolled in a private institution.');
      return;
    }

    Alert.alert(
      'Confirm Final Submission',
      'Are you sure you want to submit your grant application? After submission, document changes will require Secretariat review.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Submit Application',
          onPress: async () => {
            try {
              setSubmitting(true);
              const submittedApp = await submitGrantApplication(application.grant_application_id);
              setApplication(submittedApp);
              setSubmittedResult(submittedApp);
              setSuccessModalVisible(true);
            } catch (err: any) {
              Alert.alert('Submission Error', err.message || 'Failed to submit grant application.');
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {renderBackButton()}
          <Skeleton height={120} borderRadius={16} />
          <View style={{ height: 16 }} />
          <Skeleton height={200} borderRadius={16} />
        </ScrollView>
      </View>
    );
  }

  const isEligible = overview?.eligible ?? false;
  const currentPeriod = overview?.current_academic_period;
  const scholar = overview?.scholar;

  // Not Eligible State
  if (!isEligible) {
    return (
      <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {renderBackButton()}
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#D97706" />
              <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Grant Application Not Available</Text>
            </View>
            <Text style={{ fontSize: 13, color: isDarkMode ? '#CBD5E1' : '#475569', lineHeight: 20, marginBottom: 16 }}>
              {overview?.reason || 'You are currently not eligible for Grant intake processing.'}
            </Text>
            {scholar && (
              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Scholar Code</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar.scholar_code}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Program</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar.program_name}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  const isSubmitted = application?.grant_status === 'Submitted' || (application?.grant_status && application.grant_status !== 'Draft');
  const activeInstType = application?.institution_type || selectedSchool?.institution_type || 'Public';
  const docs = application?.documents || [];
  const corDoc = docs.find((d) => d.document_type === 'COR' && d.submission_status !== 'Removed');
  const soaDoc = docs.find((d) => d.document_type === 'SOA' && d.submission_status !== 'Removed');

  const grantStatusText =
    application?.grant_status ||
    (application as any)?.status ||
    (application as any)?.application_status ||
    '--';

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0F172A' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderBackButton()}

        {/* HEADER / SCHOLARSHIP CONTEXT */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>Scholarship Grant Intake</Text>
          <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Current Academic Period: {currentPeriod ? `${currentPeriod.academic_year} — ${currentPeriod.term}` : 'Loading...'}
          </Text>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scholar Name</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.scholar_name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Scholar Code</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.scholar_code}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Program</Text>
              <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>{scholar?.program_name}</Text>
            </View>
            {application && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Grant Reference</Text>
                <Text style={[styles.infoValue, { color: '#0284C7' }]}>{application.grant_application_code}</Text>
              </View>
            )}
            {application && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Application Status</Text>
                <View style={styles.badgeContainer}>
                  <Badge
                    label={grantStatusText}
                    variant={getStatusBadgeVariant(grantStatusText)}
                  />
                </View>
              </View>
            )}
          </View>
        </View>

        {/* STEP 1: INSTITUTION SELECTION / RESOLUTION */}
        <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>1. Enrolled Partner Institution</Text>
          <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Select your registered institution for the current academic period.
          </Text>

          {application ? (
            <View style={[styles.selectorBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.selectorText, isDarkMode && { color: '#F8FAFC' }]}>
                  {application.institution_name}
                </Text>
                <Text style={styles.selectorSub}>
                  {application.institution_type} Institution ({application.school_code})
                </Text>
              </View>
              <Badge label={application.institution_type} variant="info" />
            </View>
          ) : selectedSchool ? (
            <TouchableOpacity
              style={[styles.selectorBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
              onPress={handleOpenSchoolModal}
              disabled={submitting}
            >
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.selectorText, isDarkMode && { color: '#F8FAFC' }]}>
                  {selectedSchool.institution_name}
                </Text>
                <Text style={styles.selectorSub}>
                  {selectedSchool.institution_type} Institution ({selectedSchool.school_code})
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Badge label={selectedSchool.institution_type} variant="info" />
                <IconSymbol name="chevron.right" size={16} color="#64748B" />
              </View>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.selectorBox, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}
              onPress={handleOpenSchoolModal}
              disabled={submitting}
            >
              <Text style={[styles.selectorText, { color: '#64748B' }]}>Tap to select registered Partner School...</Text>
              <IconSymbol name="chevron.right" size={16} color="#64748B" />
            </TouchableOpacity>
          )}

          {!application && (
            <TouchableOpacity
              style={[styles.primaryBtn, (!selectedSchool || submitting) && styles.primaryBtnDisabled]}
              onPress={handleCreateApplication}
              disabled={!selectedSchool || submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Start Grant Application</Text>
                  <IconSymbol name="arrow.right" size={16} color="#FFFFFF" />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* STEP 2: DOCUMENT REQUIREMENTS & UPLOAD */}
        {application && (
          <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.cardTitle, isDarkMode && { color: '#F8FAFC' }]}>2. Grant Requirements</Text>
            <Text style={[styles.cardSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              {activeInstType === 'Private'
                ? 'Scholars in Private Institutions must submit both COR and SOA.'
                : 'Scholars in Public Institutions must submit COR.'}
            </Text>

            {/* COR Document Card */}
            <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.docHeader}>
                <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Certificate of Registration (COR)
                </Text>
                <Text
                  style={[
                    styles.docReqBadge,
                    corDoc
                      ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                      : { backgroundColor: '#FEF3C7', color: '#B45309' },
                  ]}
                >
                  {corDoc ? '✓ Uploaded' : 'Required'}
                </Text>
              </View>

              {corDoc ? (
                <View>
                  <Text style={styles.docFileName}>{corDoc.file_name}</Text>
                  <Text style={styles.docMeta}>
                    Status: {corDoc.review_status || 'Pending'} • Submitted: {new Date(corDoc.submitted_at).toLocaleDateString()}
                  </Text>
                  {!isSubmitted && (
                    <TouchableOpacity
                      style={styles.replaceBtn}
                      onPress={() => handlePickAndUploadDocument('COR')}
                      disabled={uploadingDoc === 'COR'}
                    >
                      {uploadingDoc === 'COR' ? (
                        <ActivityIndicator size="small" color="#0284C7" />
                      ) : (
                        <>
                          <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                          <Text style={styles.replaceBtnText}>Replace COR Document</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}
                </View>
              ) : (
                !isSubmitted && (
                  <TouchableOpacity
                    style={styles.uploadBtn}
                    onPress={() => handlePickAndUploadDocument('COR')}
                    disabled={uploadingDoc === 'COR'}
                  >
                    {uploadingDoc === 'COR' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <IconSymbol name="doc.fill" size={14} color="#FFFFFF" />
                        <Text style={styles.uploadBtnText}>Upload COR (PDF/Image)</Text>
                      </>
                    )}
                  </TouchableOpacity>
                )
              )}
            </View>

            {/* SOA Document Card (Private only) */}
            {activeInstType === 'Private' && (
              <View style={[styles.docItem, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
                <View style={styles.docHeader}>
                  <Text style={[styles.docTypeTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    Statement of Account (SOA)
                  </Text>
                  <Text
                    style={[
                      styles.docReqBadge,
                      soaDoc
                        ? { backgroundColor: '#DCFCE7', color: '#15803D' }
                        : { backgroundColor: '#FEF3C7', color: '#B45309' },
                    ]}
                  >
                    {soaDoc ? '✓ Uploaded' : 'Required for Private'}
                  </Text>
                </View>

                {soaDoc ? (
                  <View>
                    <Text style={styles.docFileName}>{soaDoc.file_name}</Text>
                    <Text style={styles.docMeta}>
                      Status: {soaDoc.review_status || 'Pending'} • Submitted: {new Date(soaDoc.submitted_at).toLocaleDateString()}
                    </Text>
                    {!isSubmitted && (
                      <TouchableOpacity
                        style={styles.replaceBtn}
                        onPress={() => handlePickAndUploadDocument('SOA')}
                        disabled={uploadingDoc === 'SOA'}
                      >
                        {uploadingDoc === 'SOA' ? (
                          <ActivityIndicator size="small" color="#0284C7" />
                        ) : (
                          <>
                            <IconSymbol name="arrow.triangle.2.circlepath" size={14} color="#334155" />
                            <Text style={styles.replaceBtnText}>Replace SOA Document</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                ) : (
                  !isSubmitted && (
                    <TouchableOpacity
                      style={styles.uploadBtn}
                      onPress={() => handlePickAndUploadDocument('SOA')}
                      disabled={uploadingDoc === 'SOA'}
                    >
                      {uploadingDoc === 'SOA' ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <>
                          <IconSymbol name="doc.fill" size={14} color="#FFFFFF" />
                          <Text style={styles.uploadBtnText}>Upload SOA (PDF/Image)</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}

            {/* FINAL SUBMIT BUTTON */}
            {!isSubmitted && (
              <TouchableOpacity
                style={[
                  styles.primaryBtn,
                  (!corDoc || (activeInstType === 'Private' && !soaDoc) || submitting) && styles.primaryBtnDisabled,
                ]}
                onPress={handleSubmitApplication}
                disabled={!corDoc || (activeInstType === 'Private' && !soaDoc) || submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <Text style={styles.primaryBtnText}>Submit Grant Application</Text>
                    <IconSymbol name="paperplane.fill" size={16} color="#FFFFFF" />
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* SUCCESS SUBMISSION MODAL */}
      <Modal
        visible={successModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.successModalOverlay}>
          <View style={[styles.successModalCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.successIconContainer}>
              <IconSymbol name="checkmark.circle.fill" size={48} color="#16A34A" />
            </View>

            <Text style={[styles.successModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Grant Application Submitted
            </Text>

            <Text style={[styles.successModalSub, isDarkMode && { color: '#94A3B8' }]}>
              Your scholarship grant application has been submitted successfully.
            </Text>

            <View style={[styles.summaryCard, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' }]}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Grant Reference</Text>
                <Text style={[styles.summaryValueRef, isDarkMode && { color: '#38BDF8' }]}>
                  {submittedResult?.grant_application_code || application?.grant_application_code || '--'}
                </Text>
              </View>
              <View style={[styles.summaryRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                <Text style={styles.summaryLabel}>Status</Text>
                <Badge
                  label={submittedResult?.grant_status || application?.grant_status || 'Submitted'}
                  variant="success"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.doneBtn}
              onPress={() => setSuccessModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.doneBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* PARTNER SCHOOL LOOKUP MODAL */}
      <Modal visible={schoolModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, isDarkMode && { backgroundColor: '#1E293B' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, isDarkMode && { color: '#F8FAFC' }]}>Select Partner School</Text>
              <TouchableOpacity onPress={() => setSchoolModalVisible(false)}>
                <IconSymbol name="xmark.circle.fill" size={24} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.searchInput, isDarkMode && { backgroundColor: '#0F172A', color: '#F8FAFC', borderColor: '#334155' }]}
              placeholder="Search school name or code..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearchSchools}
            />

            {loadingSchools ? (
              <ActivityIndicator size="large" color="#0284C7" style={{ marginVertical: 20 }} />
            ) : partnerSchools.length === 0 ? (
              <View style={styles.emptyNotice}>
                <Text style={styles.emptyNoticeText}>No active partner schools found matching your search.</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {partnerSchools.map((school) => (
                  <TouchableOpacity
                    key={school.partner_school_id}
                    style={styles.schoolItem}
                    onPress={() => handleSelectSchool(school)}
                  >
                    <Text style={[styles.schoolItemName, isDarkMode && { color: '#F8FAFC' }]}>
                      {school.institution_name}
                    </Text>
                    <Text style={styles.schoolItemMeta}>
                      {school.institution_type} Institution • {school.city_municipality || 'Quezon City'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}