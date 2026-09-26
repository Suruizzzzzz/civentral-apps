import type * as DocumentPicker from "expo-document-picker";
import { fetch as expoFetch } from "expo/fetch";
import { getEducationAuthHeaders, handleEducationResponse } from "@/src/services/education-auth-helper";
import { DocumentValidationResult, EDUCATION_API_BASE_URL } from "../../new-applicant/api/ScholarshipProgramApi";
import { sanitizeErrorMessage } from "@/src/utils/errorUtils";

export type RenewalState =
  | "NOT_A_SCHOLAR"
  | "SCHOLAR_INACTIVE"
  | "RENEWAL_NOT_OPEN"
  | "RENEWAL_AVAILABLE"
  | "RENEWAL_EXISTS";

export interface ScholarInfo {
  scholar_id: number;
  scholar_code: string;
  scholar_status: string;
  admitted_at: string;
  status_reason?: string | null;
}

export interface ProgramInfo {
  program_id: number;
  program_code: string;
  program_name: string;
  category_name?: string | null;
  description?: string | null;
}

export interface AcademicPeriodInfo {
  academic_period_id: number;
  academic_year: string;
  term: string;
  start_date?: string | null;
  end_date?: string | null;
  status?: string | null;
  application_period_id?: number;
  period_code?: string;
}

export interface RenewalPeriodInfo {
  renewal_period_id: number;
  academic_period_id: number;
  opening_date: string;
  closing_date: string;
  status: string;
  academic_year: string;
  term: string;
}

export interface UpcomingRenewalPeriodInfo {
  renewal_period_id: number;
  opening_date: string;
  closing_date: string;
  academic_year: string;
  term: string;
}

export interface RenewalCertificateInfo {
  certificate_number: string;
  certificate_status: "For Issuance" | "Signed" | "Issued" | "Cancelled";
  prepared_at: string;
  signed_at?: string | null;
  issued_at?: string | null;
}

export interface ExistingRenewalInfo {
  renewal_id: number;
  renewal_code: string;
  renewal_status: string;
  submitted_at: string;
  withdrawn_at?: string | null;
  withdrawal_reason?: string | null;
  citizen_action_required?: boolean;
  citizen_action_type?: string | null;
  certificate?: RenewalCertificateInfo | null;
}

export interface RequiredDocumentItem {
  code: string;
  name: string;
  description: string;
}

export interface CitizenRenewalOverviewData {
  state: RenewalState;
  renewal_available: boolean;
  scholar: ScholarInfo | null;
  program: ProgramInfo | null;
  current_academic_period: AcademicPeriodInfo | null;
  renewal_period: RenewalPeriodInfo | null;
  upcoming_renewal_period: UpcomingRenewalPeriodInfo | null;
  renewal: ExistingRenewalInfo | null;
  required_documents: RequiredDocumentItem[];
}

export type CitizenRenewalOverview = CitizenRenewalOverviewData;

export interface CitizenRenewalOverviewResponse {
  status: "success" | "error";
  message: string;
  data: CitizenRenewalOverviewData | null;
}

export interface SubmitRenewalResult {
  renewal_id: number;
  renewal_code: string;
  renewal_status: string;
  submitted_at: string;
}

export interface AffectedDocumentInfo {
  renewal_document_id: number;
  document_type: string;
  file_name: string;
  file_size: number;
  validation_status: string;
  review_remarks?: string | null;
}

export interface ComplianceRequestItem {
  renewal_compliance_id: number;
  compliance_code: string;
  request_type:
    | "Document Replacement"
    | "Academic Clarification"
    | "Information Clarification"
    | "Other";
  instructions: string;
  requested_at: string;
  due_at?: string | null;
  compliance_status: string;
  affected_document?: AffectedDocumentInfo | null;
}

export interface SscReturnContext {
  return_reason?: string | null;
  return_instructions?: string | null;
  returned_at?: string | null;
}

export interface CitizenComplianceDetailsData {
  renewal_id: number | null;
  renewal_code: string | null;
  renewal_status: string | null;
  scholar: ScholarInfo | null;
  program: ProgramInfo | null;
  current_academic_period?: AcademicPeriodInfo | null;
  unresolved_compliance_requests: ComplianceRequestItem[];
  ssc_return_context?: SscReturnContext | null;
  documents_needing_replacement: AffectedDocumentInfo[];
}

export interface CitizenComplianceDetailsResponse {
  status: "success" | "error";
  message: string;
  data: CitizenComplianceDetailsData | null;
}

export interface SubmitComplianceResponseResult {
  renewal_id: number;
  renewal_code: string;
  renewal_status: string;
  submitted_at: string;
}

export async function fetchCitizenRenewalOverview(): Promise<CitizenRenewalOverviewData> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/overview`,
    {
      headers,
    },
  );

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch renewal overview (HTTP ${res.status})`);
  }

  const json: CitizenRenewalOverviewResponse = await res.json();
  if (json.status !== "success" || !json.data) {
    throw new Error(sanitizeErrorMessage(json.message, "Unable to retrieve renewal overview."));
  }

  return json.data;
}

export async function submitCitizenRenewal(
  formData: FormData,
): Promise<SubmitRenewalResult> {
  const headers = await getEducationAuthHeaders();

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/submit`,
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
    const errorMsg = sanitizeErrorMessage(
      json.message,
      `Submission failed with HTTP ${res.status}`
    );
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    throw err;
  }

  return json.data;
}

export async function fetchCitizenRenewalCompliance(): Promise<CitizenComplianceDetailsData> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/compliance`,
    {
      headers,
    },
  );

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(
      sanitizeErrorMessage(json.message, `Failed to fetch compliance details (HTTP ${res.status})`),
    );
  }

  const json: CitizenComplianceDetailsResponse = await res.json();
  if (json.status !== "success" || !json.data) {
    throw new Error(sanitizeErrorMessage(json.message, "Unable to retrieve compliance details."));
  }

  return json.data;
}

export async function submitCitizenComplianceResponse(
  formData: FormData,
): Promise<SubmitComplianceResponseResult> {
  const headers = await getEducationAuthHeaders();

  const res = await fetch(
    `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/compliance-response`,
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
    const errorMsg = sanitizeErrorMessage(
      json.message,
      `Compliance submission failed with HTTP ${res.status}`
    );
    const err = new Error(errorMsg) as any;
    err.status = res.status;
    throw err;
  }

  return json.data;
}


export async function validateCitizenRenewalDocument(
  fileAsset: DocumentPicker.DocumentPickerAsset,
  documentType: string
): Promise<DocumentValidationResult | null> {
  const postUrl = `${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/validate-document`;

  try {
    const headers = await getEducationAuthHeaders({
      Accept: "application/json",
    });

    const formData = new FormData();
    formData.append("document_type", documentType);

    const mimeType = fileAsset.mimeType || "application/pdf";
    const isPng = mimeType.toLowerCase().includes("png");
    const isPdf = mimeType.toLowerCase().includes("pdf");
    const fallbackExt = isPdf ? "pdf" : (isPng ? "png" : "jpg");
    const safeName = fileAsset.name && fileAsset.name.includes(".")
      ? fileAsset.name
      : `doc_${Date.now()}.${fallbackExt}`;

    formData.append("file", {
      uri: fileAsset.uri,
      name: safeName,
      type: mimeType,
    } as any);

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
    console.warn("[renewalApi] validateCitizenRenewalDocument error:", err);
    return null;
  }
}
