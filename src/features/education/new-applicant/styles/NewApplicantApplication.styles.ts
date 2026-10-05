import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 120,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 18,
    gap: 10,
  },

  backIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },

  backIcon: {},

  backText: {
    color: "#0284C7",
    fontSize: 14,
    fontWeight: "700",
  },

  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,
  },

  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },

  programTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    lineHeight: 26,
  },

  programCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 8,
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  sectionSubtitle: {
    fontSize: 13,
    color: "#64748B",
    marginBottom: 16,
    lineHeight: 18,
  },

  inputGroup: {
    marginBottom: 20,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },

  textInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  docItemCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 12,
  },

  docHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },

  docTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
    paddingRight: 8,
  },

  docInstructions: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 10,
    lineHeight: 16,
  },

  uploadBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#0284C7",
    backgroundColor: "#F0F9FF",
    gap: 8,
  },

  uploadBoxSuccess: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  uploadText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0284C7",
  },

  fileNameText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },

  submitButton: {
    backgroundColor: "#0284C7",
    borderRadius: 24,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },

  submitButtonDisabled: {
    backgroundColor: "#CBD5E1",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  successCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DCFCE7",
    padding: 24,
    alignItems: "center",
    marginBottom: 16,
  },

  successIconRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#DCFCE7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },

  successTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },

  successSub: {
    fontSize: 14,
    color: "#475569",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 20,
  },

  metaBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    gap: 8,
    marginBottom: 20,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  metaLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  metaValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
  },

  // Video Declaration Guide Styles
  videoGuideCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    padding: 12,
    marginBottom: 12,
  },

  videoGuideHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },

  videoGuideTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0369A1",
  },

  videoGuideSubtitle: {
    fontSize: 12,
    color: "#0284C7",
    marginBottom: 10,
    lineHeight: 16,
  },

  videoGuideImageWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  videoGuideImage: {
    width: "100%",
    height: 180,
  },

  viewFullGuideBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#0284C7",
    alignSelf: "flex-start",
    marginBottom: 10,
    gap: 6,
  },

  viewFullGuideBtnText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  videoGuideFooter: {
    fontSize: 11,
    color: "#475569",
    lineHeight: 15,
    fontStyle: "italic",
  },

  // Full Guide Image Modal Styles
  fullImageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  fullImageModalCard: {
    width: "100%",
    maxHeight: "88%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },

  fullImageModalHeader: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  fullImageModalTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  fullImageModalCloseBtn: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  fullImageModalCloseText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  fullImageModalScroll: {
    width: "100%",
  },

  fullImageModalImage: {
    width: "100%",
    height: 480,
  },

  // OCR Document Validation Feedback Styles
  ocrFeedbackBox: {
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    padding: 10,
  },
  ocrValidatingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0F9FF",
    borderColor: "#BAE6FD",
  },
  ocrValidatingText: {
    fontSize: 12,
    color: "#0369A1",
    fontWeight: "500",
  },
  ocrMatchBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderColor: "#BBF7D0",
  },
  ocrMatchText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#15803D",
    fontWeight: "500",
    flex: 1,
  },
  ocrMismatchBox: {
    flexDirection: "column",
    backgroundColor: "#FFFBEB",
    borderColor: "#FDE68A",
  },
  ocrMismatchContentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  ocrMismatchText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#B45309",
    fontWeight: "500",
    flex: 1,
  },
  ocrChangeFileBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    marginTop: 8,
    marginLeft: 24,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  ocrChangeFileBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#92400E",
  },
  ocrInconclusiveBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  ocrInconclusiveText: {
    fontSize: 12,
    lineHeight: 17,
    color: "#475569",
    fontWeight: "500",
    flex: 1,
  },
  fastTrackCard: {
    backgroundColor: "#F0FDF4",
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#86EFAC",
    padding: 16,
    marginBottom: 16,
    overflow: "hidden",
  },
  fastTrackHeader: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 10,
  },
  fastTrackBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#86EFAC",
    alignSelf: "flex-start",
  },
  fastTrackBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },
  fastTrackIdBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#86EFAC",
    alignSelf: "flex-start",
  },
  fastTrackIdLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#15803D",
  },
  fastTrackIdNumber: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },
  fastTrackRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 6,
  },
  fastTrackLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4B5563",
    width: 80,
  },
  fastTrackValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  fastTrackNote: {
    fontSize: 11,
    color: "#16A34A",
    fontStyle: "italic",
    marginTop: 4,
    lineHeight: 16,
  },
  unverifiedTipBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  unverifiedTipText: {
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 17,
  },
  unverifiedTipLink: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0284C7",
    marginTop: 4,
  },
  verifiedLockedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#86EFAC",
  },
  verifiedLockedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },
  preClearedCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    padding: 10,
    marginTop: 8,
    marginBottom: 8,
  },
  preClearedCalloutText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "500",
    flex: 1,
    lineHeight: 16,
  },

  // Progressive Wizard Stepper Styles
  stepperCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  stepperRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepItem: {
    alignItems: "center",
    width: 78,
  },
  stepNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  stepNodeActive: {
    backgroundColor: "#0284C7",
    borderColor: "#0284C7",
  },
  stepNodeCompleted: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  stepNodeUpcoming: {
    backgroundColor: "#F1F5F9",
    borderColor: "#CBD5E1",
  },
  stepNodeText: {
    fontSize: 13,
    fontWeight: "700",
  },
  stepNodeTextActive: {
    color: "#FFFFFF",
  },
  stepNodeTextCompleted: {
    color: "#FFFFFF",
  },
  stepNodeTextUpcoming: {
    color: "#94A3B8",
  },
  stepLabel: {
    fontSize: 11,
    textAlign: "center",
  },
  stepLabelActive: {
    color: "#0284C7",
    fontWeight: "800",
  },
  stepLabelCompleted: {
    color: "#16A34A",
    fontWeight: "700",
  },
  stepLabelUpcoming: {
    color: "#94A3B8",
    fontWeight: "500",
  },
  stepConnector: {
    flex: 1,
    height: 2,
    backgroundColor: "#E2E8F0",
    marginHorizontal: 4,
    marginBottom: 20,
  },
  stepConnectorCompleted: {
    backgroundColor: "#16A34A",
  },

  // Step Headings & Badge
  stepHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stepProgressBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  stepProgressBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#0284C7",
  },

  // Step 1 Profile Dossier Card
  dossierCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 14,
    marginBottom: 16,
  },
  dossierHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  dossierTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },
  dossierGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
    columnGap: 12,
  },
  dossierItem: {
    width: "47%",
  },
  dossierItemFull: {
    width: "100%",
  },
  dossierItemLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 2,
  },
  dossierItemValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  // Step Navigation Action Row
  wizardNavRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 20,
    paddingBottom: 32,
  },
  wizardBackBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    backgroundColor: "#FFFFFF",
  },
  wizardBackBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#475569",
  },
  wizardNextBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0284C7",
  },
  wizardNextBtnFull: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#0284C7",
  },
  wizardNextBtnDisabled: {
    backgroundColor: "#94A3B8",
    opacity: 0.7,
  },
  wizardNextBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Compact Program Subheader for Wizard Steps 2 & 3
  programSubheader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 16,
    gap: 8,
  },
  programSubheaderText: {
    fontSize: 13,
    color: "#0369A1",
    flex: 1,
  },

  // Demographics Grid (2-column)
  demographicsRow: {
    flexDirection: "row",
    gap: 12,
  },
  demographicItem: {
    flex: 1,
  },
  demographicLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },
  demographicBox: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  demographicValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
  },

  // Step 3 Review Dossier Summary
  reviewSummaryCard: {
    backgroundColor: "#F0F9FF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#BAE6FD",
    padding: 14,
    marginBottom: 16,
  },
  reviewSummaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#BAE6FD",
  },
  reviewSummaryTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0369A1",
  },
  reviewRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 8,
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#475569",
    width: 95,
  },
  reviewValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
    flex: 1,
  },
  reviewNote: {
    fontSize: 11,
    color: "#0284C7",
    fontStyle: "italic",
    marginTop: 6,
  },

  // Step 1 Registration-style Form Inputs
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    height: 48,
    overflow: "hidden",
  },
  phonePrefixBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: "100%",
    backgroundColor: "#F1F5F9",
    borderRightWidth: 1,
    borderRightColor: "#E2E8F0",
    gap: 6,
  },
  phonePrefixText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  phoneTextInput: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#0F172A",
  },
  rowFields: {
    flexDirection: "row",
    gap: 12,
  },
  firstNameContainer: {
    flex: 2,
  },
  suffixContainer: {
    flex: 1,
  },
  suffixSelectBtn: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suffixSelectText: {
    fontSize: 14,
    color: "#0F172A",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    borderColor: "#0284C7",
    backgroundColor: "#0284C7",
  },
  checkboxLabel: {
    fontSize: 13,
    color: "#475569",
  },
  verifiedLockedField: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  lockedInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 8,
  },
  lockedTextInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    padding: 0,
  },
  lockedAddressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 56,
    gap: 8,
  },
  lockedAddressText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#1E293B",
    lineHeight: 20,
  },
  verifiedLockedBadgeInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  verifiedLockedBadgeInlineText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#15803D",
  },
  suffixModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  suffixModalCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  suffixModalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  suffixModalItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  suffixModalItemText: {
    fontSize: 15,
    color: "#334155",
  },
  suffixModalItemTextActive: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0284C7",
  },

  // Partner School Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  schoolModalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },
  schoolModalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  schoolModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },
  schoolModalSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  schoolModalCloseBtn: {
    padding: 4,
    borderRadius: 8,
  },
  schoolSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 12,
  },
  schoolSearchInput: {
    flex: 1,
    height: "100%",
    fontSize: 14,
    color: "#0F172A",
  },
  manualSchoolBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  manualSchoolIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#0284C7",
    alignItems: "center",
    justifyContent: "center",
  },
  manualSchoolTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0369A1",
  },
  manualSchoolSubtitle: {
    fontSize: 11,
    color: "#0284C7",
    marginTop: 1,
  },
  schoolListItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  schoolListItemActive: {
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  schoolCodeBadge: {
    backgroundColor: "#E0F2FE",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  schoolCodeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#0284C7",
  },
  schoolItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    lineHeight: 18,
  },
});
