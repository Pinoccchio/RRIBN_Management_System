'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Megaphone, AlertTriangle } from 'lucide-react';
import type { CreateAnnouncementInput, AnnouncementPriority } from '@/lib/types/announcement';
import { convertManilaLocalToUTC } from '@/lib/utils/timezone';

type AnnouncementStatus = 'draft' | 'active' | 'inactive';

interface CreateAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (input: CreateAnnouncementInput) => Promise<void>;
  assignedCompanies: string[];
}

export function CreateAnnouncementModal({
  isOpen,
  onClose,
  onCreate,
  assignedCompanies,
}: CreateAnnouncementModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('normal');
  const [targetCompanies, setTargetCompanies] = useState<string[]>([]);
  const [targetRoles, setTargetRoles] = useState<string[]>([]);
  const [status, setStatus] = useState<AnnouncementStatus>('active');
  const [expiresAt, setExpiresAt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (title.trim().length < 3) {
      setError('Title must be at least 3 characters long');
      return;
    }

    if (content.trim().length < 10) {
      setError('Content must be at least 10 characters long');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const input: CreateAnnouncementInput = {
        title: title.trim(),
        content: content.trim(),
        priority,
        target_companies: targetCompanies.length > 0 ? targetCompanies : undefined,
        target_roles: targetRoles.length > 0 ? targetRoles : undefined,
        publish_now: status === 'active' || status === 'inactive', // Publish for both active and inactive
        is_active: status === 'active', // Only active if status is 'active'
        expires_at: expiresAt ? convertManilaLocalToUTC(expiresAt) : undefined,
      };

      await onCreate(input);
      handleClose();
    } catch (error) {
      console.error('Error creating announcement:', error);
      setError('Failed to create announcement. Please try again.');
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
    setStatus('active');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="xl"
      title="Create Announcement"
      description="Broadcast important information to reservists"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{error}</p>
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
            helperText="Select the initial status for this announcement"
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
                  <span className="font-semibold">Draft:</span> Announcement will not be published. You can edit and publish it later.
                </>
              )}
              {status === 'active' && (
                <>
                  <span className="font-semibold">Active:</span> Announcement will be published immediately and visible to targeted users.
                  <span className="block mt-1 text-xs text-green-800">
                    ⓘ Notifications will be sent to all targeted users when you create this announcement.
                  </span>
                </>
              )}
              {status === 'inactive' && (
                <>
                  <span className="font-semibold">Inactive:</span> Announcement will be published but hidden from users.
                  <span className="block mt-1 text-xs text-gray-800">
                    ⓘ No notifications will be sent. Useful for pre-creating announcements to activate later.
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Expires At (Optional) */}
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
            disabled={isLoading || !title.trim() || !content.trim()}
            leftIcon={<Megaphone className="w-4 h-4" />}
          >
            {isLoading
              ? 'Creating...'
              : status === 'active'
              ? 'Create & Publish'
              : status === 'inactive'
              ? 'Create & Publish (Hidden)'
              : 'Save as Draft'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
