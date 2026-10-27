import { Alert } from 'react-native';
import { AuthService } from '@/src/services/auth-service';
import {
  ApiClient,
  ApiValidationError,
  isApiValidationError,
  unpackApiResponse,
  getAuthHeaders,
} from './api-client';

export { ApiClient, ApiValidationError, isApiValidationError, unpackApiResponse };

/**
 * Returns headers for PROTECTED Citizen Education API requests.
 * Attaches Authorization: Bearer <token> if available.
 * Does NOT attach X-Citizen-User-Id or X-User-Id.
 */
export async function getEducationAuthHeaders(
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  return getAuthHeaders(extraHeaders);
}

/**
 * Checks whether an API response envelope represents a successful outcome.
 * Supports both modernized BaseController envelopes ({ status: 'success' } / { status: 200 })
 * and legacy payloads ({ success: true } / { status_code: 200 }).
 */
export function isEducationSuccess(json: any): boolean {
  if (!json || typeof json !== 'object') return false;
  return (
    json.status === 'success' ||
    json.status === 200 ||
    json.success === true ||
    json.status_code === 200
  );
}

/**
 * Normalizes API response envelopes, safely extracting inner payload data.
 */
export function unpackEducationResponse<T = any>(json: any): T {
  return unpackApiResponse<T>(json);
}

/**
 * Handles HTTP responses for PROTECTED Education API requests.
 * - If res.status is 401, clears session and triggers single-flight unauthorized handler.
 * - If res.status is 429, alerts user with backend message/Retry-After and throws error.
 * - If res.status is 422, extracts field-level validation errors and throws ApiValidationError.
 * - HTTP 403 is NOT treated as 401 (preserves session).
 */
export async function handleEducationResponse(res: Response): Promise<Response> {
  if (res.status === 401) {
    await AuthService.handleUnauthorizedAccess();
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }

  if (res.status === 429) {
    const retryHeader = res.headers?.get ? res.headers.get('Retry-After') : null;
    let message = 'Too many requests. Please wait and try again.';
    try {
      const cloned = res.clone();
      const text = await cloned.text();
      if (text) {
        const json = JSON.parse(text);
        if (json?.message) {
          message = json.message;
        }
      }
    } catch {}

    if (message === 'Too many requests. Please wait and try again.' && retryHeader) {
      message = `Too many requests. Please wait ${retryHeader} seconds and try again.`;
    }

    Alert.alert('Too Many Requests', message);
    throw new Error(message);
  }

  if (res.status === 422) {
    let message = 'The submitted information is invalid or incomplete.';
    let errors: Record<string, string[]> = {};
    try {
      const cloned = res.clone();
      const text = await cloned.text();
      if (text) {
        const json = JSON.parse(text);
        if (json?.message) {
          message = json.message;
        }
        if (json?.errors && typeof json.errors === 'object') {
          errors = json.errors;
        }
      }
    } catch {}

    throw new ApiValidationError(message, errors, 422);
  }

  return res;
}
