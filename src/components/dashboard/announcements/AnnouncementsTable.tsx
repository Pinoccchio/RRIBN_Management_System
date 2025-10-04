'use client';

import React from 'react';
import { Eye, Edit, Trash2, Megaphone, Calendar, Clock, Users, Building2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { timeAgo, formatDate } from '@/lib/design-system/utils';
import type { AnnouncementWithCreator, AnnouncementPriority } from '@/lib/types/announcement';

interface AnnouncementsTableProps {
  announcements: AnnouncementWithCreator[];
  onView: (announcement: AnnouncementWithCreator) => void;
  onEdit: (announcement: AnnouncementWithCreator) => void;
  onDelete: (announcement: AnnouncementWithCreator) => void;
}

export function AnnouncementsTable({
  announcements,
  onView,
  onEdit,
  onDelete,
}: AnnouncementsTableProps) {
  const getPriorityBadge = (priority: AnnouncementPriority) => {
    const priorityConfig: Record<AnnouncementPriority, { label: string; className: string }> = {
      low: { label: 'Low', className: 'bg-gray-100 text-gray-700 border-gray-300' },
      normal: { label: 'Normal', className: 'bg-blue-100 text-blue-700 border-blue-300' },
      high: { label: 'High', className: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
      urgent: { label: 'Urgent', className: 'bg-red-100 text-red-700 border-red-300' },
    };

    const config = priorityConfig[priority];
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (announcement: AnnouncementWithCreator) => {
    // Draft (unpublished)
    if (!announcement.published_at) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-gray-100 text-gray-700 border-gray-300">
          Draft
        </span>
      );
    }

    // Inactive
    if (!announcement.is_active) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-red-100 text-red-700 border-red-300">
          Inactive
        </span>
      );
    }

    // Expired
    if (announcement.expires_at && new Date(announcement.expires_at) < new Date()) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-orange-100 text-orange-700 border-orange-300">
          Expired
        </span>
      );
    }

    // Active
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border bg-green-100 text-green-700 border-green-300">
        Active
      </span>
    );
  };

  const formatTargetDisplay = (announcement: AnnouncementWithCreator) => {
    const companies = announcement.target_companies;
    const roles = announcement.target_roles;

    if (!companies && !roles) {
      return (
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1.5" />
          All Users
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {companies && companies.length > 0 && (
          <div className="flex items-center text-sm text-gray-700">
            <Building2 className="w-4 h-4 mr-1.5 text-gray-500" />
            {companies.join(', ')}
          </div>
        )}
        {roles && roles.length > 0 && (
          <div className="flex items-center text-xs text-gray-600">
            <Users className="w-3 h-3 mr-1.5" />
            {roles.join(', ')}
          </div>
        )}
      </div>
    );
  };

  if (announcements.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Megaphone className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No announcements found</h3>
        <p className="text-gray-600">
          Create your first announcement to start communicating with reservists.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-navy-subtle">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Announcement
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Priority
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Target
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Published
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {announcements.map((announcement) => (
              <tr key={announcement.id} className="hover:bg-gray-50 transition-colors">
                {/* Announcement Info */}
                <td className="px-6 py-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                        <Megaphone className="w-5 h-5 text-yellow-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-navy-900 mb-0.5">
                        {announcement.title}
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2">
                        {announcement.content}
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <span>By {announcement.creator.first_name} {announcement.creator.last_name}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* Priority */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getPriorityBadge(announcement.priority)}
                </td>

                {/* Target */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {formatTargetDisplay(announcement)}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(announcement)}
                </td>

                {/* Published */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {announcement.published_at ? (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{timeAgo(announcement.published_at)}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-gray-400">
                      <AlertCircle className="w-4 h-4 mr-1.5" />
                      <span className="italic">Unpublished</span>
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(announcement)}
                      className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onEdit(announcement)}
                      className="p-2 text-navy-600 hover:bg-navy-50 rounded-lg transition-all hover:scale-105"
                      title="Edit announcement"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onDelete(announcement)}
                      className="p-2 text-error hover:bg-error-light rounded-lg transition-all hover:scale-105"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
