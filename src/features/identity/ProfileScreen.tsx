import React, { useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { useTheme } from "@/src/context/ThemeContext";
import { AuthService } from "@/src/services/auth-service";
import { styles } from "./styles/ProfileScreen.styles";
import { useProfileData } from "./profile/hooks";
import {
  ProfileHeaderCard,
  ProfileOverviewTab,
  ProfileSettingsTab,
  ProfileSkeletonLoading,
} from "./profile/components";
import {
  ChangePasswordModal,
  CitizenQrModal,
  EditProfileModal,
  EmailVerificationModal,
  LogoutConfirmModal,
  LogoutLoadingModal,
  PhoneVerificationModal,
  SuccessToastModal,
  TwoFactorAuthModal,
} from "./profile/modals";

export function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    isGuest?: string;
    email?: string;
    phone?: string;
    citizenUserId?: string;
  }>();

  const {
    isGuestMode,
    isLoadingApi,
    isRefreshing,
    isSavingProfile,
    userProfile,
    setUserProfile,
    verificationStatus,
    verificationData,
    isCitizenApproved,
    effectiveCitizenIdNumber,
    verifiedPhotoUrl,
    verifiedMunicipalAddress,
    handleRefresh,
    handleSaveProfile,
  } = useProfileData(params);

  // Active sub-tab state: 'overview' | 'settings'
  const [activeTab, setActiveTab] = useState<"overview" | "settings">(
    "overview",
  );

  // Settings State & Theme
  const { isDarkMode, setIsDarkMode } = useTheme();
  const [biometricsEnabled, setBiometricsEnabled] = useState(
    userProfile.biometricEnabled,
  );
  const [pushNotificationsEnabled, setPushNotificationsEnabled] =
    useState(true);
  const [sosAlertsEnabled, setSosAlertsEnabled] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // Modals & Popups
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);
  const [isEditProfileModalVisible, setIsEditProfileModalVisible] =
    useState(false);
  const [isLogoutModalVisible, setIsLogoutModalVisible] = useState(false);
  const [isChangePasswordModalVisible, setIsChangePasswordModalVisible] =
    useState(false);
  const [isPhoneModalVisible, setIsPhoneModalVisible] = useState(false);
  const [isEmailModalVisible, setIsEmailModalVisible] = useState(false);
  const [isTwoFactorModalVisible, setIsTwoFactorModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Success Toast state
  const [isSuccessToastVisible, setIsSuccessToastVisible] = useState(false);
  const [successToastTitle, setSuccessToastTitle] = useState("Password Updated");
  const [successToastMessage, setSuccessToastMessage] = useState(
    "Your account password has been changed successfully.",
  );

  const showSuccessToast = (title: string, message: string) => {
    setSuccessToastTitle(title);
    setSuccessToastMessage(message);
    setIsSuccessToastVisible(true);
    setTimeout(() => {
      setIsSuccessToastVisible(false);
    }, 2500);
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
        <ProfileHeaderCard
          userProfile={userProfile}
          effectiveCitizenIdNumber={effectiveCitizenIdNumber}
          verifiedPhotoUrl={verifiedPhotoUrl}
          isGuestMode={isGuestMode}
          verificationStatus={verificationStatus}
          onOpenQr={() => setIsQrModalVisible(true)}
          onNavigateVerify={() => router.push("/(auth)/verify-citizen" as any)}
          isDarkMode={isDarkMode}
        />

        {/* Tab Navigation Controls (Overview and Settings) */}
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
                name="person.crop.circle"
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

        {/* Tab 1: Overview Tab */}
        {activeTab === "overview" && (
          <ProfileOverviewTab
            userProfile={userProfile}
            isGuestMode={isGuestMode}
            verificationStatus={verificationStatus}
            verificationData={verificationData}
            isCitizenApproved={isCitizenApproved}
            verifiedMunicipalAddress={verifiedMunicipalAddress}
            onOpenEditProfile={() => setIsEditProfileModalVisible(true)}
            isDarkMode={isDarkMode}
          />
        )}

        {/* Tab 2: Settings Tab */}
        {activeTab === "settings" && (
          <ProfileSettingsTab
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            biometricsEnabled={biometricsEnabled}
            setBiometricsEnabled={setBiometricsEnabled}
            pushNotificationsEnabled={pushNotificationsEnabled}
            setPushNotificationsEnabled={setPushNotificationsEnabled}
            sosAlertsEnabled={sosAlertsEnabled}
            setSosAlertsEnabled={setSosAlertsEnabled}
            onOpenChangePassword={() => setIsChangePasswordModalVisible(true)}
            onOpenTwoFactor={() => setIsTwoFactorModalVisible(true)}
            onOpenVerifyPhone={() => setIsPhoneModalVisible(true)}
            onOpenVerifyEmail={() => setIsEmailModalVisible(true)}
            onSignOut={handleSignOut}
            isGuestMode={isGuestMode}
          />
        )}
      </ScrollView>

      {/* Extracted Modals */}
      <CitizenQrModal
        visible={isQrModalVisible}
        onClose={() => setIsQrModalVisible(false)}
        isCitizenApproved={isCitizenApproved}
        isGuestMode={isGuestMode}
        effectiveCitizenIdNumber={effectiveCitizenIdNumber}
        verificationData={verificationData}
        userProfile={userProfile}
        isDarkMode={isDarkMode}
      />

      <LogoutConfirmModal
        visible={isLogoutModalVisible}
        onClose={() => setIsLogoutModalVisible(false)}
        onConfirm={handleConfirmLogout}
        isLoggingOut={isLoggingOut}
        userProfile={userProfile}
        isDarkMode={isDarkMode}
      />

      <EditProfileModal
        visible={isEditProfileModalVisible}
        onClose={() => setIsEditProfileModalVisible(false)}
        initialPhone={userProfile.phone || ""}
        initialEmail={userProfile.email || ""}
        initialAddress={userProfile.address || ""}
        onSave={(data) => handleSaveProfile(data, () => setIsEditProfileModalVisible(false))}
        isSaving={isSavingProfile}
        isDarkMode={isDarkMode}
      />

      <ChangePasswordModal
        visible={isChangePasswordModalVisible}
        onClose={() => setIsChangePasswordModalVisible(false)}
        onSuccess={(msg) =>
          showSuccessToast(
            "Password Updated",
            msg || "Your account password has been changed successfully.",
          )
        }
        userProfile={userProfile}
        isDarkMode={isDarkMode}
      />

      <PhoneVerificationModal
        visible={isPhoneModalVisible}
        onClose={() => setIsPhoneModalVisible(false)}
        currentPhone={userProfile.phone || ""}
        onVerified={(verifiedPhone) => {
          setUserProfile((prev) => ({ ...prev, phone: verifiedPhone }));
          showSuccessToast("Phone Verified", "Your mobile number has been verified.");
        }}
        isDarkMode={isDarkMode}
      />

      <EmailVerificationModal
        visible={isEmailModalVisible}
        onClose={() => setIsEmailModalVisible(false)}
        currentEmail={userProfile.email || ""}
        onVerified={(verifiedEmail) => {
          setUserProfile((prev) => ({ ...prev, email: verifiedEmail }));
          showSuccessToast("Email Verified", "Your email address has been verified.");
        }}
        isDarkMode={isDarkMode}
      />

      <TwoFactorAuthModal
        visible={isTwoFactorModalVisible}
        onClose={() => setIsTwoFactorModalVisible(false)}
        isEnabled={isTwoFactorEnabled}
        onToggle2FA={(enabled) => {
          setIsTwoFactorEnabled(enabled);
          showSuccessToast(
            enabled ? "2FA Enabled" : "2FA Disabled",
            enabled
              ? "Two-factor authentication is now active on your account."
              : "Two-factor authentication has been disabled.",
          );
        }}
        isDarkMode={isDarkMode}
      />

      {/* Success Toast Popup */}
      <SuccessToastModal
        visible={isSuccessToastVisible}
        title={successToastTitle}
        message={successToastMessage}
        onClose={() => setIsSuccessToastVisible(false)}
      />

      {/* Logout Loading Overlay */}
      <LogoutLoadingModal
        visible={isLoggingOut}
        isDarkMode={isDarkMode}
      />
    </View>
  );
}
