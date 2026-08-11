import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Badge } from '@/src/components/ui/Badge';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';

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
                style={styles.hubCardButton}
                onPress={() => handleCardPress('renewal')}
                activeOpacity={0.85}>
                <View style={styles.hubCardHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: '#DCFCE7' }]}>
                    <IconSymbol name="pencil" size={24} color="#15803D" />
                  </View>
                  <Badge label="FOR SCHOLARS" variant="success" />
                </View>
                <Text style={styles.hubCardTitle}>Grant Renewal</Text>
                <Text style={styles.hubCardSub}>
                  Existing scholars submit latest semester Certificate of Grades (COG) & Registration Form for grant renewal.
                </Text>
                <View style={styles.hubCardFooter}>
                  <Text style={[styles.hubCardActionText, { color: '#15803D' }]}>Submit Renewal</Text>
                  <IconSymbol name="chevron.right" size={14} color="#15803D" />
                </View>
              </TouchableOpacity>

              {/* BUTTON 4: DISTRIBUTION SCHEDULE */}
              <TouchableOpacity
                style={styles.hubCardButton}
                onPress={() => handleCardPress('distribution')}
                activeOpacity={0.85}>
                <View style={styles.hubCardHeader}>
                  <View style={[styles.hubIconCircle, { backgroundColor: '#FEF3C7' }]}>
                    <IconSymbol name="location.fill" size={24} color="#B45309" />
                  </View>
                  <Badge label="PAYOUT CALENDAR" variant="warning" />
                </View>
                <Text style={styles.hubCardTitle}>Distribution Schedule</Text>
                <Text style={styles.hubCardSub}>
                  View educational cash allowance payout dates per Barangay District, venues & claiming requirements.
                </Text>
                <View style={styles.hubCardFooter}>
                  <Text style={[styles.hubCardActionText, { color: '#B45309' }]}>View Schedule</Text>
                  <IconSymbol name="chevron.right" size={14} color="#B45309" />
                </View>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SECTION 1: SCHOLARSHIP DASHBOARD (BLANK CONTENT) */}
        {activeSection === 'dashboard' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={styles.backToMenuBtn}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIconRotated} />
              <Text style={styles.backToMenuText}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={styles.blankContentBox}>
              <Text style={styles.sectionHeadingText}>Scholarship Dashboard</Text>
              <Text style={styles.sectionSubheadingText}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 2: NEW APPLICANT (BLANK CONTENT) */}
        {activeSection === 'new' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={styles.backToMenuBtn}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIconRotated} />
              <Text style={styles.backToMenuText}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={styles.blankContentBox}>
              <Text style={styles.sectionHeadingText}>New Applicant</Text>
              <Text style={styles.sectionSubheadingText}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 3: GRANT RENEWAL (BLANK CONTENT) */}
        {activeSection === 'renewal' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={styles.backToMenuBtn}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIconRotated} />
              <Text style={styles.backToMenuText}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={styles.blankContentBox}>
              <Text style={styles.sectionHeadingText}>Grant Renewal</Text>
              <Text style={styles.sectionSubheadingText}>Content cleared for Education Department development.</Text>
            </View>
          </View>
        )}

        {/* SECTION 4: DISTRIBUTION SCHEDULE (BLANK CONTENT) */}
        {activeSection === 'distribution' && (
          <View style={styles.sectionStack}>
            <TouchableOpacity
              style={styles.backToMenuBtn}
              onPress={() => setActiveSection('menu')}
              activeOpacity={0.8}>
              <IconSymbol name="chevron.right" size={16} color="#176B87" style={styles.backIconRotated} />
              <Text style={styles.backToMenuText}>Back to Education Hub</Text>
            </TouchableOpacity>

            <View style={styles.blankContentBox}>
              <Text style={styles.sectionHeadingText}>Distribution Schedule</Text>
              <Text style={styles.sectionSubheadingText}>Content cleared for Education Department development.</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  /* 4 Main Button Hub Menu */
  menuStack: {
    gap: 12,
  },
  fourButtonsGrid: {
    gap: 12,
  },
  hubCardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hubCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hubIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  hubCardSub: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 14,
  },
  hubCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    gap: 4,
  },
  hubCardActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7E22CE',
  },

  /* Section Back Navigation & Blank Box */
  sectionStack: {
    gap: 14,
  },
  backToMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
    marginBottom: 4,
  },
  backIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  backToMenuText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B87',
  },
  blankContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeadingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionSubheadingText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  /* ── GUEST BANNER ── */
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  guestBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  /* ── AUTH GATE MODAL ── */
  authGateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 40, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  authGateCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 44,
    alignItems: 'center',
  },
  authGateIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authGateTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  authGateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  authGateBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  authGateBrandLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  authGateBrandText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  authGateActions: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  authGateLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#165B7E',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  authGateLoginText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authGateCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  authGateCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  authGateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authGateFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
