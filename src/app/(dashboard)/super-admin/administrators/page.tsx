'use client';

import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/ui/SearchInput';
import { Select } from '@/components/ui/Select';
import { AdministratorTable } from '@/components/dashboard/administrators/AdministratorTable';
import { CreateAdministratorModal } from '@/components/dashboard/administrators/CreateAdministratorModal';
import { EditAdministratorModal } from '@/components/dashboard/administrators/EditAdministratorModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Toast } from '@/components/ui/Toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Administrator, AdministratorFilters, PaginatedResponse } from '@/lib/types/administrator';
import { RefreshCw } from 'lucide-react';

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
  const [selectedAdmin, setSelectedAdmin] = useState<Administrator | null>(null);

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
  const handleCreateSuccess = (password: string) => {
    setShowCreateModal(false);
    setToast({
      message: `Administrator created successfully! Temporary password: ${password}`,
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

  // Handle delete
  const handleDelete = async (admin: Administrator) => {
    if (!confirm(`Are you sure you want to deactivate ${admin.profile.first_name} ${admin.profile.last_name}? This action can be reversed later.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/administrators/${admin.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to deactivate administrator');
      }

      setToast({
        message: 'Administrator deactivated successfully',
        type: 'success',
      });
      fetchAdministrators();
    } catch (err) {
      console.error('Error deactivating administrator:', err);
      setToast({
        message: err instanceof Error ? err.message : 'Failed to deactivate administrator',
        type: 'error',
      });
    }
  };

  // Handle view (placeholder)
  const handleView = (admin: Administrator) => {
    // TODO: Implement view details modal or navigate to detail page
    console.log('View admin:', admin);
  };

  return (
    <div>
      <PageHeader
        title="Administrators"
        description="Manage administrator accounts and permissions across the system."
        action={
          <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
            + Create Administrator
          </Button>
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/super-admin' },
          { label: 'Administrators' },
        ]}
      />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
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
            variant="secondary"
            size="sm"
            onClick={fetchAdministrators}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4 mb-6">
          <p className="font-medium">Error loading administrators</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && !administrators.length ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {/* Table */}
          <AdministratorTable
            administrators={administrators}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            currentUserId={user?.id}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <CreateAdministratorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      <EditAdministratorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={handleEditSuccess}
        administrator={selectedAdmin}
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
