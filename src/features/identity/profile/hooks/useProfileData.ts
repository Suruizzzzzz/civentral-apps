import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { AuthService } from "@/src/services/auth-service";
import {
  CitizenProfileData,
  ProfileService,
} from "@/src/services/profile-service";
import { resolveCardAssetUrl } from "../../components/OfficialCitizenCard";

export interface UseProfileDataParams {
  isGuest?: string;
  email?: string;
  phone?: string;
  citizenUserId?: string;
}

export function useProfileData(params: UseProfileDataParams) {
  const session = AuthService.getCurrentUser();
  const activeEmail = session.isGuest
    ? ""
    : params.email || session.email || "";
  const activePhone = session.isGuest
    ? ""
    : params.phone || session.phone || "";
  const activeUserId = session.isGuest
    ? undefined
    : params.citizenUserId
      ? parseInt(params.citizenUserId, 10)
      : session.citizen_user_id || undefined;

  const isGuestMode =
    session.isGuest ||
    params.isGuest === "true" ||
    (!activeEmail && !activePhone && !activeUserId);

  const [isLoadingApi, setIsLoadingApi] = useState(!isGuestMode);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const [userProfile, setUserProfile] = useState<CitizenProfileData>({
    citizen_user_id: activeUserId || 0,
    first_name: isGuestMode ? "Guest" : "",
    middle_name: "",
    last_name: isGuestMode ? "Resident" : "",
    suffix: "",
    fullName: isGuestMode ? "Guest Resident" : "",
    initials: isGuestMode ? "GR" : "",
    email: activeEmail || (isGuestMode ? "guest@civentral.gov.ph" : ""),
    phone: "",
    address: "",
    city: "Caloocan City",
    barangay: "",
    birthDate: "",
    civilStatus: "",
    citizenId: activeUserId
      ? `CIV-2026-${String(activeUserId).padStart(5, "0")}`
      : isGuestMode
        ? "CIV-GUEST-2026"
        : "",
    status: isGuestMode ? "Guest" : "Active",
    isVerified: true,
    registryCompleted: true,
    biometricEnabled: false,
    memberSince: "",
    lastLogin: isGuestMode ? "Current Session (Guest Mode)" : "",
  });

  const [verificationStatus, setVerificationStatus] = useState<
    'Not_Submitted' | 'Pending' | 'Under_Review' | 'Returned_For_Correction' | 'Approved' | 'Rejected'
  >('Not_Submitted');
  const [verificationData, setVerificationData] = useState<any>(null);

  const isCitizenApproved = verificationStatus === 'Approved';

  const effectiveCitizenIdNumber = useMemo(() => {
    return (
      verificationData?.citizen_id_number ||
      userProfile.citizenId ||
      (isCitizenApproved ? 'CAL-2026-000006' : '')
    );
  }, [verificationData, userProfile.citizenId, isCitizenApproved]);

  const rawPhotoUrl =
    verificationData?.photo_1x1_url ||
    (userProfile as any)?.photo_1x1_url ||
    (userProfile as any)?.avatar_url ||
    (userProfile as any)?.avatar;

  const verifiedPhotoUrl = useMemo(() => {
    if (!isCitizenApproved && !userProfile.isVerified) {
      return null;
    }
    return resolveCardAssetUrl(rawPhotoUrl);
  }, [isCitizenApproved, userProfile.isVerified, rawPhotoUrl]);

  const verifiedMunicipalAddress = useMemo(() => {
    if (isCitizenApproved && verificationData) {
      const parts = [
        verificationData.street_address,
        verificationData.barangay
          ? verificationData.barangay.toLowerCase().startsWith('barangay')
            ? verificationData.barangay
            : `Barangay ${verificationData.barangay}`
          : '',
        verificationData.district ? `District ${verificationData.district}` : '',
        verificationData.city || process.env.EXPO_PUBLIC_CITY_NAME || 'Civentral City',
      ].filter(Boolean);
      if (parts.length > 0) return parts.join(', ');
      if (verificationData.address) return verificationData.address;
    }
    return userProfile.address || '';
  }, [isCitizenApproved, verificationData, userProfile.address]);

  const fetchProfileFromApi = useCallback(async () => {
    if (isGuestMode) return;

    const identifierToUse =
      activeEmail || activePhone || userProfile.email || userProfile.phone;
    const response = await ProfileService.getProfile(
      identifierToUse,
      activeUserId || userProfile.citizen_user_id,
      activePhone,
    );

    if (response.status === "success" && response.data) {
      const data = response.data;
      setUserProfile((prev) => ({
        ...prev,
        ...data,
        fullName:
          data.fullName ||
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
          prev.fullName ||
          "Civentral Citizen",
        initials:
          data.initials ||
          (data.first_name
            ? data.first_name.charAt(0).toUpperCase()
            : prev.initials || "CC"),
        status: data.status || "Active",
        isVerified: true,
        registryCompleted: true,
      }));
    }

    try {
      const vRes = await ProfileService.getVerificationStatus(
        activeUserId || userProfile.citizen_user_id,
        identifierToUse
      );
      if (vRes?.verification_status) {
        setVerificationStatus(vRes.verification_status);
        const combinedVData = {
          ...(vRes.data || {}),
          ...vRes,
        };
        setVerificationData(combinedVData);

        if (vRes.verification_status === 'Approved') {
          const parts = [
            combinedVData.street_address,
            combinedVData.barangay
              ? combinedVData.barangay.toLowerCase().startsWith('barangay')
                ? combinedVData.barangay
                : `Barangay ${combinedVData.barangay}`
              : '',
            combinedVData.district ? `District ${combinedVData.district}` : '',
            combinedVData.city || process.env.EXPO_PUBLIC_CITY_NAME || 'Civentral City',
          ].filter(Boolean);
          const resolvedVerifiedAddr = parts.length > 0 ? parts.join(', ') : (combinedVData.address || '');

          setUserProfile((prev) => ({
            ...prev,
            citizenId: combinedVData.citizen_id_number || prev.citizenId,
            barangay: combinedVData.barangay || prev.barangay,
            address: resolvedVerifiedAddr || prev.address,
            first_name: combinedVData.first_name || prev.first_name,
            last_name: combinedVData.last_name || prev.last_name,
            middle_name: combinedVData.middle_name || prev.middle_name,
            suffix: combinedVData.suffix || prev.suffix,
          }));
        }
      }
    } catch {}
  }, [isGuestMode, activeEmail, activePhone, activeUserId, userProfile.email, userProfile.phone, userProfile.citizen_user_id]);

  useEffect(() => {
    async function loadData() {
      if (isGuestMode) {
        setIsLoadingApi(false);
        return;
      }
      setIsLoadingApi(true);
      await fetchProfileFromApi();
      setIsLoadingApi(false);
    }
    loadData();
  }, [isGuestMode, fetchProfileFromApi]);

  const handleRefresh = async () => {
    if (isGuestMode) return;
    setIsRefreshing(true);
    await fetchProfileFromApi();
    setIsRefreshing(false);
  };

  const handleSaveProfile = async (
    updatedData: { phone: string; email: string; address: string },
    onSuccess?: () => void
  ) => {
    setIsSavingProfile(true);

    setUserProfile((prev) => ({
      ...prev,
      phone: updatedData.phone,
      email: updatedData.email,
      address: updatedData.address,
    }));

    if (!isGuestMode) {
      await ProfileService.updateProfile({
        citizen_user_id: userProfile.citizen_user_id,
        email: updatedData.email,
        phone: updatedData.phone,
        address: updatedData.address,
      });
    }

    setIsSavingProfile(false);
    onSuccess?.();

    Alert.alert(
      "Profile Updated",
      "Your contact details have been successfully updated in your profile.",
    );
  };

  return {
    isGuestMode,
    isLoadingApi,
    isRefreshing,
    isSavingProfile,
    userProfile,
    setUserProfile,
    verificationStatus,
    verificationData,
    isCitizenApproved,
    effectiveCitizenIdNumber,
    verifiedPhotoUrl,
    verifiedMunicipalAddress,
    handleRefresh,
    handleSaveProfile,
  };
}
