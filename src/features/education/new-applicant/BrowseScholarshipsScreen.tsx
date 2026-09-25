import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { fetchScholarshipCategories, fetchScholarshipPrograms, ScholarshipCategory, ScholarshipProgram } from './api/ScholarshipProgramApi';
import { styles } from './styles/BrowseScholarships.styles';

interface CategoryPill {
  id: string;
  label: string;
}

const BASE_CATEGORY_PILLS: CategoryPill[] = [
  { id: 'All', label: 'All Categories' },
  { id: 'Senior High', label: 'Senior High' },
  { id: 'Tertiary', label: 'Tertiary' },
  { id: 'Continuing Education / Vocational', label: 'Continuing Education / Vocational' },
];

export function BrowseScholarshipsScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [categories, setCategories] = useState<ScholarshipCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [programs, setPrograms] = useState<ScholarshipProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [catList, progList] = await Promise.all([
        fetchScholarshipCategories(),
        fetchScholarshipPrograms(),
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
    loadData();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  const handleSelectCategory = (catId: string) => {
    Haptics.selectionAsync();
    setSelectedCategory(catId);
  };

  const filterPills = useMemo<CategoryPill[]>(() => {
    const pills: CategoryPill[] = [...BASE_CATEGORY_PILLS];
    const existingIds = new Set(
      pills.map((p) => p.id.toLowerCase().replace(/[^a-z0-9]/g, ''))
    );

    categories.forEach((cat) => {
      const normalized = (cat.category_name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normalized && !existingIds.has(normalized)) {
        existingIds.add(normalized);
        pills.push({
          id: cat.category_name,
          label: cat.category_name,
        });
      }
    });

    return pills;
  }, [categories]);

  const filteredPrograms = useMemo(() => {
    if (selectedCategory === 'All') {
      return programs;
    }
    const target = selectedCategory.toLowerCase();

    return programs.filter((program) => {
      const categoryName = (program.category_name || (program as any).category?.category_name || '').toLowerCase();
      const categoryCode = ((program as any).category?.category_code || '').toLowerCase();
      const eduLevel = ((program as any).education_level || (program as any).level || '').toLowerCase();
      const programName = (program.program_name || '').toLowerCase();

      if (target.includes('senior high')) {
        return (
          categoryName.includes('senior high') ||
          categoryCode.includes('senior_high') ||
          eduLevel.includes('senior high') ||
          programName.includes('senior high') ||
          programName.includes('shs')
        );
      }

      if (target.includes('tertiary')) {
        return (
          categoryName.includes('tertiary') ||
          categoryCode.includes('tertiary') ||
          eduLevel.includes('tertiary') ||
          programName.includes('tertiary') ||
          categoryName.includes('college')
        );
      }

      if (target.includes('vocational') || target.includes('continuing')) {
        return (
          categoryName.includes('vocational') ||
          categoryName.includes('continuing') ||
          categoryCode.includes('vocational') ||
          categoryCode.includes('cont_ed') ||
          programName.includes('vocational') ||
          programName.includes('continuing')
        );
      }

      return (
        categoryName.includes(target) ||
        categoryCode.includes(target) ||
        eduLevel.includes(target) ||
        programName.includes(target)
      );
    });
  }, [programs, selectedCategory]);

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
          tintColor={isDarkMode ? '#38BDF8' : '#0284C7'}
          colors={['#0284C7']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
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
        <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
          Back to Education Hub
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

      {/* HORIZONTAL CATEGORY PILL FILTER */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterPillsContainer}
      >
        {filterPills.map((pill) => {
          const isActive = selectedCategory === pill.id;
          return (
            <TouchableOpacity
              key={pill.id}
              style={[
                styles.filterPill,
                isActive ? styles.filterPillActive : styles.filterPillInactive,
                isDarkMode && !isActive && styles.filterPillInactiveDark,
              ]}
              onPress={() => handleSelectCategory(pill.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterPillText,
                  isActive ? styles.filterPillTextActive : styles.filterPillTextInactive,
                  isDarkMode && !isActive && styles.filterPillTextInactiveDark,
                ]}
              >
                {pill.label}
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
      ) : filteredPrograms.length === 0 ? (
        <View style={[styles.emptyContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <IconSymbol name="magnifyingglass" size={40} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          <Text style={[styles.emptyTitle, isDarkMode && { color: '#F8FAFC' }]}>
            No Scholarships Found
          </Text>
          <Text style={[styles.emptyText, isDarkMode && { color: '#94A3B8' }]}>
            {selectedCategory === 'All'
              ? 'There are currently no programs matching your filter criteria.'
              : 'No scholarship programs available for this category.'}
          </Text>
        </View>
      ) : (
        filteredPrograms.map((program) => {
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
