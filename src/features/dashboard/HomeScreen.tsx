import { IconSymbol } from "@/components/ui/icon-symbol";
import { Badge } from "@/src/components/ui/Badge";
import { useTheme } from "@/src/context/ThemeContext";
import { AuthService } from "@/src/services/auth-service";
import {
    CitizenProfileData,
    ProfileService,
} from "@/src/services/profile-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ImageBackground,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { HomeScreenSkeleton } from "./HomeScreenSkeleton";

export interface AnnouncementItem {
  id: string;
  category: "EMERGENCY ADVISORY" | "COMMUNITY BROADCAST" | "CIVIC NOTICE";
  badgeVariant: "danger" | "info" | "success";
  title: string;
  date: string;
  summary: string;
  fullBody: string;
  department: string;
}

interface ActivityItem {
  id: string;
  serviceTitle: string;
  status: "Under Review" | "Approved" | "Completed" | "Processing";
  updatedAt: string;
  domainId: string;
}

const INITIAL_ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: "ANC-101",
    category: "EMERGENCY ADVISORY",
    badgeVariant: "danger",
    title: "Typhoon Weather Advisory #2 - DRRM Command Center",
    date: "July 27, 2026 - 10 mins ago",
    summary:
      "Caloocan DRRM Command Center issued heavy rainfall alert for Barangay Central. Emergency response teams deployed.",
    fullBody:
      "The Caloocan Disaster Risk Reduction and Management (DRRM) Office has raised Alert Level 2 due to heavy monsoon rains. Emergency evacuation shelters at Barangay Covered Courts are open. For emergency rescue, tap the SOS button or call hotline (02) 8888-CALOOCAN.",
    department: "Caloocan DRRM Command Center",
  },
  {
    id: "ANC-102",
    category: "COMMUNITY BROADCAST",
    badgeVariant: "info",
    title: "Free Mobile Health Vaccination Clinic in Barangay 171",
    date: "July 26, 2026 - 1 day ago",
    summary:
      "Free health checkups, dental services, and childhood vaccinations scheduled at Barangay 171 Covered Court this Friday.",
    fullBody:
      "The City Health Department invites all residents of Barangay 171 to the free Mobile Health Caravan on Friday from 8:00 AM to 4:00 PM. Free services include general consultations, blood pressure checks, pediatric checkups, and flu vaccinations.",
    department: "City Health Department",
  },
  {
    id: "ANC-103",
    category: "CIVIC NOTICE",
    badgeVariant: "success",
    title: "Online Business Permit Renewal Fast-Track Portal Open",
    date: "July 25, 2026 - 2 days ago",
    summary:
      "Caloocan City Treasury launches instant digital clearance processing for Q3 business permit renewals.",
    fullBody:
      "Business owners can now apply for, renew, and pay Q3 business permits completely online via Civentral. Approved e-permits with official QR verification will be issued within 24 hours of payment clearance.",
    department: "Business Permits and Licensing Office (BPLO)",
  },
];

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: "APP-2026-001",
    serviceTitle: "Barangay Clearance and Citizen ID",
    status: "Under Review",
    updatedAt: "Today",
    domainId: "identity",
  },
  {
    id: "APP-2026-042",
    serviceTitle: "New Business Permit Application",
    status: "Approved",
    updatedAt: "Yesterday",
    domainId: "business",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getStatusColor(status: string): { bg: string; text: string } {
  switch (status) {
    case "Approved":
      return { bg: "#DCFCE7", text: "#15803D" };
    case "Completed":
      return { bg: "#DBEAFE", text: "#1D4ED8" };
    case "Processing":
      return { bg: "#FEF3C7", text: "#B45309" };
    default:
      return { bg: "#F1F5F9", text: "#475569" };
  }
}

function getActivityIcon(domainId: string): string {
  switch (domainId) {
    case "business":
      return "briefcase.fill";
    case "treasury":
      return "creditcard.fill";
    case "education":
      return "book.closed.fill";
    case "health":
      return "cross.case.fill";
    default:
      return "person.text.rectangle.fill";
  }
}

export function HomeScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const params = useLocalSearchParams<{
    isGuest?: string;
    email?: string;
    citizenUserId?: string;
  }>();

  const session = AuthService.getCurrentUser();
  const activeEmail = session.isGuest ? "" : params.email || session.email || "";
  const activeUserId = session.isGuest
    ? undefined
    : params.citizenUserId
    ? parseInt(params.citizenUserId, 10)
    : session.citizen_user_id || undefined;
  const isGuestMode =
    session.isGuest ||
    params.isGuest === "true" ||
    (!activeEmail && !activeUserId);

  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(!isGuestMode);
  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? "Guest" : "",
    middle_name: "",
    last_name: isGuestMode ? "Resident" : "",
    suffix: "",
    fullName: isGuestMode ? "Guest Resident" : "Active Citizen",
    initials: isGuestMode ? "GR" : "AC",
    email: activeEmail || (isGuestMode ? "guest@caloocan.gov.ph" : ""),
    phone: "",
    address: "",
    city: "Caloocan City",
    barangay: "",
    birthDate: "",
    civilStatus: "Registered Resident",
    citizenId: activeUserId
      ? `CIV-2026-${String(activeUserId).padStart(5, "0")}`
      : isGuestMode
        ? "CIV-GUEST-2026"
        : "CIV-2026-00001",
    status: isGuestMode ? "Guest" : "Active",
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: "2026",
    lastLogin: isGuestMode ? "Current Session (Guest Mode)" : "Just Now",
  });

  const [selectedAnnouncement, setSelectedAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

  const loadProfile = async () => {
    if (isGuestMode) return;
    const emailToUse = activeEmail || userProfile.email;
    const res = await ProfileService.getProfile(
      emailToUse,
      activeUserId || userProfile.citizen_user_id,
    );
    if (res.status === "success" && res.data) {
      const data = res.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        status: data.status || "Active",
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

  const firstName =
    userProfile.first_name ||
    (userProfile.fullName ? userProfile.fullName.split(" ")[0] : "Citizen");

  const locationLabel = userProfile.barangay
    ? `${userProfile.barangay}, Caloocan City`
    : "Caloocan City Resident";

  const dm = isDarkMode;
  const C = {
    bg: dm ? "#0B132B" : "#F6F8FA",
    surface: dm ? "#1C2541" : "#FFFFFF",
    border: dm ? "#3A506B" : "#E5E7EB",
    textPrimary: dm ? "#F8FAFC" : "#111827",
    textSecondary: dm ? "#94A3B8" : "#667085",
    blue: "#176B87",
    blueLight: dm ? "#0F2942" : "#EBF5FB",
  };

  if (isLoadingProfile) {
    return <HomeScreenSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          !isGuestMode ? (
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#176B87"
            />
          ) : undefined
        }
      >
        {/* TOP HERO BANNER WITH EDGE-TO-EDGE CITYHALL BACKGROUND */}
        <View style={styles.heroContainer}>
          <ImageBackground
            source={
              isDarkMode
                ? require("@/assets/images/cityhall-dark.png")
                : require("@/assets/images/cityhall.png")
            }
            style={styles.heroBackground}
            imageStyle={styles.heroImageStyle}
            resizeMode="cover"
          >
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroGreetingText, { color: dm ? "#F8FAFC" : "#1E293B" }]}>
                {getGreeting()}, {firstName} 👋
              </Text>
              <Text style={[styles.heroSubText, { color: dm ? "#CBD5E1" : "#64748B" }]}>
                {locationLabel}
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* MAIN PADDED CONTAINER WITH OVERLAY CIVIC ACTIVITY CARD */}
        <View style={styles.bodyContent}>
          {/* CIVIC ACTIVITY CARD (MATCHING USER MOCKUP EXACTLY) */}
          <View
            style={[
              styles.civicCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <View style={styles.civicCardHeader}>
              <Text style={[styles.civicCardTitle, { color: C.textPrimary }]}>
                My Civic Activity
              </Text>
              <TouchableOpacity
                onPress={() => router.push("/(tabs)/tracker")}
                style={styles.viewAllRow}
                activeOpacity={0.7}
              >
                <Text style={[styles.viewAllText, { color: dm ? "#38BDF8" : "#2563EB" }]}>
                  View all
                </Text>
                <IconSymbol name="chevron.right" size={14} color={dm ? "#38BDF8" : "#2563EB"} />
              </TouchableOpacity>
            </View>

            {/* 4 ROUNDED PILLAR CARDS */}
            <View style={styles.pillarGrid}>
              {/* PILLAR 1: Active Requests */}
              <TouchableOpacity
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#0F1E36" : "#EFF6FF" },
                ]}
                onPress={() => router.push("/(tabs)/tracker")}
                activeOpacity={0.8}
              >
                <View style={[styles.pillarIconBadge, { backgroundColor: "#2563EB" }]}>
                  <IconSymbol name="doc.text.fill" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.pillarValue, { color: C.textPrimary }]}>3</Text>
                <Text style={[styles.pillarLabel, { color: C.textSecondary }]}>
                  Active{"\n"}Requests
                </Text>
              </TouchableOpacity>

              {/* PILLAR 2: Ready Documents */}
              <TouchableOpacity
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#052818" : "#F0FDF4" },
                ]}
                onPress={() => router.push("/(tabs)/tracker")}
                activeOpacity={0.8}
              >
                <View style={[styles.pillarIconBadge, { backgroundColor: "#16A34A", borderRadius: 20 }]}>
                  <IconSymbol name="checkmark.circle.fill" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.pillarValue, { color: C.textPrimary }]}>2</Text>
                <Text style={[styles.pillarLabel, { color: C.textSecondary }]}>
                  Ready{"\n"}Documents
                </Text>
              </TouchableOpacity>

              {/* PILLAR 3: Pending Payment */}
              <TouchableOpacity
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#291D07" : "#FFFBEB" },
                ]}
                onPress={() => router.push("/(tabs)/tracker")}
                activeOpacity={0.8}
              >
                <View style={[styles.pillarIconBadge, { backgroundColor: "#EA580C" }]}>
                  <IconSymbol name="wallet.pass.fill" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.pillarValue, { color: C.textPrimary }]}>1</Text>
                <Text style={[styles.pillarLabel, { color: C.textSecondary }]}>
                  Pending{"\n"}Payment
                </Text>
              </TouchableOpacity>

              {/* PILLAR 4: Digital Resident ID */}
              <TouchableOpacity
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#210C36" : "#FAF5FF" },
                ]}
                onPress={() => setIsQrModalVisible(true)}
                activeOpacity={0.8}
              >
                <View style={[styles.pillarIconBadge, { backgroundColor: "#9333EA" }]}>
                  <IconSymbol name="person.text.rectangle.fill" size={20} color="#FFFFFF" />
                </View>
                <Text style={[styles.pillarValueStatus, { color: C.textPrimary }]}>Active</Text>
                <Text style={[styles.pillarLabel, { color: C.textSecondary }]}>
                  Digital{"\n"}Resident ID
                </Text>
              </TouchableOpacity>
            </View>

            {/* BOTTOM PAGINATION INDICATOR BAR */}
            <View style={styles.paginationRow}>
              <View style={[styles.paginationPillActive, { backgroundColor: dm ? "#38BDF8" : "#2563EB" }]} />
              <View style={[styles.paginationPill, { backgroundColor: dm ? "#334155" : "#E2E8F0" }]} />
            </View>
          </View>

          {/* SEARCH BAR CONTAINER */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            <IconSymbol
              name="magnifyingglass"
              size={20}
              color={C.textSecondary}
            />
            <TextInput
              style={[styles.searchInput, { color: C.textPrimary }]}
              placeholder="Search services, permits, announcements..."
              placeholderTextColor={C.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 ? (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearBtn}
              >
                <Text style={[styles.clearText, { color: C.textSecondary }]}>
                  x
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(true)}
                style={styles.scanBtn}
                activeOpacity={0.7}
              >
                <IconSymbol
                  name="qrcode.viewfinder"
                  size={20}
                  color={dm ? "#38BDF8" : "#0284C7"}
                />
              </TouchableOpacity>
            )}
          </View>

        {/* SECTION 4: SERVICE LAUNCHER */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              City Services
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/services")}>
              <Text style={[styles.sectionLink, { color: C.blue }]}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.serviceGrid}>
            <TouchableOpacity
              style={[
                styles.serviceItem,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => router.push("/(tabs)/services")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.serviceIconBox,
                  { backgroundColor: C.blueLight },
                ]}
              >
                <IconSymbol
                  name="person.text.rectangle.fill"
                  size={20}
                  color={C.blue}
                />
              </View>
              <View style={styles.serviceTextBlock}>
                <Text
                  style={[styles.serviceItemTitle, { color: C.textPrimary }]}
                  numberOfLines={1}
                >
                  Barangay Clearance
                </Text>
                <Text
                  style={[styles.serviceItemSub, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  Documents and ID
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={C.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.serviceItem,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => router.push("/(tabs)/services")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.serviceIconBox,
                  { backgroundColor: C.blueLight },
                ]}
              >
                <IconSymbol name="briefcase.fill" size={20} color={C.blue} />
              </View>
              <View style={styles.serviceTextBlock}>
                <Text
                  style={[styles.serviceItemTitle, { color: C.textPrimary }]}
                  numberOfLines={1}
                >
                  Business Permit
                </Text>
                <Text
                  style={[styles.serviceItemSub, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  Apply and renew
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={C.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.serviceItem,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => router.push("/(tabs)/services")}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.serviceIconBox,
                  { backgroundColor: C.blueLight },
                ]}
              >
                <IconSymbol name="creditcard.fill" size={20} color={C.blue} />
              </View>
              <View style={styles.serviceTextBlock}>
                <Text
                  style={[styles.serviceItemTitle, { color: C.textPrimary }]}
                  numberOfLines={1}
                >
                  Real Property Tax
                </Text>
                <Text
                  style={[styles.serviceItemSub, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  View and pay
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={C.textSecondary}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.serviceItem,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => router.push("/education" as any)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.serviceIconBox,
                  { backgroundColor: C.blueLight },
                ]}
              >
                <IconSymbol name="book.closed.fill" size={20} color={C.blue} />
              </View>
              <View style={styles.serviceTextBlock}>
                <Text
                  style={[styles.serviceItemTitle, { color: C.textPrimary }]}
                  numberOfLines={1}
                >
                  Education and Scholarship
                </Text>
                <Text
                  style={[styles.serviceItemSub, { color: C.textSecondary }]}
                  numberOfLines={1}
                >
                  Programs and grants
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={14}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          </View>
          <View style={[styles.shortcutRow, { borderColor: C.border }]}>
            <TouchableOpacity
              style={styles.shortcutItem}
              onPress={() => router.push("/(tabs)/services")}
              activeOpacity={0.8}
            >
              <IconSymbol name="cross.case.fill" size={15} color={C.blue} />
              <Text style={[styles.shortcutText, { color: C.textPrimary }]}>
                Health and Medical
              </Text>
            </TouchableOpacity>
            <View
              style={[styles.shortcutDivider, { backgroundColor: C.border }]}
            />
            <TouchableOpacity
              style={styles.shortcutItem}
              onPress={() => router.push("/(tabs)/services")}
              activeOpacity={0.8}
            >
              <Text style={[styles.shortcutText, { color: C.blue }]}>
                More City Services
              </Text>
              <IconSymbol name="chevron.right" size={14} color={C.blue} />
            </TouchableOpacity>
          </View>
        </View>

        {/* SECTION 5: MY ACTIVITY */}
        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              My Activity
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tracker")}>
              <Text style={[styles.sectionLink, { color: C.blue }]}>
                View all
              </Text>
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.activityCard,
              { backgroundColor: C.surface, borderColor: C.border },
            ]}
          >
            {RECENT_ACTIVITY.map((item, index) => {
              const statusColor = getStatusColor(item.status);
              const isLast = index === RECENT_ACTIVITY.length - 1;
              return (
                <View key={item.id}>
                  <TouchableOpacity
                    style={styles.activityRow}
                    onPress={() => router.push("/(tabs)/tracker")}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.activityIconBox,
                        { backgroundColor: C.blueLight },
                      ]}
                    >
                      <IconSymbol
                        name={getActivityIcon(item.domainId) as any}
                        size={16}
                        color={C.blue}
                      />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text
                        style={[styles.activityTitle, { color: C.textPrimary }]}
                        numberOfLines={1}
                      >
                        {item.serviceTitle}
                      </Text>
                      <Text
                        style={[
                          styles.activityMeta,
                          { color: C.textSecondary },
                        ]}
                      >
                        Updated {item.updatedAt}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          { color: statusColor.text },
                        ]}
                      >
                        {item.status}
                      </Text>
                    </View>
                  </TouchableOpacity>
                  {!isLast && (
                    <View
                      style={[styles.rowDivider, { backgroundColor: C.border }]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION 6: CITY UPDATES */}
        <View style={[styles.sectionBlock, styles.lastSection]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: C.textPrimary }]}>
              City Updates
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/notifications")}
            >
              <Text style={[styles.sectionLink, { color: C.blue }]}>
                See all
              </Text>
            </TouchableOpacity>
          </View>
          {INITIAL_ANNOUNCEMENTS[0] && (
            <TouchableOpacity
              style={[
                styles.featuredCard,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => setSelectedAnnouncement(INITIAL_ANNOUNCEMENTS[0])}
              activeOpacity={0.85}
            >
              <View style={styles.featuredAccent} />
              <View style={styles.featuredContent}>
                <View style={styles.featuredTopRow}>
                  <View style={styles.emergencyBadge}>
                    <Text style={styles.emergencyBadgeText}>EMERGENCY</Text>
                  </View>
                  <Text
                    style={[styles.featuredDate, { color: C.textSecondary }]}
                  >
                    10 mins ago
                  </Text>
                </View>
                <Text
                  style={[styles.featuredTitle, { color: C.textPrimary }]}
                  numberOfLines={2}
                >
                  {INITIAL_ANNOUNCEMENTS[0].title}
                </Text>
                <Text
                  style={[styles.featuredSummary, { color: C.textSecondary }]}
                  numberOfLines={2}
                >
                  {INITIAL_ANNOUNCEMENTS[0].summary}
                </Text>
                <View style={styles.featuredFooter}>
                  <Text
                    style={[styles.featuredDept, { color: C.textSecondary }]}
                  >
                    {INITIAL_ANNOUNCEMENTS[0].department}
                  </Text>
                  <View style={styles.readRow}>
                    <Text style={[styles.readText, { color: C.blue }]}>
                      Read advisory
                    </Text>
                    <IconSymbol name="chevron.right" size={13} color={C.blue} />
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
          {INITIAL_ANNOUNCEMENTS[1] && (
            <TouchableOpacity
              style={[
                styles.secondaryRow,
                { backgroundColor: C.surface, borderColor: C.border },
              ]}
              onPress={() => setSelectedAnnouncement(INITIAL_ANNOUNCEMENTS[1])}
              activeOpacity={0.85}
            >
              <View style={styles.secondaryLeft}>
                <Text style={[styles.secondaryCategory, { color: C.blue }]}>
                  CITY ANNOUNCEMENT
                </Text>
                <Text
                  style={[styles.secondaryTitle, { color: C.textPrimary }]}
                  numberOfLines={1}
                >
                  {INITIAL_ANNOUNCEMENTS[1].title}
                </Text>
                <Text
                  style={[styles.secondaryDate, { color: C.textSecondary }]}
                >
                  {INITIAL_ANNOUNCEMENTS[1].date}
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={16}
                color={C.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
        </View>
      </ScrollView>

      {/* MODAL 1: QR PASS */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.qrModalContainer,
              dm && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.qrModalHeader}>
              <Text style={[styles.qrModalTitle, dm && { color: "#F8FAFC" }]}>
                Civentral Resident Pass
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                style={[
                  styles.modalCloseBtn,
                  dm && { backgroundColor: "#0B132B" },
                ]}
              >
                <Text
                  style={[styles.modalCloseText, dm && { color: "#F8FAFC" }]}
                >
                  x
                </Text>
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.qrCodeBox,
                dm && {
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 16,
                },
              ]}
            >
              <IconSymbol name="qrcode" size={180} color="#0F172A" />
            </View>
            <Text style={[styles.qrCitizenName, dm && { color: "#F8FAFC" }]}>
              {userProfile.fullName || "Citizen Resident"}
            </Text>
            <Text style={[styles.qrCitizenId, dm && { color: "#38BDF8" }]}>
              {userProfile.citizenId || "CITIZEN-PASS"}
            </Text>
            <Badge
              label={
                isGuestMode
                  ? "GUEST PASS - CALOOCAN CITY"
                  : "ACTIVE RESIDENT - CALOOCAN CITY"
              }
              variant={isGuestMode ? "neutral" : "success"}
            />
            <Text
              style={[styles.qrInstructionText, dm && { color: "#CBD5E1" }]}
            >
              Scan this QR code at City Hall entry checkpoints, Barangay Health
              Centers, or Civic Service counters.
            </Text>
            <TouchableOpacity
              style={styles.primaryModalBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryModalBtnText}>Close Digital Pass</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: ANNOUNCEMENT DETAIL */}
      <Modal
        visible={selectedAnnouncement !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedAnnouncement(null)}
      >
        <View style={styles.modalOverlay}>
          {selectedAnnouncement ? (
            <View
              style={[
                styles.announcementModalContainer,
                dm && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.qrModalHeader}>
                <Badge
                  label={selectedAnnouncement.category}
                  variant={selectedAnnouncement.badgeVariant}
                />
                <TouchableOpacity
                  onPress={() => setSelectedAnnouncement(null)}
                  style={[
                    styles.modalCloseBtn,
                    dm && { backgroundColor: "#0B132B" },
                  ]}
                >
                  <Text
                    style={[styles.modalCloseText, dm && { color: "#F8FAFC" }]}
                  >
                    x
                  </Text>
                </TouchableOpacity>
              </View>
              <ScrollView style={{ maxHeight: 380, marginVertical: 12 }}>
                <Text
                  style={[styles.ancModalTitle, dm && { color: "#F8FAFC" }]}
                >
                  {selectedAnnouncement.title}
                </Text>
                <Text style={[styles.ancModalDate, dm && { color: "#94A3B8" }]}>
                  {selectedAnnouncement.date}
                </Text>
                <Text style={[styles.ancModalDept, dm && { color: "#38BDF8" }]}>
                  Issued by: {selectedAnnouncement.department}
                </Text>
                <View
                  style={[
                    styles.ancModalDivider,
                    dm && { backgroundColor: "#3A506B" },
                  ]}
                />
                <Text style={[styles.ancModalBody, dm && { color: "#CBD5E1" }]}>
                  {selectedAnnouncement.fullBody}
                </Text>
              </ScrollView>
              <TouchableOpacity
                style={styles.primaryModalBtn}
                onPress={() => setSelectedAnnouncement(null)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryModalBtnText}>
                  Dismiss Announcement
                </Text>
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
    backgroundColor: "#F6F8FA",
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 110,
  },
  heroContainer: {
    width: "100%",
    height: 190,
    overflow: "hidden",
  },
  heroBackground: {
    width: "100%",
    height: "100%",
    justifyContent: "flex-start",
  },
  heroImageStyle: {
    opacity: 0.95,
  },
  heroOverlay: {
    paddingTop: Platform.OS === "android" ? 18 : 14,
    paddingHorizontal: 20,
  },
  heroGreetingText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    marginBottom: 4,
  },
  heroSubText: {
    fontSize: 14,
    fontWeight: "600",
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  civicCard: {
    borderRadius: 24,
    padding: 16,
    marginTop: -44,
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 4,
    marginBottom: 16,
  },
  civicCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  civicCardTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.2,
  },
  viewAllRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  viewAllText: {
    fontSize: 13,
    fontWeight: "600",
  },
  pillarGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pillarCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  pillarIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  pillarValue: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 4,
    textAlign: "center",
  },
  pillarValueStatus: {
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 4,
    textAlign: "center",
  },
  pillarLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 14,
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 5,
  },
  paginationPillActive: {
    width: 24,
    height: 4,
    borderRadius: 2,
  },
  paginationPill: {
    width: 16,
    height: 4,
    borderRadius: 2,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 14,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: "#111827",
  },
  clearBtn: {
    paddingHorizontal: 4,
  },
  clearText: {
    fontSize: 14,
    fontWeight: "700",
  },
  scanBtn: {
    paddingHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionBlock: {
    marginBottom: 28,
  },
  lastSection: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionLink: {
    fontSize: 13,
    fontWeight: "600",
    color: "#176B87",
  },
  serviceGrid: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
    gap: 12,
  },
  serviceIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  serviceTextBlock: {
    flex: 1,
  },
  serviceItemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 1,
  },
  serviceItemSub: {
    fontSize: 12,
    color: "#667085",
  },
  shortcutRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
  },
  shortcutItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    gap: 6,
    backgroundColor: "transparent",
  },
  shortcutDivider: {
    width: 1,
    height: 20,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: "600",
  },
  activityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    overflow: "hidden",
  },
  activityRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 12,
  },
  activityIconBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 11,
    color: "#667085",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  rowDivider: {
    height: 1,
    marginHorizontal: 14,
  },
  featuredCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
  },
  featuredAccent: {
    width: 4,
    backgroundColor: "#DC2626",
  },
  featuredContent: {
    flex: 1,
    padding: 14,
  },
  featuredTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  emergencyBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 5,
  },
  emergencyBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#B91C1C",
    letterSpacing: 0.5,
  },
  featuredDate: {
    fontSize: 11,
    color: "#667085",
  },
  featuredTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    lineHeight: 19,
    marginBottom: 5,
  },
  featuredSummary: {
    fontSize: 12,
    color: "#667085",
    lineHeight: 17,
    marginBottom: 10,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingTop: 9,
  },
  featuredDept: {
    fontSize: 11,
    color: "#667085",
    flex: 1,
  },
  readRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  readText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#176B87",
  },
  secondaryRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 14,
  },
  secondaryLeft: {
    flex: 1,
    paddingRight: 8,
  },
  secondaryCategory: {
    fontSize: 10,
    fontWeight: "700",
    color: "#176B87",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  secondaryTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 2,
  },
  secondaryDate: {
    fontSize: 11,
    color: "#667085",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  qrModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    width: "100%",
    alignItems: "center",
  },
  announcementModalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    width: "100%",
  },
  qrModalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  qrModalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "700",
  },
  qrCodeBox: {
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 14,
  },
  qrCitizenName: {
    fontSize: 18,
    fontWeight: "900",
    color: "#0F172A",
  },
  qrCitizenId: {
    fontSize: 13,
    fontWeight: "700",
    color: "#176B87",
    marginBottom: 8,
  },
  qrInstructionText: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  primaryModalBtn: {
    backgroundColor: "#176B87",
    borderRadius: 14,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginTop: 16,
  },
  primaryModalBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  ancModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    lineHeight: 22,
  },
  ancModalDate: {
    fontSize: 11,
    color: "#64748B",
  },
  ancModalDept: {
    fontSize: 11,
    fontWeight: "700",
    color: "#176B87",
    marginTop: 2,
  },
  ancModalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 12,
  },
  ancModalBody: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 20,
  },
});
