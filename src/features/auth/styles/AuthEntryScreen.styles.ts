import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
    marginBottom: 28,
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
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  formContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
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
    marginTop: 4,
    fontWeight: '600',
  },
  toggleButton: {
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#165B7E',
  },
  primaryButton: {
    backgroundColor: '#165B7E',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#1E293B',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
  footerContainer: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#475569',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#165B7E',
    fontWeight: '600',
  },
});
