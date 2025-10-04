'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { DocumentWithReservist } from '@/lib/types/document';
import { FileText, User, Calendar, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DocumentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: DocumentWithReservist | null;
  onValidate?: (document: DocumentWithReservist) => void;
  onReject?: (document: DocumentWithReservist) => void;
}

export function DocumentPreviewModal({
  isOpen,
  onClose,
  document,
  onValidate,
  onReject,
}: DocumentPreviewModalProps) {
  if (!document) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'text-green-600 bg-green-50';
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const isPDF = document.mime_type === 'application/pdf';
  const isImage = document.mime_type?.startsWith('image/');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      title="Document Preview"
      description={`Viewing ${document.document_type}`}
    >
      <div className="space-y-6">
        {/* Document Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <User className="w-4 h-4 mr-2" />
              Reservist
            </div>
            <div className="font-semibold text-navy-900">
              {document.reservist.first_name} {document.reservist.middle_name ? `${document.reservist.middle_name} ` : ''}{document.reservist.last_name}
            </div>
            <div className="text-sm text-gray-600">
              {document.reservist.service_number} • {document.reservist.company || 'No Company'}
            </div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <FileText className="w-4 h-4 mr-2" />
              Document Details
            </div>
            <div className="font-semibold text-navy-900">{document.document_type}</div>
            <div className="text-sm text-gray-600">{document.file_name}</div>
          </div>

          <div>
            <div className="flex items-center text-sm text-gray-600 mb-1">
              <Calendar className="w-4 h-4 mr-2" />
              Submitted
            </div>
            <div className="text-sm font-medium text-navy-900">{formatDate(document.created_at)}</div>
          </div>

          <div>
            <div className="text-sm text-gray-600 mb-1">Status</div>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full font-medium ${getStatusColor(document.status)}`}>
              {getStatusIcon(document.status)}
              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
            </div>
          </div>
        </div>

        {/* Validation Info */}
        {document.validated_at && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-navy-900 mb-2">Validation Information</h4>
            <div className="space-y-2 text-sm">
              {document.validator && (
                <div>
                  <span className="text-gray-600">Validated by:</span>{' '}
                  <span className="font-medium">{document.validator.first_name} {document.validator.last_name}</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Date:</span>{' '}
                <span className="font-medium">{formatDate(document.validated_at)}</span>
              </div>
              {document.notes && (
                <div>
                  <span className="text-gray-600">Notes:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-blue-200">{document.notes}</div>
                </div>
              )}
              {document.rejection_reason && (
                <div>
                  <span className="text-gray-600">Rejection Reason:</span>
                  <div className="mt-1 p-2 bg-white rounded border border-red-200 text-red-800">{document.rejection_reason}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Document Preview */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
          <div className="p-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Document Preview</span>
            <a
              href={document.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline"
            >
              Open in new tab
            </a>
          </div>
          <div className="p-4 max-h-[500px] overflow-auto bg-white">
            {isImage && (
              <img
                src={document.file_url}
                alt={document.document_type}
                className="max-w-full h-auto mx-auto rounded"
              />
            )}
            {isPDF && (
              <iframe
                src={document.file_url}
                className="w-full h-[500px] border-0"
                title={document.document_type}
              />
            )}
            {!isImage && !isPDF && (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Preview not available for this file type.</p>
                <a
                  href={document.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  Download to view
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose}>
            Close
          </Button>
          {document.status === 'pending' && onValidate && onReject && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  onReject(document);
                  onClose();
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Reject
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={() => {
                  onValidate(document);
                  onClose();
                }}
              >
                Validate
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
