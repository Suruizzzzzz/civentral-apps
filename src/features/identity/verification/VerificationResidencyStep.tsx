import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import { CaloocanDistrict, CALOOCAN_DISTRICTS } from './types';

export interface VerificationResidencyStepProps {
  selectedDistrictId: string;
  activeDistrict: CaloocanDistrict;
  handleSelectDistrict: (district: CaloocanDistrict) => void;
  barangay: string;
  setIsBarangayPickerVisible: (val: boolean) => void;
  streetAddress: string;
  setStreetAddress: (val: string) => void;
  yearsResident: string;
  setYearsResident: (val: string) => void;
  clearFieldError: (key: string) => void;
  onBack: () => void;
  onNext: () => void;
  isDarkMode: boolean;
}

export function VerificationResidencyStep({
  selectedDistrictId,
  activeDistrict,
  handleSelectDistrict,
  barangay,
  setIsBarangayPickerVisible,
  streetAddress,
  setStreetAddress,
  yearsResident,
  setYearsResident,
  clearFieldError,
  onBack,
  onNext,
  isDarkMode,
}: VerificationResidencyStepProps) {
  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';
  const dmInputBg = isDarkMode ? '#152238' : '#F8FAFC';
  const dmInputText = isDarkMode ? '#F1F5F9' : '#0F172A';

  return (
    <View style={[styles.card, { backgroundColor: dmCard, borderColor: dmBorder }]}>
      <Text style={[styles.cardTitle, { color: dmText }]}>Civentral Residency & District</Text>

      {/* Caloocan District Selector */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Select Civentral Legislative District *
        </Text>
        <View style={styles.districtCardGrid}>
          {CALOOCAN_DISTRICTS.map((district) => {
            const isSelected = selectedDistrictId === district.id;
            return (
              <TouchableOpacity
                key={district.id}
                style={[
                  styles.districtCard,
                  isSelected && styles.districtCardActive,
                  isDarkMode && {
                    backgroundColor: isSelected ? '#0369A1' : '#152238',
                    borderColor: isSelected ? '#38BDF8' : dmBorder,
                  },
                ]}
                onPress={() => handleSelectDistrict(district)}
                activeOpacity={0.85}
              >
                <View style={styles.districtCardHeader}>
                  <Text
                    style={[
                      styles.districtCardTitle,
                      isSelected && styles.districtCardTitleActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#F1F5F9' },
                    ]}
                  >
                    {district.name}
                  </Text>
                  <View
                    style={[
                      styles.districtBadge,
                      isSelected && styles.districtBadgeActive,
                      isDarkMode && !isSelected && { backgroundColor: '#334155' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.districtBadgeText,
                        isSelected && styles.districtBadgeTextActive,
                        isDarkMode && !isSelected && { color: '#94A3B8' },
                      ]}
                    >
                      {district.barangayCount} Barangays
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.districtCardDesc,
                    isDarkMode && { color: isSelected ? '#E0F2FE' : '#94A3B8' },
                  ]}
                >
                  {district.areaDescription}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Barangay Dropdown Trigger */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Barangay (in {activeDistrict.shortName}) *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            { backgroundColor: dmInputBg, borderColor: dmBorder },
          ]}
          onPress={() => setIsBarangayPickerVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValueText, { color: dmText }]}>
            {barangay}
          </Text>
          <IconSymbol name="chevron.right" size={18} color={isDarkMode ? '#94A3B8' : '#64748B'} />
        </TouchableOpacity>
        <Text style={[styles.dropdownHintText, isDarkMode && { color: '#94A3B8' }]}>
          Tap to search and select from {activeDistrict.barangayCount} barangays in {activeDistrict.shortName}
        </Text>
      </View>

      {/* Street Address */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Street Address / House No. *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder="e.g. Block 4 Lot 12 Sampaguita St."
          placeholderTextColor="#94A3B8"
          value={streetAddress}
          onChangeText={(text) => {
            setStreetAddress(text);
            clearFieldError('street_address');
          }}
        />
      </View>

      {/* Years of Residency */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Years of Residency in Civentral City *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder="e.g. 5"
          placeholderTextColor="#94A3B8"
          value={yearsResident}
          onChangeText={(text) => {
            setYearsResident(text);
            clearFieldError('years_resident');
          }}
          keyboardType="numeric"
        />
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.secondaryButton, isDarkMode && { backgroundColor: '#152238', borderColor: dmBorder }]}
          onPress={onBack}
          activeOpacity={0.85}
        >
          <Text style={[styles.secondaryButtonText, isDarkMode && { color: '#CBD5E1' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Next: Valid ID</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
