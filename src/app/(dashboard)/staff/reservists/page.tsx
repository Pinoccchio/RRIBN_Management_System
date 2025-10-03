'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Shield } from 'lucide-react';

export default function StaffReservistsPage() {
  return (
    <div>
      <PageHeader
        title="Reservists"
        description="Manage reservists in your assigned companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Reservists' },
        ]}
      />

      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <Shield className="w-16 h-16 mx-auto mb-4 text-navy-400" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Reservists Management</h3>
          <p className="text-gray-600 mb-4">Coming Soon</p>
          <p className="text-sm text-gray-500">
            View and manage reservists in your assigned companies
          </p>
        </div>
      </Card>
    </div>
  );
}
