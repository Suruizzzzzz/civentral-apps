import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
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
  /* 1. SCHOLARSHIP DASHBOARD HEADER CARD                           */
  /* ============================================================== */
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 18,
    paddingHorizontal: 18,
    marginBottom: 18,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    position: "relative",
    overflow: "hidden",
  },

  headerCardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerCardTextCol: {
    flex: 1,
    paddingRight: 12,
  },

  headerCardTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#7E22CE",
    letterSpacing: -0.4,
    marginBottom: 4,
    textTransform: "uppercase",
  },

  headerCardPurpose: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
    fontWeight: "500",
  },

  /* Dedicated soft-violet visual box for toga */
  togaArtworkBox: {
    width: 76,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F5E8FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  togaArtworkBoxDark: {
    backgroundColor: "rgba(126, 34, 206, 0.2)",
    borderColor: "rgba(192, 132, 252, 0.3)",
  },

  togaImage: {
    width: "100%",
    height: "100%",
  },

  /* ============================================================== */
  /* 2. FIVE-STAGE STATUS PROGRESS TRACKER                          */
  /* ============================================================== */
  trackerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  trackerHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
    flexWrap: "wrap",
    gap: 6,
  },

  trackerSectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  trackerCurrentBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E9D5FF",
  },

  trackerCurrentBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#7E22CE",
  },

  stepsLineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
  },

  stepsConnectorBackground: {
    position: "absolute",
    top: 9,
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: "#E2E8F0",
    zIndex: 0,
  },

  stepColumn: {
    flex: 1,
    alignItems: "center",
    zIndex: 1,
    paddingHorizontal: 1,
  },

  stepDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#CBD5E1",
    marginBottom: 5,
  },

  stepDotCompleted: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },

  stepDotCurrent: {
    backgroundColor: "#7E22CE",
    borderColor: "#7E22CE",
  },

  stepDotUpcoming: {
    backgroundColor: "#F8FAFC",
    borderColor: "#CBD5E1",
  },

  stepLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textAlign: "center",
  },

  stepLabelActive: {
    color: "#7E22CE",
    fontWeight: "800",
  },

  stepLabelCompleted: {
    color: "#16A34A",
    fontWeight: "700",
  },

  stepSubLabel: {
    fontSize: 8.5,
    fontWeight: "700",
    color: "#7E22CE",
    textAlign: "center",
    marginTop: 1,
  },

  stepSubLabelCompleted: {
    color: "#16A34A",
  },

  stepDate: {
    fontSize: 8,
    fontWeight: "500",
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 1,
  },

  /* ============================================================== */
  /* 3. SCHOLARSHIP HISTORY                                         */
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

  historyDirectoryBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },

  historyRow: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },

  historyRowLast: {
    borderBottomWidth: 0,
  },

  historyCurrentBadgeRow: {
    marginBottom: 4,
  },

  historyCurrentPill: {
    alignSelf: "flex-start",
    backgroundColor: "#F3E8FF",
    borderWidth: 1,
    borderColor: "#E9D5FF",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  historyCurrentPillText: {
    fontSize: 9.5,
    fontWeight: "800",
    color: "#7E22CE",
    letterSpacing: 0.4,
  },

  historyPeriodText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },

  historyProgramSubText: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 6,
  },

  historyRowMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  historyTypeTag: {
    fontSize: 10.5,
    fontWeight: "700",
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },

  historyRefCode: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
  },

  historyRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  historyStatusGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  historyStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },

  historyStatusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  historyDateText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#94A3B8",
  },

  historyActionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
