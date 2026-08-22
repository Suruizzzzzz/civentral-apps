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

  programCount: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },

  programCountText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  list: {
    gap: 14,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    padding: 16,
  },

  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },

  titleArea: {
    flex: 1,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginBottom: 9,
  },

  categoryText: {
    color: "#2563EB",
    fontSize: 11,
    fontWeight: "700",
  },

  programTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 24,
  },

  description: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 10,
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },

  statusText: {
    fontSize: 11,
    fontWeight: "800",
  },

  divider: {
    height: 1,
    backgroundColor: "#E2E8F0",
    marginVertical: 15,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  infoItem: {
    width: "48%",
  },

  infoLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 3,
  },

  infoValue: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  actionButton: {
    marginTop: 16,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },

  applyButton: {
    backgroundColor: "#2563EB",
  },

  upcomingButton: {
    backgroundColor: "#E2E8F0",
  },

  actionText: {
    fontSize: 14,
    fontWeight: "800",
  },

  emptyContainer: {
    flex: 1,
    minHeight: 350,
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
    flex: 1,
    minHeight: 350,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 12,
  },

  errorText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 20,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    backgroundColor: "#2563EB",
    borderRadius: 22,
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});
