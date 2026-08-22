import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { useTheme } from '@/src/context/ThemeContext';
import { fetchMatchingEducationLevels, fetchPublicMatchingQuestions, submitPreScreen, EvaluatedProgram, MatchingQuestion, PreScreenResponse } from './api/ScholarshipProgramApi';
import { styles } from './styles/ScholarshipMatching.styles';

export function ScholarshipMatchingScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();

  const [educationLevels, setEducationLevels] = useState<string[]>([
    'Senior High School',
    'Tertiary',
    'Continuing Education/Vocational',
  ]);
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [questions, setQuestions] = useState<MatchingQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preScreenResult, setPreScreenResult] = useState<PreScreenResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchMatchingEducationLevels().then((levels) => {
      if (levels && levels.length > 0) {
        setEducationLevels(levels);
      }
    });
  }, []);

  const handleSelectLevel = async (level: string) => {
    setSelectedLevel(level);
    setAnswers({});
    setPreScreenResult(null);
    setErrorMessage(null);
    setIsLoadingQuestions(true);

    try {
      const qList = await fetchPublicMatchingQuestions(level);
      setQuestions(qList);
    } catch (err) {
      console.error('[ScholarshipMatchingScreen] fetch questions error:', err);
      setErrorMessage('Unable to load scholarship matching questions. Please try again.');
    } finally {
      setIsLoadingQuestions(false);
    }
  };

  const handleOptionSelect = (questionKey: string, optionValue: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: optionValue,
    }));
  };

  const handleRunMatching = async () => {
    if (!selectedLevel) return;

    const unanswered = questions.some((q) => {
      const val = answers[q.question_key];
      return val === undefined || val === null || String(val).trim() === '';
    });

    if (unanswered) {
      setErrorMessage('Please answer all pre-screening questions before running matching.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await submitPreScreen(selectedLevel, answers);
      setPreScreenResult(result);
    } catch (err) {
      console.error('[ScholarshipMatchingScreen] pre-screen submit error:', err);
      setErrorMessage('Failed to compute scholarship matching results. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setPreScreenResult(null);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      style={{
        backgroundColor: isDarkMode ? '#0B132B' : '#F8FAFC',
      }}
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <IconSymbol
          name="chevron.right"
          size={16}
          color={isDarkMode ? '#FB923C' : '#EA580C'}
          style={styles.backIcon}
        />
        <Text style={[styles.backText, isDarkMode && { color: '#FB923C' }]}>
          Back
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, isDarkMode && { color: '#F8FAFC' }]}>
          Scholarship Pre-Screening
        </Text>
        <Text style={[styles.headerSubtitle, isDarkMode && { color: '#94A3B8' }]}>
          Select your current education level and answer brief pre-screening questions to evaluate your eligibility.
        </Text>
      </View>

      {/* ERROR BANNER */}
      {errorMessage ? (
        <View style={[styles.sectionCard, { borderColor: '#EF4444', borderWidth: 1, padding: 16, marginBottom: 16 }]}>
          <Text style={{ color: '#EF4444', fontSize: 14, fontWeight: '600' }}>
            {errorMessage}
          </Text>
        </View>
      ) : null}

      {!preScreenResult ? (
        /* QUESTIONNAIRE STEP */
        <>
          {/* STEP 1: EDUCATION LEVEL SELECTION */}
          <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
            <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
              Step 1: Select Education Level
            </Text>
            <View style={styles.levelGrid}>
              {educationLevels.map((level) => {
                const isSelected = selectedLevel === level;
                return (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.levelChip,
                      isSelected && styles.levelChipActive,
                      isDarkMode && !isSelected && { backgroundColor: '#334155', borderColor: '#475569' },
                    ]}
                    onPress={() => handleSelectLevel(level)}
                  >
                    <Text
                      style={[
                        styles.levelChipText,
                        isSelected && styles.levelChipTextActive,
                        isDarkMode && !isSelected && { color: '#94A3B8' },
                      ]}
                    >
                      {level}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* STEP 2: QUESTIONS */}
          {selectedLevel ? (
            isLoadingQuestions ? (
              <View style={{ gap: 12 }}>
                <Skeleton height={80} borderRadius={12} />
                <Skeleton height={80} borderRadius={12} />
              </View>
            ) : questions.length === 0 ? (
              <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }, { paddingVertical: 24, alignItems: 'center' }]}>
                <IconSymbol name="info.circle" size={32} color={isDarkMode ? '#64748B' : '#94A3B8'} />
                <Text style={{ color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 8, fontSize: 14 }}>
                  No matching questions configured for {selectedLevel}.
                </Text>
              </View>
            ) : (
              <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
                <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }]}>
                  Step 2: Pre-Screening Questions
                </Text>

                {questions.map((q, idx) => (
                  <View key={q.question_id || q.question_key} style={styles.questionCard}>
                    <Text style={[styles.questionText, isDarkMode && { color: '#F8FAFC' }]}>
                      {idx + 1}. {q.question_text}
                    </Text>
                    {q.helper_text ? (
                      <Text style={[styles.helperText, isDarkMode && { color: '#94A3B8' }]}>
                        {q.helper_text}
                      </Text>
                    ) : null}

                    {(() => {
                      const qType = (q.question_type || '').toLowerCase();

                      // 1. SingleSelect / MultiSelect with options array
                      if (Array.isArray(q.options) && q.options.length > 0) {
                        return (
                          <View style={styles.optionsGrid}>
                            {q.options.map((opt) => {
                              const isSelected = answers[q.question_key] === opt.option_value;
                              return (
                                <TouchableOpacity
                                  key={opt.option_id || opt.option_value}
                                  style={[
                                    styles.optionItem,
                                    isSelected && styles.optionItemActive,
                                    isDarkMode && !isSelected && { backgroundColor: '#0F172A', borderColor: '#334155' },
                                  ]}
                                  onPress={() => handleOptionSelect(q.question_key, opt.option_value)}
                                >
                                  <View style={[styles.optionRadio, isSelected && styles.optionRadioActive]}>
                                    {isSelected ? <View style={styles.optionRadioInner} /> : null}
                                  </View>
                                  <Text
                                    style={[
                                      styles.optionLabel,
                                      isSelected && styles.optionLabelActive,
                                      isDarkMode && !isSelected && { color: '#94A3B8' },
                                    ]}
                                  >
                                    {opt.option_label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      }

                      // 2. YesNo / boolean
                      if (qType === 'yesno' || qType === 'boolean') {
                        const yesNoOpts = [
                          { option_value: 'Yes', option_label: 'Yes' },
                          { option_value: 'No', option_label: 'No' },
                        ];
                        return (
                          <View style={[styles.optionsGrid, { flexDirection: 'row', gap: 12 }]}>
                            {yesNoOpts.map((opt) => {
                              const isSelected = answers[q.question_key] === opt.option_value;
                              return (
                                <TouchableOpacity
                                  key={opt.option_value}
                                  style={[
                                    styles.optionItem,
                                    { flex: 1, justifyContent: 'center' },
                                    isSelected && styles.optionItemActive,
                                    isDarkMode && !isSelected && { backgroundColor: '#0F172A', borderColor: '#334155' },
                                  ]}
                                  onPress={() => handleOptionSelect(q.question_key, opt.option_value)}
                                >
                                  <View style={[styles.optionRadio, isSelected && styles.optionRadioActive]}>
                                    {isSelected ? <View style={styles.optionRadioInner} /> : null}
                                  </View>
                                  <Text
                                    style={[
                                      styles.optionLabel,
                                      isSelected && styles.optionLabelActive,
                                      isDarkMode && !isSelected && { color: '#94A3B8' },
                                    ]}
                                  >
                                    {opt.option_label}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        );
                      }

                      // 3. Number / numeric / Currency / percentage / Text / string
                      const isNumeric = qType === 'number' || qType === 'numeric' || qType === 'currency' || qType === 'percentage';
                      return (
                        <View style={{ marginTop: 8 }}>
                          <TextInput
                            style={[
                              {
                                backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                                borderColor: isDarkMode ? '#334155' : '#CBD5E1',
                                borderWidth: 1,
                                borderRadius: 12,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                fontSize: 14,
                                color: isDarkMode ? '#F8FAFC' : '#0F172A',
                              },
                            ]}
                            value={answers[q.question_key] || ''}
                            onChangeText={(val) => handleOptionSelect(q.question_key, val)}
                            keyboardType={isNumeric ? 'numeric' : 'default'}
                            placeholder={isNumeric ? 'Enter value (e.g. 95)' : 'Enter response'}
                            placeholderTextColor={isDarkMode ? '#64748B' : '#94A3B8'}
                          />
                        </View>
                      );
                    })()}
                  </View>
                ))}

                <TouchableOpacity
                  style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                  onPress={handleRunMatching}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.submitButtonText}>Run Scholarship Pre-Screening</Text>
                  )}
                </TouchableOpacity>
              </View>
            )
          ) : null}
        </>
      ) : (
        /* RESULTS STEP */
        <View>
          {/* STEP 3: MATCH RESULTS */}
          {preScreenResult && (
            <View style={{ marginTop: 4 }}>
              {/* COMPACT 3-COLUMN METRICS SUMMARY */}
              <View
                style={{
                  backgroundColor: isDarkMode ? "#031731" : "#FFFFFF",
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDarkMode ? "#0E2D56" : "#E2E8F0",
                  padding: 14,
                  marginBottom: 14,
                }}
              >
                <Text
                  style={{
                    fontSize: 15,
                    fontWeight: "800",
                    color: isDarkMode ? "#F8FAFC" : "#0F172A",
                    marginBottom: 10,
                  }}
                >
                  Pre-Screening Results ({selectedLevel})
                </Text>

                <View style={{ flexDirection: "row", gap: 8 }}>
                  {/* ELIGIBLE METRIC */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: isDarkMode ? "#063726" : "#F0FDF4",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? "#065F46" : "#DCFCE7",
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: isDarkMode ? "#6EE7B7" : "#15803D",
                      }}
                    >
                      {preScreenResult.summary.eligible_count}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isDarkMode ? "#A7F3D0" : "#166534",
                        marginTop: 2,
                      }}
                    >
                      Eligible
                    </Text>
                  </View>

                  {/* INCOMPLETE METRIC */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: isDarkMode ? "#2D1E06" : "#FFFBEB",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? "#78350F" : "#FEF3C7",
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: isDarkMode ? "#FBBF24" : "#D97706",
                      }}
                    >
                      {preScreenResult.summary.incomplete_count}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isDarkMode ? "#FDE68A" : "#92400E",
                        marginTop: 2,
                      }}
                    >
                      Incomplete
                    </Text>
                  </View>

                  {/* NOT ELIGIBLE METRIC */}
                  <View
                    style={{
                      flex: 1,
                      backgroundColor: isDarkMode ? "#2D1212" : "#FEF2F2",
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: isDarkMode ? "#7F1D1D" : "#FEE2E2",
                      paddingVertical: 10,
                      paddingHorizontal: 4,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "800",
                        color: isDarkMode ? "#F87171" : "#DC2626",
                      }}
                    >
                      {preScreenResult.summary.not_eligible_count}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: isDarkMode ? "#FCA5A5" : "#991B1B",
                        marginTop: 2,
                      }}
                    >
                      Not Eligible
                    </Text>
                  </View>
                </View>
              </View>

              {/* EVALUATED PROGRAM CARDS */}
              {preScreenResult.programs.length === 0 ? (
                <View
                  style={[
                    styles.resultCard,
                    { alignItems: "center", paddingVertical: 24 },
                    isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" },
                  ]}
                >
                  <IconSymbol name="magnifyingglass" size={32} color={isDarkMode ? "#64748B" : "#94A3B8"} />
                  <Text style={[styles.headerSubtitle, { marginTop: 8, textAlign: "center" }, isDarkMode && { color: "#94A3B8" }]}>
                    No scholarship programs match the specified criteria.
                  </Text>
                </View>
              ) : (
                preScreenResult.programs.map((program: EvaluatedProgram) => {
                  const isEligible = program.eligibility_status === "Eligible";
                  const isIncomplete = program.eligibility_status === "Incomplete";

                  const badgeBg = isEligible
                    ? isDarkMode ? "#063726" : "#DCFCE7"
                    : isIncomplete
                      ? isDarkMode ? "#2D1E06" : "#FEF3C7"
                      : isDarkMode ? "#2D1212" : "#FEE2E2";

                  const badgeTextColor = isEligible
                    ? isDarkMode ? "#6EE7B7" : "#15803D"
                    : isIncomplete
                      ? isDarkMode ? "#FBBF24" : "#B45309"
                      : isDarkMode ? "#F87171" : "#B91C1C";

                  return (
                    <View
                      key={program.program_id}
                      style={[
                        styles.resultCard,
                        isDarkMode && { backgroundColor: "#1E293B", borderColor: "#334155" },
                      ]}
                    >
                      {/* TOP ROW: CATEGORY, TITLE, STATUS BADGE */}
                      <View style={styles.resultTop}>
                        <View style={{ flex: 1 }}>
                          {program.category_name ? (
                            <View
                              style={{
                                alignSelf: "flex-start",
                                backgroundColor: isDarkMode ? "#0F2942" : "#E0F2FE",
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                                marginBottom: 4,
                              }}
                            >
                              <Text style={{ fontSize: 10, fontWeight: "700", color: isDarkMode ? "#38BDF8" : "#0284C7" }}>
                                {program.category_name}
                              </Text>
                            </View>
                          ) : null}
                          <Text
                            style={[
                              styles.headerTitle,
                              { fontSize: 17, marginBottom: 2 },
                              isDarkMode && { color: "#F8FAFC" },
                            ]}
                          >
                            {program.program_name}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.statusBadge,
                            { backgroundColor: badgeBg },
                          ]}
                        >
                          <Text style={[styles.statusText, { color: badgeTextColor }]}>
                            {program.eligibility_status.toUpperCase()}
                          </Text>
                        </View>
                      </View>

                      {program.description ? (
                        <Text
                          style={[
                            styles.headerSubtitle,
                            { fontSize: 13, marginBottom: 12 },
                            isDarkMode && { color: "#94A3B8" },
                          ]}
                        >
                          {program.description}
                        </Text>
                      ) : null}

                      {/* ELIGIBILITY CHECK CRITERIA LIST */}
                      {program.criteria && program.criteria.length > 0 && (
                        <View style={{ marginTop: 4, marginBottom: 10 }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "800",
                              color: isDarkMode ? "#F8FAFC" : "#0F172A",
                              marginBottom: 8,
                            }}
                          >
                            Eligibility Check
                          </Text>

                          <View style={{ gap: 8 }}>
                            {program.criteria.map((crit, idx) => {
                              const isPassed = crit.status === "Passed" || (crit as any).result === "Passed";
                              const isNotMet = crit.status === "Not Met" || (crit as any).result === "Not Met";
                              const critIncomplete = crit.status === "Incomplete" || (crit as any).result === "Incomplete";

                              const iconName = isPassed
                                ? "checkmark.circle.fill"
                                : isNotMet
                                  ? "xmark.circle.fill"
                                  : critIncomplete
                                    ? "exclamationmark.triangle.fill"
                                    : "info.circle";

                              const iconColor = isPassed
                                ? isDarkMode ? "#34D399" : "#16A34A"
                                : isNotMet
                                  ? isDarkMode ? "#F87171" : "#DC2626"
                                  : critIncomplete
                                    ? isDarkMode ? "#FBBF24" : "#D97706"
                                    : isDarkMode ? "#94A3B8" : "#64748B";

                              const containerBg = isPassed
                                ? isDarkMode ? "#042F22" : "#F0FDF4"
                                : isNotMet
                                  ? isDarkMode ? "#2D1212" : "#FEF2F2"
                                  : critIncomplete
                                    ? isDarkMode ? "#2B1D06" : "#FFFBEB"
                                    : isDarkMode ? "#0F172A" : "#F8FAFC";

                              const borderColor = isPassed
                                ? isDarkMode ? "#065F46" : "#DCFCE7"
                                : isNotMet
                                  ? isDarkMode ? "#7F1D1D" : "#FEE2E2"
                                  : critIncomplete
                                    ? isDarkMode ? "#78350F" : "#FEF3C7"
                                    : isDarkMode ? "#1E293B" : "#E2E8F0";

                              return (
                                <View
                                  key={idx}
                                  style={{
                                    backgroundColor: containerBg,
                                    borderWidth: 1,
                                    borderColor: borderColor,
                                    borderRadius: 10,
                                    paddingVertical: 8,
                                    paddingHorizontal: 10,
                                  }}
                                >
                                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                                    <IconSymbol
                                      name={iconName}
                                      size={17}
                                      color={iconColor}
                                      style={{ marginTop: 1 }}
                                    />
                                    <View style={{ flex: 1 }}>
                                      <Text
                                        style={{
                                          fontSize: 13,
                                          fontWeight: "700",
                                          color: isDarkMode ? "#F8FAFC" : "#0F172A",
                                          marginBottom: 2,
                                        }}
                                      >
                                        {crit.label}
                                      </Text>

                                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 }}>
                                        <Text style={{ fontSize: 12, color: isDarkMode ? "#CBD5E1" : "#475569" }}>
                                          <Text style={{ fontWeight: "600" }}>Your answer: </Text>
                                          {crit.applicant_value || 'No response'}
                                        </Text>
                                        {crit.requirement_display &&
                                          crit.requirement_display !== "Provided" &&
                                          crit.requirement_display !== "N/A" && (
                                            <Text style={{ fontSize: 12, color: isDarkMode ? "#CBD5E1" : "#475569" }}>
                                              <Text style={{ fontWeight: "600" }}>Required: </Text>
                                              {crit.requirement_display}
                                            </Text>
                                          )}
                                      </View>

                                      {crit.message && crit.message !== "Informational question answered." && (
                                        <Text
                                          style={{
                                            fontSize: 11,
                                            color: isDarkMode ? "#94A3B8" : "#64748B",
                                            marginTop: 3,
                                            fontStyle: "italic",
                                          }}
                                        >
                                          {crit.message}
                                        </Text>
                                      )}
                                    </View>
                                  </View>
                                </View>
                              );
                            })}
                          </View>
                        </View>
                      )}

                      {/* OFFICIAL MATCH ASSESSMENT PRESENTATION */}
                      {program.rag_explanation ? (
                        <View
                          style={{
                            backgroundColor: isDarkMode ? "#072040" : "#F8FAFC",
                            borderRadius: 10,
                            padding: 10,
                            marginTop: 6,
                            borderLeftWidth: 3,
                            borderLeftColor: isDarkMode ? "#38BDF8" : "#2563EB",
                          }}
                        >
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "700",
                              color: isDarkMode ? "#38BDF8" : "#2563EB",
                              marginBottom: 3,
                            }}
                          >
                            Match Assessment
                          </Text>
                          <Text
                            style={{
                              fontSize: 12.5,
                              lineHeight: 18,
                              color: isDarkMode ? "#CBD5E1" : "#475569",
                            }}
                          >
                            {program.rag_explanation}
                          </Text>
                        </View>
                      ) : null}

                      {/* VIEW PROGRAM DETAILS ACTION FOOTER */}
                      <TouchableOpacity
                        style={{
                          flexDirection: "row",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          marginTop: 12,
                          gap: 4,
                        }}
                        onPress={() =>
                          router.push({
                            pathname: "/education/new-applicant/scholarship-details" as any,
                            params: { program_id: String(program.program_id) },
                          })
                        }
                        activeOpacity={0.7}
                      >
                        <Text
                          style={{
                            fontSize: 13,
                            fontWeight: "700",
                            color: isDarkMode ? "#38BDF8" : "#2563EB",
                          }}
                        >
                          View Program Details
                        </Text>
                        <IconSymbol
                          name="chevron.right"
                          size={14}
                          color={isDarkMode ? "#38BDF8" : "#2563EB"}
                        />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}

              {/* RETAKE QUESTIONNAIRE BUTTON */}
              <TouchableOpacity
                style={[
                  styles.retryButton,
                  {
                    alignSelf: "center",
                    marginTop: 16,
                    marginBottom: 8,
                    backgroundColor: isDarkMode ? "#072040" : "#F1F5F9",
                    borderWidth: 1,
                    borderColor: isDarkMode ? "#0E2D56" : "#CBD5E1",
                  },
                ]}
                onPress={handleRetake}
              >
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "700",
                    color: isDarkMode ? "#38BDF8" : "#334155",
                  }}
                >
                  Retake Questionnaire
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
