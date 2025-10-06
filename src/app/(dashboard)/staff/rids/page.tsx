'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/dashboard/shared/PageHeader';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { RIDSFilters } from '@/components/dashboard/rids/RIDSFilters';
import { RIDSTable } from '@/components/dashboard/rids/RIDSTable';
import { RIDSViewModal } from '@/components/dashboard/rids/RIDSViewModal';
import { CreateRIDSModal } from '@/components/dashboard/rids/CreateRIDSModal';
import { EditRIDSModal } from '@/components/dashboard/rids/EditRIDSModal';
import { DeleteRIDSModal } from '@/components/dashboard/rids/DeleteRIDSModal';
import { Plus, AlertCircle } from 'lucide-react';
import { RIDSFormComplete } from '@/lib/types/rids';
import { logger } from '@/lib/logger';

export default function StaffRIDSPage() {
  const [loading, setLoading] = useState(true);
  const [rids, setRids] = useState<RIDSFormComplete[]>([]);
  const [assignedCompanies, setAssignedCompanies] = useState<Array<{ code: string; name: string }>>([]);

  // Modal states
  const [selectedRIDS, setSelectedRIDS] = useState<RIDSFormComplete | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingRIDSId, setViewingRIDSId] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingRIDSId, setEditingRIDSId] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingRIDS, setDeletingRIDS] = useState(false);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [companyFilter, setCompanyFilter] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    fetchStaffDetails();
  }, []);

  useEffect(() => {
    fetchRIDS();
  }, [searchQuery, statusFilter, companyFilter, page]);

  const fetchStaffDetails = async () => {
    try {
      // Fetch current staff's assigned companies
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();

        if (data.staff_details?.assigned_companies) {
          // Fetch company details for assigned companies only
          const companiesResponse = await fetch('/api/companies');
          if (companiesResponse.ok) {
            const companiesData = await companiesResponse.json();
            const staffCompanies = (companiesData.companies || []).filter((company: any) =>
              data.staff_details.assigned_companies.includes(company.code)
            );
            setAssignedCompanies(staffCompanies);

            // If staff has only one company, auto-select it
            if (staffCompanies.length === 1) {
              setCompanyFilter(staffCompanies[0].code);
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to fetch staff details', error);
    }
  };

  const fetchRIDS = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (companyFilter) params.append('company', companyFilter);

      const response = await fetch(`/api/staff/rids?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch RIDS');
      }

      const data = await response.json();

      if (data.success) {
        setRids(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      logger.error('Failed to fetch RIDS', error);
      setRids([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (ridsItem: RIDSFormComplete) => {
    setViewingRIDSId(ridsItem.id);
    setViewModalOpen(true);
  };

  const handleEdit = (ridsItem: RIDSFormComplete) => {
    setEditingRIDSId(ridsItem.id);
    setEditModalOpen(true);
  };

  const handleDelete = (ridsItem: RIDSFormComplete) => {
    setSelectedRIDS(ridsItem);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRIDS) return;

    setDeletingRIDS(true);

    try {
      const response = await fetch(`/api/staff/rids/${selectedRIDS.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete RIDS');
      }

      setToast({
        message: 'RIDS deleted successfully',
        type: 'success',
      });
      setDeleteModalOpen(false);
      setSelectedRIDS(null);
      fetchRIDS();
    } catch (error) {
      logger.error('Failed to delete RIDS', error);
      setToast({
        message: error instanceof Error ? error.message : 'Failed to delete RIDS',
        type: 'error',
      });
    } finally {
      setDeletingRIDS(false);
    }
  };

  const handleSubmit = async (ridsItem: RIDSFormComplete) => {
    if (!confirm(`Submit RIDS for ${ridsItem.reservist?.first_name} ${ridsItem.reservist?.last_name} for approval?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/rids/${ridsItem.id}/submit`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchRIDS(); // Refresh list
        setToast({
          message: 'RIDS submitted successfully',
          type: 'success',
        });
      } else {
        const data = await response.json();
        setToast({
          message: data.error || 'Failed to submit RIDS',
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('Failed to submit RIDS', error);
      setToast({
        message: 'Failed to submit RIDS',
        type: 'error',
      });
    }
  };

  const handleApprove = async (ridsItem: RIDSFormComplete) => {
    if (!confirm(`Approve RIDS for ${ridsItem.reservist?.first_name} ${ridsItem.reservist?.last_name}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/staff/rids/${ridsItem.id}/approve`, {
        method: 'PUT',
      });

      if (response.ok) {
        fetchRIDS(); // Refresh list
        setToast({
          message: 'RIDS approved successfully',
          type: 'success',
        });
      } else {
        const data = await response.json();
        setToast({
          message: data.error || 'Failed to approve RIDS',
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('Failed to approve RIDS', error);
      setToast({
        message: 'Failed to approve RIDS',
        type: 'error',
      });
    }
  };

  const handleReject = async (ridsItem: RIDSFormComplete) => {
    const reason = prompt(`Enter rejection reason for ${ridsItem.reservist?.first_name} ${ridsItem.reservist?.last_name}:`);

    if (!reason) return;

    try {
      const response = await fetch(`/api/staff/rids/${ridsItem.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejection_reason: reason }),
      });

      if (response.ok) {
        fetchRIDS(); // Refresh list
        setToast({
          message: 'RIDS rejected',
          type: 'success',
        });
      } else {
        const data = await response.json();
        setToast({
          message: data.error || 'Failed to reject RIDS',
          type: 'error',
        });
      }
    } catch (error) {
      logger.error('Failed to reject RIDS', error);
      setToast({
        message: 'Failed to reject RIDS',
        type: 'error',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="RIDS Management"
        description="Reservist Information Data Sheet"
        action={
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New RIDS
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-semibold text-blue-900">About RIDS</h3>
          <p className="text-sm text-blue-800 mt-1">
            The Reservist Information Data Sheet (RIDS) is the official Philippine Army form containing
            comprehensive personnel records for each reservist. It includes 12 sections covering service history,
            training, awards, and biometric data.
          </p>
        </div>
      </div>

      {/* Filters */}
      <RIDSFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        companyFilter={companyFilter}
        onCompanyChange={setCompanyFilter}
        companies={assignedCompanies}
        showCompanyFilter={assignedCompanies.length > 1}
      />

      {/* Table */}
      <RIDSTable
        rids={rids}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSubmit={handleSubmit}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* View Modal */}
      <RIDSViewModal
        isOpen={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setViewingRIDSId(null);
        }}
        ridsId={viewingRIDSId}
      />

      {/* Create Modal */}
      <CreateRIDSModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          fetchRIDS(); // Refresh list
          setCreateModalOpen(false);
          setToast({
            message: 'RIDS created successfully!',
            type: 'success',
          });
        }}
        onToast={(message, type) => setToast({ message, type })}
      />

      {/* Edit Modal */}
      <EditRIDSModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setEditingRIDSId(null);
        }}
        ridsId={editingRIDSId}
        onSuccess={() => {
          fetchRIDS(); // Refresh list
        }}
        onToast={(message, type) => setToast({ message, type })}
      />

      {/* Delete Modal */}
      <DeleteRIDSModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedRIDS(null);
        }}
        onConfirm={handleDeleteConfirm}
        rids={selectedRIDS}
        loading={deletingRIDS}
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
