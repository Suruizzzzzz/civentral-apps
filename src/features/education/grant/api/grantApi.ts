import type * as DocumentPicker from "expo-document-picker";
import { File as ExpoFile } from "expo-file-system";
import { fetch as expoFetch } from "expo/fetch";
import { getEducationAuthHeaders, handleEducationResponse } from "@/src/services/education-auth-helper";
import { EDUCATION_API_BASE_URL } from "../../new-applicant/api/ScholarshipProgramApi";

export interface ScholarInfo {
  scholar_id: number;
  scholar_code: string;
  citizen_user_id: number;
  program_id: number;
  program_code: string;
  program_name: string;
  scholar_name: string;
  scholar_status: string;
  has_issued_certificate?: boolean;
}

export interface AcademicPeriodInfo {
  academic_period_id: number;
  academic_year: string;
  term: string;
  status: string;
}

export interface PartnerSchoolInfo {
  partner_school_id: number;
  school_code: string;
  institution_name: string;
  institution_type: "Public" | "Private";
  city_municipality?: string | null;
  province_city?: string | null;
  complete_address?: string | null;
}

export interface GrantDocumentItem {
  grant_document_id: number;
  grant_application_id: number;
  document_type: "COR" | "SOA";
  file_name: string;
  file_path: string;
  mime_type?: string;
  file_size?: number;
  submission_status: "Submitted" | "Replacement Submitted" | "Removed";
  replaced_document_id?: number | null;
  submitted_at: string;
  review_status: "Pending" | "Valid" | "Invalid" | "Needs Replacement";
  review_remarks?: string | null;
}

export interface GrantApplicationDetail {
  grant_application_id: number;
  grant_application_code: string;
  scholar_id: number;
  scholar_code: string;
  scholar_name: string;
  academic_period_id: number;
  academic_year: string;
  academic_term: string;
  program_id: number;
  program_code: string;
  program_name: string;
  institution_id?: number | null;
  school_code?: string | null;
  institution_name?: string | null;
  institution_name_snapshot?: string | null;
  institution_type?: "Public" | "Private" | null;
  institution_verification_status?: string | null;
  grant_status: string;
  submitted_at?: string | null;
  created_at: string;
  documents?: GrantDocumentItem[];
  document_summary?: {
    institution_type: "Public" | "Private";
    required_count: number;
    submitted_count: number;
    summary_label: string;
  };

  // Phase 4D: Tuition figures & status breakdown provided by backend
  assessed_eligible_tuition?: number | null;
  program_tuition_maximum?: number | null;
  actual_tuition_grant_entitlement?: number | null;
  stipend_status?: string | null;
  tuition_status?: string | null;
  hold_explanation?: string | null;
}

export interface CitizenGrantOverviewData {
  eligible: boolean;
  reason?: string | null;
  has_existing_application?: boolean;
  application?: GrantApplicationDetail | null;
  institution_resolved?: boolean;
  institution?: PartnerSchoolInfo | null;
  scholar?: ScholarInfo | null;
  current_academic_period?: AcademicPeriodInfo | null;

  // Phase 4D: Tuition figures & component status fields at overview level
  assessed_eligible_tuition?: number | null;
  program_tuition_maximum?: number | null;
  actual_tuition_grant_entitlement?: number | null;
  stipend_status?: string | null;
  tuition_status?: string | null;
  hold_explanation?: string | null;
}

export async function fetchCitizenGrantOverview(): Promise<CitizenGrantOverviewData> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/grants/citizen/overview`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch grant overview (HTTP ${res.status})`);
  }

  const json = await res.json();
  if (json.status !== "success" || !json.data) {
    throw new Error(json.message || "Unable to retrieve grant overview.");
  }

  return json.data;
}

export async function fetchPartnerSchoolsLookup(
  programId?: number,
  search?: string,
): Promise<PartnerSchoolInfo[]> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const params = new URLSearchParams();
  if (programId) params.append("program_id", String(programId));
  if (search) params.append("search", search);

  const url = `${EDUCATION_API_BASE_URL}/grants/lookups/partner-schools?${params.toString()}`;
  const res = await fetch(url, { headers });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch partner schools (HTTP ${res.status})`);
  }

  const json = await res.json();
  return json.data || [];
}

export async function createGrantApplication(
  institutionId?: number,
): Promise<GrantApplicationDetail> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const bodyData: Record<string, any> = {};
  if (institutionId) {
    bodyData["institution_id"] = institutionId;
  }

  const res = await fetch(`${EDUCATION_API_BASE_URL}/grants/applications`, {
    method: "POST",
    headers,
    body: JSON.stringify(bodyData),
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  const json = await res.json();
  if (!res.ok || json.status === "error") {
    throw new Error(json.message || `Application creation failed (HTTP ${res.status})`);
  }

  return json.data;
}

export async function uploadGrantDocument(
  applicationId: number,
  documentType: "COR" | "SOA",
  fileUri: string,
  fileName: string,
  mimeType: string,
): Promise<GrantApplicationDetail> {
  const headers = await getEducationAuthHeaders();
  
  const formData = new FormData();
  formData.append("document_type", documentType);
  
  // @ts-ignore
  formData.append("file", {
    uri: fileUri,
    name: fileName,
    type: mimeType || "application/pdf",
  });

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/grants/applications/${applicationId}/documents`,
    {
      method: "POST",
      headers,
      body: formData,
    },
  );

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  const json = await res.json();
  if (!res.ok || json.status === "error") {
    throw new Error(json.message || `Document upload failed (HTTP ${res.status})`);
  }

  return json.data;
}

export async function submitGrantApplication(
  applicationId: number,
): Promise<GrantApplicationDetail> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/grants/applications/${applicationId}/submit`,
    {
      method: "POST",
      headers,
    },
  );

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  const json = await res.json();
  if (!res.ok || json.status === "error") {
    throw new Error(json.message || `Grant submission failed (HTTP ${res.status})`);
  }

  return json.data;
}
export interface DocumentValidationResult {
  result: "MATCH" | "MISMATCH" | "INCONCLUSIVE";
  expected_document_code: string;
  detected_document_code: string | null;
  message: string;
  confidence: number;
}

export async function validateCitizenGrantDocument(
  fileAsset: DocumentPicker.DocumentPickerAsset,
  documentType: "COR" | "SOA"
): Promise<DocumentValidationResult | null> {
  const postUrl = `${EDUCATION_API_BASE_URL}/grants/citizen/validate-document`;

  try {
    const headers = await getEducationAuthHeaders({
      Accept: "application/json",
    });

    const formData = new FormData();
    formData.append("document_type", documentType);

    let expoFile: any;
    if (fileAsset.uri) {
      expoFile = new ExpoFile(fileAsset.uri);
    } else {
      expoFile = {
        uri: fileAsset.uri,
        name: fileAsset.name || `${documentType.toLowerCase()}.pdf`,
        type: fileAsset.mimeType || "application/pdf",
      };
    }
    formData.append("file", expoFile as any);

    const res = await expoFetch(postUrl, {
      method: "POST",
      headers,
      body: formData,
    });

    if (res.status === 401 || res.status === 429) {
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
    const validEnums = ["MATCH", "MISMATCH", "INCONCLUSIVE"];
    const resultEnum = validEnums.includes(val.result) ? val.result : "INCONCLUSIVE";

    return {
      result: resultEnum,
      expected_document_code: String(val.expected_document_code || documentType),
      detected_document_code: val.detected_document_code ? String(val.detected_document_code) : null,
      message: String(val.message || ""),
      confidence: typeof val.confidence === "number" ? val.confidence : 0,
    };
  } catch (err) {
    console.warn("[grantApi] validateCitizenGrantDocument error:", err);
    return null;
  }
}
