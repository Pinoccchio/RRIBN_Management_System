'use client';

import { useState } from 'react';
import { Upload, X, Check, AlertCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { logger } from '@/lib/logger';

interface BiometricFile {
  file: File | null;
  preview: string | null;
  url: string | null;
  uploading: boolean;
  uploaded: boolean;
}

interface BiometricUploadProps {
  ridsId: string;
  onUploadComplete?: (fileType: string, url: string) => void;
  initialPhotos?: {
    photo_url?: string | null;
    thumbmark_url?: string | null;
    signature_url?: string | null;
  };
}

export function BiometricUpload({ ridsId, onUploadComplete, initialPhotos }: BiometricUploadProps) {
  const [photo, setPhoto] = useState<BiometricFile>({
    file: null,
    preview: initialPhotos?.photo_url || null,
    url: initialPhotos?.photo_url || null,
    uploading: false,
    uploaded: !!initialPhotos?.photo_url,
  });

  const [thumbmark, setThumbmark] = useState<BiometricFile>({
    file: null,
    preview: initialPhotos?.thumbmark_url || null,
    url: initialPhotos?.thumbmark_url || null,
    uploading: false,
    uploaded: !!initialPhotos?.thumbmark_url,
  });

  const [signature, setSignature] = useState<BiometricFile>({
    file: null,
    preview: initialPhotos?.signature_url || null,
    url: initialPhotos?.signature_url || null,
    uploading: false,
    uploaded: !!initialPhotos?.signature_url,
  });

  const handleFileSelect = async (
    fileType: 'photo' | 'thumbmark' | 'signature',
    file: File | null
  ) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Invalid file type. Only JPEG, PNG, and SVG images are allowed.');
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size exceeds 5MB limit.');
      return;
    }

    // Get the setter function
    let setCurrentFile: (file: BiometricFile) => void;
    switch (fileType) {
      case 'photo':
        setCurrentFile = setPhoto;
        break;
      case 'thumbmark':
        setCurrentFile = setThumbmark;
        break;
      case 'signature':
        setCurrentFile = setSignature;
        break;
    }

    // Create preview and start upload
    const reader = new FileReader();
    reader.onloadend = async () => {
      const preview = reader.result as string;

      // Set preview with uploading state
      setCurrentFile({
        file,
        preview,
        url: null,
        uploading: true,
        uploaded: false,
      });

      // Immediately upload
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('file_type', fileType);

        const response = await fetch(`/api/staff/rids/${ridsId}/upload-biometric`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Upload failed');
        }

        const data = await response.json();

        if (data.success) {
          setCurrentFile({
            file,
            preview,
            url: data.data.url,
            uploading: false,
            uploaded: true,
          });

          if (onUploadComplete) {
            onUploadComplete(fileType, data.data.url);
          }

          logger.success(`${fileType} uploaded successfully`);
        }
      } catch (error) {
        logger.error(`Failed to upload ${fileType}`, error);
        alert(`Failed to upload ${fileType}. Please try again.`);

        // Reset to no preview on error
        setCurrentFile({
          file: null,
          preview: null,
          url: null,
          uploading: false,
          uploaded: false,
        });
      }
    };
    reader.readAsDataURL(file);
  };


  const handleDelete = async (fileType: 'photo' | 'thumbmark' | 'signature') => {
    if (!confirm(`Are you sure you want to delete this ${fileType}?`)) return;

    let currentFile: BiometricFile;
    let setCurrentFile: (file: BiometricFile) => void;

    switch (fileType) {
      case 'photo':
        currentFile = photo;
        setCurrentFile = setPhoto;
        break;
      case 'thumbmark':
        currentFile = thumbmark;
        setCurrentFile = setThumbmark;
        break;
      case 'signature':
        currentFile = signature;
        setCurrentFile = setSignature;
        break;
    }

    try {
      const response = await fetch(
        `/api/staff/rids/${ridsId}/upload-biometric?file_type=${fileType}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        setCurrentFile({
          file: null,
          preview: null,
          url: null,
          uploading: false,
          uploaded: false,
        });
        logger.success(`${fileType} deleted successfully`);
      }
    } catch (error) {
      logger.error(`Failed to delete ${fileType}`, error);
      alert(`Failed to delete ${fileType}`);
    }
  };

  const FileUploadZone = ({
    label,
    description,
    fileType,
    biometricFile,
  }: {
    label: string;
    description: string;
    fileType: 'photo' | 'thumbmark' | 'signature';
    biometricFile: BiometricFile;
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-navy-400 transition-colors">
      <div className="flex flex-col items-center">
        <ImageIcon className="w-12 h-12 text-gray-400 mb-3" />
        <h4 className="font-semibold text-gray-900 mb-1">{label}</h4>
        <p className="text-sm text-gray-500 mb-4 text-center">{description}</p>

        {!biometricFile.preview ? (
          <div className="w-full">
            <label className="block w-full">
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                onChange={(e) => handleFileSelect(fileType, e.target.files?.[0] || null)}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2 px-4 py-2 bg-navy-600 text-white rounded-lg cursor-pointer hover:bg-navy-700 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">Choose File</span>
              </div>
            </label>
          </div>
        ) : (
          <div className="w-full space-y-3">
            {/* Preview */}
            <div className="relative">
              <img
                src={biometricFile.preview}
                alt={label}
                className="w-full h-48 object-cover rounded-lg border border-gray-200"
              />
              {biometricFile.uploaded && (
                <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {biometricFile.uploading ? (
                <div className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-navy-50 text-navy-600 rounded-lg">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm font-medium">Uploading...</span>
                </div>
              ) : biometricFile.uploaded ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(fileType)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm text-blue-800">
            Select a file to automatically upload biometric data. Maximum file size: 5MB. Supported formats: JPEG, PNG, SVG.
          </p>
        </div>
      </div>

      {/* Upload Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FileUploadZone
          label="2x2 Photo"
          description="Recent passport-style photo"
          fileType="photo"
          biometricFile={photo}
        />
        <FileUploadZone
          label="Right Thumbmark"
          description="Clear thumbprint image"
          fileType="thumbmark"
          biometricFile={thumbmark}
        />
        <FileUploadZone
          label="Signature"
          description="Digital signature image"
          fileType="signature"
          biometricFile={signature}
        />
      </div>

      {/* Upload Status */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Upload Status</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Photo (2x2)</span>
            <span className={photo.uploaded ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {photo.uploaded ? '✓ Uploaded' : 'Not uploaded'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Thumbmark</span>
            <span className={thumbmark.uploaded ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {thumbmark.uploaded ? '✓ Uploaded' : 'Not uploaded'}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Signature</span>
            <span className={signature.uploaded ? 'text-green-600 font-medium' : 'text-gray-400'}>
              {signature.uploaded ? '✓ Uploaded' : 'Not uploaded'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
