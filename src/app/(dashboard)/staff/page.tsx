'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { StatCardData } from '@/lib/types/dashboard';
import { Shield, FileCheck, GraduationCap, ClipboardList } from 'lucide-react';
import { CompanyBadgeList } from '@/components/ui/CompanyBadge';

interface StaffData {
  firstName: string;
  lastName: string;
  assignedCompanies: string[];
  position: string | null;
  employeeId: string | null;
}

interface DashboardStats {
  totalReservists: number;
  pendingDocuments: number;
  upcomingTrainings: number;
  pendingActions: number;
}

export default function StaffDashboardPage() {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch staff details and stats in parallel
        const [staffResponse, statsResponse] = await Promise.all([
          fetch('/api/staff/me'),
          fetch('/api/staff/stats'),
        ]);

        if (staffResponse.ok) {
          const staffResult = await staffResponse.json();
          if (staffResult.success) {
            setStaffData(staffResult.data);
          }
        }

        if (statsResponse.ok) {
          const statsResult = await statsResponse.json();
          if (statsResult.success) {
            setStats(statsResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform stats for StatCard components
  const statCards: StatCardData[] = [
    {
      label: 'Total Reservists',
      value: stats?.totalReservists?.toString() || '0',
      change: 0,
      changeLabel: 'in your companies',
      icon: 'Shield',
      trend: 'neutral',
      color: 'primary',
    },
    {
      label: 'Pending Documents',
      value: stats?.pendingDocuments?.toString() || '0',
      change: 0,
      changeLabel: 'awaiting validation',
      icon: 'FileCheck',
      trend: 'neutral',
      color: 'warning',
    },
    {
      label: 'Upcoming Trainings',
      value: stats?.upcomingTrainings?.toString() || '0',
      change: 0,
      changeLabel: 'scheduled',
      icon: 'GraduationCap',
      trend: 'neutral',
      color: 'info',
    },
    {
      label: 'Pending Actions',
      value: stats?.pendingActions?.toString() || '0',
      change: 0,
      changeLabel: 'require attention',
      icon: 'ClipboardList',
      trend: 'neutral',
      color: 'success',
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <PageHeader
          title={`Welcome, ${staffData?.firstName || 'Staff Member'}!`}
          description={staffData?.position || 'Company Manager'}
          breadcrumbs={[{ label: 'Dashboard' }]}
        />

        {/* Assigned Companies */}
        {staffData && staffData.assignedCompanies.length > 0 && (
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Your Assigned Companies:</p>
            <CompanyBadgeList
              companyCodes={staffData.assignedCompanies}
              size="md"
              maxDisplay={10}
            />
          </div>
        )}
      </div>

      {/* Stats Overview */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <StatCard key={index} data={stat} />
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card variant="elevated" padding="lg" className="mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/staff/reservists"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <Shield className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Manage Reservists</h3>
            <p className="text-sm text-gray-600">View and update reservist records</p>
          </a>

          <a
            href="/staff/documents"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <FileCheck className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Validate Documents</h3>
            <p className="text-sm text-gray-600">Review and approve submissions</p>
          </a>

          <a
            href="/staff/training"
            className="p-4 border-2 border-gray-200 rounded-lg hover:border-navy-500 hover:shadow-md transition-all"
          >
            <GraduationCap className="w-8 h-8 text-navy-600 mb-2" />
            <h3 className="font-semibold text-navy-900 mb-1">Training Management</h3>
            <p className="text-sm text-gray-600">Create and track company trainings</p>
          </a>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card variant="elevated" padding="lg">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <ClipboardList className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>No recent activity</p>
          <p className="text-sm mt-1">Your company activity will appear here</p>
        </div>
      </Card>
    </div>
  );
}
