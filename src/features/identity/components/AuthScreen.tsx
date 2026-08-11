import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';

export default function AuthScreen() {
  const router = useRouter();
  const [phoneValue, setPhoneValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Input Validation & Continue Action
  const handleContinue = async () => {
    setErrorMessage(null);
    const phoneTrimmed = phoneValue.trim();
    const emailTrimmed = emailValue.trim();

    if (!phoneTrimmed && !emailTrimmed) {
      setErrorMessage('Please enter your phone number or email address to continue.');
      return;
    }

    if (phoneTrimmed) {
      const phoneRegex = /^(\+?63|0)9\d{9}$/;
      if (!phoneRegex.test(phoneTrimmed.replace(/\s+/g, ''))) {
        setErrorMessage('Please enter a valid PH mobile number.');
        return;
      }
    }

    if (emailTrimmed) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrimmed)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }

    const mode = emailTrimmed && !phoneTrimmed ? 'email' : (phoneTrimmed ? 'phone' : 'email');
    const primaryIdentifier = mode === 'email' ? emailTrimmed : (phoneTrimmed || emailTrimmed);

    setIsLoading(true);
    const checkRes = await AuthService.checkAccount(primaryIdentifier);
    setIsLoading(false);

    if (checkRes.exists) {
      router.push({
        pathname: '/(auth)/login' as any,
        params: {
          mode: mode,
          identifier: primaryIdentifier,
          phone: phoneTrimmed,
          email: emailTrimmed,
        },
      });
    } else {
      router.push({
        pathname: '/(auth)/register' as any,
        params: {
          mode: mode,
          identifier: primaryIdentifier,
          phone: phoneTrimmed,
          email: emailTrimmed,
        },
      });
    }
  };

  // Guest Mode Action
  const handleContinueAsGuest = () => {
    router.replace('/(tabs)');
  };

  const handleOpenTerms = () => {
    Alert.alert('Terms of Service', 'Civentral Municipal Portal Terms of Service.');
  };

  const handleOpenPrivacy = () => {
    Alert.alert('Privacy Policy', 'Data Privacy Policy for Civentral.');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        
        {/* Background Building Watermark */}
        <Image
          source={require('@/assets/images/building-bg.png')}
          style={styles.watermarkBg}
          resizeMode="contain"
        />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Centered Large Circular Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Header Title & Subtitle */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Welcome to Civentral</Text>
            <Text style={styles.headerSubtitle}>
              Enter your phone number or email address below. System will automatically direct you to Sign In or Create an Account.
            </Text>
          </View>

          {/* Form Area */}
          <View style={styles.formContainer}>
            {/* Field 1: Phone Number (TOP) */}
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={[
                styles.textInput,
                errorMessage && !phoneValue.trim() ? styles.inputErrorBorder : null,
              ]}
              placeholder="Enter mobile number (e.g. 09171234567)"
              placeholderTextColor="#94A3B8"
              value={phoneValue}
              onChangeText={(text) => {
                setPhoneValue(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Field 2: Email Address (BOTTOM OF PHONE NUMBER) */}
            <Text style={[styles.inputLabel, { marginTop: 14 }]}>Email Address</Text>
            <TextInput
              style={[
                styles.textInput,
                errorMessage && !emailValue.trim() ? styles.inputErrorBorder : null,
              ]}
              placeholder="Enter email address (e.g. citizen@gmail.com)"
              placeholderTextColor="#94A3B8"
              value={emailValue}
              onChangeText={(text) => {
                setEmailValue(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Primary Action Button (Continue) */}
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleContinue}
              disabled={isLoading}
              activeOpacity={0.85}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>

            {/* Divider (OR) */}
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Secondary Action Button (Continue as Guest) */}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleContinueAsGuest}
              activeOpacity={0.85}>
              <Text style={styles.secondaryButtonText}>Continue as Guest</Text>
            </TouchableOpacity>

            {/* Footer Disclaimer */}
            <View style={styles.footerContainer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our{' '}
                <Text style={styles.footerLink} onPress={handleOpenTerms}>
                  Terms of Service
                </Text>{' '}
                and
              </Text>
              <Text style={styles.footerText}>
                Acknowledge our{' '}
                <Text style={styles.footerLink} onPress={handleOpenPrivacy}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
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
  watermarkBg: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 260,
    width: '100%',
    opacity: 0.35,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: 220,
    height: 220,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 19,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#165B7E',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    marginHorizontal: 12,
  },
  secondaryButton: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '600',
  },
  footerContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  footerLink: {
    color: '#165B7E',
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
