import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';
import { styles } from '../styles/VerifyEmailScreen.styles';

export function VerifyEmailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; phone?: string; identifier?: string; citizen_user_id?: string; mode?: string }>();
  const insets = useSafeAreaInsets();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;
  
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
        <View style={[styles.topNav, { paddingTop: topPadding }]}>
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
          <View style={{ alignItems: 'center', marginBottom: 12 }}>
            <Image
              source={require('@/assets/images/verify-otp.png')}
              style={{ width: 170, height: 170, marginBottom: 8 }}
              resizeMode="contain"
            />
            <Text style={[styles.screenTitle, { textAlign: 'center' }]}>
              {isPhone ? 'Verify Your Mobile Number' : 'Verify Your Email Address'}
            </Text>
            <Text style={[styles.screenSubtitle, { textAlign: 'center' }]}>
              We sent a 6-digit verification code to {isPhone ? 'your mobile number ' : 'your email address '}
              <Text style={styles.boldText}>{targetIdentifier || 'your registered contact'}</Text>.{'\n'}
              Enter the code below to activate your account.
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
