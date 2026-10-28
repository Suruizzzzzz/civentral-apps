import React from "react";
import {
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { formatDate } from "@/utils/dateUtils";
import { CitizenRenewalOverviewData } from "../../renewal/api/renewalApi";
import { styles } from "../styles/CitizenScholarshipDetail.styles";

interface StatusTimelineStep {
  title: string;
  statusLabel: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isWarning?: boolean;
}

function getRenewalBadgeConfig(status?: string): {
  label: string;
  variant: "info" | "success" | "warning" | "danger" | "neutral";
} {
  if (!status) return { label: "Pending / Not Started", variant: "neutral" };
  switch (status) {
    case "For Review":
    case "Under Review":
    case "For Evaluation":
      return { label: status.toUpperCase(), variant: "info" };
    case "For Compliance":
    case "Returned":
      return { label: status.toUpperCase(), variant: "warning" };
    case "Recommended for Continuation":
      return { label: "RECOMMENDED", variant: "success" };
    case "Recommended for Non-Continuation":
      return { label: "NON-CONTINUATION", variant: "warning" };
    case "For Certificate":
      return { label: "FOR CERTIFICATE", variant: "info" };
    case "Completed":
      return { label: "COMPLETED", variant: "success" };
    case "Withdrawn":
      return { label: "WITHDRAWN", variant: "danger" };
    default:
      return { label: status.toUpperCase(), variant: "neutral" };
  }
}

function getRenewalTimelineItems(renewalStatus?: string): StatusTimelineStep[] {
  if (renewalStatus === "Completed") {
    return [
      {
        title: "Renewal Submitted",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Requirements Reviewed",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "SSC Evaluation",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Recommended for Continuation",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Certificate Processing",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Renewal Completed",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
    ];
  }

  if (renewalStatus === "For Compliance" || renewalStatus === "Returned") {
    return [
      {
        title: "Renewal Submitted",
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
        title:
          renewalStatus === "Returned" ? "Renewal Returned" : "For Compliance",
        statusLabel: "Action Required",
        isCompleted: false,
        isCurrent: false,
        isWarning: true,
      },
    ];
  }

  if (
    renewalStatus === "Recommended for Continuation" ||
    renewalStatus === "For Certificate"
  ) {
    return [
      {
        title: "Renewal Submitted",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Review & Evaluation",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Recommended for Continuation",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Certificate Processing",
        statusLabel:
          renewalStatus === "For Certificate" ? "In Progress" : "Pending",
        isCompleted: false,
        isCurrent: renewalStatus === "For Certificate",
      },
      {
        title: "Completed",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
    ];
  }

  if (renewalStatus === "For Evaluation") {
    return [
      {
        title: "Renewal Submitted",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Requirements Reviewed",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Evaluation",
        statusLabel: "In Progress",
        isCompleted: false,
        isCurrent: true,
      },
      {
        title: "Recommendation",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
      {
        title: "Certificate",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
      {
        title: "Completed",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
    ];
  }

  if (renewalStatus === "Under Review") {
    return [
      {
        title: "Renewal Submitted",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "For Review",
        statusLabel: "Completed",
        isCompleted: true,
        isCurrent: false,
      },
      {
        title: "Under Review",
        statusLabel: "In Progress",
        isCompleted: false,
        isCurrent: true,
      },
      {
        title: "Evaluation",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
      {
        title: "Certificate Processing",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
      {
        title: "Completed",
        statusLabel: "Pending",
        isCompleted: false,
        isCurrent: false,
      },
    ];
  }

  if (renewalStatus === "Withdrawn") {
    return [
      {
        title: "Renewal Submitted",
        statusLabel: "Withdrawn",
        isCompleted: false,
        isCurrent: false,
      },
    ];
  }

  return [
    {
      title: "Renewal Submitted",
      statusLabel: "Completed",
      isCompleted: true,
      isCurrent: false,
    },
    {
      title: "For Review",
      statusLabel: "In Progress",
      isCompleted: false,
      isCurrent: true,
    },
    {
      title: "Evaluation",
      statusLabel: "Pending",
      isCompleted: false,
      isCurrent: false,
    },
    {
      title: "Certificate Processing",
      statusLabel: "Pending",
      isCompleted: false,
      isCurrent: false,
    },
    {
      title: "Completed",
      statusLabel: "Pending",
      isCompleted: false,
      isCurrent: false,
    },
  ];
}

export interface RenewalHistoryTabProps {
  renewalOverview: CitizenRenewalOverviewData | null;
  renewalTimelineItems?: StatusTimelineStep[];
  renewalBadgeConfig?: {
    label: string;
    variant: "info" | "success" | "warning" | "danger" | "neutral";
  };
  renewalPeriodStr?: string;
  recordReference?: string;
  scholarshipProgramName?: string;
  isDarkMode: boolean;
  onOpenRenewal?: () => void;
  viewMode?: "overview" | "status" | "full";
}

export function RenewalHistoryTab({
  renewalOverview,
  renewalTimelineItems,
  renewalBadgeConfig,
  renewalPeriodStr = "—",
  recordReference = "—",
  scholarshipProgramName = "Academic Scholarship",
  isDarkMode,
  onOpenRenewal,
  viewMode = "full",
}: RenewalHistoryTabProps) {
  const renewalItem = renewalOverview?.renewal;
  const hasRenewal = Boolean(renewalItem);

  const badge =
    renewalBadgeConfig || getRenewalBadgeConfig(renewalItem?.renewal_status);
  const steps =
    renewalTimelineItems ||
    getRenewalTimelineItems(renewalItem?.renewal_status);

  const showOverview = viewMode === "overview" || viewMode === "full";
  const showStatus = viewMode === "status" || viewMode === "full";

  return (
    <View style={{ gap: 16 }}>
      {/* 1. RENEWAL OVERVIEW CARD */}
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
              SCHOLARSHIP OVERVIEW
            </Text>
            <Badge label={badge.label} variant={badge.variant} />
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
                Renewal Reference
              </Text>
              <Text style={[styles.infoValue, { color: "#7E22CE" }]}>
                {renewalItem?.renewal_code || recordReference}
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
                {renewalPeriodStr}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Renewal Status
              </Text>
              <Text style={[styles.infoValue, { color: "#16A34A" }]}>
                {renewalItem?.renewal_status || "Active"}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}>
                Submitted Date
              </Text>
              <Text
                style={[styles.infoValue, isDarkMode && { color: "#F8FAFC" }]}
              >
                {formatDate(renewalItem?.submitted_at, "—")}
              </Text>
            </View>

            {renewalItem?.certificate ? (
              <View style={styles.infoRowStacked}>
                <Text
                  style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}
                >
                  Official Certificate
                </Text>
                <Text
                  style={[styles.infoValueStacked, { color: "#15803D" }]}
                >
                  {renewalItem.certificate.certificate_number} (
                  {renewalItem.certificate.certificate_status})
                </Text>
              </View>
            ) : null}
          </View>

          {onOpenRenewal && (
            <TouchableOpacity
              style={styles.primaryActionBtn}
              onPress={onOpenRenewal}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="View Full Renewal Application"
            >
              <Text style={styles.primaryActionBtnText}>
                VIEW FULL RENEWAL APPLICATION
              </Text>
              <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* 2. RENEWAL STATUS & EVALUATION TIMELINE */}
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
              Latest Renewal
            </Text>
            {hasRenewal && badge.label ? (
              <Badge label={badge.label} variant={badge.variant} />
            ) : null}
          </View>

          {!hasRenewal || !renewalItem ? (
            <View style={{ gap: 8 }}>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "700",
                  color: isDarkMode ? "#F8FAFC" : "#0F172A",
                }}
              >
                No Renewal Record Yet
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                  lineHeight: 18,
                }}
              >
                You have not submitted a scholarship renewal application for the
                current period.
              </Text>
              {renewalOverview?.state === "GRANT_IN_PROGRESS" && (
                <View
                  style={{
                    marginTop: 8,
                    padding: 12,
                    borderRadius: 10,
                    backgroundColor: isDarkMode
                      ? "rgba(14, 165, 233, 0.12)"
                      : "#F0F9FF",
                    borderLeftWidth: 3,
                    borderLeftColor: "#0284C7",
                    gap: 4,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: isDarkMode ? "#38BDF8" : "#0369A1",
                    }}
                  >
                    Grant Disbursement In Progress
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? "#CBD5E1" : "#475569",
                      lineHeight: 17,
                    }}
                  >
                    Your grant payout for the current period is currently being
                    processed. Renewal will open once disbursement is completed.
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ marginTop: 12 }}>
              {steps.map((step, idx) => {
                const isLast = idx === steps.length - 1;
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
          )}
        </View>
      )}
    </View>
  );
}
