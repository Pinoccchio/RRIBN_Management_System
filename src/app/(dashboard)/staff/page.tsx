'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { StatCardData } from '@/lib/types/dashboard';
import { Shield, FileCheck, GraduationCap, ClipboardList, Activity } from 'lucide-react';
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

interface RecentActivity {
  id: string;
  action: string;
  entityType: string;
  userName: string;
  timestamp: string;
}

export default function StaffDashboardPage() {
  const [staffData, setStaffData] = useState<StaffData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Fetch staff details, stats, and recent activity in parallel
        const [staffResponse, statsResponse, activityResponse] = await Promise.all([
          fetch('/api/staff/me'),
          fetch('/api/staff/stats'),
          fetch('/api/staff/recent-activity'),
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

        if (activityResponse.ok) {
          const activityResult = await activityResponse.json();
          if (activityResult.success) {
            setRecentActivity(activityResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingActivity(false);
      }
    };

    fetchData();
  }, []);

  // Format timestamp for display
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format activity action for display
  const formatAction = (activity: RecentActivity): string => {
    const actionMap: Record<string, string> = {
      'CREATE': 'created',
      'UPDATE': 'updated',
      'DELETE': 'deleted',
      'SUBMIT': 'submitted',
      'APPROVE': 'approved',
      'REJECT': 'rejected',
    };

    const entityMap: Record<string, string> = {
      'reservist': 'reservist record',
      'document': 'document',
      'training': 'training session',
      'rids': 'RIDS form',
      'profile': 'profile',
    };

    const action = actionMap[activity.action.toUpperCase()] || activity.action.toLowerCase();
    const entity = entityMap[activity.entityType.toLowerCase()] || activity.entityType.toLowerCase();

    return `${action} a ${entity}`;
  };

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

        {isLoadingActivity ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3 p-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-navy-100 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-navy-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">{activity.userName}</span>
                    {' '}
                    {formatAction(activity)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimestamp(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p>No recent activity</p>
            <p className="text-sm mt-1">Activity from the last 7 days will appear here</p>
          </div>
        )}
      </Card>
    </div>
  );
}
