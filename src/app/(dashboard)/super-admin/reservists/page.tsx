import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';

export default function ReservistsPage() {
  return (
    <div>
      <PageHeader
        title="Reservist Oversight"
        description="Full oversight of all reservist records, status, and documents across companies."
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Reservists' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Reservist Management</h3>
          <p className="text-gray-600 mb-6">
            This page will contain comprehensive reservist oversight including status monitoring, document validation, and company assignments.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: View, monitor, and manage all reservist records
          </div>
        </div>
      </div>
    </div>
  );
}
