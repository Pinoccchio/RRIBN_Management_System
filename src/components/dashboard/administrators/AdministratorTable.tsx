'use client';

import React from 'react';
import { Edit, Trash2, Eye, Clock, Mail } from 'lucide-react';
import { StatusBadge, RoleBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/design-system/utils';
import type { Administrator } from '@/lib/types/administrator';

interface AdministratorTableProps {
  administrators: Administrator[];
  onEdit: (admin: Administrator) => void;
  onDelete: (admin: Administrator) => void;
  onView: (admin: Administrator) => void;
  currentUserId?: string;
}

export function AdministratorTable({
  administrators,
  onEdit,
  onDelete,
  onView,
  currentUserId,
}: AdministratorTableProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (administrators.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No administrators found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or create a new administrator account.
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
                Administrator
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Created
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {administrators.map((admin) => (
              <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                {/* Administrator Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      firstName={admin.profile.first_name}
                      lastName={admin.profile.last_name}
                      src={admin.profile.profile_photo_url}
                      size="md"
                      ring={admin.id === currentUserId}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-navy-900">
                        {admin.profile.first_name} {admin.profile.last_name}
                        {admin.id === currentUserId && (
                          <span className="ml-2 text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">You</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-0.5">
                        <Mail className="w-3 h-3 mr-1" />
                        {admin.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={admin.role} size="sm" />
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={admin.status} size="sm" />
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="font-medium">{timeAgo(admin.last_login_at || admin.created_at)}</span>
                  </div>
                </td>

                {/* Created */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="font-medium">{formatDate(admin.created_at)}</div>
                  {admin.creator && (
                    <div className="text-xs text-gray-500 mt-1">
                      by {admin.creator.first_name} {admin.creator.last_name}
                    </div>
                  )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(admin)}
                      className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(admin)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all hover:scale-105"
                      title="Edit administrator"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(admin)}
                      disabled={admin.id === currentUserId}
                      className={`p-2 rounded-lg transition-all ${
                        admin.id === currentUserId
                          ? 'text-gray-300 cursor-not-allowed'
                          : 'text-error hover:bg-error-light hover:scale-105'
                      }`}
                      title={admin.id === currentUserId ? "Cannot delete your own account" : "Delete administrator"}
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
