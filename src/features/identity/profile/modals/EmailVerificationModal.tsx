import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../../styles/ProfileScreen.styles";

export interface EmailVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  currentEmail: string;
  onVerified?: (email: string) => void;
  isDarkMode: boolean;
}

export function EmailVerificationModal({
  visible,
  onClose,
  currentEmail,
  onVerified,
  isDarkMode,
}: EmailVerificationModalProps) {
  const [email, setEmail] = useState(currentEmail);
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setEmail(currentEmail);
      setOtpCode("");
      setStep("email");
      setErrorMsg(null);
      setCountdown(60);
    }
  }, [visible, currentEmail]);

  useEffect(() => {
    let timer: any = null;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step, countdown]);

  const handleSendOtp = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    setErrorMsg(null);
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      setStep("otp");
      setCountdown(60);
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit confirmation code.");
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified?.(email);
      onClose();
    }, 800);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidOverlay}
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: isDarkMode ? "#1E1B4B" : "#EEF2FF",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="envelope.fill" size={18} color="#4F46E5" />
              </View>
              <Text
                style={[
                  styles.modalHeaderTitle,
                  { marginBottom: 0 },
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Verify Email Address
              </Text>
            </View>

            <Text
              style={[
                styles.modalHeaderSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              {step === "email"
                ? "Enter your active email address to receive an official digital verification passcode."
                : `Enter the 6-digit verification code sent to ${email}.`}
            </Text>

            {errorMsg ? (
              <Text style={[styles.changePasswordErrorText, { marginBottom: 12 }]}>
                {errorMsg}
              </Text>
            ) : null}

            {step === "email" ? (
              <>
                <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
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
                  placeholder="name@example.com"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    setErrorMsg(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <View style={styles.modalActionsRow}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      isDarkMode && { backgroundColor: "#334155" },
                    ]}
                    onPress={onClose}
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
                    onPress={handleSendOtp}
                    disabled={isSending}
                    activeOpacity={0.85}
                  >
                    {isSending ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Send Code</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
                  6-Digit Verification Code
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
                  value={otpCode}
                  onChangeText={(val) => {
                    setOtpCode(val.replace(/[^0-9]/g, "").slice(0, 6));
                    setErrorMsg(null);
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <TouchableOpacity
                    onPress={() => setStep("email")}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 13, color: isDarkMode ? "#818CF8" : "#4F46E5", fontWeight: "600" }}>
                      Change Email
                    </Text>
                  </TouchableOpacity>

                  {countdown > 0 ? (
                    <Text style={{ fontSize: 13, color: isDarkMode ? "#94A3B8" : "#64748B" }}>
                      Resend in {countdown}s
                    </Text>
                  ) : (
                    <TouchableOpacity
                      onPress={handleSendOtp}
                      activeOpacity={0.7}
                    >
                      <Text style={{ fontSize: 13, color: isDarkMode ? "#818CF8" : "#4F46E5", fontWeight: "700" }}>
                        Resend Code
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={[styles.modalActionsRow, { marginTop: 16 }]}>
                  <TouchableOpacity
                    style={[
                      styles.modalCancelBtn,
                      isDarkMode && { backgroundColor: "#334155" },
                    ]}
                    onPress={onClose}
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
                      otpCode.length < 6 && styles.modalSaveBtnDisabled,
                    ]}
                    onPress={handleVerifyOtp}
                    disabled={isVerifying || otpCode.length < 6}
                    activeOpacity={0.85}
                  >
                    {isVerifying ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.modalSaveText}>Verify Email</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
