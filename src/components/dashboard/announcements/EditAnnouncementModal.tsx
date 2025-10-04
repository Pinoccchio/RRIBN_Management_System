'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import type { AnnouncementWithCreator, UpdateAnnouncementInput, AnnouncementPriority } from '@/lib/types/announcement';
import { convertUTCToManilaLocal, convertManilaLocalToUTC } from '@/lib/utils/timezone';

type AnnouncementStatus = 'draft' | 'active' | 'inactive';

interface EditAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (announcementId: string, input: UpdateAnnouncementInput) => Promise<void>;
  announcement: AnnouncementWithCreator | null;
  assignedCompanies: string[];
}

export function EditAnnouncementModal({
  isOpen,
  onClose,
  onUpdate,
  announcement,
  assignedCompanies,
}: EditAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<AnnouncementStatus>('draft');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize form with announcement data
  useEffect(() => {
    if (announcement) {
      setTitle(announcement.title);
      setContent(announcement.content);
      setPriority(announcement.priority);
      setTargetCompanies(announcement.target_companies || []);
      setTargetRoles(announcement.target_roles || []);

      // Derive status from published_at and is_active
      if (!announcement.published_at) {
        setStatus('draft');
      } else if (announcement.is_active) {
        setStatus('active');
      } else {
        setStatus('inactive');
      }

      setExpiresAt(announcement.expires_at ? convertUTCToManilaLocal(announcement.expires_at) : '');
    }
  }, [announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!announcement) return;

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    // Prevent unpublishing
    if (announcement.published_at && status === 'draft') {
      setError('Cannot unpublish an announcement. Use "Inactive" status to hide it instead.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input: UpdateAnnouncementInput = {
        title: title.trim(),
        content: content.trim(),
        priority,
        target_companies: targetCompanies.length > 0 ? targetCompanies : [],
        target_roles: targetRoles.length > 0 ? targetRoles : [],
        expires_at: expiresAt ? convertManilaLocalToUTC(expiresAt) : '',
      };

      const isDraft = !announcement.published_at;

      // Map dropdown status to database fields
      if (status === 'draft') {
        // Keep as draft (no published_at, is_active = false)
        input.is_active = false;
      } else if (status === 'active') {
        // Publish as active
        if (isDraft) {
          input.published_at = new Date().toISOString(); // Triggers notifications
        }
        input.is_active = true;
      } else if (status === 'inactive') {
        // Publish as inactive
        if (isDraft) {
          input.published_at = new Date().toISOString(); // No notifications
        }
        input.is_active = false;
      }

      await onUpdate(announcement.id, input);
      handleClose();
    } catch (error) {
      console.error('Error updating announcement:', error);
      setError('Failed to update announcement. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setPriority('normal');
    setTargetCompanies([]);
    setTargetRoles([]);
    setStatus('draft');
    setExpiresAt('');
    setError(null);
    onClose();
  };

  const handleCompanyToggle = (company: string) => {
    setTargetCompanies((prev) =>
      prev.includes(company)
        ? prev.filter((c) => c !== company)
        : [...prev, company]
    );
  };

  const handleRoleToggle = (role: string) => {
    setTargetRoles((prev) =>
      prev.includes(role)
        ? prev.filter((r) => r !== role)
        : [...prev, role]
    );
  };

  const availableRoles = ['reservist', 'staff', 'admin'];

  if (!announcement) return null;

  const isDraft = !announcement.published_at;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Edit Announcement"
      description={`Update announcement: ${announcement.title}`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Draft Notice */}
        {isDraft && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-900">Draft Announcement</p>
              <p className="text-xs text-yellow-700 mt-0.5">
                This announcement has not been published yet. Check "Publish Now" to make it visible.
              </p>
            </div>
          </div>
        )}

        {/* Title */}
        <Input
          label="Title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setError(null);
          }}
          placeholder="Enter announcement title"
          required
          helperText="Minimum 3 characters"
        />

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setError(null);
            }}
            rows={6}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            placeholder="Enter announcement content..."
          />
          <p className="mt-1 text-xs text-gray-500">Minimum 10 characters</p>
        </div>

        {/* Priority */}
        <Select
          label="Priority"
          value={priority}
          onChange={(value) => setPriority(value as AnnouncementPriority)}
          options={[
            { value: 'low', label: 'Low' },
            { value: 'normal', label: 'Normal' },
            { value: 'high', label: 'High' },
            { value: 'urgent', label: 'Urgent' },
          ]}
          helperText="Higher priority announcements are displayed more prominently"
        />

        {/* Target Companies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Companies
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            {assignedCompanies.length > 0 ? (
              <>
                {assignedCompanies.map((company) => (
                  <label key={company} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={targetCompanies.includes(company)}
                      onChange={() => handleCompanyToggle(company)}
                      className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                    />
                    <span className="text-sm text-gray-700">{company}</span>
                  </label>
                ))}
                <p className="text-xs text-gray-500 mt-2">
                  {targetCompanies.length === 0 ? 'Leave unchecked to target all companies' : `Targeting ${targetCompanies.length} company(ies)`}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500">No companies assigned</p>
            )}
          </div>
        </div>

        {/* Target Roles (Optional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Roles (Optional)
          </label>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
            {availableRoles.map((role) => (
              <label key={role} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={targetRoles.includes(role)}
                  onChange={() => handleRoleToggle(role)}
                  className="w-4 h-4 text-yellow-500 border-gray-300 rounded focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700 capitalize">{role}</span>
              </label>
            ))}
            <p className="text-xs text-gray-500 mt-2">
              Leave unchecked to target all roles
            </p>
          </div>
        </div>

        {/* Announcement Status */}
        <div className="space-y-3">
          <Select
            label="Announcement Status"
            value={status}
            onChange={(value) => setStatus(value as AnnouncementStatus)}
            options={[
              {
                value: 'draft',
                label: 'Draft - Not Published'
              },
              {
                value: 'active',
                label: 'Active - Published & Visible'
              },
              {
                value: 'inactive',
                label: 'Inactive - Published but Hidden'
              },
            ]}
            helperText="Select the current status for this announcement"
          />

          {/* Status Explanation Banner */}
          <div className={`p-3 rounded-lg border-2 ${
            status === 'draft'
              ? 'bg-yellow-50 border-yellow-200'
              : status === 'active'
              ? 'bg-green-50 border-green-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <p className={`text-sm font-medium ${
              status === 'draft'
                ? 'text-yellow-900'
                : status === 'active'
                ? 'text-green-900'
                : 'text-gray-900'
            }`}>
              {status === 'draft' && (
                <>
                  <span className="font-semibold">Draft:</span> Announcement is not published. No users can see it. You can edit freely.
                </>
              )}
              {status === 'active' && (
                <>
                  <span className="font-semibold">Active:</span> Announcement is published and visible to targeted users.
                  {!announcement.published_at && (
                    <span className="block mt-1 text-xs text-green-800">
                      ⓘ Saving as Active will publish this announcement and send notifications to all targeted users.
                    </span>
                  )}
                </>
              )}
              {status === 'inactive' && (
                <>
                  <span className="font-semibold">Inactive:</span> Announcement is published but hidden from users.
                  {!announcement.published_at && (
                    <span className="block mt-1 text-xs text-gray-800">
                      ⓘ Saving as Inactive will publish without sending notifications. Useful for scheduling announcements.
                    </span>
                  )}
                </>
              )}
            </p>
          </div>

          {/* Unpublish Prevention Warning */}
          {announcement.published_at && status === 'draft' && (
            <div className="p-3 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-900">Cannot Unpublish Announcement</p>
                <p className="text-xs text-red-700 mt-0.5">
                  Once published, announcements cannot be reverted to draft status. Use "Inactive" to hide it from users instead.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Expires At */}
        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700 mb-2">
            Expiration Date (Optional)
          </label>
          <input
            type="datetime-local"
            id="expires_at"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date().toISOString().slice(0, 16)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          />
          <p className="mt-1 text-xs text-gray-500">
            Leave empty for no expiration
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={
              isLoading ||
              !title.trim() ||
              !content.trim() ||
              (announcement.published_at && status === 'draft') // Disable if trying to unpublish
            }
            leftIcon={
              !announcement.published_at && status !== 'draft'
                ? <CheckCircle className="w-4 h-4" />
                : <Edit className="w-4 h-4" />
            }
          >
            {isLoading
              ? 'Updating...'
              : !announcement.published_at && status === 'active'
              ? 'Update & Publish'
              : !announcement.published_at && status === 'inactive'
              ? 'Update & Publish (Hidden)'
              : 'Update Announcement'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
