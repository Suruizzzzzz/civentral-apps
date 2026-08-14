import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  topNavRow: {
    marginBottom: 16,
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
  progressContainer: {
    flexDirection: 'row',
    height: 4,
    marginBottom: 20,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressActive: {
    flex: 1,
    backgroundColor: '#165B7E',
  },
  progressInactive: {
    flex: 1,
    backgroundColor: '#E2E8F0',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'android' ? 24 : 12,
    paddingBottom: 40,
  },
  screenTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 20,
    letterSpacing: -0.5,
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
    color: '#334155',
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
  disabledInput: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  rowFields: {
    flexDirection: 'row',
    marginTop: 14,
    gap: 12,
  },
  firstNameContainer: {
    flex: 1.8,
  },
  suffixContainer: {
    flex: 1.2,
  },
  suffixText: {
    fontSize: 14,
    color: '#475569',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    borderColor: '#165B7E',
    backgroundColor: '#165B7E',
  },
  checkboxInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#64748B',
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
  passwordInput: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#0F172A',
  },
  eyeIconBtn: {
    padding: 6,
  },

  /* PASSWORD STRENGTH INDICATOR METER STYLES */
  strengthMeterContainer: {
    marginTop: 10,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  strengthBarsRow: {
    flexDirection: 'row',
    height: 6,
    gap: 6,
    marginBottom: 8,
  },
  strengthBar: {
    flex: 1,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
  },
  barWeak: {
    backgroundColor: '#EF4444',
  },
  barMedium: {
    backgroundColor: '#F59E0B',
  },
  barStrong: {
    backgroundColor: '#10B981',
  },
  strengthLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  strengthPromptText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  textWeak: {
    color: '#EF4444',
  },
  textMedium: {
    color: '#F59E0B',
  },
  textStrong: {
    color: '#10B981',
  },
  checklistContainer: {
    gap: 6,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  checkTextActive: {
    color: '#0F172A',
    fontWeight: '600',
  },

  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#165B7E',
    borderRadius: 24,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
  accountPromptText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#475569',
    marginBottom: 14,
    fontWeight: '500',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});
