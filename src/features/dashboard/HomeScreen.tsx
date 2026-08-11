import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Platform,
  RefreshControl,
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
import { CitizenProfileData, ProfileService } from '@/src/services/profile-service';

export interface AnnouncementItem {
  id: string;
  category: 'EMERGENCY ADVISORY' | 'COMMUNITY BROADCAST' | 'CIVIC NOTICE';
  badgeVariant: 'danger' | 'info' | 'success';
  title: string;
  date: string;
  summary: string;
  fullBody: string;
  department: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 'ANC-101',
    category: 'EMERGENCY ADVISORY',
    badgeVariant: 'danger',
    title: 'Typhoon Weather Advisory #2 - DRRM Command Center',
    date: 'July 27, 2026 • 10 mins ago',
    summary: 'Caloocan DRRM Command Center issued heavy rainfall alert for Barangay Central. Emergency response teams deployed.',
    fullBody: 'The Caloocan Disaster Risk Reduction and Management (DRRM) Office has raised Alert Level 2 due to heavy monsoon rains. Emergency evacuation shelters at Barangay Covered Courts are open. For emergency rescue, tap the SOS button or call hotline (02) 8888-CALOOCAN.',
    department: 'Caloocan DRRM Command Center',
  },
  {
    id: 'ANC-102',
    category: 'COMMUNITY BROADCAST',
    badgeVariant: 'info',
    title: 'Free Mobile Health & Vaccination Clinic in Barangay 171',
    date: 'July 26, 2026 • 1 day ago',
    summary: 'Free health checkups, dental services, and childhood vaccinations scheduled at Barangay 171 Covered Court this Friday.',
    fullBody: 'The City Health Department invites all residents of Barangay 171 to the free Mobile Health Caravan on Friday from 8:00 AM to 4:00 PM. Free services include general consultations, blood pressure checks, pediatric checkups, and flu vaccinations.',
    department: 'City Health Department',
  },
  {
    id: 'ANC-103',
    category: 'CIVIC NOTICE',
    badgeVariant: 'success',
    title: 'Online Business Permit Renewal Fast-Track Portal Open',
    date: 'July 25, 2026 • 2 days ago',
    summary: 'Caloocan City Treasury launches instant digital clearance processing for Q3 business permit renewals.',
    fullBody: 'Business owners can now apply for, renew, and pay Q3 business permits completely online via CIVentral. Approved e-permits with official QR verification will be issued within 24 hours of payment clearance.',
    department: 'Business Permits & Licensing Office (BPLO)',
  },
];

export function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{ isGuest?: string; email?: string; citizenUserId?: string }>();

  // Active Session & Guest Status
  const session = AuthService.getCurrentUser();
  const activeEmail = params.email || session.email || '';
  const activeUserId = params.citizenUserId ? parseInt(params.citizenUserId, 10) : session.citizen_user_id || undefined;
  const isGuestMode = params.isGuest === 'true' || (!activeEmail && !activeUserId && !session.email);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!isGuestMode);

  // User Profile State
  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? 'Guest' : '',
    middle_name: '',
    last_name: isGuestMode ? 'Resident' : '',
    suffix: '',
    fullName: isGuestMode ? 'Guest Resident' : 'Active Citizen',
    initials: isGuestMode ? 'GR' : 'AC',
    email: activeEmail || (isGuestMode ? 'guest@caloocan.gov.ph' : ''),
    phone: '',
    address: '',
    city: 'Caloocan City',
    barangay: '',
    birthDate: '',
    civilStatus: 'Registered Resident',
    citizenId: activeUserId ? `CIV-2026-${String(activeUserId).padStart(5, '0')}` : isGuestMode ? 'CIV-GUEST-2026' : 'CIV-2026-00001',
    status: isGuestMode ? 'Guest' : 'Active',
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: '2026',
    lastLogin: isGuestMode ? 'Current Session (Guest Mode)' : 'Just Now',
  });

  // Modal States
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<AnnouncementItem | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  // Fetch Profile Data
  const loadProfile = async () => {
    if (isGuestMode) return;
    const emailToUse = activeEmail || userProfile.email;
    const res = await ProfileService.getProfile(emailToUse, activeUserId || userProfile.citizen_user_id);
    if (res.status === 'success' && res.data) {
      const data = res.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        status: data.status || 'Active',
      }));
    }
  };

  useEffect(() => {
    async function initData() {
      if (isGuestMode) {
        setIsLoadingProfile(false);
        return;
      }
      setIsLoadingProfile(true);
      await loadProfile();
      setIsLoadingProfile(false);
    }
    initData();
  }, [isGuestMode, activeEmail, activeUserId]);

  const handleRefresh = async () => {
    if (isGuestMode) return;
    setIsRefreshing(true);
    await loadProfile();
    setIsRefreshing(false);
  };

  // Filter announcements based on search
  const filteredAnnouncements = INITIAL_ANNOUNCEMENTS.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(query) ||
      item.summary.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query)
    );
  });

  return (
    <View style={[styles.container, isDarkMode && { backgroundColor: '#0B132B' }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          !isGuestMode ? (
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor="#176B87" />
          ) : undefined
        }>

        {/* SECTION 1: CITIZEN PROFILE CARD */}
        <View style={[styles.profileCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
          <View style={styles.profileCardHeader}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{userProfile.initials || (isGuestMode ? 'GR' : 'AC')}</Text>
              <View style={[styles.avatarStatusDot, isGuestMode && styles.guestStatusDot]} />
            </View>

            <View style={styles.profileInfoStack}>
              <View style={styles.nameRow}>
                <Text style={[styles.profileNameText, isDarkMode && { color: '#F8FAFC' }]}>{userProfile.fullName || 'Citizen Resident'}</Text>
              </View>
              <Text style={[styles.profileIdText, isDarkMode && { color: '#94A3B8' }]}>ID: {userProfile.citizenId || 'Pending Generation'}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <IconSymbol name="location.fill" size={12} color="#176B87" style={{ marginRight: 4 }} />
                <Text style={[styles.profileLocationText, isDarkMode && { color: '#CBD5E1' }]}>
                  {userProfile.barangay ? `${userProfile.barangay}, Caloocan City` : 'Caloocan City Resident'}
                </Text>
              </View>
            </View>

            {/* Mini QR Button */}
            <TouchableOpacity
              style={[styles.miniQrBtn, isDarkMode && { backgroundColor: '#0B132B', borderColor: '#3A506B' }]}
              onPress={() => setIsQrModalVisible(true)}
              activeOpacity={0.8}>
              <IconSymbol name="qrcode" size={24} color="#176B87" />
              <Text style={styles.miniQrText}>QR ID</Text>
            </TouchableOpacity>
          </View>

          {/* Card Footer Badges */}
          <View style={styles.profileCardFooter}>
            <Badge
              label={isGuestMode ? 'GUEST USER' : `${(userProfile.status || 'Active').toUpperCase()} RESIDENT`}
              variant={isGuestMode ? 'neutral' : 'success'}
            />
            <Badge
              label={isGuestMode ? 'TEMPORARY SESSION' : 'OFFICIAL DIGITAL PASS'}
              variant="info"
            />
          </View>
        </View>

        {/* SECTION 2: SEARCH BAR */}
        <View style={styles.searchSection}>
          <View style={[styles.searchBarBox, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}>
            <IconSymbol name="magnifyingglass" size={20} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={[styles.searchInput, isDarkMode && { color: '#F8FAFC' }]}
              placeholder="Search services, permits, announcements..."
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
        </View>

        {/* SECTION 3: 6 QUICK SERVICES GRID (6TH IS SEE ALL SERVICES) */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>Quick Municipal Services</Text>
            <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>Fast-track civic access & online processing</Text>
          </View>
        </View>

        <View style={styles.servicesGrid}>
          {/* Service 1: Barangay Clearance */}
          <TouchableOpacity
            style={[styles.serviceGridCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => router.push('/(tabs)/services')}
            activeOpacity={0.8}>
            <View style={[styles.serviceIconCircle, { backgroundColor: isDarkMode ? '#0F2942' : '#E0F2FE' }]}>
              <IconSymbol name="person.text.rectangle.fill" size={22} color="#38BDF8" />
            </View>
            <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Barangay Clearance</Text>
            <Text style={[styles.serviceSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>E-Clearance & ID</Text>
          </TouchableOpacity>

          {/* Service 2: Business Permit */}
          <TouchableOpacity
            style={[styles.serviceGridCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => router.push('/(tabs)/services')}
            activeOpacity={0.8}>
            <View style={[styles.serviceIconCircle, { backgroundColor: isDarkMode ? '#1E1B4B' : '#E0E7FF' }]}>
              <IconSymbol name="briefcase.fill" size={22} color="#818CF8" />
            </View>
            <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Business Permit</Text>
            <Text style={[styles.serviceSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>New & Renewals</Text>
          </TouchableOpacity>

          {/* Service 3: Real Property Tax */}
          <TouchableOpacity
            style={[styles.serviceGridCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => router.push('/(tabs)/services')}
            activeOpacity={0.8}>
            <View style={[styles.serviceIconCircle, { backgroundColor: isDarkMode ? '#064E3B' : '#DCFCE7' }]}>
              <IconSymbol name="house.fill" size={22} color="#4ADE80" />
            </View>
            <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Real Property Tax</Text>
            <Text style={[styles.serviceSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>RPT Billing & Pay</Text>
          </TouchableOpacity>

          {/* Service 4: Health & Medical */}
          <TouchableOpacity
            style={[styles.serviceGridCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => router.push('/(tabs)/services')}
            activeOpacity={0.8}>
            <View style={[styles.serviceIconCircle, { backgroundColor: isDarkMode ? '#451A03' : '#FEE2E2' }]}>
              <IconSymbol name="cross.case.fill" size={22} color="#F87171" />
            </View>
            <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Health & Medical</Text>
            <Text style={[styles.serviceSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>Barangay Clinics</Text>
          </TouchableOpacity>

          {/* Service 5: Education & Scholarship */}
          <TouchableOpacity
            style={[styles.serviceGridCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
            onPress={() => router.push('/education' as any)}
            activeOpacity={0.8}>
            <View style={[styles.serviceIconCircle, { backgroundColor: isDarkMode ? '#3B0764' : '#F3E8FF' }]}>
              <IconSymbol name="book.closed.fill" size={22} color="#C084FC" />
            </View>
            <Text style={[styles.serviceTitle, isDarkMode && { color: '#F8FAFC' }]} numberOfLines={2}>Education & Scholarship</Text>
            <Text style={[styles.serviceSub, isDarkMode && { color: '#94A3B8' }]} numberOfLines={1}>Grants & Allowance</Text>
          </TouchableOpacity>

          {/* SERVICE 6: SEE ALL SERVICES BUTTON (SPECIAL ACCENT CTA) */}
          <TouchableOpacity
            style={[styles.serviceGridCard, styles.seeAllCard]}
            onPress={() => router.push('/(tabs)/services')}
            activeOpacity={0.85}>
            <View style={styles.seeAllIconCircle}>
              <IconSymbol name="square.grid.2x2.fill" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.seeAllTitle}>See All Services</Text>
            <View style={styles.seeAllArrowRow}>
              <Text style={styles.seeAllSub}>Explore 50+ Services</Text>
              <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        </View>

        {/* SECTION 4: ANNOUNCEMENTS & NEWS */}
        <View style={[styles.sectionHeaderRow, { marginTop: 24 }]}>
          <View style={styles.sectionHeaderLeft}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>City Announcements & Advisories</Text>
            <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>Official updates from Caloocan City Government</Text>
          </View>
        </View>

        <View style={styles.announcementsList}>
          {filteredAnnouncements.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.announcementCard, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' }]}
              onPress={() => setSelectedAnnouncement(item)}
              activeOpacity={0.85}>
              <View style={styles.announcementTopRow}>
                <Badge label={item.category} variant={item.badgeVariant} />
                <Text style={[styles.announcementDateText, isDarkMode && { color: '#94A3B8' }]}>{item.date}</Text>
              </View>

              <Text style={[styles.announcementTitleText, isDarkMode && { color: '#F8FAFC' }]}>{item.title}</Text>
              <Text style={[styles.announcementSummaryText, isDarkMode && { color: '#CBD5E1' }]} numberOfLines={2}>
                {item.summary}
              </Text>

              <View style={styles.announcementFooterRow}>
                <Text style={[styles.announcementDeptText, isDarkMode && { color: '#94A3B8' }]}>{item.department}</Text>
                <View style={styles.readMoreRow}>
                  <Text style={[styles.readMoreText, isDarkMode && { color: '#38BDF8' }]}>Read Announcement</Text>
                  <IconSymbol name="chevron.right" size={14} color={isDarkMode ? '#38BDF8' : '#176B87'} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* MODAL 1: QR CODE RESIDENT PASS */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQrModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.qrModalContainer, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B', borderWidth: 1 }]}>
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, isDarkMode && { color: '#F8FAFC' }]}>Civentral Resident Pass</Text>
              <TouchableOpacity onPress={() => setIsQrModalVisible(false)} style={[styles.modalCloseBtn, isDarkMode && { backgroundColor: '#0B132B' }]}>
                <Text style={[styles.modalCloseText, isDarkMode && { color: '#F8FAFC' }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.qrCodeBox, isDarkMode && { backgroundColor: '#FFFFFF', padding: 12, borderRadius: 16 }]}>
              <IconSymbol name="qrcode" size={180} color="#0F172A" />
            </View>

            <Text style={[styles.qrCitizenName, isDarkMode && { color: '#F8FAFC' }]}>{userProfile.fullName || 'Citizen Resident'}</Text>
            <Text style={[styles.qrCitizenId, isDarkMode && { color: '#38BDF8' }]}>{userProfile.citizenId || 'CITIZEN-PASS'}</Text>
            <Badge
              label={isGuestMode ? 'GUEST PASS • CALOOCAN CITY' : 'ACTIVE RESIDENT • CALOOCAN CITY'}
              variant={isGuestMode ? 'neutral' : 'success'}
            />

            <Text style={[styles.qrInstructionText, isDarkMode && { color: '#CBD5E1' }]}>
              Scan this QR code at City Hall entry checkpoints, Barangay Health Centers, or Civic Service counters.
            </Text>

            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}>
              <Text style={styles.primaryModalBtnText}>Close Digital Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ANNOUNCEMENT DETAIL READER */}
      <Modal
        visible={selectedAnnouncement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}>
        <View style={styles.modalOverlay}>
          {selectedAnnouncement ? (
            <View style={[styles.announcementModalContainer, isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B', borderWidth: 1 }]}>
              <View style={styles.qrModalHeader}>
                <Badge
                  label={selectedAnnouncement.category}
                  variant={selectedAnnouncement.badgeVariant}
                />
                <TouchableOpacity onPress={() => setSelectedAnnouncement(null)} style={[styles.modalCloseBtn, isDarkMode && { backgroundColor: '#0B132B' }]}>
                  <Text style={[styles.modalCloseText, isDarkMode && { color: '#F8FAFC' }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
                <Text style={[styles.ancModalTitle, isDarkMode && { color: '#F8FAFC' }]}>{selectedAnnouncement.title}</Text>
                <Text style={[styles.ancModalDate, isDarkMode && { color: '#94A3B8' }]}>{selectedAnnouncement.date}</Text>
                <Text style={[styles.ancModalDept, isDarkMode && { color: '#38BDF8' }]}>Issued by: {selectedAnnouncement.department}</Text>
                
                <View style={[styles.ancModalDivider, isDarkMode && { backgroundColor: '#3A506B' }]} />
                
                <Text style={[styles.ancModalBody, isDarkMode && { color: '#CBD5E1' }]}>{selectedAnnouncement.fullBody}</Text>
              </ScrollView>

              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={() => setSelectedAnnouncement(null)}
                activeOpacity={0.85}>
                <Text style={styles.primaryModalBtnText}>Dismiss Announcement</Text>
              </TouchableOpacity>
            </View>
          ) : null}
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
    paddingTop: Platform.OS === 'android' ? 16 : 8,
    paddingBottom: 110,
  },

  /* Brand Header */
  topBrandBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  brandLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogoImage: {
    width: 44,
    height: 44,
  },
  brandTitleStack: {
    marginLeft: 10,
  },
  brandRepublicText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 1,
  },
  brandCityText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#176B87',
  },
  headerActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircleBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  unreadBadgeDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  sosCircleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 19,
    gap: 4,
  },
  sosBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  /* Citizen Profile Card */
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 16,
  },
  profileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#176B87',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#16A34A',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  guestStatusDot: {
    backgroundColor: '#94A3B8',
  },
  profileInfoStack: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileNameText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
  },
  profileIdText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#176B87',
    marginTop: 1,
  },
  profileLocationText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  miniQrBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  miniQrText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#176B87',
    marginTop: 2,
  },
  profileCardFooter: {
    flexDirection: 'row',
    marginTop: 14,
    alignItems: 'center',
    gap: 8,
  },

  /* Search Section */
  searchSection: {
    marginBottom: 20,
  },
  searchBarBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  clearSearchBtn: {
    padding: 4,
  },
  clearSearchText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Section Titles */
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* 6 Services Grid */
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  serviceGridCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  serviceIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 15,
  },
  serviceSub: {
    fontSize: 9,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 2,
  },

  /* Service 6 Accent Button */
  seeAllCard: {
    backgroundColor: '#176B87',
    borderColor: '#0F4C61',
  },
  seeAllIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  seeAllTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  seeAllArrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 2,
  },
  seeAllSub: {
    fontSize: 9,
    color: '#BAE6FD',
    fontWeight: '700',
  },

  /* Announcements Feed */
  announcementsList: {
    gap: 12,
  },
  announcementCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  announcementTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  announcementDateText: {
    fontSize: 11,
    color: '#64748B',
  },
  announcementTitleText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    lineHeight: 19,
  },
  announcementSummaryText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 12,
  },
  announcementFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
  },
  announcementDeptText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    flex: 1,
  },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  readMoreText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#176B87',
  },

  /* Modals */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  qrModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
  },
  announcementModalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
  },
  qrModalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: '#64748B',
    fontWeight: '700',
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  qrCitizenName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
  },
  qrCitizenId: {
    fontSize: 13,
    fontWeight: '700',
    color: '#176B87',
    marginBottom: 8,
  },
  qrInstructionText: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  primaryModalBtn: {
    backgroundColor: '#176B87',
    borderRadius: 14,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: 16,
  },
  primaryModalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  ancModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    lineHeight: 22,
  },
  ancModalDate: {
    fontSize: 11,
    color: '#64748B',
  },
  ancModalDept: {
    fontSize: 11,
    fontWeight: '700',
    color: '#176B87',
    marginTop: 2,
  },
  ancModalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  ancModalBody: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 20,
  },
});
