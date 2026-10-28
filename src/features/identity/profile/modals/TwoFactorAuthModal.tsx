import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../../styles/ProfileScreen.styles";

export interface TwoFactorAuthModalProps {
  visible: boolean;
  onClose: () => void;
  isEnabled: boolean;
  onToggle2FA: (enabled: boolean) => Promise<void> | void;
  isDarkMode: boolean;
}

const BACKUP_CODES = [
  "8492-1049",
  "3920-5819",
  "9201-4482",
  "1194-8502",
  "7731-9024",
];

export function TwoFactorAuthModal({
  visible,
  onClose,
  isEnabled,
  onToggle2FA,
  isDarkMode,
}: TwoFactorAuthModalProps) {
  const [enabledState, setEnabledState] = useState(isEnabled);
  const [authCode, setAuthCode] = useState("");
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const secretKey = "CIVENTRAL-SEC-2026-X99Q";

  const handleToggle = async (val: boolean) => {
    setEnabledState(val);
    if (!val) {
      setIsSaving(true);
      await onToggle2FA(false);
      setIsSaving(false);
      onClose();
    }
  };

  const handleConfirmEnable = async () => {
    if (authCode.trim().length < 6) {
      setErrorMsg("Please enter the 6-digit code from your authenticator app.");
      return;
    }
    setErrorMsg(null);
    setIsSaving(true);
    await onToggle2FA(true);
    setIsSaving(false);
    setShowBackupCodes(true);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[
            styles.changePasswordModalContainer,
            { maxHeight: "90%" },
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
              borderWidth: 1,
            },
          ]}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.changePasswordScrollContent}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isDarkMode ? "#064E3B" : "#DCFCE7",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <IconSymbol name="shield.lefthalf.filled" size={18} color="#16A34A" />
                </View>
                <Text
                  style={[
                    styles.modalHeaderTitle,
                    { marginBottom: 0 },
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Two-Factor Authentication
                </Text>
              </View>
              <TouchableOpacity
                onPress={onClose}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={{ fontSize: 18, color: isDarkMode ? "#94A3B8" : "#64748B" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalHeaderSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Add an extra layer of security to your Civentral citizen identity by requiring an authenticator code when signing in.
            </Text>

            {/* Toggle Switch */}
            <View
              style={[
                styles.settingRow,
                {
                  backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                  padding: 14,
                  borderRadius: 12,
                  marginVertical: 12,
                },
              ]}
            >
              <View style={styles.settingTextStack}>
                <Text
                  style={[
                    styles.settingLabel,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Authenticator App (TOTP)
                </Text>
                <Text
                  style={[
                    styles.settingSub,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  {enabledState ? "Currently active & protecting account" : "Disabled"}
                </Text>
              </View>
              <Switch
                value={enabledState}
                onValueChange={handleToggle}
                trackColor={{
                  false: isDarkMode ? "#334155" : "#CBD5E1",
                  true: "#16A34A",
                }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* If user wants to enable 2FA */}
            {enabledState && !isEnabled && !showBackupCodes && (
              <View style={{ gap: 14, marginTop: 8 }}>
                <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                  Step 1: Scan QR Code with Authenticator App
                </Text>
                <View
                  style={{
                    alignSelf: "center",
                    backgroundColor: "#FFFFFF",
                    padding: 16,
                    borderRadius: 16,
                  }}
                >
                  <QRCode
                    value={`otpauth://totp/Civentral:Resident?secret=${secretKey}&issuer=Civentral`}
                    size={140}
                    backgroundColor="#FFFFFF"
                    color="#0F172A"
                  />
                </View>

                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                    Manual setup key:
                  </Text>
                  <Text style={{ fontSize: 13, fontWeight: "700", color: isDarkMode ? "#38BDF8" : "#0284C7", marginTop: 2 }}>
                    {secretKey}
                  </Text>
                </View>

                <Text style={[styles.inputLabel, { marginTop: 4 }, isDarkMode && { color: "#CBD5E1" }]}>
                  Step 2: Enter 6-Digit Code to Confirm
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { letterSpacing: 6, fontSize: 18, textAlign: "center", fontWeight: "700" },
                    isDarkMode && {
                      backgroundColor: "#0F172A",
                      borderColor: "#3A506B",
                      color: "#F8FAFC",
                    },
                  ]}
                  placeholder="------"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={authCode}
                  onChangeText={setAuthCode}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                {errorMsg ? (
                  <Text style={styles.changePasswordErrorText}>
                    {errorMsg}
                  </Text>
                ) : null}

                <TouchableOpacity
                  style={[
                    styles.modalSaveBtn,
                    authCode.length < 6 && styles.modalSaveBtnDisabled,
                  ]}
                  onPress={handleConfirmEnable}
                  disabled={isSaving || authCode.length < 6}
                  activeOpacity={0.85}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveText}>Enable 2-Factor Authentication</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Backup Codes Display */}
            {(showBackupCodes || (enabledState && isEnabled)) && (
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: isDarkMode ? "#0F172A" : "#FEF3C7",
                    borderColor: isDarkMode ? "#3A506B" : "#FDE68A",
                    marginTop: 12,
                    padding: 14,
                  },
                ]}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: isDarkMode ? "#FDE68A" : "#92400E", marginBottom: 6 }}>
                  Emergency Backup Codes
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? "#CBD5E1" : "#78350F", marginBottom: 10 }}>
                  Store these one-time codes safely. They can be used to recover access if you lose your authenticator device.
                </Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                  {BACKUP_CODES.map((code) => (
                    <View
                      key={code}
                      style={{
                        backgroundColor: isDarkMode ? "#1C2541" : "#FFFFFF",
                        paddingHorizontal: 8,
                        paddingVertical: 4,
                        borderRadius: 6,
                        borderWidth: 1,
                        borderColor: isDarkMode ? "#3A506B" : "#FCD34D",
                      }}
                    >
                      <Text style={{ fontSize: 12, fontWeight: "700", color: isDarkMode ? "#F8FAFC" : "#1E293B", fontFamily: "monospace" }}>
                        {code}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity
              style={[styles.qrCloseActionBtn, { marginTop: 16 }]}
              onPress={onClose}
              activeOpacity={0.85}
            >
              <Text style={styles.qrCloseActionText}>Done</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
