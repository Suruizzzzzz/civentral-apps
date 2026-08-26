import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },

  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  backIcon: {
    transform: [{ rotate: '180deg' }],
    marginRight: 4,
  },

  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#7E22CE',
  },

  /* HEADER CONTEXT CARD */
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  headerBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  headerBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.5,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },

  headerSub: {
    fontSize: 12,
    color: '#64748B',
    marginBottom: 12,
  },

  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 10,
    gap: 12,
  },

  headerMetaCol: {
    flex: 1,
  },

  headerMetaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },

  headerMetaVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },

  headerMetaCode: {
    fontSize: 12,
    fontWeight: '800',
    color: '#7E22CE',
    marginTop: 2,
  },

  /* TABS CONTAINER */
  tabsScroll: {
    marginBottom: 16,
  },

  tabsContainer: {
    flexDirection: 'row',
    gap: 8,
  },

  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  tabBtnActive: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },

  tabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },

  tabBtnTextActive: {
    color: '#FFFFFF',
  },

  /* CONTENT CARDS */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 14,
  },

  infoGrid: {
    gap: 12,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  infoRowStacked: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  infoLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'right',
  },

  infoValueStacked: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 3,
  },

  /* TIMELINE ITEM */
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  timelineLeft: {
    alignItems: 'center',
    width: 28,
    marginRight: 8,
  },

  timelineIconCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  timelineDate: {
    fontSize: 12,
    marginTop: 2,
  },

  /* DOCUMENT CARDS */
  docCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },

  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },

  docTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },

  docSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },

  docActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7E22CE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 10,
  },

  docActionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  docWarningBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },

  docWarningText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '600',
  },

  /* CERTIFICATE CARD */
  certCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },

  certHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },

  certTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },

  certSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  certBtnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  certPrimaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#7E22CE',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  certPrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  certSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  certSecondaryBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  /* EMPTY STATES */
  emptyBox: {
    alignItems: 'center',
    padding: 24,
  },

  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 8,
  },
});
