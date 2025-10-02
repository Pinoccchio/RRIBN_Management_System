import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';

export default function StaffPage() {
  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Manage staff members across all companies (Alpha, Bravo, Charlie, HQ, Signal, FAB)."
        action={
          <Button variant="primary" size="md">
            + Add Staff Member
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Staff' },
        ]}
      />

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Staff Management</h3>
          <p className="text-gray-600 mb-6">
            This page will contain staff management features including company assignments, activity monitoring, and access control.
          </p>
          <div className="text-sm text-gray-500">
            Coming soon: View, add, modify, and monitor staff members across all companies
          </div>
        </div>
      </div>
    </div>
  );
}
