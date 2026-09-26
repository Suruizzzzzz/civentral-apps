import React, { useState } from 'react';
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
import { AuthService } from '@/src/services/auth-service';
import { styles } from '../styles/RegisterScreen.styles';

export function RegisterScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string; mode?: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;

  const initialEmail = params.email || (params.identifier?.includes('@') ? params.identifier : '');
  const initialPhone = params.phone || (!params.identifier?.includes('@') ? params.identifier : '');

  const parseRawPhone = (val?: string): string => {
    if (!val) return '';
    let d = val.replace(/[^0-9]/g, '');
    if (d.startsWith('63')) d = d.slice(2);
    if (d.startsWith('0')) d = d.replace(/^0+/, '');
    return d.slice(0, 10);
  };

  const formatPhoneNumber = (digits: string): string => {
    if (!digits) return '';
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 10)}`;
  };

  const [email, setEmail] = useState(initialEmail || '');
  const [phoneDigits, setPhoneDigits] = useState(parseRawPhone(initialPhone));
  const [firstName, setFirstName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [showSuffixModal, setShowSuffixModal] = useState(false);
  const SUFFIX_OPTIONS = ['None', 'Jr.', 'Sr.', 'II', 'III', 'IV', 'V'];
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handlePhoneChange = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.startsWith('63')) cleaned = cleaned.slice(2);
    if (cleaned.startsWith('0')) cleaned = cleaned.replace(/^0+/, '');
    cleaned = cleaned.slice(0, 10);
    setPhoneDigits(cleaned);
    if (errorMessage) setErrorMessage(null);
  };

  // REAL-TIME PASSWORD STRENGTH EVALUATION
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const getStrengthLevel = (): 'weak' | 'medium' | 'strong' | '' => {
    if (password.length === 0) return '';
    let score = 0;
    if (hasMinLength) score += 1;
    if (hasUpper && hasLower) score += 1;
    if (hasNumber) score += 1;
    if (hasSymbol) score += 1;

    if (score >= 4 && hasMinLength && hasUpper && hasLower && hasNumber && hasSymbol) {
      return 'strong';
    } else if (score >= 3 && hasMinLength) {
      return 'medium';
    } else {
      return 'weak';
    }
  };

  const strengthLevel = getStrengthLevel();

  const handleVerifyAccount = async () => {
    setErrorMessage(null);

    const cleanEmail = email.trim();
    const cleanPhoneDigits = phoneDigits.trim();
    const cleanFirstName = firstName.trim();
    const cleanLastName = lastName.trim();
    const cleanMiddleName = middleName.trim();

    // 1. Email Address Validation
    const isEmailMode = params.mode === 'email' || (!!cleanEmail && cleanEmail.includes('@')) || !!params.email || params.identifier?.includes('@');
    if (isEmailMode && !cleanEmail) {
      setErrorMessage('Email address is required.');
      return;
    }
    if (cleanEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        setErrorMessage('Please enter a valid email address (e.g. name@example.com).');
        return;
      }
    }

    // 2. Mobile Phone Validation (Numeric, 10 digits after +63, starts with 9)
    const isPhoneRequired = params.mode === 'phone' || (!cleanEmail && !params.email);
    if (isPhoneRequired && !cleanPhoneDigits) {
      setErrorMessage('Mobile phone number is required.');
      return;
    }
    if (cleanPhoneDigits) {
      if (cleanPhoneDigits.length !== 10 || !cleanPhoneDigits.startsWith('9')) {
        setErrorMessage('Mobile phone number must be 10 digits starting with 9 (e.g. 917 123 4567).');
        return;
      }
    }

    const normalizedPhone = cleanPhoneDigits ? `+63${cleanPhoneDigits}` : '';

    // 3. First Name (Required, min 2 chars)
    if (!cleanFirstName) {
      setErrorMessage('First Name is required.');
      return;
    }
    if (cleanFirstName.length < 2) {
      setErrorMessage('First Name must be at least 2 characters long.');
      return;
    }

    // 4. Last Name (Required, min 2 chars)
    if (!cleanLastName) {
      setErrorMessage('Last Name is required.');
      return;
    }
    if (cleanLastName.length < 2) {
      setErrorMessage('Last Name must be at least 2 characters long.');
      return;
    }

    // 5. Middle Name (Optional, min 2 chars if entered)
    if (!noMiddleName && cleanMiddleName && cleanMiddleName.length < 2) {
      setErrorMessage('Middle Name must be at least 2 characters long, or select "I have no middle name".');
      return;
    }

    // 6. Password Required & Strict Strength Enforcement
    if (!password) {
      setErrorMessage('Password is required.');
      return;
    }

    if (strengthLevel !== 'strong') {
      setErrorMessage(
        'Password strength is ' + (strengthLevel ? strengthLevel.toUpperCase() : 'WEAK') + '. Registration requires a STRONG password (at least 8 characters with uppercase, lowercase, number, and special symbol).'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    // Duplicate Email Pre-Check
    if (email.trim()) {
      const emailCheck = await AuthService.checkAccount(email.trim());
      if (emailCheck.exists) {
        setErrorMessage('An account with this email address already exists. Please use a different email or sign in.');
        setIsLoading(false);
        return;
      }
    }

    // Duplicate Mobile Number Pre-Check
    if (normalizedPhone) {
      let phoneCheck = await AuthService.checkAccount(normalizedPhone);
      if (!phoneCheck.exists && cleanPhoneDigits) {
        phoneCheck = await AuthService.checkAccount(`0${cleanPhoneDigits}`);
      }
      if (phoneCheck.exists) {
        setErrorMessage('This mobile number is already associated with another account. Please use a different number or sign in.');
        setIsLoading(false);
        return;
      }
    }

    const res = await AuthService.register({
      email: cleanEmail,
      mobileNumber: normalizedPhone,
      firstName: cleanFirstName,
      middleName: cleanMiddleName,
      hasNoMiddleName: noMiddleName,
      lastName: cleanLastName,
      suffix: suffix.trim(),
      password,
    });
    setIsLoading(false);

    if (res.status === 'otp_required' || res.status === 'success') {
      const isPhoneRegistration = params.mode === 'phone'
        ? true
        : params.mode === 'email'
        ? false
        : (!params.email && !params.identifier?.includes('@') && (!!params.phone || !cleanEmail));

      const targetRoute = isPhoneRegistration ? '/(auth)/verify-phone' : '/(auth)/verify';
      const modeParam = isPhoneRegistration ? 'phone' : 'email';

      const primaryId = isPhoneRegistration
        ? (normalizedPhone || params.phone || (res as any).mobile_number || res.email || cleanEmail)
        : (cleanEmail || res.email || normalizedPhone);

      router.push({
        pathname: targetRoute as any,
        params: {
          mode: modeParam,
          email: cleanEmail || res.email,
          phone: normalizedPhone || params.phone,
          identifier: primaryId,
          citizen_user_id: res.citizen_user_id ? String(res.citizen_user_id) : '',
        },
      });
    } else {
      setErrorMessage(res.message);
    }
  };

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
              onChangeText={(text) => {
                setEmail(text);
                if (errorMessage) setErrorMessage(null);
              }}
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
                  onChangeText={(text) => {
                    setFirstName(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
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
              onChangeText={(text) => {
                setMiddleName(text);
                if (errorMessage) setErrorMessage(null);
              }}
              editable={!noMiddleName}
              autoCapitalize="words"
              maxLength={50}
            />

            {/* Checkbox: I have no middle name */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                setNoMiddleName((prev) => !prev);
                if (!noMiddleName) setMiddleName('');
                if (errorMessage) setErrorMessage(null);
              }}
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
              onChangeText={(text) => {
                setLastName(text);
                if (errorMessage) setErrorMessage(null);
              }}
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
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
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
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
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
