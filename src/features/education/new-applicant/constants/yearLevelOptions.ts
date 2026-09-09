export type EducationLevelCategory = 'SENIOR_HIGH' | 'TERTIARY' | 'POSTGRADUATE' | 'CONT_ED_VOCATIONAL';

export const YEAR_LEVEL_OPTIONS: Record<EducationLevelCategory, string[]> = {
  SENIOR_HIGH: ['Grade 11', 'Grade 12'],
  TERTIARY: ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'],
  POSTGRADUATE: ['1st Year', '2nd Year'],
  CONT_ED_VOCATIONAL: ['Level 1', 'Level 2'],
};

export interface ProgramEducationInfo {
  program_code?: string;
  category_name?: string;
  category?: {
    category_id?: number;
    category_code?: string;
    category_name?: string;
  };
  education_levels?: {
    education_level_id?: number;
    level_code?: string;
    level_name?: string;
  }[];
}

/**
 * Resolves the education level category from the scholarship program details.
 * Checks education_levels array, category object, category_name, and program_code.
 */
export function resolveEducationLevelCategory(
  program: ProgramEducationInfo | null | undefined
): EducationLevelCategory | null {
  if (!program) return null;

  // 1. Check education_levels array from API
  if (Array.isArray(program.education_levels) && program.education_levels.length > 0) {
    for (const lvl of program.education_levels) {
      const code = (lvl.level_code || '').toUpperCase();
      const name = (lvl.level_name || '').toUpperCase();

      if (code === 'SENIOR_HIGH' || code.includes('SHS') || name.includes('SENIOR HIGH')) {
        return 'SENIOR_HIGH';
      }
      if (code === 'TERTIARY' || code.includes('COLLEGE') || name.includes('TERTIARY') || name.includes('COLLEGE')) {
        return 'TERTIARY';
      }
      if (code === 'POSTGRADUATE' || code.includes('GRAD') || name.includes('POSTGRADUATE') || name.includes('MASTER')) {
        return 'POSTGRADUATE';
      }
      if (code === 'CONT_ED_VOCATIONAL' || code.includes('VOC') || name.includes('CONTINUING') || name.includes('VOCATIONAL')) {
        return 'CONT_ED_VOCATIONAL';
      }
    }
  }

  // 2. Check program.category object
  if (program.category) {
    const code = (program.category.category_code || '').toUpperCase();
    const name = (program.category.category_name || '').toUpperCase();

    if (code === 'SENIOR_HIGH' || name.includes('SENIOR HIGH')) {
      return 'SENIOR_HIGH';
    }
    if (code === 'TERTIARY' || name.includes('TERTIARY') || name.includes('COLLEGE')) {
      return 'TERTIARY';
    }
    if (code === 'POSTGRADUATE' || name.includes('POSTGRADUATE')) {
      return 'POSTGRADUATE';
    }
    if (code === 'CONT_ED_VOCATIONAL' || name.includes('CONTINUING') || name.includes('VOCATIONAL')) {
      return 'CONT_ED_VOCATIONAL';
    }
  }

  // 3. Check program.category_name or string fields
  const catCode = ((program as any).category_code || '').toUpperCase();
  const catName = (program.category_name || '').toUpperCase();

  if (catCode === 'SENIOR_HIGH' || catName.includes('SENIOR HIGH')) {
    return 'SENIOR_HIGH';
  }
  if (catCode === 'TERTIARY' || catName.includes('TERTIARY') || catName.includes('COLLEGE')) {
    return 'TERTIARY';
  }
  if (catCode === 'POSTGRADUATE' || catName.includes('POSTGRADUATE')) {
    return 'POSTGRADUATE';
  }
  if (catCode === 'CONT_ED_VOCATIONAL' || catName.includes('CONTINUING') || catName.includes('VOCATIONAL')) {
    return 'CONT_ED_VOCATIONAL';
  }

  // 4. Fallback: inspect program_code
  const progCode = (program.program_code || '').toUpperCase();
  if (progCode.includes('SHS')) return 'SENIOR_HIGH';
  if (progCode.includes('TER')) return 'TERTIARY';
  if (progCode.includes('POST')) return 'POSTGRADUATE';
  if (progCode.includes('VOC') || progCode.includes('CONT')) return 'CONT_ED_VOCATIONAL';

  return null;
}

/**
 * Returns available year levels for the given program, or empty array if unsupported.
 */
export function getAvailableYearLevels(program: ProgramEducationInfo | null | undefined): string[] {
  const category = resolveEducationLevelCategory(program);
  if (!category) return [];
  return YEAR_LEVEL_OPTIONS[category] || [];
}
