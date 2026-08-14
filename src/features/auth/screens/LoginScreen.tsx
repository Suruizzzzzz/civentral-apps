import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { AuthService } from '@/src/services/auth-service';
import { styles } from '../styles/LoginScreen.styles';

export function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ identifier?: string; email?: string; phone?: string; mode?: string }>();

  const [email, setEmail] = useState(params.identifier || params.email || params.phone || '');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSignIn = async () => {
    setErrorMessage(null);

    if (!password.trim()) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    const response = await AuthService.login(email.trim(), password.trim());
    setIsLoading(false);

    if (response.status === 'success') {
      setIsRedirecting(true);
      
      // Auto-redirect after smooth loading delay (1s)
      setTimeout(() => {
        router.replace({
          pathname: '/(tabs)',
          params: {
            email: response.email || email.trim(),
            citizenUserId: response.citizen_user_id || response.user?.citizen_user_id,
            isGuest: 'false',
          },
        } as any);
      }, 1000);
    } else if (response.status === 'otp_required') {
      const isPhoneLogin = params.mode === 'phone' || (!email.trim().includes('@') && email.trim());
      const route = isPhoneLogin ? '/(auth)/verify-phone' : '/(auth)/verify';
      Alert.alert('Verification Required', response.message || 'Please verify your account to complete login.', [
        {
          text: isPhoneLogin ? 'Verify Mobile Number' : 'Verify Email',
          onPress: () =>
            router.push({
              pathname: route as any,
              params: {
                phone: isPhoneLogin ? ((response as any).mobile_number || email) : '',
                email: !isPhoneLogin ? (response.email || email) : '',
                identifier: email,
              },
            }),
        },
      ]);
    } else {
      setErrorMessage(response.message);
    }
  };

  const handleForgotPassword = () => {
    router.push({
      pathname: '/(auth)/forgot-password' as any,
      params: { identifier: email.trim() },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}>
        
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* Circular Back Navigation Button */}
          <View style={styles.topNavRow}>
            <TouchableOpacity
              style={styles.backCircleBtn}
              onPress={() => router.replace('/(auth)' as any)}
              activeOpacity={0.75}>
              <IconSymbol name="chevron.right" size={20} color="#0F172A" style={styles.backIcon} />
            </TouchableOpacity>
          </View>

          {/* Header Title & Subtitle */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Welcome Back!</Text>
            <Text style={styles.headerSubtitle}>
              Please enter your password to sign-in to your Civentral account.
            </Text>
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            {/* Field 1: Email Address */}
            <Text style={styles.inputLabel}>Email Address / Phone Number</Text>
            <TextInput
              style={styles.textInputDisabled}
              placeholder="Enter your email address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading && !isRedirecting}
            />

            {/* Field 2: Password */}
            <Text style={[styles.inputLabel, { marginTop: 18 }]}>Password</Text>
            <View style={[styles.passwordWrapper, errorMessage ? styles.inputErrorBorder : null]}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter your password"
                placeholderTextColor="#94A3B8"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry={!isPasswordVisible}
                autoCapitalize="none"
                editable={!isLoading && !isRedirecting}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setIsPasswordVisible((prev) => !prev)}
                activeOpacity={0.7}>
                <IconSymbol
                  name={isPasswordVisible ? 'eye.slash.fill' : 'eye.fill'}
                  size={20}
                  color="#64748B"
                />
              </TouchableOpacity>
            </View>

            {/* Error Text */}
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            {/* Remember Me & Forgot Password Row */}
            <View style={styles.optionsRow}>
              <TouchableOpacity
                style={styles.rememberMeContainer}
                onPress={() => setRememberMe((prev) => !prev)}
                activeOpacity={0.8}>
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <View style={styles.checkboxInner} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleForgotPassword} activeOpacity={0.7}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Fixed Sign In Button */}
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={[styles.signInButton, (isLoading || isRedirecting) && styles.disabledButton]}
            onPress={handleSignIn}
            disabled={isLoading || isRedirecting}
            activeOpacity={0.85}>
            {isLoading || isRedirecting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signInButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* SIMPLE GOVERNMENT PORTAL LOADING SCREEN */}
        <Modal
          visible={isRedirecting}
          transparent={false}
          animationType="fade"
          hardwareAccelerated>
          <View style={styles.simpleGovContainer}>
            <View style={styles.simpleGovCenterStack}>
              {/* Municipality Logo Icon */}
              <Image
                source={require('@/assets/images/logo.png')}
                style={styles.simpleGovLogo}
                resizeMode="contain"
              />

              {/* Capitalized Title */}
              <Text style={styles.simpleGovTitle}>Civentral</Text>
              <Text style={styles.simpleGovSubtitle}>CITY OF CALOOCAN</Text>

              {/* Loading Spinner at the Bottom */}
              <View style={styles.simpleGovSpinnerBox}>
                <ActivityIndicator size="large" color="#165B7E" />
              </View>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
