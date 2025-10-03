'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Megaphone } from 'lucide-react';

export default function StaffAnnouncementsPage() {
  return (
    <div>
      <PageHeader
        title="Announcements"
        description="Create and manage company announcements"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Announcements' },
        ]}
      />

      <Card variant="elevated" padding="lg">
        <div className="text-center py-12">
          <Megaphone className="w-16 h-16 mx-auto mb-4 text-navy-400" />
          <h3 className="text-xl font-bold text-navy-900 mb-2">Announcements</h3>
          <p className="text-gray-600 mb-4">Coming Soon</p>
          <p className="text-sm text-gray-500">
            Create announcements for your assigned companies
          </p>
        </div>
      </Card>
    </div>
  );
}
