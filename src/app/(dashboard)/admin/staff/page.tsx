'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Toast } from '@/components/ui/Toast';
import { StaffTable } from '@/components/dashboard/staff/StaffTable';
import { CreateStaffModal } from '@/components/dashboard/staff/CreateStaffModal';
import { EditStaffModal } from '@/components/dashboard/staff/EditStaffModal';
import { ViewStaffModal } from '@/components/dashboard/staff/ViewStaffModal';
import { DeleteStaffModal } from '@/components/dashboard/staff/DeleteStaffModal';
import { Plus, Search, Filter } from 'lucide-react';
import type { StaffMember, Company } from '@/lib/types/staff';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchStaff = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        status: statusFilter,
        company: companyFilter,
        search: searchTerm,
      });

      const response = await fetch(`/api/admin/staff?${params}`);
      const data = await response.json();

      if (data.success) {
        setStaff(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, companyFilter, searchTerm]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Fetch companies for filter dropdown
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/admin/companies?active=true');
        const data = await response.json();
        if (data.success) {
          setCompanies(data.data);
        }
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };
    fetchCompanies();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchStaff();
  };

  const handleEdit = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsEditModalOpen(true);
  };

  const handleView = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsViewModalOpen(true);
  };

  const handleDelete = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setIsDeleteModalOpen(true);
  };

  // Success handlers with toast notifications
  const handleCreateSuccess = () => {
    setIsCreateModalOpen(false);
    setToast({
      message: 'Staff member created successfully!',
      type: 'success',
    });
    fetchStaff();
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setSelectedStaff(null);
    setToast({
      message: 'Staff member updated successfully!',
      type: 'success',
    });
    fetchStaff();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteModalOpen(false);
    setSelectedStaff(null);
    setToast({
      message: 'Staff member deleted successfully',
      type: 'success',
    });
    fetchStaff();
  };

  return (
    <div>
      <PageHeader
        title="Staff"
        description="Create and manage staff accounts"
        breadcrumbs={[
          { label: 'Dashboard', href: '/admin' },
          { label: 'Staff' },
        ]}
        action={
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Staff Account
          </Button>
        }
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div>
            <Select
              value={statusFilter}
              onChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'deactivated', label: 'Deactivated' },
              ]}
            />
          </div>

          {/* Company Filter */}
          <div>
            <Select
              value={companyFilter}
              onChange={(value) => {
                setCompanyFilter(value);
                setPage(1);
              }}
              options={[
                { value: 'all', label: 'All Companies' },
                ...companies.map((company) => ({
                  value: company.code,
                  label: company.name,
                })),
              ]}
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <Button
            onClick={handleSearch}
            variant="primary"
            size="sm"
            leftIcon={<Filter className="w-4 h-4" />}
          >
            Apply Filters
          </Button>

          <Button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCompanyFilter('all');
              setPage(1);
            }}
            variant="ghost"
            size="sm"
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">Loading staff...</p>
          </div>
        ) : (
          <>
            <StaffTable
              staff={staff}
              onEdit={handleEdit}
              onView={handleView}
              onDelete={handleDelete}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      <CreateStaffModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      {selectedStaff && (
        <>
          <EditStaffModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedStaff(null);
            }}
            onSuccess={handleEditSuccess}
            staff={selectedStaff}
          />

          <ViewStaffModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedStaff(null);
            }}
            staff={selectedStaff}
          />

          <DeleteStaffModal
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedStaff(null);
            }}
            onConfirm={handleDeleteSuccess}
            staff={selectedStaff}
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
