import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface Step2FamilyGuardianProps {
  guardianName?: string;
  setGuardianName?: (val: string) => void;
  guardianRelationship?: string;
  setGuardianRelationship?: (val: string) => void;
  guardianContact?: string;
  setGuardianContact?: (val: string) => void;
  guardianOccupation?: string;
  setGuardianOccupation?: (val: string) => void;
  emergencyContactName?: string;
  setEmergencyContactName?: (val: string) => void;
  emergencyContactPhone?: string;
  setEmergencyContactPhone?: (val: string) => void;
  numberOfSiblings?: string;
  setNumberOfSiblings?: (val: string) => void;
  isSubmitting?: boolean;
  isDarkMode: boolean;
  insets?: { bottom: number; top: number; left: number; right: number };
  onBack?: () => void;
  onNext?: () => void;
}

export function Step2FamilyGuardian({
  guardianName = '',
  setGuardianName,
  guardianRelationship = '',
  setGuardianRelationship,
  guardianContact = '',
  setGuardianContact,
  guardianOccupation = '',
  setGuardianOccupation,
  emergencyContactName = '',
  setEmergencyContactName,
  emergencyContactPhone = '',
  setEmergencyContactPhone,
  numberOfSiblings = '',
  setNumberOfSiblings,
  isSubmitting = false,
  isDarkMode,
  insets,
  onBack,
  onNext,
}: Step2FamilyGuardianProps) {
  return (
    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.stepHeaderRow}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
          Family & Guardian Information
        </Text>
        <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
          <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
            Family Roster
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Provide your primary parent or guardian information and emergency contact.
      </Text>

      {/* 1. GUARDIAN FULL NAME */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Parent / Guardian Full Name
        </Text>
        <TextInput
          style={[
            styles.textInput,
            isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
          ]}
          value={guardianName}
          onChangeText={setGuardianName}
          placeholder="e.g. Maria Santos Dela Cruz"
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          autoCapitalize="words"
          editable={!isSubmitting}
        />
      </View>

      {/* 2. RELATIONSHIP & CONTACT */}
      <View style={styles.inputGroup}>
        <View style={styles.rowFields}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Relationship
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
              ]}
              value={guardianRelationship}
              onChangeText={setGuardianRelationship}
              placeholder="e.g. Mother / Father"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Contact Number
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
              ]}
              value={guardianContact}
              onChangeText={setGuardianContact}
              placeholder="09XX XXX XXXX"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!isSubmitting}
            />
          </View>
        </View>
      </View>

      {/* 3. OCCUPATION */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Occupation / Employment
        </Text>
        <TextInput
          style={[
            styles.textInput,
            isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
          ]}
          value={guardianOccupation}
          onChangeText={setGuardianOccupation}
          placeholder="e.g. Self-Employed / Employee / Homemaker"
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          autoCapitalize="words"
          editable={!isSubmitting}
        />
      </View>

      {/* 4. EMERGENCY CONTACT PERSON & NUMBER */}
      <View style={styles.inputGroup}>
        <View style={styles.rowFields}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Emergency Contact Person
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
              ]}
              value={emergencyContactName}
              onChangeText={setEmergencyContactName}
              placeholder="Contact Name"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Emergency Phone
            </Text>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
              ]}
              value={emergencyContactPhone}
              onChangeText={setEmergencyContactPhone}
              placeholder="09XX XXX XXXX"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              keyboardType="phone-pad"
              maxLength={15}
              editable={!isSubmitting}
            />
          </View>
        </View>
      </View>

      {/* 5. NUMBER OF SIBLINGS */}
      <View style={[styles.inputGroup, { marginBottom: 6 }]}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Number of Dependent Siblings / Household Members
        </Text>
        <TextInput
          style={[
            styles.textInput,
            isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
          ]}
          value={numberOfSiblings}
          onChangeText={setNumberOfSiblings}
          placeholder="e.g. 2"
          placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
          keyboardType="numeric"
          maxLength={3}
          editable={!isSubmitting}
        />
      </View>

      {/* NAVIGATION BUTTONS (when rendered in wizard flow) */}
      {(onBack || onNext) && (
        <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, (insets?.bottom || 0) + 16) }]}>
          {onBack && (
            <TouchableOpacity
              style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <Ionicons name="chevron-back" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
              <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
            </TouchableOpacity>
          )}

          {onNext && (
            <TouchableOpacity
              style={styles.wizardNextBtn}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <Text style={styles.wizardNextBtnText}>Next →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}
