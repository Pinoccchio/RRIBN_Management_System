'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportTable, TableColumn } from '@/components/dashboard/reports/ReportTable';
import { ExportPDFButton } from '@/components/dashboard/reports/ExportPDFButton';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { generateFileName } from '@/lib/utils/report-generator';

export default function AdminTrainingReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports/training-summary');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setCompanies(result.companies || []);
      } else {
        console.error('Failed to fetch training data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'title',
      label: 'Training Title',
      width: '250px',
    },
    {
      key: 'date',
      label: 'Date',
      width: '120px',
      format: (value) => {
        if (!value) return '-';
        return format(new Date(value), 'MMM dd, yyyy');
      },
    },
    {
      key: 'location',
      label: 'Location',
      width: '150px',
    },
    {
      key: 'company',
      label: 'Company',
      width: '120px',
    },
    {
      key: 'category',
      label: 'Category',
      width: '120px',
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      format: (value) => {
        const config = {
          scheduled: { variant: 'info' as const, label: 'Scheduled' },
          ongoing: { variant: 'primary' as const, label: 'Ongoing' },
          completed: { variant: 'success' as const, label: 'Completed' },
          cancelled: { variant: 'danger' as const, label: 'Cancelled' },
        };
        const badge = config[value as keyof typeof config] || {
          variant: 'default' as const,
          label: value,
        };
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'registered',
      label: 'Registered',
      width: '100px',
      align: 'center' as const,
    },
    {
      key: 'attended',
      label: 'Attended',
      width: '100px',
      align: 'center' as const,
    },
    {
      key: 'completed',
      label: 'Completed',
      width: '100px',
      align: 'center' as const,
    },
    {
      key: 'completionRate',
      label: 'Completion %',
      width: '120px',
      align: 'center' as const,
      format: (value) => `${value}%`,
    },
  ];

  // PDF export columns
  const pdfColumns = [
    { header: 'Training Title', dataKey: 'title' },
    { header: 'Date', dataKey: 'date' },
    { header: 'Location', dataKey: 'location' },
    { header: 'Company', dataKey: 'company' },
    { header: 'Category', dataKey: 'category' },
    { header: 'Status', dataKey: 'status' },
    { header: 'Registered', dataKey: 'registered' },
    { header: 'Attended', dataKey: 'attended' },
    { header: 'Completed', dataKey: 'completed' },
    { header: 'Completion %', dataKey: 'completionRate' },
  ];

  return (
    <div>
      <PageHeader
        title="Battalion Training Summary Report"
        description="Training sessions attendance and completion statistics across all companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Training' },
        ]}
      />

      {/* Export Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            {companies.length > 0 ? (
              <>
                Battalion-wide data:{' '}
                <span className="font-semibold text-navy-900">
                  {companies.join(', ')} ({data.length} sessions)
                </span>
              </>
            ) : (
              <span className="font-semibold text-navy-900">
                All Companies ({data.length} sessions)
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Report generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}
          </p>
        </div>
        <ExportPDFButton
          reportTitle="Battalion Training Summary Report"
          reportSubtitle="Attendance and completion statistics for all companies"
          company={companies.length > 0 ? companies.join(', ') : 'All Companies'}
          columns={pdfColumns}
          data={data}
          filename={generateFileName('Battalion_Training_Summary', 'All')}
          options={{ orientation: 'landscape' }}
        />
      </div>

      {/* Data Table */}
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No training sessions found in the battalion"
      />
    </div>
  );
}
