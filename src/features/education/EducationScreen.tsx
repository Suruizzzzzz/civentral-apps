import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { useTheme } from "@/src/context/ThemeContext";
import { styles } from "./EducationScreen.styles";

export function EducationScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const isNavigatingRef = React.useRef(false);

  useFocusEffect(
    React.useCallback(() => {
      isNavigatingRef.current = false;
    }, [])
  );

  const safeNavigate = (path: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;
    router.navigate(path as any);
    setTimeout(() => {
      isNavigatingRef.current = false;
    }, 600);
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/(tabs)/services' as any);
    }
  };

  return (
    <View
      style={[styles.container, isDarkMode && { backgroundColor: "#0B132B" }]}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuStack}>
          {/* Header Title */}
          <View style={styles.headerContainer}>
            <TouchableOpacity
              style={styles.simpleBackBtn}
              onPress={handleBack}
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
                  color={isDarkMode ? "#38BDF8" : "#176B87"}
                />
              </View>
              <Text
                style={[
                  styles.simpleBackText,
                  isDarkMode && { color: "#38BDF8" },
                ]}
              >
                Back to Services
              </Text>
            </TouchableOpacity>

            <Text
              style={[styles.headerTitle, isDarkMode && { color: "#F8FAFC" }]}
            >
              Education & Scholarship Portal
            </Text>
            <Text
              style={[
                styles.headerSubtitle,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              City Government educational grants, online applications, renewal &
              cash allowance distribution.
            </Text>
          </View>

          {/* THE 4 MAIN BUTTON CARDS */}
          <View style={styles.fourButtonsGrid}>
            {/* BUTTON 1: SCHOLARSHIP DASHBOARD */}
            <TouchableOpacity
              style={[
                styles.hubCardButton,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => safeNavigate("/education/dashboard")}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View
                  style={[
                    styles.hubIconCircle,
                    { backgroundColor: isDarkMode ? "#3B0764" : "#F3E8FF" },
                  ]}
                >
                  <IconSymbol
                    name="book.closed.fill"
                    size={24}
                    color={isDarkMode ? "#C084FC" : "#7E22CE"}
                  />
                </View>
                <Badge label="ACTIVE GRANT" variant="success" />
              </View>
              <Text
                style={[
                  styles.hubCardTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Scholarship Dashboard
              </Text>
              <Text
                style={[styles.hubCardSub, isDarkMode && { color: "#CBD5E1" }]}
              >
                View active grant status, maintaining GWA requirements, next
                payout date & city education bulletins.
              </Text>
              <View style={styles.hubCardFooter}>
                <Text
                  style={[
                    styles.hubCardActionText,
                    isDarkMode && { color: "#C084FC" },
                  ]}
                >
                  Open Dashboard
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? "#C084FC" : "#7E22CE"}
                />
              </View>
            </TouchableOpacity>

            {/* BUTTON 2: NEW APPLICANT */}
            <TouchableOpacity
              style={[
                styles.hubCardButton,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => safeNavigate("/education/new-applicant")}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View
                  style={[
                    styles.hubIconCircle,
                    { backgroundColor: isDarkMode ? "#0F2942" : "#E0F2FE" },
                  ]}
                >
                  <IconSymbol
                    name="doc.text.fill"
                    size={24}
                    color={isDarkMode ? "#38BDF8" : "#0284C7"}
                  />
                </View>
                <Badge label="APPLY ONLINE" variant="info" />
              </View>
              <Text
                style={[
                  styles.hubCardTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                New Applicant
              </Text>
              <Text
                style={[styles.hubCardSub, isDarkMode && { color: "#CBD5E1" }]}
              >
                Submit new scholarship application for Tertiary College, Senior
                High School & SPED City Grants.
              </Text>
              <View style={styles.hubCardFooter}>
                <Text
                  style={[
                    styles.hubCardActionText,
                    { color: isDarkMode ? "#38BDF8" : "#0284C7" },
                  ]}
                >
                  Start Application
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? "#38BDF8" : "#0284C7"}
                />
              </View>
            </TouchableOpacity>

            {/* BUTTON 3: SCHOLARSHIP RENEWAL */}
            <TouchableOpacity
              style={[
                styles.hubCardButton,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => safeNavigate("/education/renewal")}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View
                  style={[
                    styles.hubIconCircle,
                    { backgroundColor: isDarkMode ? "#052E16" : "#DCFCE7" },
                  ]}
                >
                  <IconSymbol
                    name="pencil"
                    size={24}
                    color={isDarkMode ? "#4ADE80" : "#15803D"}
                  />
                </View>
                <Badge label="FOR SCHOLARS" variant="success" />
              </View>
              <Text
                style={[
                  styles.hubCardTitle,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Scholarship Renewal
              </Text>
              <Text
                style={[styles.hubCardSub, isDarkMode && { color: "#CBD5E1" }]}
              >
                Existing scholars can submit renewal requirements for the next
                academic period.
              </Text>
              <View
                style={[
                  styles.hubCardFooter,
                  isDarkMode && { borderColor: "#293548" },
                ]}
              >
                <Text
                  style={[
                    styles.hubCardActionText,
                    { color: isDarkMode ? "#4ADE80" : "#15803D" },
                  ]}
                >
                  Submit Renewal
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? "#4ADE80" : "#15803D"}
                />
              </View>
            </TouchableOpacity>

            {/* BUTTON 4: SCHOLARSHIP GRANT */}
            <TouchableOpacity
              style={[
                styles.hubCardButton,
                isDarkMode && {
                  backgroundColor: "#1C2541",
                  borderColor: "#3A506B",
                },
              ]}
              onPress={() => safeNavigate("/education/grant")}
              activeOpacity={0.85}
            >
              <View style={styles.hubCardHeader}>
                <View
                  style={[
                    styles.grantIconCircle,
                    isDarkMode && styles.grantIconCircleDark,
                  ]}
                >
                  <IconSymbol
                    name="wallet.pass.fill"
                    size={24}
                    color={isDarkMode ? "#FB923C" : "#EA580C"}
                  />
                </View>
                <View
                  style={[
                    styles.grantBadge,
                    isDarkMode && styles.grantBadgeDark,
                  ]}
                >
                  <Text
                    style={[
                      styles.grantBadgeText,
                      isDarkMode && styles.grantBadgeTextDark,
                    ]}
                  >
                    GRANTS & PAYMENTS
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  styles.grantTitle,
                  isDarkMode && styles.grantTitleDark,
                ]}
              >
                Scholarship Grant
              </Text>
              <Text
                style={[styles.hubCardSub, isDarkMode && { color: "#CBD5E1" }]}
              >
                Apply for and track your educational grant, requirements, and payment status.
              </Text>
              <View
                style={[
                  styles.hubCardFooter,
                  isDarkMode && { borderTopColor: "#293548" },
                ]}
              >
                <Text
                  style={[
                    styles.grantActionText,
                    isDarkMode && styles.grantActionTextDark,
                  ]}
                >
                  Open Grant
                </Text>
                <IconSymbol
                  name="chevron.right"
                  size={14}
                  color={isDarkMode ? "#FB923C" : "#EA580C"}
                />
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
