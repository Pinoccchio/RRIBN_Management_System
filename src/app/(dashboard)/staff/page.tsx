'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  Users,
  UserCheck,
  FileText,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Megaphone
} from 'lucide-react';
import { format } from 'date-fns';
import type { StatCardData } from '@/lib/types/dashboard';

interface DashboardStats {
  totalReservists: number;
  activeReservists: number;
  pendingDocuments: number;
  upcomingTrainings: number;
  urgentAnnouncements: number;
  pendingActions: number;
}

interface Reservist {
  id: string;
  firstName: string;
  lastName: string;
  rank: string;
  company: string;
  reservistStatus: string;
  accountStatus: string;
}

interface TrainingSession {
  id: string;
  title: string;
  company: string | null;
  scheduledDate: string;
  status: string;
  trainingCategory: string | null;
  capacity: number | null;
}

interface Document {
  id: string;
  documentType: string;
  status: string;
  createdAt: string;
  reservistName: string;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  publishedAt: string;
}

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [reservists, setReservists] = useState<Reservist[]>([]);
  const [trainings, setTrainings] = useState<TrainingSession[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats
      const statsRes = await fetch('/api/staff/dashboard-stats');
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.data);
      }

      // Fetch reservists
      const reservistsRes = await fetch('/api/staff/reservists');
      const reservistsData = await reservistsRes.json();
      if (reservistsData.success) {
        // Transform nested data to flat structure for dashboard
        const transformedReservists = (reservistsData.data || []).map((r: any) => ({
          id: r.id,
          firstName: r.profile?.first_name || '',
          lastName: r.profile?.last_name || '',
          rank: r.reservist_details?.rank || '',
          company: r.reservist_details?.company || '',
          reservistStatus: r.reservist_details?.reservist_status || '',
          accountStatus: r.status || '',
        }));
        setReservists(transformedReservists.slice(0, 5)); // Top 5
      }

      // Fetch training sessions
      const trainingsRes = await fetch('/api/staff/training-sessions');
      const trainingsData = await trainingsRes.json();
      if (trainingsData.success) {
        setTrainings(trainingsData.data.filter((t: TrainingSession) =>
          ['scheduled', 'ongoing'].includes(t.status)
        ).slice(0, 4)); // Top 4 upcoming
      }

      // Fetch documents
      const docsRes = await fetch('/api/staff/documents?status=pending&limit=100');
      const docsData = await docsRes.json();
      if (docsData.success) {
        // Transform nested data to flat structure for dashboard
        const transformedDocuments = (docsData.data || []).map((d: any) => ({
          id: d.id,
          documentType: d.document_type || '',
          status: d.status || '',
          createdAt: d.created_at || '',
          reservistName: d.reservist
            ? `${d.reservist.first_name} ${d.reservist.last_name}`.trim()
            : 'Unknown',
        }));
        setDocuments(transformedDocuments.slice(0, 5)); // Top 5 pending
      }

      // Fetch announcements
      const announcementsRes = await fetch('/api/staff/announcements?status=active&limit=100');
      const announcementsData = await announcementsRes.json();
      if (announcementsData.success) {
        // Transform snake_case to camelCase for dashboard
        const transformedAnnouncements = (announcementsData.data || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          content: a.content,
          priority: a.priority,
          publishedAt: a.published_at || a.created_at,
        }));
        setAnnouncements(transformedAnnouncements.slice(0, 5)); // Top 5
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCardData[] = stats
    ? [
        {
          label: 'Total Reservists',
          value: stats.totalReservists,
          icon: 'Users',
          color: 'info',
        },
        {
          label: 'Active Reservists',
          value: stats.activeReservists,
          icon: 'UserCheck',
          color: 'success',
        },
        {
          label: 'Pending Documents',
          value: stats.pendingDocuments,
          icon: 'FileText',
          color: 'warning',
        },
        {
          label: 'Upcoming Trainings',
          value: stats.upcomingTrainings,
          icon: 'Calendar',
          color: 'primary',
        },
        {
          label: 'Pending Actions',
          value: stats.pendingActions,
          icon: 'AlertCircle',
          color: 'danger',
        },
      ]
    : [];

  const getPriorityBadge = (priority: string) => {
    const config = {
      urgent: { variant: 'danger' as const, label: 'Urgent' },
      high: { variant: 'warning' as const, label: 'High' },
      normal: { variant: 'info' as const, label: 'Normal' },
      low: { variant: 'default' as const, label: 'Low' },
    };
    return config[priority as keyof typeof config] || config.normal;
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { variant: 'warning' as const, label: 'Pending' },
      verified: { variant: 'success' as const, label: 'Verified' },
      rejected: { variant: 'danger' as const, label: 'Rejected' },
      active: { variant: 'success' as const, label: 'Active' },
      inactive: { variant: 'default' as const, label: 'Inactive' },
      scheduled: { variant: 'info' as const, label: 'Scheduled' },
      ongoing: { variant: 'primary' as const, label: 'Ongoing' },
      completed: { variant: 'success' as const, label: 'Completed' },
    };
    return config[status as keyof typeof config] || { variant: 'default' as const, label: status };
  };

  return (
    <div>
      <PageHeader
        title="Staff Dashboard"
        description="Overview of your assigned company operations"
        breadcrumbs={[{ label: 'Dashboard' }]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))
          : statCards.map((stat, index) => <StatCard key={index} data={stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent Reservists */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Recent Reservists</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : reservists.length > 0 ? (
            <div className="space-y-3">
              {reservists.map((reservist) => (
                <div
                  key={reservist.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-semibold text-navy-900">
                      {reservist.lastName}, {reservist.firstName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reservist.rank} • {reservist.company}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge {...getStatusBadge(reservist.accountStatus)} size="sm" />
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
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : trainings.length > 0 ? (
            <div className="space-y-3">
              {trainings.map((training) => (
                <div key={training.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-navy-900">{training.title}</p>
                    <Badge {...getStatusBadge(training.status)} size="sm" />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(training.scheduledDate), 'MMM dd, yyyy')}</span>
                  </div>
                  {training.company && (
                    <p className="text-sm text-gray-600 mt-1">Company: {training.company}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No upcoming training sessions</p>
          )}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Pending Documents */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Pending Documents</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-navy-900">{doc.documentType}</p>
                    <p className="text-sm text-gray-600">{doc.reservistName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(doc.createdAt), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge {...getStatusBadge(doc.status)} size="sm" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No pending documents</p>
          )}
        </Card>

        {/* Company Announcements */}
        <Card padding="lg">
          <div className="flex items-center gap-2 mb-4">
            <Megaphone className="w-5 h-5 text-navy-600" />
            <h3 className="text-lg font-bold text-navy-900">Company Announcements</h3>
          </div>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
              ))}
            </div>
          ) : announcements.length > 0 ? (
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-navy-900 flex-1">{announcement.title}</p>
                    <Badge {...getPriorityBadge(announcement.priority)} size="sm" />
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                    {announcement.content}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(announcement.publishedAt), 'MMM dd, yyyy HH:mm')}
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
