import { getEducationAuthHeaders, handleEducationResponse } from "@/src/services/education-auth-helper";
import { EDUCATION_API_BASE_URL } from "../../new-applicant/api/ScholarshipProgramApi";

export type GrantComponentType = "Stipend" | "Tuition Grant";
export type GrantReleaseMethod = "Face-to-Face" | "Institutional Payment";
export type GrantComponentStatus = "For Release" | "Scheduled" | "Processing" | "Released" | "Failed" | "Cancelled";
export type F2FClaimStatus = "Scheduled" | "Ready for Claim" | "Released";

export interface CitizenF2FScheduleInfo {
  schedule_code?: string | null;
  release_date?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  venue_name?: string | null;
  complete_address?: string | null;
  claim_status: F2FClaimStatus;
  claim_reference?: string | null;
  claimed_at?: string | null;
}

export interface CitizenInstitutionalPaymentInfo {
  partner_school_name: string;
  institutional_status: string;
  has_notified_school: boolean;
}

export interface CitizenGrantReleaseComponent {
  component_id: number;
  component_type: GrantComponentType;
  release_method: GrantReleaseMethod;
  amount: number;
  component_status: GrantComponentStatus | string;
  released_at?: string | null;
  f2f_schedule?: CitizenF2FScheduleInfo | null;
  institutional_payment?: CitizenInstitutionalPaymentInfo | null;
  status_explanation?: string | null;
}

export interface CitizenGrantReleaseItem {
  release_code: string;
  program_name: string;
  academic_year: string;
  academic_term: string;
  release_status: string;
  authorized_amount: number;
  total_released_amount: number;
  remaining_amount: number;
  components: CitizenGrantReleaseComponent[];
}

export interface CitizenGrantReleaseResponse {
  status: "success" | "error";
  message: string;
  data: CitizenGrantReleaseItem[] | null;
}

/**
 * Fetch citizen-scoped Grant Releases for the logged-in scholar
 * GET /api/v1/grants/citizen/releases
 */
export async function fetchCitizenGrantReleases(): Promise<CitizenGrantReleaseItem[]> {
  const headers = await getEducationAuthHeaders({
    "Content-Type": "application/json",
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/grants/citizen/releases`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch grant release schedule (HTTP ${res.status})`);
  }

  const json: CitizenGrantReleaseResponse = await res.json();
  if (json.status !== "success" || !json.data) {
    throw new Error(json.message || "Unable to retrieve grant release schedule.");
  }

  return json.data;
}
