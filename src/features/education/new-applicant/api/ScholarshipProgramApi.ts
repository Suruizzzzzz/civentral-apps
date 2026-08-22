import { Platform } from 'react-native';

export const EDUCATION_API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2/civentral-education-backend/api/v1',
  default: 'http://localhost/civentral-education-backend/api/v1',
});

export interface ScholarshipCategory {
  category_id: number;
  category_code: string;
  category_name: string;
  display_order: number;
  program_count: number;
}

export interface ApplicationPeriod {
  application_period_id: number;
  period_code: string;
  academic_year: string;
  term: string;
  opening_date: string;
  closing_date: string;
  maximum_slots?: number | null;
  status: string;
}

export interface ScholarshipBenefit {
  benefit_type_id: number;
  benefit_code: string;
  benefit_name: string;
  amount: number;
  amount_basis: string;
  calculation_method: string;
}

export interface ScholarshipEligibilityRequirement {
  eligibility_id: number;
  criteria_code: string;
  criteria_name: string;
  criteria_type: string;
  description: string;
  condition_operator: string;
  condition_value: string;
  display_requirement: string;
  is_required: boolean;
}

export interface ScholarshipRequiredDocument {
  document_requirement_id: number;
  document_code: string;
  document_name: string;
  description: string;
  requirement_level: string;
  instructions: string;
}

export interface ScholarshipProgram {
  program_id: number;
  program_code: string;
  program_name: string;
  category_id: number;
  category_name: string;
  description: string;
  program_status: string;
  matching_status: string;
  eligibility_requirement_count?: number;
  required_document_count?: number;
  application_period?: ApplicationPeriod | null;
  application_periods?: ApplicationPeriod[];
  eligibility_requirements?: ScholarshipEligibilityRequirement[];
  required_documents?: ScholarshipRequiredDocument[];
  benefits?: ScholarshipBenefit[];
}

export interface MatchingOption {
  option_id: number;
  option_value: string;
  option_label: string;
  display_order: number;
}

export interface ProgramMapping {
  program_id: number;
  question_role: 'Eligibility' | 'Supporting';
  program_eligibility_id?: number | null;
}

export interface MatchingQuestion {
  question_id: number;
  question_key: string;
  question_text: string;
  question_type: 'SingleSelect' | 'Number' | 'YesNo' | 'Text';
  helper_text?: string | null;
  resolved_display_order: number;
  display_order: number;
  options: MatchingOption[];
  program_mappings: ProgramMapping[];
}

export interface CriterionItem {
  question_key: string;
  label: string;
  applicant_value: string;
  requirement_display: string;
  requirement: string;
  status: 'Passed' | 'Not Met' | 'Incomplete' | 'Informational';
  result?: 'Passed' | 'Not Met' | 'Incomplete' | 'Informational';
  message: string;
}

export interface EvaluatedProgram {
  rank: number;
  is_top_match: boolean;
  program_id: number;
  program_code: string;
  program_name: string;
  category_name?: string;
  description: string;
  match_score: number;
  score_status: string;
  eligibility_status: 'Eligible' | 'Not Eligible' | 'Incomplete';
  availability_status: string;
  criteria: CriterionItem[];
  rag_explanation?: string;
  current_application_period?: ApplicationPeriod | null;
}

export interface PreScreenSummary {
  total_programs: number;
  eligible_count: number;
  incomplete_count: number;
  not_eligible_count: number;
  configuration_error_count: number;
}

export interface PreScreenResponse {
  summary: PreScreenSummary;
  programs: EvaluatedProgram[];
}

export async function fetchScholarshipCategories(): Promise<ScholarshipCategory[]> {
  const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-programs/categories`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchScholarshipPrograms(categoryId?: number): Promise<ScholarshipProgram[]> {
  const url = categoryId
    ? `${EDUCATION_API_BASE_URL}/scholarship-programs?category_id=${categoryId}`
    : `${EDUCATION_API_BASE_URL}/scholarship-programs`;
  const res = await fetch(url);
  const json = await res.json();
  return json.data || [];
}

export async function getScholarshipProgramDetails(programId: number): Promise<ScholarshipProgram | null> {
  const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-programs/${programId}`);
  if (res.status === 404) return null;
  const json = await res.json();
  return json.data || null;
}

export async function fetchPublicMatchingQuestions(educationLevel: string): Promise<MatchingQuestion[]> {
  const encoded = encodeURIComponent(educationLevel);
  const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-matching/questions?education_level=${encoded}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchMatchingEducationLevels(): Promise<string[]> {
  try {
    const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-matching/programs`);
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data?.programs)) {
      const levelsSet = new Set<string>();
      json.data.programs.forEach((prog: any) => {
        const isProgramActive = prog.program_status === 'Active';
        const isMatchingActive = prog.matching_status === 'Active';
        const hasQuestions = (prog.matching_question_count || 0) > 0;

        if (isProgramActive && isMatchingActive && hasQuestions) {
          if (Array.isArray(prog.education_levels) && prog.education_levels.length > 0) {
            prog.education_levels.forEach((lvl: any) => {
              if (lvl.level_name) levelsSet.add(lvl.level_name);
            });
          } else if (prog.category?.category_name) {
            levelsSet.add(prog.category.category_name);
          }
        }
      });
      if (levelsSet.size > 0) {
        return Array.from(levelsSet);
      }
    }
  } catch (err) {
    console.error('[ScholarshipProgramApi] fetchMatchingEducationLevels error:', err);
  }
  return ['Senior High School', 'Tertiary', 'Continuing Education/Vocational'];
}

export async function submitPreScreen(
  educationLevel: string,
  answers: Record<string, string>
): Promise<PreScreenResponse> {
  const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-matching/pre-screen`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ education_level: educationLevel, answers }),
  });
  const json = await res.json();
  return json.data;
}


