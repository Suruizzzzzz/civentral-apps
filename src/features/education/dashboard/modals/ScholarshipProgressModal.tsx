import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/ScholarshipDashboard.styles';
import { ProgressStage } from '../details/detailHelpers';

export interface ScholarshipProgressModalProps {
  visible: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  stages?: ProgressStage[];
  timelineItems?: any[];
  scholarship?: any;
  currentPeriodString?: string | null;
  isWithdrawn?: boolean;
  isDisapproved?: boolean;
  withdrawalDate?: string | null;
  withdrawalReason?: string | null;
  application?: any;
  disapprovalCategory?: string;
  disapprovalRemarks?: string;
  disapprovalDate?: string | null;
  onBrowseScholarships?: () => void;
}

export function ScholarshipProgressModal({
  visible,
  onClose,
  isDarkMode,
  stages = [],
  timelineItems,
  scholarship,
  currentPeriodString,
  isWithdrawn = false,
  isDisapproved = false,
  withdrawalDate,
  withdrawalReason,
  application,
  disapprovalCategory,
  disapprovalRemarks,
  disapprovalDate,
  onBrowseScholarships,
}: ScholarshipProgressModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const stageList: ProgressStage[] =
    stages && stages.length > 0
      ? stages
      : (timelineItems as ProgressStage[]) || [];

  const handleBrowse = () => {
    onClose();
    if (onBrowseScholarships) {
      onBrowseScholarships();
    } else {
      router.push('/education/new-applicant/browse-scholarships' as any);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.progressModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Dismiss modal backdrop"
        />
        <View
          style={[
            styles.progressModalSheet,
            { paddingBottom: Math.max(insets.bottom, 24) },
            isDarkMode && {
              backgroundColor: '#1C2541',
              borderColor: '#3A506B',
            },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.progressModalHeader,
              isDarkMode && { borderBottomColor: '#293548' },
            ]}
          >
            <View style={styles.progressModalHeaderTextCol}>
              <Text
                style={[
                  styles.progressModalTitle,
                  isDarkMode && { color: '#C084FC' },
                ]}
              >
                Scholarship Progress
              </Text>
              <Text
                style={[
                  styles.progressModalSubtitle,
                  isDarkMode && { color: '#94A3B8' },
                ]}
                numberOfLines={1}
              >
                {scholarship?.program_name || 'Academic Scholarship'}
                {scholarship?.category_name
                  ? ` — ${scholarship.category_name}`
                  : ' — Senior High School'}
              </Text>
              <Text
                style={[
                  styles.progressModalSubtitle,
                  { fontSize: 11, marginTop: 1 },
                  isDarkMode && { color: '#64748B' },
                ]}
                numberOfLines={1}
              >
                {currentPeriodString || '2026–2027 • Whole Academic Year'}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.progressModalCloseBtn,
                isDarkMode && { backgroundColor: '#334155' },
              ]}
              onPress={onClose}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="Close"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <IconSymbol
                name="xmark"
                size={20}
                color={isDarkMode ? '#F8FAFC' : '#0F172A'}
              />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <ScrollView
            style={styles.progressModalBody}
            contentContainerStyle={{ paddingBottom: 24 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.verticalTimelineContainer}>
              {isWithdrawn ? (
                /* ==================================================== */
                /* WITHDRAWAL TIMELINE TERMINATION                     */
                /* ==================================================== */
                <>
                  {/* Render completed stages before withdrawal (e.g. Stage 1) */}
                  <View style={styles.verticalTimelineRow}>
                    <View style={styles.verticalTimelineLeftCol}>
                      <View
                        style={[
                          styles.verticalTimelineDot,
                          styles.verticalTimelineDotCompleted,
                        ]}
                      >
                        <IconSymbol
                          name="checkmark"
                          size={13}
                          color="#FFFFFF"
                        />
                      </View>
                      <View
                        style={[
                          styles.verticalTimelineConnector,
                          styles.verticalTimelineConnectorCompleted,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.verticalTimelineContentCard,
                        isDarkMode && {
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                        },
                      ]}
                    >
                      <View style={styles.verticalTimelineHeaderRow}>
                        <Text
                          style={[
                            styles.verticalTimelineTitle,
                            isDarkMode && { color: '#F8FAFC' },
                          ]}
                        >
                          Application Submitted
                        </Text>
                        <View
                          style={[
                            styles.verticalTimelineStatusPill,
                            {
                              backgroundColor: isDarkMode
                                ? '#064E3B'
                                : '#DCFCE7',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.verticalTimelineStatusPillText,
                              {
                                color: isDarkMode ? '#4ADE80' : '#15803D',
                              },
                            ]}
                          >
                            COMPLETED
                          </Text>
                        </View>
                      </View>
                      {stageList[0]?.date ? (
                        <Text
                          style={[
                            styles.verticalTimelineDate,
                            isDarkMode && { color: '#4ADE80' },
                          ]}
                        >
                          {stageList[0].date}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.verticalTimelineDesc,
                          isDarkMode && { color: '#94A3B8' },
                        ]}
                      >
                        Initial scholarship application and credentials submitted.
                      </Text>
                    </View>
                  </View>

                  {/* Terminal Divider */}
                  <View
                    style={[
                      styles.terminalDivider,
                      isDarkMode && { backgroundColor: '#334155' },
                    ]}
                  />

                  {/* TERMINAL WITHDRAWN CARD */}
                  <View
                    style={[
                      styles.withdrawnTerminalCard,
                      isDarkMode && {
                        backgroundColor: '#3B1D28',
                        borderColor: '#991B1B',
                      },
                    ]}
                  >
                    <View style={styles.withdrawnTerminalHeaderRow}>
                      <Text
                        style={[
                          styles.withdrawnTerminalTitle,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        APPLICATION WITHDRAWN
                      </Text>
                      <View
                        style={[
                          styles.withdrawnBadge,
                          isDarkMode && {
                            backgroundColor: '#4C1D24',
                            borderColor: '#F87171',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.withdrawnBadgeText,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          TERMINATED
                        </Text>
                      </View>
                    </View>

                    <View style={styles.withdrawnMetaRow}>
                      <Text
                        style={[
                          styles.withdrawnMetaLabel,
                          isDarkMode && { color: '#FCA5A5' },
                        ]}
                      >
                        Withdrawn on:
                      </Text>
                      <Text
                        style={[
                          styles.withdrawnMetaVal,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        {withdrawalDate}
                      </Text>
                    </View>

                    <View style={styles.withdrawnMetaRow}>
                      <Text
                        style={[
                          styles.withdrawnMetaLabel,
                          isDarkMode && { color: '#FCA5A5' },
                        ]}
                      >
                        Reason:
                      </Text>
                      <Text
                        style={[
                          styles.withdrawnMetaVal,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        {withdrawalReason}
                      </Text>
                    </View>

                    {application?.application_code ? (
                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Reference:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {application.application_code}
                        </Text>
                      </View>
                    ) : null}

                    <Text
                      style={[
                        styles.withdrawnNotice,
                        isDarkMode && { color: '#CBD5E1' },
                      ]}
                    >
                      This scholarship application has been permanently
                      terminated. You are eligible to apply for another
                      available scholarship program.
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.withdrawnBrowseBtn,
                        isDarkMode && { backgroundColor: '#7E22CE' },
                      ]}
                      onPress={handleBrowse}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Browse available scholarships"
                    >
                      <Text style={styles.withdrawnBrowseBtnText}>
                        Browse Available Scholarships
                      </Text>
                      <IconSymbol
                        name="chevron.right"
                        size={13}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : isDisapproved ? (
                /* ==================================================== */
                /* DISAPPROVAL TIMELINE TERMINATION                    */
                /* ==================================================== */
                <>
                  {/* Render completed stages before disapproval */}
                  <View style={styles.verticalTimelineRow}>
                    <View style={styles.verticalTimelineLeftCol}>
                      <View
                        style={[
                          styles.verticalTimelineDot,
                          styles.verticalTimelineDotCompleted,
                        ]}
                      >
                        <IconSymbol
                          name="checkmark"
                          size={13}
                          color="#FFFFFF"
                        />
                      </View>
                      <View
                        style={[
                          styles.verticalTimelineConnector,
                          styles.verticalTimelineConnectorCompleted,
                        ]}
                      />
                    </View>
                    <View
                      style={[
                        styles.verticalTimelineContentCard,
                        isDarkMode && {
                          backgroundColor: '#1E293B',
                          borderColor: '#334155',
                        },
                      ]}
                    >
                      <View style={styles.verticalTimelineHeaderRow}>
                        <Text
                          style={[
                            styles.verticalTimelineTitle,
                            isDarkMode && { color: '#F8FAFC' },
                          ]}
                        >
                          Application Submitted
                        </Text>
                        <View
                          style={[
                            styles.verticalTimelineStatusPill,
                            {
                              backgroundColor: isDarkMode
                                ? '#064E3B'
                                : '#DCFCE7',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.verticalTimelineStatusPillText,
                              {
                                color: isDarkMode ? '#4ADE80' : '#15803D',
                              },
                            ]}
                          >
                            COMPLETED
                          </Text>
                        </View>
                      </View>
                      {stageList[0]?.date ? (
                        <Text
                          style={[
                            styles.verticalTimelineDate,
                            isDarkMode && { color: '#4ADE80' },
                          ]}
                        >
                          {stageList[0].date}
                        </Text>
                      ) : null}
                      <Text
                        style={[
                          styles.verticalTimelineDesc,
                          isDarkMode && { color: '#94A3B8' },
                        ]}
                      >
                        Initial scholarship application and credentials submitted.
                      </Text>
                    </View>
                  </View>

                  {/* Terminal Divider */}
                  <View
                    style={[
                      styles.terminalDivider,
                      isDarkMode && { backgroundColor: '#334155' },
                    ]}
                  />

                  {/* TERMINAL DISAPPROVED CARD */}
                  <View
                    style={[
                      styles.withdrawnTerminalCard,
                      isDarkMode && {
                        backgroundColor: '#3B1D28',
                        borderColor: '#991B1B',
                      },
                    ]}
                  >
                    <View style={styles.withdrawnTerminalHeaderRow}>
                      <Text
                        style={[
                          styles.withdrawnTerminalTitle,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        APPLICATION DISAPPROVED
                      </Text>
                      <View
                        style={[
                          styles.withdrawnBadge,
                          isDarkMode && {
                            backgroundColor: '#4C1D24',
                            borderColor: '#F87171',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.withdrawnBadgeText,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          TERMINATED
                        </Text>
                      </View>
                    </View>

                    <View style={styles.withdrawnMetaRow}>
                      <Text
                        style={[
                          styles.withdrawnMetaLabel,
                          isDarkMode && { color: '#FCA5A5' },
                        ]}
                      >
                        Status:
                      </Text>
                      <Text
                        style={[
                          styles.withdrawnMetaVal,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        DISAPPROVED
                      </Text>
                    </View>

                    <View style={styles.withdrawnMetaRow}>
                      <Text
                        style={[
                          styles.withdrawnMetaLabel,
                          isDarkMode && { color: '#FCA5A5' },
                        ]}
                      >
                        Reason:
                      </Text>
                      <Text
                        style={[
                          styles.withdrawnMetaVal,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        {disapprovalCategory}
                      </Text>
                    </View>

                    {disapprovalRemarks ? (
                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Remarks:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {disapprovalRemarks}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.withdrawnMetaRow}>
                      <Text
                        style={[
                          styles.withdrawnMetaLabel,
                          isDarkMode && { color: '#FCA5A5' },
                        ]}
                      >
                        Decision Date:
                      </Text>
                      <Text
                        style={[
                          styles.withdrawnMetaVal,
                          isDarkMode && { color: '#F87171' },
                        ]}
                      >
                        {disapprovalDate}
                      </Text>
                    </View>

                    {application?.application_code ? (
                      <View style={styles.withdrawnMetaRow}>
                        <Text
                          style={[
                            styles.withdrawnMetaLabel,
                            isDarkMode && { color: '#FCA5A5' },
                          ]}
                        >
                          Reference:
                        </Text>
                        <Text
                          style={[
                            styles.withdrawnMetaVal,
                            isDarkMode && { color: '#F87171' },
                          ]}
                        >
                          {application.application_code}
                        </Text>
                      </View>
                    ) : null}

                    <Text
                      style={[
                        styles.withdrawnNotice,
                        isDarkMode && { color: '#CBD5E1' },
                      ]}
                    >
                      This application is no longer under active review. The
                      application remains available in your application history.
                    </Text>

                    <TouchableOpacity
                      style={[
                        styles.withdrawnBrowseBtn,
                        isDarkMode && { backgroundColor: '#7E22CE' },
                      ]}
                      onPress={handleBrowse}
                      activeOpacity={0.8}
                      accessibilityRole="button"
                      accessibilityLabel="Browse available scholarships"
                    >
                      <Text style={styles.withdrawnBrowseBtnText}>
                        Browse Available Scholarships
                      </Text>
                      <IconSymbol
                        name="chevron.right"
                        size={13}
                        color="#FFFFFF"
                      />
                    </TouchableOpacity>
                  </View>
                </>
              ) : (
                /* ==================================================== */
                /* NORMAL 5-STAGE PROGRESS TIMELINE                    */
                /* ==================================================== */
                stageList.map((stg, idx) => {
                  const isLast = idx === stageList.length - 1;
                  const isCompleted = stg.state === 'completed';
                  const isCurrent = stg.state === 'current';
                  const isUpcoming = stg.state === 'upcoming';

                  return (
                    <View key={stg.id} style={styles.verticalTimelineRow}>
                      {/* Left column: Dot and vertical connector */}
                      <View style={styles.verticalTimelineLeftCol}>
                        <View
                          style={[
                            styles.verticalTimelineDot,
                            isCompleted && styles.verticalTimelineDotCompleted,
                            isCurrent && [
                              styles.verticalTimelineDotCurrent,
                              isDarkMode && {
                                backgroundColor: '#2E1065',
                                borderColor: '#C084FC',
                              },
                            ],
                            isUpcoming && [
                              styles.verticalTimelineDotUpcoming,
                              isDarkMode && {
                                backgroundColor: '#1E293B',
                                borderColor: '#475569',
                              },
                            ],
                          ]}
                        >
                          {isCompleted ? (
                            <IconSymbol
                              name="checkmark"
                              size={13}
                              color="#FFFFFF"
                            />
                          ) : isCurrent ? (
                            <View
                              style={{
                                width: 10,
                                height: 10,
                                borderRadius: 5,
                                backgroundColor: isDarkMode
                                  ? '#C084FC'
                                  : '#7E22CE',
                              }}
                            />
                          ) : null}
                        </View>

                        {!isLast ? (
                          <View
                            style={[
                              styles.verticalTimelineConnector,
                              isCompleted &&
                                styles.verticalTimelineConnectorCompleted,
                              isDarkMode &&
                                !isCompleted && {
                                  backgroundColor: '#334155',
                                },
                            ]}
                          />
                        ) : null}
                      </View>

                      {/* Content card */}
                      <View
                        style={[
                          styles.verticalTimelineContentCard,
                          isCurrent && styles.verticalTimelineContentCardActive,
                          isDarkMode && {
                            backgroundColor: '#1E293B',
                            borderColor: isCurrent ? '#7E22CE' : '#334155',
                          },
                        ]}
                      >
                        <View style={styles.verticalTimelineHeaderRow}>
                          <Text
                            style={[
                              styles.verticalTimelineTitle,
                              isDarkMode && { color: '#F8FAFC' },
                            ]}
                          >
                            {stg.title}
                          </Text>

                          <View
                            style={[
                              styles.verticalTimelineStatusPill,
                              isCompleted
                                ? {
                                    backgroundColor: isDarkMode
                                      ? '#064E3B'
                                      : '#DCFCE7',
                                  }
                                : isCurrent
                                ? {
                                    backgroundColor: isDarkMode
                                      ? '#3B0764'
                                      : '#F3E8FF',
                                  }
                                : {
                                    backgroundColor: isDarkMode
                                      ? '#0F172A'
                                      : '#F1F5F9',
                                  },
                            ]}
                          >
                            <Text
                              style={[
                                styles.verticalTimelineStatusPillText,
                                isCompleted
                                  ? {
                                      color: isDarkMode ? '#4ADE80' : '#15803D',
                                    }
                                  : isCurrent
                                  ? {
                                      color: isDarkMode ? '#C084FC' : '#7E22CE',
                                    }
                                  : {
                                      color: isDarkMode ? '#64748B' : '#94A3B8',
                                    },
                              ]}
                            >
                              {isCompleted
                                ? 'COMPLETED'
                                : isCurrent
                                ? 'IN PROGRESS'
                                : 'UPCOMING'}
                            </Text>
                          </View>
                        </View>

                        {stg.date ? (
                          <Text
                            style={[
                              styles.verticalTimelineDate,
                              isDarkMode && { color: '#4ADE80' },
                            ]}
                          >
                            {stg.date}
                          </Text>
                        ) : null}

                        {stg.evaluatorName ? (
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 5,
                              marginTop: 4,
                            }}
                          >
                            <Ionicons
                              name="person-circle-outline"
                              size={13}
                              color={isDarkMode ? '#C084FC' : '#7E22CE'}
                            />
                            <Text
                              style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: isDarkMode ? '#C084FC' : '#7E22CE',
                              }}
                            >
                              Evaluated by: {stg.evaluatorName}
                            </Text>
                          </View>
                        ) : null}

                        <Text
                          style={[
                            styles.verticalTimelineDesc,
                            isDarkMode && { color: '#CBD5E1' },
                          ]}
                        >
                          {stg.description}
                        </Text>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
