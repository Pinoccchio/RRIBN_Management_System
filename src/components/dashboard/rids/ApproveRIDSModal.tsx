'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Textarea } from '@/components/ui/Textarea';
import type { RIDSFormComplete } from '@/lib/types/rids';
import { CheckCircle } from 'lucide-react';

interface ApproveRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: (ridsId: string, verificationNotes?: string) => Promise<void>;
  rids: RIDSFormComplete | null;
}

export function ApproveRIDSModal({ isOpen, onClose, onApprove, rids }: ApproveRIDSModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notes, setNotes] = useState('');

  if (!rids) return null;

  const handleApprove = async () => {
    try {
      setIsSubmitting(true);
      await onApprove(rids.id, notes.trim() || undefined);
      onClose();
      setNotes('');
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setNotes('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Approve RIDS"
      description="Approve this RIDS form"
    >
      <div className="space-y-4">
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 mb-1">Approve RIDS</h4>
              <p className="text-sm text-green-800">
                This will mark the RIDS as approved and make it official. The reservist will be notified.
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
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Attestation Notes (Optional)
          </label>
          <Textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any attestation notes or remarks..."
            rows={3}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleApprove}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Approving...' : 'Approve RIDS'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
