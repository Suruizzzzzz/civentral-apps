import React from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useForgotPasswordForm } from '../hooks/useForgotPasswordForm';
import { styles } from '../styles/ForgotPasswordScreen.styles';

export function ForgotPasswordScreen() {
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;

  const {
    step,
    identifier,
    setIdentifier,
    otp,
    inputRefs,
    timerSeconds,
    formatTime,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    isNewPasswordVisible,
    setIsNewPasswordVisible,
    isConfirmPasswordVisible,
    setIsConfirmPasswordVisible,
    isLoading,
    errorMessage,
    setErrorMessage,
    infoMessage,
    setInfoMessage,
    hasMinLength,
    hasUpper,
    hasLower,
    hasNumber,
    hasSymbol,
    strengthLevel,
    isPasswordValid,
    doPasswordsMatch,
    getStepTitle,
    getStepIndex,
    handleBack,
    handleSendOtp,
    handleOtpChange,
    handleOtpKeyPress,
    handleVerifyOtp,
    handleResendOtp,
    handleResetPassword,
    handleBackToLogin,
  } = useForgotPasswordForm(params);

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        
        {/* Header Navigation Bar */}
        <View style={[styles.topNav, { paddingTop: topPadding }]}>
          {step !== 'success' ? (
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={handleBack}
              activeOpacity={0.75}>
              <IconSymbol name="chevron.left" size={20} color="#0F172A" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 42 }} />
          )}

          <Text style={styles.navTitle}>{getStepTitle()}</Text>

          <View style={{ width: 42 }} />
        </View>

        {/* Step Progress Bar */}
        <View style={styles.progressRow}>
          {[1, 2, 3, 4].map((i) => (
            <View
              key={i}
              style={[
                styles.progressBarSegment,
                i <= getStepIndex() ? styles.progressBarActive : styles.progressBarInactive,
              ]}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          {/* Info / Notice Message Box */}
          {infoMessage ? (
            <View style={[styles.errorBox, { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE' }]}>
              <IconSymbol name="info.circle.fill" size={18} color="#2563EB" />
              <Text style={[styles.errorBoxText, { color: '#1E40AF' }]}>{infoMessage}</Text>
            </View>
          ) : null}

          {/* Error Message Box */}
          {errorMessage ? (
            <View style={styles.errorBox}>
              <IconSymbol name="exclamationmark.triangle.fill" size={18} color="#DC2626" />
              <Text style={styles.errorBoxText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* STEP 1: Enter Email / Mobile Number */}
          {step === 'identifier' && (
            <View style={styles.stepContainer}>
              <View style={styles.headerIllustrationBlock}>
                <Image
                  source={require('@/assets/images/lock-security-bg.png')}
                  style={styles.lockSecurityImage}
                  resizeMode="contain"
                />
                <Text style={styles.titleTextCenter}>Forgot Password?</Text>
                <Text style={styles.subtitleTextCenter}>
                  Enter your registered Email Address or Mobile Number to receive an OTP verification code.
                </Text>
              </View>

              <Text style={styles.inputLabel}>Email Address / Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <IconSymbol name="envelope.fill" size={18} color="#64748B" style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="e.g. name@example.com or 09171234567"
                  placeholderTextColor="#94A3B8"
                  value={identifier}
                  onChangeText={(text) => {
                    setIdentifier(text);
                    if (errorMessage) setErrorMessage(null);
                    if (infoMessage) setInfoMessage(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton]}
                onPress={handleSendOtp}
                disabled={isLoading}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send OTP</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Enter OTP */}
          {step === 'otp' && (
            <View style={styles.stepContainer}>
              <View style={styles.headerIllustrationBlock}>
                <Image
                  source={require('@/assets/images/verify-otp.png')}
                  style={styles.lockSecurityImage}
                  resizeMode="contain"
                />
                <Text style={styles.titleTextCenter}>Enter OTP Code</Text>
                <Text style={styles.subtitleTextCenter}>
                  We sent a 6-digit verification code to{' '}
                  <Text style={styles.boldText}>{identifier.trim()}</Text>. Enter the code below.
                </Text>
              </View>

              {/* 10-Minute Timer Badge */}
              <View style={[styles.timerBadge, timerSeconds === 0 && styles.timerBadgeExpired]}>
                <IconSymbol name="clock.fill" size={15} color={timerSeconds === 0 ? '#DC2626' : '#165B7E'} />
                <Text style={[styles.timerText, timerSeconds === 0 && styles.timerTextExpired]}>
                  {timerSeconds > 0 ? `Code expires in ${formatTime(timerSeconds)}` : 'OTP Code Expired'}
                </Text>
              </View>

              {/* 6 Square OTP Inputs */}
              <View style={styles.otpRow}>
                {otp.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(ref) => {
                      inputRefs.current[idx] = ref;
                    }}
                    style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
                    maxLength={1}
                    keyboardType="number-pad"
                    value={digit}
                    onChangeText={(text) => handleOtpChange(text, idx)}
                    onKeyPress={(e) => handleOtpKeyPress(e, idx)}
                    textAlign="center"
                    editable={!isLoading && timerSeconds > 0}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, (isLoading || timerSeconds === 0) && styles.disabledButton, { marginTop: 24 }]}
                onPress={handleVerifyOtp}
                disabled={isLoading || timerSeconds === 0}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn&apos;t receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={isLoading} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: New Password & Confirm New Password */}
          {step === 'new_password' && (
            <View style={styles.stepContainer}>
              <View style={styles.headerIllustrationBlock}>
                <Image
                  source={require('@/assets/images/create-password.png')}
                  style={styles.lockSecurityImage}
                  resizeMode="contain"
                />

                {/* OTP Verified Status Badge */}
                <View style={styles.verifiedBadge}>
                  <IconSymbol name="checkmark.seal.fill" size={16} color="#059669" />
                  <Text style={styles.verifiedBadgeText}>OTP Verified</Text>
                </View>

                <Text style={styles.titleTextCenter}>Create New Password</Text>
                <Text style={styles.subtitleTextCenter}>
                  Your identity has been verified. Please set a new secure password for your account.
                </Text>
              </View>

              {/* Field 1: New Password */}
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter your new password"
                  placeholderTextColor="#94A3B8"
                  value={newPassword}
                  onChangeText={(text) => {
                    setNewPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!isNewPasswordVisible}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIconBtn}
                  onPress={() => setIsNewPasswordVisible((prev) => !prev)}
                  activeOpacity={0.7}>
                  <IconSymbol
                    name={isNewPasswordVisible ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              {/* Real-time Password Strength Meter */}
              {newPassword.length > 0 ? (
                <View style={styles.strengthMeterContainer}>
                  <View style={styles.strengthBarRow}>
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

                  <View style={styles.strengthLabelRow}>
                    <Text style={styles.strengthPromptText}>Password Level:</Text>
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

                  {/* Criteria Checklist */}
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
                        At least 1 special character (!@#$...)
                      </Text>
                    </View>
                  </View>
                </View>
              ) : null}

              {/* Field 2: Confirm New Password */}
              <Text style={[styles.inputLabel, { marginTop: 14 }]}>Confirm New Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Re-enter your new password"
                  placeholderTextColor="#94A3B8"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  secureTextEntry={!isConfirmPasswordVisible}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                <TouchableOpacity
                  style={styles.eyeIconBtn}
                  onPress={() => setIsConfirmPasswordVisible((prev) => !prev)}
                  activeOpacity={0.7}>
                  <IconSymbol
                    name={isConfirmPasswordVisible ? 'eye.slash.fill' : 'eye.fill'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  (isLoading || !isPasswordValid || !doPasswordsMatch) && styles.disabledButton,
                  { marginTop: 24 },
                ]}
                onPress={handleResetPassword}
                disabled={isLoading || !isPasswordValid || !doPasswordsMatch}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 4: Password Reset Successful */}
          {step === 'success' && (
            <View style={styles.successContainer}>
              <Image
                source={require('@/assets/images/success.png')}
                style={styles.lockSecurityImage}
                resizeMode="contain"
              />

              <Text style={styles.successTitle}>Password Reset Successful!</Text>
              <Text style={styles.successSubtitle}>
                Your password has been reset successfully. You can now use your new password to sign in to your Civentral account.
              </Text>

              <TouchableOpacity
                style={styles.backToLoginBtn}
                onPress={handleBackToLogin}
                activeOpacity={0.85}>
                <Text style={styles.backToLoginText}>BACK TO LOGIN</Text>
              </TouchableOpacity>
            </View>
          )}

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
