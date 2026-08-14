import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { AuthService } from '@/src/services/auth-service';
import { styles } from '../styles/AuthEntryScreen.styles';

export type AuthMode = 'email' | 'phone';

export function AuthEntryScreen() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [inputValue, setInputValue] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isEmail = authMode === 'email';

  // Toggle between Email and Phone mode
  const handleToggleMode = () => {
    setAuthMode((prev) => (prev === 'email' ? 'phone' : 'email'));
    setInputValue('');
    setErrorMessage(null);
  };

  const [isLoading, setIsLoading] = useState(false);

  // Input Validation & Account Check Action
  const handleContinue = async () => {
    setErrorMessage(null);
    const trimmed = inputValue.trim();

    if (!trimmed) {
      setErrorMessage(`Please enter your ${isEmail ? 'email address' : 'phone number'}.`);
      return;
    }

    if (isEmail) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmed)) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    } else {
      const phoneRegex = /^(\+?63|0)9\d{9}$/;
      if (!phoneRegex.test(trimmed.replace(/\s+/g, ''))) {
        setErrorMessage('Please enter a valid PH mobile number.');
        return;
      }
    }

    setIsLoading(true);
    const checkResult = await AuthService.checkAccount(trimmed);
    setIsLoading(false);

    if (checkResult.exists) {
      // User account exists -> Navigate to Login Password Screen
      router.push({
        pathname: '/(auth)/login' as any,
        params: { identifier: trimmed, mode: authMode },
      });
    } else {
      // User account does not exist -> Navigate to Register Screen
      router.push({
        pathname: '/(auth)/register' as any,
        params: { identifier: trimmed, mode: authMode },
      });
    }
  };

  // Guest Mode Action
  const handleContinueAsGuest = () => {
    AuthService.setGuestMode(true);
    router.replace({
      pathname: '/(tabs)',
      params: { isGuest: 'true' },
    } as any);
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
              Enter your email or phone number to log-in to an existing account or instantly set up your new account.
            </Text>
          </View>

          {/* Form Area */}
          <View style={styles.formContainer}>
            {/* Input Label */}
            <Text style={styles.inputLabel}>
              {isEmail ? 'Email Address' : 'Phone Number'}
            </Text>

            {/* Input Field */}
            <TextInput
              style={[
                styles.textInput,
                errorMessage ? styles.inputErrorBorder : null,
              ]}
              placeholder={isEmail ? 'Enter your email address' : 'Enter your phone number'}
              placeholderTextColor="#94A3B8"
              value={inputValue}
              onChangeText={(text) => {
                setInputValue(text);
                if (errorMessage) setErrorMessage(null);
              }}
              keyboardType={isEmail ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Error Message */}
            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            {/* Toggle Link */}
            <TouchableOpacity
              style={styles.toggleButton}
              onPress={handleToggleMode}
              activeOpacity={0.7}>
              <Text style={styles.toggleText}>
                {isEmail ? 'Use Phone Number Instead' : 'Use Email Address Instead'}
              </Text>
            </TouchableOpacity>

            {/* Primary Action Button (Continue) */}
            <TouchableOpacity
              style={[styles.primaryButton, isLoading && styles.disabledButton]}
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
