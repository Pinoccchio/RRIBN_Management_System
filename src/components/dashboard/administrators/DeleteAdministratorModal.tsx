'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { RoleBadge } from '@/components/ui/Badge';
import { AlertTriangle, Mail } from 'lucide-react';
import type { Administrator } from '@/lib/types/administrator';

interface DeleteAdministratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  administrator: Administrator | null;
  loading?: boolean;
}

export function DeleteAdministratorModal({
  isOpen,
  onClose,
  onConfirm,
  administrator,
  loading = false,
}: DeleteAdministratorModalProps) {
  if (!administrator) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Administrator"
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
                This action will permanently delete the administrator account
              </p>
              <p className="text-sm text-error mt-1">
                This will remove the account from both Supabase Auth and the database.
              </p>
              <p className="text-sm text-error-dark font-semibold mt-2">
                ⚠️ This action CANNOT be undone!
              </p>
            </div>
          </div>
        </div>

        {/* Administrator Info */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Administrator to Delete
          </p>

          <div className="flex items-start gap-4">
            <Avatar
              firstName={administrator.profile.first_name}
              lastName={administrator.profile.last_name}
              src={administrator.profile.profile_photo_url}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <h4 className="text-base font-bold text-navy-900 mb-1">
                {administrator.profile.first_name} {administrator.profile.last_name}
              </h4>

              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <Mail className="w-4 h-4" />
                <span className="truncate">{administrator.email}</span>
              </div>

              <RoleBadge role={administrator.role} size="sm" />
            </div>
          </div>
        </div>

        {/* Additional Warning */}
        <p className="text-sm text-gray-700 text-center font-medium">
          Are you sure you want to permanently delete this administrator?
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
          Delete Administrator
        </Button>
      </ModalFooter>
    </Modal>
  );
}
