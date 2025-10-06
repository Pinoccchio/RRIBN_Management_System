'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { User, Hash, Shield, Building } from 'lucide-react';
import type { RIDSFormComplete } from '@/lib/types/rids';

type RIDSStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface ChangeRIDSStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (ridsId: string, newStatus: RIDSStatus, reason: string, notes?: string) => Promise<void>;
  rids: RIDSFormComplete | null;
}

export function ChangeRIDSStatusModal({
  isOpen,
  onClose,
  onChangeStatus,
  rids,
}: ChangeRIDSStatusModalProps) {
  const [newStatus, setNewStatus] = useState<RIDSStatus | ''>('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rids) return;

    if (!newStatus) {
      setError('Please select a new status');
      return;
    }

    if (!reason.trim()) {
      setError('Reason is required');
      return;
    }

    if (newStatus === rids.status) {
      setError(`RIDS is already ${newStatus}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onChangeStatus(rids.id, newStatus, reason, notes || undefined);
      setNewStatus('');
      setReason('');
      setNotes('');
      onClose();
    } catch (error) {
      console.error('Error changing RIDS status:', error);
      setError('Failed to change RIDS status. Please try again.');
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

  if (!rids) return null;

  const reservist = rids.reservist;

  const statusOptions: { value: RIDSStatus; label: string; color: string }[] = [
    { value: 'draft', label: 'Draft', color: 'text-gray-700' },
    { value: 'submitted', label: 'Submitted', color: 'text-blue-700' },
    { value: 'approved', label: 'Approved', color: 'text-green-700' },
    { value: 'rejected', label: 'Rejected', color: 'text-red-700' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Change RIDS Status"
      showCloseButton={!isLoading}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* RIDS Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            RIDS Details
          </p>

          <div className="space-y-3">
            {/* Reservist Name */}
            {reservist && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Reservist</p>
                  <p className="text-sm font-bold text-navy-900">
                    {reservist.first_name} {reservist.middle_name ? `${reservist.middle_name.charAt(0)}. ` : ''}{reservist.last_name}
                  </p>
                </div>
              </div>
            )}

            {/* Service Number */}
            {reservist?.service_number && (
              <div className="flex items-start gap-3">
                <Hash className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Service Number</p>
                  <p className="text-sm font-medium text-gray-900">{reservist.service_number}</p>
                </div>
              </div>
            )}

            {/* Rank */}
            {reservist?.rank && (
              <div className="flex items-start gap-3">
                <Shield className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Rank</p>
                  <p className="text-sm font-medium text-gray-900">{reservist.rank}</p>
                </div>
              </div>
            )}

            {/* Company */}
            {reservist?.company && (
              <div className="flex items-start gap-3">
                <Building className="w-4 h-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Company</p>
                  <p className="text-sm font-medium text-gray-900">{reservist.company}</p>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-500">Current Status</p>
              <p className="text-sm font-bold text-navy-900 capitalize">{rids.status}</p>
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
              setNewStatus(e.target.value as RIDSStatus);
              setError(null);
            }}
            required
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
          >
            <option value="">Select new status...</option>
            {statusOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.value === rids.status}
              >
                {option.label}
                {option.value === rids.status ? ' (Current)' : ''}
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
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            placeholder="Explain why the status is being changed..."
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be included in the audit log
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
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-navy-500 focus:border-transparent"
            placeholder="Add any internal notes..."
          />
        </div>

        {/* Confirmation Warning */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Confirm:</strong> Are you sure you want to change this RIDS status? This action will be logged in the audit trail.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading} loading={isLoading}>
            {isLoading ? 'Updating...' : 'Change Status'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
