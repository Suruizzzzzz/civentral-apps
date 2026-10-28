import React from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Badge } from "@/src/components/ui/Badge";
import { styles } from "../../styles/ProfileScreen.styles";

export interface CitizenQrModalProps {
  visible: boolean;
  onClose: () => void;
  isCitizenApproved: boolean;
  isGuestMode: boolean;
  effectiveCitizenIdNumber: string;
  verificationData?: any;
  userProfile: {
    fullName?: string;
    [key: string]: any;
  };
  isDarkMode: boolean;
}

export function CitizenQrModal({
  visible,
  onClose,
  isCitizenApproved,
  isGuestMode,
  effectiveCitizenIdNumber,
  verificationData,
  userProfile,
  isDarkMode,
}: CitizenQrModalProps) {
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
              onPress={onClose}
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
                  ? "VERIFIED CITIZEN • CIVENTRAL CITY"
                  : isGuestMode
                  ? "GUEST PASS • CIVENTRAL CITY"
                  : "ACTIVE RESIDENT • CIVENTRAL CITY"
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
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={styles.qrCloseActionText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
