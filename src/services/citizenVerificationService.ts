import { Platform } from 'react-native';

export const CITIZEN_API_BASE_URL =
  process.env.EXPO_PUBLIC_CITIZEN_API_URL ||
  'https://api-citizen.civentral.tech/api/citizen';

export type CitizenVerificationStatusType =
  | 'Not_Submitted'
  | 'Pending'
  | 'Under_Review'
  | 'Returned_For_Correction'
  | 'Approved'
  | 'Rejected';

export interface CitizenVerificationPayload {
  citizen_user_id?: number;
  email?: string;
  phone?: string;
  mobile_number?: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  suffix?: string | null;
  sex?: string;
  place_of_birth?: string;
  birth_date?: string;
  civil_status?: string;
  employment_status?: string;
  occupation?: string;
  educational_attainment?: string;
  district?: string;
  barangay: string;
  street_address?: string;
  years_resident?: string | number;
  valid_id_type: string;
  valid_id_number: string;
  id_front_photo_url?: string | null;
  selfie_photo_url?: string | null;
  photo_1x1_url?: string | null;
  signature_photo_url?: string | null;
}

export interface CitizenVerificationResult {
  status: 'success' | 'error';
  message: string;
  data?: any;
  isConflict?: boolean;
}

export interface CitizenVerificationStatusResult {
  status: 'success' | 'error';
  is_verified?: boolean;
  verification_status?: CitizenVerificationStatusType;
  citizen_id_number?: string;
  photo_1x1_url?: string;
  signature_photo_url?: string;
  qr_code_token?: string;
  qr_code_image_url?: string;
  rejection_reason?: string;
  admin_action_notes?: string;
  data?: any;
  message?: string;
}

/**
 * Returns candidate verification submission endpoints ordered by environment priority
 */
export function getCandidateVerificationEndpoints(): string[] {
  const isWebLocal =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const isAndroid = Platform.OS === 'android';

  const endpoints: string[] = [`${CITIZEN_API_BASE_URL}/verify-citizen.php`];

  if (isAndroid) {
    endpoints.push('http://10.0.2.2/citizen-backend/api/citizen/verify-citizen.php');
  }

  if (isWebLocal) {
    endpoints.push('http://localhost/citizen-backend/api/citizen/verify-citizen.php');
    endpoints.push('http://127.0.0.1/citizen-backend/api/citizen/verify-citizen.php');
  }

  endpoints.push('http://192.168.1.5/citizen-backend/api/citizen/verify-citizen.php');

  // De-duplicate in case base URL matched any of the candidates
  return Array.from(new Set(endpoints));
}

/**
 * Returns candidate verification status endpoints
 */
export function getCandidateStatusEndpoints(queryParams: string): string[] {
  const isWebLocal =
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const isAndroid = Platform.OS === 'android';

  const endpoints: string[] = [
    `${CITIZEN_API_BASE_URL}/verification-status.php?${queryParams}`,
  ];

  if (isAndroid) {
    endpoints.push(`http://10.0.2.2/citizen-backend/api/citizen/verification-status.php?${queryParams}`);
  }

  if (isWebLocal) {
    endpoints.push(`http://localhost/citizen-backend/api/citizen/verification-status.php?${queryParams}`);
    endpoints.push(`http://127.0.0.1/citizen-backend/api/citizen/verification-status.php?${queryParams}`);
  }

  endpoints.push(`http://192.168.1.5/citizen-backend/api/citizen/verification-status.php?${queryParams}`);

  return Array.from(new Set(endpoints));
}

export class CitizenVerificationService {
  /**
   * Submit citizen identity verification payload to Citizen Admin backend
   */
  static async submitVerification(payload: CitizenVerificationPayload): Promise<CitizenVerificationResult> {
    const candidateEndpoints = getCandidateVerificationEndpoints();
    let lastErrorMessage = '';

    for (const endpoint of candidateEndpoints) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 15000);

        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timer);

        const data = await res.json().catch(() => null);

        if (res.ok && data && (data.status === 'success' || data.success === true)) {
          return {
            status: 'success',
            message: data.message || 'Application submitted successfully!',
            data,
          };
        } else if (
          res.status === 409 ||
          (data &&
            data.message &&
            (data.message.includes('already have an active application') ||
              data.message.includes('already verified')))
        ) {
          return {
            status: 'error',
            message: data?.message || 'You already have an active application under review.',
            isConflict: true,
            data,
          };
        } else if (data && data.message) {
          lastErrorMessage = data.message;
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn(`[CitizenVerificationService] Endpoint ${endpoint} unreachable:`, err?.message);
        }
      }
    }

    return {
      status: 'error',
      message:
        lastErrorMessage ||
        'Unable to connect to verification server. Please check your network connection and try again.',
    };
  }

  /**
   * Fetch verification status from Citizen Admin backend
   */
  static async getVerificationStatus(
    citizenUserId?: number,
    email?: string
  ): Promise<CitizenVerificationStatusResult> {
    try {
      if ((!citizenUserId || citizenUserId <= 0) && (!email || !email.trim())) {
        return {
          status: 'success',
          data: null,
          verification_status: 'Not_Submitted',
          is_verified: false,
          message: 'No active user session or verification inquiry.',
        };
      }

      const queryParams = new URLSearchParams();
      if (citizenUserId && citizenUserId > 0) {
        queryParams.append('citizen_user_id', citizenUserId.toString());
      }
      if (email && email.trim()) {
        queryParams.append('email', email.trim());
      }

      const endpoints = getCandidateStatusEndpoints(queryParams.toString());

      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.status === 'success') {
              return data;
            }
          }
        } catch {}
      }

      return {
        status: 'success',
        data: null,
        verification_status: 'Not_Submitted',
        is_verified: false,
        message: 'Unable to reach verification status service',
      };
    } catch (err: any) {
      return {
        status: 'success',
        data: null,
        verification_status: 'Not_Submitted',
        is_verified: false,
        message: err?.message,
      };
    }
  }
}
