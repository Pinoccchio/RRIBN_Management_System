'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { RIDSFormComplete } from '@/lib/types/rids';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SubmitRIDSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (ridsId: string, submittedBy: string) => Promise<void>;
  rids: RIDSFormComplete | null;
}

export function SubmitRIDSModal({ isOpen, onClose, onSubmit, rids }: SubmitRIDSModalProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [certificationConfirmed, setCertificationConfirmed] = useState(false);

  if (!rids) return null;

  const handleSubmit = async () => {
    if (!user || !certificationConfirmed) return;

    try {
      setIsSubmitting(true);
      await onSubmit(rids.id, user.id);
      onClose();
      setCertificationConfirmed(false);
    } catch (error) {
      // Error handled by parent
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCertificationConfirmed(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="md"
      title="Submit RIDS"
      description="Submit this RIDS form for approval"
    >
      <div className="space-y-4">
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 mb-1">Important</h4>
              <p className="text-sm text-yellow-800">
                Once submitted, this RIDS form will be locked and cannot be edited unless it is rejected.
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

        <div className="p-4 border border-gray-200 rounded-lg">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="certification"
              checked={certificationConfirmed}
              onChange={(e) => setCertificationConfirmed(e.target.checked)}
              className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
            />
            <label htmlFor="certification" className="ml-3 text-sm text-gray-700">
              <span className="font-semibold">I hereby certify</span> that all entries in this RIDS document are
              correct and complete to the best of my knowledge.
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleSubmit}
            disabled={!certificationConfirmed || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
