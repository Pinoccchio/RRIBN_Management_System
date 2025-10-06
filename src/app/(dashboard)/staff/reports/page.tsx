import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { ReportCard } from '@/components/dashboard/reports/ReportCard';
import { Users, GraduationCap, FileText } from 'lucide-react';

export default function StaffReportsPage() {
  return (
    <div>
      <PageHeader
        title="Reports"
        description="Generate and export reports for your assigned companies"
        breadcrumbs={[{ label: 'Dashboard', href: '/staff' }, { label: 'Reports' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Company Roster Report */}
        <ReportCard
          title="Company Roster"
          description="View and export complete personnel roster for your assigned companies"
          icon={Users}
          href="/staff/reports/roster"
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100"
        />

        {/* Training Summary Report */}
        <ReportCard
          title="Training Summary"
          description="Track training sessions, attendance, and completion rates"
          icon={GraduationCap}
          href="/staff/reports/training"
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
        />

        {/* Pending Documents Report */}
        <ReportCard
          title="Pending Documents"
          description="Monitor document submissions awaiting validation"
          icon={FileText}
          href="/staff/reports/documents"
          iconColor="text-orange-600"
          iconBgColor="bg-orange-100"
        />
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-navy-50 border border-navy-200 rounded-xl">
        <h3 className="text-lg font-bold text-navy-900 mb-2">About Reports</h3>
        <p className="text-sm text-gray-700 mb-3">
          All reports are automatically filtered to show only data from your assigned companies. You can view the data in the browser and export to PDF for offline use or record-keeping.
        </p>
        <ul className="text-sm text-gray-700 space-y-1 ml-5 list-disc">
          <li>Click on any report card to view the full data</li>
          <li>Use the "Export to PDF" button to download a formatted report</li>
          <li>Use the "Print" button for direct printing</li>
          <li>All reports include your company name and generation timestamp</li>
        </ul>
      </div>
    </div>
  );
}
