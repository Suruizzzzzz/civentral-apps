import React from "react";
import { ActivityIndicator, Modal, Text, View } from "react-native";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../../styles/ProfileScreen.styles";

export function SuccessToastModal({
  visible,
  title,
  message,
  onClose,
}: {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
          <Text style={styles.successToastTitle}>{title}</Text>
          <Text style={styles.successToastSub}>{message}</Text>
        </View>
      </View>
    </Modal>
  );
}

export function LogoutLoadingModal({
  visible,
  isDarkMode,
}: {
  visible: boolean;
  isDarkMode: boolean;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade">
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
  );
}
