import React, { useState } from 'react';
import {
  ImageBackground,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Badge } from '@/src/components/ui/Badge';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';
import { styles } from '@/src/features/education/styles/index.styles';

export default function EducationIndexRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{ isGuest?: string }>();

  const session = AuthService.getCurrentUser();
  const isGuestMode = params.isGuest === 'true' || (!session.email && !session.citizen_user_id);

  const [isAuthGateVisible, setIsAuthGateVisible] = useState(false);

  const handleCardPress = (path: string) => {
    if (isGuestMode) {
      setIsAuthGateVisible(true);
      return;
    }
    router.push(path as any);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Circle Back to Services Button */}
        <TouchableOpacity
          style={styles.backToServicesRow}
          onPress={() => router.push('/(tabs)/services' as any)}
          activeOpacity={0.75}>
          <View style={[styles.backIconCircle, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <IconSymbol name="chevron.left" size={18} color={isDarkMode ? '#38BDF8' : '#176B87'} />
          </View>
          <Text style={[styles.backToServicesText, isDarkMode && { color: '#F8FAFC' }]}>
            Back to Services
          </Text>
        </TouchableOpacity>

        {/* Guest Warning Banner */}
        {isGuestMode && (
          <View style={styles.guestBanner}>
            <IconSymbol name="lock.fill" size={13} color="#B45309" />
            <Text style={styles.guestBannerText}>  Sign in to access scholarship services.</Text>
          </View>
        )}

        {/* 4 Hub Cards */}
        <View style={styles.fourButtonsGrid}>

          {/* 1. Scholarship Dashboard */}
          <TouchableOpacity
            style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => handleCardPress('/education/dashboard')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#3B0764' : '#F3E8FF' }]}>
                <IconSymbol name="book.closed.fill" size={24} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
              </View>
              <Badge label="ACTIVE GRANT" variant="success" />
            </View>
            <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>Scholarship Dashboard</Text>
            <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
              View active grant status, maintaining GWA requirements, next payout date & city education bulletins.
            </Text>
            <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#3A506B' }]}>
              <Text style={[styles.hubCardActionText, isDarkMode && { color: '#C084FC' }]}>Open Dashboard</Text>
              <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
            </View>
          </TouchableOpacity>

          {/* 2. New Applicant */}
          <TouchableOpacity
            style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => handleCardPress('/education/new-applicant')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#0F2942' : '#E0F2FE' }]}>
                <IconSymbol name="doc.text.fill" size={24} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
              </View>
              <Badge label="APPLY ONLINE" variant="info" />
            </View>
            <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>New Applicant</Text>
            <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
              Submit new scholarship application for Tertiary College, Senior High School & SPED City Grants.
            </Text>
            <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#3A506B' }]}>
              <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#38BDF8' : '#0284C7' }]}>Start Application</Text>
              <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
            </View>
          </TouchableOpacity>

          {/* 3. Grant Renewal */}
          <TouchableOpacity
            style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => handleCardPress('/education/renewal')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#052818' : '#DCFCE7' }]}>
                <IconSymbol name="pencil" size={24} color={isDarkMode ? '#4ADE80' : '#15803D'} />
              </View>
              <Badge label="FOR SCHOLARS" variant="success" />
            </View>
            <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>Grant Renewal</Text>
            <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
              Existing scholars submit latest semester Certificate of Grades (COG) & Registration Form for grant renewal.
            </Text>
            <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#3A506B' }]}>
              <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#4ADE80' : '#15803D' }]}>Submit Renewal</Text>
              <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#4ADE80' : '#15803D'} />
            </View>
          </TouchableOpacity>

          {/* 4. Distribution Schedule */}
          <TouchableOpacity
            style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => handleCardPress('/education/distribution')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#291D07' : '#FEF3C7' }]}>
                <IconSymbol name="location.fill" size={24} color={isDarkMode ? '#FBBF24' : '#B45309'} />
              </View>
              <Badge label="PAYOUT CALENDAR" variant="warning" />
            </View>
            <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>Distribution Schedule</Text>
            <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
              View educational cash allowance payout dates per Barangay District, venues & claiming requirements.
            </Text>
            <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#3A506B' }]}>
              <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#FBBF24' : '#B45309' }]}>View Schedule</Text>
              <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#FBBF24' : '#B45309'} />
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AUTH GATE MODAL */}
      <Modal
        visible={isAuthGateVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAuthGateVisible(false)}>
        <View style={styles.authGateOverlay}>
          <View style={styles.authGateCard}>
            <View style={styles.authGateIconRing}>
              <IconSymbol name="lock.shield.fill" size={34} color="#165B7E" />
            </View>
            <Text style={styles.authGateTitle}>Sign In Required</Text>
            <Text style={styles.authGateSub}>
              Scholarship services are only available to registered Caloocan City citizens. Please sign in to continue.
            </Text>
            <View style={styles.authGateBrandRow}>
              <View style={styles.authGateBrandLine} />
              <Text style={styles.authGateBrandText}>CALOOCAN CITY GOVERNMENT</Text>
              <View style={styles.authGateBrandLine} />
            </View>
            <View style={styles.authGateActions}>
              <TouchableOpacity
                style={styles.authGateLoginBtn}
                onPress={() => {
                  setIsAuthGateVisible(false);
                  router.replace('/(auth)/login' as any);
                }}
                activeOpacity={0.88}>
                <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
                <Text style={styles.authGateLoginText}>Sign In to My Account</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.authGateCancelBtn}
                onPress={() => setIsAuthGateVisible(false)}
                activeOpacity={0.7}>
                <Text style={styles.authGateCancelText}>Continue Browsing as Guest</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.authGateFooter}>
              <IconSymbol name="shield.fill" size={11} color="#94A3B8" />
              <Text style={styles.authGateFooterText}>  Protected by Caloocan City E-Governance Portal</Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
