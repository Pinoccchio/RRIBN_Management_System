'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  Users,
  UserCheck,
  FileText,
  Calendar,
  Clock,
  Megaphone,
} from 'lucide-react';
import { format } from 'date-fns';
import type { StatCardData } from '@/lib/types/dashboard';
import { logger } from '@/lib/logger';

interface DashboardStats {
  totalCompanies: number;
  activeStaff: number;
  totalReservists: number;
  activeReservists: number;
  pendingDocuments: number;
  upcomingTrainings: number;
  activeAnnouncements: number;
}

interface Reservist {
  id: string;
  name: string;
  rank: string;
  company: string;
  accountStatus: string;
  createdAt: string;
}

interface TrainingSession {
  id: string;
  title: string;
  company: string | null;
  scheduled_date: string;
  status: string;
}

interface Document {
  id: string;
  documentType: string;
  reservistName: string;
  createdAt: string;
  status: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  published_at: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentReservists: Reservist[];
  upcomingTraining: TrainingSession[];
  pendingDocuments: Document[];
  recentAnnouncements: Announcement[];
}

export default function AdminDashboardPage() {
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
      logger.info('Fetching admin dashboard data...', { context: 'AdminDashboardPage' });

      const response = await fetch('/api/admin/dashboard-data');
      const result = await response.json();

      if (result.success) {
        setDashboardData(result.data);
        logger.success('Admin dashboard data loaded successfully', {
          context: 'AdminDashboardPage',
          stats: result.data.stats,
        });
      } else {
        const errorMsg = result.error || 'Failed to fetch dashboard data';
        setError(errorMsg);
        logger.error('Failed to fetch dashboard data', result.error, {
          context: 'AdminDashboardPage',
        });
      }
    } catch (err) {
      const errorMsg = 'An error occurred while loading dashboard data';
      setError(errorMsg);
      logger.error('Error fetching dashboard data', err, {
        context: 'AdminDashboardPage',
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCardData[] = dashboardData
    ? [
        {
          label: 'Total Companies',
          value: dashboardData.stats.totalCompanies,
          icon: 'Building2',
          color: 'primary',
        },
        {
          label: 'Active Staff',
          value: dashboardData.stats.activeStaff,
          icon: 'Users',
          color: 'success',
        },
        {
          label: 'Total Reservists',
          value: dashboardData.stats.totalReservists,
          icon: 'UserCheck',
          color: 'info',
        },
        {
          label: 'Pending Documents',
          value: dashboardData.stats.pendingDocuments,
          icon: 'FileText',
          color: 'warning',
        },
        {
          label: 'Upcoming Trainings',
          value: dashboardData.stats.upcomingTrainings,
          icon: 'Calendar',
          color: 'primary',
        },
      ]
    : [];

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'Pending' },
      verified: { variant: 'success' as const, label: 'Verified' },
      rejected: { variant: 'danger' as const, label: 'Rejected' },
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'default' as const, label: 'Inactive' },
      deactivated: { variant: 'danger' as const, label: 'Deactivated' },
      scheduled: { variant: 'info' as const, label: 'Scheduled' },
      ongoing: { variant: 'primary' as const, label: 'Ongoing' },
      completed: { variant: 'success' as const, label: 'Completed' },
      cancelled: { variant: 'danger' as const, label: 'Cancelled' },
    };
    return (
      config[status as keyof typeof config] || {
        variant: 'default' as const,
        label: status,
      }
    );
  };

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { variant: 'danger' as const, label: 'Urgent' },
      high: { variant: 'warning' as const, label: 'High' },
      normal: { variant: 'info' as const, label: 'Normal' },
      low: { variant: 'default' as const, label: 'Low' },
    };
    return config[priority as keyof typeof config] || config.normal;
  };

  return (
    <div>
      <PageHeader
        title="Administrator Dashboard"
        description="Battalion-wide overview and management operations"
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

      {/* First Row: Recent Reservists & Upcoming Training */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Reservists */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Recent Reservists</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.recentReservists.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentReservists.map((reservist) => (
                <div
                  key={reservist.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-navy-900">{reservist.name}</p>
                    <p className="text-sm text-gray-600">
                      {reservist.rank} • {reservist.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={getStatusBadge(reservist.accountStatus).variant}
                      size="sm"
                    >
                      {getStatusBadge(reservist.accountStatus).label}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No reservists found</p>
          )}
        </Card>

        {/* Upcoming Training */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Upcoming Training</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.upcomingTraining.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.upcomingTraining.map((training) => (
                <div key={training.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-navy-900">{training.title}</p>
                    <Badge
                      variant={getStatusBadge(training.status).variant}
                      size="sm"
                    >
                      {getStatusBadge(training.status).label}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {format(new Date(training.scheduled_date), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  {training.company && (
                    <p className="text-sm text-gray-600 mt-1">
                      Company: {training.company}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming training sessions</p>
          )}
        </Card>
      </div>

      {/* Second Row: Pending Documents & Recent Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Documents */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Pending Documents</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.pendingDocuments.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.pendingDocuments.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-navy-900">{doc.documentType}</p>
                    <p className="text-sm text-gray-600">{doc.reservistName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant={getStatusBadge(doc.status).variant} size="sm">
                    {getStatusBadge(doc.status).label}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pending documents</p>
          )}
        </Card>

        {/* Recent Announcements */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Recent Announcements</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : dashboardData && dashboardData.recentAnnouncements.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.recentAnnouncements.map((announcement) => (
                <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-navy-900 flex-1">
                      {announcement.title}
                    </p>
                    <Badge
                      variant={getPriorityBadge(announcement.priority).variant}
                      size="sm"
                    >
                      {getPriorityBadge(announcement.priority).label}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(announcement.published_at), 'MMM dd, yyyy HH:mm')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No announcements</p>
          )}
        </Card>
      </div>
    </div>
  );
}
