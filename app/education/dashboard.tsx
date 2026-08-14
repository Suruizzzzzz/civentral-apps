import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

const scholarshipBg = require("@/assets/images/scholarship-bg.png");
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "@/src/features/education/styles/ScholarshipDashboard.styles";

export default function ScholarshipDashboardRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

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
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? "#C084FC" : "#7E22CE"}
          style={styles.backIcon}
        />
        <Text
          style={[
            styles.backText,
            isDarkMode && {
              color: "#C084FC",
            },
          ]}
        >
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* PAGE HEADER */}
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            isDarkMode && {
              color: "#F8FAFC",
            },
          ]}
        >
          Scholarship Dashboard
        </Text>
      </View>

      {/* SKELETON LOADING OR CONTENT */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          {/* HERO CARD SKELETON */}
          <View
            style={[
              styles.heroCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
              { padding: 18 },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 16,
              }}
            >
              <View style={{ flex: 1, paddingRight: 12 }}>
                <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
                  <Skeleton width={38} height={38} borderRadius={19} />
                  <Skeleton width={110} height={24} borderRadius={12} />
                </View>
                <Skeleton
                  width="80%"
                  height={22}
                  borderRadius={6}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton width="95%" height={14} borderRadius={4} />
              </View>
              <Skeleton width={110} height={100} borderRadius={16} />
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: isDarkMode ? "#293548" : "#F1F5F9",
                marginVertical: 12,
              }}
            />
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={60}
                  height={12}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={80} height={16} borderRadius={4} />
              </View>
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={60}
                  height={12}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={80} height={16} borderRadius={4} />
              </View>
              <View style={{ flex: 1.2 }}>
                <Skeleton
                  width={60}
                  height={12}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={100} height={16} borderRadius={4} />
              </View>
            </View>
          </View>

          {/* PROCESS STATUS CARD SKELETON */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <Skeleton
              width={120}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 16 }}
            />
            {[1, 2, 3, 4].map((item) => (
              <View
                key={item}
                style={{ flexDirection: "row", gap: 12, marginBottom: 14 }}
              >
                <Skeleton width={22} height={22} borderRadius={11} />
                <View style={{ flex: 1 }}>
                  <Skeleton
                    width="60%"
                    height={16}
                    borderRadius={4}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width="40%" height={12} borderRadius={4} />
                </View>
              </View>
            ))}
            <Skeleton
              width="100%"
              height={40}
              borderRadius={12}
              style={{ marginTop: 8 }}
            />
          </View>

          {/* CURRENT GRANT CARD SKELETON */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <Skeleton
              width={110}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 16 }}
            />
            <View
              style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
            >
              <Skeleton width={44} height={44} borderRadius={22} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={120}
                  height={24}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={160} height={14} borderRadius={4} />
              </View>
            </View>
          </View>
        </View>
      ) : (
        <>

      {/* TOP HERO SCHOLARSHIP CARD */}
      <View
        style={[
          styles.heroCard,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
      >
        <View style={styles.heroTopSection}>
          <View style={styles.heroLeftContent}>
            <View style={styles.heroHeaderRow}>
              <View
                style={[
                  styles.iconCircle,
                  isDarkMode && { backgroundColor: "#3B0764" },
                ]}
              >
                <IconSymbol
                  name="book.closed.fill"
                  size={20}
                  color={isDarkMode ? "#C084FC" : "#7E22CE"}
                />
              </View>

              <View
                style={[
                  styles.activeBadge,
                  isDarkMode && { backgroundColor: "#064E3B" },
                ]}
              >
                <Text
                  style={[
                    styles.activeBadgeText,
                    isDarkMode && { color: "#34D399" },
                  ]}
                >
                  ACTIVE SCHOLAR
                </Text>
              </View>
            </View>

            <Text
              style={[
                styles.heroTitle,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Tertiary College Scholarship
            </Text>
            <Text
              style={[
                styles.heroSubtitle,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              City Government Educational Scholarship Program
            </Text>
          </View>

          {/* Minimalist Artwork Container */}
          <View
            style={[
              styles.heroArtworkBox,
              isDarkMode && { backgroundColor: "#2D1557" },
            ]}
          >
            <Image
              source={scholarshipBg}
              style={styles.heroArtwork}
              resizeMode="contain"
            />
          </View>
        </View>

        <View
          style={[
            styles.heroDivider,
            isDarkMode && { backgroundColor: "#293548" },
          ]}
        />

        {/* DETAILS ROW: ACADEMIC YEAR, SEMESTER, SCHOLAR ID */}
        <View
          style={[
            styles.heroBottomRow,
            isDarkMode && { backgroundColor: "#1C2541" },
          ]}
        >
          <View style={styles.heroCol}>
            <Text style={styles.heroColLabel}>Academic Year</Text>
            <Text
              style={[
                styles.heroColValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
              numberOfLines={1}
            >
              2026–2027
            </Text>
          </View>

          <View
            style={[
              styles.heroColDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          <View style={styles.heroCol}>
            <Text style={styles.heroColLabel}>Semester</Text>
            <Text
              style={[
                styles.heroColValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
              numberOfLines={1}
            >
              1st Semester
            </Text>
          </View>

          <View
            style={[
              styles.heroColDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          <View style={styles.heroColScholarId}>
            <Text style={styles.heroColLabel}>Scholar ID</Text>
            <Text
              style={[
                styles.heroColValue,
                styles.scholarIdText,
                isDarkMode && { color: "#C084FC" },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              SCH-2026-00125
            </Text>
          </View>
        </View>
      </View>

      {/* MAIN GRID OF CARDS */}
      <View style={styles.cardsGrid}>
        {/* 1. PROCESS STATUS CARD */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionLabel,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            PROCESS STATUS
          </Text>

          {/* TIMELINE STEPS */}
          <View style={styles.timelineContainer}>
            {/* Step 1: Application Submitted */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIconBox,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color="#16A34A"
                  />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    styles.timelineLineCompleted,
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Application Submitted
                </Text>
                <Text style={styles.timelineSub}>June 15, 2026</Text>
              </View>
            </View>

            {/* Step 2: Under Review */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIconBox,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color="#16A34A"
                  />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    styles.timelineLineCompleted,
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Under Review
                </Text>
                <Text style={styles.timelineSub}>June 20, 2026</Text>
              </View>
            </View>

            {/* Step 3: Scholarship Approved */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIconBox,
                    { backgroundColor: "#DCFCE7" },
                  ]}
                >
                  <IconSymbol
                    name="checkmark.circle.fill"
                    size={18}
                    color="#16A34A"
                  />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    styles.timelineLineCompleted,
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Scholarship Approved
                </Text>
                <Text style={styles.timelineSub}>July 10, 2026</Text>
              </View>
            </View>

            {/* Step 4: Grant Processing (Active) */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIconBox,
                    { backgroundColor: "#FEF3C7" },
                  ]}
                >
                  <IconSymbol name="circle.fill" size={14} color="#D97706" />
                </View>
                <View style={styles.timelineLine} />
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Grant Processing
                </Text>
                <Text
                  style={[styles.timelineSub, styles.timelineSubActive]}
                >
                  In Progress
                </Text>
              </View>
            </View>

            {/* Step 5: Grant Released (Pending) */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <View
                  style={[
                    styles.timelineIconBox,
                    { backgroundColor: "#F1F5F9" },
                  ]}
                >
                  <IconSymbol name="circle" size={14} color="#94A3B8" />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <Text
                  style={[
                    styles.timelineTitle,
                    { color: "#94A3B8" },
                    isDarkMode && { color: "#64748B" },
                  ]}
                >
                  Grant Released
                </Text>
                <Text
                  style={[styles.timelineSub, styles.timelineSubPending]}
                >
                  Pending
                </Text>
              </View>
            </View>
          </View>

          {/* CURRENT STATUS BANNER */}
          <View
            style={[
              styles.statusBanner,
              isDarkMode && {
                backgroundColor: "#451A03",
                borderColor: "#78350F",
              },
            ]}
          >
            <Text
              style={[
                styles.statusBannerText,
                isDarkMode && { color: "#FDE68A" },
              ]}
            >
              Current Status:{" "}
              <Text style={styles.statusBannerHighlight}>Processing</Text>
            </Text>
          </View>
        </View>

        {/* 3. CURRENT GRANT CARD */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionLabel,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            CURRENT GRANT
          </Text>

          <View style={styles.grantHeaderRow}>
            <View
              style={[
                styles.grantIconCircle,
                isDarkMode && { backgroundColor: "#3B0764" },
              ]}
            >
              <IconSymbol
                name="wallet.pass.fill"
                size={24}
                color={isDarkMode ? "#C084FC" : "#7E22CE"}
              />
            </View>

            <View style={{ flex: 1 }}>
              <View style={styles.grantAmountRow}>
                <Text
                  style={[
                    styles.grantAmountText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  ₱8,000
                </Text>

                <View
                  style={[
                    styles.processingPill,
                    isDarkMode && { backgroundColor: "#451A03" },
                  ]}
                >
                  <Text
                    style={[
                      styles.processingPillText,
                      isDarkMode && { color: "#FBBF24" },
                    ]}
                  >
                    PROCESSING
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.grantReleaseText,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Expected Release{" "}
                <Text
                  style={[
                    styles.grantReleaseValue,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  August 28, 2026
                </Text>
              </Text>
            </View>
          </View>
        </View>

        {/* 4. LATEST UPDATES CARD */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <Text
            style={[
              styles.sectionLabel,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            LATEST UPDATES
          </Text>

          <View style={styles.updateRow}>
            <View
              style={[
                styles.updateIconCircle,
                isDarkMode && { backgroundColor: "#3B0764" },
              ]}
            >
              <IconSymbol
                name="megaphone.fill"
                size={22}
                color={isDarkMode ? "#C084FC" : "#7E22CE"}
              />
            </View>

            <View style={styles.updateContent}>
              <Text
                style={[
                  styles.updateTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Grant processing is ongoing
              </Text>

              <Text
                style={[
                  styles.updateBody,
                  isDarkMode && { color: "#CBD5E1" },
                ]}
              >
                Your scholarship grant is currently being processed. Please
                ensure your bank details are correct and up to date.
              </Text>

              <View style={styles.updateFooter}>
                <IconSymbol
                  name="calendar"
                  size={13}
                  color={isDarkMode ? "#64748B" : "#94A3B8"}
                />
                <Text
                  style={[
                    styles.updateDateText,
                    isDarkMode && { color: "#64748B" },
                  ]}
                >
                  July 15, 2026 • 10:30 AM
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    </>
  )}
</ScrollView>
);
}


