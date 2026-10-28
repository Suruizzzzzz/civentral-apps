import React from "react";
import { Alert, Switch, Text, TouchableOpacity, View } from "react-native";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { styles } from "../../styles/ProfileScreen.styles";

export interface ProfileSettingsTabProps {
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  biometricsEnabled: boolean;
  setBiometricsEnabled: (val: boolean) => void;
  pushNotificationsEnabled: boolean;
  setPushNotificationsEnabled: (val: boolean) => void;
  sosAlertsEnabled: boolean;
  setSosAlertsEnabled: (val: boolean) => void;
  onOpenChangePassword: () => void;
  onOpenTwoFactor?: () => void;
  onOpenVerifyPhone?: () => void;
  onOpenVerifyEmail?: () => void;
  onSignOut: () => void;
  isGuestMode: boolean;
}

export function ProfileSettingsTab({
  isDarkMode,
  setIsDarkMode,
  biometricsEnabled,
  setBiometricsEnabled,
  pushNotificationsEnabled,
  setPushNotificationsEnabled,
  sosAlertsEnabled,
  setSosAlertsEnabled,
  onOpenChangePassword,
  onOpenTwoFactor,
  onOpenVerifyPhone,
  onOpenVerifyEmail,
  onSignOut,
  isGuestMode,
}: ProfileSettingsTabProps) {
  return (
    <View style={styles.sectionStack}>
      {/* App Appearance & Theme (Dark & Light Mode) */}
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
            styles.cardSectionTitle,
            isDarkMode && { color: "#F8FAFC" },
          ]}
        >
          Appearance & Theme
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextStack}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name={isDarkMode ? "moon.stars.fill" : "sun.max.fill"}
                size={18}
                color={isDarkMode ? "#A855F7" : "#F59E0B"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.settingLabel,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {isDarkMode ? "Dark Mode" : "Light Mode"}
              </Text>
            </View>
            <Text
              style={[
                styles.settingSub,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              {isDarkMode
                ? "Sleek dark theme active for Civentral"
                : "Bright modern light theme active for Civentral"}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={setIsDarkMode}
            trackColor={{
              false: isDarkMode ? "#334155" : "#CBD5E1",
              true: "#38BDF8",
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Account & Security */}
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
            styles.cardSectionTitle,
            isDarkMode && { color: "#F8FAFC" },
          ]}
        >
          Security & Biometrics
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextStack}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="fingerprint"
                size={18}
                color={isDarkMode ? "#38BDF8" : "#176B87"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.settingLabel,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Biometric Sign-In
              </Text>
            </View>
            <Text
              style={[
                styles.settingSub,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              Use Fingerprint or Face ID for fast login
            </Text>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{
              false: isDarkMode ? "#334155" : "#CBD5E1",
              true: isDarkMode ? "#38BDF8" : "#176B87",
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            styles.infoDivider,
            isDarkMode && { backgroundColor: "#3A506B" },
          ]}
        />

        <TouchableOpacity
          style={styles.settingActionRow}
          onPress={onOpenChangePassword}
          activeOpacity={0.7}
        >
          <View style={styles.settingLeftIcon}>
            <IconSymbol
              name="lock.fill"
              size={18}
              color={isDarkMode ? "#38BDF8" : "#176B87"}
            />
            <Text
              style={[
                styles.settingActionText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Change Account Password
            </Text>
          </View>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={isDarkMode ? "#64748B" : "#94A3B8"}
          />
        </TouchableOpacity>

        {onOpenTwoFactor ? (
          <>
            <View
              style={[
                styles.infoDivider,
                isDarkMode && { backgroundColor: "#3A506B" },
              ]}
            />
            <TouchableOpacity
              style={styles.settingActionRow}
              onPress={onOpenTwoFactor}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeftIcon}>
                <IconSymbol
                  name="shield.lefthalf.filled"
                  size={18}
                  color={isDarkMode ? "#38BDF8" : "#176B87"}
                />
                <Text
                  style={[
                    styles.settingActionText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Two-Factor Authentication (2FA)
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={18}
                color={isDarkMode ? "#64748B" : "#94A3B8"}
              />
            </TouchableOpacity>
          </>
        ) : null}

        {onOpenVerifyPhone ? (
          <>
            <View
              style={[
                styles.infoDivider,
                isDarkMode && { backgroundColor: "#3A506B" },
              ]}
            />
            <TouchableOpacity
              style={styles.settingActionRow}
              onPress={onOpenVerifyPhone}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeftIcon}>
                <IconSymbol
                  name="phone.fill"
                  size={18}
                  color={isDarkMode ? "#38BDF8" : "#176B87"}
                />
                <Text
                  style={[
                    styles.settingActionText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Verify Phone Number
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={18}
                color={isDarkMode ? "#64748B" : "#94A3B8"}
              />
            </TouchableOpacity>
          </>
        ) : null}

        {onOpenVerifyEmail ? (
          <>
            <View
              style={[
                styles.infoDivider,
                isDarkMode && { backgroundColor: "#3A506B" },
              ]}
            />
            <TouchableOpacity
              style={styles.settingActionRow}
              onPress={onOpenVerifyEmail}
              activeOpacity={0.7}
            >
              <View style={styles.settingLeftIcon}>
                <IconSymbol
                  name="envelope.fill"
                  size={18}
                  color={isDarkMode ? "#38BDF8" : "#176B87"}
                />
                <Text
                  style={[
                    styles.settingActionText,
                    isDarkMode && { color: "#F8FAFC" },
                  ]}
                >
                  Verify Email Address
                </Text>
              </View>
              <IconSymbol
                name="chevron.right"
                size={18}
                color={isDarkMode ? "#64748B" : "#94A3B8"}
              />
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Notifications */}
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
            styles.cardSectionTitle,
            isDarkMode && { color: "#F8FAFC" },
          ]}
        >
          Notifications & Alerts
        </Text>

        <View style={styles.settingRow}>
          <View style={styles.settingTextStack}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="bell.fill"
                size={18}
                color={isDarkMode ? "#38BDF8" : "#176B87"}
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.settingLabel,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                City Push Notifications
              </Text>
            </View>
            <Text
              style={[
                styles.settingSub,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              Receive updates on civic services & announcements
            </Text>
          </View>
          <Switch
            value={pushNotificationsEnabled}
            onValueChange={setPushNotificationsEnabled}
            trackColor={{
              false: isDarkMode ? "#334155" : "#CBD5E1",
              true: isDarkMode ? "#38BDF8" : "#176B87",
            }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View
          style={[
            styles.infoDivider,
            isDarkMode && { backgroundColor: "#3A506B" },
          ]}
        />

        <View style={styles.settingRow}>
          <View style={styles.settingTextStack}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={18}
                color="#EF4444"
                style={{ marginRight: 8 }}
              />
              <Text
                style={[
                  styles.settingLabel,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                Emergency SOS Broadcasts
              </Text>
            </View>
            <Text
              style={[
                styles.settingSub,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              Receive real-time disaster & emergency warnings
            </Text>
          </View>
          <Switch
            value={sosAlertsEnabled}
            onValueChange={setSosAlertsEnabled}
            trackColor={{
              false: isDarkMode ? "#334155" : "#CBD5E1",
              true: "#DC2626",
            }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* App Info & Legal */}
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
            styles.cardSectionTitle,
            isDarkMode && { color: "#F8FAFC" },
          ]}
        >
          Support & About
        </Text>

        <TouchableOpacity
          style={styles.settingActionRow}
          onPress={() =>
            Alert.alert(
              "City Hall Support Hotline",
              "Connecting to Civentral City Citizen Desk: (02) 8888-CIVENTRAL",
            )
          }
          activeOpacity={0.7}
        >
          <View style={styles.settingLeftIcon}>
            <IconSymbol
              name="help.circle.fill"
              size={18}
              color={isDarkMode ? "#38BDF8" : "#176B87"}
            />
            <Text
              style={[
                styles.settingActionText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              City Hall Citizen Help Desk
            </Text>
          </View>
          <IconSymbol
            name="chevron.right"
            size={18}
            color={isDarkMode ? "#64748B" : "#94A3B8"}
          />
        </TouchableOpacity>

        <View
          style={[
            styles.infoDivider,
            isDarkMode && { backgroundColor: "#3A506B" },
          ]}
        />

        <View style={styles.settingActionRow}>
          <View style={styles.settingLeftIcon}>
            <IconSymbol
              name="shield.fill"
              size={18}
              color={isDarkMode ? "#38BDF8" : "#64748B"}
            />
            <Text
              style={[
                styles.settingActionText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Privacy & Data Protection Policy
            </Text>
          </View>
          <IconSymbol name="chevron.right" size={18} color="#94A3B8" />
        </View>

        <View
          style={[
            styles.infoDivider,
            isDarkMode && { backgroundColor: "#3A506B" },
          ]}
        />

        <View style={styles.versionRow}>
          <Text
            style={[
              styles.versionLabel,
              isDarkMode && { color: "#94A3B8" },
            ]}
          >
            Civentral Citizen App
          </Text>
          <Text
            style={[
              styles.versionValue,
              isDarkMode && { color: "#F8FAFC" },
            ]}
          >
            v2.4.1 (Build 2026)
          </Text>
        </View>
      </View>

      {/* Sign Out / Exit Guest Mode Button */}
      <TouchableOpacity
        style={styles.signOutBtn}
        onPress={onSignOut}
        activeOpacity={0.85}
      >
        <IconSymbol
          name="rectangle.portrait.and.arrow.right"
          size={20}
          color="#EF4444"
        />
        <Text style={styles.signOutBtnText}>
          {isGuestMode
            ? "Exit Guest Mode / Sign In"
            : "Log Out of Civentral"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
