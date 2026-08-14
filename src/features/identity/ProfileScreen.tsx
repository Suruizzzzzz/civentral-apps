import { IconSymbol } from "@/src/components/ui/icon-symbol";
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
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    RefreshControl,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "./styles/ProfileScreen.styles";

export function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    isGuest?: string;
    email?: string;
    phone?: string;
    citizenUserId?: string;
  }>();

  // Check active session or params
  const session = AuthService.getCurrentUser();
  const activeEmail = session.isGuest
    ? ""
    : params.email || session.email || "";
  const activePhone = session.isGuest
    ? ""
    : params.phone || session.phone || "";
  const activeUserId = session.isGuest
    ? undefined
    : params.citizenUserId
      ? parseInt(params.citizenUserId, 10)
      : session.citizen_user_id || undefined;

  // Is Guest if session isGuest OR explicitly passed isGuest=true OR if no active contact/id is found
  const isGuestMode =
    session.isGuest ||
    params.isGuest === "true" ||
    (!activeEmail && !activePhone && !activeUserId);

  // Active sub-tab state: 'overview' | 'settings'
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview",
  );

  // Loading & Refresh State
  const [isLoadingApi, setIsLoadingApi] = useState(!isGuestMode);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // User Profile Data state initialized with real dynamic state (No hardcoded mock data)
  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? "Guest" : "",
    middle_name: "",
    last_name: isGuestMode ? "Resident" : "",
    suffix: "",
    fullName: isGuestMode ? "Guest Resident" : "",
    initials: isGuestMode ? "GR" : "",
    email: activeEmail || (isGuestMode ? "guest@caloocan.gov.ph" : ""),
    phone: "",
    address: "",
    city: "Caloocan City",
    barangay: "",
    birthDate: "",
    civilStatus: "",
    citizenId: activeUserId
      ? `CIV-2026-${String(activeUserId).padStart(5, "0")}`
      : isGuestMode
        ? "CIV-GUEST-2026"
        : "",
    status: isGuestMode ? "Guest" : "Active",
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: "",
    lastLogin: isGuestMode ? "Current Session (Guest Mode)" : "",
  });

  // Settings State & Theme
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [biometricsEnabled, setBiometricsEnabled] = useState(
    userProfile.biometricEnabled,
  );
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);

  // Modals
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);

  // Temporary Edit Form State
  const [editPhone, setEditPhone] = useState(userProfile.phone);
  const [editEmail, setEditEmail] = useState(userProfile.email);
  const [editAddress, setEditAddress] = useState(userProfile.address);
  const [isSaving, setIsSaving] = useState(false);

  // Change Password Form State
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] =
    useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] =
    useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState<
    string | null
  >(null);
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);

  // New Password Strength Evaluation
  const newHasMinLength = newPassword.length >= 8;
  const newHasUpper = /[A-Z]/.test(newPassword);
  const newHasLower = /[a-z]/.test(newPassword);
  const newHasNumber = /[0-9]/.test(newPassword);
  const newHasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const getNewStrengthLevel = (): "weak" | "medium" | "strong" | "" => {
    if (newPassword.length === 0) return "";
    let score = 0;
    if (newHasMinLength) score += 1;
    if (newHasUpper && newHasLower) score += 1;
    if (newHasNumber) score += 1;
    if (newHasSymbol) score += 1;

    if (
      score >= 4 &&
      newHasMinLength &&
      newHasUpper &&
      newHasLower &&
      newHasNumber &&
      newHasSymbol
    ) {
      return "strong";
    } else if (score >= 3 && newHasMinLength) {
      return "medium";
    } else {
      return "weak";
    }
  };

  const newStrengthLevel = getNewStrengthLevel();

  const handleChangePassword = async () => {
    setChangePasswordErrorMessage(null);

    if (!currentPassword) {
      setChangePasswordErrorMessage("Please enter your current password.");
      return;
    }

    if (!newPassword) {
      setChangePasswordErrorMessage("Please enter a new password.");
      return;
    }

    if (newStrengthLevel !== "strong") {
      setChangePasswordErrorMessage("New password must be STRONG to be saved.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setChangePasswordErrorMessage("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    const response = await AuthService.changePassword({
      citizenUserId: userProfile.citizen_user_id || 0,
      email: userProfile.email,
      currentPassword,
      newPassword,
    });
    setIsChangingPassword(false);

    if (response.status === "success") {
      // Clear fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setIsChangePasswordModalVisible(false);

      setIsSuccessToastVisible(true);
      setTimeout(() => {
        setIsSuccessToastVisible(false);
      }, 2500);
    } else {
      setChangePasswordErrorMessage(
        response.message || "Failed to update password.",
      );
    }
  };

  // 1. Fetch Profile Data from PHP API (get-profile.php) - Skip if Guest Mode
  const fetchProfileFromApi = async () => {
    if (isGuestMode) return;

    const identifierToUse =
      activeEmail || activePhone || userProfile.email || userProfile.phone;
    const response = await ProfileService.getProfile(
      identifierToUse,
      activeUserId || userProfile.citizen_user_id,
      activePhone,
    );

    if (response.status === "success" && response.data) {
      const data = response.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        fullName:
          data.fullName ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          prev.fullName ||
          "Civentral Citizen",
        initials:
          data.initials ||
          (data.first_name
            ? data.first_name.charAt(0).toUpperCase()
            : prev.initials || "CC"),
        status: data.status || "Active",
        isVerified: true,
        registryCompleted: true,
      }));
      if (response.data.biometricEnabled !== undefined) {
        setBiometricsEnabled(response.data.biometricEnabled);
      }
    }
  };

  useEffect(() => {
    async function loadData() {
      if (isGuestMode) {
        setIsLoadingApi(false);
        return;
      }
      setIsLoadingApi(true);
      await fetchProfileFromApi();
      setIsLoadingApi(false);
    }
    loadData();
  }, [isGuestMode, activeEmail, activeUserId]);

  const handleRefresh = async () => {
    if (isGuestMode) return;
    setIsRefreshing(true);
    await fetchProfileFromApi();
    setIsRefreshing(false);
  };

  // 2. Update Profile to API & Local State
  const handleSaveProfile = async () => {
    const updatedPhone = editPhone.trim();
    const updatedEmail = editEmail.trim();
    const updatedAddress = editAddress.trim();

    setIsSaving(true);

    setUserProfile((prev) => ({
      ...prev,
      phone: updatedPhone,
      email: updatedEmail,
      address: updatedAddress,
    }));

    if (!isGuestMode) {
      await ProfileService.updateProfile({
        citizen_user_id: userProfile.citizen_user_id,
        email: updatedEmail,
        phone: updatedPhone,
        address: updatedAddress,
      });
    }

    setIsSaving(false);
    setIsEditProfileModalVisible(false);

    Alert.alert(
      "Profile Updated",
      "Your contact details have been successfully updated in your profile.",
    );
  };

  const handleSignOut = () => {
    if (isGuestMode) {
      AuthService.clearCurrentUser();
      router.replace("/(auth)");
      return;
    }
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalVisible(false);
    AuthService.clearCurrentUser();
    router.replace("/(auth)");
  };

  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
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
        {/* Top Citizen ID Header Card */}
        <View
          style={[
            styles.headerCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {userProfile.initials || (isGuestMode ? "GR" : "...")}
              </Text>
              <View
                style={[
                  styles.onlineBadgeDot,
                  isGuestMode && styles.guestBadgeDot,
                ]}
              />
            </View>
            <View style={styles.headerInfo}>
              <View style={styles.nameRow}>
                <Text
                  style={[
                    styles.userNameText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {userProfile.fullName || "Loading Profile..."}
                </Text>
              </View>
              {userProfile.citizenId ? (
                <Text
                  style={[
                    styles.citizenIdText,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  ID: {userProfile.citizenId}
                </Text>
              ) : null}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <IconSymbol
                  name="location.fill"
                  size={12}
                  color="#176B87"
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.barangayText,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  {userProfile.barangay
                    ? `${userProfile.barangay}, Caloocan City`
                    : "Caloocan City Resident"}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.qrHeaderBtn,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => setIsQrModalVisible(true)}
              activeOpacity={0.8}
            >
              <IconSymbol name="qrcode" size={24} color="#176B87" />
              <Text style={styles.qrBtnLabel}>QR ID</Text>
            </TouchableOpacity>
          </View>

          {/* Status Badges */}
          <View style={styles.badgesRow}>
            <Badge
              label={
                isGuestMode
                  ? "GUEST USER"
                  : `${(userProfile.status || "Active").toUpperCase()} RESIDENT`
              }
              variant={isGuestMode ? "neutral" : "success"}
            />
            <View style={styles.badgeSpacer} />
            <Badge
              label={
                isGuestMode
                  ? "TEMPORARY SESSION"
                  : userProfile.memberSince
                    ? `MEMBER SINCE ${userProfile.memberSince.toUpperCase()}`
                    : "REGISTERED CITIZEN"
              }
              variant="neutral"
            />
          </View>
        </View>

        {/* Tab Navigation Controls (Overview and Settings only) */}
        <View
          style={[
            styles.tabBarContainer,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "overview" &&
                (isDarkMode
                  ? { backgroundColor: "#176B87" }
                  : styles.tabButtonActive),
            ]}
            onPress={() => setActiveTab("overview")}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="person.crop.circle.fill"
                size={16}
                color={
                  activeTab === "overview"
                    ? isDarkMode
                      ? "#FFFFFF"
                      : "#176B87"
                    : isDarkMode
                      ? "#94A3B8"
                      : "#64748B"
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "overview" && styles.tabButtonTextActive,
                  isDarkMode && {
                    color: activeTab === "overview" ? "#FFFFFF" : "#E2E8F0",
                    fontWeight: "700",
                  },
                ]}
              >
                Overview
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "settings" &&
                (isDarkMode
                  ? { backgroundColor: "#176B87" }
                  : styles.tabButtonActive),
            ]}
            onPress={() => setActiveTab("settings")}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="gearshape.fill"
                size={16}
                color={
                  activeTab === "settings"
                    ? isDarkMode
                      ? "#FFFFFF"
                      : "#176B87"
                    : isDarkMode
                      ? "#94A3B8"
                      : "#64748B"
                }
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabButtonText,
                  activeTab === "settings" && styles.tabButtonTextActive,
                  isDarkMode && {
                    color: activeTab === "settings" ? "#FFFFFF" : "#E2E8F0",
                    fontWeight: "700",
                  },
                ]}
              >
                Settings
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {isLoadingApi && !isRefreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#176B87" />
            <Text style={styles.loadingText}>
              Loading profile from get-profile.php...
            </Text>
          </View>
        ) : null}

        {/* TAB CONTENT: 1. OVERVIEW */}
        {activeTab === "overview" && (
          <View style={styles.sectionStack}>
            {/* Personal Details Card */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardHeaderLeft}>
                  <IconSymbol name="person.fill" size={20} color="#176B87" />
                  <Text
                    style={[
                      styles.cardTitle,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    Personal Information
                  </Text>
                </View>
                {!isGuestMode && (
                  <TouchableOpacity
                    onPress={() => {
                      setEditPhone(userProfile.phone);
                      setEditEmail(userProfile.email);
                      setEditAddress(userProfile.address);
                      setIsEditProfileModalVisible(true);
                    }}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.editIconBadge,
                        isDarkMode && { backgroundColor: "#176B87" },
                      ]}
                    >
                      <IconSymbol name="pencil" size={14} color="#FFFFFF" />
                      <Text
                        style={[
                          styles.editText,
                          isDarkMode && { color: "#FFFFFF" },
                        ]}
                      >
                        Edit
                      </Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoRow}>
                  <IconSymbol
                    name="envelope.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      Email Address
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.email || "Not set"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.infoRow}>
                  <IconSymbol
                    name="phone.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      Mobile Number
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.phone || "Not provided"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.infoRow}>
                  <IconSymbol
                    name="location.fill"
                    size={16}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      Registered Address
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.address
                        ? userProfile.address
                        : "Not set (Complete in Citizen Services)"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.infoDivider,
                    isDarkMode && { backgroundColor: "#3A506B" },
                  ]}
                />

                <View style={styles.twoColumnRow}>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      Last Active Login
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {userProfile.lastLogin || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.columnHalf}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      Registry Status
                    </Text>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {isGuestMode ? "Guest Session" : "Active (Verified)"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Digital Citizen ID Card Preview (Located Bottom of Personal Info) */}
            <View style={styles.citizenIdCard}>
              <View style={styles.citizenIdHeader}>
                <View style={styles.idHeaderRow}>
                  <Text style={styles.idRepublicText}>
                    REPUBLIC OF THE PHILIPPINES
                  </Text>
                  <Text style={styles.idCityText}>
                    CITY GOVERNMENT OF CALOOCAN
                  </Text>
                </View>
                <Text style={styles.idCardTitle}>
                  DIGITAL CITIZEN RESIDENT CARD
                </Text>
              </View>

              <View style={styles.idBodyRow}>
                <View style={styles.idPhotoBox}>
                  <Text style={styles.idPhotoText}>
                    {userProfile.initials || (isGuestMode ? "GR" : "...")}
                  </Text>
                  <View style={styles.idCheckBadge}>
                    <IconSymbol
                      name="checkmark.seal.fill"
                      size={14}
                      color="#16A34A"
                    />
                  </View>
                </View>

                <View style={styles.idInfoCol}>
                  <Text style={styles.idLabel}>FULL NAME</Text>
                  <Text style={styles.idValueName}>
                    {userProfile.fullName || "Citizen Resident"}
                  </Text>

                  <Text style={[styles.idLabel, { marginTop: 4 }]}>
                    CITIZEN ID NO.
                  </Text>
                  <Text style={styles.idValueHighlight}>
                    {userProfile.citizenId || "Pending Generation"}
                  </Text>

                  <Text style={[styles.idLabel, { marginTop: 4 }]}>
                    BARANGAY RESIDENCE
                  </Text>
                  <Text style={styles.idValueSub}>
                    {userProfile.barangay
                      ? `${userProfile.barangay}, Caloocan City`
                      : "Caloocan City Resident"}
                  </Text>
                </View>
              </View>

              {/* Complete ID Action CTA */}
              <View style={styles.idFooterBanner}>
                <View style={styles.idFooterTextStack}>
                  <Text style={styles.idFooterNoticeTitle}>
                    Need Complete Citizen ID Verification?
                  </Text>
                  <Text style={styles.idFooterNoticeSub}>
                    To finish full details, submit documents & get your official
                    ID, visit Citizen Services.
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.finishIdBtn}
                  onPress={() => router.push("/(tabs)/services" as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.finishIdBtnText}>
                    Complete Citizen ID in Services
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* TAB CONTENT: 2. SETTINGS & SECURITY */}
        {activeTab === "settings" && (
          <View style={styles.sectionStack}>
            {/* App Appearance & Theme (Dark & Light Mode) */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Appearance & Theme
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name={isDarkMode ? "moon.stars.fill" : "sun.max.fill"}
                      size={18}
                      color={isDarkMode ? "#A855F7" : "#F59E0B"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {isDarkMode ? "Dark Mode" : "Light Mode"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    {isDarkMode
                      ? "Sleek dark theme active for Civentral"
                      : "Bright modern light theme active for Civentral"}
                  </Text>
                </View>
                <Switch
                  value={isDarkMode}
                  onValueChange={setIsDarkMode}
                  trackColor={{ false: isDarkMode ? "#334155" : "#CBD5E1", true: isDarkMode ? "#38BDF8" : "#176B87" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* Account & Security */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Security & Biometrics
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="fingerprint"
                      size={18}
                      color={isDarkMode ? "#38BDF8" : "#176B87"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      Biometric Sign-In
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    Use Fingerprint or Face ID for fast login
                  </Text>
                </View>
                <Switch
                  value={biometricsEnabled}
                  onValueChange={setBiometricsEnabled}
                  trackColor={{ false: isDarkMode ? "#334155" : "#CBD5E1", true: isDarkMode ? "#38BDF8" : "#176B87" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() => setIsChangePasswordModalVisible(true)}
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol name="lock.fill" size={18} color={isDarkMode ? "#38BDF8" : "#176B87"} />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    Change Account Password
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>
            </View>

            {/* Notifications */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Notifications & Alerts
              </Text>

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="bell.fill"
                      size={18}
                      color={isDarkMode ? "#38BDF8" : "#176B87"}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      City Push Notifications
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    Receive updates on civic services & announcements
                  </Text>
                </View>
                <Switch
                  value={pushNotificationsEnabled}
                  onValueChange={setPushNotificationsEnabled}
                  trackColor={{ false: isDarkMode ? "#334155" : "#CBD5E1", true: isDarkMode ? "#38BDF8" : "#176B87" }}
                  thumbColor="#FFFFFF"
                />
              </View>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.settingRow}>
                <View style={styles.settingTextStack}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <IconSymbol
                      name="exclamationmark.triangle.fill"
                      size={18}
                      color="#EF4444"
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.settingLabel,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      Emergency SOS Broadcasts
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.settingSub,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    Receive real-time disaster & emergency warnings
                  </Text>
                </View>
                <Switch
                  value={sosAlertsEnabled}
                  onValueChange={setSosAlertsEnabled}
                  trackColor={{ false: isDarkMode ? "#334155" : "#CBD5E1", true: "#DC2626" }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>

            {/* App Info & Legal */}
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <Text
                style={[
                  styles.cardSectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Support & About
              </Text>

              <TouchableOpacity
                style={styles.settingActionRow}
                onPress={() =>
                  Alert.alert(
                    "City Hall Support Hotline",
                    "Connecting to Caloocan City Citizen Desk: (02) 8888-CALOOCAN",
                  )
                }
                activeOpacity={0.7}
              >
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="help.circle.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#176B87"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    City Hall Citizen Help Desk
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color={isDarkMode ? "#64748B" : "#94A3B8"} />
              </TouchableOpacity>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.settingActionRow}>
                <View style={styles.settingLeftIcon}>
                  <IconSymbol name="shield.fill" size={18} color={isDarkMode ? "#38BDF8" : "#64748B"} />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    Privacy & Data Protection Policy
                  </Text>
                </View>
                <IconSymbol name="chevron.right" size={18} color="#94A3B8" />
              </View>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.versionRow}>
                <Text
                  style={[
                    styles.versionLabel,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  Civentral Citizen App
                </Text>
                <Text
                  style={[
                    styles.versionValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  v2.4.1 (Build 2026)
                </Text>
              </View>
            </View>

            {/* Sign Out / Exit Guest Mode Button */}
            <TouchableOpacity
              style={styles.signOutBtn}
              onPress={handleSignOut}
              activeOpacity={0.85}
            >
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={20}
                color="#EF4444"
              />
              <Text style={styles.signOutBtnText}>
                {isGuestMode
                  ? "Exit Guest Mode / Sign In"
                  : "Log Out of Civentral"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* MODAL 1: QR CODE FULLSCREEN */}
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
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <View style={styles.qrModalHeader}>
              <Text
                style={[
                  styles.qrModalTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Civentral Resident Pass
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                activeOpacity={0.7}
                style={[
                  styles.closeBtn,
                  isDarkMode && { backgroundColor: "#0B132B" },
                ]}
              >
                <Text
                  style={[
                    styles.closeBtnText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.qrCodeBox,
                isDarkMode && {
                  backgroundColor: "#FFFFFF",
                  padding: 12,
                  borderRadius: 16,
                },
              ]}
            >
              <IconSymbol name="qrcode" size={180} color="#0F172A" />
            </View>

            <Text
              style={[styles.qrCitizenName, isDarkMode && { color: "#F8FAFC" }]}
            >
              {userProfile.fullName || "Citizen Resident"}
            </Text>
            <Text
              style={[styles.qrCitizenId, isDarkMode && { color: "#38BDF8" }]}
            >
              {userProfile.citizenId || "CITIZEN-PASS"}
            </Text>
            <Badge
              label={
                isGuestMode
                  ? "GUEST PASS • CALOOCAN CITY"
                  : "ACTIVE RESIDENT • CALOOCAN CITY"
              }
              variant={isGuestMode ? "neutral" : "success"}
            />

            <Text
              style={[styles.qrInstruction, isDarkMode && { color: "#CBD5E1" }]}
            >
              Scan this QR code at City Hall entry points, Barangay Health
              Centers, or Civic Service counters.
            </Text>

            <TouchableOpacity
              style={styles.qrCloseActionBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.qrCloseActionText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* MODAL: LOGOUT CONFIRMATION */}
      <Modal
        visible={isLogoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsLogoutModalVisible(false)}
      >
        <View style={styles.logoutOverlay}>
          <View
            style={[
              styles.logoutCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            {/* Warning Icon Ring */}
            <View
              style={[
                styles.logoutIconRing,
                isDarkMode && { backgroundColor: "#451A03" },
              ]}
            >
              <IconSymbol
                name="rectangle.portrait.and.arrow.right"
                size={32}
                color="#EF4444"
              />
            </View>

            {/* Header Text */}
            <Text
              style={[styles.logoutTitle, isDarkMode && { color: "#F8FAFC" }]}
            >
              Sign Out of Civentral?
            </Text>
            <Text
              style={[
                styles.logoutSubtitle,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              You are about to leave your secure citizen session. You will need
              to sign in again to access your government services.
            </Text>

            {/* Citizen Info Preview Strip */}
            <View
              style={[
                styles.logoutCitizenStrip,
                isDarkMode && {
                  backgroundColor: "#0B132B",
                  borderColor: "#3A506B",
                },
              ]}
            >
              <View style={styles.logoutCitizenAvatar}>
                <Text style={styles.logoutCitizenAvatarText}>
                  {userProfile.initials || "CR"}
                </Text>
              </View>
              <View style={styles.logoutCitizenInfo}>
                <Text
                  style={[
                    styles.logoutCitizenName,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  {userProfile.fullName || "Citizen Resident"}
                </Text>
                <Text
                  style={[
                    styles.logoutCitizenId,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  {userProfile.citizenId || "CALOOCAN CITY RESIDENT"}
                </Text>
              </View>
              <View style={styles.logoutActiveBadge}>
                <View style={styles.logoutActiveDot} />
                <Text style={styles.logoutActiveLabel}>ACTIVE</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.logoutActionsCol}>
              <TouchableOpacity
                style={styles.logoutConfirmBtn}
                onPress={handleConfirmLogout}
                activeOpacity={0.88}
              >
                <IconSymbol
                  name="rectangle.portrait.and.arrow.right"
                  size={18}
                  color="#FFFFFF"
                />
                <Text style={styles.logoutConfirmText}>Yes, Sign Me Out</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.logoutCancelBtn,
                  isDarkMode && {
                    backgroundColor: "#334155",
                    borderColor: "#475569",
                  },
                ]}
                onPress={() => setIsLogoutModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.logoutCancelText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Keep Me Signed In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer Security Notice */}
            <View style={styles.logoutFooterNote}>
              <IconSymbol name="shield.fill" size={12} color="#94A3B8" />
              <Text
                style={[
                  styles.logoutFooterText,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                {" "}
                Secured by Caloocan City E-Governance Portal
              </Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 2: EDIT PROFILE */}
      <Modal
        visible={isEditProfileModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsEditProfileModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.editModalContainer,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.modalHeaderTitle,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Update Contact Details
            </Text>
            <Text
              style={[
                styles.modalHeaderSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Ensure your email, mobile number, and address are up to date.
            </Text>

            <Text
              style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}
            >
              Mobile Number
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: "#3A506B",
                  color: "#F8FAFC",
                },
              ]}
              placeholder="e.g. +63 917 123 4567"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <Text
              style={[
                styles.inputLabel,
                { marginTop: 12 },
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Email Address
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: "#3A506B",
                  color: "#F8FAFC",
                },
              ]}
              placeholder="Enter email"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              value={editEmail}
              onChangeText={setEditEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text
              style={[
                styles.inputLabel,
                { marginTop: 12 },
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Registered Address
            </Text>
            <TextInput
              style={[
                styles.modalInput,
                { height: 60 },
                isDarkMode && {
                  backgroundColor: "#0F172A",
                  borderColor: "#3A506B",
                  color: "#F8FAFC",
                },
              ]}
              placeholder="Enter complete residential address"
              placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
              value={editAddress}
              onChangeText={setEditAddress}
              multiline
            />

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                style={[
                  styles.modalCancelBtn,
                  isDarkMode && { backgroundColor: "#334155" },
                ]}
                onPress={() => setIsEditProfileModalVisible(false)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.modalCancelText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalSaveBtn}
                onPress={handleSaveProfile}
                disabled={isSaving}
                activeOpacity={0.85}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.modalSaveText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MODAL 3: CHANGE PASSWORD */}
      <Modal
        visible={isChangePasswordModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsChangePasswordModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardAvoidOverlay}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.changePasswordModalContainer,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                  borderWidth: 1,
                },
              ]}
            >
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.changePasswordScrollContent}
              >
                <Text
                  style={[
                    styles.modalHeaderTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Change Account Password
                </Text>
                <Text
                  style={[
                    styles.modalHeaderSub,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Protect your citizen account by setting a new strong password.
                </Text>

                {/* Current Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Current Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Enter current password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={currentPassword}
                    onChangeText={(text) => {
                      setCurrentPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isCurrentPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() => setIsCurrentPasswordVisible((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isCurrentPasswordVisible ? "eye.slash.fill" : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* New Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    { marginTop: 12 },
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  New Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Enter new password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={newPassword}
                    onChangeText={(text) => {
                      setNewPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isNewPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() => setIsNewPasswordVisible((prev) => !prev)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isNewPasswordVisible ? "eye.slash.fill" : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* REAL-TIME PASSWORD STRENGTH METER */}
                {newPassword.length > 0 && (
                  <View
                    style={[
                      styles.strengthMeterContainer,
                      isDarkMode && {
                        backgroundColor: "#0F172A",
                        borderColor: "#3A506B",
                      },
                    ]}
                  >
                    {/* 3 Color Bars */}
                    <View style={styles.strengthBarRow}>
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "weak" && styles.barWeak,
                          newStrengthLevel === "medium" && styles.barMedium,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "medium" && styles.barMedium,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                      <View
                        style={[
                          styles.strengthBar,
                          newStrengthLevel === "strong" && styles.barStrong,
                        ]}
                      />
                    </View>

                    {/* Strength Label & Status */}
                    <View style={styles.strengthLabelRow}>
                      <Text
                        style={[
                          styles.strengthPromptText,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Password Strength:
                      </Text>
                      <Text
                        style={[
                          styles.strengthText,
                          newStrengthLevel === "weak" && styles.textWeak,
                          newStrengthLevel === "medium" && styles.textMedium,
                          newStrengthLevel === "strong" && styles.textStrong,
                        ]}
                      >
                        {newStrengthLevel.toUpperCase()}
                      </Text>
                    </View>

                    {/* Password Criteria Checklist */}
                    <View style={styles.checklistContainer}>
                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasMinLength
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasMinLength ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasMinLength && styles.checkTextActive,
                          ]}
                        >
                          At least 8 characters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasUpper && newHasLower
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={
                            newHasUpper && newHasLower ? "#10B981" : "#94A3B8"
                          }
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasUpper &&
                              newHasLower &&
                              styles.checkTextActive,
                          ]}
                        >
                          Uppercase & lowercase letters
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasNumber
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasNumber ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasNumber && styles.checkTextActive,
                          ]}
                        >
                          At least 1 number (0-9)
                        </Text>
                      </View>

                      <View style={styles.checkItem}>
                        <IconSymbol
                          name={
                            newHasSymbol
                              ? "checkmark.seal.fill"
                              : "chevron.right"
                          }
                          size={14}
                          color={newHasSymbol ? "#10B981" : "#94A3B8"}
                        />
                        <Text
                          style={[
                            styles.checkText,
                            isDarkMode && { color: "#94A3B8" },
                            newHasSymbol && styles.checkTextActive,
                          ]}
                        >
                          At least 1 special symbol (!@#$%^&*)
                        </Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Confirm New Password Field */}
                <Text
                  style={[
                    styles.inputLabel,
                    { marginTop: 12 },
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Confirm New Password
                </Text>
                <View
                  style={[
                    styles.passwordWrapper,
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                    },
                  ]}
                >
                  <TextInput
                    style={[
                      styles.passwordInput,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                    placeholder="Confirm new password"
                    placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                    value={confirmNewPassword}
                    onChangeText={(text) => {
                      setConfirmNewPassword(text);
                      if (changePasswordErrorMessage)
                        setChangePasswordErrorMessage(null);
                    }}
                    secureTextEntry={!isConfirmNewPasswordVisible}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    style={styles.eyeIconBtn}
                    onPress={() =>
                      setIsConfirmNewPasswordVisible((prev) => !prev)
                    }
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name={
                        isConfirmNewPasswordVisible
                          ? "eye.slash.fill"
                          : "eye.fill"
                      }
                      size={18}
                      color={isDarkMode ? "#94A3B8" : "#64748B"}
                    />
                  </TouchableOpacity>
                </View>

                {/* Error Message */}
                {changePasswordErrorMessage ? (
                  <Text style={styles.changePasswordErrorText}>
                    {changePasswordErrorMessage}
                  </Text>
                ) : null}

                {/* Modal Actions */}
                <View style={[styles.modalActionsRow, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      isDarkMode && { backgroundColor: "#334155" },
                    ]}
                    onPress={() => {
                      setCurrentPassword("");
                      setNewPassword("");
                      setConfirmNewPassword("");
                      setChangePasswordErrorMessage(null);
                      setIsChangePasswordModalVisible(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.modalCancelText,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modalSaveBtn,
                      (isChangingPassword ||
                        newStrengthLevel !== "strong" ||
                        newPassword !== confirmNewPassword) &&
                        styles.modalSaveBtnDisabled,
                    ]}
                    onPress={handleChangePassword}
                    disabled={
                      isChangingPassword ||
                      newStrengthLevel !== "strong" ||
                      newPassword !== confirmNewPassword
                    }
                    activeOpacity={0.85}
                  >
                    {isChangingPassword ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Update Password</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL 4: SUCCESS TOAST POPUP */}
      <Modal
        visible={isSuccessToastVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSuccessToastVisible(false)}
      >
        <View style={styles.successToastOverlay}>
          <View style={styles.successToastCard}>
            <View style={styles.successToastCheckCircle}>
              <IconSymbol
                name="checkmark.seal.fill"
                size={38}
                color="#FFFFFF"
              />
            </View>
            <Text style={styles.successToastTitle}>Password Updated</Text>
            <Text style={styles.successToastSub}>
              Your account password has been changed successfully.
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
