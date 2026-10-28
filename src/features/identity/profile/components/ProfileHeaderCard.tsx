import React, { useState } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { Badge } from "@/src/components/ui/Badge";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { CitizenProfileData } from "@/src/services/profile-service";
import { styles } from "../../styles/ProfileScreen.styles";

export interface ProfileHeaderCardProps {
  userProfile: CitizenProfileData | {
    fullName?: string;
    initials?: string;
    barangay?: string;
    status?: string;
    memberSince?: string;
    [key: string]: any;
  };
  effectiveCitizenIdNumber: string;
  verifiedPhotoUrl: string | null;
  isGuestMode: boolean;
  verificationStatus: string;
  onOpenQr: () => void;
  onNavigateVerify: () => void;
  isDarkMode: boolean;
}

export function ProfileHeaderCard({
  userProfile,
  effectiveCitizenIdNumber,
  verifiedPhotoUrl,
  isGuestMode,
  verificationStatus,
  onOpenQr,
  onNavigateVerify,
  isDarkMode,
}: ProfileHeaderCardProps) {
  const [avatarPhotoError, setAvatarPhotoError] = useState(false);

  return (
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
        <View style={styles.avatarCircle}>
          {verifiedPhotoUrl && !avatarPhotoError ? (
            <Image
              source={{ uri: verifiedPhotoUrl }}
              style={{ width: 60, height: 60, borderRadius: 30 }}
              resizeMode="cover"
              onError={() => setAvatarPhotoError(true)}
            />
          ) : (
            <Text style={styles.avatarText}>
              {userProfile.initials || (isGuestMode ? "GR" : "...")}
            </Text>
          )}
          <View
            style={[
              styles.onlineBadgeDot,
              isGuestMode && styles.guestBadgeDot,
            ]}
          />
        </View>
        <View style={styles.headerInfo}>
          <View style={styles.nameRow}>
            <Text
              style={[
                styles.userNameText,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              {userProfile.fullName || "Loading Profile..."}
            </Text>
          </View>
          {effectiveCitizenIdNumber ? (
            <Text
              style={[
                styles.citizenIdText,
                isDarkMode && { color: "#94A3B8" },
              ]}
            >
              ID: {effectiveCitizenIdNumber}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 2,
            }}
          >
            <IconSymbol
              name="location.fill"
              size={12}
              color="#176B87"
              style={{ marginRight: 4 }}
            />
            <Text
              style={[
                styles.barangayText,
                isDarkMode && { color: "#CBD5E1" },
              ]}
            >
              {userProfile.barangay
                ? `${userProfile.barangay}, Civentral City`
                : "Civentral City Resident"}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.qrHeaderBtn,
            isDarkMode && {
              backgroundColor: "#0F172A",
              borderColor: "#3A506B",
            },
          ]}
          onPress={onOpenQr}
          activeOpacity={0.8}
        >
          <IconSymbol name="qrcode" size={24} color="#176B87" />
          <Text style={styles.qrBtnLabel}>QR ID</Text>
        </TouchableOpacity>
      </View>

      {/* Status Badges */}
      <View style={styles.badgesRow}>
        <Badge
          label={
            isGuestMode
              ? "GUEST USER"
              : `${(userProfile.status || "Active").toUpperCase()} RESIDENT`
          }
          variant={isGuestMode ? "neutral" : "success"}
        />
        {!isGuestMode && (
          <TouchableOpacity
            onPress={onNavigateVerify}
            activeOpacity={0.7}
          >
            <Badge
              label={
                verificationStatus === "Approved"
                  ? "CITIZEN VERIFIED"
                  : verificationStatus === "Pending" || verificationStatus === "Under_Review"
                  ? "VERIFICATION PENDING"
                  : verificationStatus === "Returned_For_Correction"
                  ? "REWORK REQUIRED"
                  : verificationStatus === "Rejected"
                  ? "VERIFICATION REJECTED"
                  : "GET VERIFIED"
              }
              variant={
                verificationStatus === "Approved"
                  ? "success"
                  : verificationStatus === "Pending" || verificationStatus === "Under_Review"
                  ? "warning"
                  : verificationStatus === "Returned_For_Correction" || verificationStatus === "Rejected"
                  ? "danger"
                  : "info"
              }
            />
          </TouchableOpacity>
        )}
        <Badge
          label={
            isGuestMode
              ? "TEMPORARY SESSION"
              : userProfile.memberSince
                ? `MEMBER SINCE ${userProfile.memberSince.toUpperCase()}`
                : "REGISTERED CITIZEN"
          }
          variant="neutral"
        />
      </View>
    </View>
  );
}
