import React from "react";
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { formatDate } from "@/utils/dateUtils";
import { CitizenOfficialDocumentItem } from "../api/citizenDocumentApi";
import { styles } from "../styles/CitizenScholarshipDetail.styles";

export interface ContractUndertakingTabProps {
  initialOfficialDocs: CitizenOfficialDocumentItem[];
  renewalOfficialDocs: CitizenOfficialDocumentItem[];
  orientation?: {
    scheduled_date?: string | null;
    scheduled_time?: string | null;
    venue?: string | null;
    status?: string | null;
  } | null;
  actionLoadingDocKey: string | null;
  handleOfficialDocAction: (
    doc: CitizenOfficialDocumentItem,
    mode: "view" | "download"
  ) => void;
  isDarkMode: boolean;
  activeRecordType?: "Application" | "Grant" | "Renewal";
}

export function ContractUndertakingTab({
  initialOfficialDocs,
  renewalOfficialDocs,
  orientation,
  actionLoadingDocKey,
  handleOfficialDocAction,
  isDarkMode,
  activeRecordType = "Application",
}: ContractUndertakingTabProps) {
  const showInitial =
    activeRecordType === "Application" ||
    (activeRecordType !== "Renewal" && initialOfficialDocs.length > 0);
  const showRenewal =
    activeRecordType === "Renewal" ||
    (activeRecordType !== "Application" && renewalOfficialDocs.length > 0);

  return (
    <View style={{ gap: 16 }}>
      {/* ORIENTATION SESSION ASSIGNMENT CARD */}
      {orientation && (
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: isDarkMode ? "#1E293B" : "#F0FDF4",
              borderColor: isDarkMode ? "#059669" : "#BBF7D0",
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
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="calendar" size={18} color="#16A34A" />
              <Text
                style={[
                  styles.sectionTitle,
                  {
                    color: isDarkMode ? "#4ADE80" : "#15803D",
                    marginBottom: 0,
                    fontSize: 15,
                  },
                ]}
              >
                Scholar Orientation Session
              </Text>
            </View>
            <Badge
              label={orientation.status || "Scheduled"}
              variant="success"
            />
          </View>

          <Text
            style={{
              fontSize: 12,
              color: isDarkMode ? "#CBD5E1" : "#334155",
              marginBottom: 12,
              lineHeight: 18,
            }}
          >
            Admitted scholars must complete the mandatory general orientation
            and agreement signing session before grant release.
          </Text>

          <View style={styles.infoGrid}>
            {orientation.scheduled_date ? (
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}
                >
                  Session Date
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      fontWeight: "700",
                      color: isDarkMode ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                >
                  {formatDate(orientation.scheduled_date, "TBA")}
                </Text>
              </View>
            ) : null}

            {orientation.scheduled_time ? (
              <View style={styles.infoRow}>
                <Text
                  style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}
                >
                  Session Time
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      fontWeight: "700",
                      color: isDarkMode ? "#F8FAFC" : "#0F172A",
                    },
                  ]}
                >
                  {orientation.scheduled_time}
                </Text>
              </View>
            ) : null}

            {orientation.venue ? (
              <View style={styles.infoRowStacked}>
                <Text
                  style={[styles.infoLabel, isDarkMode && { color: "#94A3B8" }]}
                >
                  Designated Venue
                </Text>
                <Text
                  style={[
                    styles.infoValueStacked,
                    { color: isDarkMode ? "#38BDF8" : "#0284C7" },
                  ]}
                >
                  {orientation.venue}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      {/* INITIAL OFFICIAL CERTIFICATES & CONTRACTS */}
      {showInitial && initialOfficialDocs.length > 0 && (
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
            Initial Official Certificates & Contracts
          </Text>
          <View style={{ gap: 12 }}>
            {initialOfficialDocs.map((doc) => {
              const viewKey = `${doc.type}_${doc.id}_view`;
              const dlKey = `${doc.type}_${doc.id}_download`;
              const isViewLoading = actionLoadingDocKey === viewKey;
              const isDlLoading = actionLoadingDocKey === dlKey;

              return (
                <View
                  key={`${doc.type}_${doc.id}`}
                  style={[
                    styles.certCard,
                    isDarkMode && {
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                    },
                  ]}
                >
                  <View style={styles.certHeader}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color="#16A34A"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.certTitle,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {doc.title}
                      </Text>
                      <Text
                        style={[
                          styles.certSub,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        {doc.document_number} • Status: {doc.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    <View style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Date
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {formatDate(doc.date, "—")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.certBtnRow}>
                    <TouchableOpacity
                      style={styles.certPrimaryBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOfficialDocAction(doc, "view")}
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
                      <Text style={styles.certPrimaryBtnText}>
                        {isViewLoading ? "Opening..." : "View"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.certPrimaryBtn,
                        { backgroundColor: "#475569" },
                      ]}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOfficialDocAction(doc, "download")}
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
                      <Text style={styles.certPrimaryBtnText}>
                        {isDlLoading ? "Downloading..." : "Download"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* RENEWAL OFFICIAL CERTIFICATES & CONTRACTS */}
      {showRenewal && renewalOfficialDocs.length > 0 && (
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
            Renewal Official Documents & Certificates
          </Text>
          <View style={{ gap: 12 }}>
            {renewalOfficialDocs.map((doc) => {
              const viewKey = `${doc.type}_${doc.id}_view`;
              const dlKey = `${doc.type}_${doc.id}_download`;
              const isViewLoading = actionLoadingDocKey === viewKey;
              const isDlLoading = actionLoadingDocKey === dlKey;

              return (
                <View
                  key={`${doc.type}_${doc.id}`}
                  style={[
                    styles.certCard,
                    isDarkMode && {
                      backgroundColor: "#111827",
                      borderColor: "#374151",
                    },
                  ]}
                >
                  <View style={styles.certHeader}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color="#7E22CE"
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.certTitle,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {doc.title}
                      </Text>
                      <Text
                        style={[
                          styles.certSub,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        {doc.document_number} • Status: {doc.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoGrid}>
                    {doc.period ? (
                      <View style={styles.infoRow}>
                        <Text
                          style={[
                            styles.infoLabel,
                            isDarkMode && { color: "#94A3B8" },
                          ]}
                        >
                          Period
                        </Text>
                        <Text
                          style={[
                            styles.infoValue,
                            isDarkMode && { color: "#F8FAFC" },
                          ]}
                        >
                          {doc.period}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.infoRow}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDarkMode && { color: "#94A3B8" },
                        ]}
                      >
                        Date
                      </Text>
                      <Text
                        style={[
                          styles.infoValue,
                          isDarkMode && { color: "#F8FAFC" },
                        ]}
                      >
                        {formatDate(doc.date, "—")}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.certBtnRow}>
                    <TouchableOpacity
                      style={styles.certPrimaryBtn}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOfficialDocAction(doc, "view")}
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
                      <Text style={styles.certPrimaryBtnText}>
                        {isViewLoading ? "Opening..." : "View"}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.certPrimaryBtn,
                        { backgroundColor: "#475569" },
                      ]}
                      disabled={Boolean(actionLoadingDocKey)}
                      onPress={() => handleOfficialDocAction(doc, "download")}
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
                      <Text style={styles.certPrimaryBtnText}>
                        {isDlLoading ? "Downloading..." : "Download"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* EMPTY FALLBACK IF NO OFFICIAL DOCUMENTS */}
      {initialOfficialDocs.length === 0 && renewalOfficialDocs.length === 0 && !orientation && (
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
            Official Undertakings & Contracts
          </Text>
          <Text
            style={[
              styles.emptyText,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            No official scholarship contracts or signed undertakings currently issued.
          </Text>
        </View>
      )}
    </View>
  );
}
