'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Send, User, Hash, Shield, Building, AlertCircle } from 'lucide-react';
import type { RIDSFormComplete } from '@/lib/types/rids';

interface SubmitRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  rids: RIDSFormComplete | null;
  loading?: boolean;
}

export function SubmitRIDSModal({
  isOpen,
  onClose,
  onConfirm,
  rids,
  loading = false,
}: SubmitRIDSModalProps) {
  if (!rids) return null;

  const reservist = rids.reservist;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit RIDS for Approval"
      size="sm"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-blue-900">
                Submit RIDS for Review
              </p>
              <p className="text-sm text-blue-800 mt-1">
                This RIDS will be submitted for approval. Once submitted, you won't be able to edit it until it's approved or rejected.
              </p>
            </div>
          </div>
        </div>

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
          </div>
        </div>

        {/* Confirmation Message */}
        <p className="text-sm text-gray-700 text-center font-medium">
          Are you sure you want to submit this RIDS for approval?
        </p>
      </div>

      <ModalFooter className="mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit for Approval
        </Button>
      </ModalFooter>
    </Modal>
  );
}
