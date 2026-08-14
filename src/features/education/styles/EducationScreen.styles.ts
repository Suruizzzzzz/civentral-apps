import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 110,
  },
  headerContainer: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    lineHeight: 18,
  },

  /* 4 Main Button Hub Menu */
  menuStack: {
    gap: 12,
  },
  fourButtonsGrid: {
    gap: 12,
  },
  hubCardButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  hubCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  hubIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hubCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  hubCardSub: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 17,
    marginBottom: 14,
  },
  hubCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
    paddingTop: 10,
    gap: 4,
  },
  hubCardActionText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7E22CE',
  },

  /* Section Back Navigation & Blank Box */
  sectionStack: {
    gap: 14,
  },
  backToMenuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
    marginBottom: 4,
  },
  backIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  backToMenuText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#176B87',
  },
  blankContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 30,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sectionHeadingText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  sectionSubheadingText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
  },

  /* ── GUEST BANNER ── */
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  guestBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#92400E',
  },

  /* ── AUTH GATE MODAL ── */
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
    paddingBottom: 44,
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
