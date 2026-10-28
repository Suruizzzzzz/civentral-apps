import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { IconSymbol } from "@/src/components/ui/icon-symbol";
import { OfficialCitizenCard } from "../../components/OfficialCitizenCard";
import { styles } from "../../styles/ProfileScreen.styles";
import { CitizenProfileData } from "@/src/services/profile-service";

export interface ProfileOverviewTabProps {
  userProfile: CitizenProfileData;
  isGuestMode: boolean;
  verificationStatus: string;
  verificationData: any;
  isCitizenApproved: boolean;
  verifiedMunicipalAddress: string | null;
  onOpenEditProfile: () => void;
  isDarkMode: boolean;
}

export function ProfileOverviewTab({
  userProfile,
  isGuestMode,
  verificationStatus,
  verificationData,
  isCitizenApproved,
  verifiedMunicipalAddress,
  onOpenEditProfile,
  isDarkMode,
}: ProfileOverviewTabProps) {
  const router = useRouter();

  return (
    <View style={styles.sectionStack}>
      {/* Personal Details Card */}
      <View
        style={[
          styles.card,
          isDarkMode && {
            backgroundColor: "#1C2541",
            borderColor: "#3A506B",
          },
        ]}
      >
        <View style={styles.cardHeaderRow}>
          <View style={styles.cardHeaderLeft}>
            <IconSymbol name="person.fill" size={20} color="#176B87" />
            <Text
              style={[
                styles.cardTitle,
                isDarkMode && { color: "#F8FAFC" },
              ]}
            >
              Personal Information
            </Text>
          </View>
          {!isGuestMode && (
            <TouchableOpacity
              onPress={onOpenEditProfile}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.editIconBadge,
                  isDarkMode && { backgroundColor: "#176B87" },
                ]}
              >
                <IconSymbol name="pencil" size={14} color="#FFFFFF" />
                <Text
                  style={[
                    styles.editText,
                    isDarkMode && { color: "#FFFFFF" },
                  ]}
                >
                  Edit
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoRow}>
            <IconSymbol
              name="envelope.fill"
              size={16}
              color={isDarkMode ? "#94A3B8" : "#64748B"}
            />
            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Email Address
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {userProfile.email || "Not set"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoDivider,
              isDarkMode && { backgroundColor: "#3A506B" },
            ]}
          />

          <View style={styles.infoRow}>
            <IconSymbol
              name="phone.fill"
              size={16}
              color={isDarkMode ? "#94A3B8" : "#64748B"}
            />
            <View style={styles.infoContent}>
              <Text
                style={[
                  styles.infoLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Mobile Number
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {userProfile.phone || "Not provided"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoDivider,
              isDarkMode && { backgroundColor: "#3A506B" },
            ]}
          />

          <View style={styles.infoRow}>
            <IconSymbol
              name="location.fill"
              size={16}
              color={isDarkMode ? "#94A3B8" : "#64748B"}
            />
            <View style={styles.infoContent}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <Text
                  style={[
                    styles.infoLabel,
                    isDarkMode && { color: "#94A3B8" },
                  ]}
                >
                  Registered Address
                </Text>
                {isCitizenApproved ? (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#DCFCE7", paddingHorizontal: 6, paddingVertical: 1, borderRadius: 4 }}>
                    <IconSymbol name="checkmark.seal.fill" size={10} color="#15803D" />
                    <Text style={{ fontSize: 9, fontWeight: "700", color: "#15803D" }}>VERIFIED</Text>
                  </View>
                ) : null}
              </View>
              <Text
                style={[
                  styles.infoValue,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {verifiedMunicipalAddress || userProfile.address || "Not set (Complete in Citizen Services)"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.infoDivider,
              isDarkMode && { backgroundColor: "#3A506B" },
            ]}
          />

          <View style={styles.twoColumnRow}>
            <View style={styles.columnHalf}>
              <Text
                style={[
                  styles.infoLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Last Active Login
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {userProfile.lastLogin || "N/A"}
              </Text>
            </View>
            <View style={styles.columnHalf}>
              <Text
                style={[
                  styles.infoLabel,
                  isDarkMode && { color: "#94A3B8" },
                ]}
              >
                Registry Status
              </Text>
              <Text
                style={[
                  styles.infoValue,
                  isDarkMode && { color: "#F8FAFC" },
                ]}
              >
                {isGuestMode ? "Guest Session" : "Active (Verified)"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* OFFICIAL CITIZEN CARD / VERIFICATION STATE DISPLAY */}
      {verificationStatus === "Approved" ? (
        <OfficialCitizenCard
          first_name={verificationData?.first_name || userProfile.first_name}
          middle_name={verificationData?.middle_name || userProfile.middle_name}
          last_name={verificationData?.last_name || userProfile.last_name}
          suffix={verificationData?.suffix || userProfile.suffix}
          birth_date={verificationData?.birth_date || userProfile.birthDate}
          civil_status={verificationData?.civil_status || userProfile.civilStatus}
          sex={verificationData?.sex || "Male"}
          street_address={verificationData?.street_address || userProfile.address}
          barangay={verificationData?.barangay || userProfile.barangay}
          district={verificationData?.district || "District 1"}
          citizen_id_number={verificationData?.citizen_id_number || userProfile.citizenId}
          photo_1x1_url={verificationData?.photo_1x1_url}
          signature_photo_url={verificationData?.signature_photo_url}
          qr_token={verificationData?.qr_code_token}
          reviewed_at={verificationData?.reviewed_at}
          submitted_at={verificationData?.submitted_at}
          valid_until={verificationData?.valid_until}
          is_pwd={!!(verificationData?.is_pwd || verificationData?.pwd)}
          is_non_resident={!!(verificationData?.is_non_resident || verificationData?.non_resident)}
          blood_type={verificationData?.blood_type}
          emergency_contact={verificationData?.emergency_contact}
          showPrintActions={true}
        />
      ) : (verificationStatus === "Pending" || verificationStatus === "Under_Review") ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? "#451A03" : "#FFFBEB",
              borderColor: "#F59E0B",
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 16,
              gap: 12,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#F59E0B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="clock.fill" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkMode ? "#FDE68A" : "#92400E" }}>
                Identity Verification Under Review
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#FCD34D" : "#B45309", marginTop: 2 }}>
                City Civil Registry staff are currently verifying your documents.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#D97706",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              gap: 8,
              marginTop: 4,
            }}
            onPress={() => router.push("/(auth)/verify-citizen" as any)}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              Check Application Status & Timeline
            </Text>
            <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : verificationStatus === "Returned_For_Correction" ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? "#431407" : "#FFF7ED",
              borderColor: "#EA580C",
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 16,
              gap: 12,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#EA580C",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="exclamationmark.triangle.fill" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkMode ? "#FED7AA" : "#9A3412" }}>
                Action Required: Rework Requested
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#FDBA74" : "#C2410C", marginTop: 2 }}>
                {verificationData?.admin_action_notes || "Registry officers requested corrections on your submitted documents."}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#EA580C",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              gap: 8,
              marginTop: 4,
            }}
            onPress={() => router.push("/(auth)/verify-citizen" as any)}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              Review Remarks & Resubmit
            </Text>
            <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : verificationStatus === "Rejected" ? (
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? "#450A0A" : "#FEF2F2",
              borderColor: "#DC2626",
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 16,
              gap: 12,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: "#DC2626",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="xmark.circle.fill" size={24} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkMode ? "#FECACA" : "#991B1B" }}>
                Verification Application Declined
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#FCA5A5" : "#B91C1C", marginTop: 2 }}>
                {verificationData?.rejection_reason || "Application was not approved. Tap to review and re-apply."}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#DC2626",
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 12,
              gap: 8,
              marginTop: 4,
            }}
            onPress={() => router.push("/(auth)/verify-citizen" as any)}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              Review Reason & Re-apply
            </Text>
            <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      ) : (
        /* NOT SUBMITTED / UNVERIFIED / GUEST */
        <View
          style={[
            styles.card,
            {
              backgroundColor: isDarkMode ? "#1E293B" : "#F8FAFC",
              borderColor: isDarkMode ? "#334155" : "#CBD5E1",
              borderWidth: 1.5,
              borderRadius: 16,
              padding: 18,
              gap: 14,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: isDarkMode ? "#0F4C81" : "#E0F2FE",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconSymbol name="person.text.rectangle.fill" size={26} color={isDarkMode ? "#38BDF8" : "#0284C7"} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: isDarkMode ? "#F8FAFC" : "#0F172A" }}>
                Get Official Citizen ID Card
              </Text>
              <Text style={{ fontSize: 12, color: isDarkMode ? "#94A3B8" : "#64748B", marginTop: 2, lineHeight: 17 }}>
                Submit your valid ID and selfie to receive your certified Civentral Digital Resident Card with cryptographic QR pass.
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#0F4C81",
              paddingVertical: 13,
              paddingHorizontal: 16,
              borderRadius: 12,
              gap: 8,
            }}
            onPress={() => router.push("/(auth)/verify-citizen" as any)}
            activeOpacity={0.85}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "800" }}>
              Start Citizen Verification
            </Text>
            <IconSymbol name="chevron.right" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
