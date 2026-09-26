import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import {
  CitizenRenewalOverview,
  fetchCitizenRenewalOverview,
  CitizenComplianceDetailsData,
  fetchCitizenRenewalCompliance,
} from "./api/renewalApi";
import { styles } from "./styles/ScholarshipRenewal.styles";

const renewalHeaderLight = require("@/assets/images/renewal-header-light.png");
const renewalHeaderDark = require("@/assets/images/renewal-header-dark.png");
const renewalWhite = require("@/assets/images/renewal-white.png");
const renewalDark = require("@/assets/images/renewal-dark.png");
const complianceLight = require("@/assets/images/compliance-light.png");
const complianceDark = require("@/assets/images/compliance-dark.png");

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

  const unresolvedComplianceCount = complianceDetails?.unresolved_compliance_requests?.length ?? 0;

  // Gate compliance actionability strictly according to renewal state and actionability
  const hasActionableCompliance = Boolean(
    data &&
    data.state !== "NOT_A_SCHOLAR" &&
    data.state !== "SCHOLAR_INACTIVE" &&
    data.renewal &&
    data.renewal.citizen_action_required
  );

  const RENEWAL_HEADER_ASPECT_RATIO = isDarkMode ? 1791 / 497 : 1777 / 489;

  const renderHeaderSkeleton = () => (
    <View
      style={[
        styles.headerContainer,
        isDarkMode && styles.headerContainerDark,
        { aspectRatio: RENEWAL_HEADER_ASPECT_RATIO },
      ]}
    >
      <Skeleton
        width="100%"
        borderRadius={16}
        style={{
          height: "100%",
        }}
      />
    </View>
  );

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

      {/* HERO HEADER: SKELETON OR IMAGE */}
      {loading ? (
        renderHeaderSkeleton()
      ) : (
        <View
          style={[
            styles.headerContainer,
            isDarkMode && styles.headerContainerDark,
            { aspectRatio: RENEWAL_HEADER_ASPECT_RATIO },
          ]}
          accessible={true}
          accessibilityRole="header"
        >
          <Image
            source={isDarkMode ? renewalHeaderDark : renewalHeaderLight}
            style={styles.headerImage}
            resizeMode="cover"
            accessible={true}
            accessibilityLabel="Scholarship Renewal Header"
          />
        </View>
      )}

      {/* LOADING STATE */}
      {loading ? (
        <View style={{ gap: 16 }}>
          {/* SKELETON CARD 1 */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#031731",
                borderColor: "#0E2D56",
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              <Skeleton width={95} height={95} borderRadius={16} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={110}
                  height={20}
                  borderRadius={10}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton
                  width={150}
                  height={20}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width="90%" height={14} borderRadius={4} />
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 12 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton width={140} height={24} borderRadius={12} />
                <Skeleton width={110} height={24} borderRadius={12} />
              </View>
              <Skeleton width="100%" height={40} borderRadius={20} />
            </View>
          </View>

          {/* SKELETON CARD 2 */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#071D37",
                borderColor: "#0F3866",
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              <Skeleton width={95} height={95} borderRadius={16} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={100}
                  height={20}
                  borderRadius={10}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton
                  width={130}
                  height={20}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width="90%" height={14} borderRadius={4} />
              </View>
            </View>
            <View style={{ gap: 10, marginTop: 12 }}>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <Skeleton width={120} height={24} borderRadius={12} />
                <Skeleton width={100} height={24} borderRadius={12} />
              </View>
              <Skeleton width="100%" height={40} borderRadius={20} />
            </View>
          </View>
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
          {/* PRIMARY CARD 1: RENEWAL APPLICATION */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#031731",
                borderColor: "#0E2D56",
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              <Image
                source={isDarkMode ? renewalDark : renewalWhite}
                style={styles.renewalArtworkImage}
                resizeMode="contain"
              />

              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  {data.state === "RENEWAL_AVAILABLE" ? (
                    <View
                      style={[
                        styles.successBadge,
                        isDarkMode && { backgroundColor: "#064E3B" },
                      ]}
                    >
                      <IconSymbol name="checkmark.circle.fill" size={11} color={isDarkMode ? "#34D399" : "#15803D"} />
                      <Text style={[styles.successBadgeText, isDarkMode && { color: "#34D399" }]}>
                        Renewal Available
                      </Text>
                    </View>
                  ) : data.state === "RENEWAL_EXISTS" ? (
                    <View
                      style={[
                        styles.recBadge,
                        isDarkMode && { backgroundColor: "#15803D" },
                      ]}
                    >
                      <IconSymbol name="doc.text.fill" size={11} color="#FFFFFF" />
                      <Text style={styles.recBadgeText}>
                        {data.renewal?.renewal_status === "Completed"
                          ? "Completed"
                          : data.renewal?.renewal_status === "For Certificate"
                            ? "For Certificate"
                            : data.renewal?.renewal_status || "Submitted"}
                      </Text>
                    </View>
                  ) : data.state === "RENEWAL_NOT_OPEN" ? (
                    <View
                      style={[
                        styles.warningBadge,
                        isDarkMode && { backgroundColor: "#78350F" },
                      ]}
                    >
                      <IconSymbol name="clock.fill" size={11} color={isDarkMode ? "#FDE68A" : "#B45309"} />
                      <Text style={[styles.warningBadgeText, isDarkMode && { color: "#FDE68A" }]}>
                        Window Closed
                      </Text>
                    </View>
                  ) : data.state === "SCHOLAR_INACTIVE" ? (
                    <View
                      style={[
                        styles.warningBadge,
                        isDarkMode && { backgroundColor: "#7F1D1D" },
                      ]}
                    >
                      <IconSymbol name="xmark.circle.fill" size={11} color={isDarkMode ? "#FCA5A5" : "#DC2626"} />
                      <Text style={[styles.warningBadgeText, isDarkMode && { color: "#FCA5A5" }]}>
                        Scholar Inactive
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.neutralBadge,
                        isDarkMode && { backgroundColor: "#1E293B" },
                      ]}
                    >
                      <IconSymbol name="info.circle" size={11} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                      <Text style={[styles.neutralBadgeText, isDarkMode && { color: "#94A3B8" }]}>
                        Not a Scholar
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}
                >
                  Renewal Application
                </Text>
                <Text
                  style={[styles.cardSub, isDarkMode && { color: "#CBD5E1" }]}
                >
                  {data.state === 'NOT_A_SCHOLAR'
                    ? "Scholarship renewal is exclusively available to verified scholars. New applicants can explore available scholarships in the Education Hub."
                    : "Review your scholarship renewal status and submit the required documents for the next academic period."}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cardBottomRow,
                isDarkMode && { borderTopColor: "#0D274A" },
              ]}
            >
              <View style={styles.pillGroup}>
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#072040" },
                  ]}
                >
                  <IconSymbol
                    name="doc.text.fill"
                    size={13}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    Academic & Enrollment records
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#072040" },
                  ]}
                >
                  <IconSymbol
                    name="clock.fill"
                    size={13}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    {data.current_academic_period
                      ? `${data.current_academic_period.academic_year} • ${data.current_academic_period.term}`
                      : "Next Period"}
                  </Text>
                </View>
              </View>

              {data.state === 'NOT_A_SCHOLAR' ? (
                <View
                  style={[
                    styles.primaryActionBtn,
                    {
                      backgroundColor: isDarkMode ? "#1E293B" : "#F1F5F9",
                      borderColor: isDarkMode ? "#334155" : "#CBD5E1",
                      borderWidth: 1,
                      opacity: 0.85,
                    },
                  ]}
                >
                  <IconSymbol name="lock.fill" size={13} color={isDarkMode ? "#94A3B8" : "#64748B"} />
                  <Text style={[styles.primaryActionBtnText, { color: isDarkMode ? "#94A3B8" : "#64748B" }]}>
                    Renewal Restricted (Scholars Only)
                  </Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[
                    styles.primaryActionBtn,
                    isDarkMode && { backgroundColor: "#15803D" },
                  ]}
                  onPress={() => router.push("/education/renewal/application" as any)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionBtnText}>View Renewal Application</Text>
                  <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* PRIMARY CARD 2: COMPLIANCE */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#071D37",
                borderColor: "#0F3866",
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              <Image
                source={isDarkMode ? complianceDark : complianceLight}
                style={styles.artworkImage}
                resizeMode="contain"
              />

              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  {hasActionableCompliance ? (
                    <View
                      style={[
                        styles.warningBadge,
                        isDarkMode && { backgroundColor: "#78350F" },
                      ]}
                    >
                      <IconSymbol
                        name="exclamationmark.triangle.fill"
                        size={11}
                        color={isDarkMode ? "#FDE68A" : "#B45309"}
                      />
                      <Text
                        style={[
                          styles.warningBadgeText,
                          isDarkMode && { color: "#FDE68A" },
                        ]}
                      >
                        {unresolvedComplianceCount > 0
                          ? `${unresolvedComplianceCount} Action Required`
                          : "Action Required"}
                      </Text>
                    </View>
                  ) : (
                    <View
                      style={[
                        styles.neutralBadge,
                        isDarkMode && { backgroundColor: "#064E3B" },
                      ]}
                    >
                      <IconSymbol
                        name="checkmark.circle.fill"
                        size={11}
                        color={isDarkMode ? "#34D399" : "#16A34A"}
                      />
                      <Text
                        style={[
                          styles.neutralBadgeText,
                          isDarkMode && { color: "#34D399" },
                        ]}
                      >
                        All Clear
                      </Text>
                    </View>
                  )}
                </View>

                <Text
                  style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}
                >
                  Compliance
                </Text>
                <Text
                  style={[styles.cardSub, isDarkMode && { color: "#CBD5E1" }]}
                >
                  {hasActionableCompliance
                    ? unresolvedComplianceCount > 0
                      ? `Action required: You have ${unresolvedComplianceCount} document replacement request${unresolvedComplianceCount > 1 ? "s" : ""} to complete.`
                      : "Action required: Review and submit clarification or document corrections for your scholarship renewal."
                    : "Your renewal has no outstanding requirements. Review and submit document corrections if requested for your scholarship renewal."}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cardBottomRow,
                isDarkMode && { borderTopColor: "#0E2C52" },
              ]}
            >
              <View style={styles.pillGroup}>
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#0B2749" },
                  ]}
                >
                  <IconSymbol
                    name="doc.text.fill"
                    size={13}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    Document corrections
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#0B2749" },
                  ]}
                >
                  <IconSymbol
                    name={hasActionableCompliance ? "clock.fill" : "checkmark.circle.fill"}
                    size={13}
                    color={hasActionableCompliance ? (isDarkMode ? "#FDE68A" : "#B45309") : (isDarkMode ? "#34D399" : "#16A34A")}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    {hasActionableCompliance
                      ? unresolvedComplianceCount > 0
                        ? `${unresolvedComplianceCount} Action required`
                        : "Action required"
                      : "No pending action"}
                  </Text>
                </View>
              </View>

              {hasActionableCompliance && (
                <TouchableOpacity
                  style={[
                    styles.secondaryActionBtn,
                    isDarkMode && { borderColor: "#4ADE80" },
                  ]}
                  onPress={() => router.push("/education/renewal/compliance" as any)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.secondaryActionBtnText,
                      isDarkMode && { color: "#4ADE80" },
                    ]}
                  >
                    View Compliance
                  </Text>
                  <IconSymbol
                    name="chevron.right"
                    size={14}
                    color={isDarkMode ? "#4ADE80" : "#15803D"}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </>
      ) : null}
    </ScrollView>
  );
}
