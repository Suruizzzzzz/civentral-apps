import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';

type ForgotPasswordStep = 'identifier' | 'otp' | 'new_password' | 'success';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;

  const initialIdentifier = params.identifier || params.email || params.phone || '';

  const [step, setStep] = useState<ForgotPasswordStep>('identifier');
  const [identifier, setIdentifier] = useState(initialIdentifier);

  // OTP State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes = 600 seconds

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10-Minute Timer Countdown for OTP
  useEffect(() => {
    if (step !== 'otp') return;
    const timer = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // REAL-TIME PASSWORD STRENGTH EVALUATION
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  const getStrengthLevel = (): 'weak' | 'medium' | 'strong' | '' => {
    if (newPassword.length === 0) return '';
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
  const isPasswordValid = strengthLevel === 'strong';
  const doPasswordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  // Header Title per Step
  const getStepTitle = () => {
    switch (step) {
      case 'identifier':
        return 'Forgot Password';
      case 'otp':
        return 'Verify OTP Code';
      case 'new_password':
        return 'Create New Password';
      case 'success':
        return 'Password Reset Successful';
    }
  };

  // Handle Back Button press
  const handleBack = () => {
    setErrorMessage(null);
    if (step === 'otp') {
      setStep('identifier');
    } else if (step === 'new_password') {
      setStep('otp');
    } else {
      router.replace('/(auth)/login' as any);
    }
  };

  // STEP 1: Send OTP
  const handleSendOtp = async () => {
    setErrorMessage(null);
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await AuthService.forgotPassword(cleanId);
    setIsLoading(false);

    if (res.status === 'success') {
      if (res.token) setResetToken(res.token);
      setTimerSeconds(600); // 10 minutes timer
      setStep('otp');
    } else {
      setErrorMessage(res.message || 'Failed to send OTP. Please check your contact information and try again.');
    }
  };

  // OTP input handler
  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next box
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async () => {
    setErrorMessage(null);

    if (timerSeconds === 0) {
      setErrorMessage('Your 10-minute OTP verification code has expired. Please tap "Resend OTP" to request a new code.');
      return;
    }

    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setErrorMessage('Please enter the complete 6-digit OTP verification code.');
      return;
    }

    setIsLoading(true);
    const res = await AuthService.verifyOtp(identifier.trim(), otpCode, 'Password Reset', !!resetToken);
    setIsLoading(false);

    if (res.status === 'success' || res.status === 'otp_required') {
      if (res.token) setResetToken(res.token);
      setIsOtpVerified(true);
      setStep('new_password');
    } else {
      setErrorMessage(res.message || 'Invalid or expired OTP code. Please check and try again.');
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await AuthService.resendOtp(identifier.trim(), 'Password Reset');
    setIsLoading(false);
    if (res.token) setResetToken(res.token);
    setTimerSeconds(600); // Reset timer to 10 minutes
    Alert.alert('OTP Code Sent', `A new verification code has been sent to ${identifier.trim()}. Code expires in 10 minutes.`);
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    if (strengthLevel !== 'strong') {
      setErrorMessage('Only STRONG passwords are accepted. Please fulfill all security requirements below.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    setIsLoading(true);
    const res = await AuthService.resetPassword({
      identifier: identifier.trim(),
      token: resetToken || otp.join(''),
      otpCode: otp.join(''),
      newPassword: newPassword,
    });
    setIsLoading(false);

    if (res.status === 'success') {
      setStep('success');
    } else {
      setErrorMessage(res.message || 'Failed to reset password. Please try again.');
    }
  };

  // STEP 4: Back to Login
  const handleBackToLogin = () => {
    router.replace({
      pathname: '/(auth)/login',
      params: { identifier: identifier.trim() },
    } as any);
  };

  // Calculate step step index for indicator (1 to 4)
  const getStepIndex = () => {
    switch (step) {
      case 'identifier':
        return 1;
      case 'otp':
        return 2;
      case 'new_password':
        return 3;
      case 'success':
        return 4;
    }
  };

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

          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => router.replace('/(auth)/login' as any)}
            activeOpacity={0.75}>
            <Text style={styles.closeBtnText}>Cancel</Text>
          </TouchableOpacity>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  backCircleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0F172A',
  },
  closeBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  closeBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  progressRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 8,
    marginBottom: 20,
  },
  progressBarSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#165B7E',
  },
  progressBarInactive: {
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  errorBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#991B1B',
    fontWeight: '500',
    lineHeight: 18,
  },
  stepContainer: {
    alignItems: 'flex-start',
  },
  headerIllustrationBlock: {
    alignItems: 'center',
    width: '100%',
    marginBottom: 8,
  },
  lockSecurityImage: {
    width: 190,
    height: 190,
    alignSelf: 'center',
    marginBottom: 8,
  },
  titleTextCenter: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitleTextCenter: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
    marginBottom: 28,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    height: 52,
    marginBottom: 24,
    width: '100%',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#165B7E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#165B7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  disabledButton: {
    backgroundColor: '#94A3B8',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
    gap: 8,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#165B7E',
    backgroundColor: '#F0F9FF',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    color: '#64748B',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#165B7E',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 6,
    marginBottom: 16,
  },
  verifiedBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#047857',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    height: 52,
    width: '100%',
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeIconBtn: {
    padding: 6,
  },
  successContainer: {
    alignItems: 'center',
    paddingTop: 30,
    paddingHorizontal: 12,
  },
  successIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 36,
  },
  timerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginBottom: 20,
  },
  timerBadgeExpired: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  timerText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#165B7E',
  },
  timerTextExpired: {
    color: '#DC2626',
  },
  /* Strength Meter Styles */
  strengthMeterContainer: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strengthBarRow: {
    flexDirection: 'row',
    gap: 6,
    height: 6,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    height: '100%',
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  barWeak: {
    backgroundColor: '#EF4444',
  },
  barMedium: {
    backgroundColor: '#F59E0B',
  },
  barStrong: {
    backgroundColor: '#10B981',
  },
  strengthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  strengthPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '800',
  },
  textWeak: {
    color: '#EF4444',
  },
  textMedium: {
    color: '#F59E0B',
  },
  textStrong: {
    color: '#10B981',
  },
  checklistContainer: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  checkTextActive: {
    color: '#334155',
  },
  backToLoginBtn: {
    width: '100%',
    height: 54,
    backgroundColor: '#165B7E',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#165B7E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
});
