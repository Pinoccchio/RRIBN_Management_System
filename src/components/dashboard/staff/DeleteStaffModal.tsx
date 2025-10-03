'use client';

import React, { useEffect, useState } from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { StatusBadge } from '@/components/ui/Badge';
import { CompanyBadgeList } from '@/components/ui/CompanyBadge';
import { AlertTriangle } from 'lucide-react';
import type { StaffMember } from '@/lib/types/staff';

interface DeleteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staff: StaffMember | null;
}

export function DeleteStaffModal({
  isOpen,
  onClose,
  onConfirm,
  staff,
}: DeleteStaffModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!staff) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/staff/${staff.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to delete staff member');
        setIsDeleting(false);
        return;
      }

      // Success - call onConfirm to refresh list
      onConfirm();
      setIsDeleting(false);
      onClose();
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setError('An unexpected error occurred');
      setIsDeleting(false);
    }
  };

  // Handle Enter key to confirm
  useEffect(() => {
    if (!isOpen || isDeleting) return;

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleDelete();
      }
    };

    document.addEventListener('keydown', handleEnter);
    return () => document.removeEventListener('keydown', handleEnter);
  }, [isOpen, isDeleting, handleDelete]);

  if (!staff) {
    return null;
  }

  const fullName = `${staff.profile.first_name} ${staff.profile.last_name}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Staff Member"
      size="md"
      showCloseButton={!isDeleting}
    >
      <div className="space-y-6">
        {/* Warning Icon - Centered */}
        <div className="flex justify-center">
          <div className="bg-error-light rounded-full p-3">
            <AlertTriangle className="w-8 h-8 text-error" />
          </div>
        </div>

        {/* Staff Details Card */}
        <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <Avatar
            firstName={staff.profile.first_name}
            lastName={staff.profile.last_name}
            src={staff.profile.profile_photo_url}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-navy-900 text-lg truncate">
              {fullName}
            </div>
            <div className="text-sm text-gray-600 truncate mt-1">
              {staff.email}
            </div>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <StatusBadge status={staff.status} size="sm" />
              {staff.staff_details.employee_id && (
                <span className="text-xs text-gray-600 bg-gray-200 px-2 py-1 rounded">
                  ID: {staff.staff_details.employee_id}
                </span>
              )}
            </div>
            {staff.staff_details.assigned_companies.length > 0 && (
              <div className="mt-3">
                <CompanyBadgeList
                  companyCodes={staff.staff_details.assigned_companies}
                  size="sm"
                  maxDisplay={5}
                />
              </div>
            )}
          </div>
        </div>

        {/* Warning Message */}
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
            </div>
            <div className="flex-1">
              <div className="text-sm text-red-800 font-semibold mb-1">
                Warning: This action cannot be undone
              </div>
              <div className="text-sm text-red-700">
                This will permanently delete <strong>{fullName}</strong> from the system.
                The staff member will no longer be able to access their account, and all
                associated data will be removed.
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              </div>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Confirmation Question - Centered */}
        <div className="text-center text-gray-700 font-medium">
          Are you sure you want to permanently delete this staff member?
        </div>
      </div>

      <ModalFooter className="mt-6">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          loading={isDeleting}
          disabled={isDeleting}
        >
          Delete Staff Member
        </Button>
      </ModalFooter>
    </Modal>
  );
}
