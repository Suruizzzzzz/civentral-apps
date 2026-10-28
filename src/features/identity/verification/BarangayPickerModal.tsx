import React from 'react';
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { modalBackdrop } from '@/src/styles';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import { CaloocanDistrict } from './types';

export interface BarangayPickerModalProps {
  visible: boolean;
  onClose: () => void;
  activeDistrict: CaloocanDistrict;
  filteredBarangays: string[];
  barangay: string;
  onSelectBarangay: (b: string) => void;
  barangaySearchQuery: string;
  setBarangaySearchQuery: (val: string) => void;
  isDarkMode: boolean;
}

export function BarangayPickerModal({
  visible,
  onClose,
  activeDistrict,
  filteredBarangays,
  barangay,
  onSelectBarangay,
  barangaySearchQuery,
  setBarangaySearchQuery,
  isDarkMode,
}: BarangayPickerModalProps) {
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={[modalBackdrop, styles.modalOverlay]}>
        <View style={[styles.modalContainer, isDarkMode && { backgroundColor: '#1C2541' }]}>
          <View style={[styles.modalHeader, isDarkMode && { borderBottomColor: '#3A506B' }]}>
            <View>
              <Text style={[styles.modalTitle, { color: dmText }]}>
                Select Barangay
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                {activeDistrict.name}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <IconSymbol name="cross.case.fill" size={20} color={isDarkMode ? '#CBD5E1' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Search Input in Modal */}
          <View style={[styles.modalSearchBox, isDarkMode && { backgroundColor: '#152238' }]}>
            <IconSymbol name="magnifyingglass" size={18} color="#94A3B8" />
            <TextInput
              style={[styles.modalSearchInput, { color: dmText }]}
              placeholder="Search barangay number..."
              placeholderTextColor="#94A3B8"
              value={barangaySearchQuery}
              onChangeText={setBarangaySearchQuery}
              keyboardType="numeric"
              autoFocus={false}
            />
          </View>

          {/* List of filtered Barangays */}
          <FlatList
            data={filteredBarangays}
            keyExtractor={(item) => item}
            style={styles.modalList}
            showsVerticalScrollIndicator={true}
            ListEmptyComponent={
              <Text style={styles.emptyListText}>
                No barangay found matching &quot;{barangaySearchQuery}&quot; in {activeDistrict.shortName}
              </Text>
            }
            renderItem={({ item }) => {
              const isSelected = barangay === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.modalListItem,
                    isSelected && styles.modalListItemActive,
                    isDarkMode && { borderBottomColor: '#152238' },
                    isDarkMode && isSelected && { backgroundColor: '#0369A1' },
                  ]}
                  onPress={() => onSelectBarangay(item)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.modalListItemText,
                      isSelected && styles.modalListItemTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#E2E8F0' },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <IconSymbol name="checkmark.circle.fill" size={18} color={isDarkMode ? '#FFFFFF' : '#0284C7'} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}
