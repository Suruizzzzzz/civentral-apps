import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAF5FF',
  },

  container: {
    flex: 1,
  },

  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 140,
    flexGrow: 1,
  },

  /* Header Section */
  headerWrapper: {
    marginBottom: 14,
  },

  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 0,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },

  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#7E22CE',
  },

  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },

  headerSubtitle: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#64748B',
    lineHeight: 18,
  },

  /* Filter / Count Summary Bar */
  filterSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 2,
  },

  recordCountPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  recordCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#7E22CE',
  },

  filterTabsContainer: {
    flexDirection: 'row',
    gap: 6,
  },

  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },

  filterTabActive: {
    backgroundColor: '#7E22CE',
    borderColor: '#7E22CE',
  },

  filterTabText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },

  filterTabTextActive: {
    color: '#FFFFFF',
  },

  /* Record Cards List */
  cardsList: {
    gap: 14,
  },

  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  historyCardCurrent: {
    borderColor: '#C084FC',
    borderWidth: 1.5,
  },

  /* Card Top Row */
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 6,
  },

  cardPeriodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  cardPeriodText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#7E22CE',
  },

  cardTagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  currentPeriodTag: {
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: '#E9D5FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },

  currentPeriodTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#7E22CE',
    letterSpacing: 0.3,
  },

  recordTypeTag: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },

  recordTypeTagApplication: {
    backgroundColor: '#F3E8FF',
    borderColor: '#E9D5FF',
  },

  recordTypeTagApplicationText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#7E22CE',
  },

  recordTypeTagGrant: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
  },

  recordTypeTagGrantText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
  },

  recordTypeTagRenewal: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },

  recordTypeTagRenewalText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
  },

  /* Card Title & Subtitle */
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 3,
    letterSpacing: -0.2,
  },

  cardSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },

  /* Card Meta Box */
  cardMetaBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 14,
    gap: 6,
  },

  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  cardMetaLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },

  cardMetaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },

  cardStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  cardStatusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },

  cardStatusText: {
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  /* Card Action Buttons Row */
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },

  cardDocumentsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 7,
    backgroundColor: '#F3E8FF',
  },

  cardDocumentsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#7E22CE',
  },

  cardDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#7E22CE',
    minHeight: 38,
  },

  cardDetailsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Empty State */
  emptyContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },

  emptyDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Per-Record Documents Modal */
  docsModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },

  docsModalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    maxHeight: '80%',
    paddingBottom: 28,
  },

  docsModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },

  docsModalHeaderTextCol: {
    flex: 1,
    paddingRight: 10,
  },

  docsModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#7E22CE',
    letterSpacing: -0.2,
  },

  docsModalSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  docsModalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  docsModalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  docsModalCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
  },

  docsModalCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },

  docsModalCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
    paddingRight: 8,
  },

  docsModalCardStatusPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },

  docsModalCardStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#15803D',
  },

  docsModalCardDocNum: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 2,
  },

  docsModalCardDate: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#94A3B8',
    marginBottom: 10,
  },

  docsModalCardActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },

  docsModalBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },

  docsModalBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },

  docsModalBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#7E22CE',
  },

  docsModalBtnPrimaryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* General Feedback Modal */
  feedbackOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  feedbackCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },

  feedbackIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3E8FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  feedbackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
    textAlign: 'center',
  },

  feedbackBody: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },

  feedbackBtn: {
    backgroundColor: '#7E22CE',
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 8,
  },

  feedbackBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});
