import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system/legacy';

export interface CompressibleFile {
  uri: string;
  name: string;
  type?: string;
  mimeType?: string;
  size?: number;
}

export interface CompressedFileResult {
  uri: string;
  name: string;
  type: string;
  mimeType: string;
  size?: number;
  wasCompressed?: boolean;
}

export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const IMAGE_COMPRESSION_THRESHOLD_BYTES = 1.5 * 1024 * 1024; // 1.5 MB
export const IMAGE_MAX_WIDTH = 1600;
export const IMAGE_COMPRESSION_QUALITY = 0.75;

/**
 * Checks whether a given file object is an image by MIME type or file extension.
 */
export function isImageFile(file: { name?: string; type?: string; mimeType?: string }): boolean {
  const mime = (file.type || file.mimeType || '').toLowerCase();
  if (mime.startsWith('image/')) {
    return true;
  }

  const name = (file.name || '').toLowerCase();
  return (
    name.endsWith('.jpg') ||
    name.endsWith('.jpeg') ||
    name.endsWith('.png') ||
    name.endsWith('.webp') ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
}

/**
 * Automatically resizes and compresses image files exceeding 1.5MB (or undefined size)
 * using expo-image-manipulator. Non-image files (such as PDFs) are returned unchanged.
 *
 * - Max dimension: 1600px width (aspect-ratio preserved)
 * - Compression quality: 0.75
 * - Output format: JPEG
 */
export async function compressImageIfNeeded<T extends CompressibleFile>(
  file: T
): Promise<T & { wasCompressed?: boolean }> {
  if (!file || !file.uri) {
    return file;
  }

  // If the file is NOT an image (e.g. PDF, video), return unchanged
  if (!isImageFile(file)) {
    return file;
  }

  // If size is already known and within threshold (<= 1.5 MB), skip compression
  if (typeof file.size === 'number' && file.size > 0 && file.size <= IMAGE_COMPRESSION_THRESHOLD_BYTES) {
    return file;
  }

  try {
    const manipulated = await ImageManipulator.manipulateAsync(
      file.uri,
      [{ resize: { width: IMAGE_MAX_WIDTH } }],
      {
        compress: IMAGE_COMPRESSION_QUALITY,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    let updatedSize = file.size;
    try {
      const fileInfo = await FileSystem.getInfoAsync(manipulated.uri);
      if (fileInfo.exists && typeof (fileInfo as any).size === 'number') {
        updatedSize = (fileInfo as any).size;
      }
    } catch {
      // Fallback if file info cannot be queried
    }

    // Ensure output filename has .jpg extension
    let updatedName = file.name || `upload_${Date.now()}.jpg`;
    if (!updatedName.toLowerCase().endsWith('.jpg') && !updatedName.toLowerCase().endsWith('.jpeg')) {
      updatedName = updatedName.replace(/\.[^/.]+$/, '') + '.jpg';
    }

    return {
      ...file,
      uri: manipulated.uri,
      name: updatedName,
      type: 'image/jpeg',
      mimeType: 'image/jpeg',
      size: updatedSize,
      wasCompressed: true,
    };
  } catch (err) {
    console.warn('[compressImageIfNeeded] Image compression failed, falling back to original:', err);
    return file;
  }
}
