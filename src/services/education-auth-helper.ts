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
 * HTTP 403 is NOT treated as 401 (preserves session).
 */
export async function handleEducationResponse(res: Response): Promise<Response> {
  if (res.status === 401) {
    await AuthService.handleUnauthorizedAccess();
    throw new Error('Session expired or unauthorized. Please sign in again.');
  }
  return res;
}
