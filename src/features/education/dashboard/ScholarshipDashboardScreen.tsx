import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

const scholarshipBg = require("@/assets/images/scholarship-bg.png");

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { CitizenDashboardData, fetchCitizenDashboard } from './api/scholarshipDashboardApi';
import { styles } from './styles/ScholarshipDashboard.styles';

export function ScholarshipDashboardScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<CitizenDashboardData | null>(null);

  const loadDashboard = async () => {
    try {
      setError(null);
      const data = await fetchCitizenDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('[ScholarshipDashboardScreen] load error:', err);
      setError(err?.message || 'Unable to load scholarship information.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadDashboard();
  }, []);

  const state = dashboardData?.state;
  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const academicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;
  const processTimeline = dashboardData?.process_timeline || [];
  const grant = dashboardData?.grant;
  const latestUpdate = dashboardData?.latest_update;

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
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* PAGE HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
          Scholarship Dashboard
        </Text>
      </View>

      {/* ERROR STATE */}
      {error ? (
        <View style={[styles.card, { borderColor: '#EF4444', borderWidth: 1, padding: 16, marginBottom: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            Unable to load scholarship information.
          </Text>
          <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 13, marginBottom: 12 }}>
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#7E22CE',
              paddingVertical: 10,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              setIsLoading(true);
              loadDashboard();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600', fontSize: 14 }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LOADING STATE */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={200} borderRadius={20} />
          <Skeleton height={160} borderRadius={20} />
          <Skeleton height={100} borderRadius={20} />
        </View>
      ) : state === 'NO_SCHOLARSHIP' ? (
        /* NO SCHOLARSHIP STATE (ORIGINAL EMPTY CARD) */
        <View style={[styles.emptyCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={[styles.emptyIconCircle, isDarkMode && { backgroundColor: '#3B0764' }]}>
            <IconSymbol name="book.closed.fill" size={32} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
          </View>
          <View style={styles.emptyBadge}>
            <Text style={styles.emptyBadgeText}>CITIZEN PORTAL</Text>
          </View>
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Active Scholarship Found
          </Text>
          <Text style={[styles.emptySub, isDarkMode && { color: '#CBD5E1' }]}>
            Your scholarship details and payout status will appear here once you become an approved scholar or submit a scholarship application.
          </Text>
          <View style={styles.emptyActions}>
            <TouchableOpacity
              style={styles.emptyPrimaryBtn}
              onPress={() => router.push('/education/new-applicant/browse-scholarships' as any)}
              activeOpacity={0.8}
            >
              <Text style={styles.emptyPrimaryBtnText}>Browse Available Scholarships</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* POPULATED DASHBOARD CONTENT WITH ORIGINAL ARTWORK & STYLES */
        <View style={styles.cardsGrid}>
          {/* TOP HERO SCHOLARSHIP CARD */}
          <View
            style={[
              styles.heroCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={styles.heroTopSection}>
              <View style={styles.heroLeftContent}>
                <View style={styles.heroHeaderRow}>
                  <View
                    style={[
                      styles.iconCircle,
                      isDarkMode && { backgroundColor: "#3B0764" },
                    ]}
                  >
                    <IconSymbol
                      name="book.closed.fill"
                      size={20}
                      color={isDarkMode ? "#C084FC" : "#7E22CE"}
                    />
                  </View>

                  <View
                    style={[
                      styles.activeBadge,
                      isDarkMode && { backgroundColor: "#064E3B" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.activeBadgeText,
                        isDarkMode && { color: "#34D399" },
                      ]}
                    >
                      {scholar ? (scholar.scholar_status?.toUpperCase() || 'ACTIVE SCHOLAR') : 'APPLICATION IN PROGRESS'}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.heroTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {scholarship?.program_name || 'Scholarship Program'}
                </Text>
                <Text
                  style={[
                    styles.heroSubtitle,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {scholarship?.category_name || 'City Government Educational Program'}
                </Text>
              </View>

              {/* Minimalist Artwork Container */}
              <View
                style={[
                  styles.heroArtworkBox,
                  isDarkMode && { backgroundColor: "#2D1557" },
                ]}
              >
                <Image
                  source={scholarshipBg}
                  style={styles.heroArtwork}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View
              style={[
                styles.heroDivider,
                isDarkMode && { backgroundColor: "#293548" },
              ]}
            />

            {/* DETAILS ROW: ACADEMIC YEAR, SEMESTER, SCHOLAR ID */}
            <View
              style={[
                styles.heroBottomRow,
                isDarkMode && { backgroundColor: "#1C2541" },
              ]}
            >
              <View style={styles.heroCol}>
                <Text style={styles.heroColLabel}>Academic Year</Text>
                <Text
                  style={[
                    styles.heroColValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                  numberOfLines={1}
                >
                  {academicPeriod?.academic_year || '—'}
                </Text>
              </View>

              <View
                style={[
                  styles.heroColDivider,
                  isDarkMode && { backgroundColor: "#293548" },
                ]}
              />

              <View style={styles.heroCol}>
                <Text style={styles.heroColLabel}>Semester</Text>
                <Text
                  style={[
                    styles.heroColValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                  numberOfLines={1}
                >
                  {academicPeriod?.term || '—'}
                </Text>
              </View>

              <View
                style={[
                  styles.heroColDivider,
                  isDarkMode && { backgroundColor: "#293548" },
                ]}
              />

              <View style={styles.heroColScholarId}>
                <Text style={styles.heroColLabel}>{scholar ? 'Scholar ID' : 'App Code'}</Text>
                <Text
                  style={[
                    styles.scholarIdText,
                    isDarkMode && { color: "#C084FC" },
                  ]}
                  numberOfLines={1}
                >
                  {scholar?.scholar_code || application?.application_code || '—'}
                </Text>
              </View>
            </View>
          </View>

          {/* PROCESS STATUS TIMELINE */}
          {processTimeline.length > 0 && (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.heroTitle,
                  { fontSize: 16, marginBottom: 12 },
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Application & Grant Timeline
              </Text>

              <View style={styles.timelineContainer}>
                {processTimeline.map((item, index) => {
                  const isLast = index === processTimeline.length - 1;
                  return (
                    <View key={item.key || index} style={styles.timelineItem}>
                      <View style={styles.timelineLeft}>
                        <View
                          style={[
                            styles.timelineIconBox,
                            {
                              backgroundColor: item.is_completed
                                ? "#DCFCE7"
                                : item.is_current
                                ? "#FEF3C7"
                                : "#F1F5F9",
                            },
                          ]}
                        >
                          <IconSymbol
                            name={item.is_completed ? "checkmark.circle.fill" : item.is_current ? "clock.fill" : "circle"}
                            size={14}
                            color={item.is_completed ? "#16A34A" : item.is_current ? "#D97706" : "#94A3B8"}
                          />
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineLine,
                              item.is_completed && styles.timelineLineCompleted,
                            ]}
                          />
                        )}
                      </View>

                      <View style={styles.timelineContent}>
                        <Text
                          style={[
                            styles.timelineTitle,
                            isDarkMode && { color: "#F8FAFC" },
                          ]}
                        >
                          {item.title}
                        </Text>
                        <Text
                          style={[
                            styles.timelineSub,
                            item.is_current
                              ? styles.timelineSubActive
                              : item.is_completed
                              ? { color: "#16A34A" }
                              : styles.timelineSubPending,
                          ]}
                        >
                          {item.date
                            ? new Date(item.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })
                            : item.is_completed
                            ? 'Completed'
                            : 'Pending'}
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* CURRENT GRANT CARD */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <Text style={styles.sectionLabel}>CURRENT GRANT</Text>
            <View style={styles.grantHeaderRow}>
              <View
                style={[
                  styles.grantIconCircle,
                  isDarkMode && { backgroundColor: "#3B0764" },
                ]}
              >
                <IconSymbol
                  name="banknote.fill"
                  size={22}
                  color={isDarkMode ? "#C084FC" : "#7E22CE"}
                />
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.grantAmountRow}>
                  <Text
                    style={[
                      styles.grantAmountText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {grant?.amount ? (grant.amount_formatted || `₱${grant.amount.toLocaleString()}`) : '₱0'}
                  </Text>
                </View>
                {grant?.expected_release_date ? (
                  <Text style={styles.grantReleaseText}>
                    Expected Release:{" "}
                    <Text
                      style={[
                        styles.grantReleaseValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {grant.expected_release_date}
                    </Text>
                  </Text>
                ) : (
                  <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', fontSize: 12, marginTop: 2 }}>
                    No current scholarship grant information available.
                  </Text>
                )}
              </View>
            </View>
          </View>

          {/* LATEST UPDATE CARD */}
          {latestUpdate && (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text style={styles.sectionLabel}>LATEST UPDATES</Text>
              <View style={styles.updateRow}>
                <View
                  style={[
                    styles.updateIconCircle,
                    isDarkMode && { backgroundColor: "#3B0764" },
                  ]}
                >
                  <IconSymbol
                    name="bell.fill"
                    size={20}
                    color={isDarkMode ? "#C084FC" : "#7E22CE"}
                  />
                </View>
                <View style={styles.updateContent}>
                  <Text
                    style={[
                      styles.updateTitle,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {latestUpdate.title}
                  </Text>
                  {latestUpdate.timestamp && (
                    <View style={styles.updateFooter}>
                      <IconSymbol name="clock.fill" size={12} color="#94A3B8" />
                      <Text style={styles.updateDateText}>
                        {new Date(latestUpdate.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
