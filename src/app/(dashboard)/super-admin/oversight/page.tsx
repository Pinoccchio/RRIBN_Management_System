'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { StatCard } from '@/components/dashboard/stats/StatCard';
import { ReportTable, TableColumn } from '@/components/dashboard/reports/ReportTable';
import { ExportPDFButton } from '@/components/dashboard/reports/ExportPDFButton';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import {
  UserCheck,
  FileCheck,
  FileText,
  GraduationCap,
  Activity,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { format } from 'date-fns';
import { generateFileName } from '@/lib/utils/report-generator';
import { logger } from '@/lib/logger';
import type { StatCardData } from '@/lib/types/dashboard';

interface OversightStats {
  pendingAccounts: number;
  pendingDocuments: number;
  pendingRIDS: number;
  activeTrainingSessions: number;
}

interface AccountStatusChange {
  id: string;
  accountName: string;
  role: string;
  fromStatus: string;
  toStatus: string;
  action: string;
  changedBy: string;
  changedAt: string;
  entityId: string;
}

interface DocumentQueueItem {
  id: string;
  reservistName: string;
  documentType: string;
  status: string;
  submittedDate: string;
  daysPending: number;
  company?: string;
}

interface CompanyDistributionItem {
  id: string;
  code: string;
  name: string;
  reservistCount: number;
  staffCount: number;
  isActive: boolean;
}

interface OversightData {
  stats: OversightStats;
  accountStatusChanges: AccountStatusChange[];
  documentQueue: DocumentQueueItem[];
  companyDistribution: CompanyDistributionItem[];
}

export default function OversightPage() {
  const [data, setData] = useState<OversightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');
  const [companyFilter, setCompanyFilter] = useState('all');

  useEffect(() => {
    fetchOversightData();
  }, [dateRange, companyFilter]);

  const fetchOversightData = async () => {
    try {
      setLoading(true);
      logger.info('Fetching oversight data...', {
        dateRange,
        companyFilter,
      });

      const params = new URLSearchParams({
        date_range: dateRange,
        company: companyFilter,
      });

      const response = await fetch(`/api/super-admin/oversight-data?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        logger.success('Fetched oversight data', {
          stats: result.data.stats,
        });
      } else {
        logger.error('Failed to fetch oversight data', result.error);
      }
    } catch (error) {
      logger.error('Error fetching oversight data', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards: StatCardData[] = data
    ? [
        {
          label: 'Pending Accounts',
          value: data.stats.pendingAccounts,
          icon: 'UserCheck',
          color: 'warning',
        },
        {
          label: 'Pending Documents',
          value: data.stats.pendingDocuments,
          icon: 'FileCheck',
          color: 'warning',
        },
        {
          label: 'Pending RIDS',
          value: data.stats.pendingRIDS,
          icon: 'FileText',
          color: 'warning',
        },
        {
          label: 'Active Trainings',
          value: data.stats.activeTrainingSessions,
          icon: 'GraduationCap',
          color: 'info',
        },
      ]
    : [];

  const getStatusBadge = (status: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      pending: { variant: 'warning', label: 'Pending' },
      active: { variant: 'success', label: 'Active' },
      inactive: { variant: 'default', label: 'Inactive' },
      deactivated: { variant: 'danger', label: 'Deactivated' },
      approved: { variant: 'success', label: 'Approved' },
      rejected: { variant: 'danger', label: 'Rejected' },
      verified: { variant: 'success', label: 'Verified' },
    };
    return config[status] || { variant: 'default', label: status };
  };

  const getActionBadge = (action: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      approve: { variant: 'success', label: 'Approve' },
      reject: { variant: 'danger', label: 'Reject' },
      update: { variant: 'info', label: 'Update' },
      create: { variant: 'success', label: 'Create' },
    };
    return config[action] || { variant: 'default', label: action };
  };

  const formatRole = (role: string) => {
    const roleMap: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      staff: 'Staff',
      reservist: 'Reservist',
    };
    return roleMap[role] || role;
  };

  const formatDocumentType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Account Status Changes columns
  const statusChangesColumns: TableColumn[] = [
    {
      key: 'changedAt',
      label: 'Date',
      width: '150px',
      format: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm'),
    },
    {
      key: 'accountName',
      label: 'Account',
      width: '200px',
    },
    {
      key: 'role',
      label: 'Role',
      width: '120px',
      format: (value) => formatRole(value),
    },
    {
      key: 'fromStatus',
      label: 'From',
      width: '120px',
      format: (value) => {
        const badge = getStatusBadge(value);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: 'toStatus',
      label: 'To',
      width: '120px',
      format: (value) => {
        const badge = getStatusBadge(value);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: 'action',
      label: 'Action',
      width: '100px',
      format: (value) => {
        const badge = getActionBadge(value);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: 'changedBy',
      label: 'Changed By',
      width: '180px',
    },
  ];

  // Document Queue columns
  const documentQueueColumns: TableColumn[] = [
    {
      key: 'reservistName',
      label: 'Reservist',
      width: '200px',
    },
    {
      key: 'documentType',
      label: 'Document Type',
      width: '200px',
      format: (value) => formatDocumentType(value),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      format: (value) => {
        const badge = getStatusBadge(value);
        return (
          <Badge variant={badge.variant} size="sm">
            {badge.label}
          </Badge>
        );
      },
    },
    {
      key: 'submittedDate',
      label: 'Submitted',
      width: '150px',
      format: (value) => format(new Date(value), 'MMM dd, yyyy'),
    },
    {
      key: 'daysPending',
      label: 'Days Pending',
      width: '120px',
      format: (value) => {
        const days = value as number;
        return (
          <span className={days > 14 ? 'text-red-600 font-semibold' : ''}>
            {days} {days === 1 ? 'day' : 'days'}
          </span>
        );
      },
    },
  ];

  // Company Distribution columns
  const companyDistributionColumns: TableColumn[] = [
    {
      key: 'code',
      label: 'Code',
      width: '100px',
    },
    {
      key: 'name',
      label: 'Company Name',
      width: '250px',
    },
    {
      key: 'reservistCount',
      label: 'Reservists',
      width: '120px',
      format: (value) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: 'staffCount',
      label: 'Staff',
      width: '100px',
      format: (value) => (
        <span className="font-semibold">{value}</span>
      ),
    },
    {
      key: 'isActive',
      label: 'Status',
      width: '120px',
      format: (value) => (
        <Badge variant={value ? 'success' : 'default'} size="sm">
          {value ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // PDF export data
  const statusChangesPdfColumns = [
    { header: 'Date', dataKey: 'changedAt' },
    { header: 'Account', dataKey: 'accountName' },
    { header: 'Role', dataKey: 'role' },
    { header: 'From Status', dataKey: 'fromStatus' },
    { header: 'To Status', dataKey: 'toStatus' },
    { header: 'Action', dataKey: 'action' },
    { header: 'Changed By', dataKey: 'changedBy' },
  ];

  const documentQueuePdfColumns = [
    { header: 'Reservist', dataKey: 'reservistName' },
    { header: 'Document Type', dataKey: 'documentType' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Submitted', dataKey: 'submittedDate' },
    { header: 'Days Pending', dataKey: 'daysPending' },
  ];

  const companyDistributionPdfColumns = [
    { header: 'Code', dataKey: 'code' },
    { header: 'Company Name', dataKey: 'name' },
    { header: 'Reservists', dataKey: 'reservistCount' },
    { header: 'Staff', dataKey: 'staffCount' },
    { header: 'Status', dataKey: 'status' },
  ];

  const statusChangesPdfData = data
    ? data.accountStatusChanges.map((change) => ({
        ...change,
        changedAt: format(new Date(change.changedAt), 'MMM dd, yyyy HH:mm'),
        role: formatRole(change.role),
      }))
    : [];

  const documentQueuePdfData = data
    ? data.documentQueue.map((doc) => ({
        ...doc,
        documentType: formatDocumentType(doc.documentType),
        submittedDate: format(new Date(doc.submittedDate), 'MMM dd, yyyy'),
      }))
    : [];

  const companyDistributionPdfData = data
    ? data.companyDistribution.map((company) => ({
        ...company,
        status: company.isActive ? 'Active' : 'Inactive',
      }))
    : [];

  return (
    <div>
      <PageHeader
        title="System Oversight"
        description="Monitor pending actions, validation queues, and system-wide activity"
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Oversight' },
        ]}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))
          : statCards.map((stat, index) => <StatCard key={index} data={stat} />)}
      </div>

      {/* Filters Card */}
      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Select
              label="Date Range"
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: '7', label: 'Last 7 days' },
                { value: '30', label: 'Last 30 days' },
                { value: '90', label: 'Last 90 days' },
              ]}
            />
            <Select
              label="Company"
              value={companyFilter}
              onChange={setCompanyFilter}
              options={[
                { value: 'all', label: 'All Companies' },
                ...(data?.companyDistribution || [])
                  .filter((c) => c.isActive)
                  .map((company) => ({
                    value: company.code,
                    label: `${company.code} - ${company.name}`,
                  })),
              ]}
            />
          </div>
          <Button variant="outline" onClick={fetchOversightData}>
            Refresh
          </Button>
        </div>
      </Card>

      {/* Account Status Changes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-navy-600" />
            <h2 className="text-xl font-bold text-navy-900">Recent Account Status Changes</h2>
          </div>
          {!loading && data && data.accountStatusChanges.length > 0 && (
            <ExportPDFButton
              reportTitle="Account Status Changes"
              reportSubtitle="System-wide account activity"
              company="All Companies"
              columns={statusChangesPdfColumns}
              data={statusChangesPdfData}
              filename={generateFileName('Account_Status_Changes', 'System')}
            />
          )}
        </div>
        <ReportTable
          columns={statusChangesColumns}
          data={data?.accountStatusChanges || []}
          loading={loading}
          emptyMessage="No account status changes found"
        />
      </div>

      {/* Document Validation Queue */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-navy-600" />
            <h2 className="text-xl font-bold text-navy-900">Document Validation Queue</h2>
          </div>
          {!loading && data && data.documentQueue.length > 0 && (
            <ExportPDFButton
              reportTitle="Document Validation Queue"
              reportSubtitle="Pending and rejected documents"
              company="All Companies"
              columns={documentQueuePdfColumns}
              data={documentQueuePdfData}
              filename={generateFileName('Document_Validation_Queue', 'System')}
            />
          )}
        </div>
        <ReportTable
          columns={documentQueueColumns}
          data={data?.documentQueue || []}
          loading={loading}
          emptyMessage="No pending documents"
        />
        {!loading && data && data.documentQueue.some((doc) => doc.daysPending > 14) && (
          <div className="mt-4 flex items-start gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-semibold text-yellow-900">Attention Required</p>
              <p className="text-sm text-yellow-700">
                Some documents have been pending for more than 14 days
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Company Distribution */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-navy-600" />
            <h2 className="text-xl font-bold text-navy-900">Company Personnel Distribution</h2>
          </div>
          {!loading && data && data.companyDistribution.length > 0 && (
            <ExportPDFButton
              reportTitle="Company Distribution"
              reportSubtitle="Battalion-wide personnel overview"
              company="All Companies"
              columns={companyDistributionPdfColumns}
              data={companyDistributionPdfData}
              filename={generateFileName('Company_Distribution', 'System')}
            />
          )}
        </div>
        <ReportTable
          columns={companyDistributionColumns}
          data={data?.companyDistribution || []}
          loading={loading}
          emptyMessage="No company data available"
        />
      </div>
    </div>
  );
}
