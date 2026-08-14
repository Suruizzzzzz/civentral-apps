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
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';

export function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; phone?: string; identifier?: string; citizen_user_id?: string; mode?: string }>();
  
  const phone = params.phone || '';
  const email = params.email || '';
  const identifier = params.identifier || '';
  const mode = params.mode || '';

  const isPhone = mode === 'phone' || (mode !== 'email' && identifier && !identifier.includes('@')) || (mode !== 'email' && !email && !!phone);
  const targetIdentifier = isPhone ? (phone || identifier) : (email || identifier);
  const citizenUserId = params.citizen_user_id || '';

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const inputRefs = useRef<Array<TextInput | null>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleOtpChange = (text: string, index: number) => {
    if (errorMessage) setErrorMessage(null);
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    // Auto focus next input
    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleResend = async () => {
    try {
      await AuthService.resendOtp(targetIdentifier, 'Registration');
    } catch {}
    Alert.alert('Code Resent', `A new 6-digit verification code was sent to ${targetIdentifier}.`);
  };

  const handleVerifyAndComplete = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setErrorMessage('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    const res = await AuthService.verifyOtp(targetIdentifier, code, 'Registration');
    setIsLoading(false);

    if (res.status === 'success' || res.status === 'otp_required') {
      setIsRedirecting(true);
      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)',
          params: {
            email: email || targetIdentifier,
            phone: phone,
            citizenUserId: citizenUserId,
            isGuest: 'false',
          },
        } as any);
      }, 800);
    } else {
      setErrorMessage(res.message || 'Invalid or expired verification code. Please check and try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        
        {/* Top Back Nav Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}>
            <IconSymbol name="chevron.right" size={24} color="#0F172A" style={styles.backIcon} />
          </TouchableOpacity>
        </View>

        {/* Step Progress Bar (Step 2 of 2) */}
        <View style={styles.progressContainer}>
          <View style={styles.progressInactive} />
          <View style={styles.progressActive} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Title & Subtitle */}
          <Text style={styles.screenTitle}>
            {isPhone ? 'Verify Your Mobile Number' : 'Verify Your Email Address'}
          </Text>
          <Text style={styles.screenSubtitle}>
            We sent a 6-digit verification code to {isPhone ? 'your mobile number ' : 'your email address '}
            <Text style={styles.boldText}>{targetIdentifier || 'your registered contact'}</Text>.{'\n'}
            Enter the code below to activate your account.
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
                onKeyPress={(e) => handleKeyPress(e, idx)}
                textAlign="center"
                editable={!isLoading && !isRedirecting}
              />
            ))}
          </View>

          {/* Error Message */}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Resend Link */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>
              Didn&apos;t receive the code?{' '}
              <Text style={styles.resendLink} onPress={handleResend}>
                Resend now
              </Text>
            </Text>
          </View>
        </ScrollView>

        {/* Bottom Fixed Action Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.verifyButton, (isLoading || isRedirecting) && styles.disabledButton]}
            onPress={handleVerifyAndComplete}
            disabled={isLoading || isRedirecting}
            activeOpacity={0.85}>
            {isLoading || isRedirecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>Verify and Complete Sign In</Text>
            )}
          </TouchableOpacity>
        </View>
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
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 10,
    paddingBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#F1F5F9',
    marginHorizontal: 24,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressInactive: {
    flex: 1,
    backgroundColor: '#165B7E',
  },
  progressActive: {
    flex: 1,
    backgroundColor: '#165B7E',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  screenSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 32,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpBox: {
    width: 48,
    height: 56,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F172A',
  },
  otpBoxFilled: {
    borderColor: '#165B7E',
    backgroundColor: '#FFFFFF',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  resendRow: {
    alignItems: 'center',
    marginTop: 12,
  },
  resendText: {
    fontSize: 13,
    color: '#64748B',
  },
  resendLink: {
    color: '#165B7E',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#165B7E',
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
