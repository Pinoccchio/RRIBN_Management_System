'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { GraduationCap } from 'lucide-react';

export default function StaffTrainingPage() {
  return (
    <div>
      <PageHeader
        title="Training"
        description="Create and manage company trainings"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Training' },
        ]}
      />

      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <GraduationCap className="w-16 h-16 mx-auto mb-4 text-navy-400" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Training Management</h3>
          <p className="text-gray-600 mb-4">Coming Soon</p>
          <p className="text-sm text-gray-500">
            Create and track training sessions for your companies
          </p>
        </div>
      </Card>
    </div>
  );
}
