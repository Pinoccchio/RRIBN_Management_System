import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportCard } from '@/components/dashboard/reports/ReportCard';
import { Users, GraduationCap, FileText } from 'lucide-react';

export default function AdminReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and export battalion-wide reports across all companies"
        breadcrumbs={[{ label: 'Dashboard', href: '/admin' }, { label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Roster Report */}
        <ReportCard
          title="Company Roster"
          description="View and export complete personnel roster for all companies battalion-wide"
          icon={Users}
          href="/admin/reports/roster"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        {/* Training Summary Report */}
        <ReportCard
          title="Training Summary"
          description="Track all training sessions, attendance, and completion rates across the battalion"
          icon={GraduationCap}
          href="/admin/reports/training"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        {/* Pending Documents Report */}
        <ReportCard
          title="Pending Documents"
          description="Monitor all document submissions awaiting validation across all companies"
          icon={FileText}
          href="/admin/reports/documents"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-navy-50 border border-navy-200 rounded-xl">
        <h3 className="text-lg font-bold text-navy-900 mb-2">About Battalion Reports</h3>
        <p className="text-sm text-gray-700 mb-3">
          All reports display battalion-wide data across all companies. You can view the data in the browser and export to PDF for offline use, presentations, or official record-keeping.
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-5 list-disc">
          <li>Click on any report card to view the full battalion-wide data</li>
          <li>Use the "Export to PDF" button to download a formatted report</li>
          <li>Use the "Print" button for direct printing</li>
          <li>All reports include battalion designation and generation timestamp</li>
          <li>Reports can be filtered by company if needed</li>
        </ul>
      </div>
    </div>
  );
}
