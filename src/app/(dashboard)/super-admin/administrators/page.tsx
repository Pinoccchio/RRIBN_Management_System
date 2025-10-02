'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { Card, CardContent } from '@/components/ui/Card';
import { AdministratorTable } from '@/components/dashboard/administrators/AdministratorTable';
import { CreateAdministratorModal } from '@/components/dashboard/administrators/CreateAdministratorModal';
import { EditAdministratorModal } from '@/components/dashboard/administrators/EditAdministratorModal';
import { ViewAdministratorModal } from '@/components/dashboard/administrators/ViewAdministratorModal';
import { DeleteAdministratorModal } from '@/components/dashboard/administrators/DeleteAdministratorModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Administrator, AdministratorFilters, PaginatedResponse } from '@/lib/types/administrator';
import { RefreshCw, UserPlus } from 'lucide-react';

export default function AdministratorsPage() {
  const { user } = useAuth();
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState(false);

  // Filters
  const [filters, setFilters] = useState<AdministratorFilters>({
    role: 'all',
    status: 'all',
    search: '',
  });

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Fetch administrators
  const fetchAdministrators = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.role !== 'all' && { role: filters.role }),
        ...(filters.status !== 'all' && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/administrators?${params}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch administrators');
      }

      setAdministrators(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      console.error('Error fetching administrators:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when filters/page change
  useEffect(() => {
    fetchAdministrators();
  }, [currentPage, filters]);

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setToast({
      message: 'Administrator created successfully!',
      type: 'success',
    });
    fetchAdministrators();
  };

  // Handle edit
  const handleEdit = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setShowEditModal(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    setShowEditModal(false);
    setToast({
      message: 'Administrator updated successfully!',
      type: 'success',
    });
    fetchAdministrators();
  };

  // Handle delete - Open modal
  const handleDelete = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setShowDeleteModal(true);
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!selectedAdmin) return;

    setDeletingAdmin(true);

    try {
      const response = await fetch(`/api/admin/administrators/${selectedAdmin.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete administrator');
      }

      setToast({
        message: 'Administrator deleted successfully',
        type: 'success',
      });
      setShowDeleteModal(false);
      setSelectedAdmin(null);
      fetchAdministrators();
    } catch (err) {
      console.error('Error deleting administrator:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to delete administrator',
        type: 'error',
      });
    } finally {
      setDeletingAdmin(false);
    }
  };

  // Handle view
  const handleView = (admin: Administrator) => {
    setSelectedAdmin(admin);
    setShowViewModal(true);
  };

  return (
    <div>
      <PageHeader
        title="Administrators"
        description="Manage administrator accounts and permissions across the system."
        action={
          <Button
            variant="primary"
            size="md"
            onClick={() => setShowCreateModal(true)}
            leftIcon={<UserPlus className="w-5 h-5" />}
          >
            Create Administrator
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Administrators' },
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
              placeholder="Search by name or email..."
            />
          </div>

          {/* Role Filter */}
          <Select
            value={filters.role || 'all'}
            onChange={(value) => {
              setFilters({ ...filters, role: value as any });
              setCurrentPage(1);
            }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'super_admin', label: 'Super Administrators' },
              { value: 'admin', label: 'Administrators' },
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
            onClick={fetchAdministrators}
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
              <p className="font-semibold text-error-dark">Error loading administrators</p>
              <p className="text-sm mt-1 text-error">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {loading && !administrators.length ? (
        <Card variant="elevated" padding="lg" className="mb-6">
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      ) : (
        <>
          {/* Table */}
          <Card variant="elevated" padding="none" className="mb-6 overflow-hidden">
            <AdministratorTable
              administrators={administrators}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              currentUserId={user?.id}
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
      <CreateAdministratorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <ViewAdministratorModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedAdmin(null);
        }}
        administrator={selectedAdmin}
      />

      <EditAdministratorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        administrator={selectedAdmin}
      />

      <DeleteAdministratorModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedAdmin(null);
        }}
        onConfirm={handleDeleteConfirm}
        administrator={selectedAdmin}
        loading={deletingAdmin}
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
