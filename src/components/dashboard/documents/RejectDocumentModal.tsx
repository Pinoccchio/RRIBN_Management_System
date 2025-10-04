'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { DocumentWithReservist } from '@/lib/types/document';

interface RejectDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (documentId: string, rejectionReason: string, notes?: string) => Promise<void>;
  document: DocumentWithReservist | null;
}

export function RejectDocumentModal({
  isOpen,
  onClose,
  onReject,
  document,
}: RejectDocumentModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onReject(document.id, rejectionReason, notes || undefined);
      setRejectionReason('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error rejecting document:', error);
      setError('Failed to reject document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Reject Document"
      description="Provide a reason for rejecting this document"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Document Info */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-navy-900 mb-2">Document Details</h4>
          <div className="space-y-1 text-sm">
            <div>
              <span className="text-gray-600">Reservist:</span>{' '}
              <span className="font-medium">
                {document.reservist.first_name} {document.reservist.last_name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Document Type:</span>{' '}
              <span className="font-medium">{document.document_type}</span>
            </div>
            <div>
              <span className="text-gray-600">File:</span>{' '}
              <span className="font-medium">{document.file_name}</span>
            </div>
          </div>
        </div>

        {/* Rejection Reason (Required) */}
        <div>
          <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              setError(null);
            }}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Explain why this document is being rejected..."
          />
          <p className="mt-1 text-xs text-gray-500">
            This message will be sent to the reservist
          </p>
        </div>

        {/* Additional Notes (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Add any internal notes..."
          />
        </div>

        {/* Confirmation */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Confirm:</strong> Are you sure you want to reject this document? The reservist will be notified and may need to resubmit.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            {isLoading ? 'Rejecting...' : 'Reject Document'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
