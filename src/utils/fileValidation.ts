/**
 * Shared File Size Validation Utility
 *
 * Enforces client-side file size boundaries across Citizen Mobile App document uploads.
 * Standard documents: 10 MB maximum limit (10 * 1024 * 1024 bytes).
 * Video declaration documents: 20 MB maximum limit (20 * 1024 * 1024 bytes).
 */

export const DEFAULT_MAX_DOC_SIZE_MB = 10;
export const MAX_VIDEO_SIZE_MB = 20;

export interface FileSizeValidationResult {
  valid: boolean;
  maxLimitMb: number;
  actualSizeBytes?: number;
  errorMessage?: string;
}

/**
 * Validates whether a picked file asset exceeds the configured maximum size in megabytes.
 *
 * @param file Object with an optional size (in bytes) and name
 * @param maxLimitMb Maximum allowed size in megabytes (defaults to 10 MB)
 * @param documentLabel Optional label for the document to include in user-facing message
 * @returns FileSizeValidationResult indicating validity and appropriate alert error message
 */
export function validateFileSize(
  file?: { size?: number; name?: string } | null,
  maxLimitMb: number = DEFAULT_MAX_DOC_SIZE_MB,
  documentLabel?: string
): FileSizeValidationResult {
  const maxSizeBytes = maxLimitMb * 1024 * 1024;
  const actualSize = file?.size;

  if (typeof actualSize === 'number' && actualSize > maxSizeBytes) {
    const label = documentLabel ? ` ${documentLabel}` : '';
    return {
      valid: false,
      maxLimitMb,
      actualSizeBytes: actualSize,
      errorMessage: `The selected${label} file exceeds the maximum limit of ${maxLimitMb}MB. Please choose a smaller file.`,
    };
  }

  return {
    valid: true,
    maxLimitMb,
    actualSizeBytes: actualSize,
  };
}
