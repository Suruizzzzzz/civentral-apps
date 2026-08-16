import { ResizeMode, Video } from "expo-av";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const videoLight = require("@/assets/images/video-light-robot.mp4");
const videoDark = require("@/assets/images/video-dark-robot.mp4");
const puzzleLight = require("@/assets/images/puzzle.png");
const puzzleDark = require("@/assets/images/puzzle-dark.png");
const browseLight = require("@/assets/images/browse.png");
const browseDark = require("@/assets/images/browse-dark.png");

import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { Skeleton } from "@/src/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "@/src/features/education/styles/NewApplicant.styles";

export default function NewApplicantRoute() {
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
          tintColor={isDarkMode ? "#38BDF8" : "#2563EB"}
          colors={["#2563EB"]}
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
          color={isDarkMode ? "#38BDF8" : "#2563EB"}
          style={styles.backIcon}
        />
        <Text
          style={[
            styles.backText,
            isDarkMode && {
              color: "#38BDF8",
            },
          ]}
        >
          Back to Education Hub
        </Text>
      </TouchableOpacity>

      {/* SKELETON LOADING OR CONTENT */}
      {isLoading ? (
        <View style={{ gap: 16 }}>
          {/* HEADER SKELETON */}
          <View
            style={[
              styles.headerCard,
              isDarkMode && {
                backgroundColor: "#01091D",
                borderColor: "#0D213F",
              },
            ]}
          >
            <View style={{ flex: 1, paddingRight: 12 }}>
              <Skeleton
                width="80%"
                height={26}
                borderRadius={6}
                style={{ marginBottom: 8 }}
              />
              <Skeleton width="95%" height={16} borderRadius={4} />
            </View>
            <Skeleton width={110} height={110} borderRadius={20} />
          </View>

          {/* CARD 1 SKELETON */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#031731",
                borderColor: "#0E2D56",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Skeleton width={100} height={100} borderRadius={16} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width={100}
                  height={20}
                  borderRadius={10}
                  style={{ marginBottom: 8 }}
                />
                <Skeleton
                  width="90%"
                  height={20}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width="100%" height={14} borderRadius={4} />
              </View>
            </View>
            <View
              style={{
                flexDirection: "column",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? "#0D274A" : "#F1F5F9",
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <Skeleton width={90} height={24} borderRadius={12} />
                <Skeleton width={80} height={24} borderRadius={12} />
              </View>
              <Skeleton width="100%" height={40} borderRadius={20} />
            </View>
          </View>

          {/* CARD 2 SKELETON */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#03132A",
                borderColor: "#0B264A",
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Skeleton width={100} height={100} borderRadius={16} />
              <View style={{ flex: 1 }}>
                <Skeleton
                  width="85%"
                  height={20}
                  borderRadius={6}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width="100%" height={14} borderRadius={4} />
              </View>
            </View>
            <View
              style={{
                flexDirection: "column",
                paddingTop: 12,
                borderTopWidth: 1,
                borderTopColor: isDarkMode ? "#0A2242" : "#F1F5F9",
              }}
            >
              <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
                <Skeleton width={80} height={24} borderRadius={12} />
                <Skeleton width={90} height={24} borderRadius={12} />
              </View>
              <Skeleton width="100%" height={40} borderRadius={20} />
            </View>
          </View>
        </View>
      ) : (
        <>
          {/* HERO HEADER CARD (ROBOT ARTWORK) */}
          <View
            style={[
              styles.headerCard,
              isDarkMode && {
                backgroundColor: "#01091D",
                borderColor: "#0D213F",
              },
            ]}
          >
            <View style={styles.headerContent}>
              <Text
                style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}
              >
                New Scholarship Application
              </Text>
              <Text
                style={[styles.headerSub, isDarkMode && { color: "#CBD5E1" }]}
              >
                How would you like to find a scholarship?
              </Text>
            </View>

            <Video
              source={isDarkMode ? videoDark : videoLight}
              style={styles.robotArtwork}
              resizeMode={ResizeMode.CONTAIN}
              isLooping
              isMuted
              shouldPlay
            />
          </View>

          {/* CARD 1: SCHOLARSHIP MATCHING (PUZZLE ARTWORK) */}
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
                source={isDarkMode ? puzzleDark : puzzleLight}
                style={styles.artworkImage}
                resizeMode="contain"
              />

              <View style={styles.cardContent}>
                <View style={styles.badgeRow}>
                  <View
                    style={[
                      styles.recBadge,
                      isDarkMode && { backgroundColor: "#3B82F6" },
                    ]}
                  >
                    <IconSymbol name="star.fill" size={11} color="#FFFFFF" />
                    <Text style={styles.recBadgeText}>Recommended</Text>
                  </View>
                </View>

                <Text
                  style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}
                >
                  Use Scholarship Matching
                </Text>
                <Text
                  style={[styles.cardSub, isDarkMode && { color: "#CBD5E1" }]}
                >
                  Answer a few questions and get personalized scholarship
                  matches that fit your profile.
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
                    name="target"
                    size={13}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    Personalized for you
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
                    Takes 2–3 min
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryActionBtn,
                  isDarkMode && { backgroundColor: "#3B82F6" },
                ]}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryActionBtnText}>Start Matching</Text>
                <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* CARD 2: BROWSE SCHOLARSHIPS (BROWSE ARTWORK) */}
          <View
            style={[
              styles.card,
              isDarkMode && {
                backgroundColor: "#03132A",
                borderColor: "#0B264A",
              },
            ]}
          >
            <View style={styles.cardMainRow}>
              <Image
                source={isDarkMode ? browseDark : browseLight}
                style={styles.artworkImage}
                resizeMode="contain"
              />

              <View style={styles.cardContent}>
                <Text
                  style={[styles.cardTitle, isDarkMode && { color: "#F8FAFC" }]}
                >
                  Browse Scholarships
                </Text>
                <Text
                  style={[styles.cardSub, isDarkMode && { color: "#CBD5E1" }]}
                >
                  Explore all available scholarship programs and find
                  opportunities that interest you.
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.cardBottomRow,
                isDarkMode && { borderTopColor: "#0A2242" },
              ]}
            >
              <View style={styles.pillGroup}>
                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#071B38" },
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
                    All programs
                  </Text>
                </View>

                <View
                  style={[
                    styles.infoPill,
                    isDarkMode && { backgroundColor: "#071B38" },
                  ]}
                >
                  <IconSymbol
                    name="funnel.fill"
                    size={13}
                    color={isDarkMode ? "#94A3B8" : "#64748B"}
                  />
                  <Text
                    style={[
                      styles.infoPillText,
                      isDarkMode && { color: "#CBD5E1" },
                    ]}
                  >
                    Filter & compare
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.secondaryActionBtn,
                  isDarkMode && { borderColor: "#38BDF8" },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.secondaryActionBtnText,
                    isDarkMode && { color: "#38BDF8" },
                  ]}
                >
                  Browse Programs
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? "#38BDF8" : "#0284C7"}
                />
              </TouchableOpacity>
            </View>
          </View>
        </>
      )}
    </ScrollView>
  );
}
