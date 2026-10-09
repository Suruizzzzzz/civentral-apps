import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/src/context/ThemeContext';

export interface ScholarshipConsentModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
}

export function ScholarshipConsentModal({
  visible,
  onClose,
  onAccept,
}: ScholarshipConsentModalProps) {
  const { isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const [isChecked, setIsChecked] = useState(false);

  const handleClose = () => {
    setIsChecked(false);
    onClose();
  };

  const handleAccept = () => {
    if (!isChecked) return;
    setIsChecked(false);
    onAccept();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.backdropTouchArea} />
        </TouchableWithoutFeedback>

        <View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: isDarkMode ? '#1C2541' : '#FFFFFF',
              borderColor: isDarkMode ? '#3A506B' : '#E2E8F0',
            },
          ]}
        >
          {/* DRAG HANDLE */}
          <View style={styles.dragHandleContainer}>
            <View
              style={[
                styles.dragHandle,
                { backgroundColor: isDarkMode ? '#475569' : '#CBD5E1' },
              ]}
            />
          </View>

          {/* HEADER */}
          <View
            style={[
              styles.header,
              { borderBottomColor: isDarkMode ? '#334155' : '#F1F5F9' },
            ]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.iconCircle,
                  {
                    backgroundColor: isDarkMode ? '#0F2942' : '#EFF6FF',
                    borderColor: isDarkMode ? '#1E3A8A' : '#BFDBFE',
                  },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={22}
                  color={isDarkMode ? '#60A5FA' : '#2563EB'}
                />
              </View>
              <View style={styles.headerTextGroup}>
                <Text
                  style={[
                    styles.headerTitle,
                    { color: isDarkMode ? '#F8FAFC' : '#0F172A' },
                  ]}
                  numberOfLines={1}
                >
                  Scholarship Application Portal
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: isDarkMode ? '#94A3B8' : '#64748B' },
                  ]}
                  numberOfLines={1}
                >
                  Local Government Unit Educational Assistance
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleClose}
              style={[
                styles.closeButton,
                { backgroundColor: isDarkMode ? '#334155' : '#F1F5F9' },
              ]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
              accessibilityLabel="Close modal"
              accessibilityRole="button"
            >
              <Ionicons
                name="close"
                size={18}
                color={isDarkMode ? '#CBD5E1' : '#64748B'}
              />
            </TouchableOpacity>
          </View>

          {/* SCROLLABLE LEGAL DISCLAIMER CONTENT */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* 1. WELCOME & PURPOSE */}
            <View
              style={[
                styles.welcomeCard,
                {
                  backgroundColor: isDarkMode ? '#111827' : '#F8FAFC',
                  borderColor: isDarkMode ? '#374151' : '#E2E8F0',
                },
              ]}
            >
              <Text
                style={[
                  styles.welcomeText,
                  { color: isDarkMode ? '#E2E8F0' : '#334155' },
                ]}
              >
                Welcome to the Scholarship Application Portal of CIVENTRAL.
                Here, applicants can explore scholarship programs, review
                requirements, submit applications, and monitor their application
                status.
              </Text>
            </View>

            {/* 2. APPLICATION NOTICE CALLOUT */}
            <View
              style={[
                styles.calloutCard,
                {
                  backgroundColor: isDarkMode ? '#2D2006' : '#FFFBEB',
                  borderColor: isDarkMode ? '#92400E' : '#FDE68A',
                },
              ]}
            >
              <View style={styles.calloutHeaderRow}>
                <Ionicons
                  name="information-circle"
                  size={18}
                  color={isDarkMode ? '#FBBF24' : '#D97706'}
                />
                <Text
                  style={[
                    styles.calloutTitle,
                    { color: isDarkMode ? '#FCD34D' : '#92400E' },
                  ]}
                >
                  Application Notice
                </Text>
              </View>
              <Text
                style={[
                  styles.calloutBody,
                  { color: isDarkMode ? '#FDE68A' : '#78350F' },
                ]}
              >
                Application Notice: Submission does not guarantee approval. All
                applications are subject to evaluation and validation by
                authorized scholarship personnel.
              </Text>
            </View>

            {/* 3. AI-ASSISTED SCHOLARSHIP MATCHING CALLOUT */}
            <View
              style={[
                styles.calloutCard,
                {
                  backgroundColor: isDarkMode ? '#2E1065' : '#FAF5FF',
                  borderColor: isDarkMode ? '#7E22CE' : '#E9D5FF',
                },
              ]}
            >
              <View style={styles.calloutHeaderRow}>
                <Ionicons
                  name="sparkles"
                  size={18}
                  color={isDarkMode ? '#C084FC' : '#7E22CE'}
                />
                <Text
                  style={[
                    styles.calloutTitle,
                    { color: isDarkMode ? '#E9D5FF' : '#581C87' },
                  ]}
                >
                  AI-Assisted Scholarship Matching
                </Text>
              </View>
              <Text
                style={[
                  styles.calloutBody,
                  { color: isDarkMode ? '#DDD6FE' : '#4C1D95' },
                ]}
              >
                AI-Assisted Scholarship Matching: Applicants may select their
                educational level and answer pre-screening questions to receive
                potential scholarship recommendations from OpenAI based on
                relevant program information. These recommendations serve only
                as a guide and do not determine eligibility or guarantee
                approval. Applicants may also browse available programs without
                using this feature.
              </Text>
            </View>

            {/* 4. DATA PRIVACY NOTICE (R.A. 10173) */}
            <View
              style={[
                styles.calloutCard,
                {
                  backgroundColor: isDarkMode ? '#064E3B' : '#F0FDF4',
                  borderColor: isDarkMode ? '#059669' : '#BBF7D0',
                },
              ]}
            >
              <View style={styles.calloutHeaderRow}>
                <Ionicons
                  name="shield"
                  size={18}
                  color={isDarkMode ? '#34D399' : '#059669'}
                />
                <Text
                  style={[
                    styles.calloutTitle,
                    { color: isDarkMode ? '#A7F3D0' : '#065F46' },
                  ]}
                >
                  Data Privacy Notice (R.A. 10173)
                </Text>
              </View>
              <Text
                style={[
                  styles.calloutBody,
                  { color: isDarkMode ? '#D1FAE5' : '#064E3B' },
                ]}
              >
                Data Privacy Notice: Personal information will be processed by
                authorized LGU personnel for scholarship-related purposes in
                accordance with the Data Privacy Act of 2012 (RA 10173) and
                applicable privacy policies. By proceeding, applicants confirm
                that their submitted information is true and accurate and
                acknowledge its processing under the applicable privacy notice.
              </Text>
            </View>
          </ScrollView>

          {/* STICKY BOTTOM BAR */}
          <View
            style={[
              styles.bottomBar,
              {
                backgroundColor: isDarkMode ? '#1C2541' : '#FFFFFF',
                borderTopColor: isDarkMode ? '#334155' : '#E2E8F0',
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            {/* CHECKBOX ROW */}
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setIsChecked((prev) => !prev)}
              activeOpacity={0.8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isChecked }}
            >
              <View
                style={[
                  styles.checkboxBox,
                  {
                    borderColor: isChecked
                      ? '#2563EB'
                      : isDarkMode
                      ? '#64748B'
                      : '#94A3B8',
                    backgroundColor: isChecked
                      ? '#2563EB'
                      : isDarkMode
                      ? '#0F172A'
                      : '#FFFFFF',
                  },
                ]}
              >
                {isChecked && (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  { color: isDarkMode ? '#E2E8F0' : '#1E293B' },
                ]}
              >
                I confirm that my submitted information is true and accurate,
                and I consent to the collection and processing of my data under
                RA 10173.
              </Text>
            </TouchableOpacity>

            {/* BUTTON ACTIONS ROW */}
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[
                  styles.cancelBtn,
                  {
                    backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                    borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                  },
                ]}
                onPress={handleClose}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Cancel"
              >
                <Text
                  style={[
                    styles.cancelBtnText,
                    { color: isDarkMode ? '#CBD5E1' : '#475569' },
                  ]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.acceptBtn,
                  isChecked ? styles.acceptBtnEnabled : styles.acceptBtnDisabled,
                ]}
                onPress={handleAccept}
                disabled={!isChecked}
                activeOpacity={isChecked ? 0.8 : 1}
                accessibilityRole="button"
                accessibilityLabel="Accept & Continue"
                accessibilityState={{ disabled: !isChecked }}
              >
                <Text style={styles.acceptBtnText}>Accept &amp; Continue</Text>
                <Ionicons
                  name="arrow-forward"
                  size={15}
                  color="#FFFFFF"
                  style={{ marginLeft: 6 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  backdropTouchArea: {
    flex: 1,
  },
  sheetContainer: {
    maxHeight: '88%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  dragHandle: {
    width: 38,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerTextGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
  },
  welcomeCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  welcomeText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },
  calloutCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  calloutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  calloutTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  calloutBody: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: {
    fontSize: 13.5,
    fontWeight: '600',
  },
  acceptBtn: {
    flex: 1.6,
    paddingVertical: 13,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnEnabled: {
    backgroundColor: '#2563EB', // Tailwind bg-blue-600
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  acceptBtnDisabled: {
    backgroundColor: '#93C5FD', // Light blue with lowered opacity
    opacity: 0.5,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
