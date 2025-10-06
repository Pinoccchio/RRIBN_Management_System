'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { RIDSStatusBadge } from '@/components/ui/Badge';
import { Eye, Send, Edit, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import type { RIDSFormComplete } from '@/lib/types/rids';
import { formatManilaTime } from '@/lib/utils/timezone';

interface RIDSTableProps {
  ridsForms: RIDSFormComplete[];
  onView: (rids: RIDSFormComplete) => void;
  onSubmit: (rids: RIDSFormComplete) => void;
  onEdit?: (rids: RIDSFormComplete) => void;
  onApprove?: (rids: RIDSFormComplete) => void;
  onReject?: (rids: RIDSFormComplete) => void;
  onChangeStatus?: (rids: RIDSFormComplete) => void;
}

export function RIDSTable({ ridsForms, onView, onSubmit, onEdit, onApprove, onReject, onChangeStatus }: RIDSTableProps) {
  if (ridsForms.length === 0) {
    return (
      <div className="p-12 text-center">
        <p className="text-gray-600">No RIDS forms found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Reservist
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Company
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Updated
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {ridsForms.map((rids) => (
            <tr key={rids.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div>
                    <div className="text-sm font-medium text-navy-900">
                      {rids.reservist?.first_name} {rids.reservist?.middle_name ? `${rids.reservist?.middle_name} ` : ''}{rids.reservist?.last_name}
                    </div>
                    <div className="text-sm text-gray-500">{rids.reservist?.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{rids.reservist?.service_number || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{rids.reservist?.company || 'N/A'}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <RIDSStatusBadge status={rids.status} size="sm" />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {formatManilaTime(rids.updated_at)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                {/* View button - always available */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(rids)}
                  title="View RIDS"
                >
                  <Eye className="w-4 h-4" />
                </Button>

                {/* Change Status button - always available for flexibility */}
                {onChangeStatus && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onChangeStatus(rids)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    title="Change RIDS Status"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}

                {/* Edit button - only for draft/rejected */}
                {(rids.status === 'draft' || rids.status === 'rejected') && onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(rids)}
                    className="text-yellow-600 border-yellow-300 hover:bg-yellow-50"
                    title="Edit RIDS"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}

                {/* Submit button - only for draft/rejected */}
                {(rids.status === 'draft' || rids.status === 'rejected') && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSubmit(rids)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    title="Submit for Approval"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                )}

                {/* Approve button - only for submitted RIDS */}
                {rids.status === 'submitted' && onApprove && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onApprove(rids)}
                    className="text-green-600 border-green-300 hover:bg-green-50"
                    title="Approve RIDS"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </Button>
                )}

                {/* Reject button - only for submitted RIDS */}
                {rids.status === 'submitted' && onReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(rids)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                    title="Reject RIDS"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
