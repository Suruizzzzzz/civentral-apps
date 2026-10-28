import React from 'react';
import {
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { styles } from './styles/NewApplicantApplication.styles';

import {
  Step1PersonalInfo,
  Step3AcademicBackground,
  Step5DocumentUploads,
  Step6VideoDeclaration,
  ConfirmSubmitModal,
  FullVideoGuideModal,
  SchoolModal,
  CourseModal,
  SuffixModal,
  WizardStepperHeader,
  ApplicationSuccessView,
  useNewApplicantWizard,
  SUFFIX_OPTIONS,
  formatPhoneNumber,
} from './steps';

const videoDeclarationGuideImg = require('@/assets/images/video-inter.png');

export function NewApplicantApplicationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    program_id?: string | string[];
    programId?: string | string[];
    id?: string | string[];
    selectedProgramId?: string | string[];
    program?: any;
    program_name?: string;
    programName?: string;
    [key: string]: any;
  }>();

  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const w = useNewApplicantWizard(params, router);

  if (w.submitResult) {
    return (
      <ApplicationSuccessView
        submitResult={w.submitResult}
        isDarkMode={isDarkMode}
        onTrackApplication={() => {
          if (router.canDismiss?.()) {
            router.dismissAll();
          }
          router.replace('/education/dashboard' as any);
        }}
      />
    );
  }

  return (
    <ScrollView
      ref={w.scrollViewRef}
      contentContainerStyle={[
        styles.container,
        { paddingBottom: Math.max(140, insets.bottom + 100) },
      ]}
      showsVerticalScrollIndicator={false}
      style={{ backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC' }}
      refreshControl={
        <RefreshControl
          refreshing={w.refreshing}
          onRefresh={w.onRefresh}
          tintColor={isDarkMode ? '#38BDF8' : '#0284C7'}
          colors={['#0284C7']}
        />
      }
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={w.handleTopBackPress}
        activeOpacity={0.7}
      >
        <View
          style={[
            styles.backIconCircle,
            isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
          ]}
        >
          <IconSymbol
            name="chevron.left"
            size={18}
            color={isDarkMode ? '#38BDF8' : '#0284C7'}
          />
        </View>
        <Text style={[styles.backText, isDarkMode && { color: '#38BDF8' }]}>
          {w.currentStep === 1
            ? 'Back to Details'
            : w.currentStep === 2
              ? 'Back to Personal'
              : 'Back to Academic'}
        </Text>
      </TouchableOpacity>

      {/* ERROR STATE */}
      {w.fetchError ? (
        <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
            {w.fetchError}
          </Text>
          <TouchableOpacity
            style={{
              backgroundColor: '#0284C7',
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 8,
              alignSelf: 'flex-start',
            }}
            onPress={() => {
              w.setIsLoading(true);
              w.loadData();
            }}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : w.isLoading ? (
        <View style={{ gap: 16 }}>
          <Skeleton height={120} borderRadius={16} />
          <Skeleton height={220} borderRadius={16} />
          <Skeleton height={240} borderRadius={16} />
        </View>
      ) : w.program ? (
        <>
          {/* SUBMIT ERROR BANNER */}
          {w.submitError ? (
            <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 14, marginBottom: 14 }]}>
              <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
                {w.submitError}
              </Text>
            </View>
          ) : null}

          {/* STEPPER & PROGRAM HEADER */}
          <WizardStepperHeader
            program={w.program}
            currentStep={w.currentStep}
            isDarkMode={isDarkMode}
            onGoToStep={w.handleGoToStep}
          />

          {/* STEP 1: PERSONAL INFORMATION */}
          {w.currentStep === 1 ? (
            <Step1PersonalInfo
              email={w.email}
              setEmail={w.setEmail}
              phoneDigits={w.phoneDigits}
              handlePhoneChange={w.handlePhoneChange}
              formatPhoneNumber={formatPhoneNumber}
              firstName={w.firstName}
              setFirstName={w.setFirstName}
              middleName={w.middleName}
              setMiddleName={w.setMiddleName}
              noMiddleName={w.noMiddleName}
              setNoMiddleName={w.setNoMiddleName}
              lastName={w.lastName}
              setLastName={w.setLastName}
              suffix={w.suffix}
              residentialAddress={w.residentialAddress}
              setResidentialAddress={w.setResidentialAddress}
              isVerifiedCitizen={w.isVerifiedCitizen}
              citizenVerificationData={w.citizenVerificationData}
              isVerificationLoading={w.isVerificationLoading}
              isNoticeDismissed={w.isNoticeDismissed}
              setIsNoticeDismissed={w.setIsNoticeDismissed}
              isSubmitting={w.isSubmitting}
              isDarkMode={isDarkMode}
              insets={insets}
              onNext={w.handleNextFromStep1}
              onOpenSuffixModal={() => w.setShowSuffixModal(true)}
              onNavigateVerifyCitizen={() => router.push('/profile/verify' as any)}
            />
          ) : null}

          {/* STEP 2: ACADEMIC & SCHOOL INFORMATION */}
          {w.currentStep === 2 ? (
            <Step3AcademicBackground
              isDarkMode={isDarkMode}
              isManualSchool={w.isManualSchool}
              setIsManualSchool={w.setIsManualSchool}
              institutionName={w.institutionName}
              setInstitutionName={w.setInstitutionName}
              selectedPartnerSchool={w.selectedPartnerSchool}
              setSelectedPartnerSchoolId={w.setSelectedPartnerSchoolId}
              isSeniorHighProgram={w.isSeniorHighProgram}
              isManualCourse={w.isManualCourse}
              setIsManualCourse={w.setIsManualCourse}
              courseProgram={w.courseProgram}
              setCourseProgram={w.setCourseProgram}
              clearFieldError={w.clearFieldError}
              isCourseSuggestionSelected={w.isCourseSuggestionSelected}
              availableYearLevels={w.availableYearLevels}
              yearLevel={w.yearLevel}
              setYearLevel={w.setYearLevel}
              isYearDropdownOpen={w.isYearDropdownOpen}
              setIsYearDropdownOpen={w.setIsYearDropdownOpen}
              isSubmitting={w.isSubmitting}
              insets={insets}
              onOpenSchoolModal={() => {
                w.setSchoolSearchQuery('');
                w.setShowSchoolModal(true);
              }}
              onOpenCourseModal={() => {
                w.setCourseSearchQuery('');
                w.setShowCourseModal(true);
              }}
              onBack={w.handleBackToStep1}
              onNext={w.handleNextFromStep2}
            />
          ) : null}

          {/* STEP 3: REQUIRED DOCUMENTS & FINAL SUBMISSION */}
          {w.currentStep === 3 ? (
            <>
              <Step6VideoDeclaration
                firstName={w.firstName}
                middleName={w.middleName}
                lastName={w.lastName}
                suffix={w.suffix}
                verifiedFullName={w.verifiedFullName}
                email={w.email}
                phoneDigits={w.phoneDigits}
                formatPhoneNumber={formatPhoneNumber}
                isVerifiedCitizen={w.isVerifiedCitizen}
                citizenVerificationData={w.citizenVerificationData}
                residentialAddress={w.residentialAddress}
                institutionName={w.institutionName}
                selectedPartnerSchool={w.selectedPartnerSchool}
                courseProgram={w.courseProgram}
                yearLevel={w.yearLevel}
                isFormValid={w.isFormValid}
                isSubmitting={w.isSubmitting}
                isDarkMode={isDarkMode}
                insets={insets}
                onEditDetails={() => w.handleGoToStep(1)}
                onBack={w.handleBackToStep2}
                onSubmitPress={w.handleSubmitPress}
              />

              <Step5DocumentUploads
                requiredDocsList={w.requiredDocsList}
                files={w.files}
                docValidations={w.docValidations}
                fieldErrors={w.fieldErrors}
                onPickDocument={w.handlePickDocument}
                onOpenFullGuideModal={() => w.setShowFullGuideModal(true)}
                videoDeclarationGuideImg={videoDeclarationGuideImg}
                isDarkMode={isDarkMode}
              />
            </>
          ) : null}
        </>
      ) : null}

      {/* CONFIRMATION MODAL */}
      <ConfirmSubmitModal
        visible={w.showConfirmModal}
        onClose={() => !w.isSubmitting && w.setShowConfirmModal(false)}
        onConfirm={w.handleConfirmSubmit}
        isSubmitting={w.isSubmitting}
        isDarkMode={isDarkMode}
        isVerifiedCitizen={w.isVerifiedCitizen}
        citizenVerificationData={w.citizenVerificationData}
        programName={w.program?.program_name}
      />

      {/* FULL VIDEO GUIDE MODAL */}
      <FullVideoGuideModal
        visible={w.showFullGuideModal}
        onClose={() => w.setShowFullGuideModal(false)}
        isDarkMode={isDarkMode}
        videoDeclarationGuideImg={videoDeclarationGuideImg}
      />

      {/* PARTNER SCHOOL SELECTION MODAL */}
      <SchoolModal
        visible={w.showSchoolModal}
        onClose={() => w.setShowSchoolModal(false)}
        isDarkMode={isDarkMode}
        schoolSearchQuery={w.schoolSearchQuery}
        setSchoolSearchQuery={w.setSchoolSearchQuery}
        onSelectManual={() => {
          w.setIsManualSchool(true);
          w.setSelectedPartnerSchoolId(null);
          w.setShowSchoolModal(false);
        }}
        modalFilteredPartnerSchools={w.modalFilteredPartnerSchools}
        selectedPartnerSchoolId={w.selectedPartnerSchoolId}
        onSelectSchool={(school) => {
          w.setInstitutionName(school.institution_name);
          w.setSelectedPartnerSchoolId(school.institution_id);
          w.setIsManualSchool(false);
          w.setShowSchoolModal(false);
        }}
      />

      {/* COURSE / STRAND SELECTION MODAL */}
      <CourseModal
        visible={w.showCourseModal}
        onClose={() => w.setShowCourseModal(false)}
        isDarkMode={isDarkMode}
        isSeniorHighProgram={w.isSeniorHighProgram}
        courseSearchQuery={w.courseSearchQuery}
        setCourseSearchQuery={w.setCourseSearchQuery}
        onSelectManual={() => {
          w.setIsManualCourse(true);
          w.setShowCourseModal(false);
        }}
        modalFilteredCourses={w.modalFilteredCourses}
        courseProgram={w.courseProgram}
        onSelectCourse={w.handleSelectCourse}
      />

      {/* SUFFIX SELECTION MODAL */}
      <SuffixModal
        visible={w.showSuffixModal}
        onClose={() => w.setShowSuffixModal(false)}
        isDarkMode={isDarkMode}
        suffix={w.suffix}
        suffixOptions={SUFFIX_OPTIONS}
        onSelectSuffix={(opt) => {
          w.setSuffix(opt === 'None' ? '' : opt);
          w.setShowSuffixModal(false);
        }}
      />
    </ScrollView>
  );
}
