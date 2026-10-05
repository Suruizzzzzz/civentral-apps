import { Badge } from "@/src/components/ui/Badge";
import { OfficialCitizenCard, resolveCardAssetUrl } from "./components/OfficialCitizenCard";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { useTheme } from "@/src/context/ThemeContext";
import { AuthService } from "@/src/services/auth-service";
import {
  CitizenProfileData,
  ProfileService,
} from "@/src/services/profile-service";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
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
import QRCode from "react-native-qrcode-svg";
import { styles } from "./styles/ProfileScreen.styles";

function SkeletonItem({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const { isDarkMode } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const baseColor = isDarkMode ? "#2A3656" : "#E2E8F0";

  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

function ProfileSkeletonLoading({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card Skeleton */}
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
            <SkeletonItem width={64} height={64} borderRadius={32} />
            <View style={[styles.headerInfo, { gap: 8 }]}>
              <SkeletonItem width="75%" height={22} borderRadius={6} />
              <SkeletonItem width="55%" height={14} borderRadius={4} />
              <SkeletonItem width="65%" height={14} borderRadius={4} />
            </View>
            <SkeletonItem width={50} height={50} borderRadius={12} />
          </View>
          <View style={[styles.badgesRow, { marginTop: 16 }]}>
            <SkeletonItem width={120} height={24} borderRadius={12} />
            <SkeletonItem width={140} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Tab Switcher Skeleton */}
        <View
          style={[
            styles.tabBarContainer,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <SkeletonItem width="48%" height={38} borderRadius={10} />
          <SkeletonItem width="48%" height={38} borderRadius={10} />
        </View>

        {/* Section Card 1 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18 },
          ]}
        >
          <SkeletonItem width={180} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
          </View>
        </View>

        {/* Section Card 2 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18, marginTop: 16 },
          ]}
        >
          <SkeletonItem width={160} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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

  // Citizen Identity Verification State
  const [verificationStatus, setVerificationStatus] = useState<
    'Not_Submitted' | 'Pending' | 'Under_Review' | 'Returned_For_Correction' | 'Approved' | 'Rejected'
  >('Not_Submitted');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [avatarPhotoError, setAvatarPhotoError] = useState(false);

  const isCitizenApproved = verificationStatus === 'Approved';

  const effectiveCitizenIdNumber = useMemo(() => {
    return (
      verificationData?.citizen_id_number ||
      userProfile.citizenId ||
      (isCitizenApproved ? 'CAL-2026-000006' : '')
    );
  }, [verificationData, userProfile.citizenId, isCitizenApproved]);

  const rawPhotoUrl =
    verificationData?.photo_1x1_url ||
    (userProfile as any)?.photo_1x1_url ||
    (userProfile as any)?.avatar_url ||
    (userProfile as any)?.avatar;

  const verifiedPhotoUrl = useMemo(() => {
    if (!isCitizenApproved && !userProfile.isVerified) {
      return null;
    }
    return resolveCardAssetUrl(rawPhotoUrl);
  }, [isCitizenApproved, userProfile.isVerified, rawPhotoUrl]);

  const verifiedMunicipalAddress = useMemo(() => {
    if (isCitizenApproved && verificationData) {
      const parts = [
        verificationData.street_address,
        verificationData.barangay
          ? verificationData.barangay.toLowerCase().startsWith('barangay')
            ? verificationData.barangay
            : `Barangay ${verificationData.barangay}`
          : '',
        verificationData.district ? `District ${verificationData.district}` : '',
        verificationData.city || process.env.EXPO_PUBLIC_CITY_NAME || 'Caloocan City',
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
      if (verificationData.address) return verificationData.address;
    }
    return userProfile.address || '';
  }, [isCitizenApproved, verificationData, userProfile.address]);

  // Modals & Loading
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

    try {
      const vRes = await ProfileService.getVerificationStatus(
        activeUserId || userProfile.citizen_user_id,
        identifierToUse
      );
      if (vRes?.verification_status) {
        setVerificationStatus(vRes.verification_status);
        const combinedVData = {
          ...(vRes.data || {}),
          ...vRes,
        };
        setVerificationData(combinedVData);

        if (vRes.verification_status === 'Approved') {
          const parts = [
            combinedVData.street_address,
            combinedVData.barangay
              ? combinedVData.barangay.toLowerCase().startsWith('barangay')
                ? combinedVData.barangay
                : `Barangay ${combinedVData.barangay}`
              : '',
            combinedVData.district ? `District ${combinedVData.district}` : '',
            combinedVData.city || process.env.EXPO_PUBLIC_CITY_NAME || 'Caloocan City',
          ].filter(Boolean);
          const resolvedVerifiedAddr = parts.length > 0 ? parts.join(', ') : (combinedVData.address || '');

          setUserProfile((prev) => ({
            ...prev,
            citizenId: combinedVData.citizen_id_number || prev.citizenId,
            barangay: combinedVData.barangay || prev.barangay,
            address: resolvedVerifiedAddr || prev.address,
            first_name: combinedVData.first_name || prev.first_name,
            last_name: combinedVData.last_name || prev.last_name,
            middle_name: combinedVData.middle_name || prev.middle_name,
            suffix: combinedVData.suffix || prev.suffix,
          }));
        }
      }
    } catch {}
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

  const handleSignOut = async () => {
    if (isGuestMode) {
      setIsLoggingOut(true);
      await new Promise((resolve) => setTimeout(resolve, 800));
      AuthService.clearCurrentUser();
      setIsLoggingOut(false);
      router.replace("/(auth)");
      return;
    }
    setIsLogoutModalVisible(true);
  };

  const handleConfirmLogout = async () => {
    setIsLoggingOut(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    AuthService.clearCurrentUser();
    setIsLoggingOut(false);
    setIsLogoutModalVisible(false);
    router.replace("/(auth)");
  };

  if (isLoadingApi) {
    return <ProfileSkeletonLoading isDarkMode={isDarkMode} />;
  }

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
              {verifiedPhotoUrl && !avatarPhotoError ? (
                <Image
                  source={{ uri: verifiedPhotoUrl }}
                  style={{ width: 60, height: 60, borderRadius: 30 }}
                  resizeMode="cover"
                  onError={() => setAvatarPhotoError(true)}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userProfile.initials || (isGuestMode ? "GR" : "...")}
                </Text>
              )}
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
              {effectiveCitizenIdNumber ? (
                <Text
                  style={[
                    styles.citizenIdText,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  ID: {effectiveCitizenIdNumber}
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
            {!isGuestMode && (
              <TouchableOpacity
                onPress={() => router.push("/(auth)/verify-citizen" as any)}
                activeOpacity={0.7}
              >
                <Badge
                  label={
                    verificationStatus === 'Approved'
                      ? 'CITIZEN VERIFIED'
                      : verificationStatus === 'Pending' || verificationStatus === 'Under_Review'
                      ? 'VERIFICATION PENDING'
                      : verificationStatus === 'Returned_For_Correction'
                      ? 'REWORK REQUIRED'
                      : verificationStatus === 'Rejected'
                      ? 'VERIFICATION REJECTED'
                      : 'GET VERIFIED'
                  }
                  variant={
                    verificationStatus === 'Approved'
                      ? 'success'
                      : verificationStatus === 'Pending' || verificationStatus === 'Under_Review'
                      ? 'warning'
                      : verificationStatus === 'Returned_For_Correction' || verificationStatus === 'Rejected'
                      ? 'danger'
                      : 'info'
                  }
                />
              </TouchableOpacity>
            )}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Registered Address
                      </Text>
                      {isCitizenApproved ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#DCFCE7', paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                          <IconSymbol name="checkmark.seal.fill" size={10} color="#15803D" />
                          <Text style={{ fontSize: 9, fontWeight: '700', color: '#15803D' }}>VERIFIED</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.infoValue,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {verifiedMunicipalAddress || userProfile.address || "Not set (Complete in Citizen Services)"}
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

            {/* OFFICIAL CITIZEN CARD / VERIFICATION STATE DISPLAY */}
            {verificationStatus === 'Approved' ? (
              <OfficialCitizenCard
                first_name={verificationData?.first_name || userProfile.first_name}
                middle_name={verificationData?.middle_name || userProfile.middle_name}
                last_name={verificationData?.last_name || userProfile.last_name}
                suffix={verificationData?.suffix || userProfile.suffix}
                birth_date={verificationData?.birth_date || userProfile.birthDate}
                civil_status={verificationData?.civil_status || userProfile.civilStatus}
                sex={verificationData?.sex || 'Male'}
                street_address={verificationData?.street_address || userProfile.address}
                barangay={verificationData?.barangay || userProfile.barangay}
                district={verificationData?.district || 'District 1'}
                citizen_id_number={verificationData?.citizen_id_number || userProfile.citizenId}
                photo_1x1_url={verificationData?.photo_1x1_url}
                signature_photo_url={verificationData?.signature_photo_url}
                qr_token={verificationData?.qr_code_token}
                reviewed_at={verificationData?.reviewed_at}
                submitted_at={verificationData?.submitted_at}
                valid_until={verificationData?.valid_until}
                is_pwd={!!(verificationData?.is_pwd || verificationData?.pwd)}
                is_non_resident={!!(verificationData?.is_non_resident || verificationData?.non_resident)}
                blood_type={verificationData?.blood_type}
                emergency_contact={verificationData?.emergency_contact}
                showPrintActions={true}
              />
            ) : (verificationStatus === 'Pending' || verificationStatus === 'Under_Review') ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDarkMode ? '#451A03' : '#FFFBEB',
                    borderColor: '#F59E0B',
                    borderWidth: 1.5,
                    borderRadius: 16,
                    padding: 16,
                    gap: 12,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#F59E0B',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="clock.fill" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#FDE68A' : '#92400E' }}>
                      Identity Verification Under Review
                    </Text>
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#FCD34D' : '#B45309', marginTop: 2 }}>
                      City Civil Registry staff are currently verifying your documents.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#D97706',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    gap: 8,
                    marginTop: 4,
                  }}
                  onPress={() => router.push('/(auth)/verify-citizen' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                    Check Application Status & Timeline
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : verificationStatus === 'Returned_For_Correction' ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDarkMode ? '#431407' : '#FFF7ED',
                    borderColor: '#EA580C',
                    borderWidth: 1.5,
                    borderRadius: 16,
                    padding: 16,
                    gap: 12,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#EA580C',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#FED7AA' : '#9A3412' }}>
                      Action Required: Rework Requested
                    </Text>
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#FDBA74' : '#C2410C', marginTop: 2 }}>
                      {verificationData?.admin_action_notes || 'Registry officers requested corrections on your submitted documents.'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#EA580C',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    gap: 8,
                    marginTop: 4,
                  }}
                  onPress={() => router.push('/(auth)/verify-citizen' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                    Review Remarks & Resubmit
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : verificationStatus === 'Rejected' ? (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDarkMode ? '#450A0A' : '#FEF2F2',
                    borderColor: '#DC2626',
                    borderWidth: 1.5,
                    borderRadius: 16,
                    padding: 16,
                    gap: 12,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: '#DC2626',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="xmark.circle.fill" size={24} color="#FFFFFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#FECACA' : '#991B1B' }}>
                      Verification Application Declined
                    </Text>
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#FCA5A5' : '#B91C1C', marginTop: 2 }}>
                      {verificationData?.rejection_reason || 'Application was not approved. Tap to review and re-apply.'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#DC2626',
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    gap: 8,
                    marginTop: 4,
                  }}
                  onPress={() => router.push('/(auth)/verify-citizen' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                    Review Reason & Re-apply
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              /* NOT SUBMITTED / UNVERIFIED / GUEST */
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                    borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                    borderWidth: 1.5,
                    borderRadius: 16,
                    padding: 18,
                    gap: 14,
                  },
                ]}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <View
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 24,
                      backgroundColor: isDarkMode ? '#0F4C81' : '#E0F2FE',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <IconSymbol name="person.text.rectangle.fill" size={26} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: isDarkMode ? '#F8FAFC' : '#0F172A' }}>
                      Get Official Citizen ID Card
                    </Text>
                    <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2, lineHeight: 17 }}>
                      Submit your valid ID and selfie to receive your certified Caloocan Digital Resident Card with cryptographic QR pass.
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0F4C81',
                    paddingVertical: 13,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    gap: 8,
                  }}
                  onPress={() => router.push('/(auth)/verify-citizen' as any)}
                  activeOpacity={0.85}
                >
                  <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '800' }}>
                    Start Citizen Verification
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
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
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
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
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
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
                  <IconSymbol
                    name="lock.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#176B87"}
                  />
                  <Text
                    style={[
                      styles.settingActionText,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    Change Account Password
                  </Text>
                </View>
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={isDarkMode ? "#64748B" : "#94A3B8"}
                />
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
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: isDarkMode ? "#38BDF8" : "#176B87",
                  }}
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
                  trackColor={{
                    false: isDarkMode ? "#334155" : "#CBD5E1",
                    true: "#DC2626",
                  }}
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
                <IconSymbol
                  name="chevron.right"
                  size={18}
                  color={isDarkMode ? "#64748B" : "#94A3B8"}
                />
              </TouchableOpacity>

              <View
                style={[
                  styles.infoDivider,
                  isDarkMode && { backgroundColor: "#3A506B" },
                ]}
              />

              <View style={styles.settingActionRow}>
                <View style={styles.settingLeftIcon}>
                  <IconSymbol
                    name="shield.fill"
                    size={18}
                    color={isDarkMode ? "#38BDF8" : "#64748B"}
                  />
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
                {isCitizenApproved ? "Verified Citizen QR ID" : "Civentral Resident Pass"}
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                activeOpacity={0.7}
                style={[
                  styles.closeBtn,
                  isDarkMode && { backgroundColor: "#0B132B" },
                ]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
                {
                  backgroundColor: "#FFFFFF",
                  padding: 16,
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                },
              ]}
            >
              <QRCode
                value={
                  verificationData?.qr_code_token
                    ? `CIVENTRAL:ID:${effectiveCitizenIdNumber}|TOKEN:${verificationData.qr_code_token}`
                    : `CIVENTRAL:CITIZEN_ID:${effectiveCitizenIdNumber}`
                }
                size={180}
                backgroundColor="#FFFFFF"
                color="#0F172A"
              />
            </View>

            <Text
              style={[styles.qrCitizenName, isDarkMode && { color: "#F8FAFC" }]}
            >
              {userProfile.fullName || "Citizen Resident"}
            </Text>
            <Text
              style={[styles.qrCitizenId, isDarkMode && { color: "#38BDF8" }]}
            >
              {effectiveCitizenIdNumber}
            </Text>
            <View style={styles.qrBadgeWrapper}>
              <Badge
                label={
                  isCitizenApproved
                    ? "VERIFIED CITIZEN • CALOOCAN CITY"
                    : isGuestMode
                    ? "GUEST PASS • CALOOCAN CITY"
                    : "ACTIVE RESIDENT • CALOOCAN CITY"
                }
                variant={isCitizenApproved ? "success" : isGuestMode ? "neutral" : "info"}
                style={{
                  alignSelf: "center",
                }}
                textStyle={{
                  textAlign: "center",
                }}
              />
            </View>

            <Text
              style={[styles.qrInstruction, isDarkMode && { color: "#CBD5E1" }]}
            >
              Scan this QR code at City Hall entry points, Barangay Health
              Centers, or Civic Service counters to verify your citizen profile.
            </Text>

            <TouchableOpacity
              style={styles.qrCloseActionBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.85}
            >
              <Text style={styles.qrCloseActionText}>Close</Text>
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
                style={[
                  styles.logoutConfirmBtn,
                  isLoggingOut && { opacity: 0.8 },
                ]}
                onPress={handleConfirmLogout}
                disabled={isLoggingOut}
                activeOpacity={0.88}
              >
                {isLoggingOut ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <>
                    <IconSymbol
                      name="rectangle.portrait.and.arrow.right"
                      size={18}
                      color="#FFFFFF"
                    />
                    <Text style={styles.logoutConfirmText}>
                      Yes, Sign Me Out
                    </Text>
                  </>
                )}
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
                disabled={isLoggingOut}
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

      {/* MODAL 5: LOGOUT LOADING OVERLAY */}
      <Modal visible={isLoggingOut} transparent animationType="fade">
        <View style={styles.logoutLoadingOverlay}>
          <View
            style={[
              styles.logoutLoadingCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
                borderWidth: 1,
              },
            ]}
          >
            <ActivityIndicator size="large" color="#176B87" />
            <Text
              style={[
                styles.logoutLoadingText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Signing out safely...
            </Text>
            <Text
              style={[
                styles.logoutLoadingSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Clearing your active session
            </Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}
