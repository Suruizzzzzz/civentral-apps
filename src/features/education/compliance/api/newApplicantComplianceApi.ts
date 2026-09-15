import { getEducationAuthHeaders, handleEducationResponse } from '@/src/services/education-auth-helper';
import { EDUCATION_API_BASE_URL } from '../../new-applicant/api/ScholarshipProgramApi';

export interface TargetDocumentItem {
  application_document_id: number;
  program_document_id: number;
  document_code: string;
  document_name: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  submission_status: string;
  validation_result: string;
  review_remarks?: string | null;
}

export interface ReplacementDocumentItem {
  replacement_document_id: number;
  replacement_filename: string;
  mime_type: string;
  file_size: number;
  submission_status: string;
  submitted_at: string;
}

export interface ApplicationComplianceItem {
  compliance_id: number;
  compliance_code: string;
  application_id: number;
  requirement_title: string;
  compliance_type: string;
  instructions?: string | null;
  requested_at: string;
  due_at?: string | null;
  status: 'Pending' | 'Overdue' | 'Submitted' | 'Complied' | string;
  complied_at?: string | null;
  target_document?: TargetDocumentItem | null;
  replacement_document?: ReplacementDocumentItem | null;
}

export interface ApplicationComplianceSummary {
  actionable_count: number;
  awaiting_review_count: number;
  resolved_count: number;
  cancelled_count: number;
  total_history_count: number;
}

export interface ApplicationComplianceData {
  application_id: number | null;
  application_code: string | null;
  application_status: string | null;
  summary?: ApplicationComplianceSummary;
  compliance_requests: ApplicationComplianceItem[];
}

export interface ApplicationComplianceResponse {
  status: 'success' | 'error';
  message: string;
  data: ApplicationComplianceData | null;
}

export async function fetchApplicationCompliance(): Promise<ApplicationComplianceData> {
  const headers = await getEducationAuthHeaders({
    'Content-Type': 'application/json',
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/application-compliance`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch application compliance (HTTP ${res.status})`);
  }

  const json: ApplicationComplianceResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to retrieve application compliance.');
  }

  return json.data;
}

export async function submitApplicationComplianceReplacement(
  complianceId: number,
  file: { uri: string; name: string; type: string },
  targetDocumentId?: number | null
): Promise<ApplicationComplianceData> {
  const formData = new FormData();
  formData.append('compliance_id', String(complianceId));
  if (targetDocumentId) {
    formData.append('target_document_id', String(targetDocumentId));
  }
  formData.append('replacement_file', {
    uri: file.uri,
    name: file.name,
    type: file.type || 'application/octet-stream',
  } as any);

  const headers = await getEducationAuthHeaders();

  const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/application-compliance/submit`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    const errText = await res.text();
    let parsedMsg = `Unable to submit replacement document (HTTP ${res.status}).`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.message) parsedMsg = errJson.message;
    } catch {}
    throw new Error(parsedMsg);
  }

  const json: ApplicationComplianceResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to complete document replacement submission.');
  }

  return json.data;
}
