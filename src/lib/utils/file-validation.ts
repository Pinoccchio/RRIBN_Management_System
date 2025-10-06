/**
 * File Validation Utilities for RIDS Biometrics
 *
 * Provides client-side validation for uploaded biometric files
 * (passport photos, thumbmarks, signatures)
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Maximum file sizes for each biometric type
 */
export const MAX_FILE_SIZES = {
  photo: 5 * 1024 * 1024, // 5MB
  thumbmark: 2 * 1024 * 1024, // 2MB
  signature: 1 * 1024 * 1024, // 1MB
} as const;

/**
 * Allowed MIME types for each biometric type
 */
export const ALLOWED_MIME_TYPES = {
  photo: ['image/jpeg', 'image/jpg', 'image/png'],
  thumbmark: ['image/jpeg', 'image/jpg', 'image/png'],
  signature: ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'],
} as const;

/**
 * Validate a biometric file before upload
 *
 * @param file - The file to validate
 * @param type - The biometric type (photo, thumbmark, signature)
 * @returns Validation result with success status and error message
 */
export function validateBiometricFile(
  file: File,
  type: 'photo' | 'thumbmark' | 'signature'
): FileValidationResult {
  // Check file size
  const maxSize = MAX_FILE_SIZES[type];
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check if file is empty
  if (file.size === 0) {
    return {
      valid: false,
      error: 'File is empty',
    };
  }

  // Check MIME type
  const allowedTypes = ALLOWED_MIME_TYPES[type];
  if (!allowedTypes.includes(file.type as any)) {
    const allowedTypesStr = allowedTypes
      .map(t => t.split('/')[1].toUpperCase())
      .join(', ');
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${allowedTypesStr}`,
    };
  }

  // Check if file is actually an image
  if (!file.type.startsWith('image/')) {
    return {
      valid: false,
      error: 'File must be an image',
    };
  }

  // Additional validation for file extension
  const fileName = file.name.toLowerCase();
  const validExtensions = type === 'signature'
    ? ['.jpg', '.jpeg', '.png', '.svg']
    : ['.jpg', '.jpeg', '.png'];

  const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    const extsStr = validExtensions.join(', ');
    return {
      valid: false,
      error: `Invalid file extension. Allowed: ${extsStr}`,
    };
  }

  return { valid: true };
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 *
 * @param filename - The filename
 * @returns File extension (e.g., "jpg")
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if a file type is an image
 *
 * @param mimeType - The MIME type to check
 * @returns True if the MIME type is an image type
 */
export function isImageType(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}
