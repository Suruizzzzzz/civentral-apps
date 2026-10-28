import { useCallback, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AuthService } from '@/src/services/auth-service';
import { ProfileService } from '@/src/services/profile-service';
import { getCandidateVerificationEndpoints } from '@/src/services/citizenVerificationService';
import { isApiValidationError, ApiValidationError } from '@/src/services/api-client';
import {
  CALOOCAN_DISTRICTS,
  CIVIL_STATUS_OPTIONS,
  CaloocanDistrict,
  PhilSysParsedData,
  SEX_OPTIONS,
  VALID_ID_TYPES,
} from './types';
import { PhotoPickerTarget } from './PhotoSourcePickerModal';

export function useCitizenVerificationWizard() {
  const currentUser = AuthService.getCurrentUser();
  const isGuest = AuthService.isGuestMode() || !currentUser.citizen_user_id;

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  const clearFieldError = useCallback((key: string) => {
    setFieldErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // STEP 1: Personal Details State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [suffix, setSuffix] = useState('');
  const [sex, setSex] = useState(SEX_OPTIONS[0]);
  const [placeOfBirth, setPlaceOfBirth] = useState('Civentral City');
  const [birthDate, setBirthDate] = useState('1998-05-15');
  const [civilStatus, setCivilStatus] = useState(CIVIL_STATUS_OPTIONS[0]);
  const [isCivilStatusDropdownOpen, setIsCivilStatusDropdownOpen] = useState(false);

  // Birthdate Dropdown Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calYear, setCalYear] = useState(1998);
  const [calMonth, setCalMonth] = useState(4); // May (0-indexed)
  const [, setCalDay] = useState(15);
  const [isCalMonthDropdownOpen, setIsCalMonthDropdownOpen] = useState(false);
  const [isCalYearDropdownOpen, setIsCalYearDropdownOpen] = useState(false);

  // Demographic Information State
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [isEmploymentDropdownOpen, setIsEmploymentDropdownOpen] = useState(false);
  const [occupation, setOccupation] = useState('');
  const [isOccupationDropdownOpen, setIsOccupationDropdownOpen] = useState(false);
  const [educationalAttainment, setEducationalAttainment] = useState('');
  const [isEducationDropdownOpen, setIsEducationDropdownOpen] = useState(false);
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Status Guarding & Persistent State
  const [appStatus, setAppStatus] = useState<string | null>(null);
  const [appData, setAppData] = useState<any | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState<boolean>(true);

  // STEP 2: Residency State
  const [selectedDistrictId, setSelectedDistrictId] = useState(CALOOCAN_DISTRICTS[0].id);
  const activeDistrict = useMemo(
    () => CALOOCAN_DISTRICTS.find((d) => d.id === selectedDistrictId) || CALOOCAN_DISTRICTS[0],
    [selectedDistrictId]
  );
  const [barangay, setBarangay] = useState(activeDistrict.barangays[0]);
  const [isBarangayPickerVisible, setIsBarangayPickerVisible] = useState(false);
  const [barangaySearchQuery, setBarangaySearchQuery] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [yearsResident, setYearsResident] = useState('');

  // STEP 3: Valid ID, Liveness, 1x1 Photo & Signature State
  const [selectedIdType, setSelectedIdType] = useState(VALID_ID_TYPES[0]);
  const [isIdTypeDropdownOpen, setIsIdTypeDropdownOpen] = useState(false);
  const [idNumber, setIdNumber] = useState('');
  const [hasUploadedId, setHasUploadedId] = useState(false);
  const [, setHasLivenessCheck] = useState(false);
  const [idImageUri, setIdImageUri] = useState<string | null>(null);
  const [idBackImageUri, setIdBackImageUri] = useState<string | null>(null);
  const [selfieImageUri, setSelfieImageUri] = useState<string | null>(null);
  const [photo1x1Uri, setPhoto1x1Uri] = useState<string | null>(null);
  const [signatureUri, setSignatureUri] = useState<string | null>(null);

  // Modals State
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [isPhotoPickerVisible, setIsPhotoPickerVisible] = useState(false);
  const [photoPickerTarget, setPhotoPickerTarget] = useState<PhotoPickerTarget>('id');

  const loadCitizenData = useCallback(async () => {
    if (isGuest) {
      setIsLoadingStatus(false);
      return;
    }
    try {
      setIsLoadingStatus(true);
      const activeUser = AuthService.getCurrentUser();

      // 1. Query live verification status from citizen-backend
      const verifRes = await ProfileService.getVerificationStatus(
        activeUser.citizen_user_id || undefined,
        activeUser.email || undefined
      );

      if (!verifRes || verifRes.verification_status === 'Not_Submitted' || !verifRes.data) {
        setAppStatus('Not_Submitted');
        setAppData(null);
      } else if (verifRes && verifRes.status === 'success' && verifRes.data) {
        const d = verifRes.data;
        setAppStatus(d.verification_status || 'Not_Submitted');
        setAppData(d);

        if (d.verification_status === 'Returned_For_Correction' || d.verification_status === 'Rejected') {
          if (d.first_name) setFirstName(d.first_name);
          if (d.middle_name) setMiddleName(d.middle_name);
          if (d.last_name) setLastName(d.last_name);
          if (d.suffix) setSuffix(d.suffix);
          if (d.sex && SEX_OPTIONS.includes(d.sex)) setSex(d.sex);
          if (d.birth_date) setBirthDate(d.birth_date);
          if (d.place_of_birth) setPlaceOfBirth(d.place_of_birth);
          if (d.civil_status && CIVIL_STATUS_OPTIONS.includes(d.civil_status)) {
            setCivilStatus(d.civil_status);
          }
          if (d.employment_status) setEmploymentStatus(d.employment_status);
          if (d.occupation) setOccupation(d.occupation);
          if (d.educational_attainment) setEducationalAttainment(d.educational_attainment);
          if (d.district) {
            const matchedDistrict = CALOOCAN_DISTRICTS.find(
              (dist) => dist.shortName === d.district || dist.name === d.district
            );
            if (matchedDistrict) setSelectedDistrictId(matchedDistrict.id);
          }
          if (d.barangay) setBarangay(d.barangay);
          if (d.street_address) setStreetAddress(d.street_address);
          if (d.years_resident) setYearsResident(String(d.years_resident));
          if (d.valid_id_type && VALID_ID_TYPES.includes(d.valid_id_type)) {
            setSelectedIdType(d.valid_id_type);
          }
          if (d.valid_id_number) setIdNumber(d.valid_id_number);

          if (d.verification_status === 'Returned_For_Correction') {
            if (d.id_front_photo_url) {
              setIdImageUri(d.id_front_photo_url);
              setHasUploadedId(true);
            }
            if (d.selfie_photo_url) {
              setSelfieImageUri(d.selfie_photo_url);
              setHasLivenessCheck(true);
            }
            if (d.photo_1x1_url) {
              setPhoto1x1Uri(d.photo_1x1_url);
            }
            if (d.signature_photo_url) {
              setSignatureUri(d.signature_photo_url);
            }
          }
          setIsPrefilled(true);
        }
      } else {
        setAppStatus('Not_Submitted');
        setAppData(null);
      }

      // 2. Pre-fill from active auth session
      if (activeUser && activeUser.user) {
        const u = activeUser.user;
        setFirstName((prev) => prev || u.first_name || '');
        setMiddleName((prev) => prev || u.middle_name || '');
        setLastName((prev) => prev || u.last_name || '');
        setSuffix((prev) => prev || u.suffix || '');
        setIsPrefilled(true);
      }

      // 3. Fetch fresh profile details from DB via ProfileService
      if (activeUser.email || activeUser.citizen_user_id || activeUser.phone) {
        const res = await ProfileService.getProfile(
          activeUser.email || undefined,
          activeUser.citizen_user_id || undefined,
          activeUser.phone || undefined
        );

        if (res.status === 'success' && res.data) {
          const p = res.data;
          setFirstName((prev) => prev || p.first_name || '');
          setMiddleName((prev) => prev || p.middle_name || '');
          setLastName((prev) => prev || p.last_name || '');
          setSuffix((prev) => prev || p.suffix || '');
          if (p.birthDate) setBirthDate((prev) => prev || p.birthDate || '');
          if (p.civilStatus && CIVIL_STATUS_OPTIONS.includes(p.civilStatus)) {
            setCivilStatus((prev) => prev || p.civilStatus || '');
          }
          if (p.barangay) setBarangay((prev) => prev || p.barangay || '');
          if (p.address) setStreetAddress((prev) => prev || p.address || '');
          setIsPrefilled(true);
        }
      }
    } catch (err) {
      console.warn('Could not auto-fetch citizen registration info:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  }, [isGuest]);

  useEffect(() => {
    loadCitizenData();
  }, [loadCitizenData]);

  const handleOpenPhotoPicker = (target: PhotoPickerTarget) => {
    setPhotoPickerTarget(target);
    setIsPhotoPickerVisible(true);
  };

  const convertToDataUri = async (asset: ImagePicker.ImagePickerAsset): Promise<string> => {
    if (Platform.OS === 'web' && typeof document !== 'undefined' && asset.uri) {
      try {
        const compressed = await new Promise<string>((resolve) => {
          const img = new (window as any).Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => {
            const maxDim = 1200;
            let width = img.width;
            let height = img.height;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(asset.uri);
              return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => resolve(asset.uri);
          img.src = asset.uri;
        });
        if (compressed && compressed.startsWith('data:')) {
          return compressed;
        }
      } catch (err) {
        console.warn('Canvas compression error, falling back:', err);
      }
    }

    if (asset.base64) {
      const mime = asset.mimeType || 'image/jpeg';
      return `data:${mime};base64,${asset.base64}`;
    }
    if (asset.uri && (asset.uri.startsWith('blob:') || asset.uri.startsWith('http'))) {
      try {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        return await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Blob to data uri conversion error:', e);
      }
    }
    return asset.uri;
  };

  const handleTakePhoto = async () => {
    setIsPhotoPickerVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Camera access is required to capture your photo.');
        return;
      }

      const aspectVal: [number, number] | undefined =
        photoPickerTarget === 'photo1x1' ? [1, 1] : photoPickerTarget === 'signature' ? [3, 1] : undefined;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectVal,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = await convertToDataUri(result.assets[0]);
        if (photoPickerTarget === 'id') {
          setIdImageUri(uri);
          setHasUploadedId(true);
        } else if (photoPickerTarget === 'selfie') {
          setSelfieImageUri(uri);
          setHasLivenessCheck(true);
        } else if (photoPickerTarget === 'photo1x1') {
          setPhoto1x1Uri(uri);
        } else if (photoPickerTarget === 'signature') {
          setSignatureUri(uri);
        }
        setErrorMessage(null);
      }
    } catch (err) {
      console.warn('Camera error:', err);
      setErrorMessage('Failed to launch camera.');
    }
  };

  const handlePickFromGallery = async () => {
    setIsPhotoPickerVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        setErrorMessage('Photo gallery access is required to select an image.');
        return;
      }

      const aspectVal: [number, number] | undefined =
        photoPickerTarget === 'photo1x1' ? [1, 1] : photoPickerTarget === 'signature' ? [3, 1] : undefined;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: aspectVal,
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = await convertToDataUri(result.assets[0]);
        if (photoPickerTarget === 'id') {
          setIdImageUri(uri);
          setHasUploadedId(true);
        } else if (photoPickerTarget === 'selfie') {
          setSelfieImageUri(uri);
          setHasLivenessCheck(true);
        } else if (photoPickerTarget === 'photo1x1') {
          setPhoto1x1Uri(uri);
        } else if (photoPickerTarget === 'signature') {
          setSignatureUri(uri);
        }
        setErrorMessage(null);
      }
    } catch (err) {
      console.warn('Gallery picker error:', err);
      setErrorMessage('Failed to open photo gallery.');
    }
  };

  const handleRemovePhoto = (target: PhotoPickerTarget) => {
    if (target === 'id') {
      setIdImageUri(null);
      setHasUploadedId(false);
    } else if (target === 'selfie') {
      setSelfieImageUri(null);
      setHasLivenessCheck(false);
    } else if (target === 'photo1x1') {
      setPhoto1x1Uri(null);
    } else if (target === 'signature') {
      setSignatureUri(null);
    }
  };

  const filteredBarangays = useMemo(() => {
    const query = barangaySearchQuery.trim().toLowerCase();
    if (!query) return activeDistrict.barangays;
    return activeDistrict.barangays.filter((b) => b.toLowerCase().includes(query));
  }, [activeDistrict, barangaySearchQuery]);

  const handleSelectDistrict = (district: CaloocanDistrict) => {
    setSelectedDistrictId(district.id);
    setBarangay(district.barangays[0]);
    setBarangaySearchQuery('');
  };

  const daysInCalMonth = useMemo(() => {
    return new Date(calYear, calMonth + 1, 0).getDate();
  }, [calYear, calMonth]);

  const firstDayOfWeek = useMemo(() => {
    return new Date(calYear, calMonth, 1).getDay();
  }, [calYear, calMonth]);

  const handleSelectDay = (day: number) => {
    setCalDay(day);
    const mm = String(calMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    setBirthDate(`${calYear}-${mm}-${dd}`);
    setIsCalendarOpen(false);
  };

  const handlePrevMonth = () => {
    if (calMonth === 0) {
      setCalMonth(11);
      setCalYear((prev) => prev - 1);
    } else {
      setCalMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (calMonth === 11) {
      setCalMonth(0);
      setCalYear((prev) => prev + 1);
    } else {
      setCalMonth((prev) => prev + 1);
    }
  };

  const handleNextStep1 = () => {
    setErrorMessage(null);
    if (!firstName.trim()) {
      setErrorMessage('First name is required.');
      return;
    }
    if (!lastName.trim()) {
      setErrorMessage('Last name is required.');
      return;
    }
    if (!birthDate.trim()) {
      setErrorMessage('Date of birth is required (e.g. YYYY-MM-DD).');
      return;
    }
    if (!placeOfBirth.trim()) {
      setErrorMessage('Place of birth is required.');
      return;
    }
    if (!employmentStatus) {
      setErrorMessage('Please select your Employment Status under Demographic Information.');
      return;
    }
    if (!occupation) {
      setErrorMessage('Please select your Occupation under Demographic Information.');
      return;
    }
    if (!educationalAttainment) {
      setErrorMessage('Please select your Educational Attainment under Demographic Information.');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextStep2 = () => {
    setErrorMessage(null);
    if (!streetAddress.trim()) {
      setErrorMessage('Street address is required.');
      return;
    }
    if (!yearsResident.trim()) {
      setErrorMessage('Years of residency is required.');
      return;
    }
    setCurrentStep(3);
  };

  const handleAutofillPhilSys = (data: PhilSysParsedData) => {
    if (data.firstName) setFirstName(data.firstName);
    if (data.middleName) setMiddleName(data.middleName);
    if (data.lastName) setLastName(data.lastName);
    if (data.suffix) setSuffix(data.suffix);
    if (data.sex && SEX_OPTIONS.includes(data.sex)) setSex(data.sex);
    if (data.birthDate) setBirthDate(data.birthDate);
    if (data.placeOfBirth) setPlaceOfBirth(data.placeOfBirth);
    if (data.psn) setIdNumber(data.psn);
    if (data.address) setStreetAddress(data.address);
    setErrorMessage(null);
  };

  const handleSubmitVerification = async () => {
    setErrorMessage(null);

    const activeUser = AuthService.getCurrentUser();
    if (AuthService.isGuestMode() || !activeUser.citizen_user_id) {
      setErrorMessage('You must be signed in with an active account to submit citizen verification.');
      return;
    }

    if (!idNumber.trim()) {
      setErrorMessage('Government ID number is required.');
      return;
    }
    if (!hasUploadedId) {
      setErrorMessage('Please capture or upload a copy of your valid ID.');
      return;
    }
    if (!photo1x1Uri) {
      setErrorMessage('Please upload or capture your official 1x1 applicant photo.');
      return;
    }
    if (!signatureUri) {
      setErrorMessage('Please provide your digital applicant signature.');
      return;
    }

    setIsSubmitting(true);
    try {
      let finalIdPhoto = idImageUri;
      if (finalIdPhoto && finalIdPhoto.startsWith('blob:')) {
        try {
          const r = await fetch(finalIdPhoto);
          const b = await r.blob();
          finalIdPhoto = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(b);
          });
        } catch (e) {
          console.warn('Could not convert blob ID photo to base64:', e);
        }
      }

      let finalSelfiePhoto = selfieImageUri;
      if (finalSelfiePhoto && finalSelfiePhoto.startsWith('blob:')) {
        try {
          const r = await fetch(finalSelfiePhoto);
          const b = await r.blob();
          finalSelfiePhoto = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(b);
          });
        } catch (e) {
          console.warn('Could not convert blob selfie photo to base64:', e);
        }
      }

      let finalPhoto1x1 = photo1x1Uri;
      if (finalPhoto1x1 && finalPhoto1x1.startsWith('blob:')) {
        try {
          const r = await fetch(finalPhoto1x1);
          const b = await r.blob();
          finalPhoto1x1 = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(b);
          });
        } catch (e) {
          console.warn('Could not convert blob 1x1 photo to base64:', e);
        }
      }

      let finalSignature = signatureUri;
      if (finalSignature && finalSignature.startsWith('blob:')) {
        try {
          const r = await fetch(finalSignature);
          const b = await r.blob();
          finalSignature = await new Promise<string>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => res(reader.result as string);
            reader.readAsDataURL(b);
          });
        } catch (e) {
          console.warn('Could not convert blob signature to base64:', e);
        }
      }

      const payload = {
        citizen_user_id: activeUser.citizen_user_id || undefined,
        email: activeUser.email || undefined,
        phone: activeUser.phone || undefined,
        first_name: firstName.trim(),
        middle_name: middleName.trim() || null,
        last_name: lastName.trim(),
        suffix: suffix.trim() || null,
        sex,
        place_of_birth: placeOfBirth.trim(),
        birth_date: birthDate,
        civil_status: civilStatus,
        employment_status: employmentStatus,
        occupation,
        educational_attainment: educationalAttainment,
        district: activeDistrict.shortName,
        barangay,
        street_address: streetAddress.trim(),
        years_resident: parseInt(yearsResident.trim(), 10) || 1,
        valid_id_type: selectedIdType,
        valid_id_number: idNumber.trim(),
        id_front_photo_url: finalIdPhoto || null,
        id_back_photo_url: idBackImageUri || null,
        selfie_photo_url: finalSelfiePhoto || null,
        photo_1x1_url: finalPhoto1x1 || null,
        signature_photo_url: finalSignature || null,
      };

      const candidateEndpoints = getCandidateVerificationEndpoints();

      let isSuccess = false;
      let lastErrorMessage = '';

      for (const endpoint of candidateEndpoints) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), 12000);
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal,
          });
          clearTimeout(timer);

          const data = await res.json().catch(() => null);

          if (res.status === 422 || (data && data.errors && res.status >= 400)) {
            throw new ApiValidationError(
              data?.message || 'Verification validation failed.',
              data?.errors || {},
              422
            );
          }

          if (res.ok && data && (data.status === 'success' || data.success === true)) {
            isSuccess = true;
            break;
          } else if (
            res.status === 409 ||
            (data &&
              data.message &&
              (data.message.includes('already have an active application') ||
                data.message.includes('already verified')))
          ) {
            lastErrorMessage = data?.message || 'You already have an active application under review.';
            const refreshRes = await ProfileService.getVerificationStatus(
              activeUser.citizen_user_id || undefined,
              activeUser.email || undefined
            );
            if (refreshRes?.data) {
              setAppStatus(refreshRes.data.verification_status);
              setAppData(refreshRes.data);
            }
            break;
          } else if (data && data.message) {
            lastErrorMessage = data.message;
          }
        } catch (fetchErr: any) {
          lastErrorMessage = fetchErr?.message || 'Connection failed';
        }
      }

      if (isSuccess) {
        setCurrentStep(4);
      } else {
        setErrorMessage(
          lastErrorMessage ||
            'Failed to submit verification to the registry database. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Citizen Registry verification error:', err);
      if (isApiValidationError(err)) {
        setFieldErrors(err.errors || {});
        const topErrors = err.getAllErrors().slice(0, 2).join(', ');
        setErrorMessage(`Please check the highlighted fields: ${topErrors}`);
      } else {
        setErrorMessage(err?.message || 'An unexpected error occurred during submission.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isGuest,
    currentStep,
    setCurrentStep,
    errorMessage,
    setErrorMessage,
    fieldErrors,
    clearFieldError,
    isSubmitting,
    firstName,
    setFirstName,
    middleName,
    setMiddleName,
    lastName,
    setLastName,
    suffix,
    setSuffix,
    sex,
    setSex,
    placeOfBirth,
    setPlaceOfBirth,
    birthDate,
    civilStatus,
    setCivilStatus,
    isCivilStatusDropdownOpen,
    setIsCivilStatusDropdownOpen,
    isCalendarOpen,
    setIsCalendarOpen,
    calYear,
    setCalYear,
    calMonth,
    setCalMonth,
    isCalMonthDropdownOpen,
    setIsCalMonthDropdownOpen,
    isCalYearDropdownOpen,
    setIsCalYearDropdownOpen,
    handleSelectDay,
    handlePrevMonth,
    handleNextMonth,
    daysInCalMonth,
    firstDayOfWeek,
    employmentStatus,
    setEmploymentStatus,
    isEmploymentDropdownOpen,
    setIsEmploymentDropdownOpen,
    occupation,
    setOccupation,
    isOccupationDropdownOpen,
    setIsOccupationDropdownOpen,
    educationalAttainment,
    setEducationalAttainment,
    isEducationDropdownOpen,
    setIsEducationDropdownOpen,
    isPrefilled,
    appStatus,
    appData,
    isLoadingStatus,
    selectedDistrictId,
    activeDistrict,
    handleSelectDistrict,
    barangay,
    setBarangay,
    isBarangayPickerVisible,
    setIsBarangayPickerVisible,
    barangaySearchQuery,
    setBarangaySearchQuery,
    filteredBarangays,
    streetAddress,
    setStreetAddress,
    yearsResident,
    setYearsResident,
    selectedIdType,
    setSelectedIdType,
    isIdTypeDropdownOpen,
    setIsIdTypeDropdownOpen,
    idNumber,
    setIdNumber,
    idImageUri,
    idBackImageUri,
    setIdBackImageUri,
    selfieImageUri,
    photo1x1Uri,
    signatureUri,
    setSignatureUri,
    isSignaturePadOpen,
    setIsSignaturePadOpen,
    isPhotoPickerVisible,
    setIsPhotoPickerVisible,
    photoPickerTarget,
    handleOpenPhotoPicker,
    handleTakePhoto,
    handlePickFromGallery,
    handleRemovePhoto,
    handleNextStep1,
    handleNextStep2,
    handleAutofillPhilSys,
    handleSubmitVerification,
    loadCitizenData,
  };
}
