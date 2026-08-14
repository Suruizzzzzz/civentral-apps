import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back Button */
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
    color: "#2563EB",
  },

  /* Hero Header Card */
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 22,
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  headerContent: {
    flex: 1,
    paddingRight: 10,
  },

  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 8,
    lineHeight: 32,
    letterSpacing: -0.5,
  },

  headerSub: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 19,
  },

  robotArtwork: {
    width: 125,
    height: 125,
  },

  /* Section Cards */
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    padding: 20,
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

  cardMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },

  artworkImage: {
    width: 105,
    height: 105,
  },

  cardContent: {
    flex: 1,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },

  recBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#2563EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  recBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },

  cardSub: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 18,
  },

  cardBottomRow: {
    flexDirection: "column",
    alignItems: "stretch",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },

  pillGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 12,
  },

  infoPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },

  infoPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  primaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563EB",
    width: "100%",
    paddingVertical: 12,
    borderRadius: 20,
  },

  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  secondaryActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: "#0284C7",
    width: "100%",
    paddingVertical: 11,
    borderRadius: 20,
  },

  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0284C7",
  },
});
