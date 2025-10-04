'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { AlertTriangle, XCircle } from 'lucide-react';
import type { AnnouncementWithCreator } from '@/lib/types/announcement';

interface DeleteAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: (announcementId: string) => Promise<void>;
  announcement: AnnouncementWithCreator | null;
}

export function DeleteAnnouncementModal({
  isOpen,
  onClose,
  onDelete,
  announcement,
}: DeleteAnnouncementModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!announcement) return;

    setIsLoading(true);

    try {
      await onDelete(announcement.id);
      onClose();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      // Error handling is done in the parent component
    } finally {
      setIsLoading(false);
    }
  };

  if (!announcement) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Delete Announcement"
      description="This action will permanently delete the announcement"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-orange-900 mb-1">
              Delete Announcement
            </h3>
            <p className="text-sm text-orange-800">
              This action will permanently delete the announcement from the system. This cannot be undone.
              Only announcements you created can be deleted.
            </p>
          </div>
        </div>

        {/* Announcement Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Announcement to Delete</h4>
          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-600 mb-1">Title</p>
              <p className="text-sm font-medium text-gray-900">{announcement.title}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Content Preview</p>
              <p className="text-sm text-gray-700 line-clamp-2">{announcement.content}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Priority</p>
              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-200 text-gray-700 capitalize">
                {announcement.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <XCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-red-800">
            <strong>What happens when you delete:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>The announcement will be permanently removed from the system</li>
              <li>All associated notifications will remain but link to a deleted announcement</li>
              <li>This action cannot be undone</li>
              <li>Users will no longer see this announcement</li>
            </ul>
          </div>
        </div>

        {/* Confirmation Question */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm font-medium text-red-900">
            Are you sure you want to delete this announcement?
          </p>
          <p className="text-xs text-red-700 mt-1">
            This action is permanent and cannot be undone.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={handleDelete}
            disabled={isLoading}
            leftIcon={<XCircle className="w-4 h-4" />}
          >
            {isLoading ? 'Deleting...' : 'Delete Announcement'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
