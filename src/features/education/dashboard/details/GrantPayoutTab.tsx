import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { formatDate, formatCurrency } from "@/src/utils";
import { CitizenGrantOverviewData } from "../../grant/api/grantApi";
import {
  CitizenGrantReleaseComponent,
  CitizenGrantReleaseItem,
} from "../../grant/api/grantReleaseApi";
import { styles } from "../styles/CitizenScholarshipDetail.styles";

interface GrantTimelineStep {
  title: string;
  statusLabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isWarning?: boolean;
}

function getGrantTimelineItems(grantStatus?: string): GrantTimelineStep[] {
  const steps = [
    { key: "Started", title: "Application Started" },
    { key: "Submitted", title: "Application Submitted" },
    { key: "For Review", title: "For Review" },
    { key: "Under Review", title: "Under Review" },
    { key: "Approved for Payroll", title: "Approved for Payroll" },
  ];

  if (
    grantStatus === "Completed" ||
    grantStatus === "Released" ||
    grantStatus === "Disbursed" ||
    grantStatus === "Paid"
  ) {
    return steps.map((s) => ({
      title: s.title,
      statusLabel: "Completed",
      isCompleted: true,
      isCurrent: false,
    }));
  }

  if (grantStatus === "For Compliance") {
    return [
      {
        title: "Application Started",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Application Submitted",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Review Started",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "For Compliance",
        statusLabel: "Action Required",
        isCompleted: false,
        isCurrent: false,
        isWarning: true,
      },
    ];
  }

  if (grantStatus === "Withdrawn") {
    return steps.map((s) => ({
      title: s.title,
      statusLabel: "Inactive",
      isCompleted: false,
      isCurrent: false,
    }));
  }

  let activeIndex = 0;
  if (grantStatus === "Submitted") activeIndex = 1;
  else if (grantStatus === "For Review") activeIndex = 2;
  else if (grantStatus === "Under Review") activeIndex = 3;
  else if (grantStatus === "Approved for Payroll") activeIndex = 4;

  return steps.map((s, idx) => {
    const isCompleted =
      idx < activeIndex ||
      (grantStatus === "Approved for Payroll" && idx <= activeIndex);
    const isCurrent =
      idx === activeIndex && grantStatus !== "Approved for Payroll";
    let statusLabel = "Pending";
    if (isCompleted) statusLabel = "Completed";
    else if (isCurrent) statusLabel = "In Progress";

    return {
      title: s.title,
      statusLabel,
      isCompleted,
      isCurrent,
    };
  });
}

function getGrantBadgeConfig(status?: string): {
  label: string;
  variant: "info" | "success" | "warning" | "danger" | "neutral";
} {
  if (!status) return { label: "Pending / Not Started", variant: "neutral" };
  switch (status) {
    case "Draft":
      return { label: "Draft", variant: "warning" };
    case "Submitted":
      return { label: "Submitted", variant: "success" };
    case "For Review":
      return { label: "For Review", variant: "info" };
    case "Under Review":
      return { label: "Under Review", variant: "info" };
    case "For Compliance":
      return { label: "For Compliance", variant: "warning" };
    case "Approved for Payroll":
      return { label: "Approved for Payroll", variant: "success" };
    case "Withdrawn":
      return { label: "Withdrawn", variant: "danger" };
    case "Completed":
    case "Released":
    case "Disbursed":
    case "Paid":
    case "Approved":
      return { label: status, variant: "success" };
    default:
      return { label: status, variant: "neutral" };
  }
}

export interface GrantPayoutTabProps {
  grantOverview: CitizenGrantOverviewData | null;
  grantOverviewLoading?: boolean;
  grantOverviewError?: string | null;
  matchedRelease?: CitizenGrantReleaseItem;
  releaseComponents: CitizenGrantReleaseComponent[];
  effectiveGrantStatus: string;
  releaseAuthorized: number;
  releaseReleased: number;
  releaseRemaining: number;
  isExplicitRelease: boolean;
  targetCleanCode?: string;
  recordReference?: string;
  recordPeriod?: string;
  grantReqText?: string;
  scholarshipProgramName?: string;
  isDarkMode: boolean;
  onOpenVoucher: () => void;
  onOpenApplication?: () => void;
  onRetryGrantOverview?: () => void;
  viewMode?: "overview" | "status" | "full";
}

export function GrantPayoutTab({
  grantOverview,
  grantOverviewLoading = false,
  grantOverviewError = null,
  matchedRelease,
  releaseComponents,
  effectiveGrantStatus,
  releaseAuthorized,
  releaseReleased,
  releaseRemaining,
  isExplicitRelease,
  recordReference = "—",
  recordPeriod = "—",
  grantReqText = "—",
  scholarshipProgramName = "Academic Scholarship",
  isDarkMode,
  onOpenVoucher,
  onOpenApplication,
  onRetryGrantOverview,
  viewMode = "full",
}: GrantPayoutTabProps) {
  const grantApp = grantOverview?.application;
  const isGrantTerminal =
    isExplicitRelease ||
    effectiveGrantStatus === "Completed" ||
    effectiveGrantStatus === "Released" ||
    effectiveGrantStatus === "Disbursed" ||
    effectiveGrantStatus === "Paid" ||
    grantApp?.grant_status === "Completed" ||
    grantApp?.grant_status === "Released" ||
    grantApp?.grant_status === "Disbursed" ||
    grantApp?.grant_status === "Paid";

  const showOverview = viewMode === "overview" || viewMode === "full";
  const showStatus = viewMode === "status" || viewMode === "full";

  const grantBadge = getGrantBadgeConfig(effectiveGrantStatus);
  const grantTimelineSteps = getGrantTimelineItems(grantApp?.grant_status);

  return (
    <View style={{ gap: 16 }}>
      {/* 1. GRANT OVERVIEW CARD */}
      {showOverview && (
        <View
          style={[
            styles.sectionCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && { color: "#F8FAFC" },
                { marginBottom: 0 },
              ]}
            >
              GRANT DETAILS
            </Text>
            <Badge label={grantBadge.label} variant={grantBadge.variant} />
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Program Name
              </Text>
              <Text
                style={[styles.infoValue, isDarkMode && { color: "#F8FAFC" }]}
              >
                {scholarshipProgramName}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Grant Reference
              </Text>
              <Text style={[styles.infoValue, { color: "#0284C7" }]}>
                {recordReference}
              </Text>
            </View>

            <View style={styles.infoRowStacked}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Partner Institution
              </Text>
              <Text
                style={[
                  styles.infoValueStacked,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {matchedRelease?.components?.find((c) => c.institutional_payment?.partner_school_name)
                  ?.institutional_payment?.partner_school_name ||
                  grantApp?.institution_name ||
                  "City Partner Educational Institution"}{" "}
                ({grantApp?.institution_type || "Accredited"} Institution)
              </Text>
            </View>

            <View style={styles.infoRowStacked}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Academic Period
              </Text>
              <Text
                style={[
                  styles.infoValueStacked,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {recordPeriod}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Grant Status
              </Text>
              <Text style={[styles.infoValue, { color: "#16A34A" }]}>
                {effectiveGrantStatus}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Requirements
              </Text>
              <Text
                style={[styles.infoValue, isDarkMode && { color: "#F8FAFC" }]}
              >
                {isExplicitRelease
                  ? "Grant Payroll & Disbursement Schedule"
                  : grantReqText}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                {isExplicitRelease ? "Disbursed Date" : "Submitted Date"}
              </Text>
              <Text
                style={[styles.infoValue, isDarkMode && { color: "#F8FAFC" }]}
              >
                {isExplicitRelease
                  ? formatDate(
                      matchedRelease?.components?.[0]?.released_at || grantApp?.submitted_at,
                      "—"
                    )
                  : formatDate(grantApp?.submitted_at, "—")}
              </Text>
            </View>
          </View>

          {/* VIEW FULL GRANT APPLICATION (NON-TERMINAL ONLY) */}
          {!isGrantTerminal && onOpenApplication && (
            <TouchableOpacity
              style={[
                styles.primaryActionBtn,
                { backgroundColor: "#EA580C", shadowColor: "#EA580C" },
              ]}
              onPress={onOpenApplication}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View Full Grant Application"
            >
              <Text style={styles.primaryActionBtnText}>
                VIEW FULL GRANT APPLICATION
              </Text>
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 2. GRANT RELEASE BREAKDOWN CARD */}
      {showOverview && isGrantTerminal && (
        <View
          style={[
            styles.sectionCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && { color: "#F8FAFC" },
                { marginBottom: 0 },
              ]}
            >
              GRANT RELEASE
            </Text>
            <Badge
              label={effectiveGrantStatus || "Completed"}
              variant="success"
            />
          </View>

          {/* Financial Totals Row */}
          <View
            style={{
              backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: isDarkMode ? "#334155" : "#E2E8F0",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  textTransform: "uppercase",
                }}
              >
                Authorized
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: isDarkMode ? "#F8FAFC" : "#0F172A",
                  marginTop: 4,
                }}
              >
                {formatCurrency(releaseAuthorized)}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: 30,
                backgroundColor: isDarkMode ? "#334155" : "#E2E8F0",
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  textTransform: "uppercase",
                }}
              >
                Released
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: "#16A34A",
                  marginTop: 4,
                }}
              >
                {formatCurrency(releaseReleased)}
              </Text>
            </View>
            <View
              style={{
                width: 1,
                height: 30,
                backgroundColor: isDarkMode ? "#334155" : "#E2E8F0",
              }}
            />
            <View style={{ flex: 1, alignItems: "center" }}>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  textTransform: "uppercase",
                }}
              >
                Remaining
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "800",
                  color: isDarkMode ? "#FB923C" : "#EA580C",
                  marginTop: 4,
                }}
              >
                {formatCurrency(releaseRemaining)}
              </Text>
            </View>
          </View>

          {/* Release Code Header */}
          {matchedRelease && (
            <View style={{ marginBottom: 12 }}>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: isDarkMode ? "#F8FAFC" : "#0F172A",
                }}
              >
                AY {matchedRelease.academic_year} • {matchedRelease.academic_term}
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  marginTop: 2,
                }}
              >
                Release Code:{" "}
                {matchedRelease.release_code ||
                  (matchedRelease.grant_release_id
                    ? `REL-${matchedRelease.grant_release_id}`
                    : "—")}
                {matchedRelease.grant_release_id
                  ? ` (ID: #${matchedRelease.grant_release_id})`
                  : ""}
              </Text>
            </View>
          )}

          {/* Components Breakdown */}
          {releaseComponents.length > 0 ? (
            <View style={{ gap: 10 }}>
              {releaseComponents.map((comp) => {
                const isF2F = comp.release_method === "Face-to-Face";
                const f2f = comp.f2f_schedule;
                const inst = comp.institutional_payment;

                return (
                  <View
                    key={comp.component_id}
                    style={{
                      padding: 12,
                      backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: isDarkMode ? "#334155" : "#E2E8F0",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Badge
                          label={comp.component_type}
                          variant={
                            comp.component_type === "Stipend"
                              ? "success"
                              : "info"
                          }
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: isDarkMode ? "#CBD5E1" : "#64748B",
                          }}
                        >
                          {comp.release_method}
                        </Text>
                      </View>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "800",
                          color: isDarkMode ? "#FB923C" : "#EA580C",
                        }}
                      >
                        {formatCurrency(comp.amount)}
                      </Text>
                    </View>

                    {/* F2F Schedule info */}
                    {isF2F && f2f && (
                      <View
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: isDarkMode ? "#334155" : "#E2E8F0",
                          gap: 3,
                        }}
                      >
                        {f2f.venue_name ? (
                          <Text
                            style={{
                              fontSize: 11.5,
                              color: isDarkMode ? "#CBD5E1" : "#334155",
                            }}
                          >
                            <Text style={{ fontWeight: "700" }}>Venue: </Text>
                            {f2f.venue_name}
                          </Text>
                        ) : null}
                        {f2f.release_date ? (
                          <Text
                            style={{
                              fontSize: 11.5,
                              color: isDarkMode ? "#CBD5E1" : "#334155",
                            }}
                          >
                            <Text style={{ fontWeight: "700" }}>Schedule: </Text>
                            {f2f.release_date}{" "}
                            {f2f.start_time
                              ? `(${f2f.start_time} - ${f2f.end_time || ""})`
                              : ""}
                          </Text>
                        ) : null}
                        {f2f.claim_reference ? (
                          <Text
                            style={{
                              fontSize: 12,
                              color: "#EA580C",
                              fontWeight: "700",
                              marginTop: 2,
                            }}
                          >
                            Claim Ref: {f2f.claim_reference}
                          </Text>
                        ) : null}
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDarkMode ? "#94A3B8" : "#64748B",
                            }}
                          >
                            Claim Status
                          </Text>
                          <Badge
                            label={f2f.claim_status || "Released"}
                            variant={
                              f2f.claim_status === "Ready for Claim"
                                ? "info"
                                : "success"
                            }
                          />
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.primaryActionBtn,
                            {
                              backgroundColor: "#0284C7",
                              shadowColor: "#0284C7",
                              marginTop: 10,
                              paddingVertical: 10,
                            },
                          ]}
                          onPress={onOpenVoucher}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.primaryActionBtnText,
                              { fontSize: 13 },
                            ]}
                          >
                            VIEW CLAIM VOUCHER
                          </Text>
                          <IconSymbol
                            name="chevron.right"
                            size={14}
                            color="#FFFFFF"
                          />
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Institutional info */}
                    {!isF2F && inst && (
                      <View
                        style={{
                          marginTop: 8,
                          paddingTop: 8,
                          borderTopWidth: 1,
                          borderTopColor: isDarkMode ? "#334155" : "#E2E8F0",
                          gap: 3,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 11.5,
                            color: isDarkMode ? "#CBD5E1" : "#334155",
                          }}
                        >
                          <Text style={{ fontWeight: "700" }}>Partner School: </Text>
                          {inst.partner_school_name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: 4,
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDarkMode ? "#94A3B8" : "#64748B",
                            }}
                          >
                            Payment Status
                          </Text>
                          <Badge
                            label={inst.institutional_status || "Released"}
                            variant="success"
                          />
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>
      )}

      {/* 3. GRANT APPLICATION LIFECYCLE TIMELINE (STATUS MODE) */}
      {showStatus && (
        <View
          style={[
            styles.sectionCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Text
              style={[
                styles.sectionTitle,
                isDarkMode && { color: "#F8FAFC" },
                { marginBottom: 0 },
              ]}
            >
              Current Scholarship Grant
            </Text>
            {grantBadge.label ? (
              <Badge label={grantBadge.label} variant={grantBadge.variant} />
            ) : null}
          </View>

          {grantOverviewLoading ? (
            <View style={{ paddingVertical: 8, gap: 8 }}>
              <Skeleton height={20} borderRadius={6} width="65%" />
              <Skeleton height={14} borderRadius={4} width="85%" />
              <Skeleton height={80} borderRadius={12} width="100%" />
            </View>
          ) : grantOverviewError ? (
            <View style={{ paddingVertical: 6 }}>
              <Text
                style={{
                  color: "#EF4444",
                  fontSize: 13,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Unable to load current grant status.
              </Text>
              {onRetryGrantOverview && (
                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? "#0F172A" : "#F1F5F9",
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#334155" : "#CBD5E1",
                  }}
                  onPress={onRetryGrantOverview}
                >
                  <Text
                    style={{
                      color: isDarkMode ? "#F8FAFC" : "#334155",
                      fontSize: 12,
                      fontWeight: "700",
                    }}
                  >
                    Retry
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : !grantApp ? (
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: isDarkMode ? "#F8FAFC" : "#0F172A",
                }}
              >
                No Grant Application Yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  lineHeight: 18,
                }}
              >
                You have not submitted a scholarship grant application for the
                current academic period.
              </Text>
              {onOpenApplication && (
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    {
                      backgroundColor: "#EA580C",
                      shadowColor: "#EA580C",
                      marginTop: 12,
                    },
                  ]}
                  onPress={onOpenApplication}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionBtnText}>
                    APPLY FOR SCHOLARSHIP GRANT
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Grant Timeline */}
              <View style={{ marginTop: 12 }}>
                {grantTimelineSteps.map((step, idx) => {
                  const isLast = idx === grantTimelineSteps.length - 1;
                  return (
                    <View key={step.title} style={styles.timelineItemRow}>
                      <View style={styles.timelineLeftColumn}>
                        <View
                          style={[
                            styles.timelineIconCircle,
                            step.isCompleted && {
                              backgroundColor: "#16A34A",
                              borderColor: "#16A34A",
                            },
                            step.isCurrent && {
                              backgroundColor: isDarkMode
                                ? "#2E1065"
                                : "#FAF5FF",
                              borderColor: isDarkMode
                                ? "#C084FC"
                                : "#7E22CE",
                              borderWidth: 2,
                            },
                            step.isWarning && {
                              backgroundColor: "#FEF2F2",
                              borderColor: "#DC2626",
                              borderWidth: 2,
                            },
                          ]}
                        >
                          {step.isCompleted ? (
                            <IconSymbol
                              name="checkmark"
                              size={12}
                              color="#FFFFFF"
                            />
                          ) : step.isWarning ? (
                            <IconSymbol
                              name="exclamationmark"
                              size={12}
                              color="#DC2626"
                            />
                          ) : step.isCurrent ? (
                            <View
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 4,
                                backgroundColor: "#7E22CE",
                              }}
                            />
                          ) : (
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "700",
                                color: isDarkMode ? "#64748B" : "#94A3B8",
                              }}
                            >
                              {idx + 1}
                            </Text>
                          )}
                        </View>
                        {!isLast && (
                          <View
                            style={[
                              styles.timelineConnectorLine,
                              step.isCompleted && {
                                backgroundColor: "#16A34A",
                              },
                            ]}
                          />
                        )}
                      </View>

                      <View
                        style={[
                          styles.timelineContentCard,
                          step.isCurrent && {
                            backgroundColor: isDarkMode
                              ? "#1E1B4B"
                              : "#F5F3FF",
                            borderColor: isDarkMode
                              ? "#4338CA"
                              : "#DDD6FE",
                            borderWidth: 1,
                          },
                        ]}
                      >
                        <View style={styles.timelineContentHeader}>
                          <Text
                            style={[
                              styles.timelineTitle,
                              isDarkMode && { color: "#F8FAFC" },
                            ]}
                          >
                            {step.title}
                          </Text>
                          <Badge
                            label={step.statusLabel}
                            variant={
                              step.isCompleted
                                ? "success"
                                : step.isCurrent
                                  ? "info"
                                  : step.isWarning
                                    ? "warning"
                                    : "neutral"
                            }
                          />
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>

              {/* QR Voucher Shortcut Card */}
              <View
                style={{
                  marginTop: 16,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#334155" : "#E2E8F0",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <Ionicons name="qr-code-outline" size={18} color="#EA580C" />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: isDarkMode ? "#F8FAFC" : "#0F172A",
                    }}
                  >
                    Disbursement Claim Voucher
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDarkMode ? "#CBD5E1" : "#475569",
                    lineHeight: 17,
                    marginBottom: 10,
                  }}
                >
                  Official digital intake pass for in-person grant disbursements.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    {
                      backgroundColor: "#EA580C",
                      shadowColor: "#EA580C",
                      paddingVertical: 10,
                    },
                  ]}
                  onPress={onOpenVoucher}
                  activeOpacity={0.8}
                >
                  <Ionicons name="qr-code" size={14} color="#FFFFFF" />
                  <Text style={[styles.primaryActionBtnText, { fontSize: 13 }]}>
                    Open QR Claim Voucher
                  </Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}
    </View>
  );
}
