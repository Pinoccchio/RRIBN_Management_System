import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';

export default function OversightPage() {
  return (
    <div>
      <PageHeader
        title="Oversight"
        description="Monitor all system activities and operations"
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Oversight' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">System Oversight</h3>
          <p className="text-gray-600 mb-6">
            This page will contain read-only monitoring of all system activities including companies, staff, reservists, and training operations across the battalion.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: Monitor system activities
          </div>
        </div>
      </div>
    </div>
  );
}
