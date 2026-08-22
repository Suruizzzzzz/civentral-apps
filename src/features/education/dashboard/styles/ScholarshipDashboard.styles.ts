import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 160,
  },

  /* Back button */
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
    color: "#7E22CE",
  },

  /* Page heading */
  header: {
    alignItems: "center",
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 8,
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
    lineHeight: 19,
    marginTop: 4,
  },

  /* View Switcher Pill */
  viewToggle: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: 20,
    padding: 3,
    alignSelf: "flex-start",
    marginTop: 10,
  },

  viewToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
  },

  viewToggleActiveBtn: {
    backgroundColor: "#7E22CE",
  },

  viewToggleText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748B",
  },

  viewToggleActiveText: {
    color: "#FFFFFF",
  },

  /* Section label */
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.8,
    marginBottom: 12,
  },

  /* Hero Scholarship Card - Ultra Minimalist */
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
    marginBottom: 20,

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },

  heroTopSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 18,
  },

  heroLeftContent: {
    flex: 1,
    paddingRight: 12,
  },

  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },

  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  activeBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },

  activeBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#15803D",
    letterSpacing: 0.4,
  },

  heroTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 4,
    letterSpacing: -0.3,
  },

  heroSubtitle: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
  },

  /* Minimalist Artwork Container */
  heroArtworkBox: {
    width: 110,
    height: 100,
    borderRadius: 16,
    backgroundColor: "#F5E6FF",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  heroArtwork: {
    width: "100%",
    height: "100%",
  },

  heroDivider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 18,
  },

  /* Clean 3-Column Stats Row */
  heroBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  heroCol: {
    flex: 1,
    alignItems: "flex-start",
  },

  heroColScholarId: {
    flex: 1.3,
    alignItems: "flex-start",
  },

  heroColDivider: {
    width: 1,
    height: 24,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 8,
  },

  heroColLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#94A3B8",
    marginBottom: 2,
  },

  heroColValue: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },

  scholarIdText: {
    color: "#7E22CE",
    fontWeight: "800",
    fontSize: 12,
  },

  /* Grid Layout for Cards */
  cardsGrid: {
    gap: 16,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },

  /* Process Status Timeline */
  timelineContainer: {
    marginTop: 6,
    marginBottom: 14,
  },

  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  timelineLeft: {
    alignItems: "center",
    width: 28,
  },

  timelineIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },

  timelineLine: {
    width: 2,
    height: 26,
    backgroundColor: "#E2E8F0",
    marginVertical: 2,
  },

  timelineLineCompleted: {
    backgroundColor: "#16A34A",
  },

  timelineContent: {
    flex: 1,
    paddingLeft: 8,
    paddingBottom: 12,
  },

  timelineTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },

  timelineSub: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  timelineSubActive: {
    color: "#D97706",
    fontWeight: "700",
  },

  timelineSubPending: {
    color: "#94A3B8",
  },

  statusBanner: {
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: "center",
  },

  statusBannerText: {
    fontSize: 12,
    color: "#92400E",
    fontWeight: "600",
  },

  statusBannerHighlight: {
    color: "#D97706",
    fontWeight: "800",
  },

  /* Academic Standing */
  gwaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
    marginBottom: 12,
  },

  gwaBox: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    padding: 12,
  },

  gwaLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
    marginBottom: 4,
  },

  gwaValueGreen: {
    fontSize: 24,
    fontWeight: "800",
    color: "#16A34A",
  },

  gwaValueDark: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  standingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    borderRadius: 12,
    paddingVertical: 9,
    paddingHorizontal: 12,
    gap: 8,
  },

  standingBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#15803D",
  },

  /* Current Grant */
  grantHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },

  grantIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  grantAmountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  grantAmountText: {
    fontSize: 24,
    fontWeight: "800",
    color: "#0F172A",
  },

  processingPill: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },

  processingPillText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#D97706",
    letterSpacing: 0.4,
  },

  grantReleaseText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },

  grantReleaseValue: {
    fontWeight: "700",
    color: "#0F172A",
  },

  /* Latest Updates */
  updateRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginTop: 4,
  },

  updateIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },

  updateContent: {
    flex: 1,
  },

  updateTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 4,
  },

  updateBody: {
    fontSize: 12,
    color: "#64748B",
    lineHeight: 17,
    marginBottom: 8,
  },

  updateFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  updateDateText: {
    fontSize: 11,
    color: "#94A3B8",
    fontWeight: "500",
  },

  /* EMPTY STATE STYLES */
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  emptyBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  emptyBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748B",
    letterSpacing: 0.5,
  },

  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 8,
  },

  emptySub: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    maxWidth: 320,
  },

  emptyActions: {
    width: "100%",
    gap: 10,
  },

  emptyPrimaryBtn: {
    backgroundColor: "#7E22CE",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },

  emptyPrimaryBtnText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },

  emptySecondaryBtn: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  emptySecondaryBtnText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "700",
  },
});
