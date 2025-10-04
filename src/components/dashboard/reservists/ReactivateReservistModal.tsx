'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { Reservist } from '@/lib/types/reservist';
import { RefreshCw, User, Mail, Shield, AlertCircle } from 'lucide-react';

interface ReactivateReservistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReactivate: (reservistId: string) => Promise<void>;
  reservist: Reservist | null;
}

export function ReactivateReservistModal({
  isOpen,
  onClose,
  onReactivate,
  reservist,
}: ReactivateReservistModalProps) {
  const [isReactivating, setIsReactivating] = useState(false);

  if (!reservist) return null;

  const handleReactivate = async () => {
    try {
      setIsReactivating(true);
      await onReactivate(reservist.id);
      onClose();
    } catch (error) {
      console.error('Error reactivating reservist:', error);
    } finally {
      setIsReactivating(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reactivate Reservist Account"
      description="Restore access to a deactivated reservist account"
      size="md"
    >
      <div className="space-y-6">
        {/* Info Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <RefreshCw className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">
                Reactivate Account
              </h4>
              <p className="text-sm text-green-700">
                This action will reactivate the account and restore full access to the mobile application.
                The reservist will receive a notification and can sign in immediately.
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

        {/* Previous Rejection Reason (if exists) */}
        {reservist.rejection_reason && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 mb-1">
                  Previous Deactivation Reason
                </h4>
                <p className="text-sm text-red-700">
                  {reservist.rejection_reason}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Text */}
        <div className="text-sm text-gray-700">
          <p className="mb-2">
            After reactivation, the reservist will be able to:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-600">
            <li>Sign in to the mobile application immediately</li>
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
          disabled={isReactivating}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleReactivate}
          disabled={isReactivating}
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          {isReactivating ? 'Reactivating...' : 'Reactivate Account'}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
