import { getEducationAuthHeaders, handleEducationResponse } from '@/src/services/education-auth-helper';
import { EDUCATION_API_BASE_URL } from '../../new-applicant/api/ScholarshipProgramApi';

export interface DashboardScholar {
  scholar_id: number;
  scholar_code: string;
  scholar_status: string;
  admitted_at: string;
  status_reason?: string | null;
}

export interface DashboardScholarship {
  program_id: number;
  program_code: string;
  program_name: string;
  category_name?: string | null;
  description?: string | null;
}

export interface DashboardAcademicPeriod {
  application_period_id: number;
  period_code: string;
  academic_year: string;
  term: string;
}

export interface DashboardInterview {
  status: string;
  method: string;
  scheduled_date: string | null;
  scheduled_time: string | null;
  venue_or_link: string | null;
}

export interface DashboardApplication {
  application_id: number;
  application_code: string;
  application_status: string;
  submitted_at: string;
  requires_interview?: number;
  interview?: DashboardInterview | null;
}

export interface TimelineItem {
  key: string;
  title: string;
  date: string | null;
  is_completed: boolean;
  is_current: boolean;
}

export interface DashboardGrant {
  amount?: number | null;
  amount_formatted?: string | null;
  status?: string | null;
  expected_release_date?: string | null;
}

export interface DashboardLatestUpdate {
  title: string;
  timestamp: string | null;
}

export interface CitizenDashboardData {
  state: 'NO_SCHOLARSHIP' | 'APPLICATION_IN_PROGRESS' | 'SCHOLAR_WITHOUT_GRANT' | 'ACTIVE_SCHOLAR' | 'ACTIVE_GRANT';
  scholar: DashboardScholar | null;
  scholarship: DashboardScholarship | null;
  academic_period: DashboardAcademicPeriod | null;
  application: DashboardApplication | null;
  process_timeline: TimelineItem[];
  grant: DashboardGrant | null;
  latest_update: DashboardLatestUpdate;
}

export interface CitizenDashboardResponse {
  status: 'success' | 'error';
  message: string;
  data: CitizenDashboardData | null;
}

export async function fetchCitizenDashboard(): Promise<CitizenDashboardData> {
  const headers = await getEducationAuthHeaders({
    'Content-Type': 'application/json',
  });

  const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/scholarship-dashboard`, {
    headers,
  });

  if (res.status === 401) {
    await handleEducationResponse(res);
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch dashboard overview (HTTP ${res.status})`);
  }

  const json: CitizenDashboardResponse = await res.json();
  if (json.status !== 'success' || !json.data) {
    throw new Error(json.message || 'Unable to retrieve dashboard information.');
  }

  return json.data;
}
