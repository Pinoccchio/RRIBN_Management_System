'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { RIDSFormComplete } from '@/lib/types/rids';
import { XCircle } from 'lucide-react';

interface RejectRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (ridsId: string, rejectionReason: string) => Promise<void>;
  rids: RIDSFormComplete | null;
}

export function RejectRIDSModal({ isOpen, onClose, onReject, rids }: RejectRIDSModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!rids) return null;

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;

    try {
      setIsSubmitting(true);
      await onReject(rids.id, rejectionReason.trim());
      onClose();
      setRejectionReason('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRejectionReason('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Reject RIDS"
      description="Reject this RIDS form with reason"
    >
      <div className="space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <XCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 mb-1">Reject RIDS</h4>
              <p className="text-sm text-red-800">
                This will reject the RIDS and return it to draft status. The reservist will be notified with your
                rejection reason.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-navy-900 mb-2">RIDS Information</h4>
          <div className="text-sm space-y-1">
            <div>
              <span className="text-gray-600">Reservist:</span>{' '}
              <span className="font-medium">
                {rids.reservist?.first_name} {rids.reservist?.last_name}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Service Number:</span>{' '}
              <span className="font-medium">{rids.reservist?.service_number}</span>
            </div>
            <div>
              <span className="text-gray-600">Version:</span>{' '}
              <span className="font-medium">{rids.version}</span>
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="rejectionReason" className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="rejectionReason"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Please provide a detailed reason for rejecting this RIDS form..."
            rows={4}
            required
          />
          <p className="mt-1 text-sm text-gray-500">
            This reason will be shown to the reservist. Be specific about what needs to be corrected.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleReject}
            disabled={!rejectionReason.trim() || isSubmitting}
            className="text-red-600 border-red-300 hover:bg-red-50"
          >
            {isSubmitting ? 'Rejecting...' : 'Reject RIDS'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
