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

  /* TIMELINE ITEM & CONNECTING LINES */
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 0,
  },

  timelineItemRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    marginBottom: 0,
  },

  timelineLeft: {
    alignItems: 'center',
    width: 32,
    marginRight: 12,
  },

  timelineLeftColumn: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },

  timelineIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    zIndex: 2,
  },

  timelineConnectorLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 3,
    borderRadius: 1.5,
    zIndex: 1,
    minHeight: 24,
  },

  timelineContentCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },

  timelineContentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

  timelineStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },

  timelineStatusPillText: {
    fontSize: 11,
    fontWeight: '700',
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },

  timelineDate: {
    fontSize: 12,
    marginTop: 2,
  },

  timelineDateText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
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
