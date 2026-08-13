import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Badge } from '@/src/components/ui/Badge';
import { useTheme } from '@/src/context/ThemeContext';
import { AuthService } from '@/src/services/auth-service';

export interface ServiceCatalogItem {
  id: string;
  title: string;
  category: 'EDUCATION' | 'BARANGAY' | 'BUSINESS' | 'TREASURY' | 'HEALTH' | 'SOCIAL';
  description: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  badgeLabel: string;
  badgeVariant: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  route: string;
}

const SERVICES_CATALOG: ServiceCatalogItem[] = [
  {
    id: 'SVC-EDU',
    title: 'Education & Scholarship Portal',
    category: 'EDUCATION',
    description: 'City College grants, SHEAP scholarships, new application, renewal & cash allowance distribution schedule.',
    iconName: 'book.closed.fill',
    iconBg: '#F3E8FF',
    iconColor: '#7E22CE',
    badgeLabel: '4 SUB-SERVICES',
    badgeVariant: 'success',
    route: '/education',
  },
  {
    id: 'SVC-BRG',
    title: 'Barangay Clearance & Citizen ID',
    category: 'BARANGAY',
    description: 'Apply for Barangay Clearance, Residency Certification & Official Caloocan Digital Citizen Pass.',
    iconName: 'person.text.rectangle.fill',
    iconBg: '#E0F2FE',
    iconColor: '#0284C7',
    badgeLabel: 'POPULAR',
    badgeVariant: 'info',
    route: '/(tabs)/tracker',
  },
  {
    id: 'SVC-BPLO',
    title: 'Business Permit & E-Clearance',
    category: 'BUSINESS',
    description: 'New business registration, annual permit renewal, BPLO inspection & e-tax clearances.',
    iconName: 'briefcase.fill',
    iconBg: '#E0E7FF',
    iconColor: '#4338CA',
    badgeLabel: 'FAST-TRACK',
    badgeVariant: 'info',
    route: '/(tabs)/tracker',
  },
  {
    id: 'SVC-RPT',
    title: 'Real Property Tax (RPT)',
    category: 'TREASURY',
    description: 'Real property assessment, online RPT bill computation, official tax declaration & online payments.',
    iconName: 'house.fill',
    iconBg: '#DCFCE7',
    iconColor: '#15803D',
    badgeLabel: 'ONLINE PAY',
    badgeVariant: 'success',
    route: '/(tabs)/tracker',
  },
  {
    id: 'SVC-HLT',
    title: 'Health & Medical Clinic Services',
    category: 'HEALTH',
    description: 'Barangay health center appointments, free medicine distribution, dental caravan & vaccination cards.',
    iconName: 'cross.case.fill',
    iconBg: '#FEE2E2',
    iconColor: '#B91C1C',
    badgeLabel: 'FREE CLINIC',
    badgeVariant: 'danger',
    route: '/(tabs)/tracker',
  },
  {
    id: 'SVC-SWD',
    title: 'Social Welfare & Relief Assistance',
    category: 'SOCIAL',
    description: 'Senior citizen pension, PWD ID registration, emergency relief aid & solo parent grants.',
    iconName: 'heart.text.square.fill',
    iconBg: '#FEF3C7',
    iconColor: '#B45309',
    badgeLabel: 'CIVIC AID',
    badgeVariant: 'warning',
    route: '/(tabs)/tracker',
  },
];

export function ServicesCatalogScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{ isGuest?: string }>();

  // Detect guest mode via params OR session
  const session = AuthService.getCurrentUser();
  const isGuestMode = params.isGuest === 'true' || (!session.email && !session.citizen_user_id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'EDUCATION' | 'BARANGAY' | 'BUSINESS' | 'TREASURY'>('ALL');
  const [isAuthGateVisible, setIsAuthGateVisible] = useState(false);

  const filteredServices = SERVICES_CATALOG.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesQuery =
      searchQuery.trim() === '' ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleServicePress = (route: string) => {
    if (isGuestMode) {
      setIsAuthGateVisible(true);
      return;
    }
    router.push(route as any);
  };

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Header Title */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>Municipal Services Directory</Text>
          <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
            Access 50+ official Caloocan City government e-services, permits, education grants & digital clearance.
          </Text>
        </View>

        {/* Search Bar */}
        <View style={[styles.searchBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <IconSymbol name="magnifyingglass" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
          <TextInput
            style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
            placeholder="Search municipal service, scholarship or permit..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {(['ALL', 'EDUCATION', 'BARANGAY', 'BUSINESS', 'TREASURY'] as const).map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
                selectedCategory === cat && (isDarkMode ? { backgroundColor: '#0284C7' } : styles.categoryPillActive)
              ]}
              onPress={() => setSelectedCategory(cat)}
              activeOpacity={0.8}>
              <Text style={[
                styles.categoryPillText,
                isDarkMode && { color: '#CBD5E1' },
                selectedCategory === cat && { color: '#FFFFFF' }
              ]}>
                {cat === 'ALL' ? 'All Services' : cat}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Guest Warning Banner */}
        {isGuestMode && (
          <View style={styles.guestWarningBanner}>
            <IconSymbol name="lock.fill" size={14} color="#B45309" />
            <Text style={styles.guestWarningText}>
              {' '}Sign in or register to access municipal e-services.
            </Text>
          </View>
        )}

        {/* Services List */}
        <View style={styles.servicesList}>
          {filteredServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
                isGuestMode && styles.serviceCardLocked
              ]}
              onPress={() => handleServicePress(service.route)}
              activeOpacity={0.85}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconCircle, { backgroundColor: isDarkMode ? '#0F2942' : service.iconBg }]}>
                  <IconSymbol name={service.iconName as any} size={22} color={isDarkMode ? '#38BDF8' : service.iconColor} />
                </View>
                <View style={styles.badgeRow}>
                  <Badge label={service.badgeLabel} variant={service.badgeVariant} />
                  {isGuestMode && (
                    <View style={styles.lockBadge}>
                      <IconSymbol name="lock.fill" size={11} color="#94A3B8" />
                    </View>
                  )}
                </View>
              </View>

              <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]}>{service.title}</Text>
              <Text style={[styles.serviceSub, isDarkMode && { color: '#CBD5E1' }]}>{service.description}</Text>

              <View style={styles.cardFooterRow}>
                <Text style={[styles.launchText, isDarkMode && { color: '#38BDF8' }, isGuestMode && styles.launchTextLocked]}>
                  {isGuestMode ? 'Login Required' : 'Open E-Service'}
                </Text>
                <IconSymbol name={isGuestMode ? 'lock.fill' : 'chevron.right'} size={14} color={isGuestMode ? '#94A3B8' : isDarkMode ? '#38BDF8' : '#176B87'} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* AUTH GATE MODAL */}
      <Modal
        visible={isAuthGateVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAuthGateVisible(false)}>
        <View style={styles.authGateOverlay}>
          <View style={[styles.authGateCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B', borderWidth: 1 }]}>
            {/* Icon Ring */}
            <View style={[styles.authGateIconRing, isDarkMode && { backgroundColor: '#0F2942' }]}>
              <IconSymbol name="lock.shield.fill" size={34} color={isDarkMode ? '#38BDF8' : '#165B7E'} />
            </View>

            {/* Title */}
            <Text style={[styles.authGateTitle, isDarkMode && { color: '#F8FAFC' }]}>Sign In Required</Text>
            <Text style={[styles.authGateSub, isDarkMode && { color: '#CBD5E1' }]}>
              This municipal e-service is only accessible to registered Caloocan City citizens. Please sign in to continue.
            </Text>

            {/* Divider with city branding */}
            <View style={styles.authGateBrandRow}>
              <View style={[styles.authGateBrandLine, isDarkMode && { backgroundColor: '#3A506B' }]} />
              <Text style={[styles.authGateBrandText, isDarkMode && { color: '#94A3B8' }]}>CALOOCAN CITY GOVERNMENT</Text>
              <View style={[styles.authGateBrandLine, isDarkMode && { backgroundColor: '#3A506B' }]} />
            </View>

            {/* Buttons */}
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
                style={[styles.authGateCancelBtn, isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' }]}
                onPress={() => setIsAuthGateVisible(false)}
                activeOpacity={0.7}>
                <Text style={[styles.authGateCancelText, isDarkMode && { color: '#F8FAFC' }]}>Continue Browsing as Guest</Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View style={styles.authGateFooter}>
              <IconSymbol name="shield.fill" size={11} color="#94A3B8" />
              <Text style={[styles.authGateFooterText, isDarkMode && { color: '#94A3B8' }]}>  Protected by Caloocan City E-Governance Portal</Text>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: '#0F172A',
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  categoryScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPillActive: {
    backgroundColor: '#176B87',
    borderColor: '#0F4C61',
  },
  categoryPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  servicesList: {
    gap: 12,
  },
  serviceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  serviceSub: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    gap: 4,
  },
  launchText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B87',
  },
  launchTextLocked: {
    color: '#94A3B8',
  },

  /* ── GUEST BANNER ── */
  guestWarningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  guestWarningText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
    flex: 1,
  },

  /* ── LOCKED CARD ── */
  serviceCardLocked: {
    opacity: 0.72,
    borderColor: '#E2E8F0',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lockBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
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
  authGateRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  authGateRegisterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#165B7E',
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

