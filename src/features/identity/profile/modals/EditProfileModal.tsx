import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../../styles/ProfileScreen.styles";

export interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
  initialPhone: string;
  initialEmail: string;
  initialAddress: string;
  onSave: (data: { phone: string; email: string; address: string }) => Promise<void> | void;
  isSaving: boolean;
  isDarkMode: boolean;
}

export function EditProfileModal({
  visible,
  onClose,
  initialPhone,
  initialEmail,
  initialAddress,
  onSave,
  isSaving,
  isDarkMode,
}: EditProfileModalProps) {
  const [editPhone, setEditPhone] = useState(initialPhone);
  const [editEmail, setEditEmail] = useState(initialEmail);
  const [editAddress, setEditAddress] = useState(initialAddress);

  useEffect(() => {
    if (visible) {
      setEditPhone(initialPhone);
      setEditEmail(initialEmail);
      setEditAddress(initialAddress);
    }
  }, [visible, initialPhone, initialEmail, initialAddress]);

  const handleSave = () => {
    onSave({
      phone: editPhone,
      email: editEmail,
      address: editAddress,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
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
              onPress={handleSave}
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
  );
}
