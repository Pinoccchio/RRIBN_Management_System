'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { DocumentWithReservist } from '@/lib/types/document';

interface ValidateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onValidate: (documentId: string, notes?: string) => Promise<void>;
  document: DocumentWithReservist | null;
}

export function ValidateDocumentModal({
  isOpen,
  onClose,
  onValidate,
  document,
}: ValidateDocumentModalProps) {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setIsLoading(true);
    try {
      await onValidate(document.id, notes || undefined);
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error validating document:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Validate Document"
      description="Approve this document submission"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Document Info */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
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

        {/* Notes (Optional) */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Add any notes about the validation..."
          />
        </div>

        {/* Confirmation */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Confirm:</strong> Are you sure you want to validate and approve this document? The reservist will be notified of the approval.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Validating...' : 'Validate & Approve'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
