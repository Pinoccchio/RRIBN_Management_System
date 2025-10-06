'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportTable, TableColumn } from '@/components/dashboard/reports/ReportTable';
import { ExportPDFButton } from '@/components/dashboard/reports/ExportPDFButton';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import { generateFileName } from '@/lib/utils/report-generator';

export default function AdminDocumentsReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocumentsData();
  }, []);

  const fetchDocumentsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/reports/pending-documents');
      const result = await response.json();

      if (result.success) {
        setData(result.data);
        setCompanies(result.companies || []);
      } else {
        console.error('Failed to fetch documents data:', result.error);
      }
    } catch (error) {
      console.error('Error fetching documents data:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn[] = [
    {
      key: 'reservistName',
      label: 'Reservist Name',
      width: '200px',
    },
    {
      key: 'rank',
      label: 'Rank',
      width: '100px',
    },
    {
      key: 'serviceNumber',
      label: 'Service No.',
      width: '120px',
    },
    {
      key: 'company',
      label: 'Company',
      width: '100px',
    },
    {
      key: 'documentType',
      label: 'Document Type',
      width: '180px',
    },
    {
      key: 'fileName',
      label: 'File Name',
      width: '200px',
    },
    {
      key: 'submittedDate',
      label: 'Submitted',
      width: '120px',
      format: (value) => {
        if (!value) return '-';
        return format(new Date(value), 'MMM dd, yyyy');
      },
    },
    {
      key: 'daysPending',
      label: 'Days Pending',
      width: '120px',
      align: 'center' as const,
      format: (value) => {
        const days = Number(value);
        if (days > 7) {
          return (
            <span className="font-semibold text-red-600">{days} days</span>
          );
        }
        if (days > 3) {
          return (
            <span className="font-semibold text-yellow-600">{days} days</span>
          );
        }
        return <span>{days} days</span>;
      },
    },
  ];

  // PDF export columns
  const pdfColumns = [
    { header: 'Reservist Name', dataKey: 'reservistName' },
    { header: 'Rank', dataKey: 'rank' },
    { header: 'Service No.', dataKey: 'serviceNumber' },
    { header: 'Company', dataKey: 'company' },
    { header: 'Document Type', dataKey: 'documentType' },
    { header: 'File Name', dataKey: 'fileName' },
    { header: 'Submitted', dataKey: 'submittedDate' },
    { header: 'Days Pending', dataKey: 'daysPending' },
  ];

  return (
    <div>
      <PageHeader
        title="Battalion Pending Documents Report"
        description="Documents awaiting validation across all companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Reports', href: '/admin/reports' },
          { label: 'Documents' },
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
                  {companies.join(', ')} ({data.length} pending)
                </span>
              </>
            ) : (
              <span className="font-semibold text-navy-900">
                All Companies ({data.length} pending)
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Report generated on {format(new Date(), 'MMMM dd, yyyy HH:mm')}
          </p>
          {data.length > 0 && (
            <div className="mt-2 flex items-center gap-4">
              <Badge variant="danger" size="sm">
                Urgent: {data.filter((d) => d.daysPending > 7).length} (7+ days)
              </Badge>
              <Badge variant="warning" size="sm">
                Attention: {data.filter((d) => d.daysPending > 3 && d.daysPending <= 7).length} (4-7 days)
              </Badge>
              <Badge variant="info" size="sm">
                Recent: {data.filter((d) => d.daysPending <= 3).length} (≤3 days)
              </Badge>
            </div>
          )}
        </div>
        <ExportPDFButton
          reportTitle="Battalion Pending Documents Report"
          reportSubtitle="Documents awaiting validation across all companies"
          company={companies.length > 0 ? companies.join(', ') : 'All Companies'}
          columns={pdfColumns}
          data={data}
          filename={generateFileName('Battalion_Pending_Documents', 'All')}
          options={{ orientation: 'landscape' }}
        />
      </div>

      {/* Data Table */}
      <ReportTable
        columns={columns}
        data={data}
        loading={loading}
        emptyMessage="No pending documents found in the battalion"
      />
    </div>
  );
}
