import { Alert } from 'react-native';
import { AuthService } from '@/src/services/auth-service';

/**
 * Returns headers for PROTECTED Citizen Education API requests.
 * Attaches Authorization: Bearer <token> if available.
 * Does NOT attach X-Citizen-User-Id or X-User-Id.
 */
export async function getEducationAuthHeaders(
  extraHeaders: Record<string, string> = {}
): Promise<Record<string, string>> {
  const token = AuthService.getAuthToken();
  const headers: Record<string, string> = {
    ...extraHeaders,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handles HTTP responses for PROTECTED Education API requests.
 * If res.status is 401, clears session and triggers single-flight unauthorized handler.
 * If res.status is 429, alerts user with backend message/Retry-After and throws error.
 * HTTP 403 is NOT treated as 401 (preserves session).
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

  return res;
}
