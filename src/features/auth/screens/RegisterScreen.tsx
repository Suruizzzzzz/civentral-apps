import React, { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
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

  const [email, setEmail] = useState(initialEmail || '');
  const [mobileNumber, setMobileNumber] = useState(initialPhone || '');
  const [firstName, setFirstName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [noMiddleName, setNoMiddleName] = useState(false);
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    const cleanPhone = mobileNumber.trim().replace(/[^0-9]/g, '');
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

    // 2. Mobile Phone Validation (Numeric, 11 digits, starts with 09)
    const isPhoneRequired = params.mode === 'phone' || (!cleanEmail && !params.email);
    if (isPhoneRequired && !cleanPhone) {
      setErrorMessage('Mobile phone number is required.');
      return;
    }
    if (cleanPhone) {
      if (cleanPhone.length !== 11) {
        setErrorMessage('Mobile phone number must be exactly 11 digits (e.g. 09171234567).');
        return;
      }
      if (!cleanPhone.startsWith('09')) {
        setErrorMessage('Mobile phone number must start with 09 (e.g. 09171234567).');
        return;
      }
    }

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
    if (mobileNumber.trim()) {
      const phoneCheck = await AuthService.checkAccount(mobileNumber.trim());
      if (phoneCheck.exists) {
        setErrorMessage('This mobile number is already associated with another account. Please use a different number or sign in.');
        setIsLoading(false);
        return;
      }
    }

    const res = await AuthService.register({
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      firstName: firstName.trim(),
      middleName: middleName.trim(),
      hasNoMiddleName: noMiddleName,
      lastName: lastName.trim(),
      suffix: suffix.trim(),
      password,
    });
    setIsLoading(false);

    if (res.status === 'otp_required' || res.status === 'success') {
      const isEmailMode = params.mode === 'email' || (!!email.trim() && email.trim().includes('@')) || !!params.email || params.identifier?.includes('@');
      const isPhoneRegistration = !isEmailMode && (params.mode === 'phone' || (!email.trim() && !!mobileNumber.trim()));

      const targetRoute = isPhoneRegistration ? '/(auth)/verify-phone' : '/(auth)/verify';
      const modeParam = isPhoneRegistration ? 'phone' : 'email';

      const primaryId = isPhoneRegistration
        ? (mobileNumber.trim() || params.phone || (res as any).mobile_number || res.email || email.trim())
        : (email.trim() || res.email || mobileNumber.trim());

      router.push({
        pathname: targetRoute as any,
        params: {
          mode: modeParam,
          email: email.trim() || res.email,
          phone: mobileNumber.trim() || params.phone,
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
              Mobile Phone Number (11 Digits, Local Format)
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="09XXXXXXXXX (11 digits)"
              placeholderTextColor="#94A3B8"
              value={mobileNumber}
              onChangeText={(text) => {
                const cleaned = text.replace(/[^0-9]/g, '').slice(0, 11);
                setMobileNumber(cleaned);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="numeric"
              maxLength={11}
              autoCapitalize="none"
            />

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
                  maxLength={50}
                />
              </View>

              <View style={styles.suffixContainer}>
                <TextInput
                  style={styles.textInput}
                  placeholder="Suffix (e.g. Jr.)"
                  placeholderTextColor="#94A3B8"
                  value={suffix}
                  onChangeText={(text) => {
                    setSuffix(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  maxLength={10}
                />
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
                {noMiddleName && <View style={styles.checkboxInner} />}
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
    </SafeAreaView>
  );
}
