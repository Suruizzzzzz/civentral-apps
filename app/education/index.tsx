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
import { AuthService } from '@/src/services/auth-service';

export default function EducationIndexRoute() {
  const router = useRouter();
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
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Education & Scholarship Portal</Text>
          <Text style={styles.headerSubtitle}>
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

        {/* 4 Hub Cards */}
        <View style={styles.fourButtonsGrid}>

          {/* 1. Scholarship Dashboard */}
          <TouchableOpacity
            style={styles.hubCardButton}
            onPress={() => handleCardPress('/education/dashboard')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <IconSymbol name="book.closed.fill" size={24} color="#7E22CE" />
              </View>
              <Badge label="ACTIVE GRANT" variant="success" />
            </View>
            <Text style={styles.hubCardTitle}>Scholarship Dashboard</Text>
            <Text style={styles.hubCardSub}>
              View active grant status, maintaining GWA requirements, next payout date & city education bulletins.
            </Text>
            <View style={styles.hubCardFooter}>
              <Text style={styles.hubCardActionText}>Open Dashboard</Text>
              <IconSymbol name="chevron.right" size={14} color="#7E22CE" />
            </View>
          </TouchableOpacity>

          {/* 2. New Applicant */}
          <TouchableOpacity
            style={styles.hubCardButton}
            onPress={() => handleCardPress('/education/new-applicant')}
            activeOpacity={0.85}>
            <View style={styles.hubCardHeader}>
              <View style={[styles.hubIconCircle, { backgroundColor: '#E0F2FE' }]}>
                <IconSymbol name="doc.text.fill" size={24} color="#0284C7" />
              </View>
              <Badge label="APPLY ONLINE" variant="info" />
            </View>
            <Text style={styles.hubCardTitle}>New Applicant</Text>
            <Text style={styles.hubCardSub}>
              Submit new scholarship application for Tertiary College, Senior High School & SPED City Grants.
            </Text>
            <View style={styles.hubCardFooter}>
              <Text style={[styles.hubCardActionText, { color: '#0284C7' }]}>Start Application</Text>
              <IconSymbol name="chevron.right" size={14} color="#0284C7" />
            </View>
          </TouchableOpacity>

          {/* 3. Grant Renewal */}
          <TouchableOpacity
            style={styles.hubCardButton}
            onPress={() => handleCardPress('/education/renewal')}
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

          {/* 4. Distribution Schedule */}
          <TouchableOpacity
            style={styles.hubCardButton}
            onPress={() => handleCardPress('/education/distribution')}
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
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 110 },
  headerContainer: { marginBottom: 16 },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  headerSubtitle: { fontSize: 13, color: '#64748B', marginTop: 4, lineHeight: 18 },
  guestBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3C7',
    borderWidth: 1, borderColor: '#FDE68A', borderRadius: 10,
    paddingVertical: 10, paddingHorizontal: 14, marginBottom: 12,
  },
  guestBannerText: { fontSize: 12, fontWeight: '600', color: '#92400E' },
  fourButtonsGrid: { gap: 12 },
  hubCardButton: {
    backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#0F172A', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 6, elevation: 2,
  },
  hubCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  hubIconCircle: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  hubCardTitle: { fontSize: 16, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  hubCardSub: { fontSize: 12, color: '#475569', lineHeight: 17, marginBottom: 12 },
  hubCardFooter: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    borderTopWidth: 1, borderColor: '#F1F5F9', paddingTop: 10, gap: 4,
  },
  hubCardActionText: { fontSize: 12, fontWeight: '800', color: '#7E22CE' },

  /* AUTH GATE MODAL */
  authGateOverlay: { flex: 1, backgroundColor: 'rgba(10,20,40,0.65)', justifyContent: 'flex-end' },
  authGateCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    paddingHorizontal: 24, paddingTop: 28, paddingBottom: 44, alignItems: 'center',
  },
  authGateIconRing: {
    width: 76, height: 76, borderRadius: 38, backgroundColor: '#EFF6FF',
    borderWidth: 2, borderColor: '#BFDBFE', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  authGateTitle: { fontSize: 21, fontWeight: '800', color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  authGateSub: { fontSize: 13, color: '#64748B', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  authGateBrandRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginBottom: 20, gap: 8 },
  authGateBrandLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  authGateBrandText: { fontSize: 9, fontWeight: '800', color: '#94A3B8', letterSpacing: 1 },
  authGateActions: { width: '100%', gap: 10, marginBottom: 20 },
  authGateLoginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#165B7E', borderRadius: 14, paddingVertical: 15, gap: 8,
  },
  authGateLoginText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
  authGateCancelBtn: { alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
  authGateCancelText: { fontSize: 13, fontWeight: '600', color: '#94A3B8', textDecorationLine: 'underline' },
  authGateFooter: { flexDirection: 'row', alignItems: 'center' },
  authGateFooterText: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
});
