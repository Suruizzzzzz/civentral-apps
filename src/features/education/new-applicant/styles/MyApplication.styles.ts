import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back Button */
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },

  backIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },

  /* Header Context Card */
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  headerPreTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0284C7',
    letterSpacing: 0.5,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  headerSub: {
    fontSize: 13,
    color: '#64748B',
    marginBottom: 14,
  },

  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginTop: 4,
  },

  headerMetaCol: {
    flex: 1,
  },

  headerMetaLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 3,
  },

  headerMetaCode: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0284C7',
  },

  headerMetaVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Section Card */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },

  trackerBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },

  trackerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },

  /* Info Grid */
  infoGrid: {
    gap: 10,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },

  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Timeline Styles */
  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 4,
  },

  timelineLeftColumn: {
    width: 32,
    alignItems: 'center',
  },

  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },

  timelineConnectorLine: {
    width: 2,
    flex: 1,
    marginVertical: -2,
    minHeight: 28,
  },

  timelineContentCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginLeft: 10,
    marginBottom: 12,
  },

  timelineContentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    marginRight: 8,
  },

  timelineStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
  },

  timelineStatusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },

  timelineDateText: {
    fontSize: 11,
    fontWeight: '500',
  },

  /* Grant Continuation Section */
  grantCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0D9488',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  grantActionBtn: {
    marginTop: 12,
    backgroundColor: '#0F766E',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  grantActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  distributionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EA580C',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  distributionActionBtn: {
    marginTop: 12,
    backgroundColor: '#EA580C',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

  distributionActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Empty State */
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 10,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },

  emptySub: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    paddingHorizontal: 12,
  },

  emptyActionsRow: {
    width: '100%',
    gap: 10,
  },

  primaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0284C7',
    width: '100%',
    paddingVertical: 12,
    borderRadius: 14,
  },

  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  secondaryActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#0284C7',
    width: '100%',
    paddingVertical: 11,
    borderRadius: 14,
  },

  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0284C7',
  },

  /* Withdrawal Section */
  withdrawCard: {
    borderWidth: 1,
    borderColor: '#F43F5E',
    backgroundColor: '#FFF1F2',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  withdrawTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E11D48',
  },

  withdrawSub: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },

  withdrawBtn: {
    backgroundColor: '#E11D48',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },

  withdrawBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },

  withdrawnCard: {
    borderWidth: 1,
    borderColor: '#94A3B8',
    backgroundColor: '#F8FAFC',
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
});
