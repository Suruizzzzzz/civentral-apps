import React from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { PartnerSchoolLookupItem } from '../api/ScholarshipProgramApi';
import { CourseSuggestion } from '../constants/courseSuggestions';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface ConfirmSubmitModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting: boolean;
  isDarkMode: boolean;
  isVerifiedCitizen: boolean;
  citizenVerificationData?: any;
  programName?: string;
}

export function ConfirmSubmitModal({
  visible,
  onClose,
  onConfirm,
  isSubmitting,
  isDarkMode,
  isVerifiedCitizen,
  citizenVerificationData,
  programName,
}: ConfirmSubmitModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => !isSubmitting && onClose()}
    >
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={[styles.sectionCard, { width: '100%', padding: 20 }, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <Text style={[styles.sectionTitle, { fontSize: 18, marginBottom: 8 }, isDarkMode && { color: '#F8FAFC' }]}>
            Confirm Application Submission
          </Text>
          {isVerifiedCitizen ? (
            <View
              style={{
                backgroundColor: isDarkMode ? '#052E16' : '#DCFCE7',
                borderColor: isDarkMode ? '#15803D' : '#86EFAC',
                borderWidth: 1,
                borderRadius: 10,
                padding: 10,
                marginBottom: 12,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <IconSymbol name="checkmark.seal.fill" size={20} color={isDarkMode ? '#4ADE80' : '#15803D'} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: isDarkMode ? '#86EFAC' : '#15803D' }}>
                  Fast-Track Verified Citizen
                </Text>
                <Text style={{ fontSize: 11, color: isDarkMode ? '#BBF7D0' : '#166534', marginTop: 2 }}>
                  Citizen ID: {citizenVerificationData?.citizen_id_number || 'Approved'} •• Verified Profile
                </Text>
              </View>
            </View>
          ) : null}
          <Text style={[styles.docInstructions, { fontSize: 13, marginBottom: 16 }, isDarkMode && { color: '#CBD5E1' }]}>
            {`Are you sure you want to submit your application for "${programName || 'Scholarship'}"? Please verify that all uploaded documents are accurate and complete.`}
          </Text>

          <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'flex-end' }}>
            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 16,
                borderRadius: 8,
                backgroundColor: isDarkMode ? '#334155' : '#E2E8F0',
                opacity: isSubmitting ? 0.5 : 1,
              }}
              onPress={onClose}
              disabled={isSubmitting}
            >
              <Text style={{ fontWeight: '600', color: isDarkMode ? '#F8FAFC' : '#475569' }}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                paddingVertical: 10,
                paddingHorizontal: 18,
                borderRadius: 8,
                backgroundColor: '#0284C7',
                opacity: isSubmitting ? 0.7 : 1,
                minWidth: 140,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={onConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={{ fontWeight: '700', color: '#FFFFFF' }}>Confirm & Submit</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export interface FullVideoGuideModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  videoDeclarationGuideImg: any;
}

export function FullVideoGuideModal({
  visible,
  onClose,
  isDarkMode,
  videoDeclarationGuideImg,
}: FullVideoGuideModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.fullImageModalOverlay}>
        <View style={[styles.fullImageModalCard, isDarkMode && { backgroundColor: '#1E293B' }]}>
          <View style={styles.fullImageModalHeader}>
            <Text style={[styles.fullImageModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Video Declaration Guide
            </Text>
            <TouchableOpacity
              style={[styles.fullImageModalCloseBtn, isDarkMode && { backgroundColor: '#334155' }]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <IconSymbol name="xmark.circle.fill" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
              <Text style={[styles.fullImageModalCloseText, isDarkMode && { color: '#F8FAFC' }]}>Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.fullImageModalScroll} showsVerticalScrollIndicator={true}>
            <Image
              source={videoDeclarationGuideImg}
              style={styles.fullImageModalImage}
              resizeMode="contain"
            />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export interface SchoolModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  schoolSearchQuery: string;
  setSchoolSearchQuery: (val: string) => void;
  onSelectManual: () => void;
  modalFilteredPartnerSchools: PartnerSchoolLookupItem[];
  selectedPartnerSchoolId: number | null;
  onSelectSchool: (school: PartnerSchoolLookupItem) => void;
}

export function SchoolModal({
  visible,
  onClose,
  isDarkMode,
  schoolSearchQuery,
  setSchoolSearchQuery,
  onSelectManual,
  modalFilteredPartnerSchools,
  selectedPartnerSchoolId,
  onSelectSchool,
}: SchoolModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.schoolModalContainer, isDarkMode && { backgroundColor: '#0F172A' }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.schoolModalHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.schoolModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                Select Partner School
              </Text>
              <Text style={[styles.schoolModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                Choose from accredited partner institutions
              </Text>
            </View>
            <TouchableOpacity
              style={styles.schoolModalCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={[styles.schoolSearchContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="search" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={[styles.schoolSearchInput, isDarkMode && { color: '#F8FAFC' }]}
              value={schoolSearchQuery}
              onChangeText={setSchoolSearchQuery}
              placeholder="Search school name or code..."
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {schoolSearchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setSchoolSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* "School not listed? Enter manually" banner */}
          <TouchableOpacity
            style={[styles.manualSchoolBanner, isDarkMode && { backgroundColor: '#082F49', borderColor: '#0369A1' }]}
            onPress={onSelectManual}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.manualSchoolIconCircle}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.manualSchoolTitle, isDarkMode && { color: '#38BDF8' }]}>
                  School not listed? Enter manually
                </Text>
                <Text style={[styles.manualSchoolSubtitle, isDarkMode && { color: '#7DD3FC' }]}>
                  Apply with any standard or non-partner school
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
          </TouchableOpacity>

          {/* Partner Schools List */}
          <ScrollView
            style={{ maxHeight: 340 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {modalFilteredPartnerSchools.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Ionicons name="school-outline" size={40} color={isDarkMode ? '#475569' : '#CBD5E1'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8 }}>
                  No partner schools found
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2, textAlign: 'center' }}>
                  Tap the option above to enter your school manually.
                </Text>
              </View>
            ) : (
              modalFilteredPartnerSchools.map((school) => {
                const isSelected = selectedPartnerSchoolId === school.institution_id;
                return (
                  <TouchableOpacity
                    key={school.institution_id}
                    style={[
                      styles.schoolListItem,
                      isSelected && [styles.schoolListItemActive, isDarkMode && { backgroundColor: '#1E293B' }],
                      isDarkMode && { borderBottomColor: '#1E293B' },
                    ]}
                    onPress={() => onSelectSchool(school)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text
                        style={[
                          styles.schoolItemName,
                          isSelected && { color: '#0284C7' },
                          isDarkMode && { color: isSelected ? '#38BDF8' : '#F8FAFC' },
                        ]}
                        numberOfLines={2}
                      >
                        {school.institution_name}
                      </Text>
                      <Text style={{ fontSize: 11, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                        Registered Partner School
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={[styles.schoolCodeBadge, isDarkMode && { backgroundColor: '#1E293B' }]}>
                        <Text style={[styles.schoolCodeText, isDarkMode && { color: '#38BDF8' }]}>
                          {school.institution_code}
                        </Text>
                      </View>
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export interface CourseModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  isSeniorHighProgram: boolean;
  courseSearchQuery: string;
  setCourseSearchQuery: (val: string) => void;
  onSelectManual: () => void;
  modalFilteredCourses: CourseSuggestion[];
  courseProgram: string;
  onSelectCourse: (course: CourseSuggestion) => void;
}

export function CourseModal({
  visible,
  onClose,
  isDarkMode,
  isSeniorHighProgram,
  courseSearchQuery,
  setCourseSearchQuery,
  onSelectManual,
  modalFilteredCourses,
  courseProgram,
  onSelectCourse,
}: CourseModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalBackdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={[styles.schoolModalContainer, isDarkMode && { backgroundColor: '#0F172A' }]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={styles.schoolModalHeader}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={[styles.schoolModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
                {isSeniorHighProgram ? 'Select Senior High Strand' : 'Select Academic Program'}
              </Text>
              <Text style={[styles.schoolModalSubtitle, isDarkMode && { color: '#94A3B8' }]}>
                {isSeniorHighProgram
                  ? 'Accredited DepEd Senior High School Strands'
                  : 'Recognized College Degree Programs'}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.schoolModalCloseBtn}
              onPress={onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={[styles.schoolSearchContainer, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Ionicons name="search" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
            <TextInput
              style={[styles.schoolSearchInput, isDarkMode && { color: '#F8FAFC' }]}
              value={courseSearchQuery}
              onChangeText={setCourseSearchQuery}
              placeholder={isSeniorHighProgram ? 'Search strand name or code (e.g. STEM, ICT)...' : 'Search course name or code...'}
              placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
              autoCapitalize="none"
              clearButtonMode="while-editing"
            />
            {courseSearchQuery.length > 0 ? (
              <TouchableOpacity onPress={() => setCourseSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={isDarkMode ? '#94A3B8' : '#64748B'} />
              </TouchableOpacity>
            ) : null}
          </View>

          {/* "Other / Enter custom course" banner */}
          <TouchableOpacity
            style={[styles.manualSchoolBanner, isDarkMode && { backgroundColor: '#082F49', borderColor: '#0369A1' }]}
            onPress={onSelectManual}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
              <View style={styles.manualSchoolIconCircle}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.manualSchoolTitle, isDarkMode && { color: '#38BDF8' }]}>
                  Other / Enter custom course
                </Text>
                <Text style={[styles.manualSchoolSubtitle, isDarkMode && { color: '#7DD3FC' }]}>
                  {"Can't find your specific strand or program? Enter manually"}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
          </TouchableOpacity>

          {/* Course List */}
          <ScrollView
            style={{ maxHeight: 340 }}
            showsVerticalScrollIndicator={true}
            keyboardShouldPersistTaps="handled"
          >
            {modalFilteredCourses.length === 0 ? (
              <View style={{ paddingVertical: 32, alignItems: 'center' }}>
                <Ionicons name="book-outline" size={40} color={isDarkMode ? '#475569' : '#CBD5E1'} />
                <Text style={{ fontSize: 14, fontWeight: '600', color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8 }}>
                  No matching courses found
                </Text>
                <Text style={{ fontSize: 12, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2, textAlign: 'center' }}>
                  Tap the option above to enter your course manually.
                </Text>
              </View>
            ) : (
              modalFilteredCourses.map((course, idx) => {
                const selectedText = course.code ? `${course.name} (${course.code})` : course.name;
                const isSelected = courseProgram === selectedText || courseProgram === course.name;
                return (
                  <TouchableOpacity
                    key={`${course.name}_${course.code || idx}`}
                    style={[
                      styles.schoolListItem,
                      isSelected && [styles.schoolListItemActive, isDarkMode && { backgroundColor: '#1E293B' }],
                      isDarkMode && { borderBottomColor: '#1E293B' },
                    ]}
                    onPress={() => onSelectCourse(course)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1, paddingRight: 10 }}>
                      <Text
                        style={[
                          styles.schoolItemName,
                          isSelected && { color: '#0284C7' },
                          isDarkMode && { color: isSelected ? '#38BDF8' : '#F8FAFC' },
                        ]}
                        numberOfLines={2}
                      >
                        {course.name}
                      </Text>
                      <Text style={{ fontSize: 11, color: isDarkMode ? '#64748B' : '#94A3B8', marginTop: 2 }}>
                        {course.category || (isSeniorHighProgram ? 'Senior High School' : 'Degree Program')}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {course.code ? (
                        <View style={[styles.schoolCodeBadge, isDarkMode && { backgroundColor: '#1E293B' }]}>
                          <Text style={[styles.schoolCodeText, isDarkMode && { color: '#38BDF8' }]}>
                            {course.code}
                          </Text>
                        </View>
                      ) : null}
                      {isSelected ? (
                        <Ionicons name="checkmark-circle" size={18} color="#0284C7" />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export interface SuffixModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  suffix: string;
  suffixOptions: string[];
  onSelectSuffix: (opt: string) => void;
}

export function SuffixModal({
  visible,
  onClose,
  isDarkMode,
  suffix,
  suffixOptions,
  onSelectSuffix,
}: SuffixModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.suffixModalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          style={[styles.suffixModalCard, isDarkMode && { backgroundColor: '#1E293B' }]}
          onStartShouldSetResponder={() => true}
        >
          <Text style={[styles.suffixModalTitle, isDarkMode && { color: '#F8FAFC' }]}>
            Select Name Suffix
          </Text>
          {suffixOptions.map((opt) => {
            const isSelected = suffix === opt || (!suffix && opt === 'None');
            return (
              <TouchableOpacity
                key={opt}
                style={[styles.suffixModalItem, isDarkMode && { borderBottomColor: '#334155' }]}
                onPress={() => onSelectSuffix(opt)}
              >
                <Text
                  style={[
                    styles.suffixModalItemText,
                    isDarkMode && { color: '#CBD5E1' },
                    isSelected && styles.suffixModalItemTextActive,
                    isSelected && isDarkMode && { color: '#38BDF8' },
                  ]}
                >
                  {opt}
                </Text>
                {isSelected ? (
                  <IconSymbol name="checkmark" size={16} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}
