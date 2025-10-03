'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { FileText } from 'lucide-react';

export default function StaffReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="View company-specific reports"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Reports' },
        ]}
      />

      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <FileText className="w-16 h-16 mx-auto mb-4 text-navy-400" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Reports</h3>
          <p className="text-gray-600 mb-4">Coming Soon</p>
          <p className="text-sm text-gray-500">
            Generate and export company reports
          </p>
        </div>
      </Card>
    </div>
  );
}
