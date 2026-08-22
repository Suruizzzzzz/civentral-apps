import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from './styles/DistributionSchedule.styles';

export function DistributionScheduleScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

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
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* PAGE HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && { color: '#F8FAFC' }]}>
          Distribution Schedule
        </Text>
      </View>

      {/* SKELETON LOADING OR CONTENT */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={120} borderRadius={16} />
        </View>
      ) : (
        <>
          {/* EMPTY STATE: NO DISTRIBUTION SCHEDULE AVAILABLE */}
          <View
            style={[
              styles.card,
              { paddingVertical: 32, alignItems: 'center' },
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View
              style={[
                styles.topIconCircle,
                { width: 56, height: 56, borderRadius: 28, marginBottom: 12 },
                isDarkMode && { backgroundColor: '#1E293B' },
              ]}
            >
              <IconSymbol
                name="calendar"
                size={28}
                color={isDarkMode ? '#94A3B8' : '#64748B'}
              />
            </View>

            <Text
              style={[
                styles.topHeaderTitle,
                { textAlign: 'center', marginBottom: 6, fontSize: 16 },
                isDarkMode && { color: '#F8FAFC' },
              ]}
            >
              No distribution schedule is currently available.
            </Text>

            <Text
              style={[
                styles.topHeaderSub,
                { textAlign: 'center', paddingHorizontal: 16, lineHeight: 18 },
                isDarkMode && { color: '#CBD5E1' },
              ]}
            >
              Your scholarship distribution details will appear here once a schedule has been published.
            </Text>
          </View>

          {/* GENERIC CLAIMING GUIDELINES CARD */}
          <View
            style={[
              styles.reqCard,
              isDarkMode && {
                backgroundColor: '#1C2541',
                borderColor: '#3A506B',
              },
            ]}
          >
            <View style={styles.reqHeaderRow}>
              <View
                style={[
                  styles.reqIconCircle,
                  isDarkMode && { backgroundColor: '#064E3B' },
                ]}
              >
                <IconSymbol
                  name="doc.text.fill"
                  size={20}
                  color={isDarkMode ? '#34D399' : '#16A34A'}
                />
              </View>
              <Text
                style={[
                  styles.reqTitle,
                  isDarkMode && { color: '#F8FAFC' },
                ]}
              >
                General Claiming Guidelines
              </Text>
            </View>

            <View style={styles.reqList}>
              <View style={styles.reqItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={15}
                  color={isDarkMode ? '#34D399' : '#16A34A'}
                />
                <Text
                  style={[
                    styles.reqText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  Valid Student ID or Citizen ID
                </Text>
              </View>
              <View style={styles.reqItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={15}
                  color={isDarkMode ? '#34D399' : '#16A34A'}
                />
                <Text
                  style={[
                    styles.reqText,
                    isDarkMode && { color: '#CBD5E1' },
                  ]}
                >
                  Official Certificate of Enrollment (COR)
                </Text>
              </View>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
