import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { PartnerSchoolLookupItem } from '../api/ScholarshipProgramApi';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface Step3AcademicBackgroundProps {
  isDarkMode: boolean;
  isManualSchool: boolean;
  setIsManualSchool: (val: boolean) => void;
  institutionName: string;
  setInstitutionName: (val: string) => void;
  selectedPartnerSchool: PartnerSchoolLookupItem | null | undefined;
  setSelectedPartnerSchoolId: (val: number | null) => void;
  isSeniorHighProgram: boolean;
  isManualCourse: boolean;
  setIsManualCourse: (val: boolean) => void;
  courseProgram: string;
  setCourseProgram: (val: string) => void;
  clearFieldError: (field: string) => void;
  isCourseSuggestionSelected: boolean;
  availableYearLevels: string[];
  yearLevel: string;
  setYearLevel: (val: string) => void;
  isYearDropdownOpen: boolean;
  setIsYearDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  gwa?: string;
  setGwa?: (val: string) => void;
  gradingScale?: 'point' | 'percentage';
  setGradingScale?: (val: 'point' | 'percentage') => void;
  isSubmitting: boolean;
  insets: { bottom: number; top: number; left: number; right: number };
  onOpenSchoolModal: () => void;
  onOpenCourseModal: () => void;
  onBack: () => void;
  onNext: () => void;
  stepNumber?: number;
  totalSteps?: number;
}

export function Step3AcademicBackground({
  isDarkMode,
  isManualSchool,
  setIsManualSchool,
  institutionName,
  setInstitutionName,
  selectedPartnerSchool,
  setSelectedPartnerSchoolId,
  isSeniorHighProgram,
  isManualCourse,
  setIsManualCourse,
  courseProgram,
  setCourseProgram,
  clearFieldError,
  isCourseSuggestionSelected,
  availableYearLevels,
  yearLevel,
  setYearLevel,
  isYearDropdownOpen,
  setIsYearDropdownOpen,
  gwa,
  setGwa,
  gradingScale = 'point',
  setGradingScale,
  isSubmitting,
  insets,
  onOpenSchoolModal,
  onOpenCourseModal,
  onBack,
  onNext,
  stepNumber = 2,
  totalSteps = 3,
}: Step3AcademicBackgroundProps) {
  return (
    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.stepHeaderRow}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
          Academic & School Information
        </Text>
        <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
          <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
            Step {stepNumber} of {totalSteps}
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Provide your current school, academic program, and year level.
      </Text>

      {/* SCHOOL / INSTITUTION */}
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={[styles.inputLabel, { marginBottom: 0 }, isDarkMode && { color: '#F8FAFC' }]}>
            School / Institution *
          </Text>
          {isManualSchool ? (
            <TouchableOpacity
              onPress={() => {
                setIsManualSchool(false);
                onOpenSchoolModal();
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                Select Partner School
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setIsManualSchool(true);
                setSelectedPartnerSchoolId(null);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                Enter manually
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isManualSchool ? (
          <>
            <TextInput
              style={[styles.textInput, isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' }]}
              value={institutionName}
              onChangeText={setInstitutionName}
              placeholder="Enter full school / institution name..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
              <Ionicons name="information-circle-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                Standard / Non-partner School
              </Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.textInput,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 44,
                },
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
              onPress={onOpenSchoolModal}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: institutionName ? '600' : '400',
                  color: institutionName
                    ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                    : (isDarkMode ? '#64748B' : '#94A3B8'),
                  flex: 1,
                  paddingRight: 8,
                }}
                numberOfLines={1}
              >
                {institutionName || 'Select registered partner school...'}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            {selectedPartnerSchool ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                  {selectedPartnerSchool.institution_code} · Registered Partner School
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                Choose your school from registered partner institutions.
              </Text>
            )}
          </>
        )}
      </View>

      {/* COURSE / PROGRAM */}
      <View style={styles.inputGroup}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={[styles.inputLabel, { marginBottom: 0 }, isDarkMode && { color: '#F8FAFC' }]}>
            {isSeniorHighProgram ? 'Strand / Track *' : 'Course / Program *'}
          </Text>
          {isManualCourse ? (
            <TouchableOpacity
              onPress={() => {
                setIsManualCourse(false);
                onOpenCourseModal();
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: '#0284C7' }}>
                Select from list
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => {
                setIsManualCourse(true);
              }}
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                Enter custom course
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {isManualCourse ? (
          <>
            <TextInput
              style={[
                styles.textInput,
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
              ]}
              value={courseProgram}
              onChangeText={(text) => {
                setCourseProgram(text);
                clearFieldError('course_program');
                clearFieldError('courseProgram');
              }}
              placeholder={
                isSeniorHighProgram
                  ? 'Enter Senior High strand / track...'
                  : 'Enter course or academic program...'
              }
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="words"
              editable={!isSubmitting}
            />
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
              <Ionicons name="information-circle-outline" size={14} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
                Custom Course / Non-standard Track
              </Text>
            </View>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={[
                styles.textInput,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 44,
                },
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
              onPress={onOpenCourseModal}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: courseProgram ? '600' : '400',
                  color: courseProgram
                    ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                    : (isDarkMode ? '#64748B' : '#94A3B8'),
                  flex: 1,
                  paddingRight: 8,
                }}
                numberOfLines={1}
              >
                {courseProgram || (isSeniorHighProgram ? 'Select Senior High strand...' : 'Select course / program...')}
              </Text>
              <Ionicons name="chevron-down" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>

            {isCourseSuggestionSelected ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 5 }}>
                <IconSymbol name="checkmark.circle.fill" size={14} color="#16A34A" />
                <Text style={{ fontSize: 12, fontWeight: '600', color: '#16A34A' }}>
                  {isSeniorHighProgram ? 'Accredited SHS Strand' : 'Recognized Academic Program'}
                </Text>
              </View>
            ) : (
              <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
                {isSeniorHighProgram
                  ? 'Choose from available SHS strands or enter custom track.'
                  : 'Choose your undergraduate program from the list.'}
              </Text>
            )}
          </>
        )}
      </View>

      {/* GRADE / YEAR LEVEL */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Grade / Year Level *
        </Text>
        {availableYearLevels.length > 0 ? (
          <>
            <TouchableOpacity
              style={[
                styles.textInput,
                {
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  minHeight: 44,
                },
                isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
              onPress={() => {
                setIsYearDropdownOpen((prev) => !prev);
              }}
              activeOpacity={0.7}
              disabled={isSubmitting}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: yearLevel ? '600' : '400',
                  color: yearLevel
                    ? (isDarkMode ? '#F8FAFC' : '#0F172A')
                    : (isDarkMode ? '#64748B' : '#94A3B8'),
                }}
              >
                {yearLevel || 'Select year level'}
              </Text>
              <Ionicons
                name={isYearDropdownOpen ? 'chevron-up' : 'chevron-down'}
                size={18}
                color={isDarkMode ? '#94A3B8' : '#64748B'}
              />
            </TouchableOpacity>

            {isYearDropdownOpen ? (
              <View
                style={{
                  marginTop: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isDarkMode ? '#334155' : '#E2E8F0',
                  backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                  overflow: 'hidden',
                }}
              >
                <View
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                    borderBottomWidth: 1,
                    borderBottomColor: isDarkMode ? '#334155' : '#E2E8F0',
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: '700',
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                    }}
                  >
                    Select Year Level
                  </Text>
                </View>

                {availableYearLevels.map((lvl, idx) => {
                  const isSelected = yearLevel === lvl;
                  return (
                    <TouchableOpacity
                      key={lvl}
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 11,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: isSelected
                          ? (isDarkMode ? '#1E293B' : '#F0F9FF')
                          : (isDarkMode ? '#0F172A' : '#FFFFFF'),
                        borderBottomWidth: idx < availableYearLevels.length - 1 ? 1 : 0,
                        borderBottomColor: isDarkMode ? '#1E293B' : '#F1F5F9',
                      }}
                      onPress={() => {
                        setYearLevel(lvl);
                        setIsYearDropdownOpen(false);
                      }}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: isSelected ? '700' : '500',
                          color: isSelected
                            ? (isDarkMode ? '#38BDF8' : '#0284C7')
                            : (isDarkMode ? '#F8FAFC' : '#1E293B'),
                        }}
                      >
                        {lvl}
                      </Text>
                      {isSelected ? (
                        <IconSymbol
                          name="checkmark"
                          size={15}
                          color={isDarkMode ? '#38BDF8' : '#0284C7'}
                        />
                      ) : null}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}
          </>
        ) : (
          <TextInput
            style={[
              styles.textInput,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            ]}
            value={yearLevel}
            onChangeText={setYearLevel}
            placeholder="e.g. 1st Year / Grade 11"
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            editable={!isSubmitting}
          />
        )}
      </View>

      {/* GWA INPUTS & GRADE SCALES (OPTIONAL / EXTENSIBLE) */}
      {setGwa ? (
        <View style={styles.inputGroup}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={[styles.inputLabel, { marginBottom: 0 }, isDarkMode && { color: '#F8FAFC' }]}>
              General Weighted Average (GWA)
            </Text>
            {setGradingScale ? (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity
                  onPress={() => setGradingScale('point')}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: gradingScale === 'point' ? (isDarkMode ? '#0369A1' : '#0284C7') : (isDarkMode ? '#334155' : '#E2E8F0'),
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: gradingScale === 'point' ? '#FFFFFF' : (isDarkMode ? '#94A3B8' : '#64748B') }}>
                    1.0 - 5.0
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setGradingScale('percentage')}
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 4,
                    backgroundColor: gradingScale === 'percentage' ? (isDarkMode ? '#0369A1' : '#0284C7') : (isDarkMode ? '#334155' : '#E2E8F0'),
                  }}
                >
                  <Text style={{ fontSize: 11, fontWeight: '600', color: gradingScale === 'percentage' ? '#FFFFFF' : (isDarkMode ? '#94A3B8' : '#64748B') }}>
                    Percentage (%)
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          <TextInput
            style={[
              styles.textInput,
              isDarkMode && { backgroundColor: '#0F172A', borderColor: '#334155', color: '#F8FAFC' },
            ]}
            value={gwa || ''}
            onChangeText={setGwa}
            placeholder={gradingScale === 'point' ? 'e.g. 1.25, 1.75' : 'e.g. 92.5%'}
            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
            keyboardType="decimal-pad"
            editable={!isSubmitting}
          />
          <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 4 }}>
            Enter your most recent semester or academic year general weighted average.
          </Text>
        </View>
      ) : null}

      {/* STEP NAVIGATION BUTTONS */}
      <View style={[styles.wizardNavRow, { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
        <TouchableOpacity
          style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
          onPress={onBack}
          activeOpacity={0.8}
        >
          <IconSymbol name="chevron.left" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
          <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.wizardNextBtn}
          onPress={onNext}
          activeOpacity={0.8}
        >
          <Text style={styles.wizardNextBtnText}>Next: Documents →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
