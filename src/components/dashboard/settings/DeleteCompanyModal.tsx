'use client';

import React, { useState } from 'react';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import type { Company } from '@/lib/types/staff';

interface DeleteCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  company: Company | null;
}

export function DeleteCompanyModal({
  isOpen,
  onClose,
  onConfirm,
  company,
}: DeleteCompanyModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!company) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/companies/${company.code}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to deactivate company');
        setIsDeleting(false);
        return;
      }

      setIsDeleting(false);
      onConfirm();
      onClose();
    } catch (err) {
      console.error('Error deactivating company:', err);
      setError('An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
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
        onConfirm={handleDelete}
        title="Deactivate Company"
        message={
          <div className="space-y-4">
            {/* Company Card */}
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm border-2 border-gray-200">
                    <span className="text-xl font-bold text-navy-900">
                      {company.code.substring(0, 2)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-navy-900 mb-1">{company.name}</h3>
                  <p className="text-sm font-mono text-gray-600 mb-2">{company.code}</p>
                  {company.description && (
                    <p className="text-sm text-gray-600">{company.description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Confirmation Message */}
            <div>
              <p className="text-gray-700 font-medium mb-3">
                Are you sure you want to deactivate this company?
              </p>
              <p className="text-gray-600 text-sm mb-3">This will:</p>
            </div>

            {/* Action List */}
            <ul className="space-y-2 text-sm text-gray-700 mb-4">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Set the company status to <strong>inactive</strong></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Hide it from dropdown selections in staff/reservist forms</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-0.5">•</span>
                <span>Preserve all existing staff and reservist assignments</span>
              </li>
            </ul>

            {/* Warning Box */}
            <div className="bg-yellow-50 border-l-4 border-warning rounded-r p-3">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-warning mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Note</p>
                  <p className="text-sm text-gray-700">
                    Staff and reservists currently assigned to this company will remain assigned.
                    You can <strong>reactivate</strong> this company later if needed.
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
        confirmText="Deactivate Company"
        cancelText="Cancel"
        variant="warning"
        loading={isDeleting}
      />
    </>
  );
}
