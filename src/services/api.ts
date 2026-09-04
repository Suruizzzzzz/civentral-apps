import { DomainApplication } from '@/types/domain';
import { API_BASE_URL } from './auth-service';
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
   * Fetch Real Citizen Applications from PHP Backend API
   */
  static async getApplications(identifier?: string): Promise<DomainApplication[]> {
    try {
      const endpoints = [`${API_BASE_URL}/applications`, `${API_BASE_URL}/get-applications.php`];
      let response: Response | null = null;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: identifier || '' }),
          });
          if (res.ok) {
            response = res;
            break;
          }
        } catch {}
      }

      if (!response) return [];

      const text = await response.text();
      let json: any;
      try {
        json = JSON.parse(text);
      } catch {
        return [];
      }

      if (json.status === 'success' && Array.isArray(json.data)) {
        return json.data.map((item: any) => ({
          id: item.application_id || item.id || `APP-${item.id}`,
          domainId: item.domain_id || item.domainId || 'identity',
          serviceTitle: item.service_title || item.title || 'Civic Service Application',
          applicantId: item.applicant_id || item.applicantId || '',
          status: item.status || 'Pending',
          createdAt: item.created_at || item.createdAt || '',
          updatedAt: item.updated_at || item.updatedAt || '',
        }));
      }

      return [];
    } catch {
      return [];
    }
  }
}

