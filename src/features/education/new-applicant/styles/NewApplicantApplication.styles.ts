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
    gap: 4,
  },

  backIcon: {
    transform: [{ rotate: "180deg" }],
  },

  backText: {
    color: "#EA580C",
    fontSize: 14,
    fontWeight: "600",
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
    borderColor: "#EA580C",
    backgroundColor: "#FFF7ED",
    gap: 8,
  },

  uploadBoxSuccess: {
    borderColor: "#16A34A",
    backgroundColor: "#F0FDF4",
  },

  uploadText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EA580C",
  },

  fileNameText: {
    fontSize: 12,
    color: "#15803D",
    fontWeight: "600",
  },

  submitButton: {
    backgroundColor: "#EA580C",
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
});
