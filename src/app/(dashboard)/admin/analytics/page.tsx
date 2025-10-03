import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';

export default function AnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Analytics"
        description="AI-powered promotion recommendations and insights"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Analytics' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Prescriptive Analytics</h3>
          <p className="text-gray-600 mb-6">
            AI-powered promotion recommendations, eligibility checks, cross-company comparisons, and data-driven insights for making promotion decisions across the battalion.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: AI promotion analytics
          </div>
        </div>
      </div>
    </div>
  );
}
