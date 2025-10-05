'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { DocumentWithReservist, DocumentStatus } from '@/lib/types/document';

interface ChangeDocumentStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (documentId: string, newStatus: DocumentStatus, reason: string, notes?: string) => Promise<void>;
  document: DocumentWithReservist | null;
}

export function ChangeDocumentStatusModal({
  isOpen,
  onClose,
  onChangeStatus,
  document,
}: ChangeDocumentStatusModalProps) {
  const [newStatus, setNewStatus] = useState<DocumentStatus | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    if (!newStatus) {
      setError('Please select a new status');
      return;
    }

    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    if (newStatus === document.status) {
      setError(`Document is already ${newStatus}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onChangeStatus(document.id, newStatus, reason, notes || undefined);
      setNewStatus('');
      setReason('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error changing document status:', error);
      setError('Failed to change document status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setNewStatus('');
    setReason('');
    setNotes('');
    setError(null);
    onClose();
  };

  if (!document) return null;

  const statusOptions: { value: DocumentStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Pending', color: 'text-yellow-700' },
    { value: 'verified', label: 'Verified', color: 'text-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-700' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Change Document Status"
      description="Update the document status with a reason"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Document Info */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
              <span className="text-gray-600">Current Status:</span>{' '}
              <span className="font-semibold capitalize">{document.status}</span>
            </div>
          </div>
        </div>

        {/* New Status Selection */}
        <div>
          <label htmlFor="newStatus" className="block text-sm font-medium text-gray-700 mb-2">
            New Status <span className="text-red-500">*</span>
          </label>
          <select
            id="newStatus"
            value={newStatus}
            onChange={(e) => {
              setNewStatus(e.target.value as DocumentStatus);
              setError(null);
            }}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          >
            <option value="">Select new status...</option>
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.value === document.status}
              >
                {option.label}
                {option.value === document.status ? ' (Current)' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Reason (Required) */}
        <div>
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Status Change <span className="text-red-500">*</span>
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setError(null);
            }}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Explain why the status is being changed..."
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be included in the notification to the reservist
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

        {/* Confirmation Warning */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Confirm:</strong> Are you sure you want to change this document's status? The reservist will be notified of this change.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? 'Updating...' : 'Change Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
