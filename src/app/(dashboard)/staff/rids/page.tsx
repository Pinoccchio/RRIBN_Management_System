'use client';

import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { FileUser } from 'lucide-react';

export default function StaffRIDSPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="RIDS Management"
        description="Reservist Information Data Sheet"
      />

      {/* Placeholder Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
        <div className="text-center max-w-2xl mx-auto">
          <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileUser className="w-12 h-12 text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold text-navy-900 mb-4">
            RIDS Management System
          </h2>

          <p className="text-gray-600 mb-6">
            The Reservist Information Data Sheet (RIDS) management system is currently under development.
            This feature will allow staff to create, manage, and maintain comprehensive personnel records
            for all reservists in the battalion.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left">
            <h3 className="font-semibold text-blue-900 mb-3">Planned Features:</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Create and edit comprehensive reservist information sheets</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Track promotion history, training, awards, and decorations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Manage biometric data and supporting documents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Review and approval workflow for staff and administrators</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Export RIDS forms for official use</span>
              </li>
            </ul>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            This feature will be available in a future update.
          </p>
        </div>
      </div>
    </div>
  );
}
