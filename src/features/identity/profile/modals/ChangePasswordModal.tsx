import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { AuthService } from "@/src/services/auth-service";
import { styles } from "../../styles/ProfileScreen.styles";

export interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
  userProfile: {
    citizen_user_id?: number;
    email?: string;
    [key: string]: any;
  };
  isDarkMode: boolean;
}

export function ChangePasswordModal({
  visible,
  onClose,
  onSuccess,
  userProfile,
  isDarkMode,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [isCurrentPasswordVisible, setIsCurrentPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmNewPasswordVisible, setIsConfirmNewPasswordVisible] = useState(false);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [changePasswordErrorMessage, setChangePasswordErrorMessage] = useState<string | null>(null);

  const newHasMinLength = newPassword.length >= 8;
  const newHasUpper = /[A-Z]/.test(newPassword);
  const newHasLower = /[a-z]/.test(newPassword);
  const newHasNumber = /[0-9]/.test(newPassword);
  const newHasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const getNewStrengthLevel = (): "weak" | "medium" | "strong" | "" => {
    if (newPassword.length === 0) return "";
    let score = 0;
    if (newHasMinLength) score++;
    if (newHasUpper && newHasLower) score++;
    if (newHasNumber) score++;
    if (newHasSymbol) score++;

    if (score >= 4 && newHasMinLength) {
      return "strong";
    } else if (score >= 3 && newHasMinLength) {
      return "medium";
    } else {
      return "weak";
    }
  };

  const newStrengthLevel = getNewStrengthLevel();

  const resetForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmNewPassword("");
    setChangePasswordErrorMessage(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
      email: userProfile.email || "",
      currentPassword,
      newPassword,
    });
    setIsChangingPassword(false);

    if (response.status === "success") {
      resetForm();
      onClose();
      onSuccess("Account password updated successfully.");
    } else {
      setChangePasswordErrorMessage(
        response.message || "Failed to update password."
      );
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
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
                  onPress={handleClose}
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
  );
}
