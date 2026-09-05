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
    marginBottom: 12,
  },

  inputGroup: {
    marginBottom: 14,
  },

  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 6,
  },

  textInput: {
    backgroundColor: "#F8FAFC",
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
});
