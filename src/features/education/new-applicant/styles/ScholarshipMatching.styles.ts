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
    color: "#2563EB",
    fontSize: 14,
    fontWeight: "600",
  },

  header: {
    marginBottom: 20,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: "#64748B",
  },

  sectionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },

  levelGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  levelChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  levelChipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },

  levelChipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
  },

  levelChipTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },

  questionCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },

  questionText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },

  helperText: {
    fontSize: 12,
    color: "#64748B",
    marginBottom: 12,
    lineHeight: 16,
  },

  inputField: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#0F172A",
  },

  optionsGrid: {
    gap: 8,
  },

  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },

  optionItemActive: {
    backgroundColor: "#EFF6FF",
    borderColor: "#2563EB",
  },

  optionRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#94A3B8",
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  optionRadioActive: {
    borderColor: "#2563EB",
  },

  optionRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#2563EB",
  },

  optionLabel: {
    fontSize: 13,
    color: "#334155",
    fontWeight: "500",
    flex: 1,
  },

  optionLabelActive: {
    color: "#1E40AF",
    fontWeight: "700",
  },

  submitButton: {
    backgroundColor: "#2563EB",
    borderRadius: 22,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },

  submitButtonDisabled: {
    backgroundColor: "#94A3B8",
  },

  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  resultSummaryCard: {
    backgroundColor: "#EFF6FF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },

  summaryTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1E40AF",
    marginBottom: 8,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },

  summaryText: {
    fontSize: 13,
    color: "#1E3A8A",
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1E3A8A",
  },

  resultCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 16,
    marginBottom: 14,
  },

  resultTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 10,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },

  statusBadgeEligible: {
    backgroundColor: "#DCFCE7",
  },

  statusBadgeIncomplete: {
    backgroundColor: "#FEF3C7",
  },

  statusBadgeNotEligible: {
    backgroundColor: "#FEE2E2",
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  statusTextEligible: {
    color: "#15803D",
  },

  statusTextIncomplete: {
    color: "#B45309",
  },

  statusTextNotEligible: {
    color: "#B91C1C",
  },

  ragCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#2563EB",
  },

  ragTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 4,
  },

  ragText: {
    fontSize: 12,
    color: "#475569",
    lineHeight: 18,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 30,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 12,
  },

  emptyText: {
    textAlign: "center",
    color: "#64748B",
    marginTop: 6,
    lineHeight: 20,
  },

  errorContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  errorTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#DC2626",
    marginTop: 8,
  },

  errorText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
  },

  retryButton: {
    marginTop: 14,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#2563EB",
    borderRadius: 20,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
});
