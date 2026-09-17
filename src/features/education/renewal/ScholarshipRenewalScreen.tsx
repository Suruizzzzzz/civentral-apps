import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
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
  CitizenRenewalOverview,
  fetchCitizenRenewalOverview,
  RequiredDocumentItem,
  CitizenComplianceDetailsData,
  fetchCitizenRenewalCompliance,
} from "./api/renewalApi";
import { styles } from "./styles/ScholarshipRenewal.styles";

import { formatDate } from "@/utils/dateUtils";

function formatRenewalDate(value?: string | null): string {
  return formatDate(value, "—");
}

function getCertificateStatusText(status: string): string {
  switch (status) {
    case "Issued":
      return "Certificate issued";
    case "Signed":
      return "Signed and awaiting issuance";
    case "Cancelled":
      return "Certificate cancelled";
    default:
      return "Being prepared for issuance";
  }
}

export function ScholarshipRenewalScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<CitizenRenewalOverview | null>(null);
  const [complianceDetails, setComplianceDetails] = useState<CitizenComplianceDetailsData | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const [overview, compliance] = await Promise.all([
        fetchCitizenRenewalOverview(),
        fetchCitizenRenewalCompliance().catch(() => null),
      ]);
      setData(overview);
      setComplianceDetails(compliance);
    } catch (err: any) {
      console.error("[ScholarshipRenewalScreen] fetch error:", err);
      setError(
        err?.message || "Unable to retrieve scholarship renewal status.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

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
          tintColor={isDarkMode ? "#4ADE80" : "#15803D"}
          colors={["#15803D"]}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.backIconCircle,
            isDarkMode && { backgroundColor: "#1C2541", borderColor: "#3A506B" },
          ]}
        >
          <IconSymbol
            name="chevron.left"
            size={18}
            color={isDarkMode ? "#4ADE80" : "#15803D"}
          />
        </View>
        <Text style={[styles.backText, isDarkMode && { color: "#4ADE80" }]}>
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View
        style={[
          styles.headerBanner,
          isDarkMode && { backgroundColor: "#1C2541", borderWidth: 1, borderColor: "#3A506B" },
        ]}
      >
        <View style={styles.headerBadge}>
          <IconSymbol name="pencil" size={14} color="#FFFFFF" />
          <Text style={styles.headerBadgeText}>FOR SCHOLARS</Text>
        </View>
        <Text style={styles.title}>Scholarship Renewal</Text>
        <Text style={styles.sub}>
          Submit renewal requirements, view active grant status & certificate issuance.
        </Text>
      </View>

      {/* LOADING STATE */}
      {loading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={16} />
          <Skeleton height={200} borderRadius={16} />
        </View>
      ) : error ? (
        /* ERROR STATE */
        <View style={styles.centerContainer}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={40}
            color="#EF4444"
          />
          <Text style={styles.errorTitle}>Unable to Load Renewal</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : data ? (
        <>
          {/* STATE-SPECIFIC BANNER */}
          {data.state === "NOT_A_SCHOLAR" && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: "#EFF6FF",
                  borderColor: "#BFDBFE",
                  borderWidth: 1,
                },
              ]}
            >
              <IconSymbol name="info.circle" size={24} color="#2563EB" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: "#1E40AF" }]}>
                  Not an Active Scholar
                </Text>
                <Text style={[styles.bannerText, { color: "#1E3A8A" }]}>
                  Scholarship renewal is available exclusively for enrolled
                  municipal scholars. If you are a new applicant, please apply
                  via the New Applicant portal.
                </Text>
              </View>
            </View>
          )}

          {data.state === "SCHOLAR_INACTIVE" && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: "#FEF2F2",
                  borderColor: "#FCA5A5",
                  borderWidth: 1,
                },
              ]}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="#DC2626" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: "#991B1B" }]}>
                  Scholarship Status Inactive
                </Text>
                <Text style={[styles.bannerText, { color: "#7F1D1D" }]}>
                  Your scholar account is currently listed as{" "}
                  {data.scholar?.scholar_status || "Inactive"}. Renewal
                  submission is restricted for inactive scholars.
                </Text>
              </View>
            </View>
          )}

          {data.state === "RENEWAL_NOT_OPEN" && (
            <View
              style={[
                styles.banner,
                {
                  backgroundColor: "#FFFBEB",
                  borderColor: "#FDE68A",
                  borderWidth: 1,
                },
              ]}
            >
              <IconSymbol name="clock.fill" size={24} color="#D97706" />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: "#92400E" }]}>
                  Renewal Window Closed
                </Text>
                <Text style={[styles.bannerText, { color: "#78350F" }]}>
                  The official scholarship renewal period is not currently open.
                  Please stay tuned for official announcement notices from the
                  City Education Department.
                </Text>
              </View>
            </View>
          )}

          {data.state === "RENEWAL_AVAILABLE" && (
            <View>
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: "#F0FDF4",
                    borderColor: "#BBF7D0",
                    borderWidth: 1,
                  },
                ]}
              >
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={24}
                  color="#16A34A"
                />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: "#166534" }]}>
                    Renewal Available
                  </Text>
                  <Text style={[styles.bannerText, { color: "#14532D" }]}>
                    The scholarship renewal window is open! Scholars are invited
                    to submit their latest COR, COG, and SOA records for review.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#15803D",
                  borderRadius: 14,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 12,
                  marginBottom: 16,
                  flexDirection: "row",
                  gap: 8,
                }}
                onPress={() =>
                  router.push("/education/renewal/application" as any)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={{ color: "#FFFFFF", fontSize: 15, fontWeight: "700" }}
                >
                  Start Renewal
                </Text>
                <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {data.state === "RENEWAL_EXISTS" && (
            <View>
              <View
                style={[
                  styles.banner,
                  {
                    backgroundColor: "#F0FDF4",
                    borderColor: "#BBF7D0",
                    borderWidth: 1,
                  },
                ]}
              >
                <IconSymbol name="doc.text.fill" size={24} color="#16A34A" />
                <View style={{ flex: 1 }}>
                  <Text style={[styles.bannerTitle, { color: "#166534" }]}>
                    {data.renewal?.renewal_status === "Completed"
                      ? "Renewal Completed"
                      : data.renewal?.renewal_status === "For Certificate"
                        ? "Certificate Processing"
                        : "Renewal Submitted"}
                  </Text>
                  <Text style={[styles.bannerText, { color: "#14532D" }]}>
                    {data.renewal?.renewal_status === "Completed"
                      ? `Your scholarship renewal (${data.renewal?.renewal_code}) has been completed successfully.`
                      : data.renewal?.renewal_status === "For Certificate"
                        ? `Your scholarship renewal (${data.renewal?.renewal_code}) has been approved and is now in the certificate stage.`
                        : `Your renewal application (${data.renewal?.renewal_code}) was submitted on ${formatRenewalDate(data.renewal?.submitted_at)}. Current status: ${data.renewal?.renewal_status}.`}
                  </Text>
                </View>
              </View>

              {/* ACTION REQUIRED BUTTON vs PASSIVE STATUS NOTE */}
              {data.renewal?.citizen_action_required ? (
                <TouchableOpacity
                  style={{
                    backgroundColor: "#D97706",
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    alignItems: "center",
                    justifyContent: "center",
                    marginTop: 12,
                    marginBottom: 16,
                    flexDirection: "row",
                    gap: 8,
                  }}
                  onPress={() =>
                    router.push("/education/renewal/compliance" as any)
                  }
                  activeOpacity={0.8}
                >
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 15,
                      fontWeight: "700",
                    }}
                  >
                    Review Required Action
                  </Text>
                  <IconSymbol name="chevron.right" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              ) : data.renewal?.renewal_status === "Returned" ? (
                <View
                  style={{
                    backgroundColor: "#FFFBEB",
                    borderColor: "#FDE68A",
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 14,
                    marginTop: 12,
                    marginBottom: 16,
                    flexDirection: "row",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <IconSymbol name="clock.fill" size={20} color="#D97706" />
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 13,
                      color: "#92400E",
                      lineHeight: 18,
                    }}
                  >
                    Your response has been submitted and is awaiting coordinator
                    review.
                  </Text>
                </View>
              ) : null}

              {/* C4 — CITIZEN-SAFE CERTIFICATE METADATA ONLY */}
              {data.renewal?.certificate &&
                (data.renewal.renewal_status === "For Certificate" ||
                  data.renewal.renewal_status === "Completed") && (
                  <View
                    style={[
                      styles.card,
                      {
                        marginTop: 4,
                        marginBottom: 16,
                      },
                      isDarkMode && {
                        backgroundColor: "#1E293B",
                        borderColor: "#334155",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <IconSymbol
                        name={
                          data.renewal.certificate.certificate_status ===
                          "Issued"
                            ? "checkmark.circle.fill"
                            : "doc.text.fill"
                        }
                        size={22}
                        color={
                          data.renewal.certificate.certificate_status ===
                          "Issued"
                            ? "#16A34A"
                            : "#16A34A"
                        }
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.programTitle,
                            isDarkMode && { color: "#F8FAFC" },
                          ]}
                        >
                          Renewal Certificate
                        </Text>
                        <Text
                          style={[
                            styles.programCode,
                            isDarkMode && { color: "#94A3B8" },
                          ]}
                        >
                          {getCertificateStatusText(
                            data.renewal.certificate.certificate_status,
                          )}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Certificate No.
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {data.renewal.certificate.certificate_number}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Certificate Status
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {data.renewal.certificate.certificate_status}
                      </Text>
                    </View>

                    <View style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Prepared
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {formatRenewalDate(
                          data.renewal.certificate.prepared_at,
                        )}
                      </Text>
                    </View>

                    {data.renewal.certificate.signed_at && (
                      <View style={styles.infoRow}>
                        <Text
                          style={[
                            styles.infoLabel,
                            isDarkMode && { color: "#94A3B8" },
                          ]}
                        >
                          Signed
                        </Text>
                        <Text
                          style={[
                            styles.infoValue,
                            isDarkMode && { color: "#F8FAFC" },
                          ]}
                        >
                          {formatRenewalDate(
                            data.renewal.certificate.signed_at,
                          )}
                        </Text>
                      </View>
                    )}

                    {data.renewal.certificate.issued_at && (
                      <View style={styles.infoRow}>
                        <Text
                          style={[
                            styles.infoLabel,
                            isDarkMode && { color: "#94A3B8" },
                          ]}
                        >
                          Issued
                        </Text>
                        <Text
                          style={[
                            styles.infoValue,
                            isDarkMode && { color: "#F8FAFC" },
                          ]}
                        >
                          {formatRenewalDate(
                            data.renewal.certificate.issued_at,
                          )}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
            </View>
          )}

          {/* SCHOLAR & PROGRAM SUMMARY CARD */}
          {data.scholar && data.program && (
            <View
              style={[
                styles.card,
                isDarkMode && {
                  backgroundColor: "#1E293B",
                  borderColor: "#334155",
                },
              ]}
            >
              <View style={styles.badgeRow}>
                <Badge
                  variant="info"
                  label={data.program.category_name || "Scholarship Program"}
                />
                <Badge
                  variant={
                    data.scholar.scholar_status === "Active"
                      ? "success"
                      : "neutral"
                  }
                  label={data.scholar.scholar_status}
                />
              </View>

              <Text
                style={[
                  styles.programTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {data.program.program_name}
              </Text>
              <Text
                style={[styles.programCode, isDarkMode && { color: "#94A3B8" }]}
              >
                Scholar Code: {data.scholar.scholar_code}
              </Text>

              {data.current_academic_period && (
                <View style={styles.infoRow}>
                  <Text
                    style={[
                      styles.infoLabel,
                      isDarkMode && { color: "#94A3B8" },
                    ]}
                  >
                    Academic Period
                  </Text>
                  <Text
                    style={[
                      styles.infoValue,
                      isDarkMode && { color: "#F8FAFC" },
                    ]}
                  >
                    {data.current_academic_period.academic_year} —{" "}
                    {data.current_academic_period.term}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* RENEWAL REQUIREMENTS LIST */}
          {data.required_documents && data.required_documents.length > 0 && (
            <View>
              <Text
                style={[
                  styles.sectionTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Required Renewal Documents
              </Text>
              {data.required_documents.map((doc: RequiredDocumentItem) => (
                <View
                  key={doc.code}
                  style={[
                    styles.docItem,
                    isDarkMode && {
                      backgroundColor: "#1E293B",
                      borderColor: "#334155",
                    },
                  ]}
                >
                  <View style={styles.docBadge}>
                    <Text style={styles.docBadgeText}>{doc.code}</Text>
                  </View>
                  <View style={styles.docTextCol}>
                    <Text
                      style={[
                        styles.docName,
                        isDarkMode && { color: "#F8FAFC" },
                      ]}
                    >
                      {doc.name}
                    </Text>
                    <Text
                      style={[
                        styles.docDesc,
                        isDarkMode && { color: "#94A3B8" },
                      ]}
                    >
                      {doc.description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* RENEWAL COMPLIANCE SECTION */}
          {(data.state === "RENEWAL_AVAILABLE" || data.state === "RENEWAL_EXISTS") && (
            <View
              style={[
                styles.card,
                { marginTop: 16 },
                isDarkMode && {
                  backgroundColor: "#1E293B",
                  borderColor: "#334155",
                },
              ]}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { marginBottom: 8 },
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Renewal Compliance
              </Text>

              {(() => {
                const unresolvedCount = complianceDetails?.unresolved_compliance_requests?.length ?? 0;
                const isRenewalSubmitted = data.state === "RENEWAL_EXISTS";

                if (unresolvedCount > 0) {
                  /* Active compliance requests */
                  return (
                    <View>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 }}>
                        <IconSymbol name="exclamationmark.triangle.fill" size={16} color="#D97706" />
                        <Text style={{ fontSize: 13, fontWeight: "800", color: isDarkMode ? "#FDE68A" : "#B45309" }}>
                          {unresolvedCount} Action Required
                        </Text>
                      </View>
                      <Text style={{ fontSize: 12, color: isDarkMode ? "#CBD5E1" : "#64748B", lineHeight: 17, marginBottom: 10 }}>
                        Document corrections have been requested for your renewal application.
                      </Text>
                      <TouchableOpacity
                        style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-end" }}
                        onPress={() => router.push("/education/renewal/compliance" as any)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 13, fontWeight: "800", color: isDarkMode ? "#4ADE80" : "#15803D" }}>
                          Open Compliance
                        </Text>
                        <IconSymbol name="chevron.right" size={14} color={isDarkMode ? "#4ADE80" : "#15803D"} />
                      </TouchableOpacity>
                    </View>
                  );
                }

                if (!isRenewalSubmitted) {
                  /* Pre-submission */
                  return (
                    <View>
                      <Text style={{ fontSize: 12.5, fontWeight: "600", color: isDarkMode ? "#CBD5E1" : "#475569", marginBottom: 2 }}>
                        No compliance requests yet.
                      </Text>
                      <Text style={{ fontSize: 11.5, color: isDarkMode ? "#64748B" : "#94A3B8", lineHeight: 17 }}>
                        Compliance requests will appear here if document corrections are requested after your renewal is submitted.
                      </Text>
                    </View>
                  );
                }

                /* Submitted + no active requests */
                return (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                    <Text style={{ fontSize: 12.5, fontWeight: "600", color: isDarkMode ? "#86EFAC" : "#16A34A" }}>
                      No active compliance requests.
                    </Text>
                  </View>
                );
              })()}
            </View>
          )}
        </>
      ) : null}
    </ScrollView>
  );
}

