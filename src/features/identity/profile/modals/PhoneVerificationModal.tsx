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

export interface PhoneVerificationModalProps {
  visible: boolean;
  onClose: () => void;
  currentPhone: string;
  onVerified?: (phone: string) => void;
  isDarkMode: boolean;
}

export function PhoneVerificationModal({
  visible,
  onClose,
  currentPhone,
  onVerified,
  isDarkMode,
}: PhoneVerificationModalProps) {
  const [phoneNumber, setPhoneNumber] = useState(currentPhone);
  const [otpCode, setOtpCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [countdown, setCountdown] = useState(60);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setPhoneNumber(currentPhone);
      setOtpCode("");
      setStep("phone");
      setErrorMsg(null);
      setCountdown(60);
    }
  }, [visible, currentPhone]);

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
    const cleanPhone = phoneNumber.trim();
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid Philippine mobile number.");
      return;
    }
    setErrorMsg(null);
    setIsSending(true);
    // Simulate sending OTP
    setTimeout(() => {
      setIsSending(false);
      setStep("otp");
      setCountdown(60);
    }, 800);
  };

  const handleVerifyOtp = async () => {
    if (otpCode.trim().length < 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code.");
      return;
    }
    setErrorMsg(null);
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerified?.(phoneNumber);
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
                  backgroundColor: isDarkMode ? "#0F243A" : "#E0F2FE",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconSymbol name="phone.fill" size={18} color="#0284C7" />
              </View>
              <Text
                style={[
                  styles.modalHeaderTitle,
                  { marginBottom: 0 },
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Verify Mobile Number
              </Text>
            </View>

            <Text
              style={[
                styles.modalHeaderSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              {step === "phone"
                ? "Enter your mobile phone number to receive a one-time verification passcode (OTP)."
                : `Enter the 6-digit verification code sent to ${phoneNumber}.`}
            </Text>

            {errorMsg ? (
              <Text style={[styles.changePasswordErrorText, { marginBottom: 12 }]}>
                {errorMsg}
              </Text>
            ) : null}

            {step === "phone" ? (
              <>
                <Text style={[styles.inputLabel, isDarkMode && { color: "#CBD5E1" }]}>
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
                  placeholder="+63 9XX XXX XXXX"
                  placeholderTextColor={isDarkMode ? "#64748B" : "#94A3B8"}
                  value={phoneNumber}
                  onChangeText={(val) => {
                    setPhoneNumber(val);
                    setErrorMsg(null);
                  }}
                  keyboardType="phone-pad"
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
                    onPress={() => setStep("phone")}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 13, color: isDarkMode ? "#38BDF8" : "#0284C7", fontWeight: "600" }}>
                      Change Number
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
                      <Text style={{ fontSize: 13, color: isDarkMode ? "#38BDF8" : "#0284C7", fontWeight: "700" }}>
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
                      <Text style={styles.modalSaveText}>Verify Phone</Text>
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
