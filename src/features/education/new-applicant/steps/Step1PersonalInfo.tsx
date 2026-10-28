import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { formatDate } from '@/src/utils/dateUtils';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface Step1PersonalInfoProps {
  email: string;
  setEmail: (val: string) => void;
  phoneDigits: string;
  handlePhoneChange: (val: string) => void;
  formatPhoneNumber: (val: string) => string;
  firstName: string;
  setFirstName: (val: string) => void;
  middleName: string;
  setMiddleName: (val: string) => void;
  noMiddleName: boolean;
  setNoMiddleName: React.Dispatch<React.SetStateAction<boolean>>;
  lastName: string;
  setLastName: (val: string) => void;
  suffix: string;
  residentialAddress: string;
  setResidentialAddress: (val: string) => void;
  isVerifiedCitizen: boolean;
  citizenVerificationData: any;
  isVerificationLoading: boolean;
  isNoticeDismissed: boolean;
  setIsNoticeDismissed: (val: boolean) => void;
  isSubmitting: boolean;
  isDarkMode: boolean;
  insets: { bottom: number; top: number; left: number; right: number };
  onNext: () => void;
  onOpenSuffixModal: () => void;
  onNavigateVerifyCitizen: () => void;
}

export function Step1PersonalInfo({
  email,
  setEmail,
  phoneDigits,
  handlePhoneChange,
  formatPhoneNumber,
  firstName,
  setFirstName,
  middleName,
  setMiddleName,
  noMiddleName,
  setNoMiddleName,
  lastName,
  setLastName,
  suffix,
  residentialAddress,
  setResidentialAddress,
  isVerifiedCitizen,
  citizenVerificationData,
  isVerificationLoading,
  isNoticeDismissed,
  setIsNoticeDismissed,
  isSubmitting,
  isDarkMode,
  insets,
  onNext,
  onOpenSuffixModal,
  onNavigateVerifyCitizen,
}: Step1PersonalInfoProps) {
  return (
    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.stepHeaderRow}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
          Personal & Identity Information
        </Text>
        <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
          <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
            Step 1 of 3
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Review your identity profile and confirm your registered municipal residency.
      </Text>

      {isVerifiedCitizen ? (
        <>
          {/* VERIFIED CITIZEN FAST-TRACK CARD */}
          <View style={[styles.fastTrackCard, isDarkMode && { backgroundColor: '#064E3B20', borderColor: '#059669' }]}>
            <View style={styles.fastTrackHeader}>
              <View style={[styles.fastTrackBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                <IconSymbol name="checkmark.seal.fill" size={14} color={isDarkMode ? '#34D399' : '#15803D'} />
                <Text style={[styles.fastTrackBadgeText, isDarkMode && { color: '#A7F3D0' }]}>
                  Verified Citizen Profile (Fast-Track)
                </Text>
              </View>
              {citizenVerificationData?.citizen_id_number ? (
                <View style={[styles.fastTrackIdBadge, isDarkMode && { backgroundColor: '#064E3B', borderColor: '#059669' }]}>
                  <Text style={[styles.fastTrackIdLabel, isDarkMode && { color: '#A7F3D0' }]}>ID:</Text>
                  <Text style={[styles.fastTrackIdNumber, isDarkMode && { color: '#6EE7B7' }]}>
                    {citizenVerificationData.citizen_id_number}
                  </Text>
                </View>
              ) : null}
            </View>

            <Text style={[styles.fastTrackNote, isDarkMode && { color: '#34D399' }, { marginTop: 0 }]}>
              Personal identification and municipal residency are pre-verified via your Citizen ID and locked for application integrity.
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* UNVERIFIED NOTICE */}
          {!isVerificationLoading && !isNoticeDismissed ? (
            <View style={[styles.unverifiedTipBanner, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#0284C7' }]}>
              <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
                <IconSymbol name="info.circle.fill" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.unverifiedTipText, isDarkMode && { color: '#E0F2FE' }]}>
                    Tip: Verify your Citizen ID to auto-fill details and speed up scholarship processing.
                  </Text>
                  <TouchableOpacity
                    onPress={onNavigateVerifyCitizen}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.unverifiedTipLink, isDarkMode && { color: '#38BDF8' }]}>
                      Verify as Citizen Now →
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setIsNoticeDismissed(true)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={{ padding: 4 }}
              >
                <IconSymbol name="xmark" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            </View>
          ) : null}
        </>
      )}

      {/* INDIVIDUAL FORM INPUT FIELDS */}
      {/* 1. EMAIL ADDRESS */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Email Address
        </Text>
        {isVerifiedCitizen ? (
          <View
            style={[
              styles.lockedInputContainer,
              isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
            ]}
          >
            <TextInput
              style={[
                styles.lockedTextInput,
                isDarkMode && { color: '#F8FAFC' },
              ]}
              value={email}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          </View>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSubmitting}
          />
        )}
      </View>

      {/* 2. MOBILE PHONE NUMBER */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Mobile Phone Number
        </Text>
        <View
          style={[
            styles.phoneInputContainer,
            isVerifiedCitizen && [
              styles.lockedInputContainer,
              isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
            ],
            isDarkMode && !isVerifiedCitizen && { backgroundColor: '#0F172A', borderColor: '#334155' },
          ]}
        >
          <View
            style={[
              styles.phonePrefixBox,
              isDarkMode && { backgroundColor: '#1E293B', borderRightColor: '#334155' },
            ]}
          >
            <Text style={{ fontSize: 16 }}>🇵🇭</Text>
            <Text style={[styles.phonePrefixText, isDarkMode && { color: '#CBD5E1' }]}>+63</Text>
          </View>
          <TextInput
            style={[
              styles.phoneTextInput,
              isDarkMode && { color: '#F8FAFC' },
              isVerifiedCitizen && styles.lockedTextInput,
              isVerifiedCitizen && isDarkMode && { color: '#F8FAFC' },
            ]}
            placeholder="9XX XXX XXXX"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={formatPhoneNumber(phoneDigits)}
            onChangeText={handlePhoneChange}
            keyboardType="phone-pad"
            maxLength={12}
            autoCapitalize="none"
            editable={!isVerifiedCitizen && !isSubmitting}
          />
          {isVerifiedCitizen ? (
            <View style={{ paddingRight: 12 }}>
              <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </View>
          ) : null}
        </View>
      </View>

      {/* 3. NAME FIELDS: FIRST NAME (flex: 2) + SUFFIX (flex: 1) */}
      <View style={styles.inputGroup}>
        <View style={styles.rowFields}>
          <View style={styles.firstNameContainer}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              First Name *
            </Text>
            {isVerifiedCitizen ? (
              <View
                style={[
                  styles.lockedInputContainer,
                  isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                ]}
              >
                <TextInput
                  style={[
                    styles.lockedTextInput,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                  value={firstName}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </View>
            ) : (
              <TextInput
                style={[
                  styles.textInput,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                ]}
                placeholder="First Name *"
                placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                value={firstName}
                onChangeText={setFirstName}
                autoCapitalize="words"
                maxLength={50}
                editable={!isSubmitting}
              />
            )}
          </View>
          <View style={styles.suffixContainer}>
            <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
              Suffix
            </Text>
            {isVerifiedCitizen ? (
              <View
                style={[
                  styles.lockedInputContainer,
                  isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
                ]}
              >
                <TextInput
                  style={[
                    styles.lockedTextInput,
                    isDarkMode && { color: '#F8FAFC' },
                  ]}
                  value={suffix || 'None'}
                  editable={false}
                />
                <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.suffixSelectBtn,
                  isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
                ]}
                onPress={onOpenSuffixModal}
                disabled={isSubmitting}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.suffixSelectText,
                    isDarkMode && { color: '#F8FAFC' },
                    !suffix && { color: isDarkMode ? '#64748B' : '#94A3B8' },
                  ]}
                >
                  {suffix || 'Suffix'}
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={13}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                  style={{ transform: [{ rotate: '90deg' }] }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* 4. MIDDLE NAME + CHECKBOX */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Middle Name
        </Text>
        {isVerifiedCitizen ? (
          <View
            style={[
              styles.lockedInputContainer,
              isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
            ]}
          >
            <TextInput
              style={[
                styles.lockedTextInput,
                isDarkMode && { color: '#F8FAFC' },
              ]}
              value={middleName || 'No Middle Name'}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          </View>
        ) : (
          <>
            <TextInput
              style={[
                styles.textInput,
                noMiddleName && [styles.verifiedLockedField, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }],
                isDarkMode && !noMiddleName && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
                noMiddleName && { color: isDarkMode ? '#64748B' : '#94A3B8' },
              ]}
              placeholder="Middle Name"
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              value={noMiddleName ? '' : middleName}
              onChangeText={setMiddleName}
              editable={!noMiddleName && !isSubmitting}
              autoCapitalize="words"
              maxLength={50}
            />
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                if (isSubmitting) return;
                setNoMiddleName((prev) => !prev);
                if (!noMiddleName) setMiddleName('');
              }}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.checkbox,
                  noMiddleName && styles.checkboxChecked,
                  isDarkMode && { backgroundColor: noMiddleName ? '#0284C7' : '#0F172A', borderColor: '#334155' },
                ]}
              >
                {noMiddleName ? <IconSymbol name="checkmark" size={12} color="#FFFFFF" /> : null}
              </View>
              <Text style={[styles.checkboxLabel, isDarkMode && { color: '#94A3B8' }]}>
                I have no middle name
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* 5. LAST NAME */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Last Name *
        </Text>
        {isVerifiedCitizen ? (
          <View
            style={[
              styles.lockedInputContainer,
              isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
            ]}
          >
            <TextInput
              style={[
                styles.lockedTextInput,
                isDarkMode && { color: '#F8FAFC' },
              ]}
              value={lastName}
              editable={false}
            />
            <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
          </View>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            ]}
            placeholder="Last Name *"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
            maxLength={50}
            editable={!isSubmitting}
          />
        )}
      </View>

      {/* DEMOGRAPHICS GRID (Verified Citizens only) */}
      {isVerifiedCitizen ? (
        <View style={[styles.demographicsRow, { marginBottom: 16 }]}>
          <View style={styles.demographicItem}>
            <Text style={[styles.demographicLabel, isDarkMode && { color: '#94A3B8' }]}>
              Sex / Gender
            </Text>
            <View style={[styles.demographicBox, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.demographicValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {citizenVerificationData?.gender || citizenVerificationData?.sex || 'N/A'}
                </Text>
                <Ionicons name="lock-closed-outline" size={15} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </View>
            </View>
          </View>

          <View style={styles.demographicItem}>
            <Text style={[styles.demographicLabel, isDarkMode && { color: '#94A3B8' }]}>
              Date of Birth
            </Text>
            <View style={[styles.demographicBox, isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={[styles.demographicValue, isDarkMode && { color: '#F8FAFC' }]}>
                  {(() => {
                    const dob = citizenVerificationData?.birthdate || citizenVerificationData?.birth_date;
                    const formatted = formatDate(dob);
                    return formatted === '—' ? 'N/A' : formatted;
                  })()}
                </Text>
                <Ionicons name="lock-closed-outline" size={15} color={isDarkMode ? '#64748B' : '#94A3B8'} />
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {/* 6. RESIDENTIAL ADDRESS */}
      <View style={[styles.inputGroup, { marginBottom: 6 }]}>
        <Text style={[styles.inputLabel, { marginBottom: 6 }, isDarkMode && { color: '#F8FAFC' }]}>
          Residential Address *
        </Text>
        {isVerifiedCitizen ? (
          <View
            style={[
              styles.lockedAddressContainer,
              isDarkMode && { backgroundColor: '#1E293B80', borderColor: '#334155' },
            ]}
          >
            <TextInput
              style={[
                styles.lockedTextInput,
                { minHeight: 44, textAlignVertical: 'top' },
                isDarkMode && { color: '#F8FAFC' },
              ]}
              value={residentialAddress}
              editable={false}
              multiline={true}
            />
            <View style={{ paddingTop: 2 }}>
              <Ionicons name="lock-closed-outline" size={16} color={isDarkMode ? '#64748B' : '#94A3B8'} />
            </View>
          </View>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              { minHeight: 52, textAlignVertical: 'top', paddingTop: 10 },
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            ]}
            value={residentialAddress}
            onChangeText={setResidentialAddress}
            placeholder="Enter complete residential address (Street, Barangay, City)..."
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            autoCapitalize="words"
            multiline={true}
            editable={!isSubmitting}
          />
        )}
        <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
          {isVerifiedCitizen
            ? 'Locked to your registered municipal citizen address.'
            : 'Enter complete residential address (e.g. Street, Barangay, City).'}
        </Text>
      </View>

      {/* STEP 1 NAVIGATION BUTTON */}
      <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        <TouchableOpacity
          style={styles.wizardNextBtnFull}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.wizardNextBtnText}>Next: Academic Info →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
