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

  /* Hero Header Container - Image */
  headerContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "transparent",
  },

  headerContainerDark: {
    backgroundColor: "transparent",
  },

  headerImage: {
    width: "100%",
    height: "100%",
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

  /* Primary Action Cards (New Applicant / Compliance pattern) */
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

  renewalArtworkImage: {
    width: 130,
    height: 130,
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
    backgroundColor: "#15803D",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  recBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  warningBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },

  successBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  successBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#15803D",
  },

  neutralBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  neutralBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
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
    backgroundColor: "#15803D",
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
    borderColor: "#15803D",
    width: "100%",
    paddingVertical: 11,
    borderRadius: 20,
  },

  secondaryActionBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#15803D",
  },
});
