import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenDashboardData, fetchCitizenDashboard } from '../dashboard/api/scholarshipDashboardApi';
import { getScholarshipProgramDetails, ScholarshipProgram } from './api/ScholarshipProgramApi';
import { styles } from './styles/ScholarshipDetails.styles';

interface ApplyCTAState {
  canApply: boolean;
  buttonText: string;
  noticeText: string | null;
  isLoadingState?: boolean;
}

function computeApplyCTAState(
  program: ScholarshipProgram | null,
  dashboardData: CitizenDashboardData | null,
  isLoading: boolean,
  isLoadingDashboard: boolean
): ApplyCTAState {
  if (isLoading || isLoadingDashboard) {
    return {
      canApply: false,
      buttonText: 'Checking Eligibility...',
      noticeText: null,
      isLoadingState: true,
    };
  }

  if (!program) {
    return {
      canApply: false,
      buttonText: 'Program Unavailable',
      noticeText: 'This scholarship program cannot be loaded.',
    };
  }

  // 1. Program Status Check
  if (program.program_status !== 'Active') {
    return {
      canApply: false,
      buttonText: 'Program Inactive',
      noticeText: 'This scholarship program is currently not active.',
    };
  }

  // 2. Active Scholar Check (using actual scholar status / dashboard state)
  const isScholarActive =
    dashboardData?.state === 'ACTIVE_SCHOLAR' ||
    dashboardData?.state === 'ACTIVE_GRANT' ||
    dashboardData?.state === 'SCHOLAR_WITHOUT_GRANT' ||
    (dashboardData?.scholar &&
      (dashboardData.scholar.scholar_status === 'Active' ||
        dashboardData.scholar.scholar_status === 'Enrolled'));

  if (isScholarActive) {
    return {
      canApply: false,
      buttonText: 'Already an Active Scholar',
      noticeText: 'Citizens with an active scholarship are not eligible for new applications.',
    };
  }

  // 3. Application In Progress / Duplicate Application Check
  const existingApp = dashboardData?.application;
  const isAppInProgressState = dashboardData?.state === 'APPLICATION_IN_PROGRESS';

  if (existingApp || isAppInProgressState) {
    const appStatus = existingApp?.application_status || 'In Progress';
    // Terminal statuses that do NOT block:
    const isTerminalStatus = ['Rejected', 'Withdrawn', 'Cancelled'].includes(appStatus);

    if (!isTerminalStatus) {
      // Check if program_id matches when available
      const appProgramId = dashboardData?.scholarship?.program_id;
      if (!appProgramId || appProgramId === program.program_id) {
        return {
          canApply: false,
          buttonText: `Already Applied (${appStatus})`,
          noticeText: `You already have an active application with status "${appStatus}".`,
        };
      }
    }
  }

  // 4. Application Period Check
  const period = program.application_period || (program.application_periods && program.application_periods[0]);

  if (!period) {
    return {
      canApply: false,
      buttonText: 'No Active Application Period',
      noticeText: 'There is currently no application period scheduled for this program.',
    };
  }

  // Authoritative backend status check first
  const periodStatus = (period.status || '').toLowerCase();

  if (periodStatus === 'closed') {
    return {
      canApply: false,
      buttonText: 'Application Period Closed',
      noticeText: 'The application period for this scholarship has closed.',
    };
  }

  if (periodStatus === 'scheduled' || periodStatus === 'upcoming') {
    return {
      canApply: false,
      buttonText: 'Application Opening Soon',
      noticeText: `Opening Date: ${period.opening_date ? new Date(period.opening_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'TBA'}`,
    };
  }

  // Fallback to client-side date window check if status is open or not explicitly set
  if (period.opening_date && period.closing_date) {
    const now = new Date();
    const openDate = new Date(`${period.opening_date}T00:00:00`);
    const closeDate = new Date(`${period.closing_date}T23:59:59`);

    if (now < openDate) {
      return {
        canApply: false,
        buttonText: 'Application Opening Soon',
        noticeText: `Opening Date: ${new Date(period.opening_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
      };
    }

    if (now > closeDate) {
      return {
        canApply: false,
        buttonText: 'Application Period Closed',
        noticeText: `The application period ended on ${new Date(period.closing_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}.`,
      };
    }
  }

  // Open & Allowed!
  return {
    canApply: true,
    buttonText: 'Apply for Scholarship',
    noticeText: 'Application period is currently open.',
  };
}

export function ScholarshipDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ program_id?: string }>();
  const programId = params.program_id ? parseInt(params.program_id, 10) : null;

  const { isDarkMode } = useTheme();

  const [program, setProgram] = useState<ScholarshipProgram | null>(null);
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = async () => {
    if (!programId) {
      setError('No scholarship program selected.');
      setIsLoading(false);
      setIsLoadingDashboard(false);
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
    }

    try {
      const dash = await fetchCitizenDashboard();
      setDashboardData(dash);
    } catch (dashErr) {
      console.warn('[ScholarshipDetailsScreen] dashboard fetch error:', dashErr);
    } finally {
      setIsLoadingDashboard(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDetails();
  }, [programId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setIsLoadingDashboard(true);
    loadDetails();
  }, [programId]);

  const ctaState = computeApplyCTAState(program, dashboardData, isLoading, isLoadingDashboard);

  const handleApplyPress = () => {
    if (!programId) return;
    router.push({
      pathname: '/education/new-applicant/application' as any,
      params: { program_id: String(programId) },
    });
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
              setIsLoadingDashboard(true);
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

          {/* 6. BOTTOM CTA CONTAINER */}
          <View style={[styles.sectionCard, styles.applyContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            {ctaState.canApply ? (
              <TouchableOpacity
                style={[styles.activeApplyBtn, isDarkMode && { backgroundColor: '#FB923C' }]}
                onPress={handleApplyPress}
                activeOpacity={0.8}
              >
                <Text style={styles.activeApplyText}>
                  {ctaState.buttonText}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.disabledApplyBtn}
                disabled={true}
                activeOpacity={1}
              >
                {ctaState.isLoadingState ? (
                  <ActivityIndicator color="#64748B" size="small" />
                ) : (
                  <Text style={styles.disabledApplyText}>
                    {ctaState.buttonText}
                  </Text>
                )}
              </TouchableOpacity>
            )}

            {ctaState.noticeText ? (
              <Text style={[styles.applyNotice, isDarkMode && { color: '#94A3B8' }]}>
                {ctaState.noticeText}
              </Text>
            ) : null}
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
