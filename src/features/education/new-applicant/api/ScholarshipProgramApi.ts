import type * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';
import { fetch as expoFetch } from 'expo/fetch';
import { Platform } from 'react-native';

export const EDUCATION_API_BASE_URL =
  process.env.EXPO_PUBLIC_EDUCATION_API_BASE_URL ||
  Platform.select({
    android: 'http://10.0.2.2/civentral-education-backend/api/v1',
    default: 'http://localhost/civentral-education-backend/api/v1',
  })!;

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
  program_document_id?: number;
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

export function sanitizeScholarshipProgramContent(program: ScholarshipProgram): ScholarshipProgram {
  if (!program) return program;

  // Program-specific rule: apply overrides specifically to ACADEMIC-TER-001
  if (program.program_code !== 'ACADEMIC-TER-001') {
    return program;
  }

  return {
    ...program,
    required_documents: program.required_documents?.map((doc) => {
      const code = (doc.document_code || '').toUpperCase();
      const name = (doc.document_name || '').toUpperCase();

      if (code === 'ACADEMIC_RECORD' || name.includes('ACADEMIC RECORD')) {
        return {
          ...doc,
          description:
            "Official Transcript of Records (TOR), Certificate of Grades, or equivalent academic record used to verify the applicant's tertiary academic performance.",
          instructions:
            doc.instructions && !doc.instructions.toLowerCase().includes('form 137')
              ? doc.instructions
              : "Submit Official Transcript of Records (TOR), Certificate of Grades, or equivalent academic record.",
        };
      }

      if (
        code === 'ENROLLMENT_PROOF' ||
        name.includes('ENROLLMENT') ||
        name.includes('REGISTRATION')
      ) {
        return {
          ...doc,
          description:
            "Document confirming that the applicant is currently enrolled, registered, or accepted in a college or university.",
          instructions:
            doc.instructions && !doc.instructions.toLowerCase().includes('senior high')
              ? doc.instructions
              : "Submit proof of current college or university enrollment, registration, or acceptance.",
        };
      }

      return doc;
    }),
  };
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
  const list: ScholarshipProgram[] = json.data || [];
  return list.map(sanitizeScholarshipProgramContent);
}

export async function getScholarshipProgramDetails(programId: number): Promise<ScholarshipProgram | null> {
  const url = `${EDUCATION_API_BASE_URL}/scholarship-programs/${programId}`;
  console.log('[ScholarshipProgramApi] GET Program Detail URL =', url);
  const res = await fetch(url);
  if (res.status === 404) return null;
  const json = await res.json();
  const program: ScholarshipProgram | null = json.data || null;
  return program ? sanitizeScholarshipProgramContent(program) : null;
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

import { getEducationAuthHeaders, handleEducationResponse } from '@/src/services/education-auth-helper';


export interface DocumentValidationResult {
  result: 'MATCH' | 'MISMATCH' | 'INCONCLUSIVE';
  expected_document_code: string;
  detected_document_code: string | null;
  message: string;
  confidence: number;
}

export interface ValidateDocumentResponse {
  success: boolean;
  validation: DocumentValidationResult;
}

export interface SubmitApplicationResult {
  application_id: number;
  application_code: string;
  application_status: string;
  submitted_at: string;
  program_name: string;
  academic_year: string;
  term: string;
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

export async function submitNewScholarshipApplication(
  formData: FormData
): Promise<SubmitApplicationResult> {
  const postUrl = `${EDUCATION_API_BASE_URL}/scholarship-applications/citizen/submit`;

  const headers = await getEducationAuthHeaders({
    Accept: 'application/json',
  });

  try {
    const res = await expoFetch(postUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      await handleEducationResponse(res);
    }

    const rawText = await res.text();
    let json: any = null;

    if (rawText && rawText.trim().length > 0) {
      try {
        json = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            json = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }
    }

    if (!res.ok || (json && json.status === 'error')) {
      const errorMsg =
        json?.message ||
        `Submission failed with HTTP ${res.status}. Please try again later.`;
      const err = new Error(errorMsg) as any;
      err.status = res.status;
      throw err;
    }

    if (!json || !json.data) {
      throw new Error('Server returned an unexpected response format.');
    }

    return json.data;
  } catch (err: any) {
    throw err;
  }
}

export interface PartnerSchoolLookupItem {
  institution_id: number;
  institution_name: string;
  institution_code: string;
  institution_type: string;
  city_municipality?: string | null;
  province_city?: string | null;
  complete_address?: string | null;
  school_status?: string;
}

export async function getPartnerSchoolsLookup(
  programId?: number | null
): Promise<PartnerSchoolLookupItem[]> {
  const query = programId ? "?program_id=" + programId : "";
  const url = EDUCATION_API_BASE_URL + "/grants/lookups/partner-schools" + query;
  const headers = await getEducationAuthHeaders({
    Accept: 'application/json',
  });
  try {
    const res = await expoFetch(url, { method: 'GET', headers });
    if (!res.ok) {
      return [];
    }
    const json = await res.json();
    const list = Array.isArray(json?.data) ? json.data : [];
    return list.map((item: any) => ({
      institution_id: Number(item.institution_id ?? item.partner_school_id),
      institution_name: String(item.institution_name ?? ''),
      institution_code: String(item.institution_code ?? item.school_code ?? ''),
      institution_type: String(item.institution_type ?? ''),
      city_municipality: item.city_municipality ?? null,
      province_city: item.province_city ?? null,
      complete_address: item.complete_address ?? null,
      school_status: item.school_status ?? 'Active',
    }));
  } catch (err) {
    console.error('[ScholarshipProgramApi] getPartnerSchoolsLookup error:', err);
    return [];
  }
}


export async function validateCitizenDocument(
  fileAsset: DocumentPicker.DocumentPickerAsset,
  programDocumentId: number,
  programId: number
): Promise<DocumentValidationResult | null> {
  const postUrl = `${EDUCATION_API_BASE_URL}/scholarship-applications/citizen/validate-document`;

  try {
    const headers = await getEducationAuthHeaders({
      Accept: 'application/json',
    });

    const formData = new FormData();
    formData.append('program_document_id', String(programDocumentId));
    formData.append('program_id', String(programId));

    let expoFile: any;
    if (fileAsset.uri) {
      expoFile = new ExpoFile(fileAsset.uri);
    } else {
      expoFile = {
        uri: fileAsset.uri,
        name: fileAsset.name || 'document',
        type: fileAsset.mimeType || 'application/pdf',
      };
    }
    formData.append('file', expoFile as any);

    const res = await expoFetch(postUrl, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (res.status === 401) {
      await handleEducationResponse(res);
    }

    const rawText = await res.text();
    let json: any = null;

    if (rawText && rawText.trim().length > 0) {
      try {
        json = JSON.parse(rawText);
      } catch {
        const jsonMatch = rawText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            json = JSON.parse(jsonMatch[0]);
          } catch {}
        }
      }
    }

    if (!res.ok || !json || !json.success || !json.validation) {
      return null;
    }

    const val = json.validation;
    const validEnums = ['MATCH', 'MISMATCH', 'INCONCLUSIVE'];
    const resultEnum = validEnums.includes(val.result) ? val.result : 'INCONCLUSIVE';

    return {
      result: resultEnum,
      expected_document_code: String(val.expected_document_code || ''),
      detected_document_code: val.detected_document_code ? String(val.detected_document_code) : null,
      message: String(val.message || ''),
      confidence: typeof val.confidence === 'number' ? val.confidence : 0,
    };
  } catch (err) {
    console.warn('[ScholarshipProgramApi] validateCitizenDocument error:', err);
    return null;
  }
}
