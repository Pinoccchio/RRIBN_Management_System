'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { Reservist } from '@/lib/types/reservist';
import { XCircle, User, Mail, Shield, AlertTriangle } from 'lucide-react';

interface RejectReservistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reservistId: string, reason: string) => Promise<void>;
  reservist: Reservist | null;
}

export function RejectReservistModal({
  isOpen,
  onClose,
  onReject,
  reservist,
}: RejectReservistModalProps) {
  const [isRejecting, setIsRejecting] = useState(false);
  const [reason, setReason] = useState('');

  if (!reservist) return null;

  const handleReject = async () => {
    try {
      setIsRejecting(true);
      await onReject(reservist.id, reason || 'Account rejected by administrator');
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error rejecting reservist:', error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject Reservist Account"
      description="Provide a reason for rejecting this account"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-900 mb-1">
                Reject Account
              </h4>
              <p className="text-sm text-red-700">
                This action will deactivate the reservist account and deny access to the system. The reservist will receive a notification with the rejection reason.
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
        </div>

        {/* Rejection Reason Input */}
        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-medium text-navy-900 mb-2">
            Rejection Reason <span className="text-gray-500 font-normal">(Optional)</span>
          </label>
          <textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for rejection (e.g., Invalid documents, Incorrect information, Duplicate account...)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            rows={4}
            disabled={isRejecting}
          />
          <p className="text-xs text-gray-500 mt-2">
            This reason will be included in the notification sent to the reservist.
          </p>
        </div>

        {/* Confirmation Text */}
        <div className="text-sm text-gray-700">
          <p>
            Are you sure you want to reject this reservist account? This action will:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Change the account status to "Deactivated"</li>
            <li>Prevent the reservist from signing in</li>
            <li>Send a rejection notification to the reservist</li>
            <li>Create an audit log entry</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={handleClose}
          disabled={isRejecting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleReject}
          disabled={isRejecting}
        >
          {isRejecting ? 'Rejecting...' : 'Reject Account'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
