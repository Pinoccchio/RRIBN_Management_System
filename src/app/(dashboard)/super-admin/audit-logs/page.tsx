'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportTable, TableColumn } from '@/components/dashboard/reports/ReportTable';
import { ExportPDFButton } from '@/components/dashboard/reports/ExportPDFButton';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { generateFileName } from '@/lib/utils/report-generator';
import type { AuditLog, AuditAction } from '@/lib/types/audit-log';
import { logger } from '@/lib/logger';

export default function AuditLogsPage() {
  const [data, setData] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [page, actionFilter, entityTypeFilter, dateFrom, dateTo]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      logger.info('Fetching audit logs...', {
        page,
        actionFilter,
        entityTypeFilter,
        dateFrom,
        dateTo,
      });

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
      });

      if (actionFilter && actionFilter !== 'all') params.append('action', actionFilter);
      if (entityTypeFilter && entityTypeFilter !== 'all')
        params.append('entity_type', entityTypeFilter);
      if (searchQuery) params.append('search', searchQuery);
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);

      const response = await fetch(`/api/super-admin/audit-logs?${params}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setPagination(result.pagination);
        logger.success(`Fetched ${result.data.length} audit logs`, {
          page: result.pagination.page,
          total: result.pagination.total,
        });
      } else {
        logger.error('Failed to fetch audit logs', result.error);
      }
    } catch (error) {
      logger.error('Error fetching audit logs', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1); // Reset to first page
    fetchAuditLogs();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < pagination.totalPages) {
      setPage(page + 1);
    }
  };

  const getActionBadge = (action: string) => {
    const config: Record<string, { variant: any; label: string }> = {
      create: { variant: 'success', label: 'Create' },
      update: { variant: 'info', label: 'Update' },
      delete: { variant: 'danger', label: 'Delete' },
      approve: { variant: 'success', label: 'Approve' },
      reject: { variant: 'danger', label: 'Reject' },
      login: { variant: 'info', label: 'Login' },
      logout: { variant: 'default', label: 'Logout' },
      validate: { variant: 'warning', label: 'Validate' },
    };
    return config[action] || { variant: 'default', label: action };
  };

  const formatEntityType = (entityType: string) => {
    return entityType
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUserDisplay = (log: AuditLog) => {
    if (!log.user_id) {
      return 'System';
    }
    const name = `${log.first_name || ''} ${log.last_name || ''}`.trim();
    return name || log.user_email || 'Unknown';
  };

  const columns: TableColumn[] = [
    {
      key: 'created_at',
      label: 'Timestamp',
      width: '180px',
      format: (value) => format(new Date(value), 'MMM dd, yyyy HH:mm:ss'),
    },
    {
      key: 'user_display',
      label: 'User',
      width: '200px',
      format: (value, row) => {
        if (!row.user_id) {
          return <span className="text-gray-500 italic">System</span>;
        }
        return getUserDisplay(row);
      },
    },
    {
      key: 'action',
      label: 'Action',
      width: '120px',
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
      key: 'entity_type',
      label: 'Entity Type',
      width: '150px',
      format: (value) => formatEntityType(value),
    },
    {
      key: 'entity_id',
      label: 'Entity ID',
      width: '120px',
      format: (value) => (value ? value.substring(0, 8) + '...' : '-'),
    },
  ];

  // PDF export columns
  const pdfColumns = [
    { header: 'Timestamp', dataKey: 'created_at' },
    { header: 'User', dataKey: 'user_display' },
    { header: 'Action', dataKey: 'action' },
    { header: 'Entity Type', dataKey: 'entity_type' },
    { header: 'Entity ID', dataKey: 'entity_id' },
  ];

  // Transform data for PDF export
  const pdfData = data.map((log) => ({
    ...log,
    created_at: format(new Date(log.created_at), 'MMM dd, yyyy HH:mm:ss'),
    user_display: getUserDisplay(log),
    entity_type: formatEntityType(log.entity_type),
    entity_id: log.entity_id || '-',
  }));

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        description="Monitor all system activities, security events, and user actions"
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Audit Logs' },
        ]}
      />

      {/* Filters Card */}
      <Card padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by user or entity ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-10"
              />
            </div>
          </div>

          {/* Action Filter */}
          <div>
            <Select
              label="Action"
              value={actionFilter}
              onChange={setActionFilter}
              options={[
                { value: 'all', label: 'All Actions' },
                { value: 'create', label: 'Create' },
                { value: 'update', label: 'Update' },
                { value: 'delete', label: 'Delete' },
                { value: 'approve', label: 'Approve' },
                { value: 'reject', label: 'Reject' },
                { value: 'login', label: 'Login' },
                { value: 'logout', label: 'Logout' },
                { value: 'validate', label: 'Validate' },
              ]}
            />
          </div>

          {/* Entity Type Filter */}
          <div>
            <Select
              label="Entity Type"
              value={entityTypeFilter}
              onChange={setEntityTypeFilter}
              options={[
                { value: 'all', label: 'All Entities' },
                { value: 'accounts', label: 'Accounts' },
                { value: 'companies', label: 'Companies' },
                { value: 'documents', label: 'Documents' },
                { value: 'profiles', label: 'Profiles' },
                { value: 'reservist_details', label: 'Reservist Details' },
                { value: 'staff_details', label: 'Staff Details' },
                { value: 'training_sessions', label: 'Training Sessions' },
              ]}
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date From
            </label>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date To
            </label>
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>

        {/* Search Button & Export */}
        <div className="flex items-center justify-between">
          <Button variant="primary" onClick={handleSearch}>
            Apply Filters
          </Button>

          {!loading && data.length > 0 && (
            <ExportPDFButton
              reportTitle="Audit Logs"
              reportSubtitle="System activity and security events"
              company="System-wide"
              columns={pdfColumns}
              data={pdfData}
              filename={generateFileName('Audit_Logs', 'System')}
              options={{ orientation: 'landscape' }}
            />
          )}
        </div>
      </Card>

      {/* Summary */}
      {!loading && (
        <div className="mb-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {data.length} of {pagination.total} audit logs
          </span>
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
        </div>
      )}

      {/* Table */}
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No audit logs found"
      />

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={handlePreviousPage}
            disabled={page === 1}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
          >
            Previous
          </Button>
          <span className="px-4 py-2 text-sm text-gray-700">
            Page {page} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={handleNextPage}
            disabled={page === pagination.totalPages}
            rightIcon={<ChevronRight className="w-4 h-4" />}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
