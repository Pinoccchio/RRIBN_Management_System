import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';

export default function ReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Battalion-wide reports and analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Reports' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Battalion Reports</h3>
          <p className="text-gray-600 mb-6">
            Generate and view comprehensive battalion reports including personnel status, training compliance, document validation, and operational readiness across all companies.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: Battalion reports
          </div>
        </div>
      </div>
    </div>
  );
}
