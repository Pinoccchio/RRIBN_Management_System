'use client';

import React from 'react';
import { Eye, CheckCircle, XCircle, Clock, Mail, Shield, AlertCircle, RotateCcw, RefreshCw } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { timeAgo } from '@/lib/design-system/utils';
import type { Reservist } from '@/lib/types/reservist';

interface ReservistTableProps {
  reservists: Reservist[];
  onView: (reservist: Reservist) => void;
  onApprove: (reservist: Reservist) => void;
  onReject: (reservist: Reservist) => void;
  onRevertToPending?: (reservist: Reservist) => void;
  onReactivate?: (reservist: Reservist) => void;
}

export function ReservistTable({
  reservists,
  onView,
  onApprove,
  onReject,
  onRevertToPending,
  onReactivate,
}: ReservistTableProps) {
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

  if (reservists.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Shield className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No reservists found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or wait for new reservist registrations.
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
                Reservist
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Service #
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Rank
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Company
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Registered
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reservists.map((reservist) => (
              <tr key={reservist.id} className="hover:bg-gray-50 transition-colors">
                {/* Reservist Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Avatar
                      firstName={reservist.profile.first_name}
                      lastName={reservist.profile.last_name}
                      src={reservist.profile.profile_photo_url}
                      size="md"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-navy-900">
                        {reservist.profile.first_name} {reservist.profile.middle_name ? `${reservist.profile.middle_name} ` : ''}{reservist.profile.last_name}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center mt-0.5">
                        <Mail className="w-3 h-3 mr-1" />
                        {reservist.email}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Service Number */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.service_number}
                  </div>
                  {reservist.reservist_details.afpsn && (
                    <div className="text-xs text-gray-500 mt-0.5">
                      AFPSN: {reservist.reservist_details.afpsn}
                    </div>
                  )}
                </td>

                {/* Rank */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.rank || 'N/A'}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {reservist.reservist_details.commission_type || 'N/A'}
                  </div>
                </td>

                {/* Company */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-navy-900">
                    {reservist.reservist_details.company || 'Not Assigned'}
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={reservist.status} size="sm" />
                  {reservist.approved_by && reservist.approved_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(reservist.approved_at)}
                    </div>
                  )}
                  {reservist.status === 'deactivated' && reservist.rejection_reason && (
                    <div className="flex items-start gap-1 mt-1" title={reservist.rejection_reason}>
                      <AlertCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-red-600 line-clamp-1">
                        {reservist.rejection_reason}
                      </span>
                    </div>
                  )}
                </td>

                {/* Registered */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="font-medium">{timeAgo(reservist.created_at)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(reservist)}
                      className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Pending Status Actions */}
                    {reservist.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onApprove(reservist)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-105"
                          title="Approve reservist"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(reservist)}
                          className="p-2 text-error hover:bg-error-light rounded-lg transition-all hover:scale-105"
                          title="Reject reservist"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}

                    {/* Active Status Actions */}
                    {reservist.status === 'active' && onRevertToPending && (
                      <button
                        onClick={() => onRevertToPending(reservist)}
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all hover:scale-105"
                        title="Revert to pending"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}

                    {/* Deactivated/Inactive Status Actions */}
                    {(reservist.status === 'deactivated' || reservist.status === 'inactive') && onReactivate && (
                      <button
                        onClick={() => onReactivate(reservist)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-105"
                        title="Reactivate account"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
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
