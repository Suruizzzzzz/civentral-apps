/**
 * Production-Safe Error Messaging Utility (LOW-05)
 * Prevents disclosure of technical stack traces, database schema details, file system paths,
 * and internal keys/secrets to citizens in mobile app alerts and error banners.
 */

const TECHNICAL_PATTERNS: RegExp[] = [
  /SQLSTATE/i,
  /PDOException/i,
  /Fatal error/i,
  /Parse error/i,
  /Uncaught Exception/i,
  /Stack trace:/i,
  /[A-Za-z]:\\[\w.-]+\\/i,           // Windows file paths like C:\xampp\...
  /\/(?:xampp|var|etc|usr|home|app)\/[\w.-]+/i, // Unix / Xampp file paths
  /OPENAI_[\w_]*KEY/i,
  /JWT_SECRET/i,
  /DB_PASS/i,
  /DATABASE_URL/i,
  /at\s+[\w.<>$]+:\d+/i,             // JS / Node stack trace lines
  /\{"status":\s*"error"/i,           // Raw JSON strings leaked into error message
  /<(?:!DOCTYPE|html|head|body|div)/i // Raw HTML dumps
];

export const DEFAULT_ERROR_FALLBACK = 'An unexpected error occurred. Please try again later.';

/**
 * Checks if a string contains internal technical details, stack traces, or credentials.
 */
export function isTechnicalErrorMessage(message: unknown): boolean {
  if (message === null || message === undefined) {
    return false;
  }

  const str = String(message).trim();
  if (!str) {
    return false;
  }

  return TECHNICAL_PATTERNS.some((pattern) => pattern.test(str));
}

/**
 * Sanitizes an error message before displaying to the citizen.
 * Preserves user-facing validation errors (e.g. "Renewal is not in submittable status").
 * Replaces technical leaks with a friendly fallback message.
 */
export function sanitizeErrorMessage(rawMessage: unknown, fallback?: string): string {
  const defaultMsg = fallback && typeof fallback === 'string' && fallback.trim()
    ? fallback.trim()
    : DEFAULT_ERROR_FALLBACK;

  if (rawMessage === null || rawMessage === undefined) {
    return defaultMsg;
  }

  const str = String(rawMessage).trim();
  if (!str || isTechnicalErrorMessage(str)) {
    return defaultMsg;
  }

  return str;
}
