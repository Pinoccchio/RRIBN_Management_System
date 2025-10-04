'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, UserX, UserCheck } from 'lucide-react';
import type { Reservist } from '@/lib/types/reservist';

interface ChangeAccountStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeStatus: (reservistId: string, newStatus: 'active' | 'inactive', reason: string) => Promise<void>;
  reservist: Reservist | null;
}

export function ChangeAccountStatusModal({
  isOpen,
  onClose,
  onChangeStatus,
  reservist,
}: ChangeAccountStatusModalProps) {
  const [targetStatus, setTargetStatus] = useState<'active' | 'inactive'>('active');
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize target status based on current status
  useEffect(() => {
    if (reservist) {
      // Toggle to opposite status
      setTargetStatus(reservist.status === 'active' ? 'inactive' : 'active');
    }
  }, [reservist]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reservist) return;

    if (!reason.trim()) {
      setError('Please provide a reason for the status change');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onChangeStatus(reservist.id, targetStatus, reason.trim());
      handleClose();
    } catch (error) {
      console.error('Error changing account status:', error);
      setError('Failed to change account status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError(null);
    onClose();
  };

  if (!reservist) return null;

  const isActivating = targetStatus === 'active';
  const currentStatusLabel = reservist.status.charAt(0).toUpperCase() + reservist.status.slice(1);
  const targetStatusLabel = targetStatus.charAt(0).toUpperCase() + targetStatus.slice(1);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      title="Change Account Status"
      description="Modify reservist account access"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Warning Banner */}
        <div className={`flex items-start gap-3 p-4 border-2 rounded-lg ${
          isActivating
            ? 'bg-green-50 border-green-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          {isActivating ? (
            <UserCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          ) : (
            <UserX className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <h3 className={`text-sm font-semibold mb-1 ${
              isActivating ? 'text-green-900' : 'text-orange-900'
            }`}>
              {isActivating ? 'Reactivate Account' : 'Deactivate Account'}
            </h3>
            <p className={`text-sm ${
              isActivating ? 'text-green-800' : 'text-orange-800'
            }`}>
              {isActivating
                ? 'This will restore system access for the reservist. They will be able to log in and use the application.'
                : 'This will temporarily disable system access. The reservist will not be able to log in until reactivated.'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Reservist Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Reservist Information</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-600 mb-1">Name</p>
              <p className="text-sm font-medium text-gray-900">
                {reservist.profile.first_name} {reservist.profile.last_name}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Service Number</p>
              <p className="text-sm font-medium text-gray-900">
                {reservist.reservist_details.service_number}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Company</p>
              <p className="text-sm font-medium text-gray-900">
                {reservist.reservist_details.company || 'Not assigned'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Rank</p>
              <p className="text-sm font-medium text-gray-900">
                {reservist.reservist_details.rank || 'Not assigned'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Change Details */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-blue-700 mb-1">Current Account Status</p>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                reservist.status === 'active'
                  ? 'bg-green-100 text-green-700'
                  : reservist.status === 'inactive'
                  ? 'bg-gray-100 text-gray-700'
                  : reservist.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {currentStatusLabel}
              </span>
            </div>
            <div className="px-4">
              <span className="text-2xl text-blue-600">→</span>
            </div>
            <div className="flex-1 text-right">
              <p className="text-xs text-blue-700 mb-1">New Account Status</p>
              <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                targetStatus === 'active'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {targetStatusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Reason Input */}
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
            rows={3}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder={
              isActivating
                ? 'e.g., Completed required training, ready for active duty'
                : 'e.g., Extended leave of absence, medical reasons'
            }
          />
          <p className="mt-1 text-xs text-gray-500">
            This will be logged in the account history for audit purposes.
          </p>
        </div>

        {/* Important Notice */}
        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-yellow-800">
            <strong>Note:</strong> This change affects account access only. The reservist's operational status
            ({reservist.reservist_details.reservist_status}) will remain unchanged. To modify operational status,
            use the Edit Reservist function.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={isActivating ? 'primary' : 'danger'}
            disabled={isLoading || !reason.trim()}
          >
            {isLoading
              ? 'Updating...'
              : isActivating
              ? 'Activate Account'
              : 'Deactivate Account'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
