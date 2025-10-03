'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { CreateCompanyModal } from '@/components/dashboard/settings/CreateCompanyModal';
import { EditCompanyModal } from '@/components/dashboard/settings/EditCompanyModal';
import { DeleteCompanyModal } from '@/components/dashboard/settings/DeleteCompanyModal';
import { ReactivateCompanyModal } from '@/components/dashboard/settings/ReactivateCompanyModal';
import { Plus, Building2, Edit2, XCircle, CheckCircle, RefreshCw, Search } from 'lucide-react';
import type { Company } from '@/lib/types/staff';

export default function SettingsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReactivateModal, setShowReactivateModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch companies
  const fetchCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/companies');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch companies');
        return;
      }

      setCompanies(data.data);
    } catch (err) {
      console.error('Error fetching companies:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setToast({
      message: 'Company created successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleEditClick = (company: Company) => {
    setSelectedCompany(company);
    setShowEditModal(true);
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setToast({
      message: 'Company updated successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setShowDeleteModal(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
    setToast({
      message: 'Company deactivated successfully',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleReactivateClick = (company: Company) => {
    setSelectedCompany(company);
    setShowReactivateModal(true);
  };

  const handleReactivateSuccess = () => {
    setShowReactivateModal(false);
    setToast({
      message: 'Company reactivated successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  // Filter companies based on search and status
  const filteredCompanies = companies.filter(company => {
    const matchesSearch =
      company.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && company.is_active) ||
      (statusFilter === 'inactive' && !company.is_active);

    return matchesSearch && matchesStatus;
  });

  const activeCount = companies.filter(c => c.is_active).length;
  const inactiveCount = companies.filter(c => !c.is_active).length;

  return (
    <div>
      <PageHeader
        title="System Configuration"
        description="Configure system parameters, company structures, and security protocols."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Create Company
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Settings' },
        ]}
      />

      {/* Filters Card */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-navy-900 flex items-center gap-2 mb-1">
            <Building2 className="w-5 h-5" />
            Companies Management
          </h3>
          <p className="text-sm text-gray-600">
            Manage battalion companies and unit structures
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <SearchInput
              value={searchQuery}
              onChange={(value) => setSearchQuery(value)}
              placeholder="Search companies by code or name..."
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as 'all' | 'active' | 'inactive')}
            options={[
              { value: 'all', label: `All (${companies.length})` },
              { value: 'active', label: `Active (${activeCount})` },
              { value: 'inactive', label: `Inactive (${inactiveCount})` },
            ]}
          />
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCompanies}
            disabled={loading}
            leftIcon={<RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
        </div>
      </Card>

      {/* Error State */}
      {error && (
        <Card variant="bordered" padding="md" className="mb-6 border-error bg-error-light">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-semibold text-error-dark">Error loading companies</p>
              <p className="text-sm mt-1 text-error">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && !companies.length ? (
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : (
        <>

        {/* Companies Grid */}
        <Card variant="elevated" padding="lg" className="mb-6">
          <>
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCompanies.map((company) => (
                  <div
                    key={company.id}
                    className={`group relative bg-white rounded-xl border-2 transition-all shadow-sm hover:shadow-md p-6 ${
                      company.is_active
                        ? 'border-gray-200 hover:border-navy-500'
                        : 'border-gray-200 hover:border-gray-400 opacity-75'
                    }`}
                  >
                    {/* Status Badge - Top Right */}
                    <div className="absolute top-4 right-4">
                      {company.is_active ? (
                        <Badge variant="success" className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Inactive
                        </Badge>
                      )}
                    </div>

                    {/* Company Icon/Badge */}
                    <div className="mb-4">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                        company.is_active ? 'bg-navy-100' : 'bg-gray-100'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          company.is_active ? 'text-navy-900' : 'text-gray-600'
                        }`}>
                          {company.code.substring(0, 2)}
                        </span>
                      </div>
                    </div>

                    {/* Company Info */}
                    <h3 className="text-xl font-bold text-navy-900 mb-1">{company.name}</h3>
                    <p className="text-sm font-mono text-gray-600 mb-3">{company.code}</p>
                    <p className="text-gray-600 text-sm mb-6 line-clamp-2 min-h-[2.5rem]">
                      {company.description || (
                        <span className="text-gray-400 italic">No description</span>
                      )}
                    </p>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditClick(company)}
                        leftIcon={<Edit2 className="w-4 h-4" />}
                        className="flex-1"
                      >
                        Edit
                      </Button>
                      {company.is_active ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(company)}
                          leftIcon={<XCircle className="w-4 h-4" />}
                          className="flex-1 text-warning hover:text-warning-dark hover:bg-warning-light"
                        >
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleReactivateClick(company)}
                          leftIcon={<RefreshCw className="w-4 h-4" />}
                          className="flex-1 text-success hover:text-success-dark hover:bg-success-light"
                        >
                          Reactivate
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty/No Results State */
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  {searchQuery || statusFilter !== 'all' ? (
                    <Search className="w-8 h-8 text-gray-400" />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {searchQuery || statusFilter !== 'all'
                    ? 'No companies match your filters'
                    : 'No Companies Configured'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || statusFilter !== 'all' ? (
                    'Try adjusting your search or filter criteria.'
                  ) : (
                    'Create your first company to start organizing your battalion structure.'
                  )}
                </p>
                {!searchQuery && statusFilter === 'all' && (
                  <Button
                    variant="primary"
                    onClick={() => setShowCreateModal(true)}
                    leftIcon={<Plus className="w-4 h-4" />}
                    className="mx-auto"
                  >
                    Create Company
                  </Button>
                )}
              </div>
            )}
          </>
        </Card>
        </>
      )}

      {/* Modals */}
      <CreateCompanyModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditCompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        company={selectedCompany}
      />

      <DeleteCompanyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteSuccess}
        company={selectedCompany}
      />

      <ReactivateCompanyModal
        isOpen={showReactivateModal}
        onClose={() => setShowReactivateModal(false)}
        onConfirm={handleReactivateSuccess}
        company={selectedCompany}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
