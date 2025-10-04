'use client';

import React from 'react';
import { Eye, CheckCircle, XCircle, Clock, FileText, User } from 'lucide-react';
import { StatusBadge } from '@/components/ui/Badge';
import { timeAgo } from '@/lib/design-system/utils';
import type { DocumentWithReservist } from '@/lib/types/document';

interface DocumentsTableProps {
  documents: DocumentWithReservist[];
  onView: (document: DocumentWithReservist) => void;
  onValidate: (document: DocumentWithReservist) => void;
  onReject: (document: DocumentWithReservist) => void;
}

export function DocumentsTable({
  documents,
  onView,
  onValidate,
  onReject,
}: DocumentsTableProps) {
  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, 'pending' | 'active' | 'inactive' | 'deactivated'> = {
      pending: 'pending',
      verified: 'active',
      rejected: 'deactivated',
    };
    return <StatusBadge status={statusMap[status] || 'pending'} size="sm" />;
  };

  if (documents.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-navy-900 mb-2">No documents found</h3>
        <p className="text-gray-600">
          No documents to display for the selected filters.
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
                Document Type
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Submitted
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {documents.map((document) => (
              <tr key={document.id} className="hover:bg-gray-50 transition-colors">
                {/* Reservist Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-navy-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-navy-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-navy-900">
                        {document.reservist.first_name} {document.reservist.middle_name ? `${document.reservist.middle_name} ` : ''}{document.reservist.last_name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {document.reservist.service_number} • {document.reservist.company || 'No Company'}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Document Type */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 text-gray-400 mr-2" />
                    <div>
                      <div className="text-sm font-medium text-navy-900">{document.document_type}</div>
                      <div className="text-xs text-gray-500">{document.file_name}</div>
                    </div>
                  </div>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(document.status)}
                  {document.validated_at && (
                    <div className="text-xs text-gray-500 mt-1">
                      {timeAgo(document.validated_at)}
                    </div>
                  )}
                </td>

                {/* Submitted */}
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-gray-400" />
                    <span className="font-medium">{timeAgo(document.created_at)}</span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onView(document)}
                      className="p-2 text-info hover:bg-info-light rounded-lg transition-all hover:scale-105"
                      title="View document"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {/* Pending Status Actions */}
                    {document.status === 'pending' && (
                      <>
                        <button
                          onClick={() => onValidate(document)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all hover:scale-105"
                          title="Validate document"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onReject(document)}
                          className="p-2 text-error hover:bg-error-light rounded-lg transition-all hover:scale-105"
                          title="Reject document"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
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
