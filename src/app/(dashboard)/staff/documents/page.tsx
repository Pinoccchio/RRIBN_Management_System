'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { FileCheck } from 'lucide-react';

export default function StaffDocumentsPage() {
  return (
    <div>
      <PageHeader
        title="Documents"
        description="Validate documents from reservists"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Documents' },
        ]}
      />

      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <FileCheck className="w-16 h-16 mx-auto mb-4 text-navy-400" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Document Validation</h3>
          <p className="text-gray-600 mb-4">Coming Soon</p>
          <p className="text-sm text-gray-500">
            Review and approve document submissions
          </p>
        </div>
      </Card>
    </div>
  );
}
