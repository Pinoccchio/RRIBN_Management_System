'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, User, Hash, Shield, Building } from 'lucide-react';
import type { RIDSFormComplete } from '@/lib/types/rids';

interface DeleteRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  rids: RIDSFormComplete | null;
  loading?: boolean;
}

export function DeleteRIDSModal({
  isOpen,
  onClose,
  onConfirm,
  rids,
  loading = false,
}: DeleteRIDSModalProps) {
  if (!rids) return null;

  const reservist = rids.reservist;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete RIDS"
      size="sm"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-error-light border-l-4 border-error p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-error-dark">
                This action will permanently delete the RIDS record
              </p>
              <p className="text-sm text-error mt-1">
                This will remove all RIDS data including sections, biometric data, and history from the database.
              </p>
              <p className="text-sm text-error-dark font-semibold mt-2">
                ⚠️ This action CANNOT be undone!
              </p>
            </div>
          </div>
        </div>

        {/* RIDS Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            RIDS to Delete
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

        {/* Additional Warning */}
        <p className="text-sm text-gray-700 text-center font-medium">
          Are you sure you want to permanently delete this RIDS record?
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
          variant="danger"
          onClick={onConfirm}
          loading={loading}
          disabled={loading}
        >
          Delete RIDS
        </Button>
      </ModalFooter>
    </Modal>
  );
}
