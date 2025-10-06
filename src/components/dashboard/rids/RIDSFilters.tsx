'use client';

import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

interface RIDSFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  companyFilter: string;
  onCompanyChange: (value: string) => void;
  companies: Array<{ code: string; name: string }>;
  showCompanyFilter?: boolean;
}

export function RIDSFilters({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  companyFilter,
  onCompanyChange,
  companies,
  showCompanyFilter = true,
}: RIDSFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <h3 className="text-sm font-semibold text-gray-900">Filters</h3>
      </div>

      <div className={`grid grid-cols-1 ${showCompanyFilter ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search by name, service number..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onChange={onStatusChange}
          options={[
            { value: 'all', label: 'All Status' },
            { value: 'draft', label: 'Draft' },
            { value: 'submitted', label: 'Submitted' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          placeholder="Select status"
        />

        {/* Company Filter - Only show if staff has multiple companies */}
        {showCompanyFilter && (
          <Select
            value={companyFilter}
            onChange={onCompanyChange}
            options={[
              { value: '', label: 'All My Companies' },
              ...companies.map((company) => ({
                value: company.code,
                label: company.name,
              })),
            ]}
            placeholder="Select company"
          />
        )}
      </div>
    </div>
  );
}
