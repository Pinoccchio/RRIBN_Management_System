'use client';

import React from 'react';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import type { AnnouncementWithCreator } from '@/lib/types/announcement';
import { Megaphone, User, Calendar, Clock, Users, Building2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

interface ViewAnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: AnnouncementWithCreator | null;
  onEdit?: (announcement: AnnouncementWithCreator) => void;
}

export function ViewAnnouncementModal({
  isOpen,
  onClose,
  announcement,
  onEdit,
}: ViewAnnouncementModalProps) {
  if (!announcement) return null;

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'secondary';
      case 'normal':
        return 'primary';
      case 'high':
        return 'warning';
      case 'urgent':
        return 'error';
      default:
        return 'secondary';
    }
  };

  const isDraft = !announcement.published_at;
  const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Announcement Details"
      description={announcement.title}
      size="xl"
    >
      <div className="space-y-6">
        {/* Status Indicators */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Draft Badge */}
          {isDraft && (
            <Badge variant="secondary">
              <AlertCircle className="w-3 h-3 mr-1" />
              Draft
            </Badge>
          )}

          {/* Active/Inactive Badge */}
          {!isDraft && (
            <Badge variant={announcement.is_active ? 'success' : 'error'}>
              {announcement.is_active ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-3 h-3 mr-1" />
                  Inactive
                </>
              )}
            </Badge>
          )}

          {/* Priority Badge */}
          <Badge variant={getPriorityColor(announcement.priority)}>
            {announcement.priority.toUpperCase()} PRIORITY
          </Badge>

          {/* Expired Badge */}
          {isExpired && (
            <Badge variant="warning">
              <Clock className="w-3 h-3 mr-1" />
              Expired
            </Badge>
          )}
        </div>

        {/* Content */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Megaphone className="w-4 h-4" />
            Announcement Content
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
              {announcement.content}
            </p>
          </div>
        </div>

        {/* Target Audience */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Target Audience
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Target Companies */}
            <div>
              <div className="flex items-center text-xs text-gray-600 mb-2">
                <Building2 className="w-3 h-3 mr-1.5" />
                Companies
              </div>
              {announcement.target_companies && announcement.target_companies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {announcement.target_companies.map((company) => (
                    <span
                      key={company}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700"
                    >
                      {company}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">All companies</p>
              )}
            </div>

            {/* Target Roles */}
            <div>
              <div className="flex items-center text-xs text-gray-600 mb-2">
                <User className="w-3 h-3 mr-1.5" />
                Roles
              </div>
              {announcement.target_roles && announcement.target_roles.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {announcement.target_roles.map((role) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 capitalize"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">All roles</p>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Timeline
          </h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            {/* Created */}
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Created</p>
                <p className="text-sm font-medium text-navy-900">
                  {formatDateTime(announcement.created_at)}
                </p>
              </div>
            </div>

            {/* Published */}
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="text-xs text-gray-600 mb-0.5">Published</p>
                <p className="text-sm font-medium text-navy-900">
                  {announcement.published_at ? formatDateTime(announcement.published_at) : (
                    <span className="text-gray-500 italic">Not yet published</span>
                  )}
                </p>
              </div>
            </div>

            {/* Expires */}
            {announcement.expires_at && (
              <div className="flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Expires</p>
                  <p className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-navy-900'}`}>
                    {formatDateTime(announcement.expires_at)}
                    {isExpired && <span className="ml-2 text-xs">(Expired)</span>}
                  </p>
                </div>
              </div>
            )}

            {/* Last Updated */}
            {announcement.updated_at && announcement.updated_at !== announcement.created_at && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-600 mb-0.5">Last Updated</p>
                  <p className="text-sm font-medium text-navy-900">
                    {formatDateTime(announcement.updated_at)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Creator Info */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Created By
          </h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-navy-900">
              {announcement.creator.first_name} {announcement.creator.last_name}
            </p>
            <p className="text-xs text-gray-600 mt-0.5">
              {announcement.creator.email}
            </p>
          </div>
        </div>

        {/* Announcement ID (for reference) */}
        <div>
          <h3 className="text-sm font-semibold text-navy-900 mb-3">System Information</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs text-gray-600 mb-1">Announcement ID</p>
            <p className="text-xs font-mono text-gray-800 break-all">{announcement.id}</p>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        {onEdit && (
          <Button
            variant="primary"
            onClick={() => {
              onEdit(announcement);
              onClose();
            }}
          >
            Edit Announcement
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
