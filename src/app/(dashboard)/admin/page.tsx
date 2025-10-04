'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { StatCardData } from '@/lib/types/dashboard';
import { Users, Building2, UserCheck, ClipboardList } from 'lucide-react';
import { logger } from '@/lib/logger';

interface DashboardStats {
  totalCompanies: number;
  activeStaff: number;
  totalReservists: number;
  pendingActions: number;
}

export default function AdminDashboardPage() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalCompanies: 0,
    activeStaff: 0,
    totalReservists: 0,
    pendingActions: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);
        logger.info('Fetching admin dashboard statistics...', { context: 'AdminDashboardPage' });

        const response = await fetch('/api/admin/stats');
        const data = await response.json();

        if (data.success) {
          setDashboardStats(data.data);
          logger.success('Dashboard statistics loaded successfully', {
            context: 'AdminDashboardPage',
            stats: data.data
          });
        } else {
          const errorMsg = data.error || 'Failed to fetch dashboard statistics';
          setError(errorMsg);
          logger.error('Failed to fetch dashboard statistics', data.error, {
            context: 'AdminDashboardPage'
          });
        }
      } catch (err) {
        const errorMsg = 'An error occurred while loading dashboard statistics';
        setError(errorMsg);
        logger.error('Error fetching dashboard statistics', err, { context: 'AdminDashboardPage' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Stats data with real values
  const stats: StatCardData[] = [
    {
      label: 'Total Companies',
      value: isLoading ? '...' : dashboardStats.totalCompanies.toString(),
      change: 0,
      changeLabel: 'from last month',
      icon: 'Building2',
      trend: 'neutral',
      color: 'primary',
    },
    {
      label: 'Active Staff',
      value: isLoading ? '...' : dashboardStats.activeStaff.toString(),
      change: 0,
      changeLabel: 'from last month',
      icon: 'Users',
      trend: 'neutral',
      color: 'success',
    },
    {
      label: 'Total Reservists',
      value: isLoading ? '...' : dashboardStats.totalReservists.toString(),
      change: 0,
      changeLabel: 'from last month',
      icon: 'UserCheck',
      trend: 'neutral',
      color: 'info',
    },
    {
      label: 'Pending Actions',
      value: isLoading ? '...' : dashboardStats.pendingActions.toString(),
      change: 0,
      changeLabel: 'awaiting approval',
      icon: 'ClipboardList',
      trend: dashboardStats.pendingActions > 0 ? 'up' : 'neutral',
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

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error loading dashboard statistics</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

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
