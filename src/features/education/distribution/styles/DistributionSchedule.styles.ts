import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back Button - matching the user-approved frameless style */
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 10,
    marginBottom: 16,
  },

  backIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFEDD5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FED7AA",
  },

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#EA580C",
  },

  /* Hero Banner / Header */
  header: {
    marginBottom: 20,
  },

  heroBanner: {
    backgroundColor: "#EA580C",
    borderRadius: 24,
    padding: 20,
    marginBottom: 4,
    shadowColor: "#EA580C",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },

  heroBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.3,
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: "#FFEDD5",
    lineHeight: 18,
  },

  /* Main Card */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  /* Financial Summary Card */
  financialCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  financialCol: {
    flex: 1,
    alignItems: "center",
  },

  financialDivider: {
    width: 1,
    height: 28,
    backgroundColor: "#CBD5E1",
  },

  financialLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  financialVal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
    marginTop: 2,
  },

  /* Component Container */
  componentBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 8,
  },

  componentTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  componentBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  componentMethod: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  componentAmount: {
    fontSize: 16,
    fontWeight: "800",
    color: "#176B87",
  },

  /* Requirements to Bring Card */
  reqCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 18,
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  reqHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 14,
  },

  reqIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },

  reqTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  reqList: {
    gap: 10,
  },

  reqItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F8FAFC",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },

  reqText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#334155",
    flex: 1,
  },

  /* Empty State Icons */
  topIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },

  topHeaderTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  topHeaderSub: {
    fontSize: 12,
    color: "#64748B",
  },
});
