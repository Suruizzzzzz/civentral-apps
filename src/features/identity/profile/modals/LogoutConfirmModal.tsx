import React from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../../styles/ProfileScreen.styles";

export interface LogoutConfirmModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut: boolean;
  userProfile: {
    initials?: string;
    fullName?: string;
    citizenId?: string;
    [key: string]: any;
  };
  isDarkMode: boolean;
}

export function LogoutConfirmModal({
  visible,
  onClose,
  onConfirm,
  isLoggingOut,
  userProfile,
  isDarkMode,
}: LogoutConfirmModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
                {userProfile.citizenId || "CIVENTRAL CITY RESIDENT"}
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
              onPress={onConfirm}
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
              onPress={onClose}
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
              Secured by Civentral City E-Governance Portal
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}
