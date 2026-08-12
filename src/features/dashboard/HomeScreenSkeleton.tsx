import React from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "@/components/ui/Skeleton";
import { useTheme } from "@/src/context/ThemeContext";

export function HomeScreenSkeleton() {
  const { isDarkMode } = useTheme();
  const dm = isDarkMode;
  const bg = dm ? "#0B132B" : "#F6F8FA";
  const surface = dm ? "#1C2541" : "#FFFFFF";
  const border = dm ? "#3A506B" : "#E5E7EB";

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* HERO BANNER SKELETON */}
        <View
          style={[
            styles.heroContainer,
            { backgroundColor: dm ? "#152238" : "#CBD5E1" },
          ]}
        >
          <View style={styles.heroOverlay}>
            <Skeleton
              width="60%"
              height={26}
              borderRadius={6}
              style={{ marginBottom: 8 }}
            />
            <Skeleton width="40%" height={16} borderRadius={4} />
          </View>
        </View>

        {/* BODY CONTAINER SKELETON */}
        <View style={styles.bodyContent}>
          {/* CIVIC DASHBOARD CARD SKELETON */}
          <View
            style={[
              styles.civicCard,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <View style={styles.civicCardHeader}>
              <Skeleton width={140} height={20} borderRadius={6} />
              <Skeleton width={55} height={16} borderRadius={4} />
            </View>

            <View style={styles.pillarGrid}>
              <View
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#0F1E36" : "#EFF6FF" },
                ]}
              >
                <Skeleton
                  width={38}
                  height={38}
                  borderRadius={12}
                  style={{ marginBottom: 10 }}
                />
                <Skeleton
                  width={22}
                  height={22}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={44} height={12} borderRadius={3} />
              </View>

              <View
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#052818" : "#F0FDF4" },
                ]}
              >
                <Skeleton
                  width={38}
                  height={38}
                  borderRadius={19}
                  style={{ marginBottom: 10 }}
                />
                <Skeleton
                  width={22}
                  height={22}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={44} height={12} borderRadius={3} />
              </View>

              <View
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#291D07" : "#FFFBEB" },
                ]}
              >
                <Skeleton
                  width={38}
                  height={38}
                  borderRadius={12}
                  style={{ marginBottom: 10 }}
                />
                <Skeleton
                  width={22}
                  height={22}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={44} height={12} borderRadius={3} />
              </View>

              <View
                style={[
                  styles.pillarCard,
                  { backgroundColor: dm ? "#210C36" : "#FAF5FF" },
                ]}
              >
                <Skeleton
                  width={38}
                  height={38}
                  borderRadius={12}
                  style={{ marginBottom: 10 }}
                />
                <Skeleton
                  width={38}
                  height={18}
                  borderRadius={4}
                  style={{ marginBottom: 6 }}
                />
                <Skeleton width={44} height={12} borderRadius={3} />
              </View>
            </View>

            <View style={styles.paginationRow}>
              <Skeleton width={24} height={4} borderRadius={2} />
              <Skeleton width={16} height={4} borderRadius={2} />
            </View>
          </View>

          {/* SEARCH BAR SKELETON */}
          <View
            style={[
              styles.searchBar,
              { backgroundColor: surface, borderColor: border },
            ]}
          >
            <Skeleton width={20} height={20} borderRadius={10} />
            <Skeleton
              width="70%"
              height={16}
              borderRadius={4}
              style={{ marginLeft: 12 }}
            />
          </View>

          {/* CITY SERVICES SKELETON */}
          <View style={styles.sectionBlock}>
            <View style={styles.sectionHeader}>
              <Skeleton width={110} height={20} borderRadius={6} />
              <Skeleton width={50} height={16} borderRadius={4} />
            </View>
            <View style={styles.serviceGrid}>
              <View
                style={[
                  styles.serviceItem,
                  { backgroundColor: surface, borderColor: border },
                ]}
              >
                <Skeleton width={36} height={36} borderRadius={10} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton
                    width="70%"
                    height={16}
                    borderRadius={4}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width="40%" height={12} borderRadius={3} />
                </View>
              </View>
              <View
                style={[
                  styles.serviceItem,
                  { backgroundColor: surface, borderColor: border },
                ]}
              >
                <Skeleton width={36} height={36} borderRadius={10} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton
                    width="70%"
                    height={16}
                    borderRadius={4}
                    style={{ marginBottom: 6 }}
                  />
                  <Skeleton width="40%" height={12} borderRadius={3} />
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F8FA",
  },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 110,
  },
  heroContainer: {
    width: "100%",
    height: 190,
    overflow: "hidden",
  },
  heroOverlay: {
    paddingTop: Platform.OS === "android" ? 18 : 14,
    paddingHorizontal: 20,
  },
  bodyContent: {
    paddingHorizontal: 16,
  },
  civicCard: {
    borderRadius: 24,
    padding: 16,
    marginTop: -44,
    borderWidth: 1,
    marginBottom: 16,
  },
  civicCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pillarGrid: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pillarCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    gap: 5,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 50,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 24,
  },
  sectionBlock: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  serviceGrid: {
    gap: 10,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
});
