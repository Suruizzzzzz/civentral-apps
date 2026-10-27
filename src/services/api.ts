import { DomainApplication } from '@/types/domain';
import { getEducationAuthHeaders, handleEducationResponse } from './education-auth-helper';
import { EDUCATION_API_BASE_URL } from '@/src/features/education/new-applicant/api/ScholarshipProgramApi';

export interface SummaryCounts {
  active_requests_count: number;
  ready_documents_count: number;
  grant_release_count: number;
}

export interface TrackedItem {
  id: string;
  raw_id?: number;
  code: string;
  type: 'Scholarship Application' | 'Scholarship Renewal' | 'Scholarship Grant';
  serviceTitle: string;
  domainId: string;
  status: string;
  displayStatus: string;
  createdAt: string;
  updatedAt: string;
  details?: {
    program_name?: string;
    program_code?: string;
    application_code?: string;
    renewal_code?: string;
    release_code?: string;
    academic_period?: string;
    total_amount?: number;
    components?: Array<{
      component_id: number;
      component_type: string;
      amount: number;
      status: string;
    }>;
  };
}

export class CivicApiService {
  /**
   * Fetch Citizen Summary Counts from Education Backend API
   * Endpoint: /api/v1/education/citizen/summary-counts
   * Returns SummaryCounts object on success, or null on network/API error.
   */
  static async getCitizenSummaryCounts(): Promise<SummaryCounts | null> {
    try {
      const headers = await getEducationAuthHeaders();
      const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/summary-counts`, {
        method: 'GET',
        headers,
      });

      await handleEducationResponse(res);

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json.status === 'success' && json.data) {
        return {
          active_requests_count: Number(json.data.active_requests_count || 0),
          ready_documents_count: Number(json.data.ready_documents_count || 0),
          grant_release_count: Number(json.data.grant_release_count || 0),
        };
      }
      return null;
    } catch (err: any) {
      if (err.message && err.message.includes('Session expired')) {
        throw err;
      }
      return null;
    }
  }

  /**
   * Fetch Real Tracked Education Items from Backend API
   * Endpoint: /api/v1/education/citizen/tracked-items
   * Returns TrackedItem[] on success, or null on network/API error.
   */
  static async getTrackedItems(): Promise<TrackedItem[] | null> {
    try {
      const headers = await getEducationAuthHeaders();
      const res = await fetch(`${EDUCATION_API_BASE_URL}/education/citizen/tracked-items`, {
        method: 'GET',
        headers,
      });

      await handleEducationResponse(res);

      if (!res.ok) {
        return null;
      }

      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data;
      }
      return [];
    } catch (err: any) {
      if (err.message && err.message.includes('Session expired')) {
        throw err;
      }
      return null;
    }
  }

  /**
   * @deprecated Legacy application fetcher shim. Citizen applications are tracked via getTrackedItems().
   */
  static async getApplications(_identifier?: string): Promise<DomainApplication[]> {
    return [];
  }
}

