import React from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { StatCardData } from '@/lib/types/dashboard';

export default function SuperAdminDashboard() {
  // Mock data for stat cards
  const stats: StatCardData[] = [
    {
      label: 'Total Administrators',
      value: '12',
      change: 8.2,
      changeLabel: 'from last month',
      icon: 'UserCog',
      trend: 'up',
      color: 'primary',
    },
    {
      label: 'System Health',
      value: '98%',
      change: 2.4,
      changeLabel: 'from last week',
      icon: 'Activity',
      trend: 'up',
      color: 'success',
    },
    {
      label: 'Total Users',
      value: '1,294',
      change: 5.1,
      changeLabel: 'from last month',
      icon: 'Users',
      trend: 'up',
      color: 'info',
    },
    {
      label: 'Security Status',
      value: 'Secure',
      change: 0,
      changeLabel: 'All systems operational',
      icon: 'Shield',
      trend: 'neutral',
      color: 'warning',
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Monitor system health and manage administrator accounts"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} data={stat} />
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/super-admin/administrators"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">Create Administrator</h3>
                <p className="text-sm text-gray-600">Add new admin account</p>
              </div>
            </div>
          </a>

          <a
            href="/super-admin/analytics"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">View Analytics</h3>
                <p className="text-sm text-gray-600">System metrics</p>
              </div>
            </div>
          </a>

          <a
            href="/super-admin/audit-logs"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-yellow-500 hover:bg-yellow-50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-navy-900">View Audit Logs</h3>
                <p className="text-sm text-gray-600">System activity</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-navy-900 mb-4">Recent System Activity</h2>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-900">
                  <span className="font-semibold">Admin User {item}</span> created a new administrator account
                </p>
                <p className="text-xs text-gray-500 mt-1">{item} minutes ago</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
