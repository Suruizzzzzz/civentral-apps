import { AuthService } from '@/src/services/auth-service';
import { EDUCATION_API_BASE_URL } from '../../new-applicant/api/ScholarshipProgramApi';

export type RenewalState =
  | 'NOT_A_SCHOLAR'
  | 'SCHOLAR_INACTIVE'
  | 'RENEWAL_NOT_OPEN'
  | 'RENEWAL_AVAILABLE'
  | 'RENEWAL_EXISTS';

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
  application_period_id: number;
  period_code: string;
  academic_year: string;
  term: string;
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

export interface ExistingRenewalInfo {
  renewal_id: number;
  renewal_code: string;
  renewal_status: string;
  submitted_at: string;
  withdrawn_at?: string | null;
  withdrawal_reason?: string | null;
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
  status: 'success' | 'error';
  message: string;
  data: CitizenRenewalOverviewData | null;
}

export async function fetchCitizenRenewalOverview(): Promise<CitizenRenewalOverviewData> {
  const session = await AuthService.getCurrentUser();
  const citizenUserId = session?.citizen_user_id || session?.user?.citizen_user_id || session?.user?.user_id;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (citizenUserId) {
    headers['X-Citizen-User-Id'] = String(citizenUserId);
    headers['X-User-Id'] = String(citizenUserId);
  }

  const res = await fetch(`${EDUCATION_API_BASE_URL}/scholarship-renewals/citizen/overview`, {
    headers,
  });

  if (res.status === 401) {
    throw new Error('Unauthorized. Authentication required.');
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch renewal overview (HTTP ${res.status})`);
  }

  const json: CitizenRenewalOverviewResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to retrieve renewal overview.');
  }

  return json.data;
}
