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

  categoryBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  categoryText: {
    color: "#2563EB",
    fontSize: 12,
    fontWeight: "700",
  },

  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
  },

  programTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    lineHeight: 28,
  },

  programCode: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 12,
  },

  description: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 22,
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

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  gridItem: {
    width: "47%",
  },

  gridLabel: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "600",
    marginBottom: 3,
  },

  gridValue: {
    fontSize: 13,
    color: "#1E293B",
    fontWeight: "700",
  },

  listItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },

  listBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#2563EB",
    marginTop: 7,
  },

  listContent: {
    flex: 1,
  },

  listTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0F172A",
  },

  listSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
    lineHeight: 16,
  },

  applyContainer: {
    marginTop: 10,
    padding: 16,
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },

  disabledApplyBtn: {
    width: "100%",
    height: 48,
    borderRadius: 24,
    backgroundColor: "#CBD5E1",
    justifyContent: "center",
    alignItems: "center",
  },

  disabledApplyText: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },

  applyNotice: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 8,
    textAlign: "center",
  },
});
