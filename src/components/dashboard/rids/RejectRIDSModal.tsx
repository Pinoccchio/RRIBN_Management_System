'use client';

import React, { useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import { XCircle, User, Hash, Shield, Building, AlertTriangle } from 'lucide-react';
import type { RIDSFormComplete } from '@/lib/types/rids';

interface RejectRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (ridsId: string, rejectionReason: string) => void | Promise<void>;
  rids: RIDSFormComplete | null;
  loading?: boolean;
}

export function RejectRIDSModal({
  isOpen,
  onClose,
  onReject,
  rids,
  loading = false,
}: RejectRIDSModalProps) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState('');

  const handleClose = () => {
    setRejectionReason('');
    setError('');
    onClose();
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }

    if (!rids) return;

    try {
      await onReject(rids.id, rejectionReason.trim());
      handleClose();
    } catch (error) {
      // Error is handled by parent component
    }
  };

  if (!rids) return null;

  const reservist = rids.reservist;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reject RIDS"
      size="sm"
      showCloseButton={!loading}
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-900">
                Reject RIDS
              </p>
              <p className="text-sm text-red-800 mt-1">
                This will reject the RIDS and send it back to draft status. The reservist will be able to make corrections and resubmit.
              </p>
            </div>
          </div>
        </div>

        {/* RIDS Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            RIDS to Reject
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

        {/* Rejection Reason */}
        <div>
          <label htmlFor="rejection-reason" className="block text-sm font-medium text-gray-700 mb-2">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="rejection-reason"
            placeholder="Please provide a detailed reason for rejecting this RIDS..."
            value={rejectionReason}
            onChange={(e) => {
              setRejectionReason(e.target.value);
              if (error) setError('');
            }}
            rows={4}
            className={error ? 'border-red-500' : ''}
            disabled={loading}
          />
          {error && (
            <p className="mt-1 text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleReject}
          loading={loading}
          disabled={loading}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject RIDS
        </Button>
      </ModalFooter>
    </Modal>
  );
}
