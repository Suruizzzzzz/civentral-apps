import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { Badge } from '@/src/components/ui/Badge';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { ScholarshipProgram } from '../api/ScholarshipProgramApi';
import { styles } from '../styles/NewApplicantApplication.styles';

export interface WizardStepperHeaderProps {
  program: ScholarshipProgram;
  currentStep: 1 | 2 | 3;
  isDarkMode: boolean;
  onGoToStep: (step: 1 | 2 | 3) => void;
}

export function WizardStepperHeader({
  program,
  currentStep,
  isDarkMode,
  onGoToStep,
}: WizardStepperHeaderProps) {
  return (
    <>
      {/* HEADER CARD (Step 1 only - full presentation) */}
      {currentStep === 1 ? (
        <View style={[styles.headerCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
          <View style={styles.badgeRow}>
            <Badge variant="info" label={program.category_name || 'General'} />
            {program.application_period ? (
              <Badge variant="neutral" label={`AY ${program.application_period.academic_year}`} />
            ) : null}
          </View>

          <Text style={[styles.programTitle, isDarkMode && { color: '#F8FAFC' }]}>
            New Application: {program.program_name}
          </Text>
          <Text style={[styles.programCode, isDarkMode && { color: '#94A3B8' }]}>
            Code: {program.program_code}
          </Text>
        </View>
      ) : null}

      {/* PROGRESSIVE STEPPER HEADER */}
      <View style={[styles.stepperCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
        <View style={styles.stepperRow}>
          {/* Step 1 Node */}
          <TouchableOpacity
            style={styles.stepItem}
            onPress={() => onGoToStep(1)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.stepNode,
                currentStep === 1
                  ? styles.stepNodeActive
                  : currentStep > 1
                    ? styles.stepNodeCompleted
                    : styles.stepNodeUpcoming,
                isDarkMode && currentStep > 1 && { backgroundColor: '#15803D', borderColor: '#15803D' },
                isDarkMode && currentStep < 1 && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
            >
              {currentStep > 1 ? (
                <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepNodeText,
                    currentStep === 1 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                  ]}
                >
                  1
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 1
                  ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                  : currentStep > 1
                    ? [styles.stepLabelCompleted, isDarkMode && { color: '#4ADE80' }]
                    : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
              ]}
            >
              Personal
            </Text>
          </TouchableOpacity>

          {/* Connector 1 -> 2 */}
          <View
            style={[
              styles.stepConnector,
              currentStep > 1 && styles.stepConnectorCompleted,
              isDarkMode && currentStep <= 1 && { backgroundColor: '#334155' },
            ]}
          />

          {/* Step 2 Node */}
          <TouchableOpacity
            style={styles.stepItem}
            onPress={() => onGoToStep(2)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.stepNode,
                currentStep === 2
                  ? styles.stepNodeActive
                  : currentStep > 2
                    ? styles.stepNodeCompleted
                    : styles.stepNodeUpcoming,
                isDarkMode && currentStep > 2 && { backgroundColor: '#15803D', borderColor: '#15803D' },
                isDarkMode && currentStep < 2 && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
            >
              {currentStep > 2 ? (
                <IconSymbol name="checkmark" size={14} color="#FFFFFF" />
              ) : (
                <Text
                  style={[
                    styles.stepNodeText,
                    currentStep === 2 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                  ]}
                >
                  2
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 2
                  ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                  : currentStep > 2
                    ? [styles.stepLabelCompleted, isDarkMode && { color: '#4ADE80' }]
                    : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
              ]}
            >
              Academic
            </Text>
          </TouchableOpacity>

          {/* Connector 2 -> 3 */}
          <View
            style={[
              styles.stepConnector,
              currentStep > 2 && styles.stepConnectorCompleted,
              isDarkMode && currentStep <= 2 && { backgroundColor: '#334155' },
            ]}
          />

          {/* Step 3 Node */}
          <TouchableOpacity
            style={styles.stepItem}
            onPress={() => onGoToStep(3)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.stepNode,
                currentStep === 3 ? styles.stepNodeActive : styles.stepNodeUpcoming,
                isDarkMode && currentStep < 3 && { backgroundColor: '#0F172A', borderColor: '#334155' },
              ]}
            >
              <Text
                style={[
                  styles.stepNodeText,
                  currentStep === 3 ? styles.stepNodeTextActive : styles.stepNodeTextUpcoming,
                ]}
              >
                3
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                currentStep === 3
                  ? [styles.stepLabelActive, isDarkMode && { color: '#38BDF8' }]
                  : [styles.stepLabelUpcoming, isDarkMode && { color: '#64748B' }],
              ]}
            >
              Documents
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* COMPACT PROGRAM SUBHEADER (Steps 2 and 3) */}
      {currentStep > 1 ? (
        <View style={[styles.programSubheader, isDarkMode && { backgroundColor: '#0B2942', borderColor: '#0369A1' }]}>
          <IconSymbol name="book.closed.fill" size={15} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
          <Text style={[styles.programSubheaderText, isDarkMode && { color: '#E0F2FE' }]} numberOfLines={1}>
            Applying for: <Text style={{ fontWeight: '700' }}>{program.program_name}</Text>
            {program.application_period ? ` (AY ${program.application_period.academic_year})` : ''}
          </Text>
        </View>
      ) : null}
    </>
  );
}
