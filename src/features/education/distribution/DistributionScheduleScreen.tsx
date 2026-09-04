import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import {
  CitizenGrantReleaseItem,
  fetchCitizenGrantReleases,
} from "../grant/api/grantReleaseApi";
import { styles } from "./styles/DistributionSchedule.styles";

function formatCurrency(amount: number): string {
  return `₱${(amount || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function getF2FClaimBadgeVariant(
  claimStatus?: string
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (claimStatus) {
    case "Ready for Claim":
      return "success";
    case "Scheduled":
      return "info";
    case "Released":
      return "success";
    default:
      return "neutral";
  }
}

function getInstitutionalBadgeVariant(
  instStatus?: string
): "info" | "success" | "warning" | "danger" | "neutral" {
  switch (instStatus) {
    case "Released to Partner Institution":
      return "success";
    case "Partner School Notified":
      return "info";
    case "Institutional Payment Processing":
      return "warning";
    case "Preparing for Release":
      return "neutral";
    default:
      return "neutral";
  }
}

export function DistributionScheduleScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grantReleases, setGrantReleases] = useState<CitizenGrantReleaseItem[]>([]);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchCitizenGrantReleases();
      setGrantReleases(data);
    } catch (err: any) {
      console.warn("[DistributionScheduleScreen] load error:", err);
      setError(err?.message || "Unable to load distribution schedule.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: isDarkMode ? "#0B132B" : "#F8FAFC",
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? "#FB923C" : "#EA580C"}
          colors={["#EA580C"]}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? "#FB923C" : "#EA580C"}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: "#FB923C" }]}>
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* PAGE HEADER */}
      <View style={styles.header}>
        <Text style={[styles.title, isDarkMode && { color: "#F8FAFC" }]}>
          Distribution Schedule
        </Text>
        <Text style={[styles.subtitle, isDarkMode && { color: "#94A3B8" }]}>
          Educational stipend payouts & tuition release status
        </Text>
      </View>

      {/* ERROR STATE */}
      {error ? (
        <View
          style={[
            styles.card,
            { borderColor: "#EF4444", borderWidth: 1, padding: 16, marginBottom: 16 },
          ]}
        >
          <Text
            style={{
              color: "#EF4444",
              fontSize: 15,
              fontWeight: "700",
              marginBottom: 4,
            }}
          >
            Unable to load distribution schedule
          </Text>
          <Text
            style={{
              color: isDarkMode ? "#94A3B8" : "#64748B",
              fontSize: 13,
              marginBottom: 12,
            }}
          >
            {error}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: "#EA580C",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
            onPress={() => {
              setIsLoading(true);
              loadData();
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 13 }}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* LOADING STATE */}
      {isLoading ? (
        <View style={{ gap: 16, marginBottom: 16 }}>
          <Skeleton height={180} borderRadius={20} />
          <Skeleton height={140} borderRadius={20} />
        </View>
      ) : grantReleases.length > 0 ? (
        /* LIVE GRANT RELEASES */
        <View style={{ gap: 16, marginBottom: 16 }}>
          {grantReleases.map((rel, relIdx) => (
            <View
              key={rel.release_code || relIdx}
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
            >
              {/* RELEASE HEADER */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: isDarkMode ? "#293548" : "#F1F5F9",
                  paddingBottom: 10,
                }}
              >
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 11,
                      fontWeight: "800",
                      color: isDarkMode ? "#FB923C" : "#EA580C",
                      letterSpacing: 0.5,
                      marginBottom: 2,
                    }}
                  >
                    {rel.program_name?.toUpperCase() || "SCHOLARSHIP GRANT RELEASE"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: isDarkMode ? "#F8FAFC" : "#0F172A",
                    }}
                  >
                    AY {rel.academic_year} • {rel.academic_term}
                  </Text>
                </View>

                <Badge
                  label={rel.release_status}
                  variant={
                    rel.release_status === "Completed" || rel.release_status === "Released"
                      ? "success"
                      : rel.release_status === "In Progress" || rel.release_status === "Partially Released"
                      ? "info"
                      : "neutral"
                  }
                />
              </View>

              {/* AUTHORITATIVE FINANCIAL SUMMARY BREAKDOWN */}
              <View
                style={{
                  backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#334155" : "#E2E8F0",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                    Total Approved
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: isDarkMode ? "#F8FAFC" : "#0F172A", marginTop: 2 }}>
                    {formatCurrency(rel.authorized_amount)}
                  </Text>
                </View>
                <View style={{ width: 1, height: 24, backgroundColor: isDarkMode ? "#334155" : "#CBD5E1" }} />
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                    Released
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#16A34A", marginTop: 2 }}>
                    {formatCurrency(rel.total_released_amount)}
                  </Text>
                </View>
                <View style={{ width: 1, height: 24, backgroundColor: isDarkMode ? "#334155" : "#CBD5E1" }} />
                <View style={{ flex: 1, alignItems: "center" }}>
                  <Text style={{ fontSize: 10, fontWeight: "700", color: "#64748B", textTransform: "uppercase" }}>
                    Remaining
                  </Text>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: isDarkMode ? "#FB923C" : "#EA580C", marginTop: 2 }}>
                    {formatCurrency(rel.remaining_amount)}
                  </Text>
                </View>
              </View>

              {/* RELEASE COMPONENTS */}
              <View style={{ gap: 14 }}>
                {rel.components.map((comp) => {
                  const isF2F = comp.release_method === "Face-to-Face";
                  const f2f = comp.f2f_schedule;
                  const inst = comp.institutional_payment;
                  const hasClaimRef = Boolean(f2f?.claim_reference && f2f.claim_reference.trim().length > 0);

                  return (
                    <View
                      key={comp.component_id}
                      style={{
                        backgroundColor: isDarkMode ? "#0F172A" : "#F8FAFC",
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: isDarkMode ? "#334155" : "#E2E8F0",
                        gap: 8,
                      }}
                    >
                      {/* COMPONENT TOP ROW */}
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                          <Badge
                            label={comp.component_type}
                            variant={comp.component_type === "Stipend" ? "success" : "info"}
                          />
                          <Text
                            style={{
                              fontSize: 12,
                              color: isDarkMode ? "#94A3B8" : "#64748B",
                              fontWeight: "600",
                            }}
                          >
                            {comp.release_method}
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "800",
                            color: isDarkMode ? "#38BDF8" : "#176B87",
                          }}
                        >
                          {formatCurrency(comp.amount)}
                        </Text>
                      </View>

                      {/* FACE-TO-FACE STIPEND DETAILS */}
                      {isF2F && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: isDarkMode ? "#F8FAFC" : "#0F172A",
                              }}
                            >
                              Claim Status
                            </Text>
                            <Badge
                              label={f2f?.claim_status || comp.component_status}
                              variant={getF2FClaimBadgeVariant(f2f?.claim_status || comp.component_status)}
                            />
                          </View>

                          {f2f?.release_date && (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                              <IconSymbol
                                name="calendar"
                                size={14}
                                color={isDarkMode ? "#FB923C" : "#EA580C"}
                              />
                              <Text
                                style={{
                                  fontSize: 13,
                                  fontWeight: "600",
                                  color: isDarkMode ? "#F8FAFC" : "#1E293B",
                                }}
                              >
                                {new Date(f2f.release_date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {f2f.start_time
                                  ? ` (${f2f.start_time}${f2f.end_time ? ` – ${f2f.end_time}` : ""})`
                                  : ""}
                              </Text>
                            </View>
                          )}

                          {f2f?.venue_name && (
                            <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 6 }}>
                              <IconSymbol
                                name="location.fill"
                                size={14}
                                color={isDarkMode ? "#FB923C" : "#EA580C"}
                              />
                              <View style={{ flex: 1 }}>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    fontWeight: "700",
                                    color: isDarkMode ? "#F8FAFC" : "#1E293B",
                                  }}
                                >
                                  {f2f.venue_name}
                                </Text>
                                {f2f.complete_address && (
                                  <Text
                                    style={{
                                      fontSize: 11,
                                      color: isDarkMode ? "#94A3B8" : "#64748B",
                                      marginTop: 1,
                                    }}
                                  >
                                    {f2f.complete_address}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}

                          {/* CLAIM REFERENCE CODE (SHOWN ONLY WHEN NON-EMPTY) */}
                          {hasClaimRef && (
                            <View
                              style={{
                                backgroundColor: isDarkMode ? "#1E293B" : "#DCFCE7",
                                borderRadius: 8,
                                paddingVertical: 6,
                                paddingHorizontal: 10,
                                flexDirection: "row",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginTop: 4,
                                borderWidth: 1,
                                borderColor: isDarkMode ? "#334155" : "#BBF7D0",
                              }}
                            >
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "600",
                                  color: isDarkMode ? "#94A3B8" : "#166534",
                                }}
                              >
                                Claim Reference
                              </Text>
                              <Text
                                style={{
                                  fontSize: 12,
                                  fontWeight: "800",
                                  color: isDarkMode ? "#34D399" : "#15803D",
                                }}
                              >
                                {f2f?.claim_reference}
                              </Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* INSTITUTIONAL PAYMENT TUITION DETAILS */}
                      {!isF2F && inst && (
                        <View style={{ gap: 6, marginTop: 4 }}>
                          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: "700",
                                color: isDarkMode ? "#F8FAFC" : "#0F172A",
                              }}
                            >
                              Institution Status
                            </Text>
                            <Badge
                              label={inst.institutional_status}
                              variant={getInstitutionalBadgeVariant(inst.institutional_status)}
                            />
                          </View>

                          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                            <IconSymbol
                              name="book.closed.fill"
                              size={14}
                              color={isDarkMode ? "#38BDF8" : "#0284C7"}
                            />
                            <Text
                              style={{
                                fontSize: 13,
                                fontWeight: "700",
                                color: isDarkMode ? "#F8FAFC" : "#1E293B",
                                flex: 1,
                              }}
                            >
                              {inst.partner_school_name}
                            </Text>
                          </View>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      ) : (
        /* EMPTY STATE: NO ACTIVE DISTRIBUTION SCHEDULE AVAILABLE */
        <View
          style={[
            styles.card,
            { paddingVertical: 32, alignItems: "center" },
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View
            style={[
              styles.topIconCircle,
              { width: 56, height: 56, borderRadius: 28, marginBottom: 12 },
              isDarkMode && { backgroundColor: "#1E293B" },
            ]}
          >
            <IconSymbol
              name="calendar"
              size={28}
              color={isDarkMode ? "#94A3B8" : "#64748B"}
            />
          </View>

          <Text
            style={[
              styles.topHeaderTitle,
              { textAlign: "center", marginBottom: 6, fontSize: 16 },
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            No distribution schedule is currently available.
          </Text>

          <Text
            style={[
              styles.topHeaderSub,
              { textAlign: "center", paddingHorizontal: 16, lineHeight: 18 },
              isDarkMode && { color: "#CBD5E1" },
            ]}
          >
            Your scholarship distribution details will appear here once a grant release schedule has been published.
          </Text>
        </View>
      )}

      {/* GENERIC CLAIMING GUIDELINES CARD */}
      <View
        style={[
          styles.reqCard,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
      >
        <View style={styles.reqHeaderRow}>
          <View
            style={[
              styles.reqIconCircle,
              isDarkMode && { backgroundColor: "#064E3B" },
            ]}
          >
            <IconSymbol
              name="doc.text.fill"
              size={20}
              color={isDarkMode ? "#34D399" : "#16A34A"}
            />
          </View>
          <Text style={[styles.reqTitle, isDarkMode && { color: "#F8FAFC" }]}>
            General Claiming Guidelines
          </Text>
        </View>

        <View style={styles.reqList}>
          <View style={styles.reqItem}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={15}
              color={isDarkMode ? "#34D399" : "#16A34A"}
            />
            <Text style={[styles.reqText, isDarkMode && { color: "#CBD5E1" }]}>
              Valid Student ID or Citizen ID
            </Text>
          </View>
          <View style={styles.reqItem}>
            <IconSymbol
              name="checkmark.circle.fill"
              size={15}
              color={isDarkMode ? "#34D399" : "#16A34A"}
            />
            <Text style={[styles.reqText, isDarkMode && { color: "#CBD5E1" }]}>
              Official Certificate of Enrollment (COR)
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
