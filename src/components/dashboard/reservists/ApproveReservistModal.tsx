'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Reservist } from '@/lib/types/reservist';
import { CheckCircle, User, Mail, Shield } from 'lucide-react';

interface ApproveReservistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (reservistId: string) => Promise<void>;
  reservist: Reservist | null;
}

export function ApproveReservistModal({
  isOpen,
  onClose,
  onApprove,
  reservist,
}: ApproveReservistModalProps) {
  const [isApproving, setIsApproving] = useState(false);

  if (!reservist) return null;

  const handleApprove = async () => {
    try {
      setIsApproving(true);
      await onApprove(reservist.id);
      onClose();
    } catch (error) {
      console.error('Error approving reservist:', error);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Approve Reservist Account"
      description="Confirm approval of this reservist account"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Approve Account
              </h4>
              <p className="text-sm text-green-700">
                This action will activate the reservist account and grant access to the mobile application. The reservist will receive a notification.
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

        {/* Confirmation Text */}
        <div className="text-sm text-gray-700">
          <p>
            Are you sure you want to approve this reservist account? Once approved, the reservist will be able to:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
            <li>Sign in to the mobile application</li>
            <li>Access their profile and service records</li>
            <li>Register for training sessions</li>
            <li>Receive announcements and notifications</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button
          variant="secondary"
          onClick={onClose}
          disabled={isApproving}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleApprove}
          disabled={isApproving}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isApproving ? 'Approving...' : 'Approve Account'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
