import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 140,
    flexGrow: 1,
  },

  /* Back navigation */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 8,
    marginBottom: 14,
  },

  backIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  backText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#7E22CE",
  },

  /* ============================================================== */
  /* ============================================================== */
  /* 1. SCHOLARSHIP DASHBOARD HEADER IMAGE                         */
  /* ============================================================== */
  headerContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#7E22CE",
  },

  headerContainerDark: {
    backgroundColor: "transparent",
    borderColor: "#C084FC",
  },

  headerImage: {
    width: "100%",
    height: "100%",
  },

  /* ============================================================== */
  /* 1. CURRENT SCHOLARSHIP CARD                                    */
  /* ============================================================== */
  currentScholarshipCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  currentCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
    gap: 8,
  },

  currentCardSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  currentStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
  },

  currentStatusBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  currentStatusBadgeText: {
    fontSize: 10.5,
    fontWeight: "800",
    letterSpacing: 0.3,
    textTransform: "uppercase",
  },

  currentProgramTitle: {
    fontSize: 16.5,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
    letterSpacing: -0.2,
  },

  currentProgramCategory: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },

  currentMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 7,
  },

  currentMetaChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4.5,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },

  currentMetaChipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#475569",
  },

  currentMetaChipViolet: {
    backgroundColor: "#F3E8FF",
    borderColor: "#E9D5FF",
  },

  currentMetaChipVioletText: {
    color: "#7E22CE",
    fontWeight: "700",
  },

  /* ============================================================== */
  /* 2. COMPACT SCHOLARSHIP PROGRESS CARD                           */
  /* ============================================================== */
  progressCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  progressCardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  progressCardSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  progressStatusSection: {
    marginBottom: 12,
  },

  progressStatusLabel: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  progressStatusValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  progressStatusValue: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },

  progressStatusDesc: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 17,
  },

  /* Short Progress Indicator (Compact stepper bar) */
  compactIndicatorContainer: {
    marginBottom: 14,
    paddingVertical: 4,
  },

  compactStepperRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  compactStepSegment: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
  },

  compactStepSegmentCompleted: {
    backgroundColor: "#16A34A",
  },

  compactStepSegmentCurrent: {
    backgroundColor: "#7E22CE",
  },

  compactStepLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },

  compactStepStageName: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E22CE",
  },

  compactStepCountText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },

  /* Terminal Withdrawn bar for compact indicator */
  compactTerminatedBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },

  compactTerminatedText: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#DC2626",
  },

  /* View Full Progress CTA */
  viewProgressBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "#7E22CE",
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  viewProgressBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  /* ============================================================== */
  /* 3. FULL PROGRESS MODAL / BOTTOM SHEET                          */
  /* ============================================================== */
  progressModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "flex-end",
  },

  progressModalSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    maxHeight: "85%",
    paddingBottom: 28,
  },

  progressModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  progressModalHeaderTextCol: {
    flex: 1,
    paddingRight: 10,
  },

  progressModalTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: -0.2,
  },

  progressModalSubtitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 2,
  },

  progressModalCloseBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  progressModalBody: {
    paddingHorizontal: 18,
    paddingTop: 16,
  },

  /* Vertical Timeline */
  verticalTimelineContainer: {
    paddingVertical: 4,
  },

  verticalTimelineRow: {
    flexDirection: "row",
    alignItems: "stretch",
    position: "relative",
    marginBottom: 14,
  },

  verticalTimelineLeftCol: {
    width: 32,
    alignItems: "center",
    alignSelf: "stretch",
    marginRight: 12,
    position: "relative",
  },

  verticalTimelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#CBD5E1",
    zIndex: 2,
  },

  verticalTimelineDotCompleted: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  verticalTimelineDotCurrent: {
    backgroundColor: "#FAF5FF",
    borderColor: "#7E22CE",
    borderWidth: 2,
  },

  verticalTimelineDotUpcoming: {
    backgroundColor: "#FFFFFF",
    borderColor: "#CBD5E1",
    borderWidth: 2,
  },

  verticalTimelineConnector: {
    position: "absolute",
    top: 13,
    bottom: -16,
    width: 2.5,
    alignSelf: "center",
    backgroundColor: "#E2E8F0",
    zIndex: 1,
  },

  verticalTimelineConnectorCompleted: {
    backgroundColor: "#16A34A",
  },

  verticalTimelineContentCard: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  verticalTimelineContentCardActive: {
    borderColor: "#7E22CE",
    backgroundColor: "#FAF5FF",
  },

  verticalTimelineHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 2,
    flexWrap: "wrap",
    gap: 4,
  },

  verticalTimelineTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
  },

  verticalTimelineStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  verticalTimelineStatusPillText: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 0.3,
  },

  verticalTimelineDate: {
    fontSize: 11,
    fontWeight: "600",
    color: "#16A34A",
    marginBottom: 4,
  },

  verticalTimelineDesc: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
    lineHeight: 16,
  },

  /* Withdrawal Terminal Section */
  terminalDivider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 14,
  },

  withdrawnTerminalCard: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    marginBottom: 10,
  },

  withdrawnTerminalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  withdrawnTerminalTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#DC2626",
    letterSpacing: -0.2,
  },

  withdrawnBadge: {
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#F87171",
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
  },

  withdrawnBadgeText: {
    color: "#DC2626",
    fontSize: 10,
    fontWeight: "800",
  },

  withdrawnMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 3,
  },

  withdrawnMetaLabel: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#7F1D1D",
  },

  withdrawnMetaVal: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#991B1B",
    flex: 1,
  },

  withdrawnNotice: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 17,
    marginTop: 8,
    marginBottom: 12,
  },

  withdrawnBrowseBtn: {
    backgroundColor: "#7E22CE",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },

  withdrawnBrowseBtnText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
  },

  /* ============================================================== */
  /* 4. SCHOLARSHIP HISTORY PREVIEW                                 */
  /* ============================================================== */
  historyContainer: {
    marginBottom: 20,
  },

  historyHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  historyHeaderTitle: {
    fontSize: 11.5,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },

  historyCountBadge: {
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  historyCountBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#7E22CE",
  },

  historyPreviewBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 12,
  },

  historyPreviewRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  historyPreviewRowLast: {
    borderBottomWidth: 0,
  },

  historyPreviewPeriodText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#7E22CE",
    marginBottom: 2,
  },

  historyPreviewProgramText: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },

  historyPreviewBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },

  historyPreviewStatusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },

  historyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  historyStatusText: {
    fontSize: 11.5,
    fontWeight: "700",
  },

  historyPreviewRefCode: {
    fontSize: 10.5,
    fontWeight: "600",
    color: "#94A3B8",
  },

  /* LARGE PRIMARY ACTION: VIEW FULL SCHOLARSHIP HISTORY */
  viewFullHistoryBtn: {
    backgroundColor: "#7E22CE",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#7E22CE",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },

  viewFullHistoryBtnContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  viewFullHistoryBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },

  historyEmptyBox: {
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  historyEmptyText: {
    fontSize: 13,
    color: "#94A3B8",
    fontWeight: "500",
  },

  historyDocumentsLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: "#F3E8FF",
  },

  historyDocumentsLinkText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E22CE",
  },

  /* ============================================================== */
  /* 4. OFFICIAL DOCUMENTS MODAL (PER RECORD)                       */
  /* ============================================================== */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },

  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: "100%",
    maxWidth: 390,
    maxHeight: "82%",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  modalHeader: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: -0.2,
  },

  modalSubtitle: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#475569",
    marginTop: 3,
  },

  modalRecordType: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#64748B",
    marginTop: 1,
  },

  modalBody: {
    paddingVertical: 6,
    paddingHorizontal: 16,
  },

  modalDocItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  modalDocItemLast: {
    borderBottomWidth: 0,
  },

  modalDocTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },

  modalDocMeta: {
    fontSize: 11,
    color: "#64748B",
    marginBottom: 8,
  },

  modalDocActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  modalBtnPrimary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5.5,
    paddingHorizontal: 11,
    borderRadius: 6,
    backgroundColor: "#7E22CE",
  },

  modalBtnPrimaryText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },

  modalBtnOutline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 5.5,
    paddingHorizontal: 11,
    borderRadius: 6,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  modalBtnOutlineText: {
    color: "#0F172A",
    fontSize: 11,
    fontWeight: "700",
  },

  modalFooter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end",
  },

  modalCloseBtn: {
    paddingVertical: 6.5,
    paddingHorizontal: 16,
    borderRadius: 6,
    backgroundColor: "#F1F5F9",
  },

  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#475569",
  },

  /* EMPTY SCHOLARSHIP STATE */
  emptyContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginTop: 12,
  },

  emptyIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
    textAlign: "center",
  },

  emptySubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 18,
    maxWidth: 300,
  },

  emptyButton: {
    backgroundColor: "#7E22CE",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
});
