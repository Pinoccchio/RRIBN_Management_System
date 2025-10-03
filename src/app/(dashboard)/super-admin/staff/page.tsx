'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { StaffTable } from '@/components/dashboard/staff/StaffTable';
import { CreateStaffModal } from '@/components/dashboard/staff/CreateStaffModal';
import { EditStaffModal } from '@/components/dashboard/staff/EditStaffModal';
import { ViewStaffModal } from '@/components/dashboard/staff/ViewStaffModal';
import { DeleteStaffModal } from '@/components/dashboard/staff/DeleteStaffModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import { COMPANIES } from '@/lib/types/staff';
import type { StaffMember, StaffFilters, PaginatedResponse } from '@/lib/types/staff';
import { RefreshCw, UserPlus } from 'lucide-react';

export default function StaffPage() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [deletingStaff, setDeletingStaff] = useState(false);

  // Filters
  const [filters, setFilters] = useState<StaffFilters>({
    status: 'all',
    company: 'all',
    search: '',
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch staff
  const fetchStaff = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.company !== 'all' && { company: filters.company }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/staff?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch staff');
      }

      setStaff(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching staff:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchStaff();
  }, [currentPage, filters]);

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setToast({
      message: 'Staff member created successfully!',
      type: 'success',
    });
    fetchStaff();
  };

  // Handle edit
  const handleEdit = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowEditModal(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setToast({
      message: 'Staff member updated successfully!',
      type: 'success',
    });
    fetchStaff();
  };

  // Handle delete - Open modal
  const handleDelete = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedStaff) return;

    setDeletingStaff(true);

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete staff member');
      }

      setToast({
        message: 'Staff member deleted successfully',
        type: 'success',
      });
      setShowDeleteModal(false);
      setSelectedStaff(null);
      fetchStaff();
    } catch (err) {
      console.error('Error deleting staff member:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to delete staff member',
        type: 'error',
      });
    } finally {
      setDeletingStaff(false);
    }
  };

  // Handle view
  const handleView = (staffMember: StaffMember) => {
    setSelectedStaff(staffMember);
    setShowViewModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Staff Management"
        description="Manage staff accounts and company assignments across the battalion."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<UserPlus className="w-5 h-5" />}
          >
            Create Staff Member
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Staff Management' },
        ]}
      />

      {/* Filters Card */}
      <Card variant="elevated" padding="lg" className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <SearchInput
              value={filters.search || ''}
              onChange={(value) => {
                setFilters({ ...filters, search: value });
                setCurrentPage(1);
              }}
              placeholder="Search by name, email, or employee ID..."
            />
          </div>

          {/* Company Filter */}
          <Select
            value={filters.company || 'all'}
            onChange={(value) => {
              setFilters({ ...filters, company: value as any });
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Companies' },
              ...COMPANIES.map(c => ({ value: c.code, label: c.name })),
            ]}
          />

          {/* Status Filter */}
          <Select
            value={filters.status || 'all'}
            onChange={(value) => {
              setFilters({ ...filters, status: value as any });
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Statuses' },
              { value: 'active', label: 'Active' },
              { value: 'pending', label: 'Pending' },
              { value: 'inactive', label: 'Inactive' },
              { value: 'deactivated', label: 'Deactivated' },
            ]}
          />
        </div>

        {/* Refresh Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchStaff}
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
              <p className="font-semibold text-error-dark">Error loading staff</p>
              <p className="text-sm mt-1 text-error">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && !staff.length ? (
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : (
        <>
          {/* Table */}
          <Card variant="elevated" padding="none" className="mb-6 overflow-hidden">
            <StaffTable
              staff={staff}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
            />
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <Card variant="bordered" padding="md" className="bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Showing page <span className="font-semibold text-navy-900">{currentPage}</span> of{' '}
                  <span className="font-semibold text-navy-900">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </>
      )}

      {/* Modals */}
      <CreateStaffModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ViewStaffModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedStaff(null);
        }}
        staff={selectedStaff}
      />

      <EditStaffModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        staff={selectedStaff}
      />

      <DeleteStaffModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedStaff(null);
        }}
        onConfirm={handleDeleteConfirm}
        staff={selectedStaff}
        loading={deletingStaff}
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
