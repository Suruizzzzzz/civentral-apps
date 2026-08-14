import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
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
