import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "@/src/features/education/styles/DistributionSchedule.styles";

export default function DistributionRoute() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const [isQrModalVisible, setIsQrModalVisible] = useState(false);

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
          tintColor={isDarkMode ? "#FB923C" : "#EA580C"}
          colors={["#EA580C"]}
        />
      }
    >
      {/* BACK BUTTON (Copied from Dashboard design) */}
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
        <Text
          style={[
            styles.backText,
            isDarkMode && {
              color: "#FB923C",
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
          Distribution Schedule
        </Text>
      </View>

      {/* SKELETON LOADING OR CONTENT */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          {/* MAIN CARD SKELETON */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 12,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Skeleton width={48} height={48} borderRadius={24} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={160}
                  height={20}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={220} height={14} borderRadius={4} />
              </View>
            </View>
            <View
              style={{
                borderRadius: 14,
                borderWidth: 1,
                borderColor: isDarkMode ? "#293548" : "#F1F5F9",
                padding: 12,
                gap: 12,
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Skeleton width={100} height={16} borderRadius={4} />
                  <Skeleton width={130} height={16} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>

          {/* REQUIREMENTS & QR SKELETON */}
          <View
            style={[
              styles.reqCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={{ flexDirection: "row", gap: 14 }}>
              <View style={{ flex: 1, gap: 10 }}>
                <Skeleton width={150} height={18} borderRadius={6} />
                <Skeleton width="100%" height={14} borderRadius={4} />
                <Skeleton width="90%" height={14} borderRadius={4} />
                <Skeleton width="95%" height={14} borderRadius={4} />
              </View>
              <Skeleton width={120} height={110} borderRadius={16} />
            </View>
          </View>
        </View>
      ) : (
        <>

      {/* CARD 1: FACE-TO-FACE DISTRIBUTION DETAILS */}
      <View
        style={[
          styles.card,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
      >
        <View style={styles.cardTopHeader}>
          <View
            style={[
              styles.topIconCircle,
              isDarkMode && { backgroundColor: "#064E3B" },
            ]}
          >
            <IconSymbol
              name="person.2.fill"
              size={22}
              color={isDarkMode ? "#34D399" : "#16A34A"}
            />
          </View>
          <View style={styles.topHeaderText}>
            <Text
              style={[
                styles.topHeaderTitle,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Face-to-Face Distribution
            </Text>
            <Text
              style={[
                styles.topHeaderSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Please arrive on time and bring the required items.
            </Text>
          </View>
        </View>

        {/* DETAILS TABLE */}
        <View
          style={[
            styles.tableContainer,
            isDarkMode && { borderColor: "#293548" },
          ]}
        >
          {/* Grant Period */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="calendar"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Grant Period
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              AY 2026–2027 • 1st Semester
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Amount */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="creditcard.fill"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Amount
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              ₱8,000.00
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Date */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="calendar"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Date
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              August 28, 2026
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Time */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="clock.fill"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Time
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              9:00 AM – 12:00 PM
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Venue */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="location.fill"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Venue
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Caloocan City Hall
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Assigned Area */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="building.2.fill"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Assigned Area
              </Text>
            </View>
            <Text
              style={[
                styles.rowValue,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              District 1
            </Text>
          </View>

          <View
            style={[
              styles.tableDivider,
              isDarkMode && { backgroundColor: "#293548" },
            ]}
          />

          {/* Claim Status */}
          <View style={styles.tableRow}>
            <View style={styles.rowLeft}>
              <IconSymbol
                name="shield.fill"
                size={16}
                color={isDarkMode ? "#38BDF8" : "#0284C7"}
              />
              <Text
                style={[
                  styles.rowLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Claim Status
              </Text>
            </View>
            <View
              style={[
                styles.statusPill,
                isDarkMode && { backgroundColor: "#064E3B" },
              ]}
            >
              <IconSymbol
                name="checkmark.circle.fill"
                size={14}
                color={isDarkMode ? "#34D399" : "#16A34A"}
              />
              <Text
                style={[
                  styles.statusPillText,
                  isDarkMode && { color: "#34D399" },
                ]}
              >
                Scheduled
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* CARD 2: REQUIREMENTS TO BRING & QR CODE */}
      <View
        style={[
          styles.reqCard,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
      >
        <View style={styles.reqGrid}>
          {/* Left Column: Requirements List */}
          <View style={styles.reqLeftCol}>
            <View style={styles.reqHeaderRow}>
              <View
                style={[
                  styles.reqIconCircle,
                  isDarkMode && { backgroundColor: "#064E3B" },
                ]}
              >
                <IconSymbol
                  name="clipboard"
                  size={18}
                  color={isDarkMode ? "#34D399" : "#16A34A"}
                />
              </View>
              <Text
                style={[
                  styles.reqTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Requirements to Bring
              </Text>
            </View>

            <View style={styles.reqList}>
              <View style={styles.reqItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={15}
                  color={isDarkMode ? "#34D399" : "#16A34A"}
                />
                <Text
                  style={[
                    styles.reqText,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Scholar ID / valid ID
                </Text>
              </View>

              <View style={styles.reqItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={15}
                  color={isDarkMode ? "#34D399" : "#16A34A"}
                />
                <Text
                  style={[
                    styles.reqText,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Claim reference or QR code
                </Text>
              </View>

              <View style={styles.reqItem}>
                <IconSymbol
                  name="checkmark.circle.fill"
                  size={15}
                  color={isDarkMode ? "#34D399" : "#16A34A"}
                />
                <Text
                  style={[
                    styles.reqText,
                    isDarkMode && { color: "#CBD5E1" },
                  ]}
                >
                  Any actual claiming requirement set by the office
                </Text>
              </View>
            </View>
          </View>

          {/* Right Column: QR Code Box (Clickable) */}
          <TouchableOpacity
            style={[
              styles.qrBox,
              isDarkMode && {
                backgroundColor: "#064E3B",
                borderColor: "#059669",
              },
            ]}
            onPress={() => setIsQrModalVisible(true)}
            activeOpacity={0.75}
          >
            <View style={styles.qrIconBox}>
              <IconSymbol
                name="qrcode"
                size={70}
                color={isDarkMode ? "#34D399" : "#16A34A"}
              />
            </View>
            <Text
              style={[
                styles.qrRefText,
                isDarkMode && { color: "#A7F3D0" },
              ]}
            >
              REF-2026-00125
            </Text>
            <Text
              style={[
                styles.qrTapHint,
                isDarkMode && { color: "#A7F3D0" },
              ]}
            >
              Tap to expand
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR ENLARGED CLAIM PASS MODAL */}
      <Modal
        visible={isQrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsQrModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsQrModalVisible(false)}
        >
          <View
            style={[
              styles.modalCard,
              isDarkMode && {
                backgroundColor: "#1C2541",
                borderColor: "#3A506B",
              },
            ]}
          >
            <View style={styles.modalHeaderRow}>
              <View
                style={[
                  styles.modalShieldIcon,
                  isDarkMode && { backgroundColor: "#064E3B" },
                ]}
              >
                <IconSymbol
                  name="shield.fill"
                  size={18}
                  color={isDarkMode ? "#34D399" : "#16A34A"}
                />
              </View>
              <Text
                style={[
                  styles.modalTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Official Claim Pass
              </Text>
              <TouchableOpacity
                onPress={() => setIsQrModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text
                  style={[
                    styles.modalCloseX,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={[
                styles.modalSub,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              Present this QR code to the distribution officer at Caloocan City Hall.
            </Text>

            <View
              style={[
                styles.modalQrContainer,
                isDarkMode && {
                  backgroundColor: "#064E3B",
                  borderColor: "#059669",
                },
              ]}
            >
              <IconSymbol
                name="qrcode"
                size={170}
                color={isDarkMode ? "#34D399" : "#16A34A"}
              />
              <Text
                style={[
                  styles.modalRefCode,
                  isDarkMode && { color: "#A7F3D0" },
                ]}
              >
                REF-2026-00125
              </Text>
            </View>

            <View
              style={[
                styles.modalDetailBox,
                isDarkMode && { backgroundColor: "#0F172A" },
              ]}
            >
              <Text
                style={[
                  styles.modalDetailLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Scholar ID:{" "}
                <Text
                  style={{
                    fontWeight: "700",
                    color: isDarkMode ? "#F8FAFC" : "#0F172A",
                  }}
                >
                  SCH-2026-00125
                </Text>
              </Text>

              <Text
                style={[
                  styles.modalDetailLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Grant Amount:{" "}
                <Text
                  style={{
                    fontWeight: "700",
                    color: isDarkMode ? "#34D399" : "#16A34A",
                  }}
                >
                  ₱8,000.00
                </Text>
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setIsQrModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalCloseBtnText}>Close Pass</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ACTION 1: VIEW LOCATION */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.actionIconCircle,
            { backgroundColor: isDarkMode ? "#0F2942" : "#E0F2FE" },
          ]}
        >
          <IconSymbol
            name="location.fill"
            size={20}
            color={isDarkMode ? "#38BDF8" : "#0284C7"}
          />
        </View>

        <View style={styles.actionContent}>
          <Text
            style={[
              styles.actionTitle,
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            View Location
          </Text>
          <Text
            style={[
              styles.actionSub,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            See the exact location on the map
          </Text>
        </View>

        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? "#64748B" : "#94A3B8"}
        />
      </TouchableOpacity>

      {/* ACTION 2: DISTRIBUTION HISTORY */}
      <TouchableOpacity
        style={[
          styles.actionBtn,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.actionIconCircle,
            { backgroundColor: isDarkMode ? "#3B0764" : "#F3E8FF" },
          ]}
        >
          <IconSymbol
            name="history"
            size={20}
            color={isDarkMode ? "#C084FC" : "#7E22CE"}
          />
        </View>

        <View style={styles.actionContent}>
          <Text
            style={[
              styles.actionTitle,
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            Distribution History
          </Text>
          <Text
            style={[
              styles.actionSub,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            View your past releases and claims
          </Text>
        </View>

        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? "#64748B" : "#94A3B8"}
        />
      </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}
