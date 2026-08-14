import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
  },
  topNavRow: {
    marginBottom: 20,
    marginTop: 8,
  },
  backCircleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backIcon: {
    transform: [{ rotate: '180deg' }],
  },
  headerContainer: {
    marginBottom: 28,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
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
  textInputDisabled: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 14,
    color: '#0F172A',
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
  },
  inputErrorBorder: {
    borderColor: '#EF4444',
  },
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },
  eyeIconBtn: {
    padding: 6,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 6,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#165B7E',
    backgroundColor: '#165B7E',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  rememberMeText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#165B7E',
  },
  bottomContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  signInButton: {
    backgroundColor: '#165B7E',
    borderRadius: 24,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* SIMPLE GOVERNMENT PORTAL LOADING SCREEN STYLES */
  simpleGovContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  simpleGovCenterStack: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleGovLogo: {
    width: 140,
    height: 140,
    marginBottom: 16,
  },
  simpleGovTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#165B7E',
    letterSpacing: 3,
    textAlign: 'center',
  },
  simpleGovSubtitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 2,
    marginTop: 4,
    marginBottom: 32,
    textAlign: 'center',
  },
  simpleGovSpinnerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
