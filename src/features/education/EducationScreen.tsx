import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from './EducationScreen.styles';

export function EducationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuStack}>
          {/* Header Title */}
          <View style={styles.headerContainer}>
            <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Education & Scholarship Portal
            </Text>
            <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
              City Government educational grants, online applications, renewal & cash allowance distribution.
            </Text>
          </View>

          {/* THE 4 MAIN BUTTON CARDS */}
          <View style={styles.fourButtonsGrid}>
            {/* BUTTON 1: SCHOLARSHIP DASHBOARD */}
            <TouchableOpacity
              style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => router.push('/education/dashboard' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#3B0764' : '#F3E8FF' }]}>
                  <IconSymbol name="book.closed.fill" size={24} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
                </View>
                <Badge label="ACTIVE GRANT" variant="success" />
              </View>
              <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Scholarship Dashboard
              </Text>
              <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
                View active grant status, maintaining GWA requirements, next payout date & city education bulletins.
              </Text>
              <View style={styles.hubCardFooter}>
                <Text style={[styles.hubCardActionText, isDarkMode && { color: '#C084FC' }]}>Open Dashboard</Text>
                <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
              </View>
            </TouchableOpacity>

            {/* BUTTON 2: NEW APPLICANT */}
            <TouchableOpacity
              style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => router.push('/education/new-applicant' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#0F2942' : '#E0F2FE' }]}>
                  <IconSymbol name="doc.text.fill" size={24} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                </View>
                <Badge label="APPLY ONLINE" variant="info" />
              </View>
              <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                New Applicant
              </Text>
              <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
                Submit new scholarship application for Tertiary College, Senior High School & SPED City Grants.
              </Text>
              <View style={styles.hubCardFooter}>
                <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#38BDF8' : '#0284C7' }]}>Start Application</Text>
                <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
              </View>
            </TouchableOpacity>

            {/* BUTTON 3: SCHOLARSHIP RENEWAL */}
            <TouchableOpacity
              style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => router.push('/education/renewal' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#052E16' : '#DCFCE7' }]}>
                  <IconSymbol name="pencil" size={24} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                </View>
                <Badge label="FOR SCHOLARS" variant="success" />
              </View>
              <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Scholarship Renewal
              </Text>
              <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
                Existing scholars can submit renewal requirements for the next academic period.
              </Text>
              <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#293548' }]}>
                <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#4ADE80' : '#15803D' }]}>Submit Renewal</Text>
                <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#4ADE80' : '#15803D'} />
              </View>
            </TouchableOpacity>

            {/* BUTTON 4: DISTRIBUTION SCHEDULE */}
            <TouchableOpacity
              style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => router.push('/education/distribution' as any)}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
                  <IconSymbol name="location.fill" size={24} color={isDarkMode ? '#FBBF24' : '#B45309'} />
                </View>
                <Badge label="PAYOUT CALENDAR" variant="warning" />
              </View>
              <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Distribution Schedule
              </Text>
              <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
                View educational cash allowance payout dates per Barangay District, venues & claiming requirements.
              </Text>
              <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#293548' }]}>
                <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#FBBF24' : '#B45309' }]}>View Schedule</Text>
                <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#FBBF24' : '#B45309'} />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
