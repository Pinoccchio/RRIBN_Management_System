'use client';

import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { StatCardData } from '@/lib/types/dashboard';
import { Users, Building2, UserCheck, ClipboardList } from 'lucide-react';

export default function AdminDashboardPage() {
  // Stats data
  const stats: StatCardData[] = [
    {
      label: 'Total Companies',
      value: '0',
      change: 0,
      changeLabel: 'from last month',
      icon: 'Building2',
      trend: 'neutral',
      color: 'primary',
    },
    {
      label: 'Active Staff',
      value: '0',
      change: 0,
      changeLabel: 'from last month',
      icon: 'Users',
      trend: 'neutral',
      color: 'success',
    },
    {
      label: 'Total Reservists',
      value: '0',
      change: 0,
      changeLabel: 'from last month',
      icon: 'UserCheck',
      trend: 'neutral',
      color: 'info',
    },
    {
      label: 'Pending Actions',
      value: '0',
      change: 0,
      changeLabel: 'awaiting approval',
      icon: 'ClipboardList',
      trend: 'neutral',
      color: 'warning',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Administrator Dashboard"
        description="Manage companies, staff, and system-wide operations"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/admin/companies"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <Building2 className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Manage Companies</h3>
            <p className="text-sm text-gray-600">Create and configure battalion companies</p>
          </a>
          <a
            href="/admin/staff"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <Users className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Manage Staff</h3>
            <p className="text-sm text-gray-600">Create and oversee staff accounts</p>
          </a>
          <a
            href="/admin/analytics"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <ClipboardList className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Analytics Dashboard</h3>
            <p className="text-sm text-gray-600">AI-powered promotion recommendations</p>
          </a>
        </div>
      </Card>
    </div>
  );
}
