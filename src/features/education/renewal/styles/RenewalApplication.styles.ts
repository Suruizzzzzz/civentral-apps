import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 160,
  },

  /* Back Button */
  backBtn: {
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
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  backIcon: {},
  backText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#15803D',
  },

  /* Program Identity Header Card */
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  programCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  scholarCodeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 2,
  },

  /* Numbered Section Cards */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
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
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 12,
  },
  sectionDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 14,
  },

  /* Overview Rows */
  overviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  overviewLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  overviewValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },

  /* Notice Boxes */
  noticeBox: {
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  /* Requirement Item */
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  requirementIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    marginTop: 2,
  },
  requirementContent: {
    flex: 1,
  },
  requirementHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 2,
  },
  requirementName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  requirementBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  requirementBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  requirementDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },

  /* Legacy context card compat */
  contextCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 20,
    marginBottom: 16,
  },
  programName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  scholarCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 10,
  },
  metaGrid: {
    gap: 8,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },

  /* Document Upload Cards */
  docCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 14,
  },
  docHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  docHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 8,
  },
  docIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#EAF8EF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docCodeBadge: {
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#B7E4C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docCodeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },
  docTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  docDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  fileStatusBox: {
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  fileStatusUnselected: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  fileStatusSelected: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  fileInfo: {
    flex: 1,
    marginRight: 10,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0F172A',
  },
  fileSize: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
    fontWeight: '500',
  },
  pickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#15803D',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  pickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  replaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EAF8EF',
    borderWidth: 1,
    borderColor: '#B7E4C7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  replaceBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },

  /* Review Summary Card */
  reviewCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#15803D',
    marginBottom: 10,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  reviewLabel: {
    fontSize: 13,
    color: '#166534',
  },
  reviewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },

  /* Submit / Apply for Renewal Button */
  submitBtn: {
    backgroundColor: '#15803D',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    shadowColor: '#15803D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  submitBtnDisabled: {
    backgroundColor: '#A7F3D0',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Confirmation Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 19,
    marginBottom: 20,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#15803D',
    alignItems: 'center',
  },
  modalConfirmText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Compact Inline OCR Feedback Styles */
  ocrFeedbackBox: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  ocrCheckingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  ocrCheckingText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0369A1',
  },
  ocrMatchBox: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    gap: 3,
  },
  ocrHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ocrMatchHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  ocrMatchDetail: {
    fontSize: 11,
    color: '#166534',
    marginLeft: 20,
  },
  ocrMismatchBox: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
    gap: 3,
  },
  ocrMismatchHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B45309',
  },
  ocrMismatchDetail: {
    fontSize: 11,
    color: '#92400E',
    marginLeft: 20,
  },
  ocrInconclusiveBox: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
    gap: 2,
  },
  ocrInconclusiveHeader: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  ocrInconclusiveDetail: {
    fontSize: 11,
    color: '#64748B',
    marginLeft: 20,
  },

  /* Unified Civentral Card Architecture */
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Header Identity Card with Renewal Artwork */
  headerMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTextCol: {
    flex: 1,
    flexShrink: 1,
    paddingRight: 12,
  },
  headerBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
    flexWrap: 'wrap',
  },
  headerProgramTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
    lineHeight: 22,
  },
  headerAcademicPeriod: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  headerArtworkBox: {
    width: 76,
    height: 72,
    borderRadius: 14,
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.20)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
  headerArtworkBoxDark: {
    backgroundColor: 'rgba(21, 128, 61, 0.16)',
    borderColor: 'rgba(74, 222, 128, 0.25)',
  },
  headerArtworkImage: {
    width: '100%',
    height: '100%',
  },
  headerMetaDividerRow: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerMetaText: {
    fontSize: 11,
    color: '#64748B',
  },

  /* Status Hero Section */
  statusHeroCard: {
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  statusHeroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  statusHeroTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  statusHeroDesc: {
    fontSize: 13,
    color: '#334155',
    lineHeight: 19,
  },
  statusHeroMeta: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 8,
  },
  complianceActionBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#D97706',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  complianceActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  /* Renewal Details Structured Rows */
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
  },
  detailCodeValue: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
});
