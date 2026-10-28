import React from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useRegisterForm } from '../hooks/useRegisterForm';
import { styles } from '../styles/RegisterScreen.styles';

export function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string; mode?: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;

  const {
    email,
    handleEmailChange,
    phoneDigits,
    handlePhoneChange,
    firstName,
    handleFirstNameChange,
    suffix,
    setSuffix,
    showSuffixModal,
    setShowSuffixModal,
    SUFFIX_OPTIONS,
    middleName,
    handleMiddleNameChange,
    noMiddleName,
    toggleNoMiddleName,
    lastName,
    handleLastNameChange,
    password,
    handlePasswordChange,
    confirmPassword,
    handleConfirmPasswordChange,
    isPasswordVisible,
    setIsPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    isLoading,
    errorMessage,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    strengthLevel,
    formatPhoneNumber,
    handleVerifyAccount,
  } = useRegisterForm(params);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Circular Back Navigation Button */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={() => router.back()}
              activeOpacity={0.75}>
              <IconSymbol name="chevron.right" size={20} color="#0F172A" style={styles.backIcon} />
            </TouchableOpacity>
          </View>

          {/* Step Progress Bar (Step 1 of 2) */}
          <View style={styles.progressContainer}>
            <View style={styles.progressActive} />
            <View style={styles.progressInactive} />
          </View>

          {/* Screen Title */}
          <Text style={styles.screenTitle}>Complete Your Profile</Text>

          <View style={styles.formContainer}>
            {/* Field 1: Email Address */}
            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              maxLength={100}
            />

            {/* Field 1.5: Phone Number */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>
              Mobile Phone Number
            </Text>
            <View style={styles.phoneInputContainer}>
              <View style={styles.phonePrefixBox}>
                <Text style={{ fontSize: 16 }}>🇵🇭</Text>
                <Text style={styles.phonePrefixText}>+63</Text>
              </View>
              <TextInput
                style={styles.phoneTextInput}
                placeholder="9XX XXX XXXX"
                placeholderTextColor="#94A3B8"
                value={formatPhoneNumber(phoneDigits)}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={12}
                autoCapitalize="none"
              />
            </View>

            {/* Field 1 & 2: First Name + Suffix (Input) */}
            <View style={styles.rowFields}>
              <View style={styles.firstNameContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="First Name"
                  placeholderTextColor="#94A3B8"
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  autoCapitalize="words"
                  maxLength={50}
                />
              </View>

              <View style={styles.suffixContainer}>
                <TouchableOpacity
                  style={[
                    styles.textInput,
                    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
                  ]}
                  onPress={() => setShowSuffixModal(true)}
                  activeOpacity={0.8}>
                  <Text style={{ fontSize: 14, color: suffix ? '#0F172A' : '#94A3B8' }}>
                    {suffix || 'Suffix'}
                  </Text>
                  <IconSymbol
                    name="chevron.right"
                    size={14}
                    color="#94A3B8"
                    style={{ transform: [{ rotate: '90deg' }] }}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Field 3: Middle Name */}
            <TextInput
              style={[styles.textInput, { marginTop: 14 }, noMiddleName && styles.disabledInput]}
              placeholder="Middle Name"
              placeholderTextColor="#94A3B8"
              value={noMiddleName ? '' : middleName}
              onChangeText={handleMiddleNameChange}
              editable={!noMiddleName}
              autoCapitalize="words"
              maxLength={50}
            />

            {/* Checkbox: I have no middle name */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={toggleNoMiddleName}
              activeOpacity={0.8}>
              <View style={[styles.checkbox, noMiddleName && styles.checkboxChecked]}>
                {noMiddleName && <IconSymbol name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={styles.checkboxLabel}>I have no middle name</Text>
            </TouchableOpacity>

            {/* Field 4: Last Name */}
            <TextInput
              style={[styles.textInput, { marginTop: 14 }]}
              placeholder="Last Name"
              placeholderTextColor="#94A3B8"
              value={lastName}
              onChangeText={handleLastNameChange}
              autoCapitalize="words"
              maxLength={50}
            />

            {/* Field 5: Password */}
            <View style={[styles.passwordWrapper, { marginTop: 14 }]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                maxLength={64}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                activeOpacity={0.7}>
                <IconSymbol name={isPasswordVisible ? 'eye.slash.fill' : 'eye.fill'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* PASSWORD STRENGTH INDICATOR METER */}
            {password.length > 0 && (
              <View style={styles.strengthMeterContainer}>
                {/* 3 Color Bars */}
                <View style={styles.strengthBarsRow}>
                  <View
                    style={[
                      styles.strengthBar,
                      strengthLevel === 'weak' && styles.barWeak,
                      strengthLevel === 'medium' && styles.barMedium,
                      strengthLevel === 'strong' && styles.barStrong,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      strengthLevel === 'medium' && styles.barMedium,
                      strengthLevel === 'strong' && styles.barStrong,
                    ]}
                  />
                  <View
                    style={[
                      styles.strengthBar,
                      strengthLevel === 'strong' && styles.barStrong,
                    ]}
                  />
                </View>

                {/* Strength Label & Status */}
                <View style={styles.strengthLabelRow}>
                  <Text style={styles.strengthPromptText}>Password Strength:</Text>
                  <Text
                    style={[
                      styles.strengthText,
                      strengthLevel === 'weak' && styles.textWeak,
                      strengthLevel === 'medium' && styles.textMedium,
                      strengthLevel === 'strong' && styles.textStrong,
                    ]}>
                    {strengthLevel.toUpperCase()}
                  </Text>
                </View>

                {/* Password Criteria Checklist */}
                <View style={styles.checklistContainer}>
                  <View style={styles.checkItem}>
                    <IconSymbol
                      name={hasMinLength ? 'checkmark.seal.fill' : 'chevron.right'}
                      size={14}
                      color={hasMinLength ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, hasMinLength && styles.checkTextActive]}>
                      At least 8 characters
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <IconSymbol
                      name={hasUpper && hasLower ? 'checkmark.seal.fill' : 'chevron.right'}
                      size={14}
                      color={hasUpper && hasLower ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, hasUpper && hasLower && styles.checkTextActive]}>
                      Uppercase & lowercase letters
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <IconSymbol
                      name={hasNumber ? 'checkmark.seal.fill' : 'chevron.right'}
                      size={14}
                      color={hasNumber ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, hasNumber && styles.checkTextActive]}>
                      At least 1 number (0-9)
                    </Text>
                  </View>

                  <View style={styles.checkItem}>
                    <IconSymbol
                      name={hasSymbol ? 'checkmark.seal.fill' : 'chevron.right'}
                      size={14}
                      color={hasSymbol ? '#10B981' : '#94A3B8'}
                    />
                    <Text style={[styles.checkText, hasSymbol && styles.checkTextActive]}>
                      At least 1 special symbol (!@#$%^&*)
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Field 6: Confirm Password */}
            <View style={[styles.passwordWrapper, { marginTop: 14 }]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm your password"
                placeholderTextColor="#94A3B8"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!isConfirmPasswordVisible}
                autoCapitalize="none"
                maxLength={64}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                activeOpacity={0.7}>
                <IconSymbol name={isConfirmPasswordVisible ? 'eye.slash.fill' : 'eye.fill'} size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Primary Action Button (Verify Account) */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                (isLoading || strengthLevel !== 'strong') && styles.disabledButton,
              ]}
              onPress={handleVerifyAccount}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Verify Account</Text>
              )}
            </TouchableOpacity>

            {/* Divider (OR) */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Already have an account label */}
            <Text style={styles.accountPromptText}>Already have an Civentral account?</Text>

            {/* Secondary Action Button (Back) */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.back()}
              activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Back</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Suffix Selection Modal */}
      <Modal
        visible={showSuffixModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuffixModal(false)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 }}
          activeOpacity={1}
          onPress={() => setShowSuffixModal(false)}
        >
          <View
            style={{ width: '100%', maxWidth: 320, backgroundColor: '#FFFFFF', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 8 }}
            onStartShouldSetResponder={() => true}
          >
            <Text style={{ fontSize: 16, fontWeight: '700', color: '#0F172A', marginBottom: 12 }}>
              Select Name Suffix
            </Text>
            {SUFFIX_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
                onPress={() => {
                  setSuffix(opt === 'None' ? '' : opt);
                  setShowSuffixModal(false);
                }}
              >
                <Text style={{ fontSize: 15, fontWeight: (suffix === opt || (!suffix && opt === 'None')) ? '700' : '400', color: (suffix === opt || (!suffix && opt === 'None')) ? '#165B7E' : '#334155' }}>
                  {opt}
                </Text>
                {(suffix === opt || (!suffix && opt === 'None')) && (
                  <IconSymbol name="checkmark" size={16} color="#165B7E" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
