import { useEffect, useRef, useState } from 'react';
import { Alert, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';

export type ForgotPasswordStep = 'identifier' | 'otp' | 'new_password' | 'success';

export interface UseForgotPasswordFormParams {
  identifier?: string;
  email?: string;
  phone?: string;
}

export function useForgotPasswordForm(params: UseForgotPasswordFormParams = {}) {
  const router = useRouter();
  const initialIdentifier = params.identifier || params.email || params.phone || '';

  const [step, setStep] = useState<ForgotPasswordStep>('identifier');
  const [identifier, setIdentifier] = useState(initialIdentifier);

  // OTP State
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [resetToken, setResetToken] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState(600); // 10 minutes = 600 seconds

  // New Password State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

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

  // Calculate step index for indicator (1 to 4)
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

  // Handle Back Button press
  const handleBack = () => {
    setErrorMessage(null);
    setInfoMessage(null);
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
    setInfoMessage(null);
    const cleanId = identifier.trim();

    if (!cleanId) {
      setErrorMessage('Please enter your email address or mobile number.');
      return;
    }

    setIsLoading(true);
    const res = await AuthService.forgotPassword(cleanId);
    setIsLoading(false);

    if (res.status === 'success' && res.token) {
      // Existing citizen account with valid reset token
      setResetToken(res.token);
      setTimerSeconds(600); // 10 minutes timer
      setStep('otp');
    } else if (res.status === 'success' && !res.token) {
      // Nonexistent account or generic enumeration-protected response
      // DO NOT proceed to OTP. Remain on identifier/email step.
      setInfoMessage(
        res.message || 'If an account exists with this email, password reset instructions have been sent.'
      );
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

  return {
    step,
    setStep,
    identifier,
    setIdentifier,
    otp,
    setOtp,
    inputRefs,
    isOtpVerified,
    resetToken,
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
  };
}
