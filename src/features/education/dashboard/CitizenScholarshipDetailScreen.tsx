import React, { useMemo, useState } from "react";
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "./styles/CitizenScholarshipDetail.styles";

import {
  ApplicationStatusCard,
  ComplianceReplacementTab,
  ContractUndertakingTab,
  GrantPayoutTab,
  HeaderContextCard,
  RenewalHistoryTab,
  computeRecordMetadata,
  resolveMatchedRelease,
  useScholarshipDetailData,
  useScholarshipDocumentViewer,
} from "./details";

type DetailTab = "overview" | "status" | "documents";

export function CitizenScholarshipDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    recordType?: "Application" | "Grant" | "Renewal";
    recordId?: string;
    code?: string;
    id?: string;
    release_code?: string;
    grant_release_id?: string;
    academicPeriod?: string;
    status?: string;
  }>();

  const activeRecordType: "Application" | "Grant" | "Renewal" =
    params.recordType === "Grant" || params.recordType === "Renewal"
      ? params.recordType
      : "Application";

  const { isDarkMode } = useTheme();
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");

  const {
    isLoading,
    setIsLoading,
    refreshing,
    error,
    dashboardData,
    renewalOverview,
    documentRecords,
    officialDocuments,
    grantOverview,
    grantOverviewLoading,
    grantOverviewError,
    grantReleases,
    loadGrantOverview,
    loadAllData,
    onRefresh,
  } = useScholarshipDetailData();

  const {
    actionLoadingDocKey,
    handleDocumentAction,
    handleOfficialDocAction,
    renderModals,
  } = useScholarshipDocumentViewer();

  const scholar = dashboardData?.scholar;
  const scholarship = dashboardData?.scholarship;
  const academicPeriod = dashboardData?.academic_period;
  const application = dashboardData?.application;
  const processTimeline = useMemo(
    () => dashboardData?.process_timeline || [],
    [dashboardData?.process_timeline]
  );

  const appDocs = documentRecords?.application_documents || [];
  const renDocs = documentRecords?.renewal_documents || [];
  const initialOfficialDocs = officialDocuments?.initial_documents || [];
  const renewalOfficialDocs = officialDocuments?.renewal_documents || [];

  const renewalItem = renewalOverview?.renewal;
  const grantApp = grantOverview?.application;

  // Resolve specific grant record if navigating to historical/completed grant
  const {
    matchedRelease,
    targetCleanCode,
    isExplicitRelease,
  } = useMemo(
    () => resolveMatchedRelease(grantReleases, params),
    [grantReleases, params]
  );

  const effectiveReleaseStatus =
    matchedRelease?.release_status || (isExplicitRelease ? (params.status || "Completed") : null);

  const effectiveGrantStatus = isExplicitRelease
    ? (effectiveReleaseStatus || "Completed")
    : (grantApp?.grant_status || params.status || "Draft");

  const releaseAuthorized =
    matchedRelease?.authorized_amount ??
    grantOverview?.assessed_eligible_tuition ??
    grantOverview?.actual_tuition_grant_entitlement ??
    0;
  const releaseReleased =
    matchedRelease?.total_released_amount ?? releaseAuthorized;
  const releaseRemaining =
    matchedRelease?.remaining_amount ?? Math.max(0, releaseAuthorized - releaseReleased);
  const releaseComponents = matchedRelease?.components || [];

  let grantReqText = "—";
  if (grantApp) {
    if (grantApp.document_summary?.summary_label) {
      grantReqText = grantApp.document_summary.summary_label;
    } else if (grantApp.documents) {
      const activeDocs = grantApp.documents.filter(
        (d) => d.submission_status !== "Removed"
      );
      const requiredCount = grantApp.institution_type === "Private" ? 2 : 1;
      grantReqText = `${activeDocs.length} / ${requiredCount} Requirements Submitted`;
    }
  }

  const renewalPeriodStr = renewalOverview?.renewal_period
    ? `AY ${renewalOverview.renewal_period.academic_year} — ${renewalOverview.renewal_period.term}`
    : renewalOverview?.current_academic_period
      ? `AY ${renewalOverview.current_academic_period.academic_year} — ${renewalOverview.current_academic_period.term}`
      : "—";

  const {
    recordBadgeConfig,
    recordReference,
    recordPeriod,
    headerSubtitle,
  } = useMemo(
    () =>
      computeRecordMetadata({
        activeRecordType,
        application,
        scholar,
        scholarship,
        academicPeriod,
        params,
        effectiveGrantStatus,
        isExplicitRelease,
        matchedRelease,
        targetCleanCode,
        grantApp,
        renewalItem,
        renewalPeriodStr,
      }),
    [
      activeRecordType,
      application,
      scholar,
      scholarship,
      academicPeriod,
      params,
      effectiveGrantStatus,
      isExplicitRelease,
      matchedRelease,
      targetCleanCode,
      grantApp,
      renewalItem,
      renewalPeriodStr,
    ]
  );

  const renderGrantTab = (viewMode: "overview" | "status") => (
    <GrantPayoutTab
      grantOverview={grantOverview}
      grantOverviewLoading={grantOverviewLoading}
      grantOverviewError={grantOverviewError}
      matchedRelease={matchedRelease}
      releaseComponents={releaseComponents}
      effectiveGrantStatus={effectiveGrantStatus}
      releaseAuthorized={releaseAuthorized}
      releaseReleased={releaseReleased}
      releaseRemaining={releaseRemaining}
      isExplicitRelease={isExplicitRelease}
      targetCleanCode={targetCleanCode}
      recordReference={recordReference}
      recordPeriod={recordPeriod}
      grantReqText={grantReqText}
      scholarshipProgramName={scholarship?.program_name}
      isDarkMode={isDarkMode}
      onOpenVoucher={() =>
        router.push({
          pathname: "/education/grant/voucher",
          params: {
            release_code: matchedRelease?.release_code,
            grant_release_id: matchedRelease?.grant_release_id ? String(matchedRelease.grant_release_id) : undefined,
          },
        } as any)
      }
      onOpenApplication={() => router.push("/education/grant" as any)}
      onRetryGrantOverview={loadGrantOverview}
      viewMode={viewMode}
    />
  );

  const renderRenewalTab = (viewMode: "overview" | "status") => (
    <RenewalHistoryTab
      renewalOverview={renewalOverview}
      renewalBadgeConfig={recordBadgeConfig}
      renewalPeriodStr={renewalPeriodStr}
      recordReference={recordReference}
      scholarshipProgramName={scholarship?.program_name}
      isDarkMode={isDarkMode}
      onOpenRenewal={() => router.push("/education/renewal" as any)}
      viewMode={viewMode}
    />
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
          tintColor={isDarkMode ? "#C084FC" : "#7E22CE"}
          colors={["#7E22CE"]}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel="Back to Dashboard"
      >
        <IconSymbol
          name="chevron.left"
          size={16}
          color={isDarkMode ? "#C084FC" : "#7E22CE"}
        />
        <Text style={[styles.backText, isDarkMode && { color: "#C084FC" }]}>
          Back to Dashboard
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {error ? (
        <View
          style={[
            styles.sectionCard,
            { borderColor: "#EF4444", borderWidth: 1, padding: 16 },
          ]}
        >
          <Text
            style={{
              color: "#EF4444",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            Unable to load scholarship details.
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
              backgroundColor: "#7E22CE",
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: "flex-start",
            }}
            onPress={() => {
              setIsLoading(true);
              loadAllData();
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "600" }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={140} borderRadius={20} />
          <Skeleton height={50} borderRadius={20} />
          <Skeleton height={260} borderRadius={20} />
        </View>
      ) : (
        <>
          {/* HEADER CONTEXT CARD */}
          <HeaderContextCard
            activeRecordType={activeRecordType}
            recordBadgeConfig={recordBadgeConfig}
            programName={scholarship?.program_name}
            headerSubtitle={headerSubtitle}
            recordReference={recordReference}
            recordPeriod={recordPeriod}
            isDarkMode={isDarkMode}
          />

          {/* TAB BAR NAVIGATION */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tabsScroll}
            contentContainerStyle={styles.tabsContainer}
          >
            {(
              [
                { key: "overview", label: "Overview" },
                { key: "status", label: "Status" },
                { key: "documents", label: "Documents" },
              ] as const
            ).map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.tabBtn,
                  activeTab === tab.key && styles.tabBtnActive,
                  isDarkMode &&
                    activeTab !== tab.key && {
                      backgroundColor: "#1C2541",
                      borderColor: "#3A506B",
                    },
                ]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.tabBtnText,
                    activeTab === tab.key && styles.tabBtnTextActive,
                    isDarkMode && activeTab !== tab.key && { color: "#CBD5E1" },
                  ]}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {activeRecordType === "Application" && (
                <ApplicationStatusCard
                  application={application}
                  scholar={scholar}
                  scholarship={scholarship}
                  academicPeriod={academicPeriod}
                  isDarkMode={isDarkMode}
                  recordReference={recordReference}
                  viewMode="overview"
                />
              )}
              {activeRecordType === "Grant" && renderGrantTab("overview")}
              {activeRecordType === "Renewal" && renderRenewalTab("overview")}
            </>
          )}

          {/* TAB 2: STATUS */}
          {activeTab === "status" && (
            <View style={{ gap: 16 }}>
              {activeRecordType === "Application" && (
                <ApplicationStatusCard
                  application={application}
                  scholar={scholar}
                  scholarship={scholarship}
                  academicPeriod={academicPeriod}
                  processTimeline={processTimeline}
                  grantOverview={grantOverview}
                  latestUpdateTimestamp={dashboardData?.latest_update?.timestamp || undefined}
                  isDarkMode={isDarkMode}
                  recordReference={recordReference}
                  onWithdraw={() => loadAllData()}
                  viewMode="status"
                />
              )}
              {activeRecordType === "Grant" && renderGrantTab("status")}
              {activeRecordType === "Renewal" && renderRenewalTab("status")}
            </View>
          )}

          {/* TAB 3: DOCUMENTS */}
          {activeTab === "documents" && (
            <View style={{ gap: 16 }}>
              <ContractUndertakingTab
                initialOfficialDocs={initialOfficialDocs}
                renewalOfficialDocs={renewalOfficialDocs}
                orientation={(scholar as any)?.orientation || (dashboardData as any)?.orientation}
                actionLoadingDocKey={actionLoadingDocKey}
                handleOfficialDocAction={handleOfficialDocAction}
                isDarkMode={isDarkMode}
                activeRecordType={activeRecordType}
              />

              <ComplianceReplacementTab
                activeRecordType={activeRecordType}
                appDocs={appDocs}
                grantDocs={grantApp?.documents || []}
                renDocs={renDocs}
                actionLoadingDocKey={actionLoadingDocKey}
                handleDocumentAction={handleDocumentAction}
                isDarkMode={isDarkMode}
              />
            </View>
          )}

          {/* MODALS */}
          {renderModals(isDarkMode)}
        </>
      )}
    </ScrollView>
  );
}
