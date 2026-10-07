import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';

export interface AuthGateModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  onClose: () => void;
  onSignIn?: () => void;
  onRegister?: () => void;
}

export function AuthGateModal({
  visible,
  title = 'Sign In Required',
  message = 'This municipal e-service is only accessible to registered Caloocan City citizens. Please sign in to continue.',
  onClose,
  onSignIn,
  onRegister,
}: AuthGateModalProps) {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const handleSignIn = () => {
    onClose();
    if (onSignIn) {
      onSignIn();
    } else {
      router.push('/(auth)/login' as any);
    }
  };

  const handleRegister = () => {
    onClose();
    if (onRegister) {
      onRegister();
    } else {
      router.push('/(auth)/register' as any);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.authGateOverlay}>
        <View
          style={[
            styles.authGateCard,
            isDarkMode && {
              backgroundColor: '#1C2541',
              borderColor: '#3A506B',
              borderWidth: 1,
            },
          ]}
        >
          {/* Icon Ring */}
          <View
            style={[
              styles.authGateIconRing,
              isDarkMode && { backgroundColor: '#0F2942', borderColor: '#1E3A8A' },
            ]}
          >
            <IconSymbol
              name="lock.shield.fill"
              size={34}
              color={isDarkMode ? '#38BDF8' : '#165B7E'}
            />
          </View>

          {/* Title & Subtitle */}
          <Text style={[styles.authGateTitle, isDarkMode && { color: '#F8FAFC' }]}>
            {title}
          </Text>
          <Text style={[styles.authGateSub, isDarkMode && { color: '#CBD5E1' }]}>
            {message}
          </Text>

          {/* Divider with city branding */}
          <View style={styles.authGateBrandRow}>
            <View
              style={[
                styles.authGateBrandLine,
                isDarkMode && { backgroundColor: '#3A506B' },
              ]}
            />
            <Text
              style={[
                styles.authGateBrandText,
                isDarkMode && { color: '#94A3B8' },
              ]}
            >
              CALOOCAN CITY GOVERNMENT
            </Text>
            <View
              style={[
                styles.authGateBrandLine,
                isDarkMode && { backgroundColor: '#3A506B' },
              ]}
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.authGateActions}>
            <TouchableOpacity
              style={styles.authGateLoginBtn}
              onPress={handleSignIn}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Sign in to your account"
            >
              <IconSymbol name="person.fill" size={16} color="#FFFFFF" />
              <Text style={styles.authGateLoginText}>Sign In to My Account</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authGateRegisterBtn,
                isDarkMode && {
                  backgroundColor: '#0F2942',
                  borderColor: '#1E40AF',
                },
              ]}
              onPress={handleRegister}
              activeOpacity={0.88}
              accessibilityRole="button"
              accessibilityLabel="Create a citizen account"
            >
              <IconSymbol
                name="person.2.fill"
                size={16}
                color={isDarkMode ? '#38BDF8' : '#165B7E'}
              />
              <Text
                style={[
                  styles.authGateRegisterText,
                  isDarkMode && { color: '#38BDF8' },
                ]}
              >
                Create a Citizen Account
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.authGateCancelBtn,
                isDarkMode && { backgroundColor: '#334155', borderColor: '#475569' },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Continue browsing as guest"
            >
              <Text
                style={[
                  styles.authGateCancelText,
                  isDarkMode && { color: '#F8FAFC' },
                ]}
              >
                Continue Browsing as Guest
              </Text>
            </TouchableOpacity>
          </View>

          {/* Footer Security Badge */}
          <View style={styles.authGateFooter}>
            <IconSymbol name="shield.fill" size={11} color="#94A3B8" />
            <Text
              style={[
                styles.authGateFooterText,
                isDarkMode && { color: '#94A3B8' },
              ]}
            >
              {'  '}Protected by Caloocan City E-Governance Portal
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  authGateOverlay: {
    flex: 1,
    backgroundColor: 'rgba(10, 20, 40, 0.65)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  authGateCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 40,
    alignItems: 'center',
  },
  authGateIconRing: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  authGateTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  authGateSub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  authGateBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
    gap: 8,
  },
  authGateBrandLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  authGateBrandText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1,
  },
  authGateActions: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
  },
  authGateLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#165B7E',
    borderRadius: 14,
    paddingVertical: 15,
    gap: 8,
  },
  authGateLoginText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  authGateRegisterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    paddingVertical: 14,
    gap: 8,
  },
  authGateRegisterText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#165B7E',
  },
  authGateCancelBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  authGateCancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textDecorationLine: 'underline',
  },
  authGateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authGateFooterText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
});
