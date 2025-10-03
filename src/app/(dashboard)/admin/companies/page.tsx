'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Toast } from '@/components/ui/Toast';
import { CreateCompanyModal } from '@/components/dashboard/settings/CreateCompanyModal';
import { EditCompanyModal } from '@/components/dashboard/settings/EditCompanyModal';
import { DeleteCompanyModal } from '@/components/dashboard/settings/DeleteCompanyModal';
import { ReactivateCompanyModal } from '@/components/dashboard/settings/ReactivateCompanyModal';
import { Plus, Search, Building2, CheckCircle, XCircle } from 'lucide-react';
import type { Company } from '@/lib/types/staff';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/companies');
      const data = await response.json();

      if (data.success) {
        setCompanies(data.data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    let filtered = companies;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (company) =>
          company.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          company.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter((company) =>
        filterStatus === 'active' ? company.is_active : !company.is_active
      );
    }

    setFilteredCompanies(filtered);
  }, [companies, searchTerm, filterStatus]);

  const handleEdit = (company: Company) => {
    setSelectedCompany(company);
    setIsEditModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleReactivate = (company: Company) => {
    setSelectedCompany(company);
    setIsReactivateModalOpen(true);
  };

  // Success handlers with toast notifications
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setToast({
      message: 'Company created successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedCompany(null);
    setToast({
      message: 'Company updated successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedCompany(null);
    setToast({
      message: 'Company deactivated successfully',
      type: 'success',
    });
    fetchCompanies();
  };

  const handleReactivateSuccess = () => {
    setIsReactivateModalOpen(false);
    setSelectedCompany(null);
    setToast({
      message: 'Company reactivated successfully!',
      type: 'success',
    });
    fetchCompanies();
  };

  return (
    <div>
      <PageHeader
        title="Companies"
        description="Create and manage battalion companies"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Companies' },
        ]}
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Company
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by code or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <Button
              variant={filterStatus === 'all' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              All
            </Button>
            <Button
              variant={filterStatus === 'active' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('active')}
              leftIcon={<CheckCircle className="w-4 h-4" />}
            >
              Active
            </Button>
            <Button
              variant={filterStatus === 'inactive' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setFilterStatus('inactive')}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Inactive
            </Button>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No companies found</h3>
            <p className="text-gray-600">
              {searchTerm || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first company to get started'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-navy-subtle">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-yellow-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-navy-900">{company.code}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{company.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">
                        {company.description || <em className="text-gray-400">No description</em>}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {company.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(company)}
                        >
                          Edit
                        </Button>
                        {company.is_active ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(company)}
                          >
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleReactivate(company)}
                          >
                            Reactivate
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateCompanyModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedCompany && (
        <>
          <EditCompanyModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedCompany(null);
            }}
            onSuccess={handleEditSuccess}
            company={selectedCompany}
          />

          <DeleteCompanyModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedCompany(null);
            }}
            onConfirm={handleDeleteSuccess}
            company={selectedCompany}
          />

          <ReactivateCompanyModal
            isOpen={isReactivateModalOpen}
            onClose={() => {
              setIsReactivateModalOpen(false);
              setSelectedCompany(null);
            }}
            onConfirm={handleReactivateSuccess}
            company={selectedCompany}
          />
        </>
      )}

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
