import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back Button - Green theme accent for Renewal */
  backBtn: {
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
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  backIcon: {},

  backText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#15803D",
  },

  /* Hero Header Banner - Green theme */
  headerBanner: {
    backgroundColor: "#15803D",
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#15803D",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },

  headerBadge: {
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

  headerBadgeText: {
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
    marginBottom: 4,
  },

  sub: {
    fontSize: 13,
    color: "#DCFCE7",
    lineHeight: 18,
  },

  /* Loading & Error States */
  centerContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EF4444",
    marginTop: 12,
    marginBottom: 6,
  },

  errorText: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },

  retryBtn: {
    backgroundColor: "#15803D",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },

  retryBtnText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },

  /* Card Layouts */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 16,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  badgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  programTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
  },

  programCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 14,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#F1F5F9",
  },

  infoLabel: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },

  infoValue: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "700",
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 12,
    marginTop: 8,
  },

  docItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },

  docBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },

  docBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D",
  },

  docTextCol: {
    flex: 1,
  },

  docName: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 2,
  },

  docDesc: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },

  banner: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },

  bannerTitle: {
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 4,
  },

  bannerText: {
    fontSize: 12,
    lineHeight: 18,
  },
});
