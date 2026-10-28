import React, { useEffect, useRef } from "react";
import { Animated, ScrollView, View } from "react-native";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "../../styles/ProfileScreen.styles";

function SkeletonItem({
  width,
  height,
  borderRadius = 8,
  style,
}: {
  width?: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
}) {
  const { isDarkMode } = useTheme();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.35,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  const baseColor = isDarkMode ? "#2A3656" : "#E2E8F0";

  return (
    <Animated.View
      style={[
        {
          width: width ?? "100%",
          height,
          borderRadius,
          backgroundColor: baseColor,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ProfileSkeletonLoading({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card Skeleton */}
        <View
          style={[
            styles.headerCard,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <View style={styles.avatarRow}>
            <SkeletonItem width={64} height={64} borderRadius={32} />
            <View style={[styles.headerInfo, { gap: 8 }]}>
              <SkeletonItem width="75%" height={22} borderRadius={6} />
              <SkeletonItem width="55%" height={14} borderRadius={4} />
              <SkeletonItem width="65%" height={14} borderRadius={4} />
            </View>
            <SkeletonItem width={50} height={50} borderRadius={12} />
          </View>
          <View style={[styles.badgesRow, { marginTop: 16 }]}>
            <SkeletonItem width={120} height={24} borderRadius={12} />
            <SkeletonItem width={140} height={24} borderRadius={12} />
          </View>
        </View>

        {/* Tab Switcher Skeleton */}
        <View
          style={[
            styles.tabBarContainer,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
          ]}
        >
          <SkeletonItem width="48%" height={38} borderRadius={10} />
          <SkeletonItem width="48%" height={38} borderRadius={10} />
        </View>

        {/* Section Card 1 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18 },
          ]}
        >
          <SkeletonItem width={180} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
            <SkeletonItem height={48} borderRadius={10} />
          </View>
        </View>

        {/* Section Card 2 Skeleton */}
        <View
          style={[
            styles.card,
            isDarkMode && {
              backgroundColor: "#1C2541",
              borderColor: "#3A506B",
            },
            { gap: 16, padding: 18, marginTop: 16 },
          ]}
        >
          <SkeletonItem width={160} height={20} borderRadius={6} />
          <View style={{ gap: 12 }}>
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
            <SkeletonItem height={54} borderRadius={12} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
