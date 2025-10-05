/**
 * Storage Utility Functions
 *
 * Handles Supabase Storage operations including signed URL generation
 * for secure, time-limited access to private storage buckets.
 */

import { createClient } from '@/lib/supabase/server';

/**
 * Generate a signed URL for a file in Supabase Storage
 *
 * Private storage buckets require authentication. Signed URLs provide
 * temporary access without exposing permanent URLs.
 *
 * @param fileUrl - The file URL from the database (format: https://xxx.supabase.co/storage/v1/object/public/bucket/path)
 * @param expiresIn - Validity duration in seconds (default: 3600 = 1 hour)
 * @returns Signed URL with authentication or null if error
 *
 * @example
 * const signedUrl = await getSignedStorageUrl(document.file_url, 3600);
 */
export async function getSignedStorageUrl(
  fileUrl: string,
  expiresIn: number = 3600 // Default 1 hour
): Promise<string | null> {
  try {
    const supabase = await createClient();

    // Extract bucket name and file path from URL
    // URL format: https://xxx.supabase.co/storage/v1/object/public/bucket-name/path/to/file
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split('/');

    // Find bucket name (after 'public' or 'sign' in path)
    const publicIndex = pathParts.indexOf('public');
    const signIndex = pathParts.indexOf('sign');
    const bucketStartIndex = Math.max(publicIndex, signIndex) + 1;

    if (bucketStartIndex <= 0 || bucketStartIndex >= pathParts.length) {
      console.error('Invalid storage URL format:', fileUrl);
      return null;
    }

    const bucketName = pathParts[bucketStartIndex];
    const filePath = pathParts.slice(bucketStartIndex + 1).join('/');

    if (!bucketName || !filePath) {
      console.error('Could not extract bucket/path from URL:', fileUrl);
      return null;
    }

    // Generate signed URL
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedStorageUrl:', error);
    return null;
  }
}

/**
 * Generate signed URLs for multiple files at once
 *
 * @param fileUrls - Array of file URLs from database
 * @param expiresIn - Validity duration in seconds (default: 3600 = 1 hour)
 * @returns Array of signed URLs (null for any that failed)
 */
export async function getBatchSignedStorageUrls(
  fileUrls: string[],
  expiresIn: number = 3600
): Promise<(string | null)[]> {
  return Promise.all(
    fileUrls.map(url => getSignedStorageUrl(url, expiresIn))
  );
}

/**
 * Replace file_url with signed URL in a document object
 *
 * @param document - Document object with file_url field
 * @param expiresIn - Validity duration in seconds (default: 3600 = 1 hour)
 * @returns Document with signed_url field added
 */
export async function addSignedUrlToDocument<T extends { file_url: string }>(
  document: T,
  expiresIn: number = 3600
): Promise<T & { signed_url: string | null }> {
  const signedUrl = await getSignedStorageUrl(document.file_url, expiresIn);

  return {
    ...document,
    signed_url: signedUrl,
  };
}

/**
 * Replace file_url with signed URLs in an array of documents
 *
 * @param documents - Array of document objects with file_url field
 * @param expiresIn - Validity duration in seconds (default: 3600 = 1 hour)
 * @returns Documents with signed_url field added
 */
export async function addSignedUrlsToDocuments<T extends { file_url: string }>(
  documents: T[],
  expiresIn: number = 3600
): Promise<(T & { signed_url: string | null })[]> {
  return Promise.all(
    documents.map(doc => addSignedUrlToDocument(doc, expiresIn))
  );
}
