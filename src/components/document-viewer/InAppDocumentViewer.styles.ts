import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
  },
  darkBg: {
    backgroundColor: '#0F172A',
  },
  lightBg: {
    backgroundColor: '#FFFFFF',
  },
  darkBorder: {
    borderBottomColor: '#1E293B',
  },
  lightBorder: {
    borderBottomColor: '#E2E8F0',
  },
  darkText: {
    color: '#F8FAFC',
  },
  lightText: {
    color: '#0F172A',
  },
  darkMutedText: {
    color: '#94A3B8',
  },
  lightMutedText: {
    color: '#64748B',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerInfoCol: {
    flex: 1,
    paddingRight: 16,
  },
  documentTitle: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  referenceMetaText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
    letterSpacing: 0.1,
  },
  pillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  pillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillNeutralLight: {
    backgroundColor: '#F1F5F9',
  },
  pillNeutralDark: {
    backgroundColor: '#1E293B',
  },
  pillTextNeutralLight: {
    color: '#475569',
  },
  pillTextNeutralDark: {
    color: '#94A3B8',
  },
  pillSuccessLight: {
    backgroundColor: '#ECFDF5',
  },
  pillSuccessDark: {
    backgroundColor: '#064E3B',
  },
  pillTextSuccessLight: {
    color: '#047857',
  },
  pillTextSuccessDark: {
    color: '#6EE7B7',
  },
  pillCountLight: {
    backgroundColor: '#F3E8FF',
  },
  pillCountDark: {
    backgroundColor: '#3B0764',
  },
  pillTextCountLight: {
    color: '#7E22CE',
  },
  pillTextCountDark: {
    color: '#D8B4FE',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  closeCircleBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    marginTop: 2,
  },
  closeCircleBtnLight: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  closeCircleBtnDark: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  viewportContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    position: 'relative',
  },
  webView: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  imageScroll: {
    flex: 1,
  },
  imageContentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  fullImage: {
    width: '100%',
    height: '100%',
    borderRadius: 6,
  },
  loadingBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  errorBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    color: '#F8FAFC',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  errorSubtitle: {
    color: '#94A3B8',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  errorDownloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  errorDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  footerContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'transparent',
  },
  darkFooterBg: {
    backgroundColor: '#0F172A',
    borderTopColor: '#1E293B',
  },
  lightFooterBg: {
    backgroundColor: '#FFFFFF',
    borderTopColor: '#E2E8F0',
  },
  fullDownloadBtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  fullDownloadBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default styles;
