import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../styles/CitizenScholarshipDetail.styles";

export interface ComplianceReplacementTabProps {
  activeRecordType: "Application" | "Grant" | "Renewal";
  appDocs: any[];
  grantDocs?: any[];
  renDocs: any[];
  actionLoadingDocKey: string | null;
  handleDocumentAction: (
    type: "application" | "renewal" | "grant",
    id: number,
    filename: string,
    mode: "view" | "download"
  ) => void;
  onNavigateCompliance?: (type: "application" | "renewal" | "grant") => void;
  isDarkMode: boolean;
}

export function ComplianceReplacementTab({
  activeRecordType,
  appDocs,
  grantDocs = [],
  renDocs,
  actionLoadingDocKey,
  handleDocumentAction,
  onNavigateCompliance,
  isDarkMode,
}: ComplianceReplacementTabProps) {
  const router = useRouter();

  const handleComplianceRedirect = (type: "application" | "renewal" | "grant") => {
    if (onNavigateCompliance) {
      onNavigateCompliance(type);
      return;
    }
    if (type === "application") {
      router.push("/education/new-applicant/compliance" as any);
    } else if (type === "renewal") {
      router.push("/education/renewal/compliance" as any);
    } else {
      router.push("/education/grant/compliance" as any);
    }
  };

  return (
    <View style={{ gap: 16 }}>
      {/* 1. APPLICATION REQUIREMENTS */}
      {activeRecordType === "Application" && (
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
            Application Requirements
          </Text>

          {appDocs.length > 0 ? (
            appDocs.map((doc) => {
              const isNeedsReplacement =
                doc.validation_result === "Needs Replacement";
              const isReplSubmitted =
                doc.status === "Replacement Submitted";
              const viewKey = `application_${doc.document_id}_view`;
              const dlKey = `application_${doc.document_id}_download`;
              const isViewLoading = actionLoadingDocKey === viewKey;
              const isDlLoading = actionLoadingDocKey === dlKey;

              return (
                <View
                  key={doc.document_id}
                  style={[
                    styles.docCard,
                    isDarkMode && {
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                    },
                  ]}
                >
                  <View style={styles.docHeaderRow}>
                    <IconSymbol
                      name={
                        isNeedsReplacement
                          ? "exclamationmark.triangle.fill"
                          : isReplSubmitted
                            ? "clock.fill"
                            : "doc.text.fill"
                      }
                      size={20}
                      color={
                        isNeedsReplacement
                          ? "#D97706"
                          : isReplSubmitted
                            ? "#7E22CE"
                            : "#16A34A"
                      }
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.docTitle,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {doc.document_name}
                      </Text>
                      <Text
                        style={[
                          styles.docSub,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Status:{" "}
                        {isReplSubmitted
                          ? "Replacement Submitted (Awaiting Review)"
                          : doc.validation_result || doc.status}{" "}
                        • File: {doc.original_filename} (
                        {(doc.file_size / 1024).toFixed(0)} KB)
                      </Text>
                    </View>
                  </View>

                  {/* DEFICIENCY / REPLACEMENT NOTICE */}
                  {isNeedsReplacement ? (
                    <View style={styles.docWarningBox}>
                      <Text style={styles.docWarningText}>
                        ⚠ Needs Replacement —{" "}
                        {doc.review_remarks ||
                          "Secretariat requested document replacement."}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() =>
                        handleDocumentAction(
                          "application",
                          doc.document_id,
                          doc.original_filename,
                          "view"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {isViewLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="doc.text.fill"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.docActionText}>
                        {isViewLoading ? "Opening..." : "View File"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.docActionBtn,
                        { backgroundColor: "#475569" },
                      ]}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() =>
                        handleDocumentAction(
                          "application",
                          doc.document_id,
                          doc.original_filename,
                          "download"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {isDlLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="arrow.down.circle.fill"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.docActionText}>
                        {isDlLoading ? "Downloading..." : "Download"}
                      </Text>
                    </TouchableOpacity>

                    {isNeedsReplacement ? (
                      <TouchableOpacity
                        style={[
                          styles.docActionBtn,
                          { backgroundColor: "#D97706" },
                        ]}
                        onPress={() => handleComplianceRedirect("application")}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.docActionText}>
                          Action Required: Replace Document
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={14}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={[
                styles.emptyText,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              No application documents found.
            </Text>
          )}
        </View>
      )}

      {/* 2. SUBMITTED GRANT REQUIREMENTS */}
      {activeRecordType === "Grant" && (
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
            Submitted Grant Requirements
          </Text>

          {grantDocs.length > 0 ? (
            grantDocs.map((doc: any) => {
              const isNeedsReplacement =
                doc.review_status === "Needs Replacement" ||
                doc.review_status === "Invalid";
              const docName =
                doc.document_type === "COR"
                  ? "Certificate of Registration (COR)"
                  : doc.document_type === "SOA"
                    ? "Statement of Account (SOA)"
                    : doc.file_name;
              const viewKey = `grant_${doc.grant_document_id}_view`;
              const isViewLoading = actionLoadingDocKey === viewKey;

              return (
                <View
                  key={doc.grant_document_id}
                  style={[
                    styles.docCard,
                    isDarkMode && {
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                    },
                  ]}
                >
                  <View style={styles.docHeaderRow}>
                    <IconSymbol
                      name={
                        isNeedsReplacement
                          ? "exclamationmark.triangle.fill"
                          : "doc.text.fill"
                      }
                      size={20}
                      color={isNeedsReplacement ? "#D97706" : "#16A34A"}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.docTitle,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {docName}
                      </Text>
                      <Text
                        style={[
                          styles.docSub,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Status: {doc.submission_status} • Verification:{" "}
                        {doc.review_status} • File: {doc.file_name}{" "}
                        {doc.file_size
                          ? `(${(doc.file_size / 1024).toFixed(0)} KB)`
                          : ""}
                      </Text>
                    </View>
                  </View>

                  {/* DEFICIENCY / REPLACEMENT NOTICE */}
                  {isNeedsReplacement ? (
                    <View style={styles.docWarningBox}>
                      <Text style={styles.docWarningText}>
                        ⚠ Needs Replacement — Coordinator noted requirement
                        deficiencies.
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() =>
                        handleDocumentAction(
                          "grant",
                          doc.grant_document_id,
                          doc.file_name,
                          "view"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {isViewLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="doc.text.fill"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.docActionText}>
                        {isViewLoading ? "Opening..." : "View File"}
                      </Text>
                    </TouchableOpacity>

                    {isNeedsReplacement ? (
                      <TouchableOpacity
                        style={[
                          styles.docActionBtn,
                          { backgroundColor: "#D97706" },
                        ]}
                        onPress={() => handleComplianceRedirect("grant")}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.docActionText}>
                          Action Required: Replace Document
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={14}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={[
                styles.emptyText,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              No grant requirement documents recorded.
            </Text>
          )}
        </View>
      )}

      {/* 3. SUBMITTED RENEWAL REQUIREMENTS */}
      {activeRecordType === "Renewal" && (
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
            Submitted Renewal Requirements (COR / COG / SOA)
          </Text>

          {renDocs.length > 0 ? (
            renDocs.map((doc) => {
              const isNeedsReplacement =
                doc.validation_status === "Needs Replacement";
              const viewKey = `renewal_${doc.renewal_document_id}_view`;
              const dlKey = `renewal_${doc.renewal_document_id}_download`;
              const isViewLoading = actionLoadingDocKey === viewKey;
              const isDlLoading = actionLoadingDocKey === dlKey;

              return (
                <View
                  key={doc.renewal_document_id}
                  style={[
                    styles.docCard,
                    isDarkMode && {
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                    },
                  ]}
                >
                  <View style={styles.docHeaderRow}>
                    <IconSymbol
                      name={
                        isNeedsReplacement
                          ? "exclamationmark.triangle.fill"
                          : "doc.text.fill"
                      }
                      size={20}
                      color={isNeedsReplacement ? "#D97706" : "#16A34A"}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.docTitle,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {doc.document_name}
                      </Text>
                      <Text
                        style={[
                          styles.docSub,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Status: {doc.validation_status} • File:{" "}
                        {doc.original_filename} (
                        {(doc.file_size / 1024).toFixed(0)} KB)
                      </Text>
                    </View>
                  </View>

                  {/* DEFICIENCY / REPLACEMENT NOTICE */}
                  {isNeedsReplacement ? (
                    <View style={styles.docWarningBox}>
                      <Text style={styles.docWarningText}>
                        ⚠ Needs Replacement —{" "}
                        {doc.review_remarks ||
                          "Coordinator requested document replacement."}
                      </Text>
                    </View>
                  ) : null}

                  <View
                    style={{
                      flexDirection: "row",
                      flexWrap: "wrap",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <TouchableOpacity
                      style={styles.docActionBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() =>
                        handleDocumentAction(
                          "renewal",
                          doc.renewal_document_id,
                          doc.original_filename,
                          "view"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {isViewLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="doc.text.fill"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.docActionText}>
                        {isViewLoading ? "Opening..." : "View File"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.docActionBtn,
                        { backgroundColor: "#475569" },
                      ]}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() =>
                        handleDocumentAction(
                          "renewal",
                          doc.renewal_document_id,
                          doc.original_filename,
                          "download"
                        )
                      }
                      activeOpacity={0.8}
                    >
                      {isDlLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <IconSymbol
                          name="arrow.down.circle.fill"
                          size={14}
                          color="#FFFFFF"
                        />
                      )}
                      <Text style={styles.docActionText}>
                        {isDlLoading ? "Downloading..." : "Download"}
                      </Text>
                    </TouchableOpacity>

                    {isNeedsReplacement ? (
                      <TouchableOpacity
                        style={[
                          styles.docActionBtn,
                          { backgroundColor: "#D97706" },
                        ]}
                        onPress={() => handleComplianceRedirect("renewal")}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.docActionText}>
                          Action Required: Replace Document
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={14}
                          color="#FFFFFF"
                        />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                </View>
              );
            })
          ) : (
            <Text
              style={[
                styles.emptyText,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              No renewal documents found.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
