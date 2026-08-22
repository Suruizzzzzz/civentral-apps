import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { getScholarshipProgramDetails, ScholarshipProgram } from './api/ScholarshipProgramApi';
import { styles } from './styles/ScholarshipDetails.styles';

export function ScholarshipDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ program_id?: string }>();
  const programId = params.program_id ? parseInt(params.program_id, 10) : null;

  const { isDarkMode } = useTheme();

  const [program, setProgram] = useState<ScholarshipProgram | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    if (!programId) {
      setError('No scholarship program selected.');
      setIsLoading(false);
      return;
    }

    try {
      setError(null);
      const data = await getScholarshipProgramDetails(programId);
      if (!data) {
        setError('Scholarship program not found.');
      } else {
        setProgram(data);
      }
    } catch (err: any) {
      console.error('[ScholarshipDetailsScreen] fetch error:', err);
      setError('Unable to load scholarship details.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [programId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDetails();
  }, [programId]);

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
          tintColor={isDarkMode ? '#FB923C' : '#EA580C'}
          colors={['#EA580C']}
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
          color={isDarkMode ? '#FB923C' : '#EA580C'}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#FB923C' }]}>
          Back
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {error ? (
        <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#EA580C',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadDetails();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
          <Skeleton height={160} borderRadius={16} />
        </View>
      ) : program ? (
        <>
          {/* HEADER CARD */}
          <View style={[styles.headerCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <View style={styles.badgeRow}>
              <Badge variant="info" label={program.category_name || 'General'} />
              <Badge
                variant={program.program_status === 'Active' ? 'success' : 'neutral'}
                label={program.program_status}
              />
            </View>

            <Text style={[styles.programTitle, isDarkMode && { color: '#F8FAFC' }]}>
              {program.program_name}
            </Text>
            <Text style={[styles.programCode, isDarkMode && { color: '#94A3B8' }]}>
              Program Code: {program.program_code}
            </Text>
          </View>

          {/* 1. OVERVIEW */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              1. Overview
            </Text>
            <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
              {program.description || 'No detailed overview description available for this program.'}
            </Text>
          </View>

          {/* 2. ELIGIBILITY REQUIREMENTS */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              2. Eligibility Requirements
            </Text>

            {program.eligibility_requirements && program.eligibility_requirements.length > 0 ? (
              program.eligibility_requirements.map((req: any, idx: number) => (
                <View key={req.eligibility_id || idx} style={styles.listItem}>
                  <IconSymbol name="checkmark.circle.fill" size={18} color="#16A34A" />
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {req.criteria_name}
                    </Text>
                    <Text style={[styles.listSub, isDarkMode && { color: '#94A3B8' }]}>
                      Requirement: {req.display_requirement || req.condition_value}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
                No specific eligibility criteria configured.
              </Text>
            )}
          </View>

          {/* 3. REQUIRED DOCUMENTS */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              3. Required Documents
            </Text>

            {program.required_documents && program.required_documents.length > 0 ? (
              program.required_documents.map((doc: any, idx: number) => (
                <View key={doc.document_requirement_id || idx} style={styles.listItem}>
                  <IconSymbol name="doc.text.fill" size={18} color="#EA580C" />
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {doc.document_name} ({doc.requirement_level})
                    </Text>
                    {doc.description ? (
                      <Text style={[styles.listSub, isDarkMode && { color: '#94A3B8' }]}>
                        {doc.description}
                      </Text>
                    ) : null}
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
                No mandatory document uploads specified.
              </Text>
            )}
          </View>

          {/* 4. APPLICATION SCHEDULE */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              4. Application Schedule
            </Text>

            {program.application_period ? (
              <View style={styles.applyContainer}>
                <Text style={[styles.listTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  AY {program.application_period.academic_year} — {program.application_period.term}
                </Text>
                <Text style={[styles.listSub, isDarkMode && { color: '#94A3B8' }]}>
                  Opening Date: {new Date(program.application_period.opening_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
                <Text style={[styles.listSub, isDarkMode && { color: '#94A3B8' }]}>
                  Closing Date: {new Date(program.application_period.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </Text>
              </View>
            ) : (
              <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
                No active application period currently scheduled for this program.
              </Text>
            )}
          </View>

          {/* 5. PROGRAM BENEFITS */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              5. Program Benefits
            </Text>

            {program.benefits && program.benefits.length > 0 ? (
              program.benefits.map((b: any, idx: number) => (
                <View key={b.benefit_type_id || idx} style={styles.listItem}>
                  <View style={styles.listContent}>
                    <Text style={[styles.listTitle, isDarkMode && { color: '#F8FAFC' }]}>
                      {b.benefit_name}
                    </Text>
                    <Text style={[styles.listSub, isDarkMode && { color: '#94A3B8' }]}>
                      ₱{b.amount.toLocaleString()} ({b.amount_basis})
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={[styles.description, isDarkMode && { color: '#94A3B8' }]}>
                No specific financial benefit amounts configured.
              </Text>
            )}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
