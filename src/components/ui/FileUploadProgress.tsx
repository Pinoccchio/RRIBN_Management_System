'use client';

import React from 'react';
import { Upload, CheckCircle, XCircle, Loader2 } from 'lucide-react';

interface FileUploadProgressProps {
  uploading: boolean;
  uploadError?: string;
  fileName?: string;
  success?: boolean;
}

/**
 * File Upload Progress Indicator Component
 *
 * Displays upload status, errors, and success states for file uploads
 */
export function FileUploadProgress({
  uploading,
  uploadError,
  fileName,
  success = false,
}: FileUploadProgressProps) {
  // Show loading state during upload
  if (uploading) {
    return (
      <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg animate-pulse">
        <Loader2 className="w-5 h-5 text-blue-600 animate-spin flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-blue-900">Uploading...</p>
          {fileName && (
            <p className="text-xs text-blue-700 truncate" title={fileName}>
              {fileName}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Show error state if upload failed
  if (uploadError) {
    return (
      <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">Upload Failed</p>
          <p className="text-xs text-red-700">{uploadError}</p>
        </div>
      </div>
    );
  }

  // Show success state after successful upload
  if (success) {
    return (
      <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-900">Upload Successful</p>
          {fileName && (
            <p className="text-xs text-green-700 truncate" title={fileName}>
              {fileName}
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
