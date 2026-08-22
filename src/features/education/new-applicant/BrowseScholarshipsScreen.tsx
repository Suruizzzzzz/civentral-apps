import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { fetchScholarshipCategories, fetchScholarshipPrograms, ScholarshipCategory, ScholarshipProgram } from './api/ScholarshipProgramApi';
import { styles } from './styles/BrowseScholarships.styles';

export function BrowseScholarshipsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [categories, setCategories] = useState<ScholarshipCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (catId: number | null = null) => {
    try {
      setIsLoading(true);
      const [catList, progList] = await Promise.all([
        fetchScholarshipCategories(),
        fetchScholarshipPrograms(catId || undefined),
      ]);
      setCategories(catList);
      setPrograms(progList);
    } catch (err) {
      console.error('[BrowseScholarshipsScreen] fetch error:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData(selectedCategoryId);
  }, [selectedCategoryId]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData(selectedCategoryId);
  }, [selectedCategoryId]);

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

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
          Browse Scholarships
        </Text>
        <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
          Find municipal scholarship opportunities applicable to your current education level.
        </Text>
      </View>

      {/* CATEGORY FILTER CHIPS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, marginBottom: 20 }}
      >
        <TouchableOpacity
          style={[
            styles.categoryBadge,
            selectedCategoryId === null && { backgroundColor: '#2563EB' },
            isDarkMode && selectedCategoryId !== null && { backgroundColor: '#334155' },
          ]}
          onPress={() => setSelectedCategoryId(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategoryId === null && { color: '#FFFFFF' },
              isDarkMode && selectedCategoryId !== null && { color: '#94A3B8' },
            ]}
          >
            All Categories
          </Text>
        </TouchableOpacity>

        {categories.map((cat) => {
          const isActive = selectedCategoryId === cat.category_id;
          return (
            <TouchableOpacity
              key={cat.category_id}
              style={[
                styles.categoryBadge,
                isActive && { backgroundColor: '#2563EB' },
                isDarkMode && !isActive && { backgroundColor: '#334155' },
              ]}
              onPress={() => setSelectedCategoryId(cat.category_id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isActive && { color: '#FFFFFF' },
                  isDarkMode && !isActive && { color: '#94A3B8' },
                ]}
              >
                {cat.category_name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* PROGRAM CARDS LIST */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={140} borderRadius={16} />
        </View>
      ) : programs.length === 0 ? (
        <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="magnifyingglass" size={40} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Scholarships Found
          </Text>
          <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
            There are currently no programs matching your filter criteria.
          </Text>
        </View>
      ) : (
        programs.map((program) => {
          const period = program.application_period || (program.application_periods && program.application_periods[0]);
          const statusLabel = period?.status || (program.program_status === 'Active' ? 'Open' : 'Upcoming');
          const isOpen = statusLabel === 'Open';

          return (
            <View key={program.program_id} style={[styles.card, { marginBottom: 14 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
              <View style={styles.cardTop}>
                <View style={styles.titleArea}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>
                      {program.category_name || (program as any).category?.category_name || 'General'}
                    </Text>
                  </View>
                  <Text style={[styles.programTitle, isDarkMode && { color: '#F8FAFC' }]}>
                    {program.program_name}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: isOpen ? '#DCFCE7' : '#F1F5F9' }]}>
                  <Text style={[styles.statusText, { color: isOpen ? '#15803D' : '#475569' }]}>
                    {statusLabel}
                  </Text>
                </View>
              </View>

              {program.description ? (
                <Text
                  style={[styles.description, isDarkMode && { color: '#94A3B8' }]}
                  numberOfLines={2}
                >
                  {program.description}
                </Text>
              ) : null}

              <TouchableOpacity
                style={[styles.actionButton, styles.applyButton]}
                onPress={() => router.push({
                  pathname: '/education/new-applicant/scholarship-details' as any,
                  params: { program_id: String(program.program_id) }
                })}
                activeOpacity={0.7}
              >
                <Text style={[styles.actionText, { color: '#FFFFFF' }]}>View Program Details</Text>
                <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
