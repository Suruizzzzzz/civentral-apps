import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenRenewalOverview, fetchCitizenRenewalOverview, RequiredDocumentItem } from './api/renewalApi';
import { styles } from './styles/ScholarshipRenewal.styles';

export function ScholarshipRenewalScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CitizenRenewalOverview | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const overview = await fetchCitizenRenewalOverview();
      setData(overview);
    } catch (err: any) {
      console.error('[ScholarshipRenewalScreen] fetch error:', err);
      setError(err?.message || 'Unable to retrieve scholarship renewal status.');
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
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
        Scholarship Renewal
      </Text>

      {/* LOADING STATE */}
      {loading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      ) : error ? (
        /* ERROR STATE */
        <View style={styles.centerContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={40} color="#EF4444" />
          <Text style={styles.errorTitle}>Unable to Load Renewal</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <>
          {/* STATE-SPECIFIC BANNER */}
          {data.state === 'NOT_A_SCHOLAR' && (
            <View style={[styles.banner, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', borderWidth: 1 }]}>
              <IconSymbol name="info.circle" size={24} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: '#1E40AF' }]}>Not an Active Scholar</Text>
                <Text style={[styles.bannerText, { color: '#1E3A8A' }]}>
                  Scholarship renewal is available exclusively for enrolled municipal scholars. If you are a new applicant, please apply via the New Applicant portal.
                </Text>
              </View>
            </View>
          )}

          {data.state === 'SCHOLAR_INACTIVE' && (
            <View style={[styles.banner, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1 }]}>
              <IconSymbol name="xmark.circle.fill" size={24} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: '#991B1B' }]}>Scholarship Status Inactive</Text>
                <Text style={[styles.bannerText, { color: '#7F1D1D' }]}>
                  Your scholar account is currently listed as {data.scholar?.scholar_status || 'Inactive'}. Renewal submission is restricted for inactive scholars.
                </Text>
              </View>
            </View>
          )}

          {data.state === 'RENEWAL_NOT_OPEN' && (
            <View style={[styles.banner, { backgroundColor: '#FFFBEB', borderColor: '#FDE68A', borderWidth: 1 }]}>
              <IconSymbol name="clock.fill" size={24} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: '#92400E' }]}>Renewal Window Closed</Text>
                <Text style={[styles.bannerText, { color: '#78350F' }]}>
                  The official scholarship renewal period is not currently open. Please stay tuned for official announcement notices from the City Education Department.
                </Text>
              </View>
            </View>
          )}

          {data.state === 'RENEWAL_AVAILABLE' && (
            <View style={[styles.banner, { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 }]}>
              <IconSymbol name="checkmark.circle.fill" size={24} color="#16A34A" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: '#166534' }]}>Renewal Available</Text>
                <Text style={[styles.bannerText, { color: '#14532D' }]}>
                  The scholarship renewal window is open! Scholars are invited to submit their latest COR and grade records for review.
                </Text>
              </View>
            </View>
          )}

          {data.state === 'RENEWAL_EXISTS' && (
            <View style={[styles.banner, { backgroundColor: '#F5F3FF', borderColor: '#DDD6FE', borderWidth: 1 }]}>
              <IconSymbol name="doc.text.fill" size={24} color="#7C3AED" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: '#5B21B6' }]}>Renewal Submitted</Text>
                <Text style={[styles.bannerText, { color: '#4C1D95' }]}>
                  Your renewal application ({data.renewal?.renewal_code}) was submitted on{' '}
                  {data.renewal?.submitted_at ? new Date(data.renewal.submitted_at).toLocaleDateString() : 'recent date'}.
                  Current status: {data.renewal?.renewal_status}.
                </Text>
              </View>
            </View>
          )}

          {/* SCHOLAR & PROGRAM SUMMARY CARD */}
          {data.scholar && data.program && (
            <View style={[styles.card, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.badgeRow}>
                <Badge variant="info" label={data.program.category_name || 'Scholarship Program'} />
                <Badge variant={data.scholar.scholar_status === 'Active' ? 'success' : 'neutral'} label={data.scholar.scholar_status} />
              </View>

              <Text style={[styles.programTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {data.program.program_name}
              </Text>
              <Text style={[styles.programCode, isDarkMode && { color: '#94A3B8' }]}>
                Scholar Code: {data.scholar.scholar_code}
              </Text>

              {data.current_academic_period && (
                <View style={styles.infoRow}>
                  <Text style={[styles.infoLabel, isDarkMode && { color: '#94A3B8' }]}>Academic Period</Text>
                  <Text style={[styles.infoValue, isDarkMode && { color: '#F8FAFC' }]}>
                    {data.current_academic_period.academic_year} — {data.current_academic_period.term}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* RENEWAL REQUIREMENTS LIST */}
          {data.required_documents && data.required_documents.length > 0 && (
            <View>
              <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Required Renewal Documents
              </Text>
              {data.required_documents.map((doc: RequiredDocumentItem) => (
                <View key={doc.code} style={[styles.docItem, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                  <View style={styles.docBadge}>
                    <Text style={styles.docBadgeText}>{doc.code}</Text>
                  </View>
                  <View style={styles.docTextCol}>
                    <Text style={[styles.docName, isDarkMode && { color: '#F8FAFC' }]}>{doc.name}</Text>
                    <Text style={[styles.docDesc, isDarkMode && { color: '#94A3B8' }]}>{doc.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}
