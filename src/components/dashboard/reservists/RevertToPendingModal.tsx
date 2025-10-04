'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Reservist } from '@/lib/types/reservist';
import { RotateCcw, User, Mail, Shield, AlertTriangle } from 'lucide-react';

interface RevertToPendingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRevert: (reservistId: string, reason: string) => Promise<void>;
  reservist: Reservist | null;
}

export function RevertToPendingModal({
  isOpen,
  onClose,
  onRevert,
  reservist,
}: RevertToPendingModalProps) {
  const [isReverting, setIsReverting] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!reservist) return null;

  const handleRevert = async () => {
    try {
      setIsReverting(true);
      setError('');
      // Reason is optional - pass whatever was entered (even if empty)
      await onRevert(reservist.id, reason.trim() || '');
      onClose();
      setReason('');
    } catch (error) {
      console.error('Error reverting reservist to pending:', error);
      setError('Failed to revert account. Please try again.');
    } finally {
      setIsReverting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Revert to Pending Status"
      description="Change active account back to pending for re-evaluation"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Revert Account Status
              </h4>
              <p className="text-sm text-yellow-700">
                This action will change the account status from <strong>active</strong> to <strong>pending</strong>.
                The reservist will lose access to the mobile application until re-approved and will receive a notification.
              </p>
            </div>
          </div>
        </div>

        {/* Reservist Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-navy-900 mb-3">Reservist Details</h4>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Full Name</p>
              <p className="text-sm font-medium text-navy-900">
                {reservist.profile.first_name} {reservist.profile.middle_name ? `${reservist.profile.middle_name} ` : ''}{reservist.profile.last_name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Email Address</p>
              <p className="text-sm font-medium text-navy-900">{reservist.email}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
            <div>
              <p className="text-xs text-gray-600 mb-1">Service Number</p>
              <p className="text-sm font-medium text-navy-900">
                {reservist.reservist_details.service_number}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Rank</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.reservist_details.rank || 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-1">Company</p>
                <p className="text-sm font-medium text-navy-900">
                  {reservist.reservist_details.company || 'Not Assigned'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Reason Input */}
        <div className="space-y-2">
          <label htmlFor="revert-reason" className="block text-sm font-semibold text-navy-900">
            Reason for Reverting <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            id="revert-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Optional: Enter the reason for reverting this account to pending (e.g., needs document re-verification, incorrect information provided, etc.)"
            rows={4}
            className={`
              w-full px-4 py-3 rounded-lg border-2 transition-all duration-300
              border-gray-300 focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/30 hover:border-gray-400
              focus:outline-none focus:shadow-yellow-glow
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60
              placeholder:text-gray-400
              bg-white text-navy-900 font-medium
              resize-vertical min-h-[100px]
            `}
          />
          <p className="text-xs text-gray-600">
            If no reason is provided, a generic notification will be sent to the reservist.
          </p>
          {error && (
            <p className="text-sm text-error">{error}</p>
          )}
        </div>

        {/* Confirmation Text */}
        <div className="text-sm text-gray-700">
          <p className="mb-2">
            After reverting to pending, the reservist will:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Lose access to the mobile application immediately</li>
            <li>Require re-approval from an administrator</li>
            <li>Receive a notification about the status change</li>
            <li>See the provided reason in their account</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isReverting}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleRevert}
          disabled={isReverting}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {isReverting ? 'Reverting...' : 'Revert to Pending'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
