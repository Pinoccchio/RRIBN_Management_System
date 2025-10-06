'use client';

import { Eye, Edit, Trash2, Send, CheckCircle, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';
import { RIDSFormComplete } from '@/lib/types/rids';

interface RIDSTableProps {
  rids: RIDSFormComplete[];
  loading: boolean;
  onView: (rids: RIDSFormComplete) => void;
  onEdit: (rids: RIDSFormComplete) => void;
  onDelete: (rids: RIDSFormComplete) => void;
  onSubmit?: (rids: RIDSFormComplete) => void;
  onApprove?: (rids: RIDSFormComplete) => void;
  onReject?: (rids: RIDSFormComplete) => void;
}

export function RIDSTable({
  rids,
  loading,
  onView,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
}: RIDSTableProps) {
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
      submitted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Submitted' },
      approved: { bg: 'bg-green-100', text: 'text-green-800', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-600"></div>
          <span className="ml-3 text-gray-600">Loading RIDS...</span>
        </div>
      </div>
    );
  }

  if (rids.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-12">
        <div className="text-center">
          <p className="text-gray-500">No RIDS found</p>
          <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or create a new RIDS</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Reservist
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service Number
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rank
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rids.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {item.reservist?.first_name} {item.reservist?.middle_name?.charAt(0)}. {item.reservist?.last_name}
                  </div>
                  <div className="text-sm text-gray-500">{item.reservist?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.reservist?.service_number || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.reservist?.rank || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.reservist?.company || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(item.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(item.updated_at), 'MMM d, yyyy')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onView(item)}
                      title="View RIDS"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {(item.status === 'draft' || item.status === 'rejected') && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(item)}
                          title="Edit RIDS"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {onSubmit && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onSubmit(item)}
                            title="Submit for Approval"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(item)}
                          className="text-red-600 hover:text-red-700"
                          title="Delete RIDS"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}

                    {item.status === 'submitted' && onApprove && onReject && (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onApprove(item)}
                          className="text-green-600 hover:text-green-700"
                          title="Approve RIDS"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReject(item)}
                          className="text-red-600 hover:text-red-700"
                          title="Reject RIDS"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </>
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
