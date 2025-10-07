import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/SearchInput';
import { EligibilityBadge } from './EligibilityBadge';
import { CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { PromotionEligibility } from '@/lib/types/analytics';

interface PromotionEligibilityTableProps {
  data: PromotionEligibility[];
  loading?: boolean;
}

type SortField = 'name' | 'rank' | 'company' | 'trainingHours' | 'readinessScore';
type SortDirection = 'asc' | 'desc';

export const PromotionEligibilityTable: React.FC<PromotionEligibilityTableProps> = ({
  data,
  loading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  // Commission type filter removed - System Scope: NCO only
  const [sortField, setSortField] = useState<SortField>('readinessScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Get unique companies
  const companies = useMemo(() => {
    const unique = [...new Set(data.map((r) => r.company))].filter(Boolean);
    return unique.sort();
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.firstName.toLowerCase().includes(term) ||
          r.lastName.toLowerCase().includes(term) ||
          r.rank.toLowerCase().includes(term)
      );
    }

    // Company filter
    if (companyFilter !== 'all') {
      filtered = filtered.filter((r) => r.company === companyFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((r) => r.eligibilityStatus === statusFilter);
    }

    // Commission type filter removed - System Scope: NCO only
    // All data is already NCO-filtered at API level

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'name':
          aValue = `${a.lastName} ${a.firstName}`;
          bValue = `${b.lastName} ${b.firstName}`;
          break;
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'company':
          aValue = a.company;
          bValue = b.company;
          break;
        case 'trainingHours':
          aValue = a.totalTrainingHours;
          bValue = b.totalTrainingHours;
          break;
        case 'readinessScore':
          aValue = a.readinessScore;
          bValue = b.readinessScore;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, companyFilter, statusFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <Card padding="lg">
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded animate-pulse w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-navy-900 mb-4">Promotion Eligibility Details</h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search by name or rank..."
          />

          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-navy-900 font-medium focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/30 focus:outline-none"
          >
            <option value="all">All Companies</option>
            {companies.map((company) => (
              <option key={company} value={company}>
                {company}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-navy-900 font-medium focus:border-yellow-500 focus:ring-4 focus:ring-yellow-500/30 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="eligible">Fully Eligible</option>
            <option value="partially_eligible">Partially Eligible</option>
            <option value="not_eligible">Not Eligible</option>
          </select>

          {/* Commission type filter removed - System Scope: NCO only */}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Name
                  <SortIcon field="name" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('rank')}
              >
                <div className="flex items-center gap-1">
                  Rank
                  <SortIcon field="rank" />
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('company')}
              >
                <div className="flex items-center gap-1">
                  Company
                  <SortIcon field="company" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('trainingHours')}
              >
                <div className="flex items-center gap-1">
                  Training Types
                  <SortIcon field="trainingHours" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Camp Duty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requirements
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('readinessScore')}
              >
                <div className="flex items-center gap-1">
                  Score
                  <SortIcon field="readinessScore" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-8 text-center text-gray-500">
                  No reservists found matching the filters
                </td>
              </tr>
            ) : (
              filteredData.map((reservist) => (
                <tr key={reservist.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-navy-900">
                      {reservist.lastName}, {reservist.firstName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservist.rank}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservist.company}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      reservist.commissionType === 'NCO'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}>
                      {reservist.commissionType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservist.trainingTypesCount} types</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{reservist.campDutyDays} days</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {reservist.meetsTrainingRequirement ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" title="Training requirement met" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" title="Training requirement not met" />
                      )}
                      {reservist.meetsCampDutyRequirement ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" title="Camp duty requirement met" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" title="Camp duty requirement not met" />
                      )}
                      {reservist.meetsSeminarRequirement ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" title="Seminar requirement met" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-600" title="Seminar requirement not met" />
                      )}
                      {reservist.commissionType === 'CO' && reservist.meetsEducationRequirement && (
                        <CheckCircle2 className="w-4 h-4 text-green-600" title="Education requirement met" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-lg font-bold ${
                      reservist.readinessScore >= 80
                        ? 'text-green-600'
                        : reservist.readinessScore >= 60
                        ? 'text-yellow-600'
                        : 'text-red-600'
                    }`}>
                      {reservist.readinessScore}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <EligibilityBadge status={reservist.eligibilityStatus} size="sm" />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <p className="text-sm text-gray-600">
          Showing {filteredData.length} of {data.length} reservists
        </p>
      </div>
    </Card>
  );
};
