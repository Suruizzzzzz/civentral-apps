import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import {
  VerificationPersonalStep,
  VerificationResidencyStep,
  VerificationDocStep,
  LivenessSelfieStep,
  SignaturePadModal,
  VerificationReviewStep,
  VerificationSuccessStep,
  VerificationStatusGuards,
  VerificationReworkBanners,
  BarangayPickerModal,
  PhotoSourcePickerModal,
  useCitizenVerificationWizard,
} from '../verification';

export * from '../verification';

export function VerifyCitizenScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDarkMode } = useTheme();
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 20) + 12;

  const w = useCitizenVerificationWizard();
  const [showReviewStep, setShowReviewStep] = useState(false);

  const dmBg = isDarkMode ? '#0B132B' : '#F8FAFC';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';

  const isGuarded =
    w.isGuest ||
    w.isLoadingStatus ||
    ((w.appStatus === 'Pending' || w.appStatus === 'Under_Review') && w.appData) ||
    (w.appStatus === 'Approved' && w.appData);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: dmBg }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, { paddingTop: topPadding }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Navigation */}
          <View style={styles.headerRow}>
            <TouchableOpacity
              style={[styles.backButton, isDarkMode && { backgroundColor: '#1C2541' }]}
              onPress={() => router.replace('/(tabs)' as any)}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Back to Dashboard"
            >
              <IconSymbol name="chevron.left" size={20} color={isDarkMode ? '#FFFFFF' : '#0F172A'} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: dmText }]}>Verify Citizenship</Text>
            <View style={styles.headerRightPlaceholder} />
          </View>

          {/* STATUS GUARDS (Guest, In Review, Approved) */}
          {isGuarded ? (
            <VerificationStatusGuards
              isGuest={w.isGuest}
              isLoadingStatus={w.isLoadingStatus}
              appStatus={w.appStatus}
              appData={w.appData}
              onRefreshStatus={w.loadCitizenData}
              router={router}
              isDarkMode={isDarkMode}
            />
          ) : (
            <>
              {/* REWORK & REJECTION NOTICES */}
              <VerificationReworkBanners appStatus={w.appStatus} appData={w.appData} />

              {/* BANNER CARD */}
              {w.currentStep < 4 && (
                <View
                  style={[
                    styles.bannerCard,
                    { backgroundColor: isDarkMode ? '#0284C7' : '#176B87' },
                  ]}
                >
                  <View style={styles.bannerIconWrapper}>
                    <IconSymbol name="checkmark.seal.fill" size={26} color="#FFFFFF" />
                  </View>
                  <View style={styles.bannerTextWrapper}>
                    <Text style={styles.bannerTitle}>Official Citizen Verification</Text>
                    <Text style={styles.bannerSubtitle}>
                      Verify your Civentral City citizen account to access civic services and clearances.
                    </Text>
                  </View>
                </View>
              )}

              {/* STEP PROGRESS INDICATORS */}
              {w.currentStep < 4 && (
                <View style={styles.stepIndicatorRow}>
                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        w.currentStep === 1 && styles.stepCircleActive,
                        w.currentStep > 1 && styles.stepCircleCompleted,
                      ]}
                    >
                      {w.currentStep > 1 ? (
                        <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepNumber, w.currentStep === 1 && styles.stepNumberActive]}>
                          1
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, w.currentStep === 1 && styles.stepLabelActive]}>
                      Personal
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepConnector,
                      w.currentStep >= 2 && styles.stepConnectorActive,
                    ]}
                  />

                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        w.currentStep === 2 && styles.stepCircleActive,
                        w.currentStep > 2 && styles.stepCircleCompleted,
                      ]}
                    >
                      {w.currentStep > 2 ? (
                        <IconSymbol name="checkmark.circle.fill" size={16} color="#FFFFFF" />
                      ) : (
                        <Text style={[styles.stepNumber, w.currentStep === 2 && styles.stepNumberActive]}>
                          2
                        </Text>
                      )}
                    </View>
                    <Text style={[styles.stepLabel, w.currentStep === 2 && styles.stepLabelActive]}>
                      Residency
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.stepConnector,
                      w.currentStep >= 3 && styles.stepConnectorActive,
                    ]}
                  />

                  <View style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepCircle,
                        w.currentStep === 3 && styles.stepCircleActive,
                      ]}
                    >
                      <Text style={[styles.stepNumber, w.currentStep === 3 && styles.stepNumberActive]}>
                        3
                      </Text>
                    </View>
                    <Text style={[styles.stepLabel, w.currentStep === 3 && styles.stepLabelActive]}>
                      Valid ID
                    </Text>
                  </View>
                </View>
              )}

              {/* ERROR ALERT */}
              {w.errorMessage && <Text style={styles.errorText}>{w.errorMessage}</Text>}

              {/* STEP 1: PERSONAL INFORMATION */}
              {w.currentStep === 1 && (
                <VerificationPersonalStep
                  firstName={w.firstName}
                  setFirstName={w.setFirstName}
                  middleName={w.middleName}
                  setMiddleName={w.setMiddleName}
                  lastName={w.lastName}
                  setLastName={w.setLastName}
                  suffix={w.suffix}
                  setSuffix={w.setSuffix}
                  sex={w.sex}
                  setSex={w.setSex}
                  placeOfBirth={w.placeOfBirth}
                  setPlaceOfBirth={w.setPlaceOfBirth}
                  birthDate={w.birthDate}
                  civilStatus={w.civilStatus}
                  setCivilStatus={w.setCivilStatus}
                  isCivilStatusDropdownOpen={w.isCivilStatusDropdownOpen}
                  setIsCivilStatusDropdownOpen={w.setIsCivilStatusDropdownOpen}
                  isCalendarOpen={w.isCalendarOpen}
                  setIsCalendarOpen={w.setIsCalendarOpen}
                  calYear={w.calYear}
                  setCalYear={w.setCalYear}
                  calMonth={w.calMonth}
                  setCalMonth={w.setCalMonth}
                  isCalMonthDropdownOpen={w.isCalMonthDropdownOpen}
                  setIsCalMonthDropdownOpen={w.setIsCalMonthDropdownOpen}
                  isCalYearDropdownOpen={w.isCalYearDropdownOpen}
                  setIsCalYearDropdownOpen={w.setIsCalYearDropdownOpen}
                  handleSelectDay={w.handleSelectDay}
                  handlePrevMonth={w.handlePrevMonth}
                  handleNextMonth={w.handleNextMonth}
                  daysInCalMonth={w.daysInCalMonth}
                  firstDayOfWeek={w.firstDayOfWeek}
                  employmentStatus={w.employmentStatus}
                  setEmploymentStatus={w.setEmploymentStatus}
                  isEmploymentDropdownOpen={w.isEmploymentDropdownOpen}
                  setIsEmploymentDropdownOpen={w.setIsEmploymentDropdownOpen}
                  occupation={w.occupation}
                  setOccupation={w.setOccupation}
                  isOccupationDropdownOpen={w.isOccupationDropdownOpen}
                  setIsOccupationDropdownOpen={w.setIsOccupationDropdownOpen}
                  educationalAttainment={w.educationalAttainment}
                  setEducationalAttainment={w.setEducationalAttainment}
                  isEducationDropdownOpen={w.isEducationDropdownOpen}
                  setIsEducationDropdownOpen={w.setIsEducationDropdownOpen}
                  isPrefilled={w.isPrefilled}
                  clearFieldError={w.clearFieldError}
                  onNext={w.handleNextStep1}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* STEP 2: CIVENTRAL RESIDENCY & DISTRICT */}
              {w.currentStep === 2 && (
                <VerificationResidencyStep
                  selectedDistrictId={w.selectedDistrictId}
                  activeDistrict={w.activeDistrict}
                  handleSelectDistrict={w.handleSelectDistrict}
                  barangay={w.barangay}
                  setIsBarangayPickerVisible={w.setIsBarangayPickerVisible}
                  streetAddress={w.streetAddress}
                  setStreetAddress={w.setStreetAddress}
                  yearsResident={w.yearsResident}
                  setYearsResident={w.setYearsResident}
                  clearFieldError={w.clearFieldError}
                  onBack={() => w.setCurrentStep(1)}
                  onNext={w.handleNextStep2}
                  isDarkMode={isDarkMode}
                />
              )}

              {/* STEP 3: GOVERNMENT ID, BIOMETRICS & REVIEW DOSSIER */}
              {w.currentStep === 3 && (
                showReviewStep ? (
                  <VerificationReviewStep
                    firstName={w.firstName}
                    middleName={w.middleName}
                    lastName={w.lastName}
                    suffix={w.suffix}
                    sex={w.sex}
                    birthDate={w.birthDate}
                    placeOfBirth={w.placeOfBirth}
                    civilStatus={w.civilStatus}
                    employmentStatus={w.employmentStatus}
                    occupation={w.occupation}
                    educationalAttainment={w.educationalAttainment}
                    district={w.activeDistrict.shortName}
                    barangay={w.barangay}
                    streetAddress={w.streetAddress}
                    yearsResident={w.yearsResident}
                    selectedIdType={w.selectedIdType}
                    idNumber={w.idNumber}
                    idImageUri={w.idImageUri}
                    selfieImageUri={w.selfieImageUri}
                    photo1x1Uri={w.photo1x1Uri}
                    signatureUri={w.signatureUri}
                    appStatus={w.appStatus}
                    isSubmitting={w.isSubmitting}
                    onSubmit={w.handleSubmitVerification}
                    onBack={() => setShowReviewStep(false)}
                    onEditStep={(step) => {
                      setShowReviewStep(false);
                      w.setCurrentStep(step);
                    }}
                    isDarkMode={isDarkMode}
                  />
                ) : (
                  <>
                    <VerificationDocStep
                      selectedIdType={w.selectedIdType}
                      setSelectedIdType={w.setSelectedIdType}
                      isIdTypeDropdownOpen={w.isIdTypeDropdownOpen}
                      setIsIdTypeDropdownOpen={w.setIsIdTypeDropdownOpen}
                      idNumber={w.idNumber}
                      setIdNumber={w.setIdNumber}
                      clearFieldError={w.clearFieldError}
                      idImageUri={w.idImageUri}
                      idBackImageUri={w.idBackImageUri}
                      signatureUri={w.signatureUri}
                      onOpenPhotoPicker={w.handleOpenPhotoPicker}
                      onRemovePhoto={w.handleRemovePhoto}
                      onOpenSignaturePad={() => w.setIsSignaturePadOpen(true)}
                      onAutofillPhilSys={w.handleAutofillPhilSys}
                      onBack={() => w.setCurrentStep(2)}
                      onNext={() => setShowReviewStep(true)}
                      isDarkMode={isDarkMode}
                    />

                    <LivenessSelfieStep
                      selfieImageUri={w.selfieImageUri}
                      photo1x1Uri={w.photo1x1Uri}
                      onOpenPhotoPicker={w.handleOpenPhotoPicker}
                      onRemovePhoto={w.handleRemovePhoto}
                      onBack={() => w.setCurrentStep(2)}
                      onNext={() => setShowReviewStep(true)}
                      isDarkMode={isDarkMode}
                    />
                  </>
                )
              )}

              {/* STEP 4: SUCCESS / CONFIRMATION */}
              {w.currentStep === 4 && (
                <VerificationSuccessStep
                  firstName={w.firstName}
                  lastName={w.lastName}
                  sex={w.sex}
                  placeOfBirth={w.placeOfBirth}
                  employmentStatus={w.employmentStatus}
                  occupation={w.occupation}
                  educationalAttainment={w.educationalAttainment}
                  district={w.activeDistrict.shortName}
                  barangay={w.barangay}
                  selectedIdType={w.selectedIdType}
                  onReturnToDashboard={() => router.replace('/(tabs)')}
                  isDarkMode={isDarkMode}
                />
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL: BARANGAY SEARCH & PICKER */}
      <BarangayPickerModal
        visible={w.isBarangayPickerVisible}
        onClose={() => {
          w.setIsBarangayPickerVisible(false);
          w.setBarangaySearchQuery('');
        }}
        activeDistrict={w.activeDistrict}
        filteredBarangays={w.filteredBarangays}
        barangay={w.barangay}
        onSelectBarangay={(b) => {
          w.setBarangay(b);
          w.setIsBarangayPickerVisible(false);
          w.setBarangaySearchQuery('');
        }}
        barangaySearchQuery={w.barangaySearchQuery}
        setBarangaySearchQuery={w.setBarangaySearchQuery}
        isDarkMode={isDarkMode}
      />

      {/* MODAL: PHOTO SOURCE PICKER (Camera vs Gallery) */}
      <PhotoSourcePickerModal
        visible={w.isPhotoPickerVisible}
        onClose={() => w.setIsPhotoPickerVisible(false)}
        target={w.photoPickerTarget}
        onTakePhoto={w.handleTakePhoto}
        onPickFromGallery={w.handlePickFromGallery}
        isDarkMode={isDarkMode}
      />

      {/* MODAL: DIGITAL SIGNATURE PAD */}
      <SignaturePadModal
        visible={w.isSignaturePadOpen}
        onClose={() => w.setIsSignaturePadOpen(false)}
        onConfirm={(dataUri) => w.setSignatureUri(dataUri)}
        onUploadPhotoInstead={() => w.handleOpenPhotoPicker('signature')}
        isDarkMode={isDarkMode}
      />
    </SafeAreaView>
  );
}
