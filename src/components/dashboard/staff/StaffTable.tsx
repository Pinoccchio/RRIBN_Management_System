'use client';

import React from 'react';
import { Edit, Trash2, Eye, Clock, Mail, IdCard, Briefcase } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { CompanyBadgeList } from '@/components/ui/CompanyBadge';
import { timeAgo } from '@/lib/design-system/utils';
import type { StaffMember } from '@/lib/types/staff';

interface StaffTableProps {
  staff: StaffMember[];
  onEdit: (staff: StaffMember) => void;
  onDelete: (staff: StaffMember) => void;
  onView: (staff: StaffMember) => void;
}

export function StaffTable({
  staff,
  onEdit,
  onDelete,
  onView,
}: StaffTableProps) {
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

  if (staff.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No staff members found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or create a new staff account.
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
                Staff Member
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Employee ID
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Companies
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staff.map((staffMember) => (
              <tr key={staffMember.id} className="hover:bg-gray-50 transition-colors">
                {/* Staff Member Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      firstName={staffMember.profile.first_name}
                      lastName={staffMember.profile.last_name}
                      src={staffMember.profile.profile_photo_url}
                      size="md"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-navy-900">
                        {staffMember.profile.first_name} {staffMember.profile.last_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-0.5">
                        <Mail className="w-3 h-3 mr-1" />
                        {staffMember.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Employee ID */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {staffMember.staff_details.employee_id ? (
                    <div className="flex items-center text-sm text-gray-900">
                      <IdCard className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{staffMember.staff_details.employee_id}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>

                {/* Position */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {staffMember.staff_details.position ? (
                    <div className="flex items-center text-sm text-gray-900">
                      <Briefcase className="w-4 h-4 mr-1.5 text-gray-400" />
                      <span className="font-medium">{staffMember.staff_details.position}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>

                {/* Companies */}
                <td className="px-6 py-4">
                  {staffMember.staff_details.assigned_companies.length > 0 ? (
                    <CompanyBadgeList
                      companyCodes={staffMember.staff_details.assigned_companies}
                      size="sm"
                      maxDisplay={3}
                    />
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={staffMember.status} size="sm" />
                </td>

                {/* Last Login */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="font-medium">{timeAgo(staffMember.last_login_at || staffMember.created_at)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(staffMember)}
                      className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(staffMember)}
                      className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all hover:scale-105"
                      title="Edit staff member"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(staffMember)}
                      className="p-2 text-error hover:bg-error-light rounded-lg transition-all hover:scale-105"
                      title="Delete staff member"
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
