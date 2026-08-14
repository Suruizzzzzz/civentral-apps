import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back Button - copied from dashboard design */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginBottom: 16,
  },

  backIcon: {
    transform: [{ rotate: "180deg" }],
  },

  backText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EA580C",
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },

  /* Main Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  cardTopHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 18,
  },

  topIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  topHeaderText: {
    flex: 1,
  },

  topHeaderTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 2,
  },

  topHeaderSub: {
    fontSize: 12,
    color: "#64748B",
  },

  tableContainer: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    overflow: "hidden",
  },

  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
  },

  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  rowLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#64748B",
  },

  rowValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "right",
  },

  tableDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 14,
  },

  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  statusPillText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },

  /* Requirements to Bring Card */
  reqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  reqGrid: {
    flexDirection: "row",
    gap: 14,
    alignItems: "stretch",
  },

  reqLeftCol: {
    flex: 1,
  },

  reqHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  reqIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  reqTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  reqList: {
    gap: 10,
  },

  reqItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },

  reqText: {
    fontSize: 12,
    color: "#64748B",
    flex: 1,
    lineHeight: 16,
  },

  /* QR Box */
  qrBox: {
    width: 125,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  qrIconBox: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
  },

  qrRefText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#16A34A",
    marginTop: 6,
  },

  qrTapHint: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16A34A",
    marginTop: 2,
    opacity: 0.8,
  },

  /* Modal Overlay */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },

  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    gap: 10,
    marginBottom: 8,
  },

  modalShieldIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    flex: 1,
  },

  modalCloseX: {
    fontSize: 18,
    color: "#64748B",
    fontWeight: "700",
  },

  modalSub: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "left",
    marginBottom: 16,
    lineHeight: 17,
  },

  modalQrContainer: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },

  modalRefCode: {
    fontSize: 14,
    fontWeight: "800",
    color: "#16A34A",
    marginTop: 10,
    letterSpacing: 0.5,
  },

  modalDetailBox: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    gap: 4,
  },

  modalDetailLabel: {
    fontSize: 12,
    color: "#64748B",
  },

  modalCloseBtn: {
    width: "100%",
    backgroundColor: "#16A34A",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },

  modalCloseBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  /* Action Buttons */
  actionBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  actionContent: {
    flex: 1,
  },

  actionTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },

  actionSub: {
    fontSize: 12,
    color: "#64748B",
  },
});
