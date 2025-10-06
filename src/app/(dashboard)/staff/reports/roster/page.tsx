'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportTable, TableColumn } from '@/components/dashboard/reports/ReportTable';
import { ExportPDFButton } from '@/components/dashboard/reports/ExportPDFButton';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { generateFileName } from '@/lib/utils/report-generator';

export default function RosterReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRosterData();
  }, []);

  const fetchRosterData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/reports/roster');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setCompanies(result.companies || []);
      } else {
        console.error('Failed to fetch roster data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching roster data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'serviceNumber',
      label: 'Service No.',
      width: '120px',
    },
    {
      key: 'rank',
      label: 'Rank',
      width: '100px',
    },
    {
      key: 'lastName',
      label: 'Last Name',
      width: '150px',
    },
    {
      key: 'firstName',
      label: 'First Name',
      width: '150px',
    },
    {
      key: 'company',
      label: 'Company',
      width: '100px',
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '130px',
    },
    {
      key: 'accountStatus',
      label: 'Account Status',
      width: '120px',
      format: (value) => {
        const config = {
          active: { variant: 'success' as const, label: 'Active' },
          inactive: { variant: 'default' as const, label: 'Inactive' },
          pending: { variant: 'warning' as const, label: 'Pending' },
          deactivated: { variant: 'danger' as const, label: 'Deactivated' },
        };
        const badge = config[value as keyof typeof config] || {
          variant: 'default' as const,
          label: value,
        };
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
    {
      key: 'reservistStatus',
      label: 'Operational Status',
      width: '140px',
      format: (value) => {
        const config = {
          ready: { variant: 'success' as const, label: 'Ready' },
          standby: { variant: 'info' as const, label: 'Standby' },
          retired: { variant: 'default' as const, label: 'Retired' },
        };
        const badge = config[value as keyof typeof config] || {
          variant: 'default' as const,
          label: value,
        };
        return <Badge variant={badge.variant} size="sm">{badge.label}</Badge>;
      },
    },
  ];

  // PDF export columns (without JSX formatting)
  const pdfColumns = [
    { header: 'Service No.', dataKey: 'serviceNumber' },
    { header: 'Rank', dataKey: 'rank' },
    { header: 'Last Name', dataKey: 'lastName' },
    { header: 'First Name', dataKey: 'firstName' },
    { header: 'Company', dataKey: 'company' },
    { header: 'Phone', dataKey: 'phone' },
    { header: 'Account Status', dataKey: 'accountStatus' },
    { header: 'Operational Status', dataKey: 'reservistStatus' },
  ];

  return (
    <div>
      <PageHeader
        title="Company Roster Report"
        description="Complete personnel roster for your assigned companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/staff' },
          { label: 'Reports', href: '/staff/reports' },
          { label: 'Roster' },
        ]}
      />

      {/* Export Button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            {companies.length > 0 && (
              <>
                Showing data for:{' '}
                <span className="font-semibold text-navy-900">
                  {companies.join(', ')}
                </span>
              </>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Report generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}
          </p>
        </div>
        <ExportPDFButton
          reportTitle="Company Roster Report"
          reportSubtitle="Personnel listing for assigned companies"
          company={companies.join(', ')}
          columns={pdfColumns}
          data={data}
          filename={generateFileName('Roster', companies.join('_'))}
        />
      </div>

      {/* Data Table */}
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No reservists found in your assigned companies"
      />
    </div>
  );
}
