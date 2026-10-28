import React from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { styles } from '../styles/VerifyCitizenScreen.styles';
import {
  CIVIL_STATUS_OPTIONS,
  EDUCATIONAL_ATTAINMENT_OPTIONS,
  EMPLOYMENT_STATUS_OPTIONS,
  MONTH_NAMES,
  OCCUPATION_OPTIONS,
  SEX_OPTIONS,
  WEEK_DAYS,
  YEAR_OPTIONS,
} from './types';

export interface VerificationPersonalStepProps {
  firstName: string;
  setFirstName: (val: string) => void;
  middleName: string;
  setMiddleName: (val: string) => void;
  lastName: string;
  setLastName: (val: string) => void;
  suffix: string;
  setSuffix: (val: string) => void;
  sex: string;
  setSex: (val: string) => void;
  placeOfBirth: string;
  setPlaceOfBirth: (val: string) => void;
  birthDate: string;
  civilStatus: string;
  setCivilStatus: (val: string) => void;
  isCivilStatusDropdownOpen: boolean;
  setIsCivilStatusDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCalendarOpen: boolean;
  setIsCalendarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  calYear: number;
  setCalYear: React.Dispatch<React.SetStateAction<number>>;
  calMonth: number;
  setCalMonth: React.Dispatch<React.SetStateAction<number>>;
  isCalMonthDropdownOpen: boolean;
  setIsCalMonthDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCalYearDropdownOpen: boolean;
  setIsCalYearDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSelectDay: (day: number) => void;
  handlePrevMonth: () => void;
  handleNextMonth: () => void;
  daysInCalMonth: number;
  firstDayOfWeek: number;
  employmentStatus: string;
  setEmploymentStatus: (val: string) => void;
  isEmploymentDropdownOpen: boolean;
  setIsEmploymentDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  occupation: string;
  setOccupation: (val: string) => void;
  isOccupationDropdownOpen: boolean;
  setIsOccupationDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  educationalAttainment: string;
  setEducationalAttainment: (val: string) => void;
  isEducationDropdownOpen: boolean;
  setIsEducationDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isPrefilled: boolean;
  clearFieldError: (key: string) => void;
  onNext: () => void;
  isDarkMode: boolean;
}

export function VerificationPersonalStep({
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
  clearFieldError,
  onNext,
  isDarkMode,
}: VerificationPersonalStepProps) {
  const dmCard = isDarkMode ? '#1C2541' : '#FFFFFF';
  const dmBorder = isDarkMode ? '#3A506B' : '#E2E8F0';
  const dmText = isDarkMode ? '#FFFFFF' : '#0F172A';
  const dmInputBg = isDarkMode ? '#152238' : '#F8FAFC';
  const dmInputText = isDarkMode ? '#F1F5F9' : '#0F172A';

  return (
    <View style={[styles.card, { backgroundColor: dmCard, borderColor: dmBorder }]}>
      <Text style={[styles.cardTitle, { color: dmText }]}>Personal Information</Text>

      {/* Pre-filled Account Info Badge */}
      {isPrefilled && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            marginBottom: 14,
            paddingVertical: 7,
            paddingHorizontal: 10,
            borderRadius: 8,
            backgroundColor: isDarkMode ? '#152E52' : '#E0F2FE',
            borderWidth: 1,
            borderColor: isDarkMode ? '#0369A1' : '#BAE6FD',
          }}
        >
          <IconSymbol name="checkmark.circle.fill" size={15} color="#0284C7" />
          <Text
            style={{
              fontSize: 11.5,
              fontWeight: '600',
              color: isDarkMode ? '#7DD3FC' : '#0369A1',
              flex: 1,
            }}
          >
            Details pre-filled from your registered citizen account
          </Text>
        </View>
      )}

      {/* First Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          First Name *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder="e.g. Juan"
          placeholderTextColor="#94A3B8"
          value={firstName}
          onChangeText={(text) => {
            setFirstName(text);
            clearFieldError('first_name');
          }}
        />
      </View>

      {/* Middle Name & Suffix */}
      <View style={styles.rowInputs}>
        <View style={[styles.rowItem, styles.inputGroup]}>
          <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
            Middle Name
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
            placeholder="e.g. Santos"
            placeholderTextColor="#94A3B8"
            value={middleName}
            onChangeText={setMiddleName}
          />
        </View>
        <View style={[styles.rowItem, styles.inputGroup]}>
          <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
            Suffix
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
            placeholder="Jr., III (opt.)"
            placeholderTextColor="#94A3B8"
            value={suffix}
            onChangeText={setSuffix}
          />
        </View>
      </View>

      {/* Last Name */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Last Name *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder="e.g. Dela Cruz"
          placeholderTextColor="#94A3B8"
          value={lastName}
          onChangeText={(text) => {
            setLastName(text);
            clearFieldError('last_name');
          }}
        />
      </View>

      {/* Sex Selection */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Sex *
        </Text>
        <View style={styles.selectionGrid}>
          {SEX_OPTIONS.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.chipItem,
                sex === item && styles.chipItemActive,
                isDarkMode && { backgroundColor: sex === item ? '#0369A1' : '#152238', borderColor: dmBorder },
              ]}
              onPress={() => setSex(item)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.chipText,
                  sex === item && styles.chipTextActive,
                  isDarkMode && { color: sex === item ? '#FFFFFF' : '#CBD5E1' },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Place of Birth */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Place of Birth *
        </Text>
        <TextInput
          style={[styles.input, { backgroundColor: dmInputBg, color: dmInputText, borderColor: dmBorder }]}
          placeholder="e.g. Civentral City / Manila"
          placeholderTextColor="#94A3B8"
          value={placeOfBirth}
          onChangeText={setPlaceOfBirth}
        />
      </View>

      {/* Date of Birth Dropdown Calendar */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Date of Birth *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isCalendarOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isCalendarOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => setIsCalendarOpen((prev) => !prev)}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <IconSymbol
              name="calendar"
              size={18}
              color={isDarkMode ? '#38BDF8' : '#0284C7'}
            />
            <Text style={[styles.dropdownValueText, { color: dmText }]}>
              {birthDate || 'Select Date of Birth'}
            </Text>
          </View>
          <IconSymbol
            name={isCalendarOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isCalendarOpen && (
          <View
            style={[
              styles.calendarCard,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {/* Calendar Month & Year Dropdown Selectors */}
            <View style={styles.calendarSelectorsRow}>
              {/* Previous Month */}
              <TouchableOpacity
                style={[styles.calendarNavBtn, isDarkMode && { backgroundColor: '#152238' }]}
                onPress={handlePrevMonth}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.left" size={18} color={isDarkMode ? '#FFFFFF' : '#0F172A'} />
              </TouchableOpacity>

              {/* Month Dropdown Button */}
              <TouchableOpacity
                style={[
                  styles.calendarDropdownBtn,
                  isCalMonthDropdownOpen && styles.calendarDropdownBtnActive,
                  isDarkMode && { backgroundColor: isCalMonthDropdownOpen ? '#0369A1' : '#152238', borderColor: dmBorder },
                ]}
                onPress={() => {
                  setIsCalMonthDropdownOpen((prev) => !prev);
                  setIsCalYearDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.calendarDropdownBtnText, { color: dmText }]}>
                  {MONTH_NAMES[calMonth]}
                </Text>
                <IconSymbol
                  name={isCalMonthDropdownOpen ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Year Dropdown Button */}
              <TouchableOpacity
                style={[
                  styles.calendarDropdownBtn,
                  isCalYearDropdownOpen && styles.calendarDropdownBtnActive,
                  isDarkMode && { backgroundColor: isCalYearDropdownOpen ? '#0369A1' : '#152238', borderColor: dmBorder },
                ]}
                onPress={() => {
                  setIsCalYearDropdownOpen((prev) => !prev);
                  setIsCalMonthDropdownOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.calendarDropdownBtnText, { color: dmText }]}>
                  {calYear}
                </Text>
                <IconSymbol
                  name={isCalYearDropdownOpen ? 'chevron.up' : 'chevron.down'}
                  size={16}
                  color={isDarkMode ? '#94A3B8' : '#64748B'}
                />
              </TouchableOpacity>

              {/* Next Month */}
              <TouchableOpacity
                style={[styles.calendarNavBtn, isDarkMode && { backgroundColor: '#152238' }]}
                onPress={handleNextMonth}
                activeOpacity={0.7}
              >
                <IconSymbol name="chevron.right" size={18} color={isDarkMode ? '#FFFFFF' : '#0F172A'} />
              </TouchableOpacity>
            </View>

            {/* Expandable Month Selection Grid */}
            {isCalMonthDropdownOpen && (
              <View
                style={[
                  styles.calendarMonthGrid,
                  isDarkMode && { backgroundColor: '#152238', borderColor: '#3A506B' },
                ]}
              >
                {MONTH_NAMES.map((mName, mIdx) => {
                  const isSelected = calMonth === mIdx;
                  return (
                    <TouchableOpacity
                      key={mName}
                      style={[
                        styles.calendarMonthGridCell,
                        isSelected && styles.calendarMonthGridCellActive,
                        isDarkMode && !isSelected && { backgroundColor: '#1C2541', borderColor: dmBorder },
                      ]}
                      onPress={() => {
                        setCalMonth(mIdx);
                        setIsCalMonthDropdownOpen(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.calendarMonthGridText,
                          isSelected && styles.calendarMonthGridTextActive,
                          isDarkMode && !isSelected && { color: '#E2E8F0' },
                        ]}
                      >
                        {mName.slice(0, 3)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}

            {/* Expandable Year Selection Scrollable List */}
            {isCalYearDropdownOpen && (
              <ScrollView
                style={[
                  styles.calendarYearDropdownContainer,
                  isDarkMode && { backgroundColor: '#152238', borderColor: '#3A506B' },
                ]}
                nestedScrollEnabled={true}
                showsVerticalScrollIndicator={true}
              >
                {YEAR_OPTIONS.map((yr) => {
                  const isSelected = calYear === yr;
                  return (
                    <TouchableOpacity
                      key={yr}
                      style={[
                        styles.calendarYearOption,
                        isSelected && styles.calendarYearOptionActive,
                        isDarkMode && !isSelected && { borderBottomColor: '#1C2541' },
                      ]}
                      onPress={() => {
                        setCalYear(yr);
                        setIsCalYearDropdownOpen(false);
                      }}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.calendarYearOptionText,
                          isSelected && styles.calendarYearOptionTextActive,
                          isDarkMode && !isSelected && { color: '#E2E8F0' },
                        ]}
                      >
                        {yr}
                      </Text>
                      {isSelected && (
                        <IconSymbol
                          name="checkmark.circle.fill"
                          size={16}
                          color="#FFFFFF"
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Weekday Column Headers */}
            <View style={[styles.calendarWeekRow, isDarkMode && { borderBottomColor: '#152238' }]}>
              {WEEK_DAYS.map((wd, idx) => (
                <Text key={idx} style={[styles.calendarWeekLabel, isDarkMode && { color: '#64748B' }]}>
                  {wd}
                </Text>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.calendarDaysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
                <View key={`empty-${idx}`} style={styles.calendarDayCell} />
              ))}

              {Array.from({ length: daysInCalMonth }).map((_, idx) => {
                const dayNum = idx + 1;
                const mm = String(calMonth + 1).padStart(2, '0');
                const dd = String(dayNum).padStart(2, '0');
                const isSelected = birthDate === `${calYear}-${mm}-${dd}`;

                return (
                  <TouchableOpacity
                    key={`day-${dayNum}`}
                    style={[
                      styles.calendarDayCell,
                      isSelected && styles.calendarDayCellActive,
                    ]}
                    onPress={() => handleSelectDay(dayNum)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.calendarDayText,
                        isDarkMode && { color: '#F1F5F9' },
                        isSelected && styles.calendarDayTextActive,
                      ]}
                    >
                      {dayNum}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Civil Status Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Civil Status *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isCivilStatusDropdownOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isCivilStatusDropdownOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => {
            setIsCivilStatusDropdownOpen((prev) => !prev);
            setIsCalendarOpen(false);
            setIsEmploymentDropdownOpen(false);
            setIsOccupationDropdownOpen(false);
            setIsEducationDropdownOpen(false);
          }}
          activeOpacity={0.8}
        >
          <Text style={[styles.dropdownValueText, { color: dmText }]}>
            {civilStatus}
          </Text>
          <IconSymbol
            name={isCivilStatusDropdownOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isCivilStatusDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {CIVIL_STATUS_OPTIONS.map((status) => {
              const isSelected = civilStatus === status;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownOptionItem,
                    isSelected && styles.dropdownOptionItemActive,
                    isDarkMode && { borderBottomColor: '#2B3958' },
                    isDarkMode && isSelected && { backgroundColor: '#152E52' },
                  ]}
                  onPress={() => {
                    setCivilStatus(status);
                    setIsCivilStatusDropdownOpen(false);
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                      isDarkMode && { color: isSelected ? '#38BDF8' : '#E2E8F0' },
                    ]}
                  >
                    {status}
                  </Text>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDarkMode ? '#38BDF8' : '#0284C7'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* SECTION HEADER: DEMOGRAPHIC INFORMATION */}
      <View style={{ marginTop: 18, marginBottom: 12, borderTopWidth: 1, borderTopColor: dmBorder, paddingTop: 16 }}>
        <Text style={[styles.cardTitle, { color: dmText, marginBottom: 4 }]}>
          Demographic Information
        </Text>
        <Text style={{ fontSize: 12, color: isDarkMode ? '#94A3B8' : '#64748B' }}>
          City census and socioeconomic profile details
        </Text>
      </View>

      {/* 1. Employment Status Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Employment Status *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isEmploymentDropdownOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isEmploymentDropdownOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => {
            setIsEmploymentDropdownOpen((prev) => !prev);
            setIsOccupationDropdownOpen(false);
            setIsEducationDropdownOpen(false);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.dropdownValueText,
              { color: employmentStatus ? dmText : '#94A3B8' },
            ]}
          >
            {employmentStatus || 'Select Employment Status'}
          </Text>
          <IconSymbol
            name={isEmploymentDropdownOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isEmploymentDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {EMPLOYMENT_STATUS_OPTIONS.map((item) => {
              const isSelected = employmentStatus === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownOptionItem,
                    isSelected && styles.dropdownOptionItemActive,
                    isDarkMode && { borderBottomColor: '#152238' },
                    isDarkMode && isSelected && { backgroundColor: '#0369A1' },
                  ]}
                  onPress={() => {
                    setEmploymentStatus(item);
                    setIsEmploymentDropdownOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#E2E8F0' },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDarkMode ? '#FFFFFF' : '#0284C7'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 2. Occupation Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Occupation / Field of Work *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isOccupationDropdownOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isOccupationDropdownOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => {
            setIsOccupationDropdownOpen((prev) => !prev);
            setIsEmploymentDropdownOpen(false);
            setIsEducationDropdownOpen(false);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.dropdownValueText,
              { color: occupation ? dmText : '#94A3B8' },
            ]}
          >
            {occupation || 'Select Occupation / Field of Work'}
          </Text>
          <IconSymbol
            name={isOccupationDropdownOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isOccupationDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {OCCUPATION_OPTIONS.map((item) => {
              const isSelected = occupation === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownOptionItem,
                    isSelected && styles.dropdownOptionItemActive,
                    isDarkMode && { borderBottomColor: '#152238' },
                    isDarkMode && isSelected && { backgroundColor: '#0369A1' },
                  ]}
                  onPress={() => {
                    setOccupation(item);
                    setIsOccupationDropdownOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#E2E8F0' },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDarkMode ? '#FFFFFF' : '#0284C7'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 3. Educational Attainment Dropdown */}
      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDarkMode ? '#CBD5E1' : '#334155' }]}>
          Educational Attainment *
        </Text>
        <TouchableOpacity
          style={[
            styles.dropdownTrigger,
            isEducationDropdownOpen && styles.dropdownTriggerActive,
            { backgroundColor: dmInputBg, borderColor: isEducationDropdownOpen ? '#0284C7' : dmBorder },
          ]}
          onPress={() => {
            setIsEducationDropdownOpen((prev) => !prev);
            setIsEmploymentDropdownOpen(false);
            setIsOccupationDropdownOpen(false);
          }}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.dropdownValueText,
              { color: educationalAttainment ? dmText : '#94A3B8' },
            ]}
          >
            {educationalAttainment || 'Select Educational Attainment'}
          </Text>
          <IconSymbol
            name={isEducationDropdownOpen ? 'chevron.up' : 'chevron.down'}
            size={20}
            color={isDarkMode ? '#94A3B8' : '#64748B'}
          />
        </TouchableOpacity>

        {isEducationDropdownOpen && (
          <View
            style={[
              styles.dropdownMenu,
              isDarkMode && { backgroundColor: '#1C2541', borderColor: '#3A506B' },
            ]}
          >
            {EDUCATIONAL_ATTAINMENT_OPTIONS.map((item) => {
              const isSelected = educationalAttainment === item;
              return (
                <TouchableOpacity
                  key={item}
                  style={[
                    styles.dropdownOptionItem,
                    isSelected && styles.dropdownOptionItemActive,
                    isDarkMode && { borderBottomColor: '#152238' },
                    isDarkMode && isSelected && { backgroundColor: '#0369A1' },
                  ]}
                  onPress={() => {
                    setEducationalAttainment(item);
                    setIsEducationDropdownOpen(false);
                  }}
                  activeOpacity={0.75}
                >
                  <Text
                    style={[
                      styles.dropdownOptionText,
                      isSelected && styles.dropdownOptionTextActive,
                      isDarkMode && { color: isSelected ? '#FFFFFF' : '#E2E8F0' },
                    ]}
                  >
                    {item}
                  </Text>
                  {isSelected && (
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={18}
                      color={isDarkMode ? '#FFFFFF' : '#0284C7'}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={onNext}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryButtonText}>Next: Residency</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
