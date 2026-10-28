import React from 'react';
import {
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/NewApplicantApplication.styles';

export const INCOME_TIERS = [
  { id: 'tier_1', label: 'Below ₱10,000 / month', sublabel: 'Low Income / Indigent' },
  { id: 'tier_2', label: '₱10,000 - ₱20,000 / month', sublabel: 'Lower Income' },
  { id: 'tier_3', label: '₱20,000 - ₱40,000 / month', sublabel: 'Lower Middle Class' },
  { id: 'tier_4', label: '₱40,000 - ₱70,000 / month', sublabel: 'Middle Class' },
  { id: 'tier_5', label: 'Above ₱70,000 / month', sublabel: 'Upper Middle / High Income' },
];

export const EMPLOYMENT_STATUSES = [
  'Employed (Private / Government)',
  'Self-Employed / Freelance',
  'Informal / Daily Wage Earner',
  'Unemployed / Dependent',
];

export interface SocioeconomicIndicators {
  is4PsBeneficiary?: boolean;
  isIndigent?: boolean;
  isSoloParent?: boolean;
  isPWD?: boolean;
  isIPMember?: boolean;
}

export interface Step4FinancialDetailsProps {
  monthlyIncomeTier?: string;
  setMonthlyIncomeTier?: (val: string) => void;
  employmentStatus?: string;
  setEmploymentStatus?: (val: string) => void;
  indicators?: SocioeconomicIndicators;
  setIndicators?: React.Dispatch<React.SetStateAction<SocioeconomicIndicators>>;
  isSubmitting?: boolean;
  isDarkMode: boolean;
  insets?: { bottom: number; top: number; left: number; right: number };
  onBack?: () => void;
  onNext?: () => void;
  stepNumber?: number;
  totalSteps?: number;
}

export function Step4FinancialDetails({
  monthlyIncomeTier = '',
  setMonthlyIncomeTier,
  employmentStatus = '',
  setEmploymentStatus,
  indicators = {},
  setIndicators,
  isSubmitting = false,
  isDarkMode,
  insets,
  onBack,
  onNext,
  stepNumber = 4,
  totalSteps = 6,
}: Step4FinancialDetailsProps) {
  const toggleIndicator = (key: keyof SocioeconomicIndicators) => {
    if (!setIndicators) return;
    setIndicators((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <View style={[styles.sectionCard, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}>
      <View style={styles.stepHeaderRow}>
        <Text style={[styles.sectionTitle, isDarkMode && { color: '#F8FAFC' }, { marginBottom: 0 }]}>
          Financial & Socioeconomic Details
        </Text>
        <View style={[styles.stepProgressBadge, isDarkMode && { backgroundColor: '#0369A1' }]}>
          <Text style={[styles.stepProgressBadgeText, isDarkMode && { color: '#BAE6FD' }]}>
            Step {stepNumber} of {totalSteps}
          </Text>
        </View>
      </View>
      <Text style={[styles.sectionSubtitle, isDarkMode && { color: '#94A3B8' }]}>
        Information regarding household income and socioeconomic status helps determine scholarship priority.
      </Text>

      {/* MONTHLY HOUSEHOLD INCOME */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Combined Household Monthly Income *
        </Text>
        <View style={{ gap: 8, marginTop: 4 }}>
          {INCOME_TIERS.map((tier) => {
            const isSelected = monthlyIncomeTier === tier.id || monthlyIncomeTier === tier.label;
            return (
              <TouchableOpacity
                key={tier.id}
                style={[
                  styles.textInput,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 12,
                    paddingHorizontal: 14,
                    minHeight: 48,
                    borderColor: isSelected ? (isDarkMode ? '#38BDF8' : '#0284C7') : (isDarkMode ? '#334155' : '#E2E8F0'),
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#082F49' : '#F0F9FF')
                      : (isDarkMode ? '#0F172A' : '#FFFFFF'),
                  },
                ]}
                onPress={() => setMonthlyIncomeTier?.(tier.id)}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? '700' : '500',
                      color: isSelected
                        ? (isDarkMode ? '#38BDF8' : '#0284C7')
                        : (isDarkMode ? '#F8FAFC' : '#1E293B'),
                    }}
                  >
                    {tier.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: isDarkMode ? '#94A3B8' : '#64748B',
                      marginTop: 2,
                    }}
                  >
                    {tier.sublabel}
                  </Text>
                </View>
                {isSelected ? (
                  <IconSymbol name="checkmark.circle.fill" size={20} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                ) : (
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      borderWidth: 1.5,
                      borderColor: isDarkMode ? '#475569' : '#CBD5E1',
                    }}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* EMPLOYMENT STATUS */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Primary Breadwinner Employment Status *
        </Text>
        <View style={{ gap: 8, marginTop: 4 }}>
          {EMPLOYMENT_STATUSES.map((status) => {
            const isSelected = employmentStatus === status;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.textInput,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    minHeight: 44,
                    borderColor: isSelected ? (isDarkMode ? '#38BDF8' : '#0284C7') : (isDarkMode ? '#334155' : '#E2E8F0'),
                    backgroundColor: isSelected
                      ? (isDarkMode ? '#082F49' : '#F0F9FF')
                      : (isDarkMode ? '#0F172A' : '#FFFFFF'),
                  },
                ]}
                onPress={() => setEmploymentStatus?.(status)}
                activeOpacity={0.7}
                disabled={isSubmitting}
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
                  {status}
                </Text>
                {isSelected ? (
                  <IconSymbol name="checkmark.circle.fill" size={18} color={isDarkMode ? '#38BDF8' : '#0284C7'} />
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SOCIOECONOMIC INDICATORS */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, isDarkMode && { color: '#F8FAFC' }]}>
          Socioeconomic Indicators (Check all that apply)
        </Text>
        <View style={{ gap: 8, marginTop: 4 }}>
          {[
            { key: 'is4PsBeneficiary' as const, label: '4Ps Beneficiary', desc: 'Family is registered under Pantawid Pamilyang Pilipino Program' },
            { key: 'isIndigent' as const, label: 'Barangay Certificate of Indigency', desc: 'Family has a valid certificate of indigency' },
            { key: 'isSoloParent' as const, label: 'Solo Parent Dependent', desc: 'Dependent of a registered Solo Parent' },
            { key: 'isPWD' as const, label: 'Person with Disability (PWD)', desc: 'Applicant or guardian holds a registered PWD ID' },
            { key: 'isIPMember' as const, label: 'Indigenous Peoples (IP) Community', desc: 'Belongs to a recognized indigenous cultural community' },
          ].map((item) => {
            const checked = !!indicators[item.key];
            return (
              <TouchableOpacity
                key={item.key}
                style={[
                  styles.textInput,
                  {
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingVertical: 10,
                    minHeight: 52,
                    borderColor: checked ? (isDarkMode ? '#38BDF8' : '#0284C7') : (isDarkMode ? '#334155' : '#E2E8F0'),
                    backgroundColor: checked
                      ? (isDarkMode ? '#082F49' : '#F0F9FF')
                      : (isDarkMode ? '#0F172A' : '#FFFFFF'),
                  },
                ]}
                onPress={() => toggleIndicator(item.key)}
                activeOpacity={0.7}
                disabled={isSubmitting}
              >
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: checked ? '700' : '600',
                      color: checked
                        ? (isDarkMode ? '#38BDF8' : '#0284C7')
                        : (isDarkMode ? '#F8FAFC' : '#1E293B'),
                    }}
                  >
                    {item.label}
                  </Text>
                  <Text style={{ fontSize: 11, color: isDarkMode ? '#94A3B8' : '#64748B', marginTop: 2 }}>
                    {item.desc}
                  </Text>
                </View>
                <Ionicons
                  name={checked ? 'checkbox' : 'square-outline'}
                  size={20}
                  color={checked ? (isDarkMode ? '#38BDF8' : '#0284C7') : (isDarkMode ? '#64748B' : '#94A3B8')}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* NAVIGATION BUTTONS */}
      {(onBack || onNext) ? (
        <View style={[styles.wizardNavRow, insets && { paddingBottom: Math.max(32, insets.bottom + 16) }]}>
          {onBack ? (
            <TouchableOpacity
              style={[styles.wizardBackBtn, isDarkMode && { backgroundColor: '#1E293B', borderColor: '#334155' }]}
              onPress={onBack}
              activeOpacity={0.8}
            >
              <IconSymbol name="chevron.left" size={14} color={isDarkMode ? '#F8FAFC' : '#475569'} />
              <Text style={[styles.wizardBackBtnText, isDarkMode && { color: '#F8FAFC' }]}>Back</Text>
            </TouchableOpacity>
          ) : null}

          {onNext ? (
            <TouchableOpacity
              style={styles.wizardNextBtn}
              onPress={onNext}
              activeOpacity={0.8}
            >
              <Text style={styles.wizardNextBtnText}>Next →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
