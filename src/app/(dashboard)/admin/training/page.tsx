import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';

export default function TrainingPage() {
  return (
    <div>
      <PageHeader
        title="Training"
        description="Manage training sessions and programs"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Training' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Training Management</h3>
          <p className="text-gray-600 mb-6">
            Create system-wide training sessions, manage attendance, track completion status, and monitor training requirements across all companies.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: Training management
          </div>
        </div>
      </div>
    </div>
  );
}
