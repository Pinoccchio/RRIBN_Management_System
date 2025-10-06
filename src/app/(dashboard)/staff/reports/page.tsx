'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import {
  Shield,
  GraduationCap,
  FileCheck,
  FileText,
  Building2,
  Clock,
} from 'lucide-react';

const REPORT_PLACEHOLDERS = [
  {
    title: 'Reservist Status Report',
    description: 'View status distribution and account information by company',
    icon: Shield,
    color: 'text-blue-600',
  },
  {
    title: 'Training Completion Report',
    description: 'Track training sessions, attendance, and completion rates',
    icon: GraduationCap,
    color: 'text-green-600',
  },
  {
    title: 'Training Hours Summary',
    description: 'View total training hours per reservist (PRIMARY METRIC for promotions)',
    icon: Clock,
    color: 'text-purple-600',
  },
  {
    title: 'Document Processing Report',
    description: 'Monitor document submissions, validations, and processing status',
    icon: FileCheck,
    color: 'text-orange-600',
  },
  {
    title: 'RIDS Submission Report',
    description: 'Track RIDS form completion and submission status',
    icon: FileText,
    color: 'text-red-600',
  },
  {
    title: 'Company Strength Report',
    description: 'View company strength, rank distribution, and readiness summary',
    icon: Building2,
    color: 'text-indigo-600',
  },
];

export default function StaffReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and export company-specific operational reports"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Reports' },
        ]}
      />

      <div className="mb-6">
        <h2 className="text-lg font-semibold text-navy-900 mb-2">
          Available Reports
        </h2>
        <p className="text-sm text-gray-600">
          Report generation functionality coming soon. All reports will be filtered to your assigned companies only.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPORT_PLACEHOLDERS.map((report, index) => {
          const Icon = report.icon;

          return (
            <Card
              key={index}
              variant="elevated"
              padding="lg"
              className="cursor-not-allowed opacity-75"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 bg-gray-50 rounded-lg ${report.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                    Coming Soon
                  </div>
                </div>

                <h3 className="text-lg font-bold text-navy-900 mb-2">{report.title}</h3>
                <p className="text-sm text-gray-600 mb-4 flex-grow">{report.description}</p>

                <div className="w-full px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-center">
                  <span className="text-sm font-medium">Under Development</span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
