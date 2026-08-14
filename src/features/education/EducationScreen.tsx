import React, { useState } from 'react';
import {
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
import { styles } from './styles/EducationScreen.styles';

export type EducationSection = 'menu' | 'dashboard' | 'new' | 'renewal' | 'distribution';

export function EducationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{ isGuest?: string }>();

  const session = AuthService.getCurrentUser();
  const isGuestMode = params.isGuest === 'true' || (!session.email && !session.citizen_user_id);

  const [activeSection, setActiveSection] = useState<EducationSection>('menu');
  const [isAuthGateVisible, setIsAuthGateVisible] = useState(false);

  const handleCardPress = (section: EducationSection) => {
    if (isGuestMode) {
      setIsAuthGateVisible(true);
      return;
    }
    setActiveSection(section);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* MAIN 4-BUTTON EDUCATION HUB MENU */}
        {activeSection === 'menu' && (
          <View style={styles.menuStack}>
            {/* Header Title */}
            <View style={styles.headerContainer}>
              <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Education & Scholarship Portal</Text>
              <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                City Government of Caloocan educational grants, online applications, renewal & cash allowance distribution.
              </Text>
            </View>

            {/* Guest Warning Banner */}
            {isGuestMode && (
              <View style={styles.guestBanner}>
                <IconSymbol name="lock.fill" size={13} color="#B45309" />
                <Text style={styles.guestBannerText}>  Sign in to access scholarship services.</Text>
              </View>
            )}

            {/* THE 4 MAIN BUTTON CARDS */}
            <View style={styles.fourButtonsGrid}>
              {/* BUTTON 1: SCHOLARSHIP DASHBOARD */}
              <TouchableOpacity
                style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
                onPress={() => handleCardPress('dashboard')}
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
                <View style={styles.hubCardFooter}>
                  <Text style={[styles.hubCardActionText, isDarkMode && { color: '#C084FC' }]}>Open Dashboard</Text>
                  <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#C084FC' : '#7E22CE'} />
                </View>
              </TouchableOpacity>

              {/* BUTTON 2: NEW APPLICANT */}
              <TouchableOpacity
                style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
                onPress={() => handleCardPress('new')}
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
                <View style={styles.hubCardFooter}>
                  <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#38BDF8' : '#0284C7' }]}>Start Application</Text>
                  <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                </View>
              </TouchableOpacity>

              {/* BUTTON 3: GRANT RENEWAL */}
              <TouchableOpacity
                style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
                onPress={() => handleCardPress('renewal')}
                activeOpacity={0.85}>
                <View style={styles.hubCardHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#052E16' : '#DCFCE7' }]}>
                    <IconSymbol name="pencil" size={24} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                  </View>
                  <Badge label="FOR SCHOLARS" variant="success" />
                </View>
                <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>Grant Renewal</Text>
                <Text style={[styles.hubCardSub, isDarkMode && { color: '#CBD5E1' }]}>
                  Existing scholars submit latest semester Certificate of Grades (COG) & Registration Form for grant renewal.
                </Text>
                <View style={[styles.hubCardFooter, isDarkMode && { borderColor: '#293548' }]}>
                  <Text style={[styles.hubCardActionText, { color: isDarkMode ? '#4ADE80' : '#15803D' }]}>Submit Renewal</Text>
                  <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#4ADE80' : '#15803D'} />
                </View>
              </TouchableOpacity>

              {/* BUTTON 4: DISTRIBUTION SCHEDULE */}
              <TouchableOpacity
                style={[styles.hubCardButton, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
                onPress={() => handleCardPress('distribution')}
                activeOpacity={0.85}>
                <View style={styles.hubCardHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: isDarkMode ? '#451A03' : '#FEF3C7' }]}>
                    <IconSymbol name="location.fill" size={24} color={isDarkMode ? '#FBBF24' : '#B45309'} />
                  </View>
                  <Badge label="PAYOUT CALENDAR" variant="warning" />
                </View>
                <Text style={[styles.hubCardTitle, isDarkMode && { color: '#F8FAFC' }]}>Distribution Schedule</Text>
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
        )}

        {/* SECTION 1: SCHOLARSHIP DASHBOARD (BLANK CONTENT) */}
        {activeSection === 'dashboard' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={[styles.backToMenuBtn, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#38BDF8' : '#176B87'} style={styles.backIconRotated} />
              <Text style={[styles.backToMenuText, isDarkMode && { color: '#38BDF8' }]}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={[styles.blankContentBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
              <Text style={[styles.sectionHeadingText, isDarkMode && { color: '#F8FAFC' }]}>Scholarship Dashboard</Text>
              <Text style={[styles.sectionSubheadingText, isDarkMode && { color: '#94A3B8' }]}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 2: NEW APPLICANT (BLANK CONTENT) */}
        {activeSection === 'new' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={[styles.backToMenuBtn, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#38BDF8' : '#176B87'} style={styles.backIconRotated} />
              <Text style={[styles.backToMenuText, isDarkMode && { color: '#38BDF8' }]}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={[styles.blankContentBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
              <Text style={[styles.sectionHeadingText, isDarkMode && { color: '#F8FAFC' }]}>New Applicant</Text>
              <Text style={[styles.sectionSubheadingText, isDarkMode && { color: '#94A3B8' }]}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 3: GRANT RENEWAL (BLANK CONTENT) */}
        {activeSection === 'renewal' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={[styles.backToMenuBtn, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#38BDF8' : '#176B87'} style={styles.backIconRotated} />
              <Text style={[styles.backToMenuText, isDarkMode && { color: '#38BDF8' }]}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={[styles.blankContentBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
              <Text style={[styles.sectionHeadingText, isDarkMode && { color: '#F8FAFC' }]}>Grant Renewal</Text>
              <Text style={[styles.sectionSubheadingText, isDarkMode && { color: '#94A3B8' }]}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 4: DISTRIBUTION SCHEDULE (BLANK CONTENT) */}
        {activeSection === 'distribution' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={[styles.backToMenuBtn, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color={isDarkMode ? '#38BDF8' : '#176B87'} style={styles.backIconRotated} />
              <Text style={[styles.backToMenuText, isDarkMode && { color: '#38BDF8' }]}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={[styles.blankContentBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
              <Text style={[styles.sectionHeadingText, isDarkMode && { color: '#F8FAFC' }]}>Distribution Schedule</Text>
              <Text style={[styles.sectionSubheadingText, isDarkMode && { color: '#94A3B8' }]}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

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
