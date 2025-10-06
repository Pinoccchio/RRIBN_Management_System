'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  UserCog,
  Building2,
  Users,
  UserCheck,
  FileSearch,
  Shield,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import type { StatCardData } from '@/lib/types/dashboard';
import { logger } from '@/lib/logger';

interface DashboardStats {
  totalAdministrators: number;
  totalCompanies: number;
  systemUsers: number;
  activeAccounts: number;
  auditLogs24h: number;
}

interface Administrator {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  userEmail: string;
  createdAt: string;
}

interface RoleDistribution {
  role: string;
  count: number;
}

interface DashboardData {
  stats: DashboardStats;
  recentAdministrators: Administrator[];
  recentAuditLogs: AuditLog[];
  roleDistribution: RoleDistribution[];
}

export default function SuperAdminDashboardPage() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      logger.info('Fetching super admin dashboard data...', { context: 'SuperAdminDashboardPage' });

      const response = await fetch('/api/super-admin/dashboard-data');
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        logger.success('Super admin dashboard data loaded successfully', {
          context: 'SuperAdminDashboardPage',
          stats: result.data.stats,
        });
      } else {
        const errorMsg = result.error || 'Failed to fetch dashboard data';
        setError(errorMsg);
        logger.error('Failed to fetch dashboard data', result.error, {
          context: 'SuperAdminDashboardPage',
        });
      }
    } catch (err) {
      const errorMsg = 'An error occurred while loading dashboard data';
      setError(errorMsg);
      logger.error('Error fetching dashboard data', err, {
        context: 'SuperAdminDashboardPage',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCardData[] = dashboardData
    ? [
        {
          label: 'Total Administrators',
          value: dashboardData.stats.totalAdministrators,
          icon: 'UserCog',
          color: 'primary',
        },
        {
          label: 'Total Companies',
          value: dashboardData.stats.totalCompanies,
          icon: 'Building2',
          color: 'info',
        },
        {
          label: 'System Users',
          value: dashboardData.stats.systemUsers,
          icon: 'Users',
          color: 'success',
        },
        {
          label: 'Active Accounts',
          value: dashboardData.stats.activeAccounts,
          icon: 'UserCheck',
          color: 'success',
        },
        {
          label: 'Audit Logs (24h)',
          value: dashboardData.stats.auditLogs24h,
          icon: 'FileSearch',
          color: 'warning',
        },
      ]
    : [];

  const getStatusBadge = (status: string) => {
    const config = {
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'default' as const, label: 'Inactive' },
      pending: { variant: 'warning' as const, label: 'Pending' },
      deactivated: { variant: 'danger' as const, label: 'Deactivated' },
    };
    return (
      config[status as keyof typeof config] || {
        variant: 'default' as const,
        label: status,
      }
    );
  };

  const getRoleBadge = (role: string) => {
    const config = {
      super_admin: { variant: 'danger' as const, label: 'Super Admin' },
      admin: { variant: 'primary' as const, label: 'Admin' },
      staff: { variant: 'info' as const, label: 'Staff' },
      reservist: { variant: 'default' as const, label: 'Reservist' },
    };
    return (
      config[role as keyof typeof config] || {
        variant: 'default' as const,
        label: role,
      }
    );
  };

  return (
    <div>
      <PageHeader
        title="Super Admin Dashboard"
        description="System-wide overview and administrator management"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">Error loading dashboard data</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))
          : statCards.map((stat, index) => <StatCard key={index} data={stat} />)}
      </div>

      {/* First Row: Recent Administrators & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Administrators */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <UserCog className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Recent Administrators</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.recentAdministrators.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentAdministrators.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-navy-900">{admin.name}</p>
                    <p className="text-sm text-gray-600">{admin.email}</p>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getRoleBadge(admin.role).variant} size="sm">
                      {getRoleBadge(admin.role).label}
                    </Badge>
                    <br />
                    <Badge variant={getStatusBadge(admin.status).variant} size="sm">
                      {getStatusBadge(admin.status).label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No administrators found</p>
          )}
        </Card>

        {/* Recent Audit Logs */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <FileSearch className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Recent Audit Logs</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.recentAuditLogs.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentAuditLogs.map((log) => (
                <div key={log.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-semibold text-navy-900 text-sm">{log.action}</p>
                    <span className="text-xs text-gray-500 px-2 py-0.5 bg-gray-200 rounded">
                      {log.entityType}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{log.userEmail}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No audit logs found</p>
          )}
        </Card>
      </div>

      {/* Second Row: Role Distribution & System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Role Distribution */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Role Distribution</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.roleDistribution.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.roleDistribution.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={getRoleBadge(item.role).variant} size="sm">
                      {getRoleBadge(item.role).label}
                    </Badge>
                  </div>
                  <span className="text-lg font-bold text-navy-900">{item.count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No role data available</p>
          )}
        </Card>

        {/* System Status */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">System Status</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-green-900">Database</span>
                </div>
                <Badge variant="success" size="sm">Online</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-green-900">Authentication</span>
                </div>
                <Badge variant="success" size="sm">Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium text-green-900">Audit Logging</span>
                </div>
                <Badge variant="success" size="sm">Recording</Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Active Sessions</p>
                  <p className="text-xs text-blue-700 mt-1">Last 24 hours</p>
                </div>
                <span className="text-2xl font-bold text-blue-900">
                  {dashboardData.stats.auditLogs24h}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">System status unavailable</p>
          )}
        </Card>
      </div>
    </div>
  );
}
