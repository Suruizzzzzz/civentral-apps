import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';

type ForgotPasswordStep = 'identifier' | 'otp' | 'new_password' | 'success';

export function ForgotPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string }>();

  const initialIdentifier = params.identifier || params.email || params.phone || '';

  const [step, setStep] = useState<ForgotPasswordStep>('identifier');
  const [identifier, setIdentifier] = useState(initialIdentifier);

  // OTP State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    Alert.alert('OTP Code Sent', `A new verification code has been sent to ${identifier.trim()}.`);
  };

  // STEP 3: Reset Password
  const handleResetPassword = async () => {
    setErrorMessage(null);

    if (!newPassword) {
      setErrorMessage('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
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
        <View style={styles.topNav}>
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

          <Text style={styles.navTitle}>Forgot Password</Text>

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
              <View style={styles.iconCircle}>
                <IconSymbol name="lock.fill" size={32} color="#165B7E" />
              </View>

              <Text style={styles.titleText}>Forgot Password?</Text>
              <Text style={styles.subtitleText}>
                Enter your registered Email Address or Mobile Number to receive an OTP verification code.
              </Text>

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
              <View style={styles.iconCircle}>
                <IconSymbol name="shield.fill" size={32} color="#165B7E" />
              </View>

              <Text style={styles.titleText}>Enter OTP Code</Text>
              <Text style={styles.subtitleText}>
                We sent a 6-digit verification code to{' '}
                <Text style={styles.boldText}>{identifier.trim()}</Text>. Enter the code below.
              </Text>

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
                    editable={!isLoading}
                  />
                ))}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.disabledButton, { marginTop: 24 }]}
                onPress={handleVerifyOtp}
                disabled={isLoading}
                activeOpacity={0.85}>
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify OTP</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendRow}>
                <Text style={styles.resendText}>Didn't receive the code? </Text>
                <TouchableOpacity onPress={handleResendOtp} disabled={isLoading} activeOpacity={0.7}>
                  <Text style={styles.resendLink}>Resend OTP</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* STEP 3: New Password & Confirm New Password */}
          {step === 'new_password' && (
            <View style={styles.stepContainer}>
              {/* OTP Verified Status Badge */}
              <View style={styles.verifiedBadge}>
                <IconSymbol name="checkmark.seal.fill" size={16} color="#059669" />
                <Text style={styles.verifiedBadgeText}>OTP Verified</Text>
              </View>

              <Text style={styles.titleText}>Create New Password</Text>
              <Text style={styles.subtitleText}>
                Your identity has been verified. Please set a new secure password for your account.
              </Text>

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

              {/* Field 2: Confirm New Password */}
              <Text style={[styles.inputLabel, { marginTop: 16 }]}>Confirm New Password</Text>
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
                style={[styles.primaryButton, isLoading && styles.disabledButton, { marginTop: 28 }]}
                onPress={handleResetPassword}
                disabled={isLoading}
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
              <View style={styles.successIconCircle}>
                <IconSymbol name="checkmark.circle.fill" size={64} color="#059669" />
              </View>

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
    paddingTop: Platform.OS === 'android' ? 20 : 12,
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
