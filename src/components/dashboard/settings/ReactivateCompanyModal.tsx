'use client';

import React, { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import type { Company } from '@/lib/types/staff';

interface ReactivateCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  company: Company | null;
}

export function ReactivateCompanyModal({
  isOpen,
  onClose,
  onConfirm,
  company,
}: ReactivateCompanyModalProps) {
  const [isReactivating, setIsReactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReactivate = async () => {
    if (!company) return;

    setIsReactivating(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/companies/${company.code}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_active: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reactivate company');
        setIsReactivating(false);
        return;
      }

      setIsReactivating(false);
      onConfirm();
      onClose();
    } catch (err) {
      console.error('Error reactivating company:', err);
      setError('An unexpected error occurred');
      setIsReactivating(false);
    }
  };

  const handleClose = () => {
    if (!isReactivating) {
      setError(null);
      onClose();
    }
  };

  if (!company) return null;

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleReactivate}
        title="Reactivate Company"
        message={
          <div className="space-y-6">
            {/* Company Card - Centered */}
            <div className="flex flex-col items-center gap-4 p-6 bg-success-light rounded-xl border border-success-200">
              <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-2xl font-bold text-success-dark">
                  {company.code.substring(0, 2)}
                </span>
              </div>
              <div className="text-center">
                <p className="font-bold text-navy-900 text-xl mb-1">{company.name}</p>
                <p className="text-sm font-mono text-gray-600 mb-2">{company.code}</p>
                {company.description && (
                  <p className="text-sm text-gray-500 max-w-md">{company.description}</p>
                )}
              </div>
            </div>

            {/* Confirmation Message */}
            <div className="text-center">
              <p className="text-gray-700 font-medium mb-4">
                Reactivate this company and make it available again?
              </p>
              <p className="text-gray-600 text-sm mb-4">This will:</p>
            </div>

            {/* Action List */}
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Set the company status to <strong>active</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Make it visible in dropdown selections for staff and reservists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-0.5">✓</span>
                <span>Allow new staff and reservists to be assigned to this company</span>
              </li>
            </ul>

            {/* Success Info Box */}
            <div className="bg-success-50 border-l-4 border-success rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-success-dark mb-1">Good to know</p>
                  <p className="text-sm text-gray-700">
                    All existing staff and reservist assignments to this company have been preserved
                    and will remain active after reactivation.
                  </p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-error-light border-l-4 border-error rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm text-error-dark">{error}</p>
                </div>
              </div>
            )}
          </div>
        }
        confirmText="Reactivate Company"
        cancelText="Cancel"
        variant="info"
        loading={isReactivating}
      />
    </>
  );
}
