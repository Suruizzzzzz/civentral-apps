import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { formatDate } from "@/src/utils";
import { elevatedCard, modalBackdrop } from "@/src/styles";
import { styles } from "../styles/CitizenScholarshipDetail.styles";

import {
  computeScholarshipStages,
  ScholarshipStatusStage,
  ScholarshipStageState,
} from "./detailHelpers";

export {
  computeScholarshipStages,
  ScholarshipStatusStage,
  ScholarshipStageState,
};

interface InfoFieldItem {
  label: string;
  value?: string | number | null;
  stacked?: boolean;
  valueColor?: string;
  isBold?: boolean;
  valueWeight?: "600" | "700" | "800" | "bold";
}

export interface ApplicationStatusCardProps {
  application: any;
  scholar: any;
  scholarship?: any;
  academicPeriod?: any;
  processTimeline?: any[];
  grantOverview?: any;
  latestUpdateTimestamp?: string;
  scholarshipStages?: ScholarshipStatusStage[];
  isApplicationDisapproved?: boolean;
  stoppedStageInfo?: ScholarshipStatusStage;
  isDarkMode: boolean;
  onWithdraw?: () => void;
  recordReference?: string;
  viewMode?: "overview" | "status" | "full";
}

export function ApplicationStatusCard({
  application,
  scholar,
  scholarship,
  academicPeriod,
  processTimeline,
  grantOverview,
  latestUpdateTimestamp,
  scholarshipStages: propStages,
  isApplicationDisapproved: propDisapproved,
  stoppedStageInfo: propStoppedStage,
  isDarkMode,
  onWithdraw,
  recordReference,
  viewMode = "full",
}: ApplicationStatusCardProps) {
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);

  const isApplicationDisapproved = useMemo(() => {
    if (propDisapproved !== undefined) return propDisapproved;
    return Boolean(
      !scholar &&
      (application?.application_status === "Disapproved" ||
        application?.application_status?.toLowerCase() === "rejected")
    );
  }, [propDisapproved, scholar, application?.application_status]);

  const scholarshipStages = useMemo(() => {
    if (propStages && propStages.length > 0) return propStages;
    return computeScholarshipStages(
      scholar,
      application,
      processTimeline,
      grantOverview,
      latestUpdateTimestamp
    );
  }, [propStages, scholar, application, processTimeline, grantOverview, latestUpdateTimestamp]);

  const stoppedStageInfo = useMemo(() => {
    if (propStoppedStage) return propStoppedStage;
    return scholarshipStages.find((s) => s.state === "stopped");
  }, [propStoppedStage, scholarshipStages]);

  const canWithdraw = Boolean(
    !scholar &&
    !isApplicationDisapproved &&
    application?.application_status &&
    ["Draft", "Submitted", "Under Review", "For Review", "For Compliance"].includes(
      application.application_status
    )
  );

  const handleConfirmWithdraw = () => {
    setWithdrawModalVisible(false);
    if (onWithdraw) {
      onWithdraw();
    } else {
      Alert.alert(
        "Application Withdrawal Requested",
        "Your request to withdraw this scholarship application has been logged with the Secretariat."
      );
    }
  };

  const showOverview = viewMode === "overview" || viewMode === "full";
  const showStatus = viewMode === "status" || viewMode === "full";

  const overviewFields: InfoFieldItem[] = [
    {
      label: "Program Name",
      value: scholarship?.program_name || "Academic Scholarship",
    },
    {
      label: "Program Code",
      value: scholarship?.program_code || "—",
    },
    {
      label: scholar ? "Scholar Status" : "Application Status",
      value: isApplicationDisapproved
        ? "Disapproved"
        : scholar?.scholar_status ||
          application?.application_status ||
          "Active",
      valueColor: isApplicationDisapproved
        ? isDarkMode
          ? "#F87171"
          : "#DC2626"
        : scholar
          ? "#16A34A"
          : "#7E22CE",
      isBold: isApplicationDisapproved,
      valueWeight: isApplicationDisapproved ? "700" : "600",
    },
    {
      label: scholar ? "Scholar Code" : "Application Code",
      value:
        scholar?.scholar_code ||
        application?.application_code ||
        recordReference ||
        "—",
      valueColor: "#7E22CE",
    },
    {
      label: "Academic Period",
      value: `${academicPeriod?.academic_year || "AY 2026-2027"} (${academicPeriod?.term || "Whole Academic Year"})`,
    },
    {
      label: "Education Category",
      value:
        scholarship?.category_name || "Senior High School / Tertiary",
    },
    {
      label: "Date Admitted",
      value: scholar?.admitted_at
        ? formatDate(scholar.admitted_at, "—")
        : isApplicationDisapproved
          ? "Not Admitted (Disapproved)"
          : "Pending Admission",
    },
  ];

  const disapprovedFields: InfoFieldItem[] = [
    {
      label: "Status",
      value: "Disapproved",
      valueColor: isDarkMode ? "#F87171" : "#DC2626",
      isBold: true,
    },
    {
      label: "Category",
      value: application?.disapproval_category,
      stacked: true,
      valueColor: isDarkMode ? "#FCA5A5" : "#991B1B",
      isBold: true,
    },
    {
      label: "Secretariat Remarks",
      value: application?.decision_remarks,
      stacked: true,
    },
  ].filter((f) => Boolean(f.value));

  const interviewFields: InfoFieldItem[] = [
    {
      label: "Date",
      value: application?.interview?.scheduled_date || "TBA",
      valueColor: isDarkMode ? "#F8FAFC" : "#0F172A",
      isBold: true,
    },
    {
      label: "Time",
      value: application?.interview?.scheduled_time || "TBA",
      valueColor: isDarkMode ? "#F8FAFC" : "#0F172A",
      isBold: true,
    },
    {
      label: "Method",
      value: application?.interview?.method || "Face-to-Face",
    },
    {
      label: "Venue / Link",
      value:
        application?.interview?.venue_or_link ||
        "Education & Scholarship Office",
      valueColor: isDarkMode ? "#38BDF8" : "#0284C7",
      valueWeight: "600",
    },
  ];

  const renderInfoField = (f: InfoFieldItem, idx: number) => {
    if (f.stacked) {
      return (
        <View key={`${f.label}-${idx}`} style={styles.infoRowStacked}>
          <Text
            style={[
              styles.infoLabel,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            {f.label}
          </Text>
          <Text
            style={[
              styles.infoValueStacked,
              isDarkMode && { color: "#F8FAFC" },
              f.valueColor ? { color: f.valueColor } : null,
              f.isBold ? { fontWeight: "700" } : null,
              f.valueWeight ? { fontWeight: f.valueWeight } : null,
            ]}
          >
            {f.value}
          </Text>
        </View>
      );
    }

    return (
      <View key={`${f.label}-${idx}`} style={styles.infoRow}>
        <Text
          style={[
            styles.infoLabel,
            isDarkMode && { color: "#94A3B8" },
          ]}
        >
          {f.label}
        </Text>
        <Text
          style={[
            styles.infoValue,
            isDarkMode && { color: "#F8FAFC" },
            f.valueColor ? { color: f.valueColor } : null,
            f.isBold ? { fontWeight: "700" } : null,
            f.valueWeight ? { fontWeight: f.valueWeight } : null,
          ]}
        >
          {f.value}
        </Text>
      </View>
    );
  };

  return (
    <>
      {/* SCHOLARSHIP OVERVIEW CARD */}
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
          <Text
            style={[
              styles.sectionTitle,
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            SCHOLARSHIP OVERVIEW
          </Text>
          <View style={styles.infoGrid}>
            {overviewFields.map(renderInfoField)}
          </View>
        </View>
      )}

      {/* 1. TERMINAL DISAPPROVED STATUS CARD (WHEN DISAPPROVED) */}
      {showStatus && isApplicationDisapproved ? (
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDarkMode ? "#1F1418" : "#FFF5F5",
              borderColor: isDarkMode ? "#991B1B" : "#FECACA",
              borderWidth: 1,
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
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: "#DC2626",
                }}
              />
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDarkMode ? "#F87171" : "#B91C1C",
                    marginBottom: 0,
                    fontSize: 15,
                    fontWeight: "700",
                  },
                ]}
              >
                APPLICATION DISAPPROVED
              </Text>
            </View>
            <Badge label="Disapproved" variant="danger" />
          </View>

          <Text
            style={{
              fontSize: 13,
              color: isDarkMode ? "#CBD5E1" : "#475569",
              marginBottom: 14,
              lineHeight: 18,
            }}
          >
            This application is no longer under active review.
          </Text>

          <View style={styles.infoGrid}>
            {disapprovedFields.map(renderInfoField)}
          </View>
        </View>
      ) : (showStatus && application?.interview) ? (
        /* SCHEDULED INTERVIEW NOTICE CARD — ONLY SHOWN WHEN NOT DISAPPROVED */
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDarkMode ? "#1E293B" : "#F0F9FF",
              borderColor: isDarkMode ? "#0284C7" : "#BAE6FD",
              borderWidth: 1,
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
                {
                  color: isDarkMode ? "#38BDF8" : "#0284C7",
                  marginBottom: 0,
                },
              ]}
            >
              Scheduled Live Interview Notice
            </Text>
            <Badge
              label={application.interview.status || "Pending"}
              variant="info"
            />
          </View>

          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? "#94A3B8" : "#475569",
              marginBottom: 12,
            }}
          >
            Your scholarship application requires a live interview.
            Please be guided by the official schedule below:
          </Text>

          <View style={styles.infoGrid}>
            {interviewFields.map(renderInfoField)}
          </View>
        </View>
      ) : null}

      {/* 2. APPLICATION LIFECYCLE TIMELINE (FULL 5-STAGE PROGRESSION MATCHING DASHBOARD) */}
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
        {/* Header Row: Responsive with wrap safety */}
        <View style={{ marginBottom: 16 }}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                  {
                    marginBottom: 2,
                    fontSize: 16,
                    fontWeight: "700",
                  },
                ]}
              >
                Scholarship Lifecycle
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? "#94A3B8" : "#64748B",
                }}
              >
                Official 5-stage application & grant progression
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isApplicationDisapproved
                  ? isDarkMode
                    ? "#3B1D28"
                    : "#FEF2F2"
                  : isDarkMode
                    ? "#2E1065"
                    : "#F3E8FF",
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: isApplicationDisapproved
                  ? isDarkMode
                    ? "#991B1B"
                    : "#FCA5A5"
                  : isDarkMode
                    ? "#7E22CE"
                    : "#D8B4FE",
                alignSelf: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: isApplicationDisapproved
                    ? isDarkMode
                      ? "#F87171"
                      : "#DC2626"
                    : isDarkMode
                      ? "#C084FC"
                      : "#7E22CE",
                  letterSpacing: 0.6,
                }}
              >
                {isApplicationDisapproved
                  ? "TERMINATED"
                  : "5-STAGE LIFECYCLE"}
              </Text>
            </View>
          </View>
        </View>

        {/* Stopping Summary Callout Banner (when Disapproved) */}
        {isApplicationDisapproved && stoppedStageInfo && (
          <View
            style={{
              backgroundColor: isDarkMode ? "#2D141E" : "#FFF1F2",
              borderColor: isDarkMode ? "#991B1B" : "#FECDD3",
              borderWidth: 1,
              borderRadius: 14,
              padding: 14,
              marginBottom: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
            }}
          >
            <View
              style={{
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: isDarkMode ? "#3B1D28" : "#FEE2E2",
                borderWidth: 1.5,
                borderColor: isDarkMode ? "#991B1B" : "#FCA5A5",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol
                name="xmark.circle.fill"
                size={20}
                color="#DC2626"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 13.5,
                  fontWeight: "700",
                  color: isDarkMode ? "#FCA5A5" : "#991B1B",
                }}
              >
                Application Stopped at Stage{" "}
                {stoppedStageInfo.stageNumber} of 5
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: isDarkMode ? "#F87171" : "#B91C1C",
                  marginTop: 2,
                  lineHeight: 17,
                }}
              >
                Process concluded during {stoppedStageInfo.title}.
                Subsequent stages were not reached.
              </Text>
            </View>
          </View>
        )}

        {/* 5-Stage Timeline Items */}
        <View style={{ marginTop: 4 }}>
          {scholarshipStages.map((stg, idx) => {
            const isLast = idx === scholarshipStages.length - 1;
            const isCompleted = stg.state === "completed";
            const isStopped = stg.state === "stopped";
            const isCurrent = stg.state === "current";
            const isNotReached = stg.state === "not_reached";

            return (
              <View key={stg.id} style={styles.timelineItemRow}>
                {/* Left column: Node and connector line */}
                <View style={styles.timelineLeftColumn}>
                  <View
                    style={[
                      styles.timelineIconCircle,
                      isStopped && {
                        backgroundColor: isDarkMode
                          ? "#3B1D28"
                          : "#FFF5F5",
                        borderColor: isDarkMode
                          ? "#EF4444"
                          : "#DC2626",
                        borderWidth: 2,
                      },
                      isCompleted && {
                        backgroundColor: "#16A34A",
                        borderColor: "#16A34A",
                      },
                      isCurrent && {
                        backgroundColor: isDarkMode
                          ? "#2E1065"
                          : "#FAF5FF",
                        borderColor: isDarkMode
                          ? "#C084FC"
                          : "#7E22CE",
                        borderWidth: 2,
                      },
                      isNotReached && {
                        backgroundColor: isDarkMode
                          ? "#111827"
                          : "#F8FAFC",
                        borderColor: isDarkMode
                          ? "#374151"
                          : "#E2E8F0",
                      },
                    ]}
                  >
                    {isStopped ? (
                      <IconSymbol
                        name="xmark"
                        size={12}
                        color="#DC2626"
                      />
                    ) : isCompleted ? (
                      <IconSymbol
                        name="checkmark"
                        size={12}
                        color="#FFFFFF"
                      />
                    ) : isCurrent ? (
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
                        {stg.stageNumber}
                      </Text>
                    )}
                  </View>
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineConnectorLine,
                        isCompleted && { backgroundColor: "#16A34A" },
                        isStopped && {
                          backgroundColor: isDarkMode
                            ? "#991B1B"
                            : "#FCA5A5",
                        },
                        isNotReached && isDarkMode && {
                          backgroundColor: "#374151",
                        },
                      ]}
                    />
                  )}
                </View>

                {/* Right column: Content box */}
                <View
                  style={[
                    styles.timelineContentCard,
                    isStopped && {
                      backgroundColor: isDarkMode
                        ? "#2D141E"
                        : "#FFF1F2",
                      borderColor: isDarkMode
                        ? "#991B1B"
                        : "#FECDD3",
                      borderWidth: 1,
                    },
                    isCurrent && {
                      backgroundColor: isDarkMode
                        ? "#1E1B4B"
                        : "#F5F3FF",
                      borderColor: isDarkMode
                        ? "#4338CA"
                        : "#DDD6FE",
                      borderWidth: 1,
                    },
                    isNotReached && { opacity: 0.7 },
                  ]}
                >
                  <View style={styles.timelineContentHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text
                        style={[
                          styles.timelineCategory,
                          isDarkMode && { color: "#94A3B8" },
                          isStopped && {
                            color: isDarkMode ? "#FCA5A5" : "#991B1B",
                          },
                          isCurrent && {
                            color: isDarkMode ? "#A5B4FC" : "#6366F1",
                          },
                        ]}
                      >
                        {stg.stageBadge} • {stg.stageCategory}
                      </Text>
                      <Text
                        style={[
                          styles.timelineTitle,
                          isDarkMode && { color: "#F8FAFC" },
                          isStopped && {
                            color: isDarkMode ? "#FCA5A5" : "#991B1B",
                          },
                        ]}
                      >
                        {stg.title}
                      </Text>
                    </View>
                    <Badge
                      label={stg.statusLabel}
                      variant={
                        isStopped
                          ? "danger"
                          : isCompleted
                            ? "success"
                            : isCurrent
                              ? "info"
                              : "neutral"
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.timelineDesc,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    {stg.description}
                  </Text>

                  {/* Stopping / Disapproval Reason Callout Box */}
                  {isStopped && (stg.reason || stg.remarks) && (
                    <View
                      style={{
                        marginTop: 10,
                        padding: 10,
                        backgroundColor: isDarkMode
                          ? "#3B1D28"
                          : "#FEE2E2",
                        borderRadius: 8,
                        borderLeftWidth: 3,
                        borderLeftColor: "#DC2626",
                      }}
                    >
                      {stg.reason ? (
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "700",
                            color: isDarkMode ? "#FCA5A5" : "#991B1B",
                            marginBottom: 2,
                          }}
                        >
                          Disapproval Reason: {stg.reason}
                        </Text>
                      ) : null}
                      {stg.remarks ? (
                        <Text
                          style={{
                            fontSize: 11.5,
                            color: isDarkMode ? "#F87171" : "#B91C1C",
                            lineHeight: 16,
                          }}
                        >
                          {stg.remarks}
                          {application?.decided_by?.full_name
                            ? ` by ${application.decided_by.full_name}`
                            : ""}
                        </Text>
                      ) : null}
                    </View>
                  )}

                  {/* Completed Date Tag */}
                  {isCompleted && stg.date ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 8,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={12}
                        color={isDarkMode ? "#4ADE80" : "#16A34A"}
                      />
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: "600",
                          color: isDarkMode ? "#4ADE80" : "#16A34A",
                        }}
                      >
                        Completed • {stg.date}
                      </Text>
                    </View>
                  ) : null}

                  {/* Evaluated by metadata tag */}
                  {stg.evaluatorName ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginTop: 6,
                      }}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={13}
                        color={isDarkMode ? "#C084FC" : "#7E22CE"}
                      />
                      <Text
                        style={{
                          fontSize: 11.5,
                          fontWeight: "600",
                          color: isDarkMode ? "#C084FC" : "#7E22CE",
                        }}
                      >
                        Evaluated by: {stg.evaluatorName}
                      </Text>
                    </View>
                  ) : null}

                  {/* Not Reached Note */}
                  {isNotReached && stg.subtitle ? (
                    <Text
                      style={{
                        fontSize: 11,
                        fontStyle: "italic",
                        color: isDarkMode ? "#64748B" : "#94A3B8",
                        marginTop: 6,
                      }}
                    >
                      {stg.subtitle}
                    </Text>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>

        {/* WITHDRAW / CANCEL TRIGGER */}
        {canWithdraw && (
          <View
            style={{
              marginTop: 16,
              paddingTop: 14,
              borderTopWidth: 1,
              borderTopColor: isDarkMode ? "#334155" : "#F1F5F9",
              flexDirection: "row",
              justifyContent: "flex-end",
            }}
          >
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingVertical: 8,
                paddingHorizontal: 14,
                borderRadius: 8,
                backgroundColor: isDarkMode ? "#3B1D28" : "#FEF2F2",
                borderWidth: 1,
                borderColor: isDarkMode ? "#991B1B" : "#FECACA",
              }}
              onPress={() => setWithdrawModalVisible(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={14} color="#DC2626" />
              <Text style={{ fontSize: 12, fontWeight: "700", color: "#DC2626" }}>
                Withdraw Application
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      )}

      {/* WITHDRAW CONFIRMATION MODAL */}
      {showStatus && (
        <Modal
        visible={withdrawModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWithdrawModalVisible(false)}
      >
        <View
          style={[
            modalBackdrop,
            {
              backgroundColor: "rgba(0,0,0,0.6)",
              padding: 20,
            },
          ]}
        >
          <View
            style={[
              elevatedCard,
              styles.sectionCard,
              { width: "100%", maxWidth: 400 },
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#FEE2E2",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ionicons name="warning" size={20} color="#DC2626" />
              </View>
              <Text
                style={[
                  styles.sectionTitle,
                  { marginBottom: 0, fontSize: 16, color: isDarkMode ? "#F8FAFC" : "#0F172A" },
                ]}
              >
                Withdraw Application?
              </Text>
            </View>

            <Text
              style={{
                fontSize: 13,
                color: isDarkMode ? "#CBD5E1" : "#475569",
                lineHeight: 19,
                marginBottom: 16,
              }}
            >
              Are you sure you want to withdraw scholarship application{" "}
              <Text style={{ fontWeight: "700", color: isDarkMode ? "#F8FAFC" : "#0F172A" }}>
                {recordReference || application?.application_code || "this record"}
              </Text>
              ? This action will cancel evaluation and archive this submission.
            </Text>

            <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
              <TouchableOpacity
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: isDarkMode ? "#334155" : "#E2E8F0",
                }}
                onPress={() => setWithdrawModalVisible(false)}
              >
                <Text style={{ fontSize: 13, fontWeight: "600", color: isDarkMode ? "#F8FAFC" : "#334155" }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  paddingVertical: 9,
                  paddingHorizontal: 16,
                  borderRadius: 8,
                  backgroundColor: "#DC2626",
                }}
                onPress={handleConfirmWithdraw}
              >
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#FFFFFF" }}>
                  Yes, Withdraw
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      )}
    </>
  );
}
