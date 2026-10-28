import React from "react";
import { Text, View } from "react-native";
import { Badge } from "@/src/components/ui/Badge";
import { elevatedCard } from "@/src/styles";
import { styles } from "../styles/CitizenScholarshipDetail.styles";
import { BadgeConfig } from "./detailHelpers";

export interface HeaderContextCardProps {
  activeRecordType: "Application" | "Grant" | "Renewal";
  recordBadgeConfig: BadgeConfig;
  programName?: string;
  headerSubtitle: string;
  recordReference: string;
  recordPeriod: string;
  isDarkMode: boolean;
}

export function HeaderContextCard({
  activeRecordType,
  recordBadgeConfig,
  programName,
  headerSubtitle,
  recordReference,
  recordPeriod,
  isDarkMode,
}: HeaderContextCardProps) {
  return (
    <View
      style={[
        elevatedCard,
        styles.headerCard,
        isDarkMode && {
          backgroundColor: "#1C2541",
          borderColor: "#3A506B",
        },
      ]}
    >
      <View style={styles.headerTopRow}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: isDarkMode ? "#C084FC" : "#7E22CE",
          }}
        >
          {activeRecordType.toUpperCase()} RECORD
        </Text>
        <Badge
          label={recordBadgeConfig.label}
          variant={recordBadgeConfig.variant}
        />
      </View>

      <Text
        style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}
      >
        {programName || "Academic Scholarship Program"}
      </Text>
      <Text
        style={[styles.headerSub, isDarkMode && { color: "#CBD5E1" }]}
      >
        {headerSubtitle}
      </Text>

      <View
        style={[
          styles.headerMetaRow,
          isDarkMode && { backgroundColor: "#111827" },
        ]}
      >
        <View style={styles.headerMetaCol}>
          <Text style={styles.headerMetaLabel}>
            {activeRecordType === "Grant"
              ? "Grant Reference"
              : activeRecordType === "Renewal"
                ? "Renewal Reference"
                : "Scholar / App ID"}
          </Text>
          <Text style={styles.headerMetaCode}>{recordReference}</Text>
        </View>

        <View style={styles.headerMetaCol}>
          <Text style={styles.headerMetaLabel}>Academic Period</Text>
          <Text
            style={[
              styles.headerMetaVal,
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            {recordPeriod}
          </Text>
        </View>
      </View>
    </View>
  );
}
